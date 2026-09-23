// Public, static design preview. The Shopify theme remains the source of truth.
import { rm, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
await import('./preview.mjs');
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('.preview/assets', 'dist/assets', { recursive: true });
const previewTitles = {
  index: 'Milo & Co · Preview',
  cart: 'Carrito · Milo & Co · Preview',
  '404': '404 · Milo & Co · Preview',
  'page.productos': 'Dispensador · Milo & Co · Preview',
  'page.dispensador': 'Dispensador 3 en 1 · Milo & Co · Preview',
  'page.paseos': 'Paseos y escapadas · Milo & Co · Preview',
  'page.nosotros': 'Nuestra idea · Milo & Co · Preview',
  'page.contact': 'Contacto · Milo & Co · Preview',
  page: 'Información · Milo & Co · Preview'
};
for (const name of ['index', 'cart', '404', 'page.productos', 'page.dispensador', 'page.paseos', 'page.nosotros', 'page.contact', 'page']) {
  let html = await readFile(`.preview/${name}.html`, 'utf8');
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  html = html.replace(/<meta name="robots"[^>]*>/g, '');
  html = html.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${previewTitles[name]}</title>`);
  html = html.replace(/<meta property="og:[^>]*>\s*/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>\s*/g, '');
  html = html.replaceAll('href="index.html"', 'href="/"');
  html = html.replaceAll('href="index.html#', 'href="/#');
  html = html.replaceAll('href="cart.html"', 'href="/cart.html"');
  html = html.replaceAll('href="assets/', 'href="/assets/').replaceAll('src="assets/', 'src="/assets/');
  html = html.replace('<link rel="canonical" href="">', '');
  if (/{[{%]/.test(html)) throw new Error(`Unrendered Liquid in ${name}`);
  const output = name === 'page' ? 'pages/informacion' : name.startsWith('page.') ? `pages/${name.slice(5)}` : name;
  if(name.startsWith('page.')) await mkdir('dist/pages',{recursive:true});
  await writeFile(`dist/${output}.html`, html);
}
console.log('Static Milo & Co preview built in dist/');
