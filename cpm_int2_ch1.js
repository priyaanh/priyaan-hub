/* Priyaan Hub — question bank for quizzes.html.
   CPM Core Connections Integrated II, Chapter 1 "Exploring Algebraic and Geometric Relationships".
   Plain script (no modules, no network). Sets window.CPM_QUIZZES = { book, chapter, title, lessons: [...] }.
   Question kinds:
     { type:'mc',   q, choices:[4 strings], answer:index, explain, svg? }
     { type:'num',  q, answer:number, unit?, tolerance?, explain, svg? }
     { type:'text', q, answer:'x^2+5x+6', accept?:[...], explain, svg? }
     { type:'gen',  make:function (rnd) { return one of the above } }   // rnd() in [0,1), seeded by the app
   Every SVG is an inline string that uses currentColor / var(--accent) so it works in light and dark mode. */
window.CPM_QUIZZES = (function () {
  'use strict';

  /* ---------------------------------------------------------------- small helpers ---- */
  function ri(rnd, a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }
  function shuffle(rnd, arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function r1(n) { return Math.round(n * 10) / 10; }
  function deg(n) { return n + '°'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
  /** 4 distinct choices with the correct one first (the app shuffles). pool = candidate distractors. */
  function choices4(rnd, correct, pool, fmt) {
    fmt = fmt || function (v) { return String(v); };
    var isNum = typeof correct === 'number';
    var out = [correct], seen = {}; seen[fmt(correct)] = true;
    var cand = shuffle(rnd, pool.filter(function (v) { return v !== correct && (isNum ? (typeof v === 'number' && isFinite(v)) : typeof v === 'string' && v); }));
    for (var i = 0; i < cand.length && out.length < 4; i++) { var k = fmt(cand[i]); if (!seen[k]) { seen[k] = true; out.push(cand[i]); } }
    var step = 1;
    while (isNum && out.length < 4 && step <= 60) { var v = correct + (out.length % 2 ? step : -step); step++; var k2 = fmt(v); if (!seen[k2] && v > 0) { seen[k2] = true; out.push(v); } }
    return { choices: out.map(fmt), answer: 0 };
  }
  function mc(q, choices, answer, explain, svg) { var o = { type: 'mc', q: q, choices: choices, answer: answer, explain: explain }; if (svg) o.svg = svg; return o; }
  function num(q, answer, unit, explain, svg, tolerance) { var o = { type: 'num', q: q, answer: answer, explain: explain }; if (unit) o.unit = unit; if (svg) o.svg = svg; if (tolerance != null) o.tolerance = tolerance; return o; }
  function txt(q, answer, accept, explain, svg) { var o = { type: 'text', q: q, answer: answer, accept: accept || [], explain: explain }; if (svg) o.svg = svg; return o; }
  function gen(make) { return { type: 'gen', make: make }; }

  /* ---------------------------------------------------------------- SVG helpers ---- */
  function R(n) { return Math.round(n * 10) / 10; }
  function S(w, h, inner, maxw) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-hidden="true" style="max-width:' + (maxw || 320) + 'px;width:100%;height:auto;display:block" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" font-size="13">' + inner + '</svg>';
  }
  function T(x, y, s, o) {
    o = o || {};
    return '<text x="' + R(x) + '" y="' + R(y) + '" fill="' + (o.fill || 'currentColor') + '" stroke="none" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="middle" font-size="' + (o.size || 13) + '"' + (o.bold ? ' font-weight="700"' : '') + (o.italic ? ' font-style="italic"' : '') + '>' + s + '</text>';
  }
  function L(a, b, o) { o = o || {}; return '<line x1="' + R(a[0]) + '" y1="' + R(a[1]) + '" x2="' + R(b[0]) + '" y2="' + R(b[1]) + '"' + (o.w ? ' stroke-width="' + o.w + '"' : '') + (o.stroke ? ' stroke="' + o.stroke + '"' : '') + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : '') + '/>'; }
  function poly(pts, o) { o = o || {}; return '<polygon points="' + pts.map(function (p) { return R(p[0]) + ',' + R(p[1]); }).join(' ') + '" fill="' + (o.fill || 'var(--accent)') + '" fill-opacity="' + (o.fo != null ? o.fo : .14) + '"/>'; }
  function unit(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; }
  /** n congruence tick marks across the middle of segment ab. */
  function ticks(a, b, n) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, u = unit(a, b), px = -u[1], py = u[0], s = '';
    for (var i = 0; i < n; i++) { var off = (i - (n - 1) / 2) * 5, cx = mx + u[0] * off, cy = my + u[1] * off; s += L([cx + px * 6, cy + py * 6], [cx - px * 6, cy - py * 6], { w: 2 }); }
    return s;
  }
  /** n "parallel" chevrons at the middle of segment ab, pointing from a to b. */
  function arrows(a, b, n) {
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, u = unit(a, b), px = -u[1], py = u[0], s = '';
    for (var i = 0; i < n; i++) {
      var off = (i - (n - 1) / 2) * 6, tx = mx + u[0] * (off + 4), ty = my + u[1] * (off + 4);
      s += '<polyline points="' + R(tx - u[0] * 7 + px * 5) + ',' + R(ty - u[1] * 7 + py * 5) + ' ' + R(tx) + ',' + R(ty) + ' ' + R(tx - u[0] * 7 - px * 5) + ',' + R(ty - u[1] * 7 - py * 5) + '" stroke-width="2"/>';
    }
    return s;
  }
  /** Right-angle box at vertex v, between the rays toward a and b. */
  function rabox(v, a, b, s) {
    s = s || 11; var u = unit(v, a), w = unit(v, b);
    return '<polyline points="' + R(v[0] + u[0] * s) + ',' + R(v[1] + u[1] * s) + ' ' + R(v[0] + (u[0] + w[0]) * s) + ',' + R(v[1] + (u[1] + w[1]) * s) + ' ' + R(v[0] + w[0] * s) + ',' + R(v[1] + w[1] * s) + '" stroke-width="1.5"/>';
  }
  /** Angle arc at vertex v from ray toward a to ray toward b (the smaller angle). */
  function arc(v, a, b, r, o) {
    o = o || {};
    var a1 = Math.atan2(a[1] - v[1], a[0] - v[0]), a2 = Math.atan2(b[1] - v[1], b[0] - v[0]);
    var d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    var p1 = [v[0] + r * Math.cos(a1), v[1] + r * Math.sin(a1)], p2 = [v[0] + r * Math.cos(a2), v[1] + r * Math.sin(a2)];
    return '<path d="M' + R(p1[0]) + ' ' + R(p1[1]) + ' A' + r + ' ' + r + ' 0 0 ' + (d > 0 ? 1 : 0) + ' ' + R(p2[0]) + ' ' + R(p2[1]) + '" stroke="' + (o.stroke || 'var(--accent)') + '" stroke-width="' + (o.w || 2) + '"/>';
  }
  /** Point in the direction of the bisector of angle a-v-b, dist px from v (for labels). */
  function bisect(v, a, b, dist) {
    var u = unit(v, a), w = unit(v, b), bx = u[0] + w[0], by = u[1] + w[1], l = Math.hypot(bx, by) || 1;
    if (l < 0.05) { bx = -u[1]; by = u[0]; l = 1; }
    return [v[0] + bx / l * dist, v[1] + by / l * dist];
  }
  function ngon(n, cx, cy, r, rot) { var pts = []; for (var i = 0; i < n; i++) { var a = (rot || -Math.PI / 2) + i * 2 * Math.PI / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return pts; }
  function closedTicks(pts, counts) { var s = ''; for (var i = 0; i < pts.length; i++) { var c = counts[i] || 0; if (c) s += ticks(pts[i], pts[(i + 1) % pts.length], c); } return s; }
  function closedArrows(pts, counts) { var s = ''; for (var i = 0; i < pts.length; i++) { var c = counts[i] || 0; if (c) s += arrows(pts[i], pts[(i + 1) % pts.length], c); } return s; }
  function allRA(pts) { var s = ''; for (var i = 0; i < pts.length; i++) s += rabox(pts[i], pts[(i + pts.length - 1) % pts.length], pts[(i + 1) % pts.length]); return s; }

  /* ---- named shapes (1.1.x) ---- */
  var SHAPES = {
    square: function () { var p = [[55, 20], [155, 20], [155, 120], [55, 120]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>' + closedTicks(p, [1, 1, 1, 1]) + allRA(p), 220); },
    rectangle: function () { var p = [[30, 35], [180, 35], [180, 110], [30, 110]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>' + closedTicks(p, [1, 2, 1, 2]) + allRA(p), 220); },
    rhombus: function () { var p = [[105, 15], [165, 70], [105, 125], [45, 70]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>' + closedTicks(p, [1, 1, 1, 1]), 220); },
    parallelogram: function () { var p = [[60, 30], [190, 30], [150, 110], [20, 110]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>' + closedTicks(p, [1, 2, 1, 2]) + closedArrows(p, [1, 2, 1, 2]), 220); },
    trapezoid: function () { var p = [[70, 35], [140, 35], [180, 110], [30, 110]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>' + arrows(p[0], p[1], 1) + arrows(p[3], p[2], 1), 220); },
    kite: function () { var p = [[105, 15], [155, 60], [105, 130], [55, 60]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>' + closedTicks(p, [1, 2, 2, 1]), 220); },
    isosceles: function () { var p = [[105, 20], [165, 120], [45, 120]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>' + ticks(p[0], p[1], 1) + ticks(p[2], p[0], 1), 220); },
    equilateral: function () { var p = [[105, 18], [160, 113], [50, 113]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>' + closedTicks(p, [1, 1, 1]), 220); },
    right: function () { var p = [[40, 120], [175, 120], [40, 30]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>' + rabox(p[0], p[1], p[2]), 220); },
    scalene: function () { var p = [[30, 118], [185, 122], [95, 25]]; return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>', 220); },
    regular: function (n) { var p = ngon(n, 105, 72, 56); var c = []; for (var i = 0; i < n; i++) c.push(1); return S(210, 140, poly(p) + '<polygon points="' + p.map(function (q) { return R(q[0]) + ',' + R(q[1]); }).join(' ') + '"/>' + closedTicks(p, c), 220); }
  };
  function venn(leftLabel, rightLabel, mid) {
    return S(260, 150,
      '<circle cx="95" cy="75" r="62" fill="var(--accent)" fill-opacity=".12"/><circle cx="165" cy="75" r="62" fill="var(--accent)" fill-opacity=".12"/>' +
      T(62, 75, leftLabel, { size: 12 }) + T(198, 75, rightLabel, { size: 12 }) + T(130, 75, mid, { size: 18, bold: true, fill: 'var(--accent)' }), 300);
  }

  /* ---- tile figures on a grid (1.2.2) ---- */
  function tileSVG(cells, opts) {
    opts = opts || {};
    var cs = opts.cell || 26, pad = 8, maxc = 0, maxr = 0, set = {};
    cells.forEach(function (c) { set[c[0] + ',' + c[1]] = true; if (c[0] > maxc) maxc = c[0]; if (c[1] > maxr) maxr = c[1]; });
    var w = (maxc + 1) * cs + pad * 2, h = (maxr + 1) * cs + pad * 2, s = '';
    for (var x = 0; x <= maxc + 1; x++) s += L([pad + x * cs, pad], [pad + x * cs, h - pad], { w: 1, op: .25 });
    for (var y = 0; y <= maxr + 1; y++) s += L([pad, pad + y * cs], [w - pad, pad + y * cs], { w: 1, op: .25 });
    cells.forEach(function (c) { s += '<rect x="' + (pad + c[0] * cs) + '" y="' + (pad + c[1] * cs) + '" width="' + cs + '" height="' + cs + '" fill="var(--accent)" fill-opacity=".35" stroke="currentColor" stroke-width="1.5"/>'; });
    return S(w, h, s, Math.min(300, w * 1.2));
  }
  function tilePerimeter(cells) {
    var set = {}; cells.forEach(function (c) { set[c[0] + ',' + c[1]] = true; });
    var p = 0; cells.forEach(function (c) { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { if (!set[(c[0] + d[0]) + ',' + (c[1] + d[1])]) p++; }); });
    return p;
  }
  function scaleCells(cells, k) { var out = []; cells.forEach(function (c) { for (var i = 0; i < k; i++) for (var j = 0; j < k; j++) out.push([c[0] * k + i, c[1] * k + j]); }); return out; }
  var TILE_SHAPES = {
    'L-shape': [[0, 0], [0, 1], [0, 2], [1, 2]],
    'T-shape': [[0, 0], [1, 0], [2, 0], [1, 1]],
    'S-shape': [[0, 1], [1, 1], [1, 0], [2, 0]],
    'plus sign': [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
    'staircase': [[0, 2], [1, 2], [1, 1], [2, 1], [2, 0]],
    'small L': [[0, 0], [0, 1], [1, 1]],
    'long L': [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]
  };

  /* ---- generic rectangle (1.2.3) ---- */
  function genRect(top, left, cells) {
    var x0 = 55, y0 = 32, w1 = 112, w2 = 70, h1 = 72, h2 = 50, s = '';
    var Q = function (v) { return v === '?' ? T(0, 0, '') : v; };
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (w1 + w2) + '" height="' + (h1 + h2) + '" fill="var(--accent)" fill-opacity=".08"/>';
    s += '<rect x="' + x0 + '" y="' + y0 + '" width="' + (w1 + w2) + '" height="' + (h1 + h2) + '"/>';
    s += L([x0 + w1, y0], [x0 + w1, y0 + h1 + h2]) + L([x0, y0 + h1], [x0 + w1 + w2, y0 + h1]);
    var lab = function (x, y, v, big) { return T(x, y, v === '?' ? '?' : v, { size: big ? 16 : 14, bold: v === '?', fill: v === '?' ? 'var(--accent)' : 'currentColor' }); };
    s += lab(x0 + w1 / 2, y0 - 14, top[0]) + lab(x0 + w1 + w2 / 2, y0 - 14, top[1]);
    s += lab(x0 - 22, y0 + h1 / 2, left[0]) + lab(x0 - 22, y0 + h1 + h2 / 2, left[1]);
    s += lab(x0 + w1 / 2, y0 + h1 / 2, cells[0][0], true) + lab(x0 + w1 + w2 / 2, y0 + h1 / 2, cells[0][1], true);
    s += lab(x0 + w1 / 2, y0 + h1 + h2 / 2, cells[1][0], true) + lab(x0 + w1 + w2 / 2, y0 + h1 + h2 / 2, cells[1][1], true);
    return S(260, 175, s, 300);
  }

  /* ---- coordinate graph (1.2.4) ---- */
  function graph(o) {
    o = o || {};
    var W = 210, H = 210, sc = 15, ox = 105, oy = 105, s = '';
    var X = function (x) { return ox + x * sc; }, Y = function (y) { return oy - y * sc; };
    for (var i = -6; i <= 6; i++) { s += L([X(i), Y(-6.5)], [X(i), Y(6.5)], { w: 1, op: .13 }) + L([X(-6.5), Y(i)], [X(6.5), Y(i)], { w: 1, op: .13 }); }
    s += L([X(-6.8), oy], [X(6.8), oy], { w: 1.5 }) + L([ox, Y(-6.8)], [ox, Y(6.8)], { w: 1.5 });
    s += '<polyline points="' + R(X(6.8) - 5) + ',' + R(oy - 4) + ' ' + R(X(6.8)) + ',' + R(oy) + ' ' + R(X(6.8) - 5) + ',' + R(oy + 4) + '" stroke-width="1.5"/>';
    s += '<polyline points="' + R(ox - 4) + ',' + R(Y(6.8) + 5) + ' ' + R(ox) + ',' + R(Y(6.8)) + ' ' + R(ox + 4) + ',' + R(Y(6.8) + 5) + '" stroke-width="1.5"/>';
    [-4, -2, 2, 4].forEach(function (v) { s += T(X(v), oy + 9, String(v), { size: 8 }) + T(ox - 8, Y(v), String(v), { size: 8 }); });
    s += T(X(6.8), oy - 8, 'x', { size: 10, italic: true }) + T(ox + 8, Y(6.6), 'y', { size: 10, italic: true });
    if (o.fn) {
      var pts = [], run = [];
      var flush = function () { if (run.length > 1) pts.push('<polyline points="' + run.join(' ') + '" stroke="var(--accent)" stroke-width="2.5"/>'); run = []; };
      for (var x = -6.6; x <= 6.61; x += 0.1) { var y = o.fn(x); if (y > -6.6 && y < 6.6 && isFinite(y)) run.push(R(X(x)) + ',' + R(Y(y))); else flush(); }
      flush(); s += pts.join('');
    }
    if (o.seg) {
      var a = o.seg[0], b = o.seg[1];
      s += L([X(a[0]), Y(a[1])], [X(b[0]), Y(b[1])], { stroke: 'var(--accent)', w: 2.5 });
      s += '<circle cx="' + R(X(a[0])) + '" cy="' + R(Y(a[1])) + '" r="4" fill="' + (o.open && o.open[0] ? 'var(--surface)' : 'var(--accent)') + '" stroke="var(--accent)"/>';
      s += '<circle cx="' + R(X(b[0])) + '" cy="' + R(Y(b[1])) + '" r="4" fill="' + (o.open && o.open[1] ? 'var(--surface)' : 'var(--accent)') + '" stroke="var(--accent)"/>';
    }
    if (o.dots) o.dots.forEach(function (p) { s += '<circle cx="' + R(X(p[0])) + '" cy="' + R(Y(p[1])) + '" r="4" fill="var(--accent)" stroke="none"/>'; });
    return S(W, H, s, 250);
  }

  /* ---- scatterplot with a trend line (1.2.1) ---- */
  function scatter(points, line, labels) {
    var W = 250, H = 170, ox = 36, oy = 140, sx = 2.2, sy = 1.6, s = '';
    var X = function (x) { return ox + x * sx; }, Y = function (y) { return oy - y * sy; };
    s += L([ox, 15], [ox, oy], { w: 1.5 }) + L([ox, oy], [W - 10, oy], { w: 1.5 });
    s += T((ox + W - 10) / 2, oy + 18, 'height (in)', { size: 10 }) + '<text transform="translate(12 ' + (oy + 15) / 2 + ') rotate(-90)" fill="currentColor" stroke="none" text-anchor="middle" font-size="10">reach (in)</text>';
    if (line) s += L([X(line[0][0]), Y(line[0][1])], [X(line[1][0]), Y(line[1][1])], { stroke: 'var(--accent)', w: 2, dash: '5 4' });
    points.forEach(function (p, i) {
      s += '<circle cx="' + R(X(p[0])) + '" cy="' + R(Y(p[1])) + '" r="4" fill="currentColor" stroke="none"/>';
      if (labels && labels[i]) s += T(X(p[0]) + 10, Y(p[1]) - 8, labels[i], { size: 12, bold: true, fill: 'var(--accent)' });
    });
    return S(W, H, s, 300);
  }

  /* ---- two intersecting lines (1.3.1) ---- */
  function cross(lab) {
    lab = lab || {};
    var C = [130, 90], UR = [235, 37], DR = [235, 143], DL = [25, 143], UL = [25, 37], s = '';
    s += L(UL, DR, { w: 2 }) + L(DL, UR, { w: 2 });
    var put = function (key, a, b, r, d) { if (lab[key] == null) return; var p = bisect(C, a, b, d); s += arc(C, a, b, r) + T(p[0], p[1], lab[key], { size: 14, bold: true, fill: lab[key] === '?' || /[a-z]/.test(lab[key]) ? 'var(--accent)' : 'currentColor' }); };
    put('top', UL, UR, 20, 34); put('bottom', DL, DR, 20, 34); put('right', UR, DR, 24, 44); put('left', UL, DL, 24, 44);
    return S(260, 180, s, 300);
  }

  /* ---- two parallel lines and a transversal, angles 1–8 (1.3.2 / 1.3.3) ---- */
  var TP = [100, 50], TQ = [160, 130];
  var TPOS = { 1: [82, 40], 2: [118, 36], 3: [83, 64], 4: [122, 62], 5: [142, 120], 6: [178, 116], 7: [143, 144], 8: [182, 142] };
  var TACUTE = { 1: true, 4: true, 5: true, 8: true };
  function trans(lab, o) {
    lab = lab || {}; o = o || {};
    var s = L([12, 50], [246, 50], { w: 2 }) + L([12, 130], [246, 130], { w: 2 }) + L([70, 10], [190, 170], { w: 2 });
    if (o.parallel !== false) s += arrows([12, 50], [246, 50], 1) + arrows([12, 130], [246, 130], 1);
    s += T(257, 50, o.names ? o.names[0] : 'm', { size: 12, italic: true }) + T(257, 130, o.names ? o.names[1] : 'n', { size: 12, italic: true }) + T(196, 172, o.names ? o.names[2] : 't', { size: 12, italic: true });
    Object.keys(lab).forEach(function (k) {
      var p = TPOS[k]; if (!p) return; var v = String(lab[k]);
      var special = v === '?' || /[a-z]/.test(v);
      s += T(p[0], p[1], v, { size: v.length > 3 ? 10.5 : 12, bold: true, fill: special ? 'var(--accent)' : 'currentColor' });
    });
    return S(270, 180, s, 320);
  }

  /* ---- triangle with angle labels (1.3.4) ---- */
  function tri(o) {
    o = o || {};
    var A = [30, 150], B = [220, 150], C = [105, 30], D = [278, 150], s = '';
    s += poly([A, B, C]) + '<polygon points="' + [A, B, C].map(function (p) { return p.join(','); }).join(' ') + '"/>';
    if (o.ext != null) s += L(B, D, { dash: '5 4' });
    if (o.iso) s += ticks(A, C, 1) + ticks(B, C, 1);
    if (o.ra) s += rabox(C, A, B);
    var lab = function (v, a, b, val, dist) { if (val == null) return; var p = bisect(v, a, b, dist || 32); var special = val === '?' || /[a-z]/.test(String(val)); s += arc(v, a, b, 18) + T(p[0], p[1], val, { size: 13, bold: true, fill: special ? 'var(--accent)' : 'currentColor' }); };
    lab(A, B, C, o.A); lab(B, A, C, o.B); lab(C, A, B, o.C, 34);
    if (o.ext != null) { var p = bisect(B, D, C, 34); s += arc(B, D, C, 22) + T(p[0] + 6, p[1] - 2, o.ext, { size: 13, bold: true, fill: o.ext === '?' || /[a-z]/.test(String(o.ext)) ? 'var(--accent)' : 'currentColor' }); }
    if (o.names !== false) s += T(18, 162, 'A', { size: 12, italic: true }) + T(232, 162, 'B', { size: 12, italic: true }) + T(105, 16, 'C', { size: 12, italic: true });
    if (o.sides) { s += T(125, 163, o.sides.AB || '', { size: 11 }) + T(178, 84, o.sides.BC || '', { size: 11 }) + T(50, 84, o.sides.AC || '', { size: 11 }); }
    return S(o.ext != null ? 290 : 250, 175, s, 300);
  }

  var POLYGONS = [[3, 'triangle'], [4, 'quadrilateral'], [5, 'pentagon'], [6, 'hexagon'], [7, 'heptagon'], [8, 'octagon'], [9, 'nonagon'], [10, 'decagon'], [12, 'dodecagon']];
  function polyName(n) { for (var i = 0; i < POLYGONS.length; i++) if (POLYGONS[i][0] === n) return POLYGONS[i][1]; return n + '-gon'; }

  var lessons = [];

  /* ================================================================ 1.1.1 ==== */
  lessons.push({
    id: '1.1.1', title: 'Attributes of Polygons',
    focus: ['Name triangles by sides and angles', 'Name quadrilaterals from their markings', 'Regular polygons and side counts', 'Lines of symmetry'],
    questions: [
      mc('All four sides are marked congruent and every angle is a right angle. What is the most specific name for this shape?',
        ['Square', 'Rhombus', 'Rectangle', 'Trapezoid'], 0,
        'Four congruent sides make it a rhombus; four right angles make it a rectangle. A shape that is both is a square.', SHAPES.square()),
      mc('Four congruent sides, but the angles are not right angles. What is the most specific name for this shape?',
        ['Rhombus', 'Square', 'Rectangle', 'Kite'], 0,
        'A rhombus has four congruent sides. It is only a square if it also has right angles.', SHAPES.rhombus()),
      mc('The arrows show which sides are parallel. What is this shape?',
        ['Trapezoid', 'Parallelogram', 'Rhombus', 'Rectangle'], 0,
        'Exactly one pair of parallel sides (marked with arrows) makes it a trapezoid.', SHAPES.trapezoid()),
      mc('This quadrilateral has two pairs of congruent sides that are next to each other (adjacent). What is it?',
        ['Kite', 'Parallelogram', 'Rhombus', 'Trapezoid'], 0,
        'A kite has two distinct pairs of adjacent congruent sides. In a parallelogram the congruent sides are opposite each other.', SHAPES.kite()),
      mc('Opposite sides are parallel and congruent, but there are no right angles. Most specific name?',
        ['Parallelogram', 'Rectangle', 'Trapezoid', 'Kite'], 0,
        'Two pairs of parallel sides make a parallelogram. Without right angles or four congruent sides, that is the most specific name.', SHAPES.parallelogram()),
      mc('Classify this triangle by its sides.',
        ['Isosceles', 'Equilateral', 'Scalene', 'Right'], 0,
        'Two sides are marked congruent, so it is isosceles. (Equilateral needs all three; scalene has none.)', SHAPES.isosceles()),
      mc('Classify this triangle by its angles.',
        ['Right', 'Acute', 'Obtuse', 'Equilateral'], 0,
        'The small square marks a 90° angle, so the triangle is a right triangle.', SHAPES.right()),
      mc('All three sides are marked congruent. Which statement must be true?',
        ['Each angle measures 60°', 'It has exactly one right angle', 'It has exactly one line of symmetry', 'Two of its angles are obtuse'], 0,
        'An equilateral triangle is also equiangular: 180° ÷ 3 = 60° for each angle. It has three lines of symmetry.', SHAPES.equilateral()),
      mc('This triangle has no congruent sides and no right angle. Classify it by its sides.',
        ['Scalene', 'Isosceles', 'Equilateral', 'Regular'], 0,
        'A scalene triangle has three sides of different lengths.', SHAPES.scalene()),
      num('How many lines of symmetry does a square have?', 4, '', 'Two diagonals plus a vertical and a horizontal line through the middle: 4 lines.', SHAPES.square()),
      num('How many lines of symmetry does this rectangle (not a square) have?', 2, '', 'Only the vertical and horizontal lines through the center. The diagonals do not work for a non-square rectangle.', SHAPES.rectangle()),
      mc('Which quadrilateral has exactly one line of symmetry?',
        ['Kite', 'Rhombus', 'Rectangle', 'Square'], 0,
        'A kite is symmetric only across its long diagonal. A rhombus and a rectangle have 2 lines; a square has 4.'),
      mc('What makes a polygon a <em>regular</em> polygon?',
        ['All sides are congruent and all angles are congruent', 'It has at least one right angle', 'Opposite sides are parallel', 'It has more than four sides'], 0,
        'Regular means equilateral (equal sides) and equiangular (equal angles) at the same time.', SHAPES.regular(6)),
      mc('Which triangle has one angle greater than 90°?', ['Obtuse triangle', 'Acute triangle', 'Right triangle', 'Equilateral triangle'], 0,
        'Obtuse means one angle is more than 90°. Acute triangles have all angles less than 90°.'),
      mc('Which of these is NOT a quadrilateral?', ['Pentagon', 'Rhombus', 'Kite', 'Trapezoid'], 0,
        'Quadrilaterals have 4 sides. A pentagon has 5.'),
      mc('A quadrilateral has two pairs of parallel sides but does not need right angles or congruent sides. What is it?',
        ['Parallelogram', 'Trapezoid', 'Kite', 'Rectangle'], 0, 'That is the definition of a parallelogram.'),
      gen(function (rnd) {
        var p = pick(rnd, POLYGONS.slice(2));
        return num('How many sides does a ' + p[1] + ' have?', p[0], '', 'A ' + p[1] + ' has ' + p[0] + ' sides.', p[0] <= 12 ? SHAPES.regular(p[0]) : null);
      }),
      gen(function (rnd) {
        var p = pick(rnd, POLYGONS.slice(2));
        var c = choices4(rnd, p[1], POLYGONS.map(function (x) { return x[1]; }));
        return mc('What is the name of a polygon with ' + p[0] + ' sides?', c.choices, 0, 'A ' + p[0] + '-sided polygon is a ' + p[1] + '.');
      }),
      gen(function (rnd) {
        var n = pick(rnd, [3, 5, 6, 8, 10]);
        return num('How many lines of symmetry does a regular ' + polyName(n) + ' have?', n, '', 'A regular polygon with ' + n + ' sides has ' + n + ' lines of symmetry, one through each vertex or side.', SHAPES.regular(n));
      }),
      gen(function (rnd) {
        var kind = pick(rnd, ['acute', 'right', 'obtuse']), a, b, c;
        if (kind === 'right') { a = 90; b = ri(rnd, 20, 70); c = 90 - b; }
        else if (kind === 'obtuse') { a = ri(rnd, 95, 140); b = ri(rnd, 15, (180 - a) - 15); c = 180 - a - b; }
        else { a = ri(rnd, 50, 85); b = ri(rnd, 45, Math.min(85, 180 - a - 30)); c = 180 - a - b; if (c >= 90) { a = 60; b = 60; c = 60; } }
        var angs = shuffle(rnd, [a, b, c]);
        var expl = { acute: 'All three angles are less than 90°, so it is acute.', right: 'One angle is exactly 90°, so it is a right triangle.', obtuse: 'One angle is greater than 90°, so it is obtuse.' };
        return mc('A triangle has angles of ' + deg(angs[0]) + ', ' + deg(angs[1]) + ', and ' + deg(angs[2]) + '. Classify it by its angles.',
          [kind[0].toUpperCase() + kind.slice(1), kind === 'acute' ? 'Right' : 'Acute', kind === 'obtuse' ? 'Right' : 'Obtuse', 'Equilateral'].map(function (s, i) { return i === 0 ? s : s; }), 0, expl[kind]);
      }),
      gen(function (rnd) {
        var kind = pick(rnd, ['equilateral', 'isosceles', 'scalene']), s;
        if (kind === 'equilateral') { var e = ri(rnd, 3, 12); s = [e, e, e]; }
        else if (kind === 'isosceles') { var t = ri(rnd, 4, 10); var u = ri(rnd, 2, 2 * t - 1); if (u === t) u = t + 1; s = shuffle(rnd, [t, t, u]); }
        else { var x = ri(rnd, 4, 8), y = x + ri(rnd, 1, 3), z = y + ri(rnd, 1, x - 1); s = shuffle(rnd, [x, y, z]); }
        var expl = { equilateral: 'All three sides are the same length: equilateral.', isosceles: 'Exactly two sides are the same length: isosceles.', scalene: 'All three sides are different lengths: scalene.' };
        return mc('A triangle has sides of length ' + s.join(', ') + '. Classify it by its sides.',
          [kind[0].toUpperCase() + kind.slice(1), kind === 'scalene' ? 'Isosceles' : 'Scalene', kind === 'equilateral' ? 'Isosceles' : 'Equilateral', 'Right'], 0, expl[kind]);
      }),
      gen(function (rnd) {
        var items = [['Square', SHAPES.square, 4], ['Rectangle', SHAPES.rectangle, 2], ['Rhombus', SHAPES.rhombus, 2], ['Isosceles triangle', SHAPES.isosceles, 1], ['Equilateral triangle', SHAPES.equilateral, 3], ['Parallelogram', SHAPES.parallelogram, 0], ['Kite', SHAPES.kite, 1]];
        var it = pick(rnd, items);
        return num('How many lines of symmetry does this ' + it[0].toLowerCase() + ' have?', it[2], '', it[2] === 0 ? 'A parallelogram that is not a rectangle or rhombus has no line of symmetry (it only has rotation symmetry).' : 'This ' + it[0].toLowerCase() + ' has ' + plural(it[2], 'line') + ' of symmetry.', it[1]());
      })
    ]
  });

  /* ================================================================ 1.1.2 ==== */
  lessons.push({
    id: '1.1.2', title: 'More Attributes of Polygons',
    focus: ['Quadrilateral hierarchy (square ⊂ rectangle ⊂ parallelogram)', 'Venn-diagram reasoning', 'Reflection vs rotation symmetry', 'Angles of a quadrilateral sum to 360°'],
    questions: [
      mc('Which statement is <em>always</em> true?', ['Every square is a rectangle', 'Every rectangle is a square', 'Every rhombus is a square', 'Every trapezoid is a parallelogram'], 0,
        'A square has four right angles, so it fits the definition of a rectangle. The reverse is not always true.'),
      mc('Which statement is true about <em>every</em> rectangle?', ['It is a parallelogram', 'It is a square', 'It is a rhombus', 'It has exactly one pair of parallel sides'], 0,
        'A rectangle has two pairs of parallel sides, so it is always a parallelogram.'),
      mc('A quadrilateral has four congruent sides. Which name <em>must</em> apply to it?', ['Rhombus', 'Square', 'Rectangle', 'Trapezoid'], 0,
        'Four congruent sides is the definition of a rhombus. It is a square only if it also has right angles.'),
      mc('A quadrilateral has four right angles and side lengths 3, 5, 3, 5. What is its most specific name?', ['Rectangle', 'Square', 'Rhombus', 'Kite'], 0,
        'Four right angles makes a rectangle. Since the sides are not all equal, it is not a square.'),
      mc('Shapes that belong in the overlap of these two circles are…', ['Squares', 'Trapezoids', 'Kites', 'All parallelograms'], 0,
        'A shape that is both a rhombus (4 congruent sides) and a rectangle (4 right angles) is a square.', venn('Rhombuses', 'Rectangles', '?')),
      mc('In this Venn diagram, which shape goes in the overlap?', ['Rectangle', 'Rhombus that is not a square', 'Trapezoid', 'Kite'], 0,
        'Every rectangle is a parallelogram, and every rectangle has 4 right angles, so rectangles sit in the overlap.', venn('Parallelograms', '4 right angles', '?')),
      mc('In the CPM definition, a trapezoid is a quadrilateral with…', ['Exactly one pair of parallel sides', 'Two pairs of parallel sides', 'Four congruent sides', 'No parallel sides'], 0,
        'CPM uses the "exclusive" definition: exactly one pair of parallel sides. So a parallelogram is not a trapezoid.'),
      mc('Three of these shapes are parallelograms. Which one is NOT?', ['Trapezoid', 'Square', 'Rectangle', 'Rhombus'], 0,
        'Squares, rectangles, and rhombuses all have two pairs of parallel sides. A trapezoid has only one pair.'),
      num('The interior angles of any quadrilateral add up to how many degrees?', 360, '°', 'Split any quadrilateral into two triangles: 2 × 180° = 360°.'),
      mc('Which shape has rotation symmetry but NO reflection symmetry?', ['A parallelogram that is not a rectangle or rhombus', 'A rectangle', 'An isosceles trapezoid', 'A kite'], 0,
        'A general parallelogram looks the same after a 180° turn, but no fold line matches it onto itself. Rectangles have both kinds; isosceles trapezoids and kites have only reflection symmetry.'),
      mc('A shape looks exactly the same after being turned only 90°. Which shape could it be?', ['Square', 'Rectangle that is not a square', 'Rhombus that is not a square', 'Isosceles trapezoid'], 0,
        'A square has 90° rotation symmetry (four turns per full circle). A non-square rectangle or rhombus only matches after 180°.'),
      mc('Which quadrilateral has exactly one line of symmetry and no rotation symmetry?', ['Kite', 'Square', 'Parallelogram', 'Rhombus'], 0,
        'A kite reflects across one diagonal only. A square has 4 lines and rotation symmetry; a rhombus has 2 lines; a general parallelogram has none.'),
      mc('Which statement is <em>always</em> true for a parallelogram?', ['Opposite sides are parallel and congruent', 'All angles are right angles', 'All four sides are congruent', 'It has exactly one line of symmetry'], 0,
        'Parallelograms always have opposite sides parallel and congruent. Right angles or four equal sides only happen in special parallelograms.'),
      mc('Which shape is a counterexample to "every quadrilateral with two pairs of congruent sides is a parallelogram"?', ['Kite', 'Rhombus', 'Rectangle', 'Square'], 0,
        'A kite has two pairs of congruent sides, but they are adjacent, not opposite, so it is not a parallelogram.'),
      mc('A rhombus has one right angle. What must it be?', ['A square', 'A trapezoid', 'A kite that is not a rhombus', 'A rectangle that is not a square'], 0,
        'In a rhombus opposite angles are equal and adjacent angles are supplementary, so one right angle forces all four: it is a square.'),
      mc('Which shape has exactly 2 lines of symmetry?', ['Rectangle that is not a square', 'Square', 'Kite', 'Scalene triangle'], 0,
        'A non-square rectangle: one vertical and one horizontal line. A square has 4, a kite has 1, a scalene triangle has 0.', SHAPES.rectangle()),
      mc('Maria says: "My quadrilateral has 4 right angles, so it must be a square." What is wrong with her reasoning?', ['It could be a rectangle that is not a square', 'Squares do not have right angles', 'It could be a trapezoid', 'Nothing, she is correct'], 0,
        'Four right angles guarantees a rectangle. You also need four congruent sides to be sure it is a square.'),
      gen(function (rnd) {
        var a = ri(rnd, 50, 130), b = ri(rnd, 50, 130), c = ri(rnd, 40, Math.min(140, 330 - a - b)), d = 360 - a - b - c;
        return num('Three angles of a quadrilateral measure ' + deg(a) + ', ' + deg(b) + ', and ' + deg(c) + '. What is the fourth angle?', d, '°',
          'The four angles add to 360°: 360 − (' + a + ' + ' + b + ' + ' + c + ') = ' + d + '°.');
      }),
      gen(function (rnd) {
        var n = pick(rnd, [3, 4, 5, 6, 8, 9, 10, 12]);
        var c = choices4(rnd, 360 / n, [360 / n * 2, 180 / n, n, 360 / (n - 1), 360 / (n + 1)].map(function (v) { return Math.round(v); }), function (v) { return v + '°'; });
        return mc('What is the smallest turn that maps a regular ' + polyName(n) + ' onto itself (its angle of rotation symmetry)?', c.choices, 0,
          'A regular ' + polyName(n) + ' has ' + n + '-fold rotation symmetry: 360° ÷ ' + n + ' = ' + Math.round(360 / n) + '°.', SHAPES.regular(n));
      }),
      gen(function (rnd) {
        var odd = pick(rnd, ['Trapezoid', 'Kite']);
        var rest = shuffle(rnd, ['Square', 'Rectangle', 'Rhombus', 'Parallelogram']).slice(0, 3);
        return mc('Which of these is NOT a parallelogram?', [odd].concat(rest), 0,
          (odd === 'Trapezoid' ? 'A trapezoid has only one pair of parallel sides.' : 'A kite\'s congruent sides are adjacent, and its opposite sides are not parallel.') + ' The other three all have two pairs of parallel sides.');
      }),
      gen(function (rnd) {
        var a = ri(rnd, 40, 140);
        return num('In a parallelogram, one angle measures ' + deg(a) + '. What is the measure of the angle next to it (a consecutive angle)?', 180 - a, '°',
          'Consecutive angles of a parallelogram are supplementary: 180 − ' + a + ' = ' + (180 - a) + '°. (Opposite angles are equal.)', SHAPES.parallelogram());
      }),
      gen(function (rnd) {
        var facts = [
          ['a rectangle', 'Opposite sides are congruent', ['All four sides are congruent', 'The diagonals are perpendicular', 'Exactly one pair of sides is parallel']],
          ['a rhombus', 'All four sides are congruent', ['All four angles are right angles', 'Exactly one pair of sides is parallel', 'It has exactly one line of symmetry']],
          ['a square', 'It has four lines of symmetry', ['It has exactly two lines of symmetry', 'Its angles add to 180°', 'Only one pair of sides is parallel']],
          ['a kite', 'Two pairs of adjacent sides are congruent', ['Both pairs of opposite sides are parallel', 'All four angles are right angles', 'It has rotation symmetry of 90°']]
        ];
        var f = pick(rnd, facts);
        return mc('Jamal says his shape is ' + f[0] + '. Which statement <em>must</em> be true about it?', [f[1]].concat(f[2]), 0, 'For ' + f[0] + ': ' + f[1].toLowerCase() + '. The other statements are not guaranteed.');
      })
    ]
  });

  /* ================================================================ 1.2.1 ==== */
  var NR_POINTS = [[50, 62], [55, 70], [58, 74], [60, 80], [63, 85], [65, 91], [68, 95], [70, 100], [74, 108], [62, 60]];
  var NR_LABELS = ['', '', '', '', '', '', 'A', '', 'B', 'D'];
  NR_LABELS[2] = 'C';
  var NR_LINE = [[45, 57], [80, 113]];
  var ASSOC = [
    ['a person\'s height and their reach (fingertips to floor with arms up)', 'Positive'],
    ['hours of TV watched per week and test scores', 'Negative'],
    ['outside temperature and ice-cream sales', 'Positive'],
    ['the age of a car and its resale value', 'Negative'],
    ['a student\'s shoe size and their math grade', 'No association'],
    ['minutes spent running and calories burned', 'Positive'],
    ['altitude of a hike and the air temperature', 'Negative'],
    ['the number of letters in your name and your height', 'No association']
  ];
  lessons.push({
    id: '1.2.1', title: 'Making Predictions and Investigating Results',
    focus: ['Scatterplots and lines of best fit ("Newton\'s Revenge")', 'Predict with y = mx + b', 'Slope and y-intercept in context', 'Outliers, extrapolation, and why more data helps'],
    questions: [
      mc('For the "Newton\'s Revenge" roller coaster, the class plotted each student\'s height (x) against their reach (y). The points rise from left to right. What kind of association is this?',
        ['Positive', 'Negative', 'No association', 'Non-linear'], 0, 'When y goes up as x goes up, the association is positive: taller people tend to reach higher.', scatter(NR_POINTS.slice(0, 9), NR_LINE)),
      mc('What is a line of best fit used for?', ['To predict values that were not measured', 'To connect every data point exactly', 'To find the largest data value', 'To make the graph look neater'], 0,
        'A trend line models the pattern in the data so you can predict outputs for new inputs.'),
      mc('The line of best fit is reach = 1.2 &times; height + 8 (both in inches). What does the 1.2 tell you?',
        ['Each extra inch of height adds about 1.2 in of reach', 'Everyone can reach 1.2 in above their head', 'The shortest student was 1.2 in tall', 'Reach is always 1.2 in more than height'], 0,
        'The slope is the rate of change: about 1.2 inches of reach for every 1 inch of height.'),
      mc('In reach = 1.2 &times; height + 8, what does the 8 represent?',
        ['The y-intercept: the predicted reach of someone 0 in tall (not meaningful here)', 'The tallest rider', 'The number of students measured', 'The height of the tunnel'], 0,
        'The y-intercept is the value of y when x = 0. A 0-inch-tall person does not exist, so it is just part of the model, not a real measurement.'),
      mc('Which labelled point is an outlier?', ['D', 'A', 'B', 'C'], 0, 'Point D is far from the pattern of the other points. It might be a measurement error, or that student may simply be unusual.', scatter(NR_POINTS, NR_LINE, NR_LABELS)),
      mc('The class measured heights from 50 in to 74 in. Using the line to predict the reach of a 96-inch-tall person is…',
        ['An extrapolation, so it is less reliable', 'Impossible to compute', 'Always exactly correct', 'An interpolation, so it is very reliable'], 0,
        'Predicting outside the range of the data is extrapolation. The pattern may not continue, so be cautious.'),
      mc('Why does collecting more data usually help?', ['The pattern and the line of best fit become more reliable', 'It makes the slope larger', 'It removes all the outliers', 'It makes every prediction exact'], 0,
        'More points show the true pattern more clearly, so the trend line and its predictions are more trustworthy.'),
      mc('Which sentence describes a <em>negative</em> association?', ['As x increases, y tends to decrease', 'As x increases, y tends to increase', 'x and y are always equal', 'The points form a perfect circle'], 0,
        'Negative association: the trend line slopes downward.'),
      mc('An outlier is…', ['A data point far from the pattern of the rest', 'The largest y-value', 'The point closest to the line of best fit', 'Any point on the y-axis'], 0,
        'Outliers do not fit the overall trend. Check whether they are errors before deciding what to do with them.'),
      mc('When you use height to predict reach, which is the independent variable (x)?', ['Height', 'Reach', 'Both', 'Neither'], 0,
        'The variable you start with (input) goes on the x-axis; the one you predict (output) goes on the y-axis.'),
      num('The tunnel on the coaster is 96 in high. Reach = 1.3 &times; height + 5. What is the predicted reach of a rider who is 72 in (6 ft) tall?', 98.6, 'in', '1.3 × 72 + 5 = 93.6 + 5 = 98.6 in. That is over 96 in, so this rider could hit the tunnel.', null, 0.05),
      mc('A trend line predicts a reach of 91 in for a rider who is 66 in tall. The tunnel is 96 in high. Is that rider safe?', ['Yes, 91 in is less than 96 in', 'No, 91 in is more than 96 in', 'Cannot tell without the slope', 'No, everyone taller than 60 in is unsafe'], 0,
        'Compare the predicted reach with the tunnel height: 91 &lt; 96, so the rider clears the tunnel.'),
      gen(function (rnd) {
        var m = pick(rnd, [1.1, 1.2, 1.25, 1.3, 1.4]), b = ri(rnd, 2, 12), x = ri(rnd, 54, 76), y = r1(m * x + b);
        return num('The line of best fit is reach = ' + m + ' &times; height + ' + b + ' (inches). Predict the reach of a rider who is ' + x + ' in tall.', y, 'in',
          m + ' × ' + x + ' + ' + b + ' = ' + r1(m * x) + ' + ' + b + ' = ' + y + ' in.', null, 0.06);
      }),
      gen(function (rnd) {
        var m = pick(rnd, [1.2, 1.5, 2]), b = ri(rnd, 3, 12), x = ri(rnd, 40, 70), y = m * x + b;
        return num('Using the model y = ' + m + 'x + ' + b + ', a rider\'s predicted reach is y = ' + y + ' in. How tall is that rider (x)?', x, 'in',
          'Work backwards: (' + y + ' − ' + b + ') ÷ ' + m + ' = ' + (y - b) + ' ÷ ' + m + ' = ' + x + ' in.', null, 0.05);
      }),
      gen(function (rnd) {
        var a = pick(rnd, ASSOC);
        return mc('What kind of association would you expect between ' + a[0] + '?', choices4(rnd, a[1], ['Positive', 'Negative', 'No association', 'Perfectly linear']).choices, 0,
          a[1] === 'No association' ? 'These two things have nothing to do with each other, so the points would be scattered with no trend.' : a[1] === 'Positive' ? 'When one goes up, the other tends to go up too: positive association.' : 'When one goes up, the other tends to go down: negative association.');
      }),
      gen(function (rnd) {
        var m = pick(rnd, [1, 2, 3, 0.5, 1.5]), x1 = ri(rnd, 2, 8), x2 = x1 + pick(rnd, [2, 4, 6]), b = ri(rnd, 1, 9), y1 = m * x1 + b, y2 = m * x2 + b;
        return num('Two points on a trend line are (' + x1 + ', ' + y1 + ') and (' + x2 + ', ' + y2 + '). What is the slope of the line?', m, '',
          'slope = change in y ÷ change in x = (' + y2 + ' − ' + y1 + ') ÷ (' + x2 + ' − ' + x1 + ') = ' + (y2 - y1) + ' ÷ ' + (x2 - x1) + ' = ' + m + '.', null, 0.01);
      }),
      gen(function (rnd) {
        var ctx = pick(rnd, [
          ['pages read (x) and minutes spent (y)', 'minutes', 'page', 'y = 2.5x + 3', 2.5, 3],
          ['days (x) and plant height in cm (y)', 'cm', 'day', 'y = 0.8x + 6', 0.8, 6],
          ['weeks (x) and money saved in dollars (y)', 'dollars', 'week', 'y = 15x + 40', 15, 40]
        ]);
        return mc('A trend line for ' + ctx[0] + ' is ' + ctx[3] + '. What does the slope ' + ctx[4] + ' mean?',
          ['About ' + ctx[4] + ' more ' + ctx[1] + ' for each additional ' + ctx[2], 'The starting value is ' + ctx[4] + ' ' + ctx[1], 'There were ' + ctx[4] + ' data points', 'y is always ' + ctx[4] + ' times x'], 0,
          'Slope is the rate of change: ' + ctx[4] + ' ' + ctx[1] + ' per ' + ctx[2] + '. The ' + ctx[5] + ' is the starting value (y-intercept).');
      })
    ]
  });

  /* ================================================================ 1.2.2 ==== */
  function shapeNames() { return Object.keys(TILE_SHAPES); }
  lessons.push({
    id: '1.2.2', title: 'Perimeters and Areas of Enlarging Tile Patterns',
    focus: ['Count perimeter and area of tile figures', 'Enlarge by k: perimeter ×k, area ×k²', 'Tables: linear vs quadratic growth', 'Predict figure 10'],
    questions: [
      num('Each tile is 1 unit on a side. What is the perimeter of this figure?', tilePerimeter(TILE_SHAPES['L-shape']), 'units',
        'Count the outside edges: ' + tilePerimeter(TILE_SHAPES['L-shape']) + ' units. (Inside edges between tiles do not count.)', tileSVG(TILE_SHAPES['L-shape'])),
      num('What is the area of this figure, in square units?', 4, 'sq units', 'Area is the number of unit tiles: 4 square units.', tileSVG(TILE_SHAPES['L-shape'])),
      num('What is the perimeter of this T-shaped figure?', tilePerimeter(TILE_SHAPES['T-shape']), 'units', 'Count the unit edges around the outside: ' + tilePerimeter(TILE_SHAPES['T-shape']) + ' units.', tileSVG(TILE_SHAPES['T-shape'])),
      mc('A figure is enlarged so every side is 3 times as long. What happens to its perimeter?', ['It is multiplied by 3', 'It is multiplied by 9', 'It is multiplied by 6', 'It stays the same'], 0,
        'Perimeter is a length, so it grows by the same factor as the sides: ×3.'),
      mc('A figure is enlarged so every side is 3 times as long. What happens to its area?', ['It is multiplied by 9', 'It is multiplied by 3', 'It is multiplied by 6', 'It is multiplied by 27'], 0,
        'Area is two-dimensional: 3 × 3 = 9 times as much area (3²).'),
      mc('As the figure number goes up (1, 2, 3, …) and each figure is the original enlarged by that factor, how does the AREA grow?', ['It is multiplied by the square of the figure number', 'It is multiplied by the figure number', 'It increases by 2 each time', 'It stays the same'], 0,
        'Figure n has n times the length in each direction, so n × n = n² times the area. The area table grows quadratically.'),
      mc('Figures 1, 2, and 3 have perimeters 6, 12, and 18 units. Which kind of growth is this?', ['Linear', 'Quadratic', 'Exponential', 'No pattern'], 0,
        'The perimeter goes up by the same amount (6) each time, which is linear growth: P = 6n.'),
      mc('Which quantity is measured in square units?', ['Area', 'Perimeter', 'Side length', 'Number of sides'], 0, 'Area counts squares; perimeter is a length measured in plain units.'),
      mc('A square\'s side length is doubled. Its area becomes…', ['4 times as big', '2 times as big', '8 times as big', 'The same'], 0, 'Doubling both dimensions: 2 × 2 = 4 times the area.'),
      num('Figure 1 of a tile pattern has area 5 square units. Figure 4 is Figure 1 enlarged by a factor of 4. What is its area?', 80, 'sq units', '5 × 4² = 5 × 16 = 80 square units.'),
      txt('Figure 1 has a perimeter of 6 units and each figure is an enlargement of Figure 1 by the figure number. Write an expression for the perimeter of Figure n.', '6n', ['6*n', 'n*6', 'n6', '6×n'],
        'Perimeter grows linearly: Figure n has perimeter 6 × n = 6n.'),
      txt('Figure 1 has an area of 3 square units. Write an expression for the area of Figure n (Figure 1 enlarged by factor n).', '3n^2', ['3n²', '3*n^2', '3n**2', '3(n^2)', '3(n)^2'],
        'Area grows with the square of the factor: 3 × n² = 3n².'),
      num('This is the L-figure enlarged by a factor of 2 (each original tile became a 2 × 2 block). What is its perimeter?', tilePerimeter(scaleCells(TILE_SHAPES['L-shape'], 2)), 'units',
        'The original L had perimeter ' + tilePerimeter(TILE_SHAPES['L-shape']) + '. Doubling every side gives ' + tilePerimeter(scaleCells(TILE_SHAPES['L-shape'], 2)) + ' units.', tileSVG(scaleCells(TILE_SHAPES['L-shape'], 2), { cell: 20 })),
      gen(function (rnd) {
        var name = pick(rnd, shapeNames()), cells = TILE_SHAPES[name], k = pick(rnd, ['p', 'a']);
        if (k === 'p') return num('Each tile is 1 unit on a side. Find the perimeter of this figure.', tilePerimeter(cells), 'units', 'Count every outside edge: ' + tilePerimeter(cells) + ' units.', tileSVG(cells));
        return num('Each tile is 1 square unit. Find the area of this figure.', cells.length, 'sq units', 'Count the tiles: ' + cells.length + ' square units.', tileSVG(cells));
      }),
      gen(function (rnd) {
        var name = pick(rnd, ['small L', 'T-shape', 'S-shape']), cells = TILE_SHAPES[name], k = pick(rnd, [2, 3]);
        var big = scaleCells(cells, k), p1 = tilePerimeter(cells), p2 = tilePerimeter(big);
        return num('Figure 1 is shown. Figure ' + k + ' is Figure 1 enlarged so every side is ' + k + ' times as long. What is the perimeter of Figure ' + k + '?', p2, 'units',
          'Figure 1 has perimeter ' + p1 + '. Perimeter scales with the side lengths: ' + p1 + ' × ' + k + ' = ' + p2 + ' units.', tileSVG(cells));
      }),
      gen(function (rnd) {
        var name = pick(rnd, shapeNames()), cells = TILE_SHAPES[name], k = pick(rnd, [2, 3, 4, 5, 10]);
        return num('Figure 1 is shown (area ' + cells.length + ' sq units). What is the area of Figure ' + k + ', the enlargement by a factor of ' + k + '?', cells.length * k * k, 'sq units',
          'Area is multiplied by ' + k + '² = ' + (k * k) + ': ' + cells.length + ' × ' + (k * k) + ' = ' + (cells.length * k * k) + ' square units.', tileSVG(cells));
      }),
      gen(function (rnd) {
        var p1 = pick(rnd, [4, 6, 8, 10, 12]), n = pick(rnd, [4, 5, 6, 10]);
        var c = choices4(rnd, p1 * n, [p1 * n * n, p1 + n, p1 * (n - 1), p1 * n + p1]);
        return mc('A tile pattern has perimeters ' + p1 + ', ' + (2 * p1) + ', ' + (3 * p1) + ' for Figures 1, 2, 3. What is the perimeter of Figure ' + n + '?', c.choices, 0,
          'The perimeter is ' + p1 + ' × figure number, so Figure ' + n + ' has perimeter ' + p1 + ' × ' + n + ' = ' + (p1 * n) + '.');
      }),
      gen(function (rnd) {
        var a = ri(rnd, 2, 5), b = ri(rnd, a + 1, 8), k = pick(rnd, [2, 3, 4]), w = pick(rnd, ['p', 'a']);
        if (w === 'p') return num('A ' + a + ' &times; ' + b + ' rectangle is enlarged by a factor of ' + k + '. What is the perimeter of the new rectangle?', 2 * (a + b) * k, 'units',
          'New sides are ' + (a * k) + ' and ' + (b * k) + ': perimeter = 2(' + (a * k) + ' + ' + (b * k) + ') = ' + (2 * (a + b) * k) + '. (Same as ' + (2 * (a + b)) + ' × ' + k + '.)');
        return num('A ' + a + ' &times; ' + b + ' rectangle is enlarged by a factor of ' + k + '. What is the area of the new rectangle?', a * b * k * k, 'sq units',
          'New sides are ' + (a * k) + ' and ' + (b * k) + ': area = ' + (a * k) + ' × ' + (b * k) + ' = ' + (a * b * k * k) + '. (Same as ' + (a * b) + ' × ' + k + '².)');
      }),
      gen(function (rnd) {
        var a1 = pick(rnd, [2, 3, 4, 5]), n = pick(rnd, [3, 4, 5, 10]);
        var c = choices4(rnd, a1 * n * n, [a1 * n, a1 + n * n, a1 * n * 2, a1 * (n + 1) * (n + 1)]);
        return mc('Figure 1 has area ' + a1 + ' sq units, Figure 2 has area ' + (a1 * 4) + ', Figure 3 has area ' + (a1 * 9) + '. What is the area of Figure ' + n + '?', c.choices, 0,
          'Area = ' + a1 + ' × n²: ' + a1 + ' × ' + n + '² = ' + a1 + ' × ' + (n * n) + ' = ' + (a1 * n * n) + '.');
      })
    ]
  });

  /* ================================================================ 1.2.3 ==== */
  function sumForm(a, b, lead) { // (lead x + a)(x + b) -> sum string with ^2
    lead = lead || 1;
    var c2 = lead, c1 = lead * b + a, c0 = a * b;
    var s = (c2 === 1 ? '' : c2) + 'x^2';
    if (c1) s += (c1 > 0 ? '+' : '-') + (Math.abs(c1) === 1 ? '' : Math.abs(c1)) + 'x';
    if (c0) s += (c0 > 0 ? '+' : '-') + Math.abs(c0);
    return s;
  }
  function pretty(s) { return s.replace(/\^2/g, '²').replace(/\+/g, ' + ').replace(/-/g, ' − ').replace(/^ − /, '−'); }
  lessons.push({
    id: '1.2.3', title: 'Area as a Product and a Sum',
    focus: ['Algebra tiles: x², x, and unit tiles', 'Generic rectangles', 'Write area as a product and as a sum', 'Fill in a missing part of a generic rectangle'],
    questions: [
      mc('Which algebra tile has an area of x<sup>2</sup>?', ['A square with side length x', 'A rectangle that is x by 1', 'A 1 by 1 square', 'A rectangle that is 2 by x'], 0,
        'Area = side × side = x · x = x². The x by 1 tile has area x, and the unit tile has area 1.'),
      mc('What is the area of an x-tile?', ['x', 'x<sup>2</sup>', '1', '2x'], 0, 'The x-tile is x long and 1 wide, so its area is x · 1 = x.'),
      txt('A rectangle has dimensions 2x and (x + 3). Write its area as a sum.', '2x^2+6x', ['2x²+6x', '6x+2x^2', '2x*x+6x'],
        '2x · x = 2x² and 2x · 3 = 6x, so the area is 2x² + 6x.'),
      txt('Write the area of a rectangle with dimensions (x + 2) and (x + 5) as a sum.', 'x^2+7x+10', ['x²+7x+10'],
        'Multiply each part: x·x = x², x·5 = 5x, 2·x = 2x, 2·5 = 10. Total: x² + 7x + 10.', genRect(['x', '5'], ['x', '2'], [['x²', '5x'], ['2x', '10']])),
      num('What number belongs in the empty part of this generic rectangle?', 12, '', 'The bottom-right cell is 4 · 3 = 12.', genRect(['x', '3'], ['x', '4'], [['x²', '3x'], ['4x', '?']])),
      num('What number is missing from the top of this generic rectangle?', 5, '', 'The top-right cell is 5x = x · ?, so the missing dimension is 5. Check: 2 · 5 = 10 ✓.', genRect(['x', '?'], ['x', '2'], [['x²', '5x'], ['2x', '10']])),
      mc('A tile figure has one x<sup>2</sup> tile, five x tiles, and six unit tiles arranged as a rectangle. What are its dimensions (area as a product)?',
        ['(x + 2)(x + 3)', '(x + 1)(x + 6)', '(x + 5)(x + 6)', '(2x + 3)(x + 1)'], 0,
        'You need two numbers that multiply to 6 and add to 5: 2 and 3. So (x + 2)(x + 3) = x² + 5x + 6.'),
      mc('Which product equals x<sup>2</sup> + 5x + 6?', ['(x + 2)(x + 3)', '(x + 1)(x + 5)', '(x + 5)(x + 1)', '(x + 6)(x + 1)'], 0,
        '(x + 2)(x + 3) = x² + 3x + 2x + 6 = x² + 5x + 6.'),
      mc('"(x + 4)(x + 1)" describes the area of a rectangle as a…', ['Product', 'Sum', 'Difference', 'Perimeter'], 0,
        'Length × width is the area as a product. Adding up the tiles gives the area as a sum: x² + 5x + 4.'),
      txt('Write 3(x + 4) as a sum.', '3x+12', ['12+3x'], 'Distribute: 3 · x + 3 · 4 = 3x + 12.', genRect(['x', '4'], ['3', ''], [['3x', '12'], ['', '']])),
      mc('Which set of tiles builds a rectangle with dimensions (x + 1) by (x + 3)?', ['1 x² tile, 4 x tiles, 3 unit tiles', '1 x² tile, 3 x tiles, 1 unit tile', '2 x² tiles, 4 x tiles, 3 unit tiles', '1 x² tile, 3 x tiles, 4 unit tiles'], 0,
        '(x + 1)(x + 3) = x² + 3x + x + 3 = x² + 4x + 3.'),
      txt('What is the perimeter of a rectangle with sides x and (x + 3)?', '4x+6', ['6+4x', '2x+2x+6', '2(2x+3)'], 'Perimeter = 2 · x + 2 · (x + 3) = 2x + 2x + 6 = 4x + 6.'),
      num('A rectangle is x by (x + 4). If x = 5, what is its area?', 45, 'sq units', '5 × (5 + 4) = 5 × 9 = 45 square units.'),
      gen(function (rnd) {
        var a = ri(rnd, 1, 9), b = ri(rnd, 1, 9);
        var ans = sumForm(a, b);
        return txt('Write the area of a rectangle with dimensions (x + ' + a + ') and (x + ' + b + ') as a sum.', ans, [ans.replace('^2', '²')],
          'x·x = x², x·' + b + ' = ' + b + 'x, ' + a + '·x = ' + a + 'x, ' + a + '·' + b + ' = ' + (a * b) + '. Combine: ' + pretty(ans) + '.', genRect(['x', String(b)], ['x', String(a)], [['x²', b + 'x'], [a + 'x', String(a * b)]]));
      }),
      gen(function (rnd) {
        var a = ri(rnd, 1, 9), b = ri(rnd, 1, 9), which = pick(rnd, ['tr', 'bl', 'br']);
        var cells = [['x²', b + 'x'], [a + 'x', String(a * b)]], ans, expl;
        if (which === 'tr') { cells[0][1] = '?'; ans = b; expl = 'Top-right: x · ' + b + ' = ' + b + 'x, so the coefficient is ' + b + '.'; }
        else if (which === 'bl') { cells[1][0] = '?'; ans = a; expl = 'Bottom-left: ' + a + ' · x = ' + a + 'x, so the coefficient is ' + a + '.'; }
        else { cells[1][1] = '?'; ans = a * b; expl = 'Bottom-right: ' + a + ' · ' + b + ' = ' + (a * b) + '.'; }
        return num(which === 'br' ? 'What number goes in the empty cell of this generic rectangle?' : 'The empty cell holds some number of x-tiles. How many?', ans, '', expl, genRect(['x', String(b)], ['x', String(a)], cells));
      }),
      gen(function (rnd) {
        var k = ri(rnd, 2, 9), a = ri(rnd, 1, 9);
        return txt('Write ' + k + '(x + ' + a + ') as a sum.', k + 'x+' + (k * a), [(k * a) + '+' + k + 'x'], 'Distribute: ' + k + '·x + ' + k + '·' + a + ' = ' + k + 'x + ' + (k * a) + '.');
      }),
      gen(function (rnd) {
        var a = ri(rnd, 1, 6), b = ri(rnd, a + 1, 9), ask = pick(rnd, ['x', 'unit']);
        if (ask === 'x') return num('How many x-tiles are needed to build the rectangle (x + ' + a + ')(x + ' + b + ')?', a + b, '', 'The x-tiles come from x·' + b + ' and ' + a + '·x: ' + a + ' + ' + b + ' = ' + (a + b) + ' x-tiles.');
        return num('How many unit tiles are needed to build the rectangle (x + ' + a + ')(x + ' + b + ')?', a * b, '', 'The unit tiles are ' + a + ' × ' + b + ' = ' + (a * b) + '.');
      }),
      gen(function (rnd) {
        var a = ri(rnd, 1, 5), b = ri(rnd, a + 1, 9), s = a + b, p = a * b;
        var correct = '(x + ' + a + ')(x + ' + b + ')';
        var key = function (c, d) { return Math.min(c, d) + ',' + Math.max(c, d); }, seen = {}; seen[key(a, b)] = true;
        var wrong = [];
        [[a, p], [1, p], [s, p], [a + 1, b - 1], [a, b + 1], [a + 1, b], [s, 1], [a, s]].forEach(function (c) {
          if (c[0] < 1 || c[1] < 1 || wrong.length >= 3) return; var k = key(c[0], c[1]);
          if (!seen[k]) { seen[k] = true; wrong.push('(x + ' + c[0] + ')(x + ' + c[1] + ')'); }
        });
        return mc('Which product equals x<sup>2</sup> + ' + s + 'x + ' + p + '?', [correct].concat(wrong), 0, 'Find two numbers that multiply to ' + p + ' and add to ' + s + ': ' + a + ' and ' + b + '. So ' + correct + '.');
      }),
      gen(function (rnd) {
        var a = ri(rnd, 1, 5), b = ri(rnd, 1, 5), lead = 2;
        var ans = sumForm(a, b, lead);
        return txt('Write the area of a rectangle with dimensions (2x + ' + a + ') and (x + ' + b + ') as a sum.', ans, [ans.replace('^2', '²')],
          '2x·x = 2x², 2x·' + b + ' = ' + (2 * b) + 'x, ' + a + '·x = ' + a + 'x, ' + a + '·' + b + ' = ' + (a * b) + '. Combine: ' + pretty(ans) + '.', genRect(['x', String(b)], ['2x', String(a)], [['2x²', (2 * b) + 'x'], [a + 'x', String(a * b)]]));
      }),
      gen(function (rnd) {
        var a = ri(rnd, 1, 6), x = ri(rnd, 2, 9);
        return num('A rectangle has dimensions x and (x + ' + a + '). If x = ' + x + ', what is its area?', x * (x + a), 'sq units', x + ' × (' + x + ' + ' + a + ') = ' + x + ' × ' + (x + a) + ' = ' + (x * (x + a)) + '.');
      })
    ]
  });

  /* ================================================================ 1.2.4 ==== */
  var G_PARAB = graph({ fn: function (x) { return x * x - 4; } });
  var G_PARAB_DOWN = graph({ fn: function (x) { return -x * x + 4; } });
  var G_LINE = graph({ fn: function (x) { return -x + 3; } });
  var G_V = graph({ fn: function (x) { return Math.abs(x) - 2; } });
  var G_SEG = graph({ seg: [[-3, 1], [2, 4]] });
  lessons.push({
    id: '1.2.4', title: 'Describing a Graph',
    focus: ['x- and y-intercepts', 'Increasing / decreasing, maximum / minimum', 'Domain and range', 'Linear vs non-linear, continuous vs discrete, symmetry'],
    questions: [
      mc('Where does this parabola cross the x-axis (x-intercepts)?', ['x = −2 and x = 2', 'x = −4 only', 'x = 0 only', 'x = 4 and x = −4'], 0,
        'The graph touches the x-axis at (−2, 0) and (2, 0).', G_PARAB),
      num('What is the y-intercept of this graph (the y-value where it crosses the y-axis)?', -4, '', 'The graph crosses the y-axis at (0, −4), so the y-intercept is −4.', G_PARAB),
      mc('For which x-values is this graph <em>decreasing</em> (going down as you move right)?', ['x &lt; 0', 'x &gt; 0', 'All x-values', 'x &lt; −4'], 0,
        'To the left of the vertex (x &lt; 0) the curve falls; to the right it rises.', G_PARAB),
      mc('Does this graph have a maximum or a minimum?', ['A minimum at (0, −4)', 'A maximum at (0, −4)', 'A maximum at (2, 0)', 'Neither'], 0,
        'The parabola opens up, so its vertex (0, −4) is the lowest point: a minimum.', G_PARAB),
      mc('Which best describes this graph?', ['Linear and decreasing', 'Linear and increasing', 'Non-linear and decreasing', 'Non-linear and increasing'], 0,
        'It is a straight line (linear) that goes down as x increases (decreasing).', G_LINE),
      mc('What symmetry does this graph have?', ['Reflection symmetry across the y-axis', 'Reflection symmetry across the x-axis', 'Rotation symmetry only', 'No symmetry'], 0,
        'The left side is a mirror image of the right side across the vertical line x = 0.', G_V),
      mc('What is the <em>domain</em> of this segment (the x-values it covers)?', ['−3 ≤ x ≤ 2', '1 ≤ x ≤ 4', 'All real numbers', '−3 ≤ x ≤ 4'], 0,
        'Domain = x-values. The segment runs from x = −3 to x = 2, and the filled dots mean the endpoints are included.', G_SEG),
      mc('What is the <em>range</em> of this segment (the y-values it covers)?', ['1 ≤ y ≤ 4', '−3 ≤ y ≤ 2', 'All real numbers', '−3 ≤ y ≤ 4'], 0,
        'Range = y-values. The segment goes from y = 1 up to y = 4.', G_SEG),
      mc('A graph shows the number of students in class on each school day. Is it continuous or discrete?', ['Discrete', 'Continuous', 'Both', 'Neither'], 0,
        'You can only have whole numbers of students and separate days, so the graph is a set of separate points: discrete.'),
      mc('A graph shows the temperature outside over one day. Is it continuous or discrete?', ['Continuous', 'Discrete', 'Both', 'Neither'], 0,
        'Temperature changes smoothly through every value in between, so the graph is a connected curve: continuous.'),
      mc('What is the range of this parabola (the whole graph continues up forever)?', ['y ≥ −4', 'y ≤ −4', 'All real numbers', '−2 ≤ y ≤ 2'], 0,
        'The lowest point is y = −4 and the graph goes up without end, so y ≥ −4.', G_PARAB),
      mc('Which describes the maximum of this graph?', ['A maximum at (0, 4)', 'A minimum at (0, 4)', 'A maximum at (2, 0)', 'There is no maximum'], 0,
        'The parabola opens down, so the vertex (0, 4) is the highest point.', G_PARAB_DOWN),
      mc('For which x-values is this graph <em>increasing</em>?', ['x &lt; 0', 'x &gt; 0', 'All x-values', 'Never'], 0,
        'Moving right, the curve rises until x = 0 and then falls.', G_PARAB_DOWN),
      mc('Where does a graph cross the x-axis?', ['Where y = 0', 'Where x = 0', 'At its highest point', 'At the origin only'], 0, 'Every point on the x-axis has y = 0.'),
      mc('Which equation is NOT linear?', ['y = x<sup>2</sup>', 'y = 2x + 1', 'y = −3x', 'y = 5'], 0, 'y = x² makes a curve (parabola). The others graph as straight lines.'),
      mc('What is the y-intercept of this line?', ['(0, 3)', '(3, 0)', '(0, −3)', '(0, 0)'], 0, 'The line crosses the y-axis at y = 3.', G_LINE),
      gen(function (rnd) {
        var m = pick(rnd, [1, 2, 3, -1, -2]), b = ri(rnd, -5, 8), xs = [0, 1, 2, 3], ys = xs.map(function (x) { return m * x + b; });
        return num('A table for a graph shows x: ' + xs.join(', ') + ' and y: ' + ys.join(', ') + '. What is the y-intercept?', b, '',
          'The y-intercept is the y-value when x = 0, which is ' + b + '.');
      }),
      gen(function (rnd) {
        var lin = rnd() < 0.5, m = pick(rnd, [2, 3, -2, 4]), b = ri(rnd, -3, 5), xs = [1, 2, 3, 4];
        var ys = xs.map(function (x) { return lin ? m * x + b : x * x + b; });
        return mc('A table shows x: ' + xs.join(', ') + ' and y: ' + ys.join(', ') + '. Is the graph linear or non-linear?', lin ? ['Linear: y changes by the same amount each step', 'Non-linear: y changes by different amounts', 'Cannot tell from a table', 'Linear because x goes up by 1'] : ['Non-linear: y changes by different amounts', 'Linear: y changes by the same amount each step', 'Cannot tell from a table', 'Linear because x goes up by 1'], 0,
          lin ? 'Each time x increases by 1, y changes by ' + m + '. A constant rate of change means linear.' : 'The differences in y are ' + (ys[1] - ys[0]) + ', ' + (ys[2] - ys[1]) + ', ' + (ys[3] - ys[2]) + ' — not constant, so the graph curves.');
      }),
      gen(function (rnd) {
        var m = pick(rnd, [1, 2, 3, 4, -1, -2]), x0 = ri(rnd, -5, 5) || 3, b = -m * x0;
        return num('Where does the line y = ' + (m === 1 ? '' : m === -1 ? '−' : m) + 'x ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + ' cross the x-axis? Give the x-value.', x0, '',
          'Set y = 0: 0 = ' + m + 'x ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + ', so x = ' + x0 + '. The x-intercept is (' + x0 + ', 0).');
      }),
      gen(function (rnd) {
        var x1 = ri(rnd, -5, -1), x2 = ri(rnd, 1, 5), y1 = ri(rnd, -5, 1), y2 = ri(rnd, y1 + 1, 5), ask = pick(rnd, ['domain', 'range']);
        var svg = graph({ seg: [[x1, y1], [x2, y2]] });
        var dom = x1 + ' ≤ x ≤ ' + x2, ran = y1 + ' ≤ y ≤ ' + y2;
        if (ask === 'domain') return mc('What is the domain of this segment?', [dom, ran, x1 + ' ≤ x ≤ ' + (x2 + 1), 'All real numbers'], 0, 'Domain = the x-values covered: from ' + x1 + ' to ' + x2 + '.', svg);
        return mc('What is the range of this segment?', [ran, dom, (y1 - 1) + ' ≤ y ≤ ' + y2, 'All real numbers'], 0, 'Range = the y-values covered: from ' + y1 + ' to ' + y2 + '.', svg);
      }),
      gen(function (rnd) {
        var up = rnd() < 0.5, k = ri(rnd, -4, 4), h = pick(rnd, [-2, -1, 0, 1, 2]);
        var svg = graph({ fn: function (x) { return (up ? 1 : -1) * (x - h) * (x - h) + k; } });
        var ans = (up ? 'Minimum' : 'Maximum') + ' at (' + h + ', ' + k + ')';
        return mc('Describe the highest or lowest point of this graph.', [ans, (up ? 'Maximum' : 'Minimum') + ' at (' + h + ', ' + k + ')', (up ? 'Minimum' : 'Maximum') + ' at (' + h + ', ' + (k + 2) + ')', 'It has no maximum or minimum'], 0,
          'The vertex is at (' + h + ', ' + k + '). The parabola opens ' + (up ? 'up, so that point is a minimum.' : 'down, so that point is a maximum.'), svg);
      })
    ]
  });

  /* ================================================================ 1.3.1 ==== */
  function classify(a) { return a < 90 ? 'Acute' : a === 90 ? 'Right' : a < 180 ? 'Obtuse' : 'Straight'; }
  lessons.push({
    id: '1.3.1', title: 'Angle Pair Relationships',
    focus: ['Complementary (90°) and supplementary (180°)', 'Vertical angles are congruent', 'Adjacent angles, straight angles, angles around a point', 'Naming and classifying angles'],
    questions: [
      mc('Two angles are <em>complementary</em>. What is the sum of their measures?', ['90°', '180°', '360°', '45°'], 0, 'Complementary angles add to 90° (think "corner"). Supplementary angles add to 180° (think "straight").'),
      mc('Two angles are <em>supplementary</em>. What is the sum of their measures?', ['180°', '90°', '360°', '270°'], 0, 'Supplementary angles add up to a straight angle: 180°.'),
      mc('In this diagram, the angles marked a and c are…', ['Vertical angles', 'Complementary angles', 'Adjacent angles', 'Corresponding angles'], 0,
        'Angles across from each other where two lines cross are vertical angles, and they are always congruent.', cross({ top: 'a', right: 'b', bottom: 'c', left: 'd' })),
      mc('Vertical angles are always…', ['Congruent (equal)', 'Supplementary', 'Complementary', 'Right angles'], 0, 'Two intersecting lines make two pairs of vertical angles, and each pair is congruent.'),
      mc('In ∠ABC, which point is the vertex?', ['B', 'A', 'C', 'It could be any of them'], 0, 'The vertex is always the middle letter in the name of the angle.'),
      mc('The angles around a single point add up to…', ['360°', '180°', '90°', '270°'], 0, 'A full turn is 360°.'),
      mc('Two angles share a vertex and a side but do not overlap. They are called…', ['Adjacent angles', 'Vertical angles', 'Complementary angles', 'Alternate angles'], 0,
        'Adjacent means "next to": they share a common ray and vertex.'),
      mc('Two adjacent angles whose outer sides form a straight line are called…', ['A linear pair (supplementary)', 'Vertical angles', 'Complementary angles', 'A right angle'], 0,
        'A straight angle is 180°, so the two angles of a linear pair add to 180°: they are supplementary.'),
      mc('If two angles are both congruent and supplementary, each one measures…', ['90°', '45°', '180°', '60°'], 0, 'x + x = 180, so x = 90. They are right angles.'),
      mc('Can two obtuse angles be supplementary?', ['No — each is more than 90°, so their sum is more than 180°', 'Yes, always', 'Yes, if they are vertical angles', 'Only if they are congruent'], 0,
        'Obtuse means over 90°. Two of them add to more than 180°, so they cannot be supplementary.'),
      mc('The complement of an acute angle is always…', ['Acute', 'Obtuse', 'Right', 'Straight'], 0, 'If a &lt; 90, then 90 − a is also between 0 and 90: acute.'),
      num('In this diagram one angle is 40°. What is the measure of the angle marked <em>x</em>?', 140, '°', 'The 40° angle and x form a straight line, so x = 180 − 40 = 140°.', cross({ right: '40°', top: 'x' })),
      num('One angle is 40°. What is the measure of the angle marked <em>y</em>?', 40, '°', 'y is vertical to the 40° angle, so y = 40°.', cross({ right: '40°', left: 'y' })),
      mc('An angle measures exactly 90°. It is a…', ['Right angle', 'Acute angle', 'Obtuse angle', 'Straight angle'], 0, 'Right = 90°, acute &lt; 90°, obtuse between 90° and 180°, straight = 180°.'),
      gen(function (rnd) {
        var a = ri(rnd, 5, 85);
        return num('One angle measures ' + deg(a) + '. What is the measure of its complement?', 90 - a, '°', 'Complementary angles add to 90°: 90 − ' + a + ' = ' + (90 - a) + '°.');
      }),
      gen(function (rnd) {
        var a = ri(rnd, 10, 170);
        return num('One angle measures ' + deg(a) + '. What is the measure of its supplement?', 180 - a, '°', 'Supplementary angles add to 180°: 180 − ' + a + ' = ' + (180 - a) + '°.');
      }),
      gen(function (rnd) {
        var a = ri(rnd, 30, 80), ask = pick(rnd, ['v', 's']), lab = { right: deg(a) };
        if (ask === 'v') { lab.left = 'x'; return num('Two lines intersect. Find x.', a, '°', 'x and the ' + a + '° angle are vertical angles, so they are congruent: x = ' + a + '°.', cross(lab)); }
        lab.top = 'x'; return num('Two lines intersect. Find x.', 180 - a, '°', 'x and the ' + a + '° angle form a straight line (linear pair): x = 180 − ' + a + ' = ' + (180 - a) + '°.', cross(lab));
      }),
      gen(function (rnd) {
        var x = ri(rnd, 5, 30), m = ri(rnd, 2, 5), c = ri(rnd, 1, 20), a = m * x + c;
        return num('Vertical angles measure (' + m + 'x + ' + c + ')° and ' + deg(a) + '. Find x.', x, '', 'Vertical angles are equal: ' + m + 'x + ' + c + ' = ' + a + ', so ' + m + 'x = ' + (a - c) + ' and x = ' + x + '.', cross({ right: '(' + m + 'x+' + c + ')°', left: deg(a) }));
      }),
      gen(function (rnd) {
        var x = ri(rnd, 10, 40), m = ri(rnd, 2, 4), a = ri(rnd, 30, 100), c = 180 - a - m * x;
        while (c < 1) { x -= 2; c = 180 - a - m * x; }
        return num('Two angles form a straight line. One measures (' + m + 'x + ' + c + ')° and the other measures ' + deg(a) + '. Find x.', x, '',
          'A linear pair adds to 180°: ' + m + 'x + ' + c + ' + ' + a + ' = 180, so ' + m + 'x = ' + (180 - a - c) + ' and x = ' + x + '.', cross({ right: deg(a), top: '(' + m + 'x+' + c + ')°' }));
      }),
      gen(function (rnd) {
        var a = ri(rnd, 15, 75);
        return num('∠A and ∠B are complementary. If m∠A = ' + deg(a) + ', what is m∠B?', 90 - a, '°', 'm∠B = 90 − ' + a + ' = ' + (90 - a) + '°.');
      }),
      gen(function (rnd) {
        var a = pick(rnd, [12, 35, 47, 68, 89, 90, 91, 105, 128, 150, 179, 180]);
        return mc('An angle measures ' + deg(a) + '. Classify it.', choices4(rnd, classify(a), ['Acute', 'Right', 'Obtuse', 'Straight']).choices, 0,
          a === 90 ? 'Exactly 90° is a right angle.' : a === 180 ? 'Exactly 180° is a straight angle.' : a < 90 ? 'Less than 90° is acute.' : 'Between 90° and 180° is obtuse.');
      }),
      gen(function (rnd) {
        var a = ri(rnd, 80, 140), b = ri(rnd, 60, 120), c = 360 - a - b;
        return num('Three angles meet around a point. Two of them measure ' + deg(a) + ' and ' + deg(b) + '. What is the third angle?', c, '°', 'Angles around a point add to 360°: 360 − ' + a + ' − ' + b + ' = ' + c + '°.');
      })
    ]
  });

  /* ================================================================ 1.3.2 ==== */
  var PAIRS = {
    'Corresponding angles': [[1, 5], [2, 6], [3, 7], [4, 8]],
    'Alternate interior angles': [[3, 6], [4, 5]],
    'Alternate exterior angles': [[1, 8], [2, 7]],
    'Same-side interior angles': [[3, 5], [4, 6]],
    'Vertical angles': [[1, 4], [2, 3], [5, 8], [6, 7]],
    'Linear pair': [[1, 2], [3, 4], [5, 6], [7, 8], [1, 3], [2, 4], [5, 7], [6, 8]]
  };
  var PAIR_NAMES = Object.keys(PAIRS);
  function numbered() { var l = {}; for (var i = 1; i <= 8; i++) l[i] = String(i); return trans(l); }
  var TNUM = numbered();
  function sameClass(i, j) { return !!TACUTE[i] === !!TACUTE[j]; }
  function pairExplain(name) {
    return {
      'Corresponding angles': 'Corresponding angles sit in the same position at each intersection (both upper-left, both lower-right, etc.). With parallel lines they are congruent.',
      'Alternate interior angles': 'Alternate interior angles are between the parallel lines and on opposite sides of the transversal. They are congruent.',
      'Alternate exterior angles': 'Alternate exterior angles are outside the parallel lines and on opposite sides of the transversal. They are congruent.',
      'Same-side interior angles': 'Same-side (consecutive) interior angles are between the parallel lines on the same side of the transversal. They are supplementary.',
      'Vertical angles': 'Vertical angles are across from each other at one intersection. They are congruent.',
      'Linear pair': 'They are next to each other and form a straight line, so they are supplementary.'
    }[name];
  }
  lessons.push({
    id: '1.3.2', title: 'Angles Formed by Transversals',
    focus: ['Corresponding, alternate interior, alternate exterior', 'Same-side interior angles are supplementary', 'Identify the pair type from a diagram', 'Find a missing angle with parallel lines'],
    questions: [
      mc('Lines m and n are parallel and t is a transversal. ∠1 and ∠5 are…', ['Corresponding angles', 'Alternate interior angles', 'Same-side interior angles', 'Vertical angles'], 0, pairExplain('Corresponding angles'), TNUM),
      mc('∠3 and ∠6 are…', ['Alternate interior angles', 'Corresponding angles', 'Alternate exterior angles', 'Same-side interior angles'], 0, pairExplain('Alternate interior angles'), TNUM),
      mc('∠4 and ∠6 are…', ['Same-side interior angles', 'Alternate interior angles', 'Corresponding angles', 'Vertical angles'], 0, pairExplain('Same-side interior angles'), TNUM),
      mc('∠1 and ∠8 are…', ['Alternate exterior angles', 'Alternate interior angles', 'Corresponding angles', 'Same-side interior angles'], 0, pairExplain('Alternate exterior angles'), TNUM),
      mc('∠2 and ∠3 are…', ['Vertical angles', 'Corresponding angles', 'Alternate interior angles', 'A linear pair'], 0, pairExplain('Vertical angles'), TNUM),
      mc('When two parallel lines are cut by a transversal, corresponding angles are…', ['Congruent', 'Supplementary', 'Complementary', 'Always 90°'], 0, 'Corresponding angles are congruent whenever the lines are parallel.'),
      mc('When two parallel lines are cut by a transversal, same-side interior angles are…', ['Supplementary', 'Congruent', 'Complementary', 'Always obtuse'], 0, 'Same-side interior angles add to 180°.'),
      mc('A <em>transversal</em> is…', ['A line that crosses two or more other lines', 'A line parallel to another line', 'A line that bisects an angle', 'Any horizontal line'], 0, 'The transversal creates the eight angles we study.'),
      mc('Which angles are the <em>interior</em> angles?', ['∠3, ∠4, ∠5, ∠6', '∠1, ∠2, ∠7, ∠8', '∠1, ∠4, ∠5, ∠8', '∠2, ∠3, ∠6, ∠7'], 0, 'Interior angles lie between the two parallel lines. Exterior angles (1, 2, 7, 8) lie outside them.', TNUM),
      mc('Alternate interior angles are on ___ sides of the transversal and ___ the parallel lines.', ['opposite; between', 'the same; between', 'opposite; outside', 'the same; outside'], 0, '"Alternate" means opposite sides of the transversal; "interior" means between the parallel lines.'),
      mc('Lines m ∥ n. Which pair of angles must be supplementary?', ['∠3 and ∠5', '∠1 and ∠5', '∠2 and ∠7', '∠4 and ∠5'], 0, '∠3 and ∠5 are same-side interior angles, so they add to 180°. The other pairs are congruent.', TNUM),
      num('Lines m ∥ n and ∠1 = 65°. What is the measure of ∠5?', 65, '°', '∠1 and ∠5 are corresponding angles, so ∠5 = 65°.', trans({ 1: '65°', 5: '?' })),
      num('Lines m ∥ n and ∠1 = 65°. What is the measure of ∠6?', 115, '°', '∠6 is a linear pair with ∠5 (which equals 65° by corresponding angles), so ∠6 = 180 − 65 = 115°.', trans({ 1: '65°', 6: '?' })),
      gen(function (rnd) {
        var name = pick(rnd, PAIR_NAMES.slice(0, 4)), pr = pick(rnd, PAIRS[name]);
        if (rnd() < 0.5) pr = [pr[1], pr[0]];
        return mc('Lines m ∥ n. ∠' + pr[0] + ' and ∠' + pr[1] + ' are…', choices4(rnd, name, PAIR_NAMES.slice(0, 5)).choices, 0, pairExplain(name), TNUM);
      }),
      gen(function (rnd) {
        var i = ri(rnd, 1, 8), j = ri(rnd, 1, 8); if (j === i) j = (i % 8) + 1;
        var a = TACUTE[i] ? ri(rnd, 35, 80) : ri(rnd, 100, 145), ans = sameClass(i, j) ? a : 180 - a, lab = {}; lab[i] = deg(a); lab[j] = '?';
        var why = sameClass(i, j) ? 'the angles are congruent (corresponding, alternate, or vertical angles), so ∠' + j + ' = ' + a + '°.' : 'the angles are supplementary (a linear pair or same-side angles), so ∠' + j + ' = 180 − ' + a + ' = ' + (180 - a) + '°.';
        return num('Lines m ∥ n and ∠' + i + ' = ' + deg(a) + '. Find the measure of ∠' + j + ' (marked ?).', ans, '°', 'With parallel lines, ' + why, trans(lab));
      }),
      gen(function (rnd) {
        var i = ri(rnd, 1, 8), a = TACUTE[i] ? ri(rnd, 35, 80) : ri(rnd, 100, 145);
        var same = [1, 2, 3, 4, 5, 6, 7, 8].filter(function (k) { return k !== i && sameClass(k, i); });
        var other = [1, 2, 3, 4, 5, 6, 7, 8].filter(function (k) { return !sameClass(k, i); });
        var lab = {}; lab[i] = deg(a);
        var correct = '∠' + same.join(', ∠');
        var wrong1 = '∠' + other.slice(0, 3).join(', ∠'), wrong2 = '∠' + shuffle(rnd, other).slice(0, 2).concat(same.slice(0, 1)).sort().join(', ∠'), wrong3 = 'Only ∠' + same[0];
        return mc('Lines m ∥ n and ∠' + i + ' = ' + deg(a) + '. Which other angles also measure ' + deg(a) + '?', [correct, wrong1, wrong2, wrong3], 0,
          'The vertical angle, the corresponding angle, and the corresponding angle\'s vertical angle all equal ' + a + '°. The other four angles are 180 − ' + a + ' = ' + (180 - a) + '°.', trans(lab));
      }),
      gen(function (rnd) {
        var name = pick(rnd, ['Corresponding angles', 'Alternate interior angles', 'Alternate exterior angles', 'Same-side interior angles', 'Vertical angles']);
        var rel = name === 'Same-side interior angles' ? 'Supplementary (they add to 180°)' : 'Congruent (equal)';
        return mc('Two parallel lines are cut by a transversal. ' + name + ' are…', [rel, rel[0] === 'C' ? 'Supplementary (they add to 180°)' : 'Congruent (equal)', 'Complementary (they add to 90°)', 'Always right angles'], 0, pairExplain(name));
      })
    ]
  });

  /* ================================================================ 1.3.3 ==== */
  function expr(m, c) { return '(' + (m === 1 ? '' : m) + 'x' + (c === 0 ? '' : c > 0 ? ' + ' + c : ' − ' + (-c)) + ')°'; }
  function exprS(m, c) { return '(' + (m === 1 ? '' : m) + 'x' + (c === 0 ? '' : c > 0 ? '+' + c : '−' + (-c)) + ')°'; }
  lessons.push({
    id: '1.3.3', title: 'More Angles Formed by Transversals',
    focus: ['Solve for x when angle measures are expressions', 'Alternate exterior angles', 'Converse: congruent corresponding angles ⇒ parallel lines', 'Decide whether two lines are parallel'],
    questions: [
      mc('Two lines are cut by a transversal and a pair of corresponding angles are congruent. What can you conclude?', ['The lines are parallel', 'The lines are perpendicular', 'The angles are right angles', 'Nothing'], 0,
        'This is the converse of the corresponding-angles fact: congruent corresponding angles mean the lines must be parallel.'),
      mc('A transversal crosses two lines. A pair of alternate interior angles measure 110° and 105°. Are the lines parallel?', ['No, because alternate interior angles would have to be congruent', 'Yes, because both angles are obtuse', 'Yes, because they add to 215°', 'Cannot tell'], 0,
        'If the lines were parallel, alternate interior angles would be equal. 110 ≠ 105, so the lines are not parallel.', trans({ 3: '110°', 6: '105°' }, { parallel: false, names: ['a', 'b', 't'] })),
      mc('A pair of same-side interior angles measure 75° and 105°. Are the lines parallel?', ['Yes, because 75 + 105 = 180', 'No, because the angles are not equal', 'No, because 75 + 105 ≠ 90', 'Cannot tell'], 0,
        'Same-side interior angles of parallel lines are supplementary. 75 + 105 = 180 ✓, so the lines are parallel.', trans({ 4: '75°', 6: '105°' }, { parallel: false, names: ['a', 'b', 't'] })),
      mc('Which fact lets you conclude that two lines are parallel?', ['A pair of alternate interior angles are congruent', 'A pair of vertical angles are congruent', 'A pair of angles at one intersection add to 180°', 'The transversal is horizontal'], 0,
        'Vertical angles and linear pairs are always true no matter what — they tell you nothing about parallel lines. Alternate interior angles are congruent only when the lines are parallel.'),
      num('Lines m ∥ n. The corresponding angles measure (4x + 8)° and 100°. Find x.', 23, '', 'Corresponding angles are equal: 4x + 8 = 100, 4x = 92, x = 23.', trans({ 1: '(4x+8)°', 5: '100°' })),
      mc('Two parallel lines are cut by a transversal and one angle is 40°. What are the measures of all eight angles?', ['Four are 40° and four are 140°', 'All eight are 40°', 'Four are 40° and four are 50°', 'Four are 40° and four are 320°'], 0,
        'Every angle is either congruent to the 40° angle or supplementary to it (180 − 40 = 140°).'),
      num('Lines a ∥ b. Alternate interior angles measure (2x)° and (x + 30)°. Find x.', 30, '', 'Alternate interior angles are equal: 2x = x + 30, so x = 30.', trans({ 3: '(2x)°', 6: '(x+30)°' }, { names: ['a', 'b', 't'] })),
      mc('A transversal is perpendicular to one of two parallel lines. What is true?', ['It is perpendicular to the other line too, and all eight angles are 90°', 'It makes 45° angles with the other line', 'The other line must be vertical', 'Nothing can be concluded'], 0,
        'Corresponding angles are congruent, so the 90° angle at the first line means 90° at the second as well.'),
      num('Lines m ∥ n. Alternate exterior angles measure (x + 15)° and (2x − 30)°. Find x.', 45, '', 'Alternate exterior angles are equal: x + 15 = 2x − 30, so x = 45.', trans({ 1: '(x+15)°', 8: '(2x−30)°' })),
      num('Lines m ∥ n. Same-side interior angles measure (3x)° and (2x + 30)°. Find x.', 30, '', 'Same-side interior angles add to 180°: 3x + 2x + 30 = 180, 5x = 150, x = 30.', trans({ 4: '(3x)°', 6: '(2x+30)°' })),
      num('Lines m ∥ n. ∠1 = (2x + 10)° and ∠8 = 50°. Find x.', 20, '', '∠1 and ∠8 are alternate exterior angles, so they are equal: 2x + 10 = 50, 2x = 40, x = 20.', trans({ 1: '(2x+10)°', 8: '50°' })),
      mc('Corresponding angles measure 72° and 72°. What do you know about the two lines?', ['They are parallel', 'They are perpendicular', 'They intersect at 72°', 'They are the same line'], 0, 'Congruent corresponding angles ⇒ parallel lines (the converse).'),
      gen(function (rnd) {
        var x = ri(rnd, 5, 30), m = ri(rnd, 2, 5), c = ri(rnd, -15, 25), a = m * x + c;
        while (a < 25 || a > 155) { x = ri(rnd, 5, 30); a = m * x + c; }
        var pr = pick(rnd, PAIRS['Corresponding angles']), lab = {}; lab[pr[0]] = exprS(m, c); lab[pr[1]] = deg(a);
        return num('Lines m ∥ n. The corresponding angles ∠' + pr[0] + ' = ' + expr(m, c) + ' and ∠' + pr[1] + ' = ' + deg(a) + '. Find x.', x, '',
          'Corresponding angles are equal: ' + m + 'x ' + (c >= 0 ? '+ ' + c : '− ' + (-c)) + ' = ' + a + ', so ' + m + 'x = ' + (a - c) + ' and x = ' + x + '.', trans(lab));
      }),
      gen(function (rnd) {
        var x = ri(rnd, 8, 30), m1 = ri(rnd, 2, 4), m2 = ri(rnd, 1, 3), c1 = ri(rnd, 0, 20), c2 = 180 - (m1 + m2) * x - c1;
        while (c2 < -20 || m1 * x + c1 < 20 || m1 * x + c1 > 160) { x = ri(rnd, 8, 30); c2 = 180 - (m1 + m2) * x - c1; }
        var pr = pick(rnd, PAIRS['Same-side interior angles']), lab = {}; lab[pr[0]] = exprS(m1, c1); lab[pr[1]] = exprS(m2, c2);
        return num('Lines m ∥ n. The same-side interior angles are ∠' + pr[0] + ' = ' + expr(m1, c1) + ' and ∠' + pr[1] + ' = ' + expr(m2, c2) + '. Find x.', x, '',
          'Same-side interior angles add to 180°: ' + (m1 + m2) + 'x ' + (c1 + c2 >= 0 ? '+ ' + (c1 + c2) : '− ' + (-(c1 + c2))) + ' = 180, so ' + (m1 + m2) + 'x = ' + (180 - c1 - c2) + ' and x = ' + x + '.', trans(lab));
      }),
      gen(function (rnd) {
        var x = ri(rnd, 10, 40), m1 = ri(rnd, 3, 6), m2 = ri(rnd, 1, m1 - 1), c2 = ri(rnd, 5, 40), c1 = (m2 - m1) * x + c2;
        var a = m1 * x + c1;
        while (a < 25 || a > 155) { x = ri(rnd, 10, 40); c1 = (m2 - m1) * x + c2; a = m1 * x + c1; }
        var kind = pick(rnd, ['Alternate exterior angles', 'Alternate interior angles']), pr = pick(rnd, PAIRS[kind]), lab = {}; lab[pr[0]] = exprS(m1, c1); lab[pr[1]] = exprS(m2, c2);
        return num('Lines m ∥ n. The ' + kind.toLowerCase() + ' ∠' + pr[0] + ' = ' + expr(m1, c1) + ' and ∠' + pr[1] + ' = ' + expr(m2, c2) + ' are congruent. Find x.', x, '',
          'Set them equal: ' + m1 + 'x ' + (c1 >= 0 ? '+ ' + c1 : '− ' + (-c1)) + ' = ' + m2 + 'x ' + (c2 >= 0 ? '+ ' + c2 : '− ' + (-c2)) + '. Then ' + (m1 - m2) + 'x = ' + (c2 - c1) + ', so x = ' + x + '. (Each angle is ' + a + '°.)', trans(lab));
      }),
      gen(function (rnd) {
        var kind = pick(rnd, ['corresponding', 'alternate interior', 'same-side interior']), a = ri(rnd, 40, 140), par = rnd() < 0.5, b;
        if (kind === 'same-side interior') b = par ? 180 - a : 180 - a + pick(rnd, [-10, -5, 5, 10]); else b = par ? a : a + pick(rnd, [-10, -5, 5, 10]);
        var pr = kind === 'corresponding' ? [1, 5] : kind === 'alternate interior' ? [3, 6] : [4, 6], lab = {}; lab[pr[0]] = deg(a); lab[pr[1]] = deg(b);
        var yes = kind === 'same-side interior' ? 'Yes — same-side interior angles add to 180°' : 'Yes — the ' + kind + ' angles are congruent';
        var no = kind === 'same-side interior' ? 'No — same-side interior angles would have to add to 180°' : 'No — the ' + kind + ' angles would have to be congruent';
        return mc('Lines a and b are cut by a transversal. The ' + kind + ' angles ∠' + pr[0] + ' and ∠' + pr[1] + ' measure ' + deg(a) + ' and ' + deg(b) + '. Are a and b parallel?', [par ? yes : no, par ? no : yes, 'Yes — any two lines cut by a transversal are parallel', 'Cannot tell without a third angle'], 0,
          kind === 'same-side interior' ? a + ' + ' + b + ' = ' + (a + b) + (par ? ' = 180°, so the lines are parallel.' : ' ≠ 180°, so the lines are not parallel.') : (par ? a + '° = ' + b + '°, so the lines are parallel (converse of the ' + kind + ' angles fact).' : a + '° ≠ ' + b + '°, so the lines are not parallel.'), trans(lab, { parallel: false, names: ['a', 'b', 't'] }));
      }),
      gen(function (rnd) {
        var x = ri(rnd, 10, 35), m = ri(rnd, 2, 4), c = ri(rnd, 0, 20), a = m * x + c;
        while (a < 30 || a > 150) { x = ri(rnd, 10, 35); a = m * x + c; }
        var lab = { 1: exprS(m, c), 8: deg(a) };
        return num('Lines m ∥ n. ∠1 = ' + expr(m, c) + ' and ∠8 = ' + deg(a) + '. Find x. (Hint: ∠1 is vertical to ∠4, and ∠4 corresponds to ∠8.)', x, '',
          '∠1 = ∠4 (vertical) and ∠4 = ∠8 (corresponding), so ∠1 = ∠8: ' + m + 'x + ' + c + ' = ' + a + ', x = ' + x + '.', trans(lab));
      })
    ]
  });

  /* ================================================================ 1.3.4 ==== */
  function canTri(a, b, c) { return a + b > c && a + c > b && b + c > a; }
  lessons.push({
    id: '1.3.4', title: 'Angles and Sides of a Triangle',
    focus: ['Triangle Angle Sum: 180°', 'Exterior angle = sum of the two remote interior angles', 'Triangle inequality', 'Longest side is opposite the largest angle; isosceles base angles'],
    questions: [
      num('The three angles of any triangle add up to how many degrees?', 180, '°', 'Triangle Angle Sum: the interior angles of every triangle total 180°.'),
      mc('Can side lengths 3, 4, and 8 form a triangle?', ['No — 3 + 4 is less than 8', 'Yes — any three lengths work', 'Yes — because 3 + 8 &gt; 4', 'Only if it is a right triangle'], 0,
        'Triangle inequality: the two shorter sides must add to MORE than the longest side. 3 + 4 = 7 &lt; 8, so the sides cannot meet.'),
      mc('Which set of side lengths CAN form a triangle?', ['5, 7, 9', '2, 3, 6', '1, 1, 3', '4, 4, 8'], 0, '5 + 7 = 12 &gt; 9 ✓. The others fail: 2 + 3 &lt; 6, 1 + 1 &lt; 3, 4 + 4 = 8 (not greater).'),
      mc('In any triangle, the longest side is opposite the…', ['Largest angle', 'Smallest angle', 'Right angle', 'Vertex labelled A'], 0, 'Bigger angle, bigger opening, longer opposite side.'),
      mc('In this triangle ∠A = 40°, ∠B = 60°, and ∠C = 80°. Which side is the longest?', ['AB', 'BC', 'AC', 'They are all equal'], 0, 'The largest angle is ∠C = 80°, and the side opposite C is AB.', tri({ A: '40°', B: '60°', C: '80°' })),
      mc('An isosceles triangle has base angles of 70° each. What is the apex (top) angle?', ['40°', '70°', '110°', '20°'], 0, '180 − 70 − 70 = 40°.', tri({ A: '70°', B: '70°', C: '?', iso: true })),
      mc('An exterior angle of a triangle equals…', ['The sum of the two remote interior angles', 'The adjacent interior angle', '180° minus the smallest angle', 'Half the largest angle'], 0,
        'Exterior Angle Theorem: exterior angle = sum of the two interior angles that are not next to it.'),
      num('Two interior angles are 50° and 60°. What is the exterior angle at B (marked ?)?', 110, '°', 'Exterior angle = 50 + 60 = 110°. Check: the interior angle at B is 70°, and 70 + 110 = 180 ✓.', tri({ A: '50°', C: '60°', ext: '?' })),
      mc('Each angle of an equilateral triangle measures…', ['60°', '90°', '45°', '120°'], 0, '180° ÷ 3 = 60°.'),
      mc('A triangle has angles 30°, 60°, and 90°. Classify it by its angles.', ['Right', 'Acute', 'Obtuse', 'Equiangular'], 0, 'It has a 90° angle, so it is a right triangle.'),
      mc('In a right triangle, the two acute angles are always…', ['Complementary', 'Supplementary', 'Congruent', 'Obtuse'], 0, '90 + a + b = 180, so a + b = 90: complementary.'),
      mc('Can a triangle have two obtuse angles?', ['No — two angles over 90° would already exceed 180°', 'Yes, if the third angle is very small', 'Yes, if it is isosceles', 'Only in a right triangle'], 0, 'Two angles greater than 90° add to more than 180°, leaving nothing for the third angle.'),
      mc('Two sides of a triangle are 5 and 9. The third side must be…', ['Between 4 and 14', 'Exactly 14', 'Between 5 and 9', 'Less than 4'], 0, 'Third side &lt; 5 + 9 = 14 and third side &gt; 9 − 5 = 4.'),
      gen(function (rnd) {
        var a = ri(rnd, 25, 95), b = ri(rnd, 25, Math.min(110, 150 - a)), c = 180 - a - b;
        return num('Find the missing angle x.', c, '°', 'Angles in a triangle add to 180°: 180 − ' + a + ' − ' + b + ' = ' + c + '°.', tri({ A: deg(a), B: deg(b), C: 'x' }));
      }),
      gen(function (rnd) {
        var a = ri(rnd, 30, 80), c = ri(rnd, 30, 80);
        return num('Find the exterior angle marked x at vertex B.', a + c, '°', 'Exterior angle = sum of the two remote interior angles: ' + a + ' + ' + c + ' = ' + (a + c) + '°. (The interior angle at B is ' + (180 - a - c) + '°.)', tri({ A: deg(a), C: deg(c), ext: 'x' }));
      }),
      gen(function (rnd) {
        var a = ri(rnd, 30, 80), c = ri(rnd, 30, 80), e = a + c;
        return num('The exterior angle at B is ' + deg(e) + ' and ∠A = ' + deg(a) + '. Find ∠C (marked x).', c, '°', 'Exterior angle = ∠A + ∠C, so ∠C = ' + e + ' − ' + a + ' = ' + c + '°.', tri({ A: deg(a), C: 'x', ext: deg(e) }));
      }),
      gen(function (rnd) {
        var ok = rnd() < 0.5, a = ri(rnd, 2, 9), b = ri(rnd, 2, 9), c;
        if (ok) { c = ri(rnd, Math.abs(a - b) + 1, a + b - 1); } else { c = a + b + ri(rnd, 0, 3); }
        var s = shuffle(rnd, [a, b, c]), sorted = [a, b, c].sort(function (p, q) { return p - q; });
        var yes = 'Yes — ' + sorted[0] + ' + ' + sorted[1] + ' &gt; ' + sorted[2], no = 'No — ' + sorted[0] + ' + ' + sorted[1] + ' is not greater than ' + sorted[2];
        return mc('Can side lengths ' + s.join(', ') + ' form a triangle?', [ok ? yes : no, ok ? no : yes, 'Only if the triangle is isosceles', 'Only if one angle is 90°'], 0,
          'Check the two shorter sides against the longest: ' + sorted[0] + ' + ' + sorted[1] + ' = ' + (sorted[0] + sorted[1]) + (ok ? ' &gt; ' + sorted[2] + ', so yes.' : ' is not greater than ' + sorted[2] + ', so the sides cannot meet.'));
      }),
      gen(function (rnd) {
        var base = ri(rnd, 30, 85), ask = pick(rnd, ['apex', 'base']);
        if (ask === 'apex') return num('This isosceles triangle has base angles of ' + deg(base) + '. Find the apex angle x.', 180 - 2 * base, '°', 'Base angles of an isosceles triangle are equal. 180 − 2 × ' + base + ' = ' + (180 - 2 * base) + '°.', tri({ A: deg(base), B: deg(base), C: 'x', iso: true }));
        var apex = 180 - 2 * base;
        return num('This isosceles triangle has an apex angle of ' + deg(apex) + '. Find each base angle x.', base, '°', 'The two base angles are equal and together make 180 − ' + apex + ' = ' + (2 * base) + '°, so each is ' + base + '°.', tri({ A: 'x', B: 'x', C: deg(apex), iso: true }));
      }),
      gen(function (rnd) {
        var kind = pick(rnd, ['acute', 'right', 'obtuse']), a, b, c;
        if (kind === 'right') { a = 90; b = ri(rnd, 20, 70); c = 90 - b; }
        else if (kind === 'obtuse') { a = ri(rnd, 95, 140); b = ri(rnd, 15, 180 - a - 15); c = 180 - a - b; }
        else { a = ri(rnd, 50, 85); b = ri(rnd, 45, Math.min(85, 150 - a)); c = 180 - a - b; if (c >= 90) { a = 70; b = 60; c = 50; } }
        var s = shuffle(rnd, [a, b, c]);
        return mc('A triangle has angles ' + deg(s[0]) + ', ' + deg(s[1]) + ', and ' + deg(s[2]) + '. Classify it by its angles.', [kind[0].toUpperCase() + kind.slice(1), kind === 'acute' ? 'Right' : 'Acute', kind === 'obtuse' ? 'Right' : 'Obtuse', 'Straight'], 0,
          kind === 'right' ? 'One angle is 90°: right triangle.' : kind === 'obtuse' ? 'One angle is more than 90°: obtuse triangle.' : 'All angles are less than 90°: acute triangle.');
      }),
      gen(function (rnd) {
        var angs = shuffle(rnd, [ri(rnd, 30, 45), ri(rnd, 50, 65), 0]); var idx0 = angs.indexOf(0); angs[idx0] = 180 - angs.reduce(function (s, v) { return s + v; }, 0);
        var A = angs[0], B = angs[1], C = angs[2], opp = { A: 'BC', B: 'AC', C: 'AB' };
        var big = A >= B && A >= C ? 'A' : B >= C ? 'B' : 'C', small = A <= B && A <= C ? 'A' : B <= C ? 'B' : 'C';
        var ask = pick(rnd, ['longest', 'shortest']), v = ask === 'longest' ? big : small;
        return mc('∠A = ' + deg(A) + ', ∠B = ' + deg(B) + ', ∠C = ' + deg(C) + '. Which side is the ' + ask + '?', choices4(rnd, opp[v], ['AB', 'BC', 'AC', 'They are all equal']).choices, 0,
          'The ' + ask + ' side is opposite the ' + (ask === 'longest' ? 'largest' : 'smallest') + ' angle, ∠' + v + ' = ' + deg(angs['ABC'.indexOf(v)]) + ': side ' + opp[v] + '.', tri({ A: deg(A), B: deg(B), C: deg(C) }));
      }),
      gen(function (rnd) {
        var a = ri(rnd, 3, 9), b = ri(rnd, a + 1, 15);
        var c = choices4(rnd, 'between ' + (b - a) + ' and ' + (a + b), ['between ' + a + ' and ' + b, 'exactly ' + (a + b), 'less than ' + (b - a), 'between ' + (b - a) + ' and ' + (a + b + 2)]);
        return mc('Two sides of a triangle measure ' + a + ' and ' + b + '. The third side must be…', c.choices, 0, 'Third side &lt; ' + a + ' + ' + b + ' = ' + (a + b) + ' and third side &gt; ' + b + ' − ' + a + ' = ' + (b - a) + '.');
      }),
      gen(function (rnd) {
        var a = ri(rnd, 15, 75);
        return num('A right triangle has one acute angle of ' + deg(a) + '. What is the other acute angle?', 90 - a, '°', 'The two acute angles of a right triangle add to 90°: 90 − ' + a + ' = ' + (90 - a) + '°.', tri({ A: deg(a), B: 'x', C: '', ra: true }));
      })
    ]
  });

  return { book: 'Core Connections Integrated II', chapter: 1, title: 'Exploring Algebraic and Geometric Relationships', lessons: lessons };
})();
