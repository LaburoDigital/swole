'use strict';
/* SW-11 fase 2 (jefe-musculos-2.md, B): cuánto se VE de cada músculo en el dibujo.
   Rasteriza el SVG estático del macaco (sin el recuadro del agarre) en una grilla de 0,5 unidades, en el orden en que se pinta
   (el de más arriba gana cada celda), y cuenta las celdas que quedan de cada músculo pintado. Así un músculo tapado por el brazo,
   la pierna o el short da área 0, aunque esté dibujado. Lo usan tests/musculos.test.js y .equipo/SW-11/hoja.js. */
const PASO = .5, N = 240;   /* viewBox 0 0 120 120 */

const num = (tag, k) => { const m = tag.match(new RegExp('\\s' + k + '="([^"]*)"')); return m ? m[1] : null; };
/* d de un path → lista de subcaminos (puntos), muestreando las curvas */
function puntosPath(d) {
  const t = d.match(/[MLCQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [], out = []; let i = 0, cur = null, p = [0, 0], cmd = '';
  const n = () => +t[i++];
  while (i < t.length) {
    if (/[MLCQZ]/i.test(t[i])) cmd = t[i++].toUpperCase();
    if (cmd === 'M') { p = [n(), n()]; cur = [p]; out.push(cur); cmd = 'L'; }
    else if (cmd === 'L') { p = [n(), n()]; cur.push(p); }
    else if (cmd === 'C') { const a = [n(), n()], b = [n(), n()], c = [n(), n()], p0 = p;
      for (let k = 1; k <= 6; k++) { const s = k / 6, u = 1 - s; cur.push([u * u * u * p0[0] + 3 * u * u * s * a[0] + 3 * u * s * s * b[0] + s * s * s * c[0], u * u * u * p0[1] + 3 * u * u * s * a[1] + 3 * u * s * s * b[1] + s * s * s * c[1]]); }
      p = c; }
    else if (cmd === 'Q') { const a = [n(), n()], c = [n(), n()], p0 = p;
      for (let k = 1; k <= 6; k++) { const s = k / 6, u = 1 - s; cur.push([u * u * p0[0] + 2 * u * s * a[0] + s * s * c[0], u * u * p0[1] + 2 * u * s * a[1] + s * s * c[1]]); }
      p = c; }
    else if (cmd === 'Z') { cmd = ''; }
    else i++;
  }
  return out;
}
const dentroPoli = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
const dSeg = (x, y, a, b) => { const vx = b[0] - a[0], vy = b[1] - a[1], L = vx * vx + vy * vy || 1e-9, t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / L)); return Math.hypot(x - a[0] - vx * t, y - a[1] - vy * t); };

