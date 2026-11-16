/* Calcula de antemano cómo "suena" cada alimento para el modelo de imágenes (MobileCLIP S0).
   El celu solo baja la parte que mira la foto (12 MB) y compara contra esto.
   Uso: cd tools/ia && npm i && node comida.js   → escribe ../../data/comida-ia.json */
const fs=require('fs'),path=require('path');
const P={pech:'grilled chicken breast',muslo:'roasted chicken thigh',bife:'grilled beef steak',picada:'cooked ground beef',asado:'argentine barbecue, grilled beef ribs on a parrilla',vacio:'grilled flank steak',
 bondiola:'roasted pork',milc:'breaded fried beef cutlet milanesa',milp:'breaded chicken cutlet',milnapo:'breaded cutlet topped with ham, tomato sauce and melted cheese',hamb:'beef burger patty',
 chori:'grilled chorizo sausage',jamon:'sliced ham',atun:'canned tuna',salmon:'cooked salmon fillet',merluza:'cooked white fish fillet',huevo:'fried eggs',clara:'cooked egg whites',
 whey:'protein shake in a shaker',leche:'glass of milk',lechedes:'glass of milk',yogur:'bowl of plain yogurt',yogurf:'fruit yogurt cup',griego:'greek yogurt',cremoso:'slices of cheese',
 muzza:'mozzarella cheese',rallado:'grated cheese',untable:'cream cheese spread',ddl:'dulce de leche caramel spread',manteca:'butter',arroz:'white rice',arrozi:'brown rice',
 fideos:'plain cooked pasta',noquis:'potato gnocchi',papa:'boiled potatoes',fritas:'a plate of french fries',pure:'mashed potatoes',batata:'roasted sweet potato',pan:'french bread rolls',
 lactal:'sliced white sandwich bread',panint:'whole wheat bread',arrozt:'rice cakes',agua:'crackers',avena:'oatmeal porridge',granola:'granola',copos:'bowl of corn flakes cereal',
 polenta:'polenta',choclo:'corn on the cob',lentejas:'cooked lentils',garbanzo:'chickpeas',porotos:'cooked beans',wrap:'flour tortilla wrap',empa:'baked empanadas',
 pizza:'cheese pizza',tarta:'savory vegetable pie quiche',tortilla:'spanish potato omelette',guiso:'lentil stew',sandjq:'ham and cheese sandwich',hambc:'hamburger with bun',
 pancho:'hot dog',sushi:'sushi rolls',fideosalsa:'pasta with tomato sauce',ensp:'salad with chicken',banana:'banana',manzana:'apple',naranja:'orange fruit',mandarina:'tangerine',
 frutilla:'strawberries',uva:'grapes',pera:'pear',durazno:'peach',kiwi:'kiwi fruit',palta:'avocado',ensalada:'lettuce and tomato salad',tomate:'tomatoes',zanahoria:'carrots',
 brocoli:'broccoli',zapallo:'pumpkin squash',espinaca:'cooked spinach',salteado:'stir fried vegetables',aceite:'bottle of cooking oil',mani:'peanuts',pmani:'peanut butter',
 nuez:'walnuts',almendra:'almonds',mayo:'mayonnaise',ketchup:'ketchup',medialuna:'croissants and pastries',alfajor:'alfajor cookie sandwich',galled:'sweet cookies',
 choco:'milk chocolate bar',helado:'ice cream',miel:'honey',azucar:'sugar',mermelada:'jam',barrac:'cereal bar',barrap:'protein bar',gaseosa:'glass of cola soda',zero:'can of diet soda',
 jugo:'glass of orange juice',cafel:'cup of coffee with milk',isot:'sports drink bottle',cerveza:'glass of beer',vino:'glass of red wine'};
/* cosas que no son comida: si gana una de estas, la foto no es de un plato */
const NO={x_persona:'a person',x_gym:'gym equipment',x_mascota:'a dog or a cat',x_texto:'a document with text',x_pantalla:'a phone or computer screen',x_mesa:'an empty table',x_paisaje:'a landscape'};
(async()=>{
  const {AutoTokenizer,CLIPTextModelWithProjection}=await import('@huggingface/transformers');
  const M=process.argv[2]||'Xenova/mobileclip_s0',tok=await AutoTokenizer.from_pretrained(M),tm=await CLIPTextModelWithProjection.from_pretrained(M,{dtype:'fp32'});
  /* se pueden sumar más formas de describir cada comida a T: se promedian */
  const T=[x=>'a photo of '+x+', a type of food']; /* probado: más frases o el modelo S2 (72 MB) no aciertan más con las fotos de prueba */
  const ids=Object.keys(P).concat(Object.keys(NO)),txt=[];ids.forEach(k=>T.forEach(t=>txt.push(P[k]?t(P[k]):'a photo of '+NO[k])));
  const inp=tok(txt,{padding:'max_length',truncation:true});const te=(await tm(inp)).text_embeds,dim=te.dims[1],raw=te.data,d=new Float32Array(ids.length*dim);
  for(let i=0;i<ids.length;i++)for(let t=0;t<T.length;t++){const o=(i*T.length+t)*dim;let n=0;for(let j=0;j<dim;j++)n+=raw[o+j]**2;n=Math.sqrt(n);for(let j=0;j<dim;j++)d[i*dim+j]+=raw[o+j]/n/T.length;}
  const out={model:M,dtype:process.argv[4]||'fp16',dim,ids,q:[]};
  /* normalizado y guardado en 8 bits: 0,1 % de error, 8 veces más chico */
  for(let i=0;i<ids.length;i++){let n=0;for(let j=0;j<dim;j++)n+=d[i*dim+j]**2;n=Math.sqrt(n);const row=new Int8Array(dim);for(let j=0;j<dim;j++)row[j]=Math.max(-127,Math.min(127,Math.round(d[i*dim+j]/n*127*2.8)));out.q.push(Buffer.from(row.buffer).toString('base64'));}
  out.scale=1/(127*2.8);
  const dst=process.argv[3]?path.resolve(process.argv[3]):path.join(__dirname,'..','..','data','comida-ia.json');fs.mkdirSync(path.dirname(dst),{recursive:true});fs.writeFileSync(dst,JSON.stringify(out));
  console.log('ok',ids.length,'dim',dim,Math.round(fs.statSync(dst).size/1024)+' KB');
})().catch(e=>{console.error(e);process.exit(1);});
