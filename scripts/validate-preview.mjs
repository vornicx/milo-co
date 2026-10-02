import { readFile, stat } from 'node:fs/promises';

const routes = ['index.html', 'pages/dispensador/index.html', 'pages/productos/index.html', 'pages/nosotros/index.html', 'pages/paseos/index.html', 'pages/contact/index.html', 'cart/index.html', '404.html'];
for (const route of routes) {
  const html = await readFile(`dist/${route}`, 'utf8');
  if (!html.includes('<main') || !html.includes('pupit &amp; co')) throw new Error(`${route}: missing page content`);
  if (/{[{%]/.test(html)) throw new Error(`${route}: unrendered Liquid`);
  if (html.includes('translation missing:')) throw new Error(`${route}: missing translation`);
  if (!html.includes('noindex,nofollow')) throw new Error(`${route}: preview must not be indexed`);
  if ((html.match(/<h1\b/g) ?? []).length !== 1) throw new Error(`${route}: exactly one H1 required`);
  if ((html.match(/id="espera"/g) ?? []).length > 1) throw new Error(`${route}: duplicate signup anchor`);
  if (/name="checkout"|data-add|action="\/cart\/add"/.test(html)) throw new Error(`${route}: prelaunch contains purchase controls`);
  for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) await stat(`dist${match[1]}`);
}
console.log(`Preview structural checks passed for ${routes.length} routes.`);
