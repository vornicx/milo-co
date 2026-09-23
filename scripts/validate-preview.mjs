import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const pages = [
  'index.html',
  'cart.html',
  '404.html',
  'pages/productos.html',
  'pages/dispensador.html',
  'pages/paseos.html',
  'pages/nosotros.html',
  'pages/contact.html',
  'pages/informacion.html'
];

const fail = (message) => {
  console.error(`ARCHIC GATE: ${message}`);
  process.exitCode = 1;
};

for (const file of pages) {
  const path = join('dist', file);
  const html = await readFile(path, 'utf8');

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) fail(`${file}: expected exactly one H1, found ${h1Count}`);

  if (/data:image\//i.test(html)) fail(`${file}: inline base64 image found`);
  if (/{[{%]/.test(html)) fail(`${file}: unrendered Liquid found`);
  if (!/<html\s[^>]*lang="es"/i.test(html)) fail(`${file}: missing Spanish lang attribute`);
  if (!/<meta\s[^>]*name="viewport"/i.test(html)) fail(`${file}: missing viewport meta`);
  if (!/href="#MainContent"/.test(html) || !/id="MainContent"/.test(html)) fail(`${file}: skip-link contract broken`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length) fail(`${file}: duplicate id(s): ${[...new Set(duplicates)].join(', ')}`);
  if (/<(?:button|input)\b[^>]*(?:data-add|name="checkout"|action="\/cart\/add")/i.test(html)) fail(`${file}: purchase control appears while sales are disabled`);
  if (/<a\b[^>]*href="\/(?:cart|checkout)(?:[\/"?#])/i.test(html)) fail(`${file}: checkout/cart navigation appears while sales are disabled`);
  if (file === 'index.html' || file === 'pages/dispensador.html') {
    if (!html.includes('name="contact[email]"') || !html.includes('name="contact[tags]"')) fail(`${file}: pre-launch form or preference missing`);
    if (!html.includes('type="checkbox" required') || !html.includes('/policies/privacy-policy')) fail(`${file}: privacy consent or policy link missing`);
  }

  if (!/<meta\s[^>]*name="robots"\s+content="noindex,nofollow"/i.test(html)) fail(`${file}: static preview must stay noindex`);
  if (/<script type="application\/ld\+json">/i.test(html)) fail(`${file}: static preview should not simulate live structured data`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt="[^"]*"/i.test(match[0])) fail(`${file}: image without alt attribute`);
  }

  const bytes = Buffer.byteLength(html);
  if (bytes > 260_000) fail(`${file}: HTML is ${Math.round(bytes / 1024)} KiB; budget is 254 KiB`);
}

const css = await readFile('dist/assets/milo-system.css', 'utf8');
if (!css.includes(':focus-visible')) fail('milo-system.css: missing focus-visible treatment');
if (!css.includes('prefers-reduced-motion')) fail('milo-system.css: missing reduced-motion treatment');
if (Buffer.byteLength(css) > 90_000) fail('milo-system.css exceeds 90 KiB budget');

const assets = await readdir('dist/assets');
for (const name of ['milo-food-original.jpg','milo-waste-original.jpg','milo-parts-original.jpg']) {
  if (!assets.includes(name)) fail(`missing product asset: ${name}`);
  else {
    const size = (await stat(join('dist/assets', name))).size;
    if (size > 800_000) fail(`${name}: image exceeds 800 KiB budget`);
  }
}
for (const name of ['paseo-colores-thumb.webp','paseo-pausa-thumb.webp','dispensador-detalle-thumb.webp']) {
  if (!assets.includes(name)) fail(`missing gallery thumbnail: ${name}`);
  else if ((await stat(join('dist/assets',name))).size > 30_000) fail(`${name}: thumbnail exceeds 30 KiB budget`);
}

if (!process.exitCode) console.log('ARCHIC GATE: preview structure, accessibility and performance budgets passed.');
