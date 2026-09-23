// Local visual preview only. Shopify remains the authoritative Liquid renderer.
import { Liquid } from 'liquidjs';
import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
await mkdir('.preview/snippets',{recursive:true});
for (const filename of await readdir('snippets')) {
 if (!filename.endsWith('.liquid')) continue;
 let content=await readFile(`snippets/${filename}`,'utf8');
 content=content.replace(/{% doc %}[\s\S]*?{% enddoc %}/g, '');
 content=content.replace(/{% form[^%]*%}/g, '<form>').replace(/{% endform %}/g,'</form>');
 await writeFile(`.preview/snippets/${filename}`,content);
}
const engine = new Liquid({root: '.preview/snippets', extname: '.liquid'});
const translations = JSON.parse(await readFile('locales/es.default.json', 'utf8'));
engine.registerFilter('t', (key, ...args) => {
 let value = key.split('.').reduce((object, part) => object?.[part], translations) ?? key;
 for (const [name, replacement] of args) value = value.replaceAll(`{{ ${name} }}`, replacement);
 return value;
});
engine.registerFilter('asset_url', x => `/assets/${x}`);
engine.registerFilter('asset_img_url', x => `/assets/${x}`);
engine.registerFilter('stylesheet_tag', x => `<link rel="stylesheet" href="${x}">`);
engine.registerFilter('money', x => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(x/100));
const clean = s => s.replace(/{% schema %}[\s\S]*?{% endschema %}/g,'');
const base = {request:{locale:{iso_code:'es'},page_type:'index'},routes:{root_url:'index.html',cart_url:'cart.html'},cart:{item_count:0},shop:{name:'Milo & Co',url:'https://miloandcompany.es',policies:[],privacy_policy:{body:'Configured on Shopify',url:'/policies/privacy-policy'}},settings:{sales_enabled:false,products_page:{url:'/pages/productos'},product_page:{url:'/pages/dispensador'},walk_page:{url:'/pages/paseos'},brand_page:{url:'/pages/nosotros'}},page_title:'Milo & Co',current_page:1,canonical_url:'https://miloandcompany.es/',content_for_header:''};
async function section(type,id,settings={}) {
 const raw=clean(await readFile(`sections/${type}.liquid`,'utf8'));
 const schema=JSON.parse((await readFile(`sections/${type}.liquid`,'utf8')).match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
 const defaults=Object.fromEntries(schema.settings.map(x=>[x.id,x.default??'']));
 return engine.parseAndRender(raw,{...base,section:{id,settings:{...defaults,...settings}}});
}
await mkdir('.preview',{recursive:true});
await cp('assets','.preview/assets',{recursive:true});
const previewPageTitles={productos:'Dispensador',dispensador:'Dispensador 3 en 1',paseos:'Paseos y escapadas',nosotros:'Nuestra idea',contact:'Contacto',page:'Información'};
for(const name of ['index','cart','404','page.productos','page.dispensador','page.paseos','page.nosotros','page.contact','page']) {
 const pageHandle=name.startsWith('page.') ? name.slice(5) : '';
 base.request.page_type=pageHandle ? 'page' : name;
 base.page={handle:pageHandle,title:previewPageTitles[pageHandle] || pageHandle,content:''};
 base.page_title=previewPageTitles[pageHandle] || 'Milo & Co';
 base.canonical_url=`https://miloandcompany.es${pageHandle ? '/pages/'+pageHandle : name==='index' ? '/' : '/'+name}`;
 const template=JSON.parse(await readFile(`templates/${name}.json`,'utf8'));
 let content='';for(const id of template.order){const s=template.sections[id];if(s.disabled) continue;content+=await section(s.type,id,s.settings);}
 let layout=await readFile('layout/theme.liquid','utf8');
 layout=layout.replace("{% section 'header' %}",await section('header','header')).replace("{% section 'footer' %}",await section('footer','footer'));
 await writeFile(`.preview/${name}.html`,await engine.parseAndRender(layout,{...base,content_for_layout:content}));
}
await writeFile('.preview/mobile.html','<!doctype html><html><head><title>Revisión a 390 px</title></head><body style="margin:0;background:#d0d4c8"><iframe title="Milo & Co móvil" src="index.html" style="display:block;width:390px;height:2600px;border:0;margin:0 auto"></iframe></body></html>');
console.log('Preview rendered from actual Liquid sections in .preview/');
