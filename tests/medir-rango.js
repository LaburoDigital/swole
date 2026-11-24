'use strict';
/* SW-10: medidas del rango técnico en un cuadro (las usa tests/rango-tecnico.test.js y las herramientas de .equipo/SW-10).
   Unidades del dibujo (1 ≈ 2 cm); el torso mide 30 y su superficie está a ~5 del eje; la cabeza tiene radio 7,5 y su centro a 9 sobre la base del cuello.
   De costado (lado cercano):
   - pecho: cuánto queda la barra o la mano por delante del eje del torso
   - codo:  cuánto queda el codo por delante (+) o por detrás (−) del eje del torso
   - alto:  altura de la barra o la mano sobre la base del cuello, a lo largo del torso (0 = clavícula; −10 = mitad del pecho; ~4 = boca; ~9 = nariz)
   - e:     flexión del codo en grados (0 = estirado)
   - ante:  inclinación del antebrazo respecto de la vertical, en grados
   - hc:    cuánto queda el codo por debajo del hombro (0 = brazo paralelo al piso)
   - cadera: cuánto queda la cadera por debajo de la rodilla (+ = por debajo; 0 = muslo paralelo al piso)
   De frente o de atrás: eL, eR (flexión de cada codo) y eMax (la mayor).
   Con barra fija: menton (cuánto pasa el mentón por encima de la barra) y hombroBarra (cuánto queda el hombro por encima de la barra). */
const HEAD = 7.5;
function medidas(MK, D, u) {
  const R = MK.frame(D, u), P = R.P, a = MK.angles(R), o = {};
  const bar = (D.eq || []).find(e => e.t === 'pullbar'), by = bar ? bar.p[1] : null;
  if (R.v === 'front') {
    o.eL = Math.abs(a.L.e); o.eR = Math.abs(a.R.e); o.eMax = Math.max(o.eL, o.eR);
    if (by != null) { o.menton = by - (P.H[1] + HEAD); o.hombroBarra = by - Math.min(P.SL[1], P.SR[1]); }
    return o;
  }
  const fw = MK.V(R.phi.t - 90, R.d), up = MK.V(R.phi.t, R.d), N = P.N, G = P.Gn || P.Wn, E = P.En, W = P.Wn, S = P.Sn;
  const f = (X, v) => (X[0] - N[0]) * v[0] + (X[1] - N[1]) * v[1];
  o.pecho = f(G, fw); o.codo = f(E, fw); o.alto = f(G, up); o.e = a.n.e; o.cadera = P.Hpn[1] - P.Kn[1];
  o.ante = Math.acos(Math.min(1, Math.abs(W[1] - E[1]) / (Math.hypot(W[0] - E[0], W[1] - E[1]) || 1))) * 180 / Math.PI;
  o.hc = E[1] - S[1];
  if (by != null) { o.menton = by - (P.H[1] + HEAD); o.hombroBarra = by - S[1]; }
  return o;
}
/* la mano (o las dos) quietas en su apoyo: cuánto se mueve como máximo respecto del primer cuadro */
function manoQuieta(MK, D) {
  /* solo las manos que van agarradas o apoyadas: la que fija la figura (root) o las que tienen su punto (ik); una mano libre puede moverse */
  const js = [D.root && D.root.j].concat(Object.keys(D.ik || {})).filter(j => j && /^[GW]/.test(j)); let mx = 0; const P0 = MK.frame(D, 0).P;
  for (let i = 1; i <= 40; i++) { const P = MK.frame(D, i / 40).P; for (const j of js) if (P[j] && P0[j]) mx = Math.max(mx, Math.hypot(P[j][0] - P0[j][0], P[j][1] - P0[j][1])); }
  return mx;
}
module.exports = { medidas, manoQuieta, HEAD };