/* las formas pintadas, en orden: {cls, caja:[x0,y0,x1,y1], dentro(x,y)} */
function formasSVG(svg) {
  const out = [], tr = [[0, 0]];
  for (const m of svg.matchAll(/<(\/?)(g|line|circle|ellipse|path|rect|polygon)\b([^>]*)>/g)) {
    const [, cierra, tipo, at] = m, tag = ' ' + at, cls = num(tag, 'class') || '';
    if (tipo === 'g') { if (cierra) { if (tr.length > 1) tr.pop(); } else { const t = (num(tag, 'transform') || '').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/), b = tr[tr.length - 1]; tr.push(t ? [b[0] + +t[1], b[1] + +t[2]] : b); if (/\/\s*$/.test(at)) tr.pop(); } continue; }
    if (cierra || /mk-ml|tq-sh\b|mk-hl/.test(cls) && tipo === 'line' && /mk-ml/.test(cls)) continue;
    const [ox, oy] = tr[tr.length - 1], w = +(num(tag, 'stroke-width') || 0);
    if (tipo === 'line') { const a = [+num(tag, 'x1') + ox, +num(tag, 'y1') + oy], b = [+num(tag, 'x2') + ox, +num(tag, 'y2') + oy], r = Math.max(w, 1) / 2;
      out.push({ cls, caja: [Math.min(a[0], b[0]) - r, Math.min(a[1], b[1]) - r, Math.max(a[0], b[0]) + r, Math.max(a[1], b[1]) + r], dentro: (x, y) => dSeg(x, y, a, b) <= r }); }
    else if (tipo === 'circle') { const c = [+num(tag, 'cx') + ox, +num(tag, 'cy') + oy], r = +num(tag, 'r') + (w ? w / 2 : 0);
      out.push({ cls, caja: [c[0] - r, c[1] - r, c[0] + r, c[1] + r], dentro: (x, y) => Math.hypot(x - c[0], y - c[1]) <= r }); }
    else if (tipo === 'ellipse') { const c = [+num(tag, 'cx') + ox, +num(tag, 'cy') + oy], rx = +num(tag, 'rx'), ry = +num(tag, 'ry');
      out.push({ cls, caja: [c[0] - rx, c[1] - ry, c[0] + rx, c[1] + ry], dentro: (x, y) => ((x - c[0]) / rx) ** 2 + ((y - c[1]) / ry) ** 2 <= 1 }); }
    else if (tipo === 'rect') { const x = +num(tag, 'x') + ox, y = +num(tag, 'y') + oy, W = +num(tag, 'width'), H = +num(tag, 'height');
      out.push({ cls, caja: [x, y, x + W, y + H], dentro: (a, b) => a >= x && a <= x + W && b >= y && b <= y + H }); }
    else if (tipo === 'polygon') { const n = (num(tag, 'points') || '').split(/[ ,]+/).map(Number), P = []; for (let i = 0; i + 1 < n.length; i += 2) P.push([n[i] + ox, n[i + 1] + oy]);
      if (P.length > 2) out.push({ cls, caja: cajaDe(P), dentro: (x, y) => dentroPoli(P, x, y) }); }
    else if (tipo === 'path') { const subs = puntosPath(num(tag, 'd') || '').map(P => P.map(q => [q[0] + ox, q[1] + oy])).filter(P => P.length > 1);
      if (!subs.length) continue;
      if (/fill="none"/.test(tag) || /mk-ml/.test(cls)) { if (!w || /mk-ml/.test(cls)) continue; const r = w / 2;   /* trazo grueso sin relleno (el torso curvo) */
        out.push({ cls, caja: cajaDe(subs.flat(), r), dentro: (x, y) => subs.some(P => P.some((q, i) => i && dSeg(x, y, P[i - 1], q) <= r)) }); }
      else out.push({ cls, caja: cajaDe(subs.flat()), dentro: (x, y) => subs.some(P => dentroPoli(P, x, y)) });
    }
  }
  return out;
}
const cajaDe = (P, r = 0) => [Math.min(...P.map(q => q[0])) - r, Math.min(...P.map(q => q[1])) - r, Math.max(...P.map(q => q[0])) + r, Math.max(...P.map(q => q[1])) + r];

/* área visible (unidades²) de cada clase que matchee con re, al pintar todo en orden */
function areasVisibles(svg, re) {
  const F = formasSVG(svg), dueño = new Int32Array(N * N).fill(-1);
  F.forEach((f, k) => {
    const [x0, y0, x1, y1] = f.caja, i0 = Math.max(0, Math.floor(x0 / PASO)), i1 = Math.min(N - 1, Math.ceil(x1 / PASO)), j0 = Math.max(0, Math.floor(y0 / PASO)), j1 = Math.min(N - 1, Math.ceil(y1 / PASO));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (f.dentro((i + .5) * PASO, (j + .5) * PASO)) dueño[j * N + i] = k;
  });
  const area = {};
  for (let c = 0; c < dueño.length; c++) { const k = dueño[c]; if (k < 0) continue; const m = F[k].cls.match(re); if (m) area[m[1]] = (area[m[1]] || 0) + PASO * PASO; }
  return area;
}
/* el área visible máxima de cada músculo principal de un ejercicio, en 5 momentos del recorrido */
function visiblesPrincipales(MK, D) {
  const mx = {};
  for (const u of [0, .25, .5, .75, 1]) {
    const a = areasVisibles(MK.svg(D, { u, noGrip: 1 }), /mk-m mk-mp m-(\w+)/);
    for (const [m, v] of Object.entries(a)) mx[m] = Math.max(mx[m] || 0, v);
  }
  return mx;
}
module.exports = { areasVisibles, visiblesPrincipales, formasSVG };
