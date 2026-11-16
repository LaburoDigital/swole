'use strict';
/* ============ Planificación, rachas, volumen ============ */
function plannedFor(dk){
  const dow=parseK(dk).getDay(),ids=new Set(db.plan[dk]||[]);
  db.routines.forEach(r=>{if(r.days&&r.days.includes(dow)&&dk>=(r.since||'0000-00-00'))ids.add(r.id);});
  return[...ids].map(id=>db.routines.find(r=>r.id===id)).filter(Boolean);
}
const doneOn=dk=>db.logs.filter(l=>l.date===dk);
function streak(){
  const t=today();let d=t,n=0,rest=0;
  if(!doneOn(t).length)d=addDays(t,-1);
  for(let i=0;i<400;i++){
    if(doneOn(d).length){n++;rest=0;}
    else if(plannedFor(d).length)break;
    else{rest++;if(rest>2)break;}
    d=addDays(d,-1);
  }
  return n;
}
function weekStats(){
  const t=today(),from=addDays(t,-6),m={};let sessions=0,sets=0;
  db.logs.filter(l=>l.date>=from&&l.date<=t).forEach(l=>{
    sessions++;
    l.entries.forEach(en=>{
      const ex=exById(en.ex);if(!ex)return;
      const n=en.sets.length;sets+=n;
      ex.p.forEach(k=>m[k]=(m[k]||0)+n);
      ex.s.forEach(k=>m[k]=(m[k]||0)+n*.5);
    });
  });
  return{m,sessions,sets};
}
function mapOf(ex){const I={};ex.p.forEach(k=>I[k]=1);ex.s.forEach(k=>{if(!I[k])I[k]=.45;});return I;}
function mapOfRoutine(r){
  const I={};
  r.items.forEach(it=>{const ex=exById(it.ex);if(!ex)return;ex.p.forEach(k=>I[k]=Math.min(1,(I[k]||0)+.4));ex.s.forEach(k=>I[k]=Math.min(1,(I[k]||0)+.15));});
  return I;
}
const weightNow=()=>db.profile?db.profile.weight:null;
function waterGoal(){return Math.max(6,Math.round((weightNow()||70)*35/250));}
/* ============ Iconos ============ */
const IC={
  chat:'<path d="M5 18l-2 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8z"/>',
  send:'<path d="M4 12l16-8-6 16-2-7z"/>',
  music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',
  prev:'<path d="M18 6l-9 6 9 6zM6 6v12"/>',
  next:'<path d="M6 6l9 6-9 6zM18 6v12"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  big:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  barcode:'<path d="M4 5v14M7 5v14M11 5v14M14 5v14M18 5v14M20 5v14"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  food:'<path d="M7 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M9 12v9M17 21V3c-2.2 1-3.5 3.6-3.5 7.5V13H17"/>',
  home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  dumb:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  rank:'<path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.3 6.8 19l1-5.8L3.6 9.1l5.8-.8z"/>',
  bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.2-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.6"/><path d="M17.8 14.7c2 .5 3.3 2 3.8 4.6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',down:'<path d="M5 9l7 7 7-7"/>',
  up:'<path d="M5 15l7-7 7 7"/>',
  moon:'<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  play:'<path d="M7 4l13 8-13 8z"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  flame:'<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-4-9 0 4-4 6-4 12 0 4 3 8 7 8z"/>',
  drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  swap:'<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  disc:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
  flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9 17h6"/>',
  medal:'<circle cx="12" cy="15" r="5"/><path d="M8.5 11 6 3h4l2 5 2-5h4l-2.5 8M12 13v4"/>',
  crown:'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  gem:'<path d="M6 3h12l3 6-9 12L3 9zM3 9h18M12 21 8.5 9 10 3M12 21l3.5-12L14 3"/>',
  body:'<circle cx="12" cy="4.5" r="2"/><path d="M5 9l7 1 7-1M12 10v5l-3 6M12 15l3 6"/>',
  acro:'<circle cx="12" cy="19.5" r="2"/><path d="M5 15l7-1 7 1M12 14V9l-3-6M12 9l3-6"/>',
  rocket:'<path d="M12 2c4 3 5 8 3 13H9C7 10 8 5 12 2z"/><circle cx="12" cy="9" r="1.6"/><path d="M9 15l-3 3 1 3 3-2M15 15l3 3-1 3-3-2"/>',
  lever:'<path d="M3 4h18M8 4v5h11"/><circle cx="6" cy="9" r="1.8"/>',
  planche:'<path d="M3 20h18M8 20v-6h12"/><circle cx="5.5" cy="13" r="1.8"/>',
  weight:'<path d="M7 8h10l3 12H4z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  muscle:'<path d="M4 16c0-5 3-9 6-10l2 3-2 2c2 1 4 0 5-1 3 0 5 2 5 5 0 3-3 5-7 5H9c-3 0-5-2-5-4z"/>',
  ball:'<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10zM12 3v4M21 10.5l-5-.5M18 19l-3.5-4.5M6 19l3.5-4.5M3 10.5l5-.5"/>',
  rugby:'<ellipse cx="12" cy="12" rx="9.5" ry="5.5" transform="rotate(-35 12 12)"/><path d="M8.5 15.5l7-7M10 11.5l2 2M12 9.5l2 2"/>',
  basket:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8"/>',
  racket:'<ellipse cx="14" cy="9" rx="6" ry="6.5"/><path d="M10 14l-6 6M10 7l7 4M12.5 3l2 12"/>',
  swim:'<circle cx="16" cy="6" r="2"/><path d="M3 18c2 1.3 4 1.3 6 0s4-1.3 6 0 4 1.3 6 0M5 14l5-5 3 3 3-2"/>',
  run:'<circle cx="15" cy="4" r="2"/><path d="M9 21l2.5-6L9 12l3-5 4 4h3M6 10l3-3h3M14 15l2 6"/>',
  glove:'<path d="M6 10V7a5 5 0 0 1 10 0v2a3 3 0 0 1 3 3v2a6 6 0 0 1-6 6H9v-4a3 3 0 0 1-3-3z"/><path d="M9 16h6"/>',
  hockey:'<path d="M14 3l-6 15a2 2 0 0 0 2 3h7"/><circle cx="18.5" cy="19" r="1.5"/>',
  volley:'<circle cx="12" cy="12" r="9"/><path d="M12 3c0 5 2 8 7 10M3.5 9.5c4 1 8 0 10-4M7 19.5c1-4 4-7 9-7"/>',
  bike:'<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-8h5l3 8M10 8l2 8H6M14 5h3"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  cloud:'<path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.5 8.5z"/>',
  pill:'<rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-35 12 12)"/><path d="M9.5 9.5l5 5" transform="rotate(0 12 12)"/>'
};
const ic=(n,s)=>'<svg class="ic ic-'+n+'" width="'+(s||20)+'" height="'+(s||20)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';

/* ============ Mapa corporal ============
   Polígonos de los músculos adaptados de react-body-highlighter (MIT, © 2020 GV79),
   que a su vez viene de react-native-body-highlighter (MIT, © 2022 ELABBASSI Hicham). */
