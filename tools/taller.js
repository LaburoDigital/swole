/* Taller de figuras (SW-9): los 154 ejercicios con número fijo, para revisar y decir "el 37 está mal".
   Uso: node tools/taller.js [salida]   (por defecto ../swole-taller.html, fuera de la app pública)
   Cada ficha: número, nombre, animación, tira de cuadros (inicio, medio, fin), agarre, equipo, mapa de músculos,
   técnica, error común y, en rojo, lo que encuentre el validador. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const { appConPerfil, RAIZ } = require(path.join(__dirname, '..', 'tests', 'cargar.js'));
const out = process.argv[2] || path.join(RAIZ, '..', 'swole-taller.html');
const app = appConPerfil();
const datos = JSON.parse(vm.runInContext(`JSON.stringify(EX.map((e,i)=>{const k=techOf(e),T=TECH[k]||{},D=MKD[e.id],X=XT[e.id]||{};
  const I={};e.p.forEach(m=>I[m]=1);e.s.forEach(m=>{if(!I[m])I[m]=.45;});
  return {n:i+1,id:e.id,nombre:e.n,eq:e.eq,p:e.p.map(m=>MUSC[m]).join(', '),s:e.s.map(m=>MUSC[m]).join(', '),
    fig:techSVG(k),tira:D?[0,.5,1].map(u=>MK.svg(D,{u,noGrip:1})):null,agarre:D?gripTxt(D.grip):'',
    mapa:bodyMap(I,{}),cues:X.cues||T.cues||[],err:X.err||T.err||'',mk:!!D,prob:D?MK.check(D):null};}))`, app.ctx));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nuevos = datos.filter(d => d.mk).length, malos = datos.filter(d => d.prob && d.prob.length).length;
const ficha = d => `<article class="tf${d.mk ? ' nuevo' : ''}${d.prob && d.prob.length ? ' mal' : ''}" id="e${d.n}" data-q="${esc((d.n + ' ' + d.nombre + ' ' + d.id).toLowerCase())}">
  <header><b class="num">${d.n}</b><div><h3>${esc(d.nombre)}</h3><small>${esc(d.id)} · ${esc(d.eq)}</small></div>${d.mk ? '<span class="tag ok">macaco nuevo</span>' : '<span class="tag">figura vieja · fase B</span>'}</header>
  <div class="tf-fig">${d.fig}</div>
  ${d.tira ? `<div class="tira">${d.tira.map((s, i) => `<figure>${s}<figcaption>${['inicio', 'medio', 'fin'][i]}</figcaption></figure>`).join('')}</div>` : ''}
  ${d.prob ? (d.prob.length ? `<ul class="prob">${d.prob.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : '<p class="valok">Validador: sin problemas en ningún cuadro (cada 5 %)</p>') : '<p class="valno">Validador: todavía no (figura vieja)</p>'}
  ${d.agarre ? `<p class="agarre"><b>Agarre:</b> ${esc(d.agarre)}</p>` : ''}
  <div class="tf-bm">${d.mapa}</div>
  <p class="tmus"><b>Principal:</b> ${esc(d.p)}${d.s ? ` · <b>Secundarios:</b> ${esc(d.s)}` : ''}</p>
  <ul class="cues">${d.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
  ${d.err ? `<p class="err"><b>Error común:</b> ${esc(d.err)}</p>` : ''}
</article>`;
/* la hoja de estilos de la app, con la ruta relativa a donde se escribe el taller */
const css = path.relative(path.dirname(path.resolve(out)), path.join(RAIZ, 'app.css')).split(path.sep).join('/');
const html = `<!doctype html><html lang="es" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Taller de figuras</title><link rel="stylesheet" href="${css}">
<style>
body{background:var(--bg);color:var(--text);font:14px system-ui,sans-serif;margin:0;padding:16px}
.top{position:sticky;top:0;z-index:5;background:var(--bg);padding:8px 0 12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-bottom:1px solid var(--line)}
.top h1{font-size:18px;margin:0 12px 0 0}.top input{flex:1;min-width:180px;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--text)}
.top label{font-size:13px;color:var(--mut);display:flex;gap:4px;align-items:center}.top button{padding:7px 10px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--text);cursor:pointer}
.res{font-size:13px;color:var(--mut);width:100%}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;margin-top:12px}
.tf{border:1px solid var(--line);border-radius:14px;padding:12px;background:color-mix(in srgb,var(--text) 3%,transparent)}
.tf.mal{border-color:#E5484D;box-shadow:0 0 0 1px #E5484D inset}
.tf header{display:flex;gap:10px;align-items:center}.tf h3{margin:0;font-size:15px}.tf small{color:var(--mut)}
.num{font-size:22px;min-width:40px;height:40px;display:grid;place-items:center;border-radius:10px;background:color-mix(in srgb,var(--acc) 18%,transparent);color:var(--acc)}
.tag{margin-left:auto;font-size:11px;padding:3px 7px;border-radius:99px;border:1px solid var(--line);color:var(--mut);white-space:nowrap}.tag.ok{border-color:var(--acc);color:var(--acc)}
.tf-fig{display:grid;place-items:center;margin:8px 0}.tf-fig .tq{width:220px;height:220px}
.tira{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}.tira figure{margin:0;text-align:center}.tira .tq{width:100%;height:auto}.tira figcaption{font-size:11px;color:var(--mut)}
.prob{color:#E5484D;margin:8px 0;padding-left:18px;font-size:13px}.valok{color:#3DD68C;font-size:13px}.valno{color:var(--mut);font-size:13px}
.agarre,.tmus,.err{font-size:13px;margin:6px 0}.err{color:var(--mut)}.cues{font-size:13px;padding-left:18px;margin:6px 0}
.tf-bm{max-width:200px;margin:6px auto}
.oculto{display:none}
body.cap{padding:12px;width:430px;max-width:430px;box-sizing:border-box;overflow:hidden}body.cap *{box-sizing:border-box}body.cap .top{display:none}
body.cap main.grid{display:block;width:100%;max-width:100%;margin:0;padding:0}body.cap .tf{width:100%;max-width:100%;overflow:hidden}body.cap .tf h3{font-size:16px}
body.cap .tf-fig .tq{width:300px;height:300px}
body.gif{padding:0}body.gif .tf{border:0;padding:6px;background:var(--bg)}body.gif .tf>*:not(.tf-fig):not(header){display:none}body.gif .tag{display:none}body.gif .tf-fig{margin:2px 0 0}
</style></head><body>
<div class="top"><h1>Taller de figuras</h1><input id="q" type="search" placeholder="Número o nombre (ej. 37, banca)">
<label><input type="checkbox" id="soloN"> solo macaco nuevo</label><label><input type="checkbox" id="soloM"> solo con problemas</label>
<button id="tema">Claro / oscuro</button>
<div class="res">${datos.length} ejercicios · ${nuevos} con el macaco nuevo · ${malos} con problemas del validador · generado ${new Date().toLocaleString('es-UY')}</div></div>
<main class="grid">${datos.map(ficha).join('\n')}</main>
<script>
const q=document.getElementById('q'),n=document.getElementById('soloN'),m=document.getElementById('soloM'),fs=[...document.querySelectorAll('.tf')];
function f(){const t=q.value.trim().toLowerCase();fs.forEach(a=>{const num=/^\\d+$/.test(t);const ok=(!t||(num?a.id==='e'+t:a.dataset.q.includes(t)))&&(!n.checked||a.classList.contains('nuevo'))&&(!m.checked||a.classList.contains('mal'));a.classList.toggle('oculto',!ok);});}
[q,n,m].forEach(x=>x.addEventListener('input',f));
document.getElementById('tema').onclick=()=>{const h=document.documentElement;h.dataset.theme=h.dataset.theme==='dark'?'light':'dark';};
/* modo captura (para mandar imágenes): ?n=1 un ejercicio, &tema=light, &cap ficha a ancho de celu, &gif solo la figura, &t=1.2 congela la animación en ese segundo */
const U=new URLSearchParams(location.search);
if(U.get('tema'))document.documentElement.dataset.theme=U.get('tema');
if(U.get('n')){q.value=U.get('n');f();}
if(U.has('cap'))document.body.classList.add('cap');if(U.has('gif'))document.body.classList.add('cap','gif');
if(U.has('t')||U.has('cap')){const t=U.has('t')?+U.get('t'):1.26;document.querySelectorAll('.tf-fig svg').forEach(v=>{v.pauseAnimations();v.setCurrentTime(t);});}
document.body.setAttribute('data-h',Math.ceil(document.querySelector('main').getBoundingClientRect().bottom+12));
</script></body></html>`;
fs.writeFileSync(out, html);
console.log('taller: ' + out + ' — ' + datos.length + ' ejercicios, ' + nuevos + ' con el macaco nuevo, ' + malos + ' con problemas');
