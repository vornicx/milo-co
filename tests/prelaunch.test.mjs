import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Liquid } from 'liquidjs';

const read = path => readFile(path, 'utf8');
const engine = new Liquid({root:'snippets',extname:'.liquid'});
engine.registerTag('form', {parse(){},render(){return '<form method="post" action="/contact">';}});
engine.registerTag('endform', {render(){return '</form>';}});

test('Waitlist renders consent and exactly one colour preference per signup', async () => {
  const source = (await read('snippets/prelaunch-form.liquid')).replace(/{% doc %}[\s\S]*?{% enddoc %}/g,'');
  const html = await engine.parseAndRender(source, {id:'test',source:'home_final',privacy_policy:{body:'Policy published',url:'/policies/privacy-policy'}});
  assert.match(html, /name="contact\[email\]"[^>]*required/);
  assert.equal((html.match(/name="contact\[tags\]"/g) || []).length, 3);
  assert.match(html, /preferencia-indiferente" checked/);
  assert.match(html, /type="checkbox" required/);
  assert.match(html, /href="\/policies\/privacy-policy"/);
  assert.match(html, /method="post" action="\/contact"/);
});

test('Waitlist handles successful signup, server errors, and missing privacy policy', async () => {
  const source = (await read('snippets/prelaunch-form.liquid')).replace(/{% doc %}[\s\S]*?{% enddoc %}/g,'');
  const privacy_policy = {body:'Policy published',url:'/policies/privacy-policy'};
  const success = await engine.parseAndRender(source, {id:'test',source:'product_top',privacy_policy,form:{'posted_successfully?':true}});
  assert.match(success, /data-milo-success/);
  assert.doesNotMatch(success, /name="contact\[email\]"/);
  const error = await engine.parseAndRender(source, {id:'test',privacy_policy,form:{errors:{email:'invalid'}}});
  assert.match(error, /role="alert"/);
  assert.match(error, /name="contact\[email\]"/);
  const noPolicy = await engine.parseAndRender(source, {id:'test',privacy_policy:{}});
  assert.doesNotMatch(noPolicy, /name="contact\[email\]"/);
});

test('All pre-launch templates keep checkout and cart controls absent', async () => {
  for (const name of ['index','page.dispensador','product.dispensador','product']) {
    const template = JSON.parse(await read(`templates/${name}.json`));
    const types = template.order.filter(id => !template.sections[id].disabled).map(id => template.sections[id].type);
    assert.ok(types.includes('prelaunch-waitlist'), `${name}: missing final conversion`);
  }
  const settings = JSON.parse(await read('config/settings_data.json'));
  assert.equal(settings.current.sales_enabled, false);
  const productForm = await read('snippets/product-form.liquid');
  assert.ok(productForm.indexOf('{% if settings.sales_enabled %}') < productForm.indexOf("{% form 'product'"));
  const cart = await read('sections/main-cart.liquid');
  assert.ok(cart.indexOf('{% else %}') < cart.indexOf('name="checkout"'));
  const preview = await read('dist/pages/dispensador.html');
  assert.doesNotMatch(preview, /name="checkout"|data-add|\/cart\/add/);
  assert.match(preview, /name="contact\[email\]"/);
});

test('Theme WebP assets use their real URL rather than unsupported resized placeholders', async () => {
  const image = await read('snippets/theme-image.liquid');
  assert.match(image, /file_extension == 'webp'.*file_extension == 'avif'/);
  assert.match(image, /<img src="{{ filename \| asset_url }}"/);
  const gallery = await read('snippets/dispenser-gallery.liquid');
  for (const filename of ['paseo-colores.webp','paseo-pausa.webp','dispensador-detalle.webp']) {
    const thumbnail = gallery.split('\n').find(line => line.includes(`data-photo="{{ '${filename}'`));
    const thumb = filename.replace('.webp','-thumb.webp');
    assert.ok(thumbnail?.includes(`src="{{ '${thumb}' | asset_url }}"`));
  }
});
