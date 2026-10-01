import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPreviewEngine, prepareLiquid } from '../scripts/preview-engine.mjs';

const engine = createPreviewEngine(process.cwd(), '.preview/snippets');
const render = async (path, context) => engine.parseAndRender(prepareLiquid(await readFile(path, 'utf8')), context);
const privacy_policy = { body: 'Published policy', url: '/policies/privacy-policy' };

test('Signup requires an email and consent, and sends one colour preference to Shopify', async () => {
  const html = await render('snippets/pupit-signup.liquid', { id: 'test', privacy_policy, form: {} });
  assert.match(html, /type="email"[^>]+name="contact\[email\]"[^>]+required/);
  assert.match(html, /type="checkbox" required/);
  assert.equal((html.match(/name="contact\[tags\]"/g) ?? []).length, 3);
  assert.match(html, /preferencia-indiferente[^>]+checked/);
  assert.match(html, /name="form_type" value="customer"/);
  assert.match(html, /href="\/policies\/privacy-policy"/);
});

test('Signup handles server success, rejection and an unavailable policy without false confirmation', async () => {
  const success = await render('snippets/pupit-signup.liquid', { id: 'test', privacy_policy, form: { 'posted_successfully?': true } });
  assert.match(success, /Ya estás en la lista/);
  assert.doesNotMatch(success, /name="contact\[email\]"/);
  const failure = await render('snippets/pupit-signup.liquid', { id: 'test', privacy_policy, form: { errors: { email: 'invalid' } } });
  assert.match(failure, /role="alert"/);
  assert.match(failure, /aria-invalid="true"/);
  assert.doesNotMatch(failure, /Ya estás en la lista/);
  const unavailable = await render('snippets/pupit-signup.liquid', { id: 'test', privacy_policy: {}, form: {} });
  assert.doesNotMatch(unavailable, /<form|contact\[email\]/);
});

test('Returned email and contact text cannot inject HTML or attributes', async () => {
  const email = '\" autofocus onfocus=alert(1) x=\"';
  const body = '</textarea><script>alert(1)</script>';
  const signup = await render('snippets/pupit-signup.liquid', { id: 'test', privacy_policy, form: { email } });
  assert.ok(!signup.includes(`value="${email}"`));
  assert.match(signup, /(?:&quot;|&#34;) autofocus/);
  const contact = await render('sections/contact-form.liquid', { section: { id: 'test', settings: {} }, form: { email, name: email, body }, shop: { email: 'PRIVATE@example.invalid', address: 'PRIVATE_ADDRESS' } });
  assert.doesNotMatch(contact, /<script>alert|PRIVATE@example|PRIVATE_ADDRESS/);
  assert.match(contact, /&lt;\/textarea&gt;/);
});

test('Prelaunch suppresses purchase forms even for an available product', async () => {
  const product = { id: 1, title: 'Test', selected_or_first_available_variant: { id: 2, available: true, inventory_management: 'shopify', inventory_policy: 'deny', inventory_quantity: 10, quantity_rule: { min: 1 } } };
  const html = await render('snippets/buy-buttons.liquid', { settings: { sales_enabled: false }, product, block: { settings: {} }, section_id: 'test' });
  assert.doesNotMatch(html, /name="add"|form_type" value="product"|payment_button/);
  assert.match(html, /href="#espera"/);
  const enabled = await render('snippets/buy-buttons.liquid', { settings: { sales_enabled: true }, product, block: { settings: {} }, section_id: 'test' });
  assert.match(enabled, /name="add"/);
  assert.match(enabled, /form_type" value="product"/);
});

test('Footer uses configured routes and only published policies', async () => {
  const html = await render('sections/pupit-footer.liquid', { section: { settings: { contact_page: { url: '/pages/help' } } }, routes: { root_url: '/' }, pages: { contact: { url: '/pages/contact' } }, shop: { privacy_policy, email: 'PRIVATE@example.invalid', terms_of_service: {}, refund_policy: {} } });
  assert.match(html, /href="\/pages\/help"/);
  assert.match(html, /href="\/policies\/privacy-policy"/);
  assert.doesNotMatch(html, /PRIVATE@example|terms-of-service|refund-policy/);
});
