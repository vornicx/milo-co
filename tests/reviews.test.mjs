import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Liquid } from 'liquidjs';
import { JSDOM } from 'jsdom';
import { LIMITS, CONSENT_VERSION } from '../server/reviews/service.mjs';
const raw = await readFile('sections/product-reviews.liquid', 'utf8');
const javascript = raw.match(/{% javascript %}([\s\S]*?){% endjavascript %}/)[1];
const source = raw.replace(/{% (schema|stylesheet|javascript) %}[\s\S]*?{% end\1 %}/g, '');
const translations = JSON.parse(await readFile('locales/es.default.json', 'utf8'));
const engine = new Liquid(); engine.registerFilter('json', JSON.stringify);
engine.registerFilter('t', key => key.split('.').reduce((value, part) => value?.[part], translations));
const base = { section: { id: 'reviews', settings: { product_key: 'dispenser', api_url: '' } }, settings: {}, shop: {} };
const empty = { reviews: [], total: 0, hasMore: false, summary: { count: 0, average: null, distribution: {1:0,2:0,3:0,4:0,5:0} } };
const next = () => new Promise(resolve => setTimeout(resolve, 5));
async function dom(fetch, api = 'https://api.example/api/reviews') {
  const html = await engine.parseAndRender(source, { ...base, section: { ...base.section, settings: { ...base.section.settings, api_url: api } } });
  const page = new JSDOM(html, { runScripts: 'outside-only', url: 'https://shop.example' }), { window } = page;
  window.fetch = async (url, options) => {
    const action = new URL(url).searchParams.get('action');
    if (action === 'config') return { ok: true, json: async () => ({ limits: LIMITS, consentVersion: CONSENT_VERSION }) };
    if (action === 'list') return { ok: true, json: async () => empty };
    return fetch(url, options);
  };
  window.URL.createObjectURL = () => 'blob:https://shop.example/example'; window.URL.revokeObjectURL = () => {};
  window.matchMedia = () => ({ matches: true }); window.HTMLElement.prototype.scrollIntoView = () => {};
  window.eval(javascript); await next(); return page;
}
function complete(widget) {
  widget.find('[name=author]').value = 'Ana'; widget.find('[name=title]').value = 'Mi paseo';
  widget.find('[name=body]').value = 'Mi experiencia con el dispensador.';
  widget.find('[name=rating][value="4"]').checked = true; widget.find('[name=consent]').checked = true;
}

test('Unconnected section shows honest status, has no fabricated ratings and cannot send', async () => {
  const page = await dom(() => { throw new Error('Must not call'); }, '');
  try {
    const widget = page.window.document.querySelector('milo-reviews');
    assert.equal(widget.find('[data-submit]').disabled, true); assert.equal(widget.find('[data-overview]').hidden, true);
    assert.match(widget.find('[data-status]').textContent, /Todavía no/);
    widget.find('[data-open]').click(); assert.equal(widget.find('[data-panel]').hidden, false);
    assert.equal(widget.find('[data-open]').getAttribute('aria-expanded'), 'true');
    assert.doesNotMatch(widget.innerHTML, /jdgm|aggregateRating|Compra verificada/);
  } finally { page.window.close(); }
});

test('Product selection precedence and HTML escaping preserve the current product safely', async () => {
  const current = await engine.parseAndRender(source, { ...base, product: { handle: 'current' }, settings: { featured_product: { handle: 'other' } } });
  assert.match(current, /data-product="current"/);
  const landing = await engine.parseAndRender(source, { ...base, section: { ...base.section, settings: { review_product: { handle: 'selected' } } } });
  assert.match(landing, /data-product="selected"/);
  const hostile = await engine.parseAndRender(source, { ...base, product: { handle: '\"><img src=x onerror=alert(1)>' } });
  assert.doesNotMatch(hostile, /<img src=x/); assert.match(hostile, /&lt;img/);
});

