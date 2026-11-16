/* Prueba el reconocimiento con fotos de una carpeta, igual que lo hace el celu. Uso: node probar.js <carpeta> */
const fs=require('fs'),path=require('path');
(async()=>{
  const {AutoProcessor,CLIPVisionModelWithProjection,RawImage}=await import('@huggingface/transformers');
  const L=JSON.parse(fs.readFileSync(path.join(__dirname,'..','..','data','comida-ia.json'),'utf8'));
  const E=L.q.map(b=>{const u=Buffer.from(b,'base64'),a=new Int8Array(u.buffer,u.byteOffset,u.length);return Float32Array.from(a,x=>x*L.scale);});
  let mx=0;E.forEach(r=>r.forEach(v=>mx=Math.max(mx,Math.abs(v))));console.log('max comp',mx.toFixed(3));
  const pr=await AutoProcessor.from_pretrained(L.model),vm=await CLIPVisionModelWithProjection.from_pretrained(L.model,{dtype:'fp16'});
  for(const f of fs.readdirSync(process.argv[2])){
    const im=await RawImage.read(path.join(process.argv[2],f)),{image_embeds}=await vm(await pr(im)),v=image_embeds.data;let n=0;v.forEach(x=>n+=x*x);n=Math.sqrt(n);
    const s=E.map((r,i)=>{let d=0;for(let j=0;j<L.dim;j++)d+=r[j]*v[j]/n;return{id:L.ids[i],d};}).sort((a,b)=>b.d-a.d);
    const mxd=s[0].d,ex=s.map(x=>Math.exp((x.d-mxd)*100)),z=ex.reduce((a,b)=>a+b,0);
    console.log(f.padEnd(30),s.slice(0,3).map((x,i)=>x.id+' '+Math.round(ex[i]/z*100)+'%').join('  '));
  }
})().catch(e=>{console.error(e);process.exit(1);});