const BODY={"front":{"pecho":["51.8 41.6 51 55.1 58 58 67.8 55.5 70.6 47.3 62 41.6","29.8 46.5 31.4 55.5 40.8 58 48.2 55.1 47.8 42 37.6 42"],"oblicuos":["68.6 63.3 67.3 57.1 58.8 59.6 60 64.1 60.4 83.3 65.7 78.8 66.5 69.8","33.9 78.4 33.1 71.8 31 63.3 32.2 57.1 40.8 59.2 39.2 63.3 39.2 83.7"],"abs":["56.3 59.2 58 64.1 58.4 78 58.4 92.7 56.3 98.4 55.1 104.1 51.4 107.8 51 84.5 50.6 67.3 51 57.1","43.7 58.8 48.6 57.1 49 67.3 48.6 84.5 48.2 107.3 44.5 103.7 40.8 91.4 40.8 78.4 41.2 64.5"],"biceps":["16.7 68.2 18 71.4 22.9 66.1 29 53.9 27.8 49.4 20.4 55.9","71.4 49.4 70.2 54.7 76.3 66.1 81.6 71.8 82.9 69 78.8 55.5"],"triceps":["69.4 55.5 69.4 61.6 75.9 72.7 77.6 70.2 75.5 67.3","22.4 69.4 29.8 55.5 29.8 60.8 22.9 73.1"],"_neck":["55.5 23.7 50.6 33.5 50.6 39.2 61.6 40 70.6 44.9 69.4 36.7 63.3 35.1 58.4 30.6","29 44.9 30.2 37.1 36.3 35.1 41.2 30.2 44.5 24.5 49 33.9 48.6 39.2 38 39.6"],"hombros":["78.4 53.1 79.6 47.8 79.2 41.2 75.9 38 71 36.3 72.2 42.9 71.4 47.3","28.2 47.3 21.2 53.1 20 47.8 20.4 40.8 24.5 37.1 28.6 37.1 26.9 43.3"],"_head":["42.4 2.9 40 11.8 42 19.6 46.1 23.3 49.8 25.3 54.7 22.4 57.6 19.2 59.2 10.2 57.1 2.4 49.8 0"],"aductores":["52.7 110.2 54.3 124.9 60 110.2 62 100 64.9 94.3 60 92.7 56.7 104.5","47.8 110.6 44.9 125.3 42 115.9 40.4 113.1 39.6 107.3 38 102.4 34.7 93.9 39.6 92.2 41.6 99.2 43.7 105.3"],"cuadriceps":["34.7 98.8 37.1 108.2 37.1 127.8 34.3 137.1 31 132.7 29.4 120 28.2 111.4 29.4 100.8 32.2 94.7","63.3 105.7 64.5 100 66.9 94.7 70.2 101.2 71 111.8 68.2 133.1 65.3 137.6 62.4 128.6 62 111.4","38.8 129.4 38.4 112.2 41.2 118.4 44.5 129.4 42.9 135.1 40 146.1 36.3 146.5 35.5 140","59.6 145.7 55.5 129 60.8 113.9 61.2 130.2 64.1 139.6 62.9 146.5","32.7 138.4 26.5 145.7 25.7 136.7 25.7 127.3 26.9 114.3 29.4 133.5","71.8 113.1 73.9 124.1 73.9 140.4 72.7 145.7 66.5 138.4 70.2 133.5"],"_knee":["33.9 140 34.7 143.3 35.5 147.3 36.3 151 35.1 156.7 29.8 156.7 27.3 152.7 27.3 147.3 30.2 144.1","65.7 140 72.2 147.8 72.2 152.2 69.8 157.1 64.9 156.7 62.9 151"],"gemelos":["71.4 160.4 73.5 153.5 76.7 161.2 79.6 167.8 78.4 187.8 79.6 195.5 74.7 195.5","24.9 194.7 27.8 164.9 28.2 160.4 26.1 154.3 24.9 157.6 22.4 161.6 20.8 167.8 22 188.2 20.8 195.5","72.7 195.1 69.8 159.2 65.3 158.4 64.1 162.4 64.1 165.3 65.7 177.1","35.5 158.4 35.9 162.4 35.9 166.9 35.1 172.2 35.1 176.7 32.2 182 30.6 187.3 26.9 194.7 27.3 187.8 28.2 180.4 28.6 175.5 29 169.8 29.8 164.1 30.2 158.8"],"antebrazos":["6.1 88.6 10.2 75.1 14.7 70.2 16.3 74.3 19.2 73.5 4.5 97.6 0 100","84.5 69.8 83.3 73.5 80 73.1 95.1 98.4 100 100.4 93.5 89.4 89.8 76.3","77.6 72.2 77.6 77.6 80.4 84.1 85.3 89.8 92.2 101.2 94.7 99.6","6.9 101.2 13.5 90.6 18.8 84.1 21.6 77.1 21.2 71.8 4.9 98.8"]},"back":{"_head":["50.6 0 46 0.9 40.9 5.5 40.4 12.8 45.1 20 55.7 20 59.1 13.6 59.6 4.7 55.7 1.3"],"trapecio":["44.7 21.7 47.7 21.7 47.2 38.3 47.7 64.7 38.3 53.2 35.3 40.9 31.1 36.6 39.1 33.2 43.8 27.2","52.3 21.7 55.7 21.7 56.6 27.2 60.9 32.8 68.9 36.6 64.7 40.4 61.7 53.2 52.3 64.7 53.2 38.3"],"hombros":["29.4 37 23 39.1 17.4 44.3 18.3 53.6 24.3 49.4 27.2 46.4","71.1 37 78.3 39.6 82.6 44.7 81.7 53.6 74.9 48.9 72.3 45.1"],"dorsales":["31.1 38.7 28.1 48.9 28.5 55.3 34 75.3 47.2 71.1 47.2 66.4 36.6 54 33.6 41.3","68.9 38.7 71.9 49.4 71.5 56.2 66 75.3 52.8 71.1 52.8 66.4 63.4 54.5 66.4 41.7"],"triceps":["26.8 49.8 17.9 55.7 14.5 72.3 16.6 81.7 21.7 63.8 26.8 55.7","73.6 50.2 82.1 55.7 86 73.2 83.4 82.1 77.9 63 73.2 55.7","26.8 58.3 26.8 68.5 23 75.3 19.1 77.4 22.6 65.5","72.8 58.3 77 64.7 80.4 77.4 76.6 75.3 72.8 68.9"],"lumbar":["47.7 72.8 34.5 77 35.3 83.4 49.4 102.1 46.8 83","52.3 72.8 65.5 77 64.7 83.4 50.6 102.1 53.2 83.8"],"antebrazos":["86.4 75.7 91.1 83.4 93.2 94 100 106.4 96.2 104.3 88.1 89.4 84.3 83.8","13.6 75.7 8.9 83.8 6.8 93.6 0 106.4 3.8 104.3 12.3 88.5 15.7 83","81.3 79.6 77.4 77.9 79.1 84.7 91.1 103.8 93.2 108.9 94.5 104.7","18.7 79.6 22.1 77.9 20.9 84.3 9.4 103 6.8 108.5 5.1 104.7"],"gluteos":["44.7 99.6 30.2 108.5 29.8 118.7 31.5 126 47.2 121.3 49.4 114.9","55.3 99.1 51.1 114.5 52.3 120.9 68.1 126 69.8 119.1 69.4 108.5","48.1 123 44.7 123 41.3 125.5 45.1 144.3 48.5 135.7 48.9 129.4","51.9 122.6 55.7 123.4 59.1 126 54.9 144.3 51.9 136.2 51.1 129.4"],"isquios":["28.9 122.1 31.1 129.4 36.6 126 35.3 135.3 34.5 150.2 29.4 158.3 28.9 146.8 27.7 141.3 27.2 131.5","71.5 121.7 69.4 128.9 63.8 126 65.5 136.6 66.4 150.2 71.1 158.3 71.5 147.7 72.8 142.1 73.6 131.9","38.7 125.5 44.3 146 40.4 166.8 36.2 152.8 37 135.3","61.7 125.5 63.4 136.2 64.3 153.2 60 166.8 56.2 146.4"],"_knee":["34.5 153.2 31.1 159.1 33.6 166.4 37.4 162.6","66.4 153.6 63 163 66.8 166.4 69.4 159.1"],"gemelos":["29.4 160.4 28.5 167.2 24.7 179.6 23.8 192.8 25.5 197 28.5 193.2 29.8 180 31.9 171.1 31.9 166.8","37.4 165.1 35.3 167.7 33.2 171.9 31.1 180.4 30.2 191.9 34 200 38.7 190.6 39.1 168.9","63 165.1 61.3 168.5 61.7 190.6 66.4 199.6 70.6 191.9 68.9 179.6 66.8 170.2","70.6 160.4 72.3 168.5 75.7 179.1 76.6 192.8 74.5 196.6 72.3 193.6 70.6 179.6 68.1 168.1","28.5 195.7 30.2 195.7 33.6 201.7 30.6 220 28.5 213.6 26.8 198.3","69.8 195.7 71.9 195.7 73.6 198.3 71.9 213.2 70.2 219.6 67.2 202.1"]}};
const VIEW_ORDER=['front','back'];
function figure(view,I,x,o){
  let h='<g transform="translate('+x+' 0)"><g class="breath">',i=0;
  const V=BODY[view];
  for(const k in V){
    const pts=V[k].map(p=>'<polygon points="'+p+'"/>').join('');
    if(k[0]==='_'){h+='<g class="bb">'+pts+'</g>';continue;}
    let cls='m0',style='',tip=MUSC[k]||k;
    if(o.fills){const c=o.fills[k];if(c){cls='ml';style='fill:'+c+';color:'+c+';--d:'+(i++*45)+'ms';}}
    else if(o.levels){
      const L=o.levels[k];
      if(L!=null){const t=Math.min(6,Math.floor(L/3));cls='ml'+(L>=18?' elite':'');style='fill:'+TCOL[t]+';color:'+TCOL[t]+';--d:'+(i++*45)+'ms';tip+=': '+lvlName(Math.floor(L));}
      else tip+=': sin rango';
    }else{
      const v=I&&I[k]||0;
      if(v>0){cls='mh';style='fill-opacity:'+(.3+.7*Math.min(1,v)).toFixed(2)+';--d:'+(i++*45)+'ms';}
    }
    h+='<g class="'+cls+'" style="'+style+'"'+(o.tap?' data-a="muscle" data-v="'+k+'"':'')+'><title>'+esc(tip)+'</title>'+pts+'</g>';
  }
  h+='</g>';
  if(o.labels)h+='<text x="50" y="211">'+(view==='front'?'Frente':'Espalda')+'</text>';
  return h+'</g>';
}
function bodyMap(I,o){
  o=o||{};
  return '<svg class="bm'+(o.cls?' '+o.cls:'')+'" viewBox="0 0 210 '+(o.labels?216:200)+'" role="img" aria-label="Mapa de músculos">'+figure('front',I,0,o)+figure('back',I,110,o)+'</svg>';
}

/* ============ Insignias ============ */
/* Emblema facetado de liga: borde de metal del tier, cara oscura con un toque de su color,
   número romano en metal y adornos finos que aparecen a medida que subís (barra, rombo, filete). */
const MET_L=['#F0C29C','#F4F7FB','#FFE7A3','#C9FFF6','#D6EAFF','#EBDDFF','#FFD1DB'];
function badge(L,size){
  size=size||56;const h=Math.round(size*1.03);
  const wrap=(inner)=>'<svg class="badge" width="'+size+'" height="'+h+'" viewBox="0 0 64 66" aria-hidden="true">'+inner+'</svg>';
  const OUT='M32 2L59 11V37L32 64L5 37V11Z',IN='M32 8L53 15V35.5L32 56.5L11 35.5V15Z';
  if(L==null||L<0)return wrap('<path d="'+OUT+'" fill="var(--raise)" stroke="var(--mut)" stroke-width="1.6" stroke-dasharray="3 3"/><path d="M26 34h12" stroke="var(--mut)" stroke-width="2.4" stroke-linecap="round"/>');
  const t=Math.min(6,Math.floor(L/3)),m='url(#bm'+t+')';
  const num=L>=18?'<path d="M21 41l2.6-12 5.4 4.6L32 25l3 8.6 5.4-4.6L43 41z" fill="'+m+'" stroke="rgba(0,0,0,.35)" stroke-width=".8" stroke-linejoin="round"/>'
   :'<text x="32" y="42" text-anchor="middle" font-family="Archivo,system-ui,sans-serif" font-weight="800" font-size="'+(L%3===2?20:24)+'" letter-spacing=".5" fill="'+MET_L[t]+'" stroke="rgba(0,0,0,.55)" stroke-width="1.6" paint-order="stroke">'+['I','II','III'][L%3]+'</text>';
  return wrap('<path d="'+OUT+'" fill="'+m+'"/>'+
   '<path d="'+OUT+'" fill="none" stroke="rgba(0,0,0,.35)" stroke-width=".8"/>'+
   '<path d="'+IN+'" fill="#10131E"/><path d="'+IN+'" fill="'+TCOL[t]+'" opacity=".16"/>'+
   '<path d="M32 8L53 15V24L32 19L11 24V15Z" fill="#fff" opacity=".05"/>'+
   '<path d="'+IN+'" fill="none" stroke="'+m+'" stroke-width=".9" opacity=".8"/>'+
   (t>=2?'<rect x="25" y="45.5" width="14" height="1.4" rx=".7" fill="'+m+'" opacity=".9"/>':'')+
   (t>=3?'<path d="M32 11.5l2.4 3-2.4 3-2.4-3z" fill="'+m+'"/>':'')+
   (t>=5?'<path d="M14 18.5L18 17M50 18.5L46 17" stroke="'+m+'" stroke-width="1.1" stroke-linecap="round"/>':'')+
   (L>=18?'<path d="'+OUT+'" fill="none" stroke="'+m+'" stroke-width="1.2" transform="translate(32 33) scale(1.06) translate(-32 -33)" opacity=".55"/>':'')+num);
}
const lvlColor=L=>L==null||L<0?'var(--mut)':TCOL[Math.min(6,Math.floor(L/3))];
const lvlSpan=L=>'<span class="lvl-t" style="color:'+lvlColor(L)+'">'+lvlName(L)+'</span>';

