import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createStore } from '../server/reviews/store.mjs';
import { createStorage } from '../server/reviews/storage.mjs';
import { createReviewService, createHandler, CONSENT_VERSION, LIMITS } from '../server/reviews/service.mjs';

const db = new PGlite(), store = createStore(db), origin = 'https://shop.example', adminSecret = 'test-admin-secret-only-32-characters';
const config = { products: ['dispenser'], secret: 'test-rate-limit-secret', adminSecret };
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aE9sAAAAASUVORK5CYII=', 'base64');
let objects, commands, storage, service, handler;
const data = extra => ({ product: 'dispenser', author: 'Ana', title: 'Mi experiencia', body: 'Mi opinión sobre el dispensador.', rating: 4, consent: true, consentVersion: CONSENT_VERSION, website: '', files: [], ...extra });
const call = async (action, body, options = {}) => {
  const headers = { origin, ...options.headers }; if (body !== undefined) headers['content-type'] = 'application/json';
  const response = await handler(new Request(`https://api.example/api/reviews?action=${action}${options.query || ''}`, {
    method: body === undefined ? 'GET' : 'POST', headers, ...(body === undefined ? {} : { body: JSON.stringify(body) })
  }));
  return { status: response.status, headers: response.headers, body: await response.json() };
};
const admin = { headers: { authorization: `Bearer ${adminSecret}` } };
const finish = draft => call('finish', { id: draft.id, token: draft.token });
const approve = id => call('admin-moderate', { id, decision: 'approved' }, admin);
const listing = query => call('list', undefined, { query: `&product=dispenser${query || ''}` });
before(async () => { await db.exec(await readFile('server/reviews/schema.sql', 'utf8')); });
beforeEach(async () => {
  await db.exec('TRUNCATE milo_reviews,milo_review_limits,milo_review_audit RESTART IDENTITY CASCADE');
  objects = new Map(); commands = [];
  storage = createStorage({ REVIEWS_S3_BUCKET: 'test-bucket', REVIEWS_S3_REGION: 'eu-west-1', REVIEWS_S3_ACCESS_KEY: 'test', REVIEWS_S3_SECRET_KEY: 'test' }, {
    signPost: async (_client, policy) => ({ url: 'https://storage.example', fields: { key: policy.Key }, policy }),
    client: { send: async command => {
      commands.push(command); const input = command.input, object = objects.get(input.Key);
      switch (command.constructor.name) {
        case 'HeadObjectCommand': if (!object) throw new Error('Missing'); return { ContentLength: object.bytes.length, ContentType: object.type, ETag: 'etag' };
        case 'GetObjectCommand': return { Body: { transformToByteArray: async () => object.bytes }, ETag: 'etag' };
        case 'CopyObjectCommand': objects.set(input.Key, structuredClone(objects.get(input.CopySource.slice('test-bucket/'.length)))); return {};
        case 'DeleteObjectCommand': objects.delete(input.Key); return {};
        default: throw new Error('Unexpected command');
      }
    } }
  });
  // Signed read URLs are replaced only in this test transport; sealing uses real byte detection.
  storage.url = async file => `https://storage.example/private/${file.key}?expires=300`;
  service = createReviewService({ store, storage, config });
  handler = createHandler({ service, origins: [origin], getIp: request => request.headers.get('test-ip') || 'visitor' });
});
after(async () => db.close());

