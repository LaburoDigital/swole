/* Prueba el reconocimiento con las fotos de una carpeta, con la MISMA lógica que la app (el bloque <plato> de js/datos.js).
   Uso: node probar.js <carpeta> */
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','..','js','datos.js'),'utf8'),blk=src.slice(src.indexOf('/*<plato>'),src.indexOf('/*</plato>*/'));
const {plateScan,plateItems}=new Function(blk+';return{plateScan,plateItems};')();
(async()=>{
  const T=await import('@huggingface/transformers');
  const L=JSON.parse(fs.readFileSync(path.join(__dirname,'..','..','data','comida-ia.json'),'utf8'));
  const E=L.q.map(b=>{const u=Buffer.from(b,'base64');return Float32Array.from(new Int8Array(u.buffer,u.byteOffset,u.length),x=>x*L.scale);});
  const m={E,ids:L.ids,dim:L.dim,pr:await T.AutoProcessor.from_pretrained(L.model),vm:await T.CLIPVisionModelWithProjection.from_pretrained(L.model,{dtype:'fp16'})};
  for(const f of fs.readdirSync(process.argv[2])){
    const t0=Date.now(),its=plateItems(await plateScan(m,await T.RawImage.read(path.join(process.argv[2],f))));
    console.log(f.padEnd(40),its.map(it=>it.opts[0]+' ('+Math.round(it.p*100)+'%)'+(it.opts.length>1?' ['+it.opts.slice(1).join(',')+']':'')).join(' + ')||'(no es comida)',(Date.now()-t0)+'ms');
  }
})().catch(e=>{console.error(e);process.exit(1);});
