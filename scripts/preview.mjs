// Local visual preview only. Shopify remains the authoritative Liquid renderer.
import { Liquid } from 'liquidjs';
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
await mkdir('.preview/snippets',{recursive:true});
for (const file of ['arrow','product-form','dispenser-gallery','color-preview']) {
 let text=await readFile(`snippets/${file}.liquid`,'utf8');
 text=text.replace(/{% form[^%]*%}/g, '<form>').replace(/{% endform %}/g,'</form>');
 await writeFile(`.preview/snippets/${file}.liquid`,text);
}
const engine = new Liquid({root: '.preview/snippets', extname: '.liquid'});
engine.registerFilter('asset_url', x => `assets/${x}`);
engine.registerFilter('stylesheet_tag', x => `<link rel="stylesheet" href="${x}">`);
engine.registerFilter('money', x => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(x/100));
const clean = s => s.replace(/{% schema %}[\s\S]*?{% endschema %}/g,'');
const base = {request:{locale:{iso_code:'es'}},routes:{root_url:'index.html',cart_url:'cart.html'},cart:{item_count:0},shop:{name:'Milo & Co',policies:[]},settings:{sales_enabled:false,product_page:{url:'/pages/dispensador'},walk_page:{url:'/pages/paseos'}},page_title:'Milo & Co',canonical_url:'',content_for_header:''};
async function section(type,id,settings={}) {
 const raw=clean(await readFile(`sections/${type}.liquid`,'utf8'));
 const schema=JSON.parse((await readFile(`sections/${type}.liquid`,'utf8')).match(/{% schema %}([\s\S]*?){% endschema %}/)[1]);
 const defaults=Object.fromEntries(schema.settings.map(x=>[x.id,x.default??'']));
 return engine.parseAndRender(raw,{...base,section:{id,settings:{...defaults,...settings}}});
}
await mkdir('.preview',{recursive:true});
await cp('assets','.preview/assets',{recursive:true});
for(const name of ['index','cart','404','page.dispensador','page.paseos']) {
 const template=JSON.parse(await readFile(`templates/${name}.json`,'utf8'));
 let content='';for(const id of template.order){const s=template.sections[id];content+=await section(s.type,id,s.settings);}
 let layout=await readFile('layout/theme.liquid','utf8');
 layout=layout.replace("{% section 'header' %}",await section('header','header')).replace("{% section 'footer' %}",await section('footer','footer'));
 await writeFile(`.preview/${name}.html`,await engine.parseAndRender(layout,{...base,content_for_layout:content}));
}
await writeFile('.preview/mobile.html','<!doctype html><html><head><title>Revisión a 390 px</title></head><body style="margin:0;background:#d0d4c8"><iframe title="Milo & Co móvil" src="index.html" style="display:block;width:390px;height:2600px;border:0;margin:0 auto"></iframe></body></html>');
console.log('Preview rendered from actual Liquid sections in .preview/');