test('Photo + video submission persists, remains private, publishes after approval, and can be withdrawn', async () => {
  const video = Buffer.from('000000186674797069736f6d0000020069736f6d69736f32', 'hex');
  const started = await call('start', data({ files: [{ type: 'image/png', size: png.length }, { type: 'video/mp4', size: video.length }] }));
  assert.equal(started.status, 201); const draft = started.body;
  objects.set(draft.uploads[0].fields.key, { type: 'image/png', bytes: png }); objects.set(draft.uploads[1].fields.key, { type: 'video/mp4', bytes: video });
  assert.equal((await finish(draft)).status, 202);
  assert.equal((await store.get(draft.id)).status, 'pending'); assert.notEqual((await store.get(draft.id)).token_hash, draft.token);
  assert.equal((await listing()).body.total, 0);
  const queue = await call('admin-list'); assert.equal(queue.status, 401);
  assert.equal((await call('admin-list', undefined, admin)).body.reviews[0].media.length, 2);
  assert.equal((await approve(draft.id)).status, 200);
  const published = await listing(); assert.equal(published.body.total, 1); assert.equal(published.body.summary.average, 4);
  assert.equal(published.body.reviews[0].media.length, 2);
  for (const key of ['token_hash','token','uploads','status','moderation_reason']) assert.equal(key in published.body.reviews[0], false);
  assert.equal((await finish(draft)).status, 202); assert.equal((await listing()).body.total, 1);
  assert.equal((await call('admin-moderate', { id: draft.id, decision: 'rejected', reason: 'Datos personales en la foto.' }, admin)).status, 200);
  assert.equal((await listing()).body.total, 0);
  assert.equal((await store.query('SELECT * FROM milo_review_audit')).rows.length, 2);
});

test('Actual bytes, exact size and MIME are checked; invalid media never receives success or public access', async () => {
  const bytes = Buffer.from('<script>alert(1)</script>');
  const draft = (await call('start', data({ files: [{ type: 'image/png', size: bytes.length }] }))).body;
  objects.set(draft.uploads[0].fields.key, { type: 'image/png', bytes });
  assert.equal((await finish(draft)).status, 422); assert.equal((await store.get(draft.id)).status, 'draft');
  assert.equal(commands.some(c => c.constructor.name === 'CopyObjectCommand'), false);
  assert.equal((await listing()).body.total, 0);
  objects.set(draft.uploads[0].fields.key, { type: 'image/png', bytes: png });
  assert.equal((await finish(draft)).status, 422);
});

test('Upload policy bounds file size, MIME and expiry; final copy is pinned to the validated object', async () => {
  const draft = (await call('start', data({ files: [{ type: 'image/png', size: png.length }] }))).body;
  assert.equal(draft.uploads[0].policy.Expires, 60);
  assert.deepEqual(draft.uploads[0].policy.Conditions[0], ['content-length-range', png.length, png.length]);
  objects.set(draft.uploads[0].fields.key, { type: 'image/png', bytes: png }); await finish(draft);
  const copy = commands.find(command => command.constructor.name === 'CopyObjectCommand').input;
  assert.equal(copy.CopySourceIfMatch, 'etag'); assert.ok(copy.Key.startsWith(`reviews/${draft.id}/`)); assert.ok(copy.Key.endsWith('.png'));
  const oldKey = draft.uploads[0].fields.key; objects.set(oldKey, { type: 'image/png', bytes: Buffer.from('invalid replacement') });
  assert.deepEqual(Buffer.from(objects.get(copy.Key).bytes), png);
});

test('Ratings, consent, products, honeypot and media limits are enforced on the server', async () => {
  for (const invalid of [{ rating: 0 }, { rating: 6 }, { rating: 3.2 }, { consent: false }, { consentVersion: 'old' },
    { author: 'A' }, { body: 'short' }, { product: 'wrong' }, { website: 'spam' }, { files: [{ type: 'image/svg+xml', size: 1 }] },
    { files: [{ type: 'image/png', size: LIMITS.image + 1 }] }, { files: Array(5).fill({ type: 'image/png', size: 2 }) },
    { files: Array(2).fill({ type: 'video/mp4', size: 2 }) }]) assert.equal((await call('start', data(invalid))).status, 400);
  assert.equal((await store.query('SELECT * FROM milo_reviews')).rows.length, 0);
});

test('Tokens isolate uploads; finish retries are idempotent; drafts cannot be moderated', async () => {
  const draft = (await call('start', data())).body;
  assert.equal((await call('finish', { id: draft.id, token: 'wrong' })).status, 403);
  assert.equal((await call('tickets', { id: draft.id, token: 'wrong' })).status, 403);
  assert.equal((await approve(draft.id)).status, 409);
  assert.equal((await finish(draft)).status, 202); assert.equal((await finish(draft)).status, 202);
  assert.equal((await store.query('SELECT * FROM milo_reviews')).rows.length, 1);
});

