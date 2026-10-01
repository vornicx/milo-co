import { Liquid } from 'liquidjs';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function prepareLiquid(source) {
  return source
    .replace(/{%-?\s*schema\s*-?%}[\s\S]*?{%-?\s*endschema\s*-?%}/g, '')
    .replace(/{%-?\s*doc\s*-?%}[\s\S]*?{%-?\s*enddoc\s*-?%}/g, '')
    .replace(/{%-?\s*style\s*-?%}/g, '<style>')
    .replace(/{%-?\s*endstyle\s*-?%}/g, '</style>')
    .replace(/{%-?\s*form\s+'([^']+)'([\s\S]*?)-?%}/g, (_, type, args) => {
      const id = args.match(/id:\s*(\w+)/)?.[1];
      const cls = args.match(/class:\s*'([^']+)'/)?.[1] ?? '';
      return `<form method="post" action="/contact"${id ? ` id="{{ ${id} }}"` : ''} class="${cls}"><input type="hidden" name="form_type" value="${type}"><input type="hidden" name="utf8" value="✓">`;
    })
    .replace(/{%-?\s*endform\s*-?%}/g, '</form>');
}

export function createPreviewEngine(root, snippetRoot) {
  const translations = JSON.parse(readFileSync(join(root, 'locales/es.json'), 'utf8'));
  const engine = new Liquid({ root: snippetRoot, extname: '.liquid' });
  engine.registerFilter('t', (key, ...args) => {
    let value = key.split('.').reduce((part, entry) => part?.[entry], translations) ?? key;
    for (const pair of args) if (Array.isArray(pair)) value = value.replaceAll(`{{ ${pair[0]} }}`, String(pair[1]));
    return value;
  });
  engine.registerFilter('asset_url', (filename) => `/assets/${filename}`);
  engine.registerFilter('stylesheet_tag', (url) => `<link rel="stylesheet" href="${url}">`);
  engine.registerFilter('inline_asset_content', (filename) => {
    const path = join(root, 'assets', filename);
    return existsSync(path) ? readFileSync(path, 'utf8') : '';
  });
  engine.registerFilter('money', (value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value) / 100));
  engine.registerFilter('default_errors', () => '<p>Revisa los campos del formulario.</p>');
  return engine;
}
