import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Liquid } from 'liquidjs';

const engine = new Liquid({ root: 'snippets', extname: '.liquid' });
engine.registerFilter('asset_url', value => `/assets/${value}`);
const section = async name => (await readFile(`sections/${name}.liquid`, 'utf8'))
  .replace(/{% schema %}[\s\S]*?{% endschema %}/g, '');

test('Imported product titles cannot create HTML elements', async () => {
  const title = '<img src=x onerror=alert(1)><script>alert(1)</script>';
  const html = await engine.parseAndRender(await section('product-index'), {
    section: { settings: { product: { title, url: '/products/example' } } },
    settings: { sales_enabled: false },
  });
  assert.ok(html.includes('Dispensador 3 en 1'));
  assert.ok(!html.includes(title));
  assert.ok(!html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!/<script\b/i.test(html));
});

test('Contact works without exposing the merchant email or address', async () => {
  engine.registerTag('form', {
    parse(tag) { this.contact = tag.args.includes("'contact'"); },
    render() { return this.contact ? '<form method="post" action="/contact">' : ''; },
  });
  engine.registerTag('endform', { render() { return '</form>'; } });
  const email = 'private-owner@example.invalid';
  const address = 'PRIVATE_TEST_ADDRESS';
  const message = '</textarea><script>alert(1)</script>';
  const html = await engine.parseAndRender(await section('contact'), {
    page: { title: 'Contacto', content: '' },
    shop: { email, address },
    form: { name: '\" autofocus onfocus=alert(1)', email: 'buyer@example.invalid', body: message },
  });
  assert.ok(html.includes('method="post" action="/contact"'));
  assert.ok(!html.includes(email));
  assert.ok(!html.includes(address));
  assert.ok(!html.includes(message));
  assert.ok(!/<script\b/i.test(html));
  assert.ok(html.includes('&lt;/textarea&gt;'));
});

test('Footer resolves both contact handles and respects the configured page', async () => {
  const raw = await section('footer');
  for (const [pages, configured, expected] of [
    [{ contact: { url: '/pages/contact' } }, null, '/pages/contact'],
    [{ contacto: { url: '/pages/contacto' } }, null, '/pages/contacto'],
    [{ contact: { url: '/pages/contact' } }, { url: '/pages/help' }, '/pages/help'],
  ]) {
    const html = await engine.parseAndRender(raw, {
      pages, section: { settings: { contact_page: configured } },
      settings: {}, shop: { policies: [] }, routes: { root_url: '/' },
    });
    assert.ok(html.includes(`href="${expected}">Contacto</a>`));
  }
});