/* ============ Gráfico de línea ============ */
/* gráfico de un ejercicio: récords marcados, línea del próximo rango y cambio en el período */
const EXR=[['1m','1 mes',30],['3m','3 meses',91],['6m','6 meses',182],['1a','1 año',365],['all','Todo',0]];
function exChart(ex,all,unit){
  if(!all.length)return '<p class="mut sm-t">Todavía no hay datos para graficar. Registrá una serie o cargá una marca.</p>';
  const rg=EXR.find(r=>r[0]===(S.exR||'all'))||EXR[4],from=rg[2]?Date.now()-rg[2]*864e5:0;
  let best=0;const pr=new Set();all.forEach((p,i)=>{if(p.y>best+1e-9){if(i)pr.add(p.t);best=p.y;}});
  const pts=all.filter(p=>p.t>=from),P=pts.length?pts:all.slice(-1);
  const W=320,H=170,pl=36,pr_=12,pt=12,pb=24,ys=P.map(p=>p.y);let lo=Math.min(...ys),hi=Math.max(...ys);
  /* línea del próximo rango si queda cerca */
  let tier=null;if(ex.st&&db.profile){const L=levelIdx(ex,best);const nx=L<0?0:Math.min(18,(Math.floor(L/3)+1)*3);if(L<18){const y=thr(ex,nx);if(y<=hi*1.35){tier={y,n:lvlName(nx),c:lvlColor(nx)};hi=Math.max(hi,y);}}}
  if(hi-lo<1){lo-=1;hi+=1;}const m=(hi-lo)*.15;lo-=m;hi+=m;
  const t0=P[0].t,t1=P[P.length-1].t,X=t=>pl+(t1===t0?(W-pl-pr_)/2:(t-t0)/(t1-t0)*(W-pl-pr_)),Y=y=>pt+(1-(y-lo)/(hi-lo))*(H-pt-pb);
  const line=P.map((p,i)=>(i?'L':'M')+X(p.t).toFixed(1)+' '+Y(p.y).toFixed(1)).join(' '),area=line+' L'+X(t1).toFixed(1)+' '+(H-pb)+' L'+X(t0).toFixed(1)+' '+(H-pb)+'Z';
  let g='';[lo+m,(lo+hi)/2,hi-m].forEach(v=>{g+='<line class="gl" x1="'+pl+'" x2="'+(W-pr_)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text x="'+(pl-5)+'" y="'+(Y(v)+3).toFixed(1)+'" text-anchor="end">'+Math.round(v)+'</text>';});
  if(tier)g+='<line x1="'+pl+'" x2="'+(W-pr_)+'" y1="'+Y(tier.y).toFixed(1)+'" y2="'+Y(tier.y).toFixed(1)+'" stroke="'+tier.c+'" stroke-width="1.5" stroke-dasharray="5 4" opacity=".8"/><text x="'+(W-pr_)+'" y="'+(Y(tier.y)-4).toFixed(1)+'" text-anchor="end" fill="'+tier.c+'" style="font-weight:700">'+tier.n+'</text>';
  const dots=P.map(p=>pr.has(p.t)?'<g class="pr-dot"><circle cx="'+X(p.t).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="6.5"/><path d="M'+(X(p.t)-3).toFixed(1)+' '+Y(p.y).toFixed(1)+'l2 2 4-4"/></g>':P.length<=30?'<circle cx="'+X(p.t).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="3.5"/>':'').join('');
  const bp=all.reduce((a,b)=>b.y>a.y?b:a,all[0]),ch=P.length>1&&P[0].y?Math.round((P[P.length-1].y/P[0].y-1)*100):null,fmt=v=>unit==='kg'?num(v,1)+' kg':Math.round(v)+' '+unit;
  return '<div class="exr">'+EXR.map(r=>'<button class="chip sm'+(rg[0]===r[0]?' on':'')+'" data-a="exRange" data-v="'+r[0]+'">'+r[1]+'</button>').join('')+'</div>'+
   '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Progreso en '+unit+'">'+g+(P.length>1?'<path class="ar" d="'+area+'"/>':'')+'<path class="ln" d="'+line+'"/>'+dots+
   '<text x="'+pl+'" y="'+(H-6)+'">'+shortDate(t0)+'</text>'+(P.length>1?'<text x="'+(W-pr_)+'" y="'+(H-6)+'" text-anchor="end">'+shortDate(t1)+'</text>':'')+'</svg>'+
   '<div class="ex-stats"><div><small>Récord</small><b>'+fmt(bp.y)+'</b><span>'+shortDate(bp.t)+'</span></div><div><small>En '+rg[1].toLowerCase()+'</small><b class="'+(ch>0?'up':'')+'">'+(ch==null?'—':(ch>0?'+':'')+ch+' %')+'</b><span>'+P.length+(P.length===1?' día':' días')+'</span></div><div><small>Récords</small><b>'+(pr.size+1)+'</b><span>'+ic('check',11)+' en el gráfico</span></div></div>';
}
function chart(pts,unit){
  if(!pts.length)return '<p class="mut sm-t">Todavía no hay datos para graficar.</p>';
  const W=320,H=150,pl=34,pr=12,pt=10,pb=24;
  const ys=pts.map(p=>p.y);let lo=Math.min.apply(null,ys),hi=Math.max.apply(null,ys);
  if(hi-lo<1){lo-=1;hi+=1;}
  const m=(hi-lo)*.15;lo-=m;hi+=m;
  const t0=pts[0].t,t1=pts[pts.length-1].t;
  const X=t=>pl+(t1===t0?(W-pl-pr)/2:(t-t0)/(t1-t0)*(W-pl-pr));
  const Y=y=>pt+(1-(y-lo)/(hi-lo))*(H-pt-pb);
  const line=pts.map((p,i)=>(i?'L':'M')+X(p.t).toFixed(1)+' '+Y(p.y).toFixed(1)).join(' ');
  const area=line+' L'+X(t1).toFixed(1)+' '+(H-pb)+' L'+X(t0).toFixed(1)+' '+(H-pb)+'Z';
  let g='';
  [lo+m,(lo+hi)/2,hi-m].forEach(v=>{g+='<line class="gl" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text x="'+(pl-5)+'" y="'+(Y(v)+3).toFixed(1)+'" text-anchor="end">'+Math.round(v)+'</text>';});
  const dots=pts.length<=24?pts.map(p=>'<circle cx="'+X(p.t).toFixed(1)+'" cy="'+Y(p.y).toFixed(1)+'" r="3.5"/>').join(''):'';
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Gráfico de progreso en '+unit+'">'+g+
   (pts.length>1?'<path class="ar" d="'+area+'"/>':'')+'<path class="ln" d="'+line+'"/>'+dots+
   '<text x="'+pl+'" y="'+(H-6)+'">'+shortDate(t0)+'</text>'+(pts.length>1?'<text x="'+(W-pr)+'" y="'+(H-6)+'" text-anchor="end">'+shortDate(t1)+'</text>':'')+'</svg>';
}

/* ============ Estado de interfaz ============ */
const $=s=>document.querySelector(s);
const S={tab:'inicio',etab:'rutinas',pf:null,rtab:'rut',calM:new Date(),calSel:today(),crM:new Date(),q:'',grp:'',modal:null,m2:null,picker:null,sessOpen:false,rest:null};
S.calM=new Date(S.calM.getFullYear(),S.calM.getMonth(),1);
S.crM=new Date(S.crM.getFullYear(),S.crM.getMonth(),1);
const TABS=[{id:'inicio',i:'home',l:'Inicio'},{id:'entrenar',i:'dumb',l:'Entrenar'},{id:'niveles',i:'rank',l:'Nivel'},{id:'nutri',i:'flame',l:'Nutrición'}];
const ETABS=[{id:'rutinas',l:'Rutinas'},{id:'cal',l:'Calendario'}];
/* las secciones viejas (hoy, rutinas, cal) ahora viven dentro de Entrenar */
function goTab(v){const t0=S.tab;if(v==='hoy')v='inicio';if(['rutinas','cal'].includes(v)){S.tab='entrenar';S.etab=v;}else S.tab=v;if(S.tab!=='perfil'&&S.pf){/* cambios del perfil sin guardar: quedan esperando y se avisa, no se pierden */if(pfDirty()){if(t0==='perfil')setTimeout(()=>toast('Tu perfil quedó con cambios sin guardar'),60);}else S.pf=null;}/* pestaña nueva: al cerrarse la ventana abierta no vuelve al scroll de la pestaña anterior */if(S.tab!==t0)S.lockY=0;}
let toastT=null;
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2800);}
function effTheme(){const t=document.documentElement.dataset.theme;if(t)return t;return window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
const ACCENTS=[['aurora','Aurora','#9B7BFF','#FF5FA2'],['fuego','Fuego','#FF7A45','#FF3D7A'],['oceano','Océano','#3FA0FF','#2FE0C8'],['lima','Lima','#A8E83A','#2FE0A0'],['oro','Oro','#F2C14E','#FF8A3D',1],['elite','Élite','#FF4F6A','#8F43EA',3]];
/* cuántos amigos tenés (se guarda para saberlo sin internet) */
const frCount=()=>S.social?S.social.friends.length:(db.settings.frCount||0);
function applyTheme(){const ac=db.settings.accent;if(ac&&ac!=='aurora')document.documentElement.dataset.accent=ac;else delete document.documentElement.dataset.accent;const t=db.settings.theme;if(t==='auto')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=t;const b=$('#themeBtn');if(b)b.innerHTML=ic(effTheme()==='dark'?'sun':'moon');}

/* ============ Piezas reutilizables ============ */
function miniMap(I){return '<div class="mini">'+bodyMap(I)+'</div>';}
function chipsMus(ex){return ex.p.map(k=>'<span class="chip on">'+MUSC[k]+'</span>').join('')+ex.s.map(k=>'<span class="chip">'+MUSC[k]+'</span>').join('');}
function exRow(ex,act,extra){
  const b=db.profile&&hasRank(ex)?bestE1(ex.id):null;
  const L=b?levelIdx(ex,b.e):null;
  return '<button class="ex" data-a="'+(act||'exInfo')+'" data-v="'+ex.id+'">'+miniMap(mapOf(ex))+
   '<span class="grow"><h4>'+esc(ex.n)+'</h4><span class="mut sm-t">'+esc(ex.eq)+' · '+esc(ex.sk?'Calistenia':groupOf(ex))+'</span></span>'+(extra||'')+
   (b?badge(L,40):'')+'</button>';
}
/* ilustración propia para las pantallas vacías: una barra que sube y baja */
function emptyArt(){return '<svg class="eart" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="eg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A66FF"/><stop offset="1" stop-color="#FF4F93"/></linearGradient></defs>'+
 '<ellipse cx="80" cy="82" rx="52" ry="5" fill="var(--raise)"/><g class="eb"><rect x="22" y="40" width="116" height="6" rx="3" fill="var(--mut)" opacity=".55"/>'+
 '<rect x="30" y="22" width="12" height="42" rx="4" fill="url(#eg)"/><rect x="18" y="30" width="9" height="26" rx="3" fill="url(#eg)" opacity=".8"/>'+
 '<rect x="118" y="22" width="12" height="42" rx="4" fill="url(#eg)"/><rect x="133" y="30" width="9" height="26" rx="3" fill="url(#eg)" opacity=".8"/></g>'+
 '<g class="esp" fill="#FF4F93"><circle cx="60" cy="14" r="2"/><circle cx="100" cy="10" r="1.6"/><circle cx="80" cy="6" r="1.3"/></g></svg>';}
function sheet(title,body,o){
  o=o||{};const layer=(o.l2?'l2':'')+(o.full?' full':'');
  return '<div class="mback '+layer+'" data-a="back" data-v="'+(o.l2?'m2':'modal')+'"><div class="msheet'+(o.full?' full':'')+'" role="dialog" aria-modal="true" aria-label="'+esc(title)+'">'+
   '<div class="mh-bar"><h3>'+esc(title)+'</h3>'+(o.noClose?'':'<button class="ib flat" data-a="close" data-v="'+(o.l2?'m2':'modal')+'" aria-label="Cerrar">'+ic('x')+'</button>')+'</div><div class="mbody">'+body+'</div></div></div>';
}

/* ============ Vista: Hoy ============ */
function viewHoy(){
  const p=db.profile,ov=overall(),t=today(),ws=weekStats(),st=streak();
  let h='<h1 class="pg">Hoy</h1>';
  /* hoy */
  const planned=plannedFor(t),done=doneOn(t);
  h+='<div class="card"><div class="hd"><h3>'+esc(longDate(t))+'</h3></div>';
  if(db.active){
    h+='<button class="btn pri wide" data-a="sessOpen">'+ic('timer')+' Continuar entrenamiento en curso</button>';
  }else{
    if(done.length)h+=done.map(l=>'<div class="rowline"><span><b>'+esc(l.name)+'</b><br><span class="mut sm-t">'+l.entries.reduce((s,e)=>s+e.sets.length,0)+' series, '+l.dur+' min</span></span><span style="color:var(--ok)">'+ic('check')+'</span></div>').join('');
    const pend=planned.filter(r=>!done.some(l=>l.routineId===r.id));
    if(pend.length)h+='<div class="gap" style="margin-top:'+(done.length?10:0)+'px">'+pend.map(r=>'<div class="row"><div class="grow"><b>'+esc(r.name)+'</b><br><span class="mut sm-t">'+r.items.length+' ejercicios</span></div><button class="btn pri sm" data-a="startR" data-v="'+r.id+'">'+ic('play',16)+' Empezar</button></div>').join('')+'</div>';
    else if(!done.length)h+='<p class="mut" style="margin-bottom:12px">No tenés nada planeado para hoy.</p>';
    h+='<div class="row" style="margin-top:12px"><button class="btn sm grow" data-a="startFree">Entrenamiento libre</button><button class="btn sm grow" data-a="tab" data-v="cal">Planificar</button></div>';
  }
  h+='</div>';
  const rd=recapData();if(rd.n)h+='<button class="recap-cta" data-a="recapOpen">'+ic('play',18)+'<span class="grow"><b>Tu semana pasada</b><br><span>'+rd.n+(rd.n===1?' entreno':' entrenos')+' · '+nf(rd.vol)+' kg movidos</span></span>'+ic('right',18)+'</button>';
  /* stats */
  const wsk=weekStreak();
  h+='<div class="card"><div class="g3"><div class="stat"><b data-n="'+wsk+'">'+wsk+'</b><span>'+(wsk===1?'semana cumplida':'semanas seguidas')+'</span></div><div class="stat"><b data-n="'+ws.sessions+'">'+ws.sessions+'</b><span>entrenos en 7 días</span></div><div class="stat"><b data-n="'+ws.sets+'">'+ws.sets+'</b><span>series en 7 días</span></div></div></div>';
  /* recuperación: qué está listo para entrenar */
  const top=Object.keys(ws.m).sort((a,b)=>ws.m[b]-ws.m[a]).slice(0,6);
  h+=recoveryCard().replace(/<\/div>$/,(top.length?'<div class="chips" style="margin-top:12px"><span class="mut sm-t" style="align-self:center">Series esta semana:</span>'+top.map(k=>'<span class="chip">'+MUSC[k]+' '+num(ws.m[k],1)+'</span>').join('')+'</div>':'')+'</div>');
  /* creatina y agua */
  const taken=!!db.creatine[t],wa=db.water[t]||0,wg=waterGoal();
  const late=db.settings.remind.on&&!taken&&(pad(new Date().getHours())+':'+pad(new Date().getMinutes()))>=db.settings.remind.time;
  h+='<div class="cols"><div class="card"><div class="hd"><h3>Creatina</h3>'+(taken?'<span class="tag" style="color:var(--ok)">Tomada hoy</span>':late?'<span class="tag" style="color:var(--bad)">Falta hoy</span>':'')+'</div>'+
   '<button class="btn '+(taken?'':'pri')+' wide" data-a="creaToggle" data-v="'+t+'">'+ic(taken?'x':'check',18)+' '+(taken?'Desmarcar hoy':'Marcar como tomada')+'</button></div>'+
   '<div class="card"><div class="hd"><h3>Agua</h3><span class="mut sm-t">'+wa+' de '+wg+' vasos</span></div><div class="bar" style="margin-bottom:12px"><i style="width:'+Math.min(100,Math.round(wa/wg*100))+'%"></i></div><div class="row"><button class="btn sm grow" data-a="water" data-v="-1" aria-label="Quitar un vaso">'+ic('minus',18)+'</button><button class="btn pri sm grow" data-a="water" data-v="1">'+ic('plus',18)+' Vaso</button></div></div></div>';
  return h;
}

/* ============ Vista: Rutinas y ejercicios ============ */
function routineCard(r){
  const days=(r.days||[]).slice().sort((a,b)=>((a+6)%7)-((b+6)%7)).map(d=>DIAS3[d]).join(' ');
  return '<div class="card"><div class="row top-a">'+miniMap(mapOfRoutine(r))+'<div class="grow"><h3>'+esc(r.name)+'</h3><p class="mut sm-t" style="margin:4px 0 8px">'+(r.gen?'<span class="tag" style="color:var(--acc)">A medida</span> ':'')+(r.pl?'<span class="tag pl-tag">Powerlifting · semana '+(plWeek(r)+1)+(plWeek(r)===4?' liviana':'')+'</span> ':'')+(blockWeek(r)?'<span class="tag'+(blockWeek(r).deload?' dl':'')+'">'+blockTxt(blockWeek(r))+'</span> ':'')+r.items.length+' ejercicios · ~'+routineMinutes(r)+' min'+(days?', cada '+days:'')+'</p>'+
   '<p class="sm-t mut">'+r.items.slice(0,4).map(i=>{const e=exById(i.ex);return e?esc(e.n):'';}).filter(Boolean).join(', ')+(r.items.length>4?'…':'')+'</p>'+(r.note?'<p class="rnote">'+ic('spark',13)+' '+esc(r.note)+'</p>':'')+'</div></div>'+
   '<div class="row" style="margin-top:14px"><button class="btn pri sm grow" data-a="startR" data-v="'+r.id+'">'+ic('play',16)+' Empezar</button><button class="btn sm grow" data-a="editR" data-v="'+r.id+'">'+ic('edit',16)+' Editar</button><button class="btn sm" data-a="shareR" data-v="'+r.id+'" aria-label="Compartir rutina">'+ic('share',16)+'</button></div></div>';
}
function viewRutinas(){
  let h='<h1 class="pg">Rutinas</h1><div class="seg" style="margin-bottom:16px"><button class="'+(S.rtab==='rut'?'on':'')+'" data-a="rtab" data-v="rut">Mis rutinas</button><button class="'+(S.rtab==='ej'?'on':'')+'" data-a="rtab" data-v="ej">Ejercicios</button></div>';
  if(S.rtab==='rut'){
    h+='<button class="gen-cta prog-cta" data-a="progsOpen"><span class="gen-ic">'+ic('trophy',22)+'</span><span class="grow"><b>Programas famosos</b><span>5×5, PPL, 5/3/1, GZCLP, Upper/Lower… listos para usar</span></span>'+ic('right',18)+'</button>';
    h+='<button class="gen-cta" data-a="genOpen"><span class="gen-ic">'+ic('bolt',22)+'</span><span class="grow"><b>Armame una rutina</b><span>Según tu deporte, tu objetivo y los días que tenés</span></span>'+ic('right',18)+'</button>'+
     '<button class="btn wide" data-a="newR" style="margin-bottom:14px">'+ic('plus',18)+' Nueva rutina desde cero</button>';
    if(db.routines.length)h+=db.routines.map(routineCard).join('');
    else h+='<div class="card empty">'+emptyArt()+'<b>Todavía no tenés rutinas</b>Creá una desde cero o empezá con una plantilla.</div>';
    h+='<h3 style="font:800 19px var(--f-d);margin:22px 0 10px">Plantillas</h3><div class="gap">'+TPL.map((t,i)=>'<div class="card row" style="margin:0"><div class="grow"><b>'+esc(t.name)+'</b><br><span class="mut sm-t">'+t.items.length+' ejercicios</span></div><button class="btn sm" data-a="addTpl" data-v="'+i+'">'+ic('plus',16)+' Agregar</button></div>').join('')+'</div>';
  }else{
    h+='<div class="field" style="margin-bottom:10px"><input id="exq" type="search" placeholder="Buscar ejercicio" value="'+esc(S.q)+'" data-i="q" aria-label="Buscar ejercicio"></div>'+
     '<div class="scroll-x" style="margin-bottom:12px">'+groupChips()+'</div><div class="exgrid" id="exres">'+exResults()+'</div>'+
     '<button class="btn wide" style="margin-top:14px" data-a="newEx">'+ic('plus',18)+' Crear ejercicio propio</button>';
  }
  return h;
}
const GROUP_TABS=()=>['Todos'].concat(Object.keys(GROUPS),'Calistenia','Deporte');
function groupChips(){return GROUP_TABS().map(g=>'<button class="chip '+((S.grp||'Todos')===g?'on':'')+'" data-a="grp" data-v="'+g+'">'+g+'</button>').join('');}
/* parecidos: mismos músculos principales, mismo movimiento, equipo que tenés, a tu alcance y sin cargar una lesión */
function patsOf(id){const s=new Set();Object.values(POOL).forEach(P=>Object.keys(P).forEach(k=>{if(P[k].includes(id))s.add(k);}));return s;}
function similarEx(id,ctx){
  const src=exById(id);if(!src)return[];ctx=ctx||{};
  const sp=patsOf(id),skip=new Set(ctx.skip||[]),BW=['Peso corporal','Barra fija','Paralelas','Anillas','Barra vertical','Cajón','Banda'];
  const okEq=e=>!ctx.eq||ctx.eq==='gym'||BW.includes(e.eq)||(ctx.eq==='dumb'&&/Mancuerna|Kettlebell/.test(e.eq));
  const ov=(a,b)=>a.filter(x=>b.includes(x)).length;
  return allEx().filter(e=>e.id!==id&&!e.hidden&&!skip.has(e.id)&&!!e.time===!!src.time&&okEq(e)&&!(ctx.inj&&ctx.inj.length&&injBad(e.id,'',ctx.inj)))
    .map(e=>{const pp=ov(src.p,e.p),ps=ov(src.p.concat(src.s),e.p.concat(e.s)),pt=[...patsOf(e.id)].some(k=>sp.has(k));
      let sc=pp*4+ps+(pt?3:0)+(groupOf(e)===groupOf(src)?1:0)+(e.eq===src.eq?.5:0);
      if(e.sk&&!canDo(e.id,ctx.lv||0))sc-=3;if(e.sport&&!src.sport)sc-=2;if(!!e.sk!==!!src.sk)sc-=1.5;if(bestE1(e.id))sc+=.6;
      return{e,sc,pp};}).filter(x=>x.pp>0&&x.sc>=5).sort((a,b)=>b.sc-a.sc).slice(0,6).map(x=>x.e);
}
function filterEx(q,g){
  q=fnorm(q).trim();
  const CAL_EQ=['Peso corporal','Barra fija','Paralelas','Anillas','Barra vertical'];
  const inG=e=>!g||g==='Todos'||(g==='Calistenia'?!!e.sk||CAL_EQ.includes(e.eq)&&!e.sport:g==='Deporte'?!!e.sport:groupOf(e)===g);
  return allEx().filter(e=>!e.hidden&&inG(e)&&(!q||fnorm(e.n).includes(q)||fnorm(e.eq).includes(q)||e.p.concat(e.s).some(k=>fnorm(MUSC[k]).includes(q))));
}
function exResults(){const l=filterEx(S.q,S.grp);return l.length?l.map(e=>exRow(e)).join(''):'<div class="empty">Ningún ejercicio coincide con la búsqueda.</div>';}

/* ============ Vista: Calendario ============ */
function monthGrid(m,cell){
  const y=m.getFullYear(),mo=m.getMonth(),off=(new Date(y,mo,1).getDay()+6)%7,n=new Date(y,mo+1,0).getDate();
  let h='<div class="mgrid">'+['L','M','M','J','V','S','D'].map(d=>'<span class="dow">'+d+'</span>').join('');
  for(let i=0;i<off;i++)h+='<span></span>';
  for(let d=1;d<=n;d++)h+=cell(dkey(new Date(y,mo,d)),d);
  return h+'</div>';
}
const monthNav=(m,act)=>'<div class="mnav"><button class="ib" data-a="'+act+'" data-v="-1" aria-label="Mes anterior">'+ic('left')+'</button><b>'+MESES[m.getMonth()]+' '+m.getFullYear()+'</b><button class="ib" data-a="'+act+'" data-v="1" aria-label="Mes siguiente">'+ic('right')+'</button></div>';
function viewCal(){
  const t=today();
  let h='<h1 class="pg">Calendario</h1><div class="card">'+monthNav(S.calM,'calMove')+
   monthGrid(S.calM,(dk,d)=>{
     const done=doneOn(dk).length,plan=plannedFor(dk).length,cr=db.creatine[dk];
     return '<button class="day'+(dk===S.calSel?' sel':'')+(dk===t?' td':'')+'" data-a="calSel" data-v="'+dk+'" aria-label="'+esc(longDate(dk))+'">'+d+'<span class="dots">'+(done?'<u class="dot done"></u>':plan?'<u class="dot plan"></u>':'')+(cr?'<u class="dot cr"></u>':'')+'</span></button>';
   })+
   '<div class="legend" style="gap:14px;flex-wrap:wrap"><span class="row" style="gap:6px"><u class="dot done"></u>Entrenado</span><span class="row" style="gap:6px"><u class="dot plan"></u>Planeado</span><span class="row" style="gap:6px"><u class="dot cr"></u>Creatina</span></div></div>';
  return h+dayPanel(S.calSel);
}
function dayPanel(dk){
  const done=doneOn(dk),pl=plannedFor(dk),fut=dk>today();
  let h='<div class="card"><div class="hd"><h3 style="text-transform:capitalize">'+esc(longDate(dk))+'</h3></div>';
  if(done.length){
    h+=done.map(l=>'<div style="margin-bottom:12px"><div class="row"><b class="grow">'+esc(l.name)+'</b><span class="tag">'+l.dur+' min</span><button class="ib flat" data-a="editLog" data-v="'+l.id+'" aria-label="Editar entrenamiento">'+ic('edit',18)+'</button><button class="ib flat" data-a="delLog" data-v="'+l.id+'" aria-label="Borrar entrenamiento">'+ic('trash',18)+'</button></div>'+
      (l.note?'<p class="mut sm-t" style="margin:4px 0 2px">'+esc(l.note)+'</p>':'')+
      l.entries.map(en=>{const ex=exById(en.ex);return ex?'<div class="rowline"><span>'+esc(ex.n)+(en.note?'<br><span class="mut sm-t">'+esc(en.note)+'</span>':'')+'</span><span class="mut" style="text-align:right">'+en.sets.map(s=>setTxt(ex,s)).join(', ')+'</span></div>':'';}).join('')+'</div>').join('');
  }
  const pend=pl.filter(r=>!done.some(l=>l.routineId===r.id));
  if(pend.length)h+=pend.map(r=>{const fixed=!(db.plan[dk]||[]).includes(r.id);return '<div class="row" style="margin-bottom:10px"><div class="grow"><b>'+esc(r.name)+'</b><br><span class="mut sm-t">'+(fixed?'Se repite cada semana':'Planeada para este día')+'</span></div>'+(fixed?'':'<button class="ib flat" data-a="unplan" data-v="'+r.id+'" aria-label="Quitar del día">'+ic('x',18)+'</button>')+(fut?'':'<button class="btn pri sm" data-a="startR" data-v="'+r.id+'" data-d="'+dk+'" aria-label="Empezar '+esc(r.name)+'">'+ic('play',16)+'</button>')+'</div>';}).join('');
  if(!done.length&&!pend.length)h+='<p class="mut" style="margin-bottom:12px">Día libre. Podés agregarle una rutina.</p>';
  if(db.routines.length)h+='<div class="row" style="margin-top:4px"><div class="field grow" style="margin:0"><select id="addRt" aria-label="Rutina para este día">'+db.routines.map(r=>'<option value="'+r.id+'">'+esc(r.name)+'</option>').join('')+'</select></div><button class="btn sm" data-a="plan" data-v="'+dk+'">'+ic('plus',16)+' Agregar</button></div>';
  else h+='<button class="btn sm wide" data-a="newR">Crear mi primera rutina</button>';
  h+='<div class="row" style="margin-top:10px">'+(fut?'':'<button class="btn sm grow" data-a="startFree" data-d="'+dk+'">Entrenamiento libre</button>')+'<button class="btn sm grow '+(db.creatine[dk]?'pri':'')+'" data-a="creaToggle" data-v="'+dk+'">'+ic('check',16)+' Creatina</button></div></div>';
  return h;
}

/* ============ Mi semana: deportes, prácticas, partidos y gym ============
   profile.sports = ['rugby', ...]
   profile.week[dow] = {act:'prac:rugby' | 'match:rugby' | '', gym:'' | 'solo' | 'ask' | 'antes' | 'despues'}
   ('ask' = entrena ese día pero falta decir si antes o después del deporte) · profile.trains = 1 ya entrena / 0 todavía no */
const ACT_T={prac:'Práctica',match:'Partido'};
function dayInfo(dow){
  const w=(db.profile&&db.profile.week||{})[dow]||{},a=w.act?w.act.split(':'):null;
  return{type:a?a[0]:null,sport:a?a[1]:null,gym:w.gym||''};
}
const actName=di=>di.type?ACT_T[di.type]+' de '+(SPORTS[di.sport]?SPORTS[di.sport].n.toLowerCase():''):'';
function weekGymDays(){return [1,2,3,4,5,6,0].filter(d=>dayInfo(d).gym);}
function weekEditor(){
  const p=db.profile||{},sp=p.sports||[],gd=weekGymDays(),tr=p.trains!=null?+p.trains:(gd.length?1:null);
  let h='<div class="field"><span>¿Hacés algún deporte?</span><div class="ptiles">'+Object.keys(SPORTS).map(k=>photoTile(k,SPORTS[k].n,SPORTS[k].i,sp.includes(k),'sportTog',k)).join('')+'</div></div>';
  if(sp.length){
    h+='<div class="field"><span>¿Cuándo practicás o jugás?</span></div><div class="week">';
    [1,2,3,4,5,6,0].forEach(d=>{
      const di=dayInfo(d),acts=[['','Nada']].concat(...sp.map(k=>[['prac:'+k,'Práctica '+SPORTS[k].n.toLowerCase()],['match:'+k,'Partido '+SPORTS[k].n.toLowerCase()]]));
      const cur=di.type?di.type+':'+di.sport:'';
      h+='<div class="wday'+(di.type==='match'?' match':di.type?' prac':'')+'"><b>'+DIAS3[d]+'</b><div class="wcol"><div class="chips">'+acts.map(a=>'<button class="chip sm '+(cur===a[0]?'on':'')+'" data-a="weekAct" data-v="'+d+'|'+a[0]+'">'+a[1]+'</button>').join('')+'</div></div></div>';
    });
    h+='</div>';
  }
  h+='<div class="field"><span>¿Ya entrenás?</span><div class="seg"><button class="'+(tr===1?'on':'')+'" data-a="weekTrains" data-v="1">Sí, ya entreno</button><button class="'+(tr===0?'on':'')+'" data-a="weekTrains" data-v="0">Todavía no</button></div></div>';
  if(tr!=null){
    h+='<div class="field"><span>'+(tr?'¿Qué días entrenás?':'¿Qué días querés entrenar?')+'</span><p class="mut sm-t" style="font-weight:500">'+
     (tr?'Marcá los días que ya entrenás. Tus rutinas se arman sobre esos días.':'Elegí los días que te quedan cómodos. Para arrancar, 3 días con uno de descanso entre medio va perfecto.')+'</p>'+
     '<div class="wdays">'+[1,2,3,4,5,6,0].map(d=>{const di=dayInfo(d);return '<button class="wdb'+(di.gym?' on':'')+(di.type?' has':'')+'" data-a="weekDay" data-v="'+d+'" aria-pressed="'+!!di.gym+'"><b>'+DIAS3[d]+'</b>'+(di.type?'<small>'+(di.type==='match'?'Partido':'Práctica')+'</small>':'')+'</button>';}).join('')+'</div></div>';
    const qs=gd.filter(d=>dayInfo(d).type);
    if(qs.length)h+='<div class="gap" style="margin-bottom:12px">'+qs.map(d=>{const di=dayInfo(d);
      return '<div class="wq'+(di.gym==='ask'?' need':'')+'"><span>El <b>'+DIAS[d]+'</b> tenés '+esc(actName(di).toLowerCase())+'. ¿Entrenás antes o después?</span><div class="seg">'+
       [['antes','Antes'],['despues','Después']].map(g=>'<button class="'+(di.gym===g[0]?'on':'')+'" data-a="weekGym" data-v="'+d+'|'+g[0]+'">'+g[1]+'</button>').join('')+'</div></div>';}).join('')+'</div>';
  }
  return h;
}
/* días de entreno que caen con deporte y todavía no dijiste si van antes o después */
const weekPend=()=>weekGymDays().filter(x=>dayInfo(x).gym==='ask');
const weekPendMsg=()=>{const p=weekPend();return p.length?'Decime si el '+DIAS[p[0]]+' entrenás antes o después de '+(dayInfo(p[0]).type==='match'?'jugar':'la práctica'):'';};

/* ============ Nutrición con actividad real ============ */
/* sesiones por semana: gym según lo que registrás (o tu semana) + prácticas + partidos (cuentan más) */
function weeklyLoad(){
  const from=addDays(today(),-27),gymLogged=db.logs.filter(l=>l.date>=from).length/4;
  const gymWeek=weekGymDays().length;
  let prac=0,match=0;[0,1,2,3,4,5,6].forEach(d=>{const di=dayInfo(d);if(di.type==='prac')prac++;if(di.type==='match')match++;});
  const gym=Math.max(gymLogged,gymWeek);
  return{gym,prac,match,total:gym+prac+match*1.5};
}
function actFactor(p){
  if(p.activity!=='auto'&&p.activity!=null&&ACT[p.activity])return{f:ACT[p.activity].f,auto:false};
  const t=weeklyLoad().total;
  return{f:t<1.5?1.2:t<3.5?1.375:t<5.5?1.55:t<7.5?1.725:1.9,auto:true};
}
/* Ajuste por tu peso: si tenés 2+ semanas de pesos, compara cuánto cambiaste con lo que buscás y corrige.
   (Asume que comiste más o menos lo que te recomienda la app.) */
function weightTrend(){
  const from=addDays(today(),-28),pts=db.weights.filter(w=>w.date>=from).map(w=>({x:parseK(w.date).getTime()/864e5,y:+w.kg})).sort((a,b)=>a.x-b.x);
  if(pts.length<4||pts[pts.length-1].x-pts[0].x<14)return null;
  const n=pts.length,mx=pts.reduce((s,p)=>s+p.x,0)/n,my=pts.reduce((s,p)=>s+p.y,0)/n;
  const slope=pts.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0)/pts.reduce((s,p)=>s+(p.x-mx)**2,0);
  return{perWeek:slope*7,days:Math.round(pts[n-1].x-pts[0].x),n};
}
function adaptAdj(p){
  const tr=weightTrend();if(!tr)return null;
  const target=p.weight*{bulk:.0025,recomp:0,cut:p.age<18?-.003:-.006}[p.goal];
  const diff=tr.perWeek-target;
  return{kcal:Math.round(clamp(-diff*7700/7,-300,300)/10)*10,trend:tr,target};
}

/* ============ Generador de rutinas ============
   Arma la semana según deporte, objetivo, días, equipo y nivel.
   Cada día es una lista de "patrones" (empuje horizontal, bisagra de cadera...) y cada patrón
   elige un ejercicio de su lista según el equipo que tenés y tu nivel. */
const SPORTS={
  futbol:{n:'Fútbol',i:'ball',add:['hcurl','adductor','plyo','lunge']},
  rugby:{n:'Rugby',i:'rugby',add:['neck','power','carry','plyo']},
  basquet:{n:'Básquet',i:'basket',add:['plyo','calf','lunge','core']},
  tenis:{n:'Tenis o pádel',i:'racket',add:['rot','rear','forearm','lunge']},
  natacion:{n:'Natación',i:'swim',add:['vpull','rear','core','lateral']},
  running:{n:'Running',i:'run',add:['lunge','calf','hcurl','core']},
  combate:{n:'Boxeo o artes marciales',i:'glove',add:['neck','rot','power','core']},
  hockey:{n:'Hockey',i:'hockey',add:['lunge','adductor','rot','plyo']},
  voley:{n:'Vóley',i:'volley',add:['plyo','calf','rear','core']},
  ciclismo:{n:'Ciclismo',i:'bike',add:['hinge','lunge','core','lumbar']}
};
/* ============ Generador de rutinas (basado en la evidencia) ============
   Lo que usa, en criollo:
   - Hipertrofia: crecés con rangos amplios (≈6 a 30 reps) si llegás cerca del fallo; lo que más pesa es el VOLUMEN:
     ~10 a 20 series efectivas por músculo por semana, repartidas en 2 o más días (Schoenfeld y col., 2016-2017).
   - Fallo: no hace falta llegar al fallo; quedarse a 1-3 repeticiones da resultados parecidos con menos fatiga (Grgic y col., 2022; Refalo y col., 2022).
   - Descanso: más de 60 s entre series ayuda a crecer; en los básicos pesados, 2-3 min (Singer y col., 2024).
   - Fuerza: pocas repeticiones (≈3-6) con carga alta en los básicos.
   - Menores: el entrenamiento de fuerza bien hecho y supervisado es seguro y no frena el crecimiento (NSCA 2009; consenso 2014),
     pero priorizamos técnica y evitamos máximos.
   - Articulaciones: cargar progresivamente no daña el cartílago; lo que lastima son los saltos bruscos de carga. Por eso el
     calentamiento automático y subir de a poco. */
const GEN_GOALS={hip:{n:'Ganar músculo',i:'muscle',rest:120},fuerza:{n:'Ganar fuerza',i:'dumb',rest:180},dep:{n:'Rendir en mi deporte',i:'trophy',rest:120},
  cali:{n:'Calistenia',i:'acro',rest:120},pl:{n:'Powerlifting',i:'weight',rest:180},grasa:{n:'Bajar grasa',i:'flame',rest:75},salud:{n:'Estar en forma',i:'heart',rest:90}};
const GEN_EQ={gym:'Gimnasio completo',dumb:'Mancuernas en casa',bw:'Sin equipo (barra fija y piso)'};
const GEN_LVL={beg:'Principiante',int:'Intermedio',adv:'Avanzado'};
/* lesiones o molestias: patrones, músculos principales y ejercicios puntuales que cargan esa zona */
const INJ={hom:{n:'Hombro',pat:['vpush','lateral','fly'],m:['hombros'],ids:['dips','benchdip','ringdip','bench','incbench','muscleup','skull','pikepush','wallhs','freehs','hspu','freehspu','pppush','pllean','tuckpl','advpl','straddlepl','fullpl','planchepush','skincat','tuckbl','advbl','straddlebl','fullbl','russiandip','impdip']},
  cod:{n:'Codo',pat:['triceps','biceps'],m:[],ids:['dips','benchdip','ringdip','diamond','muscleup','archerpush','oapush','archerpull']},
  mun:{n:'Muñeca',pat:['forearm'],m:['antebrazos'],ids:['pushup','kneepush','diamond','archerpush','oapush','pppush','hspu','freehspu','benchdip','frontsquat','pikepush','wallhs','freehs','crow','pllean','tuckpl','advpl','straddlepl','fullpl','planchepush']},
  lum:{n:'Espalda baja',pat:['hinge','lumbar','power','rot'],m:['lumbar'],ids:['squat','frontsquat','row','ohp','medslam']},
  cad:{n:'Cadera',pat:['hinge','lunge','adductor'],m:['aductores'],ids:['squat','frontsquat','pistol','dragon','shrimp']},
  rod:{n:'Rodilla',pat:['squat','lunge','ext','plyo'],m:['cuadriceps'],ids:[]},
  tob:{n:'Tobillo',pat:['calf','plyo'],m:['gemelos'],ids:['jumpsquat','lunge','bulgarian','pistol','dragon','shrimp']},
  cue:{n:'Cuello',pat:['neck'],m:[],ids:['shrug','ohp','hspu','freehspu','wallhs','freehs']}};
function injBad(id,pt,inj){const ex=exById(id);return(inj||[]).some(k=>{const I=INJ[k];return I&&(I.pat.includes(pt)||I.ids.includes(id)||(ex&&ex.p||[]).some(m=>I.m.includes(m)));});}
/* el objetivo que manda en series y repeticiones (calistenia se suma como bloque de habilidades) */
const primGoal=gs=>gs.find(g=>g!=='cali')||'hip';
const POOL={
  gym:{squat:['legpress','squat','frontsquat'],hinge:['rdl','hipthrust','deadlift'],hpush:['dbpress','bench','incbench'],vpush:['dbohp','ohp'],
    hpull:['cablerow','dbrow','row'],vpull:['latpull','pullup','lpullup'],lunge:['lunge','bulgarian'],hcurl:['legcurl','nordic'],calf:['calf','seatedcalf'],
    core:['plank','legraise','pallof'],rot:['pallof','russian','medslam'],biceps:['dbcurl','curl','hammer'],triceps:['pushdown','skull','dips'],
    lateral:['lateral'],rear:['facepull'],plyo:['jumpsquat','boxjump'],power:['kbswing','medslam'],carry:['farmer'],neck:['neckiso','shrug'],
    adductor:['copenhagen'],forearm:['wrist','hammer'],lumbar:['hyper'],ext:['legext'],fly:['cablefly','dbfly']},
  dumb:{squat:['airsquat','bulgarian','pistol'],hinge:['kbswing','nordic'],hpush:['pushup','dbpress','archerpush'],vpush:['dbohp','pppush'],
    hpull:['dbrow'],vpull:['austrow','pullup'],lunge:['lunge','bulgarian'],hcurl:['nordic'],calf:['calf'],core:['plank','legraise','crunch'],
    rot:['russian'],biceps:['dbcurl','hammer'],triceps:['diamond','benchdip'],lateral:['lateral'],rear:['dbrow','austrow','lateral'],plyo:['jumpsquat'],
    power:['kbswing'],carry:['farmer'],neck:['neckiso'],adductor:['copenhagen'],forearm:['hammer','farmer'],lumbar:['nordic'],ext:['airsquat'],fly:['dbfly']},
  bw:{squat:['airsquat','shrimp','pistol','dragon'],hinge:['nordic','jumpsquat'],hpush:['kneepush','pushup','diamond','archerpush','oapush'],
    vpush:['pushup','pppush','hspu','freehspu'],hpull:['austrow'],vpull:['austrow','pullup','archerpull','muscleup'],lunge:['airsquat','shrimp','pistol'],
    hcurl:['nordic'],calf:['jumpsquat'],core:['plank','legraise','tucklsit','lsit'],rot:['russian'],biceps:['austrow'],triceps:['benchdip','dips','diamond'],
    lateral:['pppush'],rear:['austrow'],plyo:['jumpsquat'],power:['jumpsquat'],carry:['plank'],neck:['neckiso'],adductor:['copenhagen'],
    forearm:['legraise'],lumbar:['nordic'],ext:['airsquat'],fly:['archerpush']}
};
const DAYT={
  fullA:{n:'Cuerpo completo A',p:['squat','hpush','hpull','hinge','core']},
  fullB:{n:'Cuerpo completo B',p:['hinge','vpush','vpull','lunge','core']},
  fullC:{n:'Cuerpo completo C',p:['squat','hpush','vpull','hcurl','rot']},
  upA:{n:'Torso A',p:['hpush','hpull','vpush','vpull','biceps','triceps']},
  upB:{n:'Torso B',p:['vpush','vpull','hpush','hpull','lateral','rear']},
  lowA:{n:'Piernas A',p:['squat','hinge','lunge','hcurl','calf','core'],low:1},
  lowB:{n:'Piernas B',p:['hinge','squat','lunge','ext','calf','rot'],low:1},
  push:{n:'Empuje',p:['hpush','vpush','fly','lateral','triceps']},
  pull:{n:'Tirón',p:['vpull','hpull','rear','biceps','forearm']},
  legs:{n:'Piernas',p:['squat','hinge','lunge','hcurl','calf'],low:1},
  skPush:{n:'Calistenia: empuje y vertical',p:['hpush','vpush','triceps','core']},
  skPull:{n:'Calistenia: tirón y palancas',p:['vpull','hpull','core','rot']},
  skLegs:{n:'Calistenia: piernas y core',p:['squat','lunge','hcurl','core'],low:1}
};
function genSplit(n,gs,lvl){
  const prim=primGoal(gs),onlyCali=gs.includes('cali');
  if(onlyCali)return['skPush','skPull','skLegs','skPush','skPull','skLegs'].slice(0,n);
  if(n<=2)return['fullA','fullB'];
  if(n===3)return lvl==='beg'||prim==='dep'||prim==='grasa'||prim==='salud'?['fullA','fullB','fullC']:['upA','lowA','fullC'];
  if(n===4)return['upA','lowA','upB','lowB'];
  if(n===5)return['upA','lowA','push','pull','legs'];
  return['push','pull','legs','push','pull','legs'];
}
/* series × repeticiones según la evidencia */
function genDose(ex,gs,lvl,pat,first,age){
  const prim=primGoal(gs),big=['squat','hinge','hpush','vpush','hpull','vpull'].includes(pat)&&first;
  if(ex.time){const s={plank:40,lsit:20,tucklsit:20,copenhagen:25,farmer:40,neckiso:20}[ex.id]||(ex.sk?15:30);const bt=ex.sk?effBest(ex.id):0;return[ex.sk?4:3,bt>0?Math.max(5,Math.min(Math.round(s*1.5),Math.round(bt*.7))):lvl==='adv'?Math.round(s*1.5):s];}
  if(pat==='plyo'||pat==='power')return[3,ex.id==='kbswing'?12:5];
  if(ex.sk){const bt=effBest(ex.id),base=lvl==='beg'?5:lvl==='int'?6:8;return[4,bt>0?Math.max(1,Math.min(15,Math.round(bt*.75))):Math.max(2,Math.min(base,Math.round((ex.sk.t||10)*.5)))];}
  const both=gs.includes('hip')&&gs.includes('fuerza');
  const t=both?(big?[4,6]:[3,10]):({hip:big?[3,8]:[3,12],fuerza:big?[4,5]:[3,8],dep:big?[3,5]:[3,10],grasa:big?[3,10]:[3,15],salud:big?[3,8]:[3,12]}[prim]||[3,10]);
  let s=t[0],r=t[1];
  if(age<18&&r<6){r=6;s=Math.min(s,4);}
  if(age<16&&r<8)r=8;
  return[s,r];
}
/* reparte los días de gym evitando los días de deporte y las piernas el día antes de jugar */
function genDays(n,sport){
  const pref={2:[1,4],3:[1,3,5],4:[1,2,4,5],5:[1,2,3,5,6],6:[1,2,3,4,5,6]}[Math.min(6,Math.max(2,n))];
  const order=[1,2,3,4,5,6,0],out=[];
  pref.forEach(d=>{
    if(!sport.includes(d)&&!out.includes(d)){out.push(d);return;}
    const i=order.indexOf(d);
    for(let k=1;k<7;k++){for(const j of[i+k,i-k]){const c=order[(j+7)%7];if(!sport.includes(c)&&!out.includes(c)){out.push(c);return;}}}
    if(!out.includes(d))out.push(d);
  });
  return out.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
}
/* bloque de calistenia: una habilidad al principio de los días de torso, de la variante que te toca */
const SK_ROT=['hs','pull','lsit','push','fl','dip','pl','bl'];
/* ¿este ejercicio está a tu alcance? Las habilidades del árbol solo si ya las hacés o son la que te toca */
/* lv: lo que dijiste que sos (principiante 0, intermedio 1, avanzado 2) habilita los primeros escalones de cada rama aunque no tengas marcas */
function canDo(id,lv){const f=findNode(id);if(!f)return true;if(f.i<=(lv||0)&&!(XREQ[id]||[]).length)return true;const s=nodeState(f.b,f.i);return s.done||s.avail||s.best>0;}
const doable=(list,lv)=>{const l=list.filter(x=>canDo(x,lv));return l;};
/* variantes del árbol: nunca una más fácil que la que ya dominás ni más de un escalón por encima */
function genPick(list,lv,b,rot){
  const nd=list.map(findNode);
  if(!nd.some(Boolean))return list[(b+rot)%list.length]||list[0];
  let fl=-1;nd.forEach((f,i)=>{if(f&&(nodeDone(f.b,f.i)||effBest(list[i])>=3||(f.i<=lv&&!(XREQ[list[i]]||[]).length)))fl=i;});
  let ahead=0;const c=list.filter((x,i)=>!nd[i]||(i>=fl&&(i<=fl||ahead++<1)));
  return c[rot%c.length]||list[0];
}
/* la variante que te toca de una rama del árbol */
function skillOf(fam){const br=branches().find(b=>b.f===fam);if(!br||!br.nodes.length)return null;const st=br.nodes.map((_,k)=>nodeState(br,k));let k=st.findIndex(s=>s.avail);if(k<0)k=st.map(s=>s.done).lastIndexOf(true);return br.nodes[Math.max(0,k)].ex;}
const SK_LBL={push:'Flexiones',pull:'Dominadas y muscle-up',dip:'Fondos',legs:'Pistol',lsit:'L-sit',hs:'Parada de manos',fl:'Front lever',bl:'Back lever',pl:'Planche',flag:'Bandera'};
/* objetivos guardados: antes "calistenia" junto a otro objetivo significaba sumar habilidades; ahora eso va en skills */
function genGoals0(){const g=db.settings.gen||{},gs=(g.goals&&g.goals.length?g.goals:['hip']).slice();
  if(!g.v2&&gs.includes('cali')&&gs.length>1)return gs.filter(x=>x!=='cali');return gs;}
function genSkills0(){const g=db.settings.gen||{};if(g.skills)return g.skills.slice();return !g.v2&&g.goals&&g.goals.includes('cali')&&g.goals.length>1?['hs','pull','pl']:[];}
function skillFor(i,lvl){
  const fam=SK_ROT[i%SK_ROT.length],br=branches().find(b=>b.f===fam);
  if(br){const st=br.nodes.map((_,k)=>nodeState(br,k));let k=st.findIndex(s=>s.avail);if(k<0)k=st.map(s=>s.done).lastIndexOf(true);return k<0?null:br.nodes[k].ex;}
  return skillForOld(i,lvl);
}
function skillForOld(i,lvl){
  const f=SK_ROT[i%SK_ROT.length],vs=skFam(f);if(!vs.length)return null;
  let cur=-1;vs.forEach((e,k)=>{if(bestE1(e.id))cur=k;});
  const base={beg:0,int:1,adv:2}[lvl];
  return vs[Math.min(vs.length-1,cur>=0?cur+1:base)];
}
/* series semanales por grupo: el principal cuenta 1, el secundario 0,5 */
function weekVolume(plan){
  const v={};Object.keys(GROUPS).forEach(g=>v[g]=0);
  const gOf=k=>Object.keys(GROUPS).find(g=>GROUPS[g].includes(k));
  plan.forEach(r=>r.items.forEach(it=>{const ex=exById(it.ex);if(!ex)return;const seen=new Set();
    ex.p.forEach(k=>{const g=gOf(k);if(g&&!seen.has(g)){v[g]+=it.sets;seen.add(g);}});
    ex.s.forEach(k=>{const g=gOf(k);if(g&&!seen.has(g)){v[g]+=it.sets*.5;seen.add(g);}});}));
  return v;
}
const volTarget=gs=>gs.includes('hip')?[10,20]:[6,18];
/* rango por grupo: piernas son 4 músculos, espalda y brazos 2 o 3 */
const VOLX={Piernas:1.6,Espalda:1.3,Brazos:1.3,Pecho:1,Hombros:1,Core:1};
const volRange=(g,gs)=>volTarget(gs).map(x=>Math.round(x*VOLX[g]));
function genPlan(d){
  if((d.goals||[]).includes('pl'))return plPlan(d);
  const p=db.profile||{},age=p.age||25,eq=d.eq||'gym',lvl=d.lvl||'beg',gs=(d.goals&&d.goals.length?d.goals:['hip']),prim=primGoal(gs);
  const onlyCali=gs.includes('cali'),skills=(d.skills||[]).filter(f=>TREE.some(b=>b.f===f)),mins=+d.min||0;
  const pool=POOL[onlyCali?'bw':eq]||POOL.gym;
  const lvlI={beg:0,int:1,adv:2}[lvl],inj=(d.inj||[]).filter(k=>INJ[k]),bad=(id,pt)=>injBad(id,pt,inj);
  const wk=weekGymDays(),actDays=[0,1,2,3,4,5,6].filter(x=>dayInfo(x).type);
  const days=wk.length?wk:genDays(+d.days||3,actDays),n=days.length;
  const split=genSplit(Math.max(2,n),gs,lvl).slice(0,n);
  const legScore=x=>{const di=dayInfo(x),nx=dayInfo((x+1)%7),pv=dayInfo((x+6)%7);let s=0;
    if(nx.type==='match')s-=10;if(di.type==='match')s-=12;if(pv.type==='match')s-=6;if(di.type==='prac')s-=di.gym==='despues'?6:3;if(nx.type==='prac')s-=2;return s;};
  const ord=days.slice().sort((a,b)=>legScore(b)-legScore(a));
  const lows=split.filter(t=>DAYT[t].low),ups=split.filter(t=>!DAYT[t].low);
  const slots=[];lows.forEach((t,i)=>slots.push({t,day:ord[i]}));ups.forEach((t,i)=>slots.push({t,day:ord[lows.length+i]}));
  const sportsL=(d.sports||[]),extra=[].concat(...sportsL.map(k=>SPORTS[k].add));
  const sportName=sportsL.map(k=>SPORTS[k].n).join(' + ');
  const skC=[0,0];
  const plan=slots.sort((a,b)=>((a.day+6)%7)-((b.day+6)%7)).map((s,di,arr)=>{
    const T=DAYT[s.t],used=new Set(),items=[],dinfo=dayInfo(s.day),next=dayInfo((s.day+1)%7),notes=[];
    const after=dinfo.type&&dinfo.gym==='despues',before=dinfo.type&&dinfo.gym==='antes';
    const rep=arr.slice(0,di).filter(z=>z.t===s.t).length;
    /* habilidades que elegiste: arrancan el día, frescas. Cuántas, según el tiempo que tenés */
    const fams=T.low?skills.filter(f=>f==='legs'||f==='lsit'):skills.filter(f=>f!=='legs'),ci=T.low?1:0;
    const nSkMax=!fams.length?0:(mins&&mins<45)||after?1:(fams.length>1&&(!mins||mins>=70)?2:1);let nSk=0;
    for(let k=0;k<fams.length&&nSk<nSkMax;k++){const sk=skillOf(fams[(skC[ci]++)%fams.length]);
      if(sk&&!used.has(sk.id)&&!bad(sk.id,'skill')){used.add(sk.id);const ds=genDose(sk,gs,lvl,'skill',false,age);items.push({ex:sk.id,sets:ds[0],reps:ds[1],skill:1});nSk++;}}
    const pats=T.p.slice();
    for(let k=0,added=0;k<extra.length&&added<(after?1:2);k++){const pt=extra[(k+di*2)%extra.length];if(!pats.includes(pt)){pats.push(pt);added++;}}
    let firstBig=true;
    pats.forEach((pt,pi)=>{
      const list0=(pool[pt]||[]).filter(id=>exById(id)&&!used.has(id)&&!bad(id,pt));if(!list0.length)return;const list=doable(list0,lvlI);if(!list.length)return;
      const b=Math.min(list.length-1,lvlI+(onlyCali?lvlI:0));
      const id=genPick(list,lvlI,b,rep+(d.seed||0));
      used.add(id);const ex=exById(id),ds=genDose(ex,gs,lvl,pt,pi<4,age);
      const it={ex:id,sets:ds[0],reps:ds[1]};
      /* calentamiento automático en el primer básico con carga del día */
      if(firstBig&&pi<4&&!ex.time&&!ex.sk&&ex.st&&!/Peso corporal|Barra fija|Paralelas|Anillas/.test(ex.eq)){it.warm=2;firstBig=false;}
      items.push(it);
    });
    ['core','rot','plyo','carry'].forEach(pt=>{if(items.length>=Math.min(5,T.p.length))return;const id=(pool[pt]||[]).find(x=>exById(x)&&!used.has(x)&&canDo(x,lvlI)&&!bad(x,pt));if(id){used.add(id);const ds=genDose(exById(id),gs,lvl,pt,false,age);items.push({ex:id,sets:ds[0],reps:ds[1]});}});
    let its=items.slice(0,(prim==='grasa'?8:7)+(mins>=90?1:0));
    if(after){its=its.slice(0,5).map(x=>Object.assign({},x,{sets:Math.max(2,x.sets-1)}));notes.push('Después de la '+actName(dinfo).toLowerCase()+': sesión corta');}
    if(before)notes.push('Antes de la '+actName(dinfo).toLowerCase()+': no llegues al fallo');
    if(next.type==='match'&&!T.low)notes.push('Mañana partido: liviano');
    if(T.low&&legScore(s.day)<-5)notes.push('Cuidá las piernas: tenés deporte cerca');
    if(inj.length)notes.push('Cuidando: '+inj.map(k=>INJ[k].n.toLowerCase()).join(', '));
    if(age<18)notes.push('Priorizá la técnica: nada de máximos');
    else if(age>=40)notes.push('Calentá bien y descansá más entre series');
    return{low:!!T.low,short:!!after,name:(sportName?sportName+' · ':'')+T.n,days:[s.day],items:its,rest:GEN_GOALS[prim].rest+(age>=40?30:0),note:notes.join(' · ')};
  });
  /* volumen semanal por grupo (los grupos con varios músculos, como piernas, llevan más):
     si queda corto se suma una serie a un accesorio; si se pasa, se recorta un accesorio, nunca el básico ni la habilidad */
  for(let pass=0;pass<30;pass++){
    const v=weekVolume(plan);let changed=false;
    Object.keys(GROUPS).forEach(g=>{
      const [lo,hi]=volRange(g,gs),cand=[];
      plan.forEach(r=>r.items.forEach((it,i)=>{const ex=exById(it.ex);if(ex&&ex.p.some(k=>GROUPS[g].includes(k))&&!ex.sk&&!it.warm)cand.push({it,r,acc:i>=2});}));
      if(!cand.length)return;
      if(v[g]<lo){const c=cand.filter(x=>x.it.sets<4).sort((x,y)=>(y.acc-x.acc)||(x.it.sets-y.it.sets))[0];if(c){c.it.sets++;changed=true;}}
      else if(v[g]>hi){const c=cand.filter(x=>x.acc&&x.it.sets>2).sort((x,y)=>y.it.sets-x.it.sets)[0];if(c){c.it.sets--;changed=true;}
        /* si ya está al mínimo, sale un accesorio entero (el día queda con 4 o más ejercicios) */
        else{const d2=cand.filter(x=>x.acc&&x.r.items.length>4).pop();if(d2){d2.r.items.splice(d2.r.items.indexOf(d2.it),1);changed=true;}}}
    });
    if(!changed)break;
  }
  if(db.settings.jointBlock)plan.forEach(r=>{r.items=jBlock().concat(r.items);});
  if(db.settings.athBlock)plan.forEach(r=>{if(!preMatch(r)){const k=r.items.filter(it=>it.prehab).length;r.items.splice(k,0,...aBlock());}});
  if(mins)plan.forEach(r=>{if(r.short)return;const FILL=r.low?['core','calf','hcurl','adductor','rot','lumbar']:['core','biceps','triceps','lateral','rear','rot','forearm'];let g=0;
    while(routineMinutes(r)<mins-12&&r.items.length<10&&g<FILL.length){const pt=FILL[g++];if(r.items.some(it=>(pool[pt]||[]).includes(it.ex)))continue;const id=(pool[pt]||[]).find(x=>exById(x)&&!r.items.some(it=>it.ex===x)&&canDo(x,lvlI)&&!bad(x,pt));
      if(id){const ds=genDose(exById(id),gs,lvl,pt,false,age);r.items.push({ex:id,sets:Math.min(3,ds[0]),reps:ds[1]});}}});
  plan.forEach(r=>mins?fitTime(r,mins):(r.min=routineMinutes(r)));
  plan.vol=weekVolume(plan);plan.gs=gs;
  return plan;
}
/* fotos libres de Wikimedia Commons (créditos en TERCEROS.md) */
const PHOTOS=Object.fromEntries('rugby futbol basquet tenis natacion running combate hockey voley ciclismo hip fuerza dep grasa salud cali'.split(' ').map(k=>[k,{u:'img/'+k+'.jpg'}]));PHOTOS.pl={u:'img/fuerza.jpg'};
let photosWarm=0;function warmPhotos(){if(photosWarm)return;photosWarm=1;window.__ph=[...new Set(Object.values(PHOTOS).map(p=>p.u))].map(u=>{const i=new Image();i.decoding='async';i.src=u;return i;});}
setTimeout(warmPhotos,1200);
/* fichas grandes con foto del deporte u objetivo */
function photoTile(k,label,icon,on,act,v,extra){
  const ph=PHOTOS[k];
  return '<button class="ptile'+(on?' on':'')+'" data-a="'+act+'" data-v="'+v+'"'+(extra||'')+' aria-pressed="'+!!on+'"'+(ph?' style="--img:url(\''+ph.u+'\')"':'')+'>'+
   '<span class="pt-ic">'+ic(icon,18)+'</span><b>'+esc(label)+'</b>'+(on?'<span class="pt-ok">'+ic('check',16)+'</span>':'')+'</button>';
}
/* bienvenida: los 7 rangos suben como un podio, uno tras otro; Élite queda brillando */
function rankStairs(){
  return '<div class="stairs" aria-hidden="true"><div class="st-logo">'+LOGO_SVG+'</div><div class="st-row">'+TIERS.map((t,k)=>
    '<div class="st-col" style="--k:'+k+';--c:'+TCOL[k]+';--h:'+(26+k*15)+'px"><span class="st-b">'+badge(k*3+1,k===6?52:40)+'</span><i class="st-bar"></i><small>'+t+'</small></div>').join('')+'</div></div>';
}
function genHTML(d){
  const st='<div class="steps">'+[1,2,3,4].map(i=>'<i class="'+(d.step>=i?'on':'')+'"></i>').join('')+'</div>';
  const opt=(f,obj)=>'<div class="opt">'+Object.keys(obj).map(k=>{const o=obj[k],on=d[f]===k;
    return '<button class="'+(on?'on':'')+'" data-a="genSet" data-f="'+f+'" data-v="'+k+'" aria-pressed="'+on+'">'+(o.i?ic(o.i,18):'')+esc(o.n||o)+'</button>';}).join('')+'</div>';
  const nav=(back,next,lbl)=>'<div class="g2">'+(back?'<button class="btn" data-a="genStep" data-v="'+back+'">Atrás</button>':'<span></span>')+'<button class="btn pri" data-a="genStep" data-v="'+next+'">'+(lbl||'Siguiente')+'</button></div>';
  if(d.step===1){d.sports=(db.profile&&db.profile.sports||[]).slice();return st+'<h4>Tus deportes y tu semana</h4><p class="mut sm-t">Tus deportes y qué días entrenás. Se guarda en tu perfil.</p>'+weekEditor()+nav(0,2);}
  if(d.step===2)return st+'<h4>¿Qué querés lograr?</h4><p class="mut sm-t">Podés combinar varios: por ejemplo, ganar músculo y fuerza.</p><div class="ptiles">'+
    Object.keys(GEN_GOALS).filter(k=>k!=='cali').map(k=>photoTile(k,GEN_GOALS[k].n,GEN_GOALS[k].i,d.goals.includes(k),'genGoal',k)).join('')+'</div>'+
    '<div class="gen-way"><b>¿Cómo la querés?</b><div class="opt"><button class="'+(d.goals.includes('cali')?'':'on')+'" data-a="genWay" data-v="mix">'+ic('dumb',18)+'Con pesas y máquinas</button><button class="'+(d.goals.includes('cali')?'on':'')+'" data-a="genWay" data-v="cali">'+ic('acro',18)+'Solo calistenia</button><button data-a="progsOpen">'+ic('trophy',18)+'Un programa famoso</button></div></div>'+
    '<div class="gen-way"><b>Habilidades de calistenia <span class="mut sm-t" style="font-weight:500">(opcional)</span></b><p class="mut sm-t" style="margin:2px 0 10px">Las que querés aprender. Cada día arranca con la variante que te toca según tus marcas, con o sin pesas.</p><div class="chips">'+
    TREE.map(b=>{const on=(d.skills||[]).includes(b.f);return '<button class="chip '+(on?'on':'')+'" data-a="genTog" data-f="skills" data-v="'+b.f+'" aria-pressed="'+on+'">'+esc(SK_LBL[b.f]||b.n)+'</button>';}).join('')+'</div></div>'+nav(1,3);
  if(d.step===3){const wk=weekGymDays(),onlyCali=d.goals.includes('cali');
    return st+(wk.length?'<h4>Tus días de entrenamiento</h4><p class="mut sm-t">Según tu semana: '+wk.map(x=>DIAS3[x]+(dayInfo(x).gym==='antes'?' (antes del deporte)':dayInfo(x).gym==='despues'?' (después del deporte)':'')).join(', ')+'.</p>'
     :'<h4>¿Cuántos días por semana vas a entrenar?</h4><div class="opt">'+[2,3,4,5,6].map(n=>'<button class="'+(+d.days===n?'on':'')+'" data-a="genSet" data-f="days" data-v="'+n+'">'+n+' días</button>').join('')+'</div>')+
    '<h4>¿Cuánto tiempo tenés por sesión?</h4><div class="opt">'+[30,45,60,75,90,120].map(n=>'<button class="'+(+d.min===n?'on':'')+'" data-a="genSet" data-f="min" data-v="'+n+'">'+(n>=120?'2 h':n+' min')+'</button>').join('')+'</div>'+
    '<div class="min-step"><button class="ib" data-a="genMin" data-v="-5" aria-label="5 minutos menos">'+ic('minus',18)+'</button><div class="grow tc"><b>'+(+d.min||60)+' min</b><span class="mut sm-t">'+(+d.min<40?'Lo justo: básicos y poco más':+d.min>=90?'Sobra: más accesorios y habilidades':'Tiempo normal')+'</span></div><button class="ib" data-a="genMin" data-v="5" aria-label="5 minutos más">'+ic('plus',18)+'</button></div>'+
    (onlyCali?'<p class="mut sm-t">Elegiste solo calistenia: la rutina va con peso corporal, barra y paralelas.</p>':'<h4>¿Con qué entrenás?</h4>'+opt('eq',GEN_EQ))+'<h4>¿Qué nivel tenés?</h4>'+opt('lvl',GEN_LVL)+
     '<h4>¿Tenés alguna lesión o molestia?</h4><p class="mut sm-t">Tocá la zona y la rutina evita lo que la carga. Si duele, que te vea un profesional.</p><div class="chips">'+Object.keys(INJ).map(k=>'<button class="chip '+((d.inj||[]).includes(k)?'on':'')+'" data-a="genTog" data-f="inj" data-v="'+k+'">'+INJ[k].n+'</button>').join('')+'</div>'+nav(2,4,'Armar mi rutina');}
  const plan=d.plan||[],v=plan.vol||{},gs=plan.gs||d.goals,[mn,mx]=volTarget(gs);
  return st+'<p class="mut sm-t">'+d.goals.map(g=>GEN_GOALS[g].n).join(' + ')+(d.sports.length?' · para '+esc(d.sports.map(k=>SPORTS[k].n).join(' y ')):'')+' · '+plan.length+' días por semana.</p>'+
   '<div class="card vol-card" style="margin:0"><div class="hd" style="margin-bottom:8px"><div><h4>Series por semana</h4><span class="mut sm-t">La franja marcada es el rango recomendado</span></div></div>'+
   Object.keys(GROUPS).map(g=>{const [lo,hi]=volRange(g,gs),top=hi*1.25,x=Math.round(v[g]||0),pct=Math.min(100,Math.round(x/top*100)),ok=x>=lo&&x<=hi*1.15;return '<div class="vrow"><span>'+g+'</span><div class="bar"><i style="width:'+pct+'%;background:'+(ok?'var(--ok)':x<lo||x<=hi*1.35?'#FFC34D':'var(--hot)')+'"></i><u style="left:'+Math.round(lo/top*100)+'%;width:'+Math.round((hi-lo)/top*100)+'%"></u></div><b>'+x+'</b></div>';}).join('')+'</div>'+
   plan.map(r=>'<div class="card" style="margin:0;padding:12px"><div class="row top-a">'+miniMap(mapOfRoutine(r)).replace('mini','mini" style="width:54px')+'<div class="grow"><b>'+esc(r.name)+'</b><br><span class="tag">'+r.days.map(x=>DIAS3[x]).join(' ')+'</span>'+(r.note?'<p class="rnote">'+ic('spark',13)+' '+esc(r.note)+'</p>':'')+
     '<div style="margin-top:6px">'+r.items.map(it=>{const ex=exById(it.ex);return '<div class="rowline gen-it" style="padding:5px 0"><span>'+esc(ex.n)+(it.warm?' <span class="tag" style="font-size:10.5px">+'+it.warm+' de calentamiento</span>':'')+(ex.sk?' <span class="tag" style="font-size:10.5px;color:var(--acc)">habilidad</span>':'')+'</span><span class="mut">'+it.sets+' × '+it.reps+(ex.time?' s':'')+'</span><button class="ib flat" data-a="genSwap" data-v="'+plan.indexOf(r)+'|'+r.items.indexOf(it)+'" aria-label="Cambiar '+esc(ex.n)+' por otro">'+ic('swap',15)+'</button></div>';}).join('')+'</div></div></div></div>').join('')+
   '<p class="mut sm-t tc">¿No te gusta alguno? Tocá '+ic('swap',12)+' y elegí otro.</p>'+
   '<details class="why"><summary>¿Por qué así?</summary><div class="mut sm-t">'+
   '<p><b>Volumen:</b> el músculo crece sobre todo por la cantidad de series efectivas por semana. Apuntamos a '+mn+'-'+mx+' por músculo (piernas, espalda y brazos suman varios músculos, por eso llevan más), repartidas en 2 o más días.</p>'+
   '<p><b>Repeticiones:</b> '+(d.goals.includes('fuerza')?'para fuerza, pocas repeticiones (4-6) con más peso en los básicos; ':'')+'para crecer sirven rangos amplios (6 a 15+) si llegás cerca del fallo.</p>'+
   '<p><b>Esfuerzo:</b> dejá 1-2 repeticiones en reserva. Ir al fallo en todo no suma mucho y cansa más.</p>'+
   '<p><b>Descanso:</b> 2-3 min en los básicos, 60-90 s en los accesorios.</p>'+
   '<p><b>Articulaciones:</b> el calentamiento automático y subir de a poco cuidan cartílagos y tendones; lo que lastima son los saltos bruscos de carga.</p>'+
   (db.profile&&db.profile.age<18?'<p><b>Menores de 18:</b> entrenar fuerza bien hecho es seguro y no frena el crecimiento, pero va primero la técnica y nada de máximos.</p>':'')+
   '<p>Fuentes: Schoenfeld y col. 2016-2017 (volumen y repeticiones), Grgic y col. 2022 (fallo), Singer y col. 2024 (descanso), NSCA 2009 (jóvenes).</p></div></details>'+
   (db.routines.some(r=>r.gen)?'<label class="row sm-t" style="gap:8px"><input type="checkbox" data-i="genRep" '+(d.replace?'checked':'')+'> Reemplazar las rutinas que armé antes</label>':'')+
   '<div class="g2"><button class="btn" data-a="genStep" data-v="3">Cambiar</button><button class="btn pri" data-a="genSave">Guardar '+plan.length+' rutinas</button></div>'+
   '<button class="btn line wide" data-a="genStep" data-v="4">'+ic('swap',16)+' Variar ejercicios</button>';
}

