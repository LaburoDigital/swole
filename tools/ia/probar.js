/* Prueba el reconocimiento con las fotos de una carpeta, con la MISMA lógica que la app (el bloque <plato> de js/datos.js).
   Uso: node probar.js <carpeta> */
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','..','js','datos.js'),'utf8'),blk=src.slice(src.indexOf('/*<plato>'),src.indexOf('/*</plato>*/'));
const {plateScan,plateItems}=new Function(blk+';return{plateScan,plateItems};')();
(async()=>{
  const T=await import('@huggingface/transformers');
  const L=JSON.parse(fs.readFileSync(process.argv[3]?path.resolve(process.argv[3]):path.join(__dirname,'..','..','data','comida-ia.json'),'utf8'));
  const E=L.q.map(b=>{const u=Buffer.from(b,'base64');return Float32Array.from(new Int8Array(u.buffer,u.byteOffset,u.length),x=>x*L.scale);});
  const m={E,ids:L.ids,dim:L.dim,pr:await T.AutoProcessor.from_pretrained(L.model),vm:await T.CLIPVisionModelWithProjection.from_pretrained(L.model,{dtype:L.dtype||'fp16'})};
  const OK={asado_argentino:['carne'],banana_fruit:['banana'],combo_bife_con_ensalada:['carne','arroz'],combo_huevo_frito_arroz:['mila','huevo','arroz'],combo_milanesa_con_papas_fritas:['mila','papa'],combo_milanesa_con_pur:['mila','papa'],combo_pollo_con_arroz_plato:['pollo','arroz'],combo_steak_and_fries_plate:['carne','papa'],empanadas:['empa'],ensalada_lechuga_tomate:['ensalada'],french_fries_plate:['papa'],milanesa_napolitana:['mila'],pizza_muzzarella:['pizza'],spaghetti_tomato_sauce:['pasta']};
  const fam=id=>({chori:'carne'})[id]||new Function(blk+';return pFam;')()(id);let hit=0,want=0,extra=0;
  for(const f of fs.readdirSync(process.argv[2])){
    const t0=Date.now(),its=plateItems(await plateScan(m,await T.RawImage.read(path.join(process.argv[2],f))));
    const k=f.replace('.jpg',''),w=OK[k]||[],got=its.map(it=>fam(it.opts[0]));want+=w.length;hit+=w.filter(x=>got.includes(x)).length;extra+=got.filter(x=>!w.includes(x)&&x!=='huevo').length;
    console.log(f.padEnd(40),its.map(it=>it.opts[0]+' ('+Math.round(it.p*100)+'%)'+(it.opts.length>1?' ['+it.opts.slice(1).join(',')+']':'')).join(' + ')||'(no es comida)',(Date.now()-t0)+'ms');
  }
  console.log('ACIERTOS',hit+'/'+want,'DE MAS',extra);
})().catch(e=>{console.error(e);process.exit(1);});
