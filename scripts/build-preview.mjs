// Public, static design preview. The Shopify theme remains the source of truth.
import { rm, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
await import('./preview.mjs');
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('.preview/assets', 'dist/assets', { recursive: true });
for (const name of ['index', 'cart', '404', 'page.dispensador', 'page.paseos', 'page.nosotros']) {
  let html = await readFile(`.preview/${name}.html`, 'utf8');
  html = html.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">');
  html = html.replaceAll('href="index.html"', 'href="/"');
  html = html.replaceAll('href="index.html#', 'href="/#');
  html = html.replaceAll('href="cart.html"', 'href="/cart.html"');
  html = html.replaceAll('href="assets/', 'href="/assets/').replaceAll('src="assets/', 'src="/assets/');
  html = html.replace('<link rel="canonical" href="">', '');
  if (/{[{%]/.test(html)) throw new Error(`Unrendered Liquid in ${name}`);
  const output = name.startsWith('page.') ? `pages/${name.slice(5)}` : name;
  if(name.startsWith('page.')) await mkdir('dist/pages',{recursive:true});
  await writeFile(`dist/${output}.html`, html);
}
console.log('Static Milo & Co preview built in dist/');