test('Form freezes files during submission, retries a failed upload and confirms only after persistence', async () => {
  const calls = []; let failUpload = true, finishResolved = false;
  const page = await dom(async (url, options) => {
    const action = new URL(url).searchParams.get('action'); calls.push(action || 'upload');
    if (action === 'start') return { ok: true, json: async () => ({ id: 'ddc647da-76a6-4271-ab2f-9117b52dbd20', token: 'private-token', uploads: [] }) };
    if (action === 'tickets') return { ok: true, json: async () => ({ uploads: [{ url: 'https://storage.example/', fields: { key: 'random-key' } }] }) };
    if (action === 'finish') { finishResolved = true; return { ok: true, json: async () => ({ received: true, id: 'ddc647da-76a6-4271-ab2f-9117b52dbd20' }) }; }
    if (failUpload) { failUpload = false; throw new Error('Failed to fetch'); }
    return { ok: true };
  });
  try {
    const widget = page.window.document.querySelector('milo-reviews'); complete(widget);
    widget.selectFiles([new page.window.File(['image bytes'], 'photo.png', { type: 'image/png' })]);
    const first = widget.submit({ preventDefault() {} }); assert.equal(widget.find('[data-fields]').disabled, true); await first;
    assert.equal(finishResolved, false); assert.equal(widget.files.length, 1); assert.equal(widget.find('[data-reset]').hidden, false);
    assert.match(widget.find('[data-form-status]').textContent, /conexión|enviado|conectar/i);
    await widget.submit({ preventDefault() {} }); assert.equal(finishResolved, true);
    assert.equal(calls.filter(x => x === 'start').length, 1); assert.equal(widget.files.length, 0);
    assert.match(widget.find('[data-form-status]').textContent, /revisión/i); assert.equal(widget.find('[data-fields]').disabled, false);
  } finally { page.window.close(); }
});

test('Failed start keeps editable fields and never displays a successful receipt', async () => {
  const page = await dom(async () => ({ ok: false, json: async () => ({ error: 'Error de prueba' }) }));
  try {
    const widget = page.window.document.querySelector('milo-reviews'); complete(widget); await widget.submit({ preventDefault() {} });
    assert.equal(widget.draft, null); assert.equal(widget.find('[data-fields]').disabled, false);
    assert.equal(widget.find('[name=body]').value, 'Mi experiencia con el dispensador.');
    assert.equal(widget.find('[data-form-status]').textContent, 'Error de prueba');
  } finally { page.window.close(); }
});

test('Customer content is rendered as text and executable media URLs are ignored', async () => {
  const page = await dom(async () => { throw new Error('Unexpected'); });
  try {
    const widget = page.window.document.querySelector('milo-reviews');
    const item = widget.renderReview({ author: '<img src=x onerror=alert(1)>', rating: 1, title: '<script>alert(1)</script>', body: '<svg onload=alert(1)>', date: '2026-09-27T10:00:00Z', media: [{ type: 'image/png', url: 'javascript:alert(1)' }] });
    assert.equal(item.querySelector('img,script,svg'), null); assert.match(item.textContent, /<svg onload/);
  } finally { page.window.close(); }
});

test('Moderator panel requires a secret and clears rendered private data on logout', async () => {
  const page = new JSDOM(await readFile('admin/reviews.html', 'utf8'), { runScripts: 'outside-only', url: 'https://admin.example' });
  try {
    const { window } = page; let authorization;
    window.fetch = async (_url, options) => { authorization = options.headers.Authorization; return { ok: true, json: async () => ({ reviews: [], total: 0, hasMore: false }) }; };
    window.eval(await readFile('admin/reviews-admin.js', 'utf8'));
    const secret = window.document.querySelector('#secret'); secret.value = 'test-secret-only-thirty-two-characters';
    window.document.querySelector('#login-form').dispatchEvent(new window.Event('submit', { cancelable: true })); await next();
    assert.match(authorization, /^Bearer test-secret/); assert.equal(secret.value, '');
    assert.equal(window.localStorage.length, 0); assert.equal(window.sessionStorage.length, 0);
    assert.equal(window.document.querySelector('#workspace').hidden, false);
    window.document.querySelector('#logout').click(); assert.equal(window.document.querySelector('#workspace').hidden, true);
    assert.equal(window.document.querySelector('#list').children.length, 0);
  } finally { page.window.close(); }
});

test('Compatible S3 upload sends the File body with its MIME and no scripted Content-Length', async () => {
  let upload;
  const page = await dom(async (url, options) => {
    const action = new URL(url).searchParams.get('action');
    if (action === 'start') return { ok: true, json: async () => ({ id: 'ddc647da-76a6-4271-ab2f-9117b52dbd20', token: 'test' }) };
    if (action === 'tickets') return { ok: true, json: async () => ({ uploads: [{ method: 'PUT', url: 'https://storage.example/upload' }] }) };
    if (action === 'finish') return { ok: true, json: async () => ({ received: true, id: 'ddc647da-76a6-4271-ab2f-9117b52dbd20' }) };
    upload = options; return { ok: true };
  });
  try {
    const widget = page.window.document.querySelector('milo-reviews'); complete(widget);
    const file = new page.window.File(['video bytes'], 'paseo.mp4', { type: 'video/mp4' });
    widget.selectFiles([file]); await widget.submit({ preventDefault() {} });
    assert.equal(upload.method, 'PUT'); assert.equal(upload.body, file);
    assert.equal(upload.headers['Content-Type'], 'video/mp4'); assert.equal(upload.headers['Content-Length'], undefined);
    assert.match(widget.find('[data-form-status]').textContent, /revisión/i);
  } finally { page.window.close(); }
});
