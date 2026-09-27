import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Liquid } from 'liquidjs';

const engine = new Liquid();
const translations = JSON.parse(await readFile('locales/es.default.json', 'utf8'));
engine.registerFilter('t', key => key.split('.').reduce((value, part) => value?.[part], translations));
const source = (await readFile('sections/product-reviews.liquid', 'utf8'))
  .replace(/{% schema %}[\s\S]*?{% endschema %}/g, '')
  .replace(/{% stylesheet %}[\s\S]*?{% endstylesheet %}/g, '');
const product = { id: 123, title: 'Dispensador azul', metafields: { judgeme: {} } };
const base = { section: { id: 'reviews', settings: {}, blocks: [] }, settings: { sales_enabled: false }, shop: {} };

test('An unconnected review section never pretends to collect or publish reviews', async () => {
  const html = await engine.parseAndRender(source, { ...base, product });
  assert.match(html, /Opiniones de clientes/);
  assert.match(html, /Estamos preparando el lanzamiento/);
  assert.doesNotMatch(html, /<form|<input|jdgm-review-widget|Compra verificada|aggregateRating|product-reviews__setup/);
});

test('Reviews always use the current product, even when another product is selected in the theme', async () => {
  const html = await engine.parseAndRender(source, {
    ...base,
    product,
    settings: { featured_product: { id: 456, title: 'Otro producto' } },
    section: { ...base.section, settings: { judgeme_enabled: true, review_product: { id: 789 } } }
  });
  assert.match(html, /data-product-id="123"/);
  assert.doesNotMatch(html, /data-product-id="456"|data-product-id="789"|product-reviews__empty/);
  assert.equal((html.match(/id="judgeme_product_reviews"/g) || []).length, 1);
});

test('Landing reviews use the selected product and safely handle missing or draft products', async () => {
  const section = { ...base.section, settings: { judgeme_enabled: true, review_product: product } };
  const selected = await engine.parseAndRender(source, { ...base, section });
  assert.match(selected, /data-product-id="123"/);
  const featured = await engine.parseAndRender(source, {
    ...base, settings: { featured_product: product }, section: { ...section, settings: { judgeme_enabled: true } }
  });
  assert.match(featured, /data-product-id="123"/);
  const missing = await engine.parseAndRender(source, { ...base, section: { ...section, settings: { judgeme_enabled: true } } });
  assert.doesNotMatch(missing, /jdgm-review-widget|data-product-id/);
  assert.match(missing, /product-reviews__empty/);
});

test('Product titles and provider widget JSON cannot break out of HTML or script tags', async () => {
  const html = await engine.parseAndRender(source, {
    ...base,
    product: {
      ...product,
      title: '\"><img src=x onerror=alert(1)>',
      metafields: { judgeme: { review_widget_data: JSON.stringify({ text: '</script><script>alert(1)</script>' }) } }
    },
    section: { ...base.section, settings: { judgeme_enabled: true } }
  });
  assert.match(html, /data-product-title="(?:&quot;|&#34;)&gt;&lt;img/);
  assert.doesNotMatch(html, /<img src=x|<script>alert/);
  assert.equal((html.match(/<\/script>/g) || []).length, 1);
});
