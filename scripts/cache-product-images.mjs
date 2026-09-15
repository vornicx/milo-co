// Bundle the merchant-supplied catalog photos when their host is reachable.
import { writeFile } from 'node:fs/promises';
const names=['47496f24-4801-4ef1-afca-9294a987cce3.jpg','427ce113-d7bb-43eb-9651-8f3db4a44081.jpeg','c7bba972-c46a-409d-a656-74dc0e2a6cbe.jpeg','97125975-9154-4dcf-bd8b-aaf07d641ab0.jpeg'];
export async function cacheProductImages() {
 const results=await Promise.all(names.map(async (name,index)=>{
  const url=`https://oss.teemdrop.com/goods-admin/2026/08/20/${name}`;
  try {
   const response=await fetch(url,{signal:AbortSignal.timeout(12000)});
   if(!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('Image unavailable');
   const data=new Uint8Array(await response.arrayBuffer());
   if(data.length>10000000) throw new Error('Oversized image');
   const path=`/assets/dispenser-${index+1}.jpg`;
   await writeFile(`dist${path}`,data);
   return [url,path];
  } catch { console.warn(`Catalog photo ${index+1}: retaining original supplier URL`);return [url,url]; }
 }));
 return new Map(results);
}
