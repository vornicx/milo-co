import { readFile, writeFile, mkdir, cp, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { createPreviewEngine, prepareLiquid } from './preview-engine.mjs';

const root = process.cwd();
await rm(join(root, 'dist'), { recursive: true, force: true });
await rm(join(root, '.preview'), { recursive: true, force: true });
await mkdir(join(root, '.preview/snippets'), { recursive: true });
await mkdir(join(root, 'dist'), { recursive: true });
for (const file of await readdir(join(root, 'snippets'))) {
  if (!file.endsWith('.liquid')) continue;
  await writeFile(join(root, '.preview/snippets', file), prepareLiquid(await readFile(join(root, 'snippets', file), 'utf8')));
}
await cp(join(root, 'assets'), join(root, 'dist/assets'), { recursive: true });
const engine = createPreviewEngine(root, join(root, '.preview/snippets'));
const settings = JSON.parse(await readFile(join(root, 'config/settings_data.json'), 'utf8')).current;
const pages = Object.fromEntries(['dispensador', 'productos', 'nosotros', 'paseos', 'contact'].map((handle) => [handle, { url: `/pages/${handle}`, title: handle, handle }]));
const base = {
  settings,
  routes: { root_url: '/', cart_url: '/cart', all_products_collection_url: '/pages/productos' },
  pages,
  request: { locale: { iso_code: 'es' }, path: '/', page_type: 'index' },
  localization: { language: { iso_code: 'es' } },
  shop: { name: 'Pupit & Co', privacy_policy: { body: 'Configured', url: '/policies/privacy-policy' } },
  cart: { item_count: 0, items: [], total_price: 0 },
  form: {},
};
function resourceSettings(schema, values) {
  const result = {};
  for (const item of schema ?? []) {
    result[item.id] = values?.[item.id] ?? item.default ?? '';
    if (item.type === 'page') result[item.id] = pages[result[item.id]] ?? '';
    if (item.type === 'product') result[item.id] = '';
  }
  return result;
}
async function section(id, spec) {
  const source = await readFile(join(root, 'sections', `${spec.type}.liquid`), 'utf8');
  const schemaMatch = source.match(/{% schema %}([\s\S]*?){% endschema %}/);
  const schema = schemaMatch ? JSON.parse(schemaMatch[1]) : {};
  const blocks = (spec.block_order ?? []).map((blockId) => {
    const block = spec.blocks[blockId];
    const blockSchema = schema.blocks?.find((item) => item.type === block.type);
    return { id: blockId, type: block.type, settings: resourceSettings(blockSchema?.settings, block.settings), shopify_attributes: '' };
  });
  const context = { ...base, section: { id, settings: resourceSettings(schema.settings, spec.settings), blocks } };
  return `<div class="shopify-section">${await engine.parseAndRender(prepareLiquid(source), context)}</div>`;
}
async function group(name) {
  const spec = JSON.parse(await readFile(join(root, 'sections', `${name}.json`), 'utf8'));
  let html = '';
  for (const id of spec.order) html += await section(id, spec.sections[id]);
  return html;
}
const previewPages = [
  ['index', '/', 'Pupit & Co'],
  ['page.dispensador', '/pages/dispensador', 'Dispensador 3 en 1'],
  ['page.productos', '/pages/productos', 'Productos'],
  ['page.nosotros', '/pages/nosotros', 'Nuestra idea'],
  ['page.paseos', '/pages/paseos', 'Paseos'],
  ['page.contact', '/pages/contact', 'Contacto'],
  ['cart', '/cart', 'Carrito'],
  ['404', '/404.html', 'Página no encontrada'],
];
for (const [name, route, title] of previewPages) {
  base.request.path = route;
  base.page = { handle: route.split('/').pop(), title, content: '' };
  const template = JSON.parse(await readFile(join(root, 'templates', `${name}.json`), 'utf8'));
  let content = '';
  for (const id of template.order) if (!template.sections[id].disabled) content += await section(id, template.sections[id]);
  const header = await group('header-group');
  const footer = await group('footer-group');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title} · Pupit v2 · Preview</title><link rel="icon" href="/assets/favicon.svg"><style>:root{--page-width:160rem;--font-body-scale:1;--font-heading-scale:1;--color-background:247,245,240;--color-foreground:24,24,24;--color-button:24,24,24;--color-button-text:255,255,255;--color-link:24,24,24;--color-shadow:24,24,24;--inputs-radius:0px;--inputs-border-width:1px;--inputs-border-opacity:1;--inputs-shadow-opacity:0;--buttons-radius:999px;--buttons-border-width:1px;--buttons-border-opacity:1;--buttons-shadow-opacity:0;--buttons-radius-outset:999px;--buttons-border-offset:0px;--text-boxes-border-width:0px;--text-boxes-border-opacity:0;--text-boxes-radius:0px;--text-boxes-shadow-opacity:0;--text-boxes-shadow-horizontal-offset:0px;--text-boxes-shadow-vertical-offset:0px;--text-boxes-shadow-blur-radius:0px;--media-radius:0px;--media-border-width:0px;--media-shadow-opacity:0;--duration-short:100ms;--duration-default:200ms;--gradient-background:#F7F5F0}</style><link rel="stylesheet" href="/assets/base.css"><link rel="stylesheet" href="/assets/pupit-v2.css"><script src="/assets/pupit-v2.js" defer></script></head><body data-pupit-sales="false"><a class="skip-to-content-link button visually-hidden" href="#MainContent">Saltar al contenido</a><div class="pupit-page">${header}<main id="MainContent">${content}</main>${footer}</div></body></html>`;
  const destination = route.endsWith('.html') ? join(root, 'dist', route.slice(1)) : join(root, 'dist', route.slice(1), 'index.html');
  await mkdir(join(destination, '..'), { recursive: true });
  await writeFile(destination, html);
}
console.log('Pupit v2 preview built from the theme Liquid sections.');