test('Persistent quota survives a new service instance; malicious origins and huge JSON are rejected', async () => {
  for (let i = 0; i < 3; i++) assert.equal((await call('start', data())).status, 201);
  service = createReviewService({ store, storage, config }); handler = createHandler({ service, origins: [origin], getIp: () => 'visitor' });
  assert.equal((await call('start', data())).status, 429);
  assert.equal((await call('start', data(), { headers: { origin: 'https://evil.example' } })).status, 403);
  assert.equal((await call('start', { padding: 'a'.repeat(17000) })).status, 413);
  assert.equal((await call('finish', null)).status, 400);
});

test('Lists, sorting and summary show approved reviews only, including critical reviews', async () => {
  for (let i = 1; i <= 14; i++) {
    const draft = (await call('start', data({ rating: i % 5 + 1 }), { headers: { 'test-ip': String(i) } })).body;
    await finish(draft); if (i < 14) await approve(draft.id);
  }
  const first = await listing('&sort=lowest'); assert.equal(first.body.reviews.length, 12); assert.equal(first.body.hasMore, true);
  assert.equal(first.body.reviews[0].rating, 1); assert.equal(first.body.summary.count, 13);
  const second = await listing('&page=2'); assert.equal(second.body.reviews.length, 1); assert.equal(second.body.hasMore, false);
  assert.equal((await listing('&rating=1')).body.total, 2); assert.equal((await listing('&media=true')).body.total, 0);
  assert.equal((await listing('&sort=highest')).body.reviews[0].rating, 5);
});

test('Server fails closed without configuration and does not expose database errors', async () => {
  const missing = createHandler({ service: null, origins: [origin] });
  assert.equal((await missing(new Request('https://api.example/api/reviews?action=config'))).status, 503);
  const broken = createHandler({ service: { start: () => { throw new Error('postgres secret password'); } }, origins: [origin] });
  const response = await broken(new Request('https://api.example/api/reviews?action=start', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{}' }));
  assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /postgres|password/);
});

test('Compatible S3 PUT tickets cryptographically bind the exact size and MIME without automatic checksum fields', async () => {
  const real = createStorage({ REVIEWS_S3_BUCKET: 'reviews', REVIEWS_S3_REGION: 'eu-west-1',
    REVIEWS_S3_ENDPOINT: 'https://storage.example.test/storage/v1/s3', REVIEWS_S3_UPLOAD_METHOD: 'put',
    REVIEWS_S3_ACCESS_KEY: 'test-access-only', REVIEWS_S3_SECRET_KEY: 'test-secret-only' });
  const upload = { key: 'staging/test/file', type: 'image/png', size: 123 };
  const first = await real.ticket(upload), url = new URL(first.url);
  assert.equal(first.method, 'PUT'); assert.equal(url.searchParams.get('X-Amz-Expires'), '60');
  assert.equal(url.searchParams.get('X-Amz-SignedHeaders'), 'content-length;content-type;host');
  assert.deepEqual(first.headers, { 'Content-Type': 'image/png' });
  assert.equal(url.searchParams.has('x-amz-checksum-crc32'), false);
  assert.equal(url.searchParams.has('x-amz-sdk-checksum-algorithm'), false);
  const larger = new URL((await real.ticket({ ...upload, size: 124 })).url);
  const otherType = new URL((await real.ticket({ ...upload, type: 'image/jpeg' })).url);
  assert.notEqual(url.searchParams.get('X-Amz-Signature'), larger.searchParams.get('X-Amz-Signature'));
  assert.notEqual(url.searchParams.get('X-Amz-Signature'), otherType.searchParams.get('X-Amz-Signature'));
  assert.throws(() => createStorage({ REVIEWS_S3_UPLOAD_METHOD: 'unexpected' }), /INVALID_UPLOAD_METHOD/);
});
