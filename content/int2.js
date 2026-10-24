/* Integrated Math 2. Factoring, quadratic equations and functions, exponents and radicals, complex
   numbers, similarity and right-triangle trigonometry, circles, probability. Follows the CPM Core
   Connections Integrated II course (Khan Academy's "Integrated math 2" covers the same ground). */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v, S = M.sup, R = M.sqrt;
  const X = V('x'), Y = V('y'), I = V('i');
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);
  const sq = s => S(s, 2);                                       // s²
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const coef = a => a === 1 ? '' : a === -1 ? '−' : N(a);         // the coefficient in front of a bracket
  const key = s => A.normText(A.stripTags(s));
  /** the first `need` candidates that read differently from the answer and from each other */
  function distinct(answer, cands, need) {
    const seen = new Set([key(answer)]), out = [];
    for (const c of cands) { const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); if (out.length === need) break; } }
    return out;
  }
  /** √n = k√r with r square-free: rootParts(72) → [6, 2] */
  function rootParts(n) { let k = 1, r = n; for (let f = 2; f * f <= r; f++) while (r % (f * f) === 0) { r /= f * f; k *= f; } return [k, r]; }
  const squareFree = r => rootParts(r)[0] === 1;
  /** k√r as HTML: rad(6, 2) → 6√2, rad(1, 2) → √2, rad(5, 1) → 5; a `mid` goes between them: rad(2, 3, i) → 2i√3 */
  function rad(k, r, mid) { mid = mid || ''; if (r === 1) return N(k) + mid; return (k === 1 ? '' : k === -1 ? '−' : N(k)) + mid + R(N(r)); }
  /** ⁿ√x */
  const nroot = (n, x) => (n === 2 ? '' : `<sup>${n}</sup>`) + R(x);
  /** multiply two coefficient lists (highest power first) */
  function mulPoly(a, b) { const out = new Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; })); return out; }
  const evalPoly = (coefs, x) => coefs.reduce((acc, c) => acc * x + c, 0);
  /** (px + r)(qx + s), the two brackets in a fixed order so the same factorisation always reads the same */
  function factors2(p1, r, q1, s) {
    if (p1 > q1 || (p1 === q1 && r > s)) [p1, r, q1, s] = [q1, s, p1, r];
    return `(${M.poly([p1, r])})(${M.poly([q1, s])})`;
  }
  /** (x − h)² as HTML, or x² when h is 0 */
  const sqBin = (varName, h) => h === 0 ? sq(V(varName)) : sq(`(${M.poly([1, -h], varName)})`);
  /** a + bi */
  function cplx(re, im) {
    const imPart = Math.abs(im) === 1 ? I : N(Math.abs(im)) + I;
    if (im === 0) return N(re);
    if (re === 0) return (im < 0 ? '−' : '') + imPart;
    return `${N(re)} ${im < 0 ? '−' : '+'} ${imPart}`;
  }
  /** a right triangle with the right angle at C (bottom right), A bottom left, B top right; `angleAt` marks A or B */
  function triFig(bottom, right, hyp, angleAt, angleLabel) {
    const arc = angleAt === 'A' ? '<path class="stroke light" d="M60,150 A40,40 0 0 0 54,130"/>' : angleAt === 'B' ? '<path class="stroke light" d="M240,60 A40,40 0 0 1 206,40"/>' : '';
    const lab = angleLabel ? (angleAt === 'A' ? `<text x="64" y="144" font-size="14">${angleLabel}</text>` : `<text x="196" y="66" font-size="14" text-anchor="end">${angleLabel}</text>`) : '';
    return `<svg class="figure" viewBox="0 0 300 184" width="300" height="184" role="img" aria-label="right triangle ABC"><polygon class="fill" points="20,150 240,150 240,20"/><path class="stroke" d="M226,150 V136 H240"/>${arc}${lab}<text x="4" y="168">A</text><text x="246" y="168">C</text><text x="246" y="16">B</text><text x="130" y="174" text-anchor="middle">${bottom}</text><text x="252" y="92">${right}</text><text x="110" y="78" text-anchor="middle">${hyp}</text></svg>`;
  }
  /** a circle with named points on it (angles in degrees) joined by the given segments; 'O' is the centre */
  function circleFig(points, segments, arc) {
    const cx = 110, cy = 100, rr = 80;
    const pos = {};
    Object.keys(points).forEach(k => { const t = points[k] * Math.PI / 180; pos[k] = [cx + rr * Math.cos(t), cy - rr * Math.sin(t)]; });
    pos.O = [cx, cy];
    const seg = segments.map(([a, b]) => `<line class="stroke" x1="${pos[a][0].toFixed(1)}" y1="${pos[a][1].toFixed(1)}" x2="${pos[b][0].toFixed(1)}" y2="${pos[b][1].toFixed(1)}"/>`).join('');
    let arcPath = '';
    if (arc) { const [a, b] = arc; const sweep = ((points[b] - points[a]) % 360 + 360) % 360; arcPath = `<path class="stroke" style="stroke-width:5;opacity:.45" d="M${pos[a][0].toFixed(1)},${pos[a][1].toFixed(1)} A${rr},${rr} 0 ${sweep > 180 ? 1 : 0} 0 ${pos[b][0].toFixed(1)},${pos[b][1].toFixed(1)}"/>`; }
    const labels = Object.keys(pos).map(k => { const [x, y] = pos[k]; const dx = k === 'O' ? 6 : (x - cx) / rr * 14, dy = k === 'O' ? -6 : (cy - y) / rr * -14; return `<text x="${(x + dx).toFixed(1)}" y="${(y + dy + 5).toFixed(1)}" text-anchor="middle" font-size="15">${k}</text>`; }).join('');
    return `<svg class="figure" viewBox="0 0 220 200" width="220" height="200" role="img" aria-label="circle"><circle class="stroke light" cx="${cx}" cy="${cy}" r="${rr}"/>${arcPath}${seg}${pos.O && segments.some(s => s.includes('O')) ? `<circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>` : ''}${labels}</svg>`;
  }

  A.course({
    id: 'int-2', title: 'Integrated Math 2', subject: 'High school', grade: 10, icon: '🧩', hue: 330,
    blurb: 'Factoring and quadratics, radicals and complex numbers, similar and right triangles with trigonometry, circles, and probability.',
    units: [
      { id: 'factoring', title: 'Factoring', blurb: 'Pulling out common factors, factoring trinomials, and the difference of squares.', skills: ['int2.gcf-factoring', 'int2.factor-trinomials-a1', 'int2.factor-trinomials-a', 'int2.difference-of-squares'] },
      { id: 'quadratic-equations', title: 'Quadratic equations', blurb: 'Four ways to solve: factoring, square roots, completing the square, and the quadratic formula.', skills: ['int2.solve-by-factoring', 'int2.solve-square-roots', 'int2.complete-the-square', 'int2.quadratic-formula'] },
      { id: 'quadratic-functions', title: 'Quadratic functions', blurb: 'Parabolas: vertex, axis, intercepts, transformations, and what they model.', skills: ['int2.parabola-features', 'int2.transformations', 'int2.quadratic-models'] },
      { id: 'radicals', title: 'Exponents and radicals', blurb: 'Fraction exponents, and simplifying and combining square roots.', skills: ['int2.rational-exponents', 'int2.radicals'] },
      { id: 'complex', title: 'Complex numbers', blurb: 'The imaginary unit, and arithmetic with a + bi.', skills: ['int2.imaginary-numbers', 'int2.complex-arithmetic'] },
      { id: 'triangles', title: 'Similarity and right triangles', blurb: 'Scale factors, the Pythagorean theorem, special right triangles, and trigonometric ratios.', skills: ['int2.similar-triangles', 'int2.pythagorean-theorem', 'int2.special-right-triangles', 'int2.trig-ratios', 'int2.solve-right-triangles'] },
      { id: 'circles', title: 'Circles', blurb: 'Arcs and sectors, inscribed angles, and the equation of a circle.', skills: ['int2.arc-sector', 'int2.inscribed-angles', 'int2.circle-equation'] },
      { id: 'probability', title: 'Probability', blurb: '“And” and “or”, conditional probability from two-way tables, and expected value.', skills: ['int2.compound-probability', 'int2.conditional-probability', 'int2.expected-value'] },
    ],
  });

  /* ---------- Unit 1: Factoring ---------- */
  A.skill({
    id: 'int2.gcf-factoring', title: 'Factoring with the greatest common factor',
    learn: p(`The <b>greatest common factor</b> (GCF) of a polynomial is the biggest expression that divides every term: the GCF of the coefficients, times the lowest power of ${X} that appears in every term.`) +
      p(`Factoring it out is the distributive property in reverse: divide each term by the GCF and write the quotients in parentheses. For 6${sq(X)} + 9${X}, the GCF of 6 and 9 is 3 and both terms contain ${X}, so the GCF is 3${X} and 6${sq(X)} + 9${X} = 3${X}(2${X} + 3). Check by multiplying back.`) +
      p('Always look for a GCF first, before trying any other factoring method.') +
      example('Example', `${big(`Factor 8${S(X, 3)} − 12${sq(X)}`)}The GCF of 8 and 12 is 4; the lowest power of ${X} is ${sq(X)}. Divide: 8${S(X, 3)} ÷ 4${sq(X)} = 2${X} and −12${sq(X)} ÷ 4${sq(X)} = −3. So <b>4${sq(X)}(2${X} − 3)</b>.`),
    make(rng) {
      const g = rng.int(2, 7), vp = rng.int(1, 3), tri = rng.chance(0.4);
      let inner;
      do { inner = tri ? [rng.int(1, 5), rng.nz(-6, 6), rng.nz(-6, 6)] : [rng.int(1, 6), rng.nz(-7, 7)]; } while (inner.reduce((a, b) => M.gcd(a, b)) !== 1);
      const full = inner.map(c => g * c).concat(new Array(vp).fill(0));        // g·x^vp · inner, as coefficients
      const render = (gg, pw, inn) => `${M.term(gg, 'x', pw)}(${M.poly(inn)})`;
      const answer = render(g, vp, inner), gcf = M.term(g, 'x', vp);
      const cands = [render(g, vp === 1 ? 2 : vp - 1, inner), render(g, vp, inner.map((c, i) => i === inner.length - 1 ? -c : c)), render(g, vp, [g * inner[0]].concat(inner.slice(1))), render(g === 2 ? 3 : g - 1, vp, inner)];
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      const terms = full.map((c, i) => c === 0 ? null : M.term(c, 'x', full.length - 1 - i)).filter(Boolean);
      return { prompt: `Factor out the greatest common factor.${big(M.poly(full))}`, type: 'choice', answer, choices, params: { full },
        hints: [`The GCF of the coefficients ${M.list(full.filter(c => c).map(c => N(Math.abs(c))))} is ${N(g)}.`,
          `Every term contains at least ${S(X, vp)}, so the GCF is ${gcf}.`,
          `Divide each term by ${gcf}: ${M.list(terms.map((t, i) => `${t} ÷ ${gcf} = ${M.term(inner[i], 'x', inner.length - 1 - i)}`))}.`,
          `<b>${answer}</b>. Multiply back to check: ${M.poly(full)}.`] };
    },
    verify(q) {
      const full = q.params.full;                      // re-derive the GCF from the expanded polynomial itself
      const g = full.filter(c => c !== 0).reduce((a, b) => M.gcd(a, b));
      let vp = 0; for (let i = full.length - 1; i >= 0 && full[i] === 0; i--) vp++;
      const inner = full.slice(0, full.length - vp).map(c => c / g);
      return q.answer === `${M.term(g, 'x', vp)}(${M.poly(inner)})`;
    },
  });

  A.skill({
    id: 'int2.factor-trinomials-a1', title: 'Factoring quadratics: leading coefficient 1',
    learn: p(`To factor ${sq(X)} + ${V('b')}${X} + ${V('c')}, look for two numbers that <b>multiply to ${V('c')}</b> and <b>add to ${V('b')}</b>. If they are ${V('r')} and ${V('s')}, then ${sq(X)} + ${V('b')}${X} + ${V('c')} = (${X} + ${V('r')})(${X} + ${V('s')}).`) +
      p(`The signs tell you where to look. If ${V('c')} is positive, both numbers have the same sign as ${V('b')}. If ${V('c')} is negative, the numbers have different signs, and the one with the bigger size takes the sign of ${V('b')}.`) +
      p('Check by multiplying out (FOIL, or a generic rectangle): you should get the original trinomial back.') +
      example('Example', `${big(`Factor ${M.poly([1, -2, -15])}`)}We need a product of −15 and a sum of −2: the pair is 3 and −5. So <b>(${X} + 3)(${X} − 5)</b>. Check: ${sq(X)} − 5${X} + 3${X} − 15 = ${M.poly([1, -2, -15])}. ✓`),
    make(rng) {
      let r, s;
      do { r = rng.nz(-9, 9); s = rng.nz(-9, 9); } while (r === s || r + s === 0);
      if (r > s) [r, s] = [s, r];
      const b = r + s, c = r * s;
      const fac = (u, w) => u <= w ? `(${M.poly([1, u])})(${M.poly([1, w])})` : `(${M.poly([1, w])})(${M.poly([1, u])})`;
      const answer = fac(r, s);
      const pairs = [];
      for (let u = -Math.abs(c); u <= Math.abs(c); u++) if (u && c % u === 0 && u <= c / u) pairs.push([u, c / u]);
      const shown = pairs.filter(([u]) => c < 0 || (u > 0) === (b > 0));
      const cands = [fac(-r, -s), fac(r, -s), fac(-r, s)].concat(pairs.filter(([u, w]) => u + w !== b).map(([u, w]) => fac(u, w)));
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      return { prompt: `Factor.${big(M.poly([1, b, c]))}`, type: 'choice', answer, choices, params: { b, c },
        hints: [`Find two numbers that multiply to ${N(c)} and add to ${N(b)}. ${c > 0 ? `Since ${N(c)} is positive, both numbers are ${b > 0 ? 'positive' : 'negative'}.` : `Since ${N(c)} is negative, one number is positive and one is negative.`}`,
          `Pairs that multiply to ${N(c)}: ${shown.map(([u, w]) => `${N(u)} and ${N(w)}`).join('; ')}. Which pair adds to ${N(b)}?`,
          `${N(r)} × ${wrap(s)} = ${N(c)} and ${N(r)} + ${wrap(s)} = ${N(b)}.`,
          `<b>${answer}</b>. Check: ${M.poly(mulPoly([1, r], [1, s]))}. ✓`] };
    },
    verify(q) {
      const { b, c } = q.params;
      for (let r = -100; r <= 100; r++) {            // brute force the pair
        if (r === 0 || c % r !== 0) continue;
        const s = c / r;
        if (r + s === b && r <= s) return q.answer === `(${M.poly([1, r])})(${M.poly([1, s])})`;
      }
      return false;
    },
  });

  A.skill({
    id: 'int2.factor-trinomials-a', title: 'Factoring quadratics: leading coefficient not 1',
    learn: p(`When the leading coefficient ${V('a')} is not 1, the factors look like (${V('p')}${X} + ${V('r')})(${V('q')}${X} + ${V('s')}) with ${V('p')}${V('q')} = ${V('a')} and ${V('r')}${V('s')} = ${V('c')}. The middle term comes from the outer and inner products: ${V('b')} = ${V('p')}${V('s')} + ${V('q')}${V('r')}.`) +
      p(`A reliable method is to <b>split the middle term</b>: find two numbers that multiply to ${V('a')}·${V('c')} and add to ${V('b')}, use them to write ${V('b')}${X} as two terms, then factor by grouping. (In a generic rectangle, those two numbers are the two side products.)`) +
      example('Example', `${big(`Factor ${M.poly([2, 7, 3])}`)}${V('a')}·${V('c')} = 6. Numbers that multiply to 6 and add to 7: 1 and 6. Split: 2${sq(X)} + ${X} + 6${X} + 3 = ${X}(2${X} + 1) + 3(2${X} + 1) = <b>(2${X} + 1)(${X} + 3)</b>.`),
    make(rng) {
      let p1, q1, r, s, a, b, c;
      do {
        p1 = rng.int(1, 3); q1 = rng.int(1, 3); if (p1 === 1 && q1 === 1) q1 = rng.int(2, 3);
        r = rng.nz(-5, 5); s = rng.nz(-5, 5);
        a = p1 * q1; b = p1 * s + q1 * r; c = r * s;
      } while (b === 0 || M.gcd(M.gcd(a, b), c) !== 1);
      const answer = factors2(p1, r, q1, s);
      const cands = [factors2(p1, -r, q1, -s), factors2(p1, s, q1, r), factors2(1, r, a, s), factors2(a, r, 1, s), factors2(p1, -r, q1, s), factors2(p1, r, q1, -s)];
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      const m1 = p1 * s, m2 = q1 * r, shared = M.poly([q1, s]);
      const sgn = (k, t) => `${k < 0 ? ' − ' : ' + '}${t}`;
      return { prompt: `Factor.${big(M.poly([a, b, c]))}`, type: 'choice', answer, choices, params: { a, b, c },
        hints: [`Multiply ${V('a')}·${V('c')} = ${N(a)} × ${wrap(c)} = ${N(a * c)}. Find two numbers that multiply to ${N(a * c)} and add to ${N(b)}: they are ${N(m1)} and ${N(m2)}.`,
          `Split the middle term: ${M.term(a, 'x', 2)}${sgn(m1, M.term(Math.abs(m1), 'x'))}${sgn(m2, M.term(Math.abs(m2), 'x'))}${sgn(c, N(Math.abs(c)))}.`,
          `Group and factor each pair: ${M.term(p1, 'x')}(${shared})${sgn(r, `${N(Math.abs(r))}(${shared})`)}. Both groups share (${shared}).`,
          `<b>${answer}</b>. Check the middle term: ${N(p1)}·${wrap(s)} + ${N(q1)}·${wrap(r)} = ${N(b)}. ✓`] };
    },
    verify(q) {
      const { a, b, c } = q.params;
      for (let p1 = 1; p1 <= a; p1++) {               // brute force over every p·q = a and r·s = c
        if (a % p1 !== 0) continue;
        const q1 = a / p1;
        for (let r = -Math.abs(c); r <= Math.abs(c); r++) {
          if (r === 0 || c % r !== 0) continue;
          const s = c / r;
          if (p1 * s + q1 * r === b) return q.answer === factors2(p1, r, q1, s);
        }
      }
      return false;
    },
  });

  A.skill({
    id: 'int2.difference-of-squares', title: 'Factoring a difference of squares',
    learn: p(`A <b>difference of squares</b> is one perfect square minus another: ${sq(V('a'))} − ${sq(V('b'))}. It always factors as <b>(${V('a')} + ${V('b')})(${V('a')} − ${V('b')})</b>. Multiplying back, the middle terms cancel: −${V('a')}${V('b')} + ${V('a')}${V('b')} = 0.`) +
      p(`To spot one: two terms, a minus between them, and both terms perfect squares (1, 4, 9, 16, 25, … and even powers of ${X}). ${sq(X)} − 49 = (${X} + 7)(${X} − 7) and 9${sq(X)} − 16 = (3${X} + 4)(3${X} − 4). A <i>sum</i> of squares like ${sq(X)} + 49 does not factor over the real numbers.`) +
      example('Example', `${big(`Factor 25${sq(X)} − 36`)}25${sq(X)} = ${sq(`(5${X})`)} and 36 = ${sq(6)}. So <b>(5${X} + 6)(5${X} − 6)</b>.`),
    make(rng) {
      const kind = rng.pick(['x', 'x', 'ax', 'ax', 'rev']);
      let a = 1, k = rng.int(2, 12);
      if (kind === 'ax') { a = rng.int(2, 7); k = rng.int(1, 9); while (M.gcd(a, k) !== 1) k = rng.int(1, 9); }
      const A2 = a * a, K2 = k * k;
      const fac = (aa, kk) => kind === 'rev' ? `(${N(kk)} + ${M.term(aa, 'x')})(${N(kk)} − ${M.term(aa, 'x')})` : `(${M.poly([aa, kk])})(${M.poly([aa, -kk])})`;
      const sqr = (aa, kk, sign) => kind === 'rev' ? sq(`(${N(kk)} ${sign} ${M.term(aa, 'x')})`) : sq(`(${M.poly([aa, sign === '+' ? kk : -kk])})`);
      const answer = fac(a, k);
      const cands = [sqr(a, k, '−'), sqr(a, k, '+'), fac(a, K2), fac(A2, k), fac(a, 2 * k), fac(a, k + 1)];
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      const expr = kind === 'rev' ? `${N(K2)} − ${M.term(A2, 'x', 2)}` : M.poly([A2, 0, -K2]);
      const axSq = a === 1 ? sq(X) : sq(`(${M.term(a, 'x')})`);
      return { prompt: `Factor.${big(expr)}`, type: 'choice', answer, choices, params: { kind, A2, K2 },
        hints: ['Two terms, both perfect squares, with a minus between them: this is a difference of squares.',
          kind === 'rev' ? `${N(K2)} = ${sq(N(k))} and ${M.term(A2, 'x', 2)} = ${axSq}, so ${V('a')} = ${N(k)} and ${V('b')} = ${M.term(a, 'x')}.` : `${M.term(A2, 'x', 2)} = ${axSq} and ${N(K2)} = ${sq(N(k))}, so ${V('a')} = ${M.term(a, 'x')} and ${V('b')} = ${N(k)}.`,
          `Use ${sq(V('a'))} − ${sq(V('b'))} = (${V('a')} + ${V('b')})(${V('a')} − ${V('b')}): <b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, A2, K2 } = q.params;
      const a = Math.sqrt(A2), k = Math.sqrt(K2);
      if (!Number.isInteger(a) || !Number.isInteger(k)) return false;
      return q.answer === (kind === 'rev' ? `(${N(k)} + ${M.term(a, 'x')})(${N(k)} − ${M.term(a, 'x')})` : `(${M.poly([a, k])})(${M.poly([a, -k])})`);
    },
  });

  /* ---------- Unit 2: Quadratic equations ---------- */
  A.skill({
    id: 'int2.solve-by-factoring', title: 'Solving quadratics by factoring',
    learn: p(`The <b>zero product property</b>: if ${V('A')} · ${V('B')} = 0, then ${V('A')} = 0 or ${V('B')} = 0. So once a quadratic is written as a product that equals zero, each factor gives one solution.`) +
      p(`Steps: get everything on one side so the equation reads “… = 0”, factor, set each factor equal to 0, and solve the two little equations. (${X} − 3)(${X} + 5) = 0 gives ${X} = 3 or ${X} = −5. Watch the signs: the solutions are the <i>opposites</i> of the numbers in the factors.`) +
      example('Example', `${big(`Solve ${M.poly([1, 2, -24])} = 0`)}Factor: (${X} + 6)(${X} − 4) = 0. Then ${X} + 6 = 0 or ${X} − 4 = 0, so <b>${X} = −6 or ${X} = 4</b>. Check 4: 16 + 8 − 24 = 0. ✓`),
    make(rng) {
      let r, s;
      do { r = rng.nz(-9, 9); s = rng.nz(-9, 9); } while (r === s || r + s === 0);
      if (r > s) [r, s] = [s, r];
      const b = -(r + s), c = r * s;                                   // x² + bx + c = (x − r)(x − s)
      const moved = rng.chance(0.3);
      const eqn = moved ? `${M.poly([1, b, 0])} = ${N(-c)}` : `${M.poly([1, b, c])} = 0`;
      const factored = `(${M.poly([1, -r])})(${M.poly([1, -s])}) = 0`;
      const kind = rng.pick(['small', 'large', 'pair', 'pair']);
      const pairTxt = (u, w) => `${X} = ${N(Math.min(u, w))} or ${X} = ${N(Math.max(u, w))}`;
      const hints = [moved ? `First get 0 on one side: ${c < 0 ? 'subtract' : 'add'} ${N(Math.abs(c))} from both sides to get ${M.poly([1, b, c])} = 0.` : 'One side is already 0, so factor the other side.',
        `Two numbers that multiply to ${N(c)} and add to ${N(b)} are ${N(-r)} and ${N(-s)}, so the equation becomes ${factored}.`,
        `Zero product property: ${M.poly([1, -r])} = 0 or ${M.poly([1, -s])} = 0.`];
      if (kind === 'pair') {
        const answer = pairTxt(r, s);
        return { prompt: `Solve.${big(eqn)}`, type: 'choice', answer, choices: rng.shuffle([answer, pairTxt(-r, -s), pairTxt(r, -s), pairTxt(-r, s)]), params: { kind, b, c }, hints: hints.concat(`<b>${answer}</b>.`) };
      }
      const ans = kind === 'small' ? r : s;
      return { prompt: `Solve. Enter the ${kind === 'small' ? 'smaller' : 'larger'} solution.${big(eqn)}`, type: 'number', answer: ans, params: { kind, b, c },
        hints: hints.concat(`${X} = ${N(r)} or ${X} = ${N(s)}. The ${kind === 'small' ? 'smaller' : 'larger'} solution is <b>${N(ans)}</b>.`) };
    },
    verify(q) {
      const { kind, b, c } = q.params, f = x => x * x + b * x + c;
      const roots = []; for (let x = -60; x <= 60; x++) if (f(x) === 0) roots.push(x);     // brute force the roots
      if (roots.length !== 2) return false;
      if (kind === 'pair') return q.answer === `${X} = ${N(roots[0])} or ${X} = ${N(roots[1])}`;
      return q.answer === (kind === 'small' ? roots[0] : roots[1]);
    },
  });

  A.skill({
    id: 'int2.solve-square-roots', title: 'Solving quadratics with square roots',
    learn: p(`If an equation has a squared expression and no plain ${X} term, isolate the square and take the square root of both sides. Remember <b>both</b> roots: if ${sq(X)} = 49 then ${X} = 7 or ${X} = −7, written ${X} = ±7.`) +
      p(`The same works when a whole bracket is squared: ${sq(`(${X} − 2)`)} = 25 gives ${X} − 2 = ±5, so ${X} = 2 + 5 = 7 or ${X} = 2 − 5 = −3. Undo everything around the square first: move a constant across, divide away a coefficient.`) +
      example('Example', `${big(`3${sq(X)} − 12 = 63`)}Add 12: 3${sq(X)} = 75. Divide by 3: ${sq(X)} = 25. Square root: <b>${X} = ±5</b>.`),
    make(rng) {
      const kind = rng.pick(['plain', 'coef', 'shift', 'shift', 'const', 'both']);
      const root = rng.int(2, 12), k = root * root;
      if (kind === 'shift') {
        const h = rng.nz(-8, 8), which = rng.bool(), lo = h - root, hi = h + root, ans = which ? hi : lo;
        return { prompt: `Solve. Enter the ${which ? 'larger' : 'smaller'} solution.${big(`${sq(`(${M.poly([1, -h])})`)} = ${N(k)}`)}`, type: 'number', answer: ans, params: { kind, h, k, which },
          hints: [`Take the square root of both sides, keeping both signs: ${M.poly([1, -h])} = ±${N(root)}.`,
            `${h < 0 ? 'Subtract' : 'Add'} ${N(Math.abs(h))} ${h < 0 ? 'from' : 'to'} both sides: ${X} = ${N(h)} ± ${N(root)}.`,
            `${X} = ${N(hi)} or ${X} = ${N(lo)}. The ${which ? 'larger' : 'smaller'} solution is <b>${N(ans)}</b>.`] };
      }
      const a = kind === 'coef' || kind === 'both' ? rng.int(2, 5) : 1, d = kind === 'const' || kind === 'both' ? rng.nz(-30, 30) : 0;
      const rhs = a * k + d;
      const hints = [];
      if (d) hints.push(`${d < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(d))} ${d < 0 ? 'to' : 'from'} both sides: ${M.term(a, 'x', 2)} = ${N(a * k)}.`);
      if (a !== 1) hints.push(`Divide both sides by ${N(a)}: ${sq(X)} = ${N(k)}.`);
      if (!hints.length) hints.push(`${sq(X)} is already by itself.`);
      hints.push(`Take the square root of both sides: ${X} = ±${R(N(k))} = ±${N(root)}.`, `The two solutions are ${N(root)} and ${N(-root)}; the positive one is <b>${N(root)}</b>.`);
      return { prompt: `Solve. Enter the positive solution.${big(`${M.poly([a, 0, d])} = ${N(rhs)}`)}`, type: 'number', answer: root, params: { kind, a, d, rhs }, hints };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'shift') return (x - P.h) * (x - P.h) === P.k && (P.which ? x > P.h : x < P.h);     // substitute back
      return P.a * x * x + P.d === P.rhs && x > 0;
    },
  });

  A.skill({
    id: 'int2.complete-the-square', title: 'Completing the square',
    learn: p(`A <b>perfect square trinomial</b> is the square of a binomial: ${sq(X)} + 6${X} + 9 = ${sq(`(${X} + 3)`)}. The constant is always the square of half the middle coefficient: (6 ÷ 2)² = 9.`) +
      p(`To write ${Y} = ${sq(X)} + ${V('b')}${X} + ${V('c')} in <b>vertex form</b> ${Y} = ${sq(`(${X} − ${V('h')})`)} + ${V('k')}: take half of ${V('b')}, square it, add it <i>and</i> subtract it so the value does not change, then fold the perfect square. The vertex is (${V('h')}, ${V('k')}); mind the sign, since ${sq(`(${X} + 3)`)} means ${V('h')} = −3.`) +
      example('Example', `${big(`${Y} = ${M.poly([1, 8, 10])}`)}Half of 8 is 4, and ${sq(4)} = 16. ${Y} = (${sq(X)} + 8${X} + 16) + 10 − 16 = <b>${sq(`(${X} + 4)`)} − 6</b>. The vertex is (−4, −6).`),
    make(rng) {
      const m = rng.nz(-7, 7), c = rng.int(-12, 15);
      const b = 2 * m, k = c - m * m;
      const vf = (mm, kk) => `${Y} = ${sq(`(${M.poly([1, mm])})`)}${kk === 0 ? '' : ' ' + M.signed(kk)}`;
      const answer = vf(m, k);
      const cands = [vf(-m, k), vf(m, c), vf(m, c + m * m), vf(-m, c), vf(b, c - b * b)];
      const choices = rng.shuffle([answer].concat(distinct(answer, cands, 3)));
      return { prompt: `Complete the square to write the function in vertex form.${big(`${Y} = ${M.poly([1, b, c])}`)}`, type: 'choice', answer, choices, params: { b, c },
        hints: [`Half of ${N(b)} is ${N(m)}, and ${wrap(m)}² = ${N(m * m)}. That is the constant that completes the square.`,
          `Add it and subtract it: ${Y} = (${M.poly([1, b, m * m])}) ${M.signed(c)} − ${N(m * m)}.`,
          `The bracket is a perfect square: ${M.poly([1, b, m * m])} = ${sq(`(${M.poly([1, m])})`)}. And ${N(c)} − ${N(m * m)} = ${N(k)}.`,
          `<b>${answer}</b>. The vertex is ${M.pt(-m, k)}.`] };
    },
    verify(q) {
      const { b, c } = q.params, f = x => x * x + b * x + c;
      let best = -20, bestV = f(-20);                 // brute-force the minimum: that is the vertex
      for (let x = -20; x <= 20; x += 0.5) if (f(x) < bestV) { bestV = f(x); best = x; }
      return q.answer === `${Y} = ${sq(`(${M.poly([1, -best])})`)}${bestV === 0 ? '' : ' ' + M.signed(bestV)}`;
    },
  });

  A.skill({
    id: 'int2.quadratic-formula', title: 'The quadratic formula and the discriminant',
    learn: p(`Any quadratic ${V('a')}${sq(X)} + ${V('b')}${X} + ${V('c')} = 0 can be solved with the <b>quadratic formula</b>: ${X} = ${F(`−${V('b')} ± ${R(`${sq(V('b'))} − 4${V('a')}${V('c')}`)}`, `2${V('a')}`)}. Write down ${V('a')}, ${V('b')} and ${V('c')} with their signs first, then substitute carefully.`) +
      p(`The part under the root, ${sq(V('b'))} − 4${V('a')}${V('c')}, is the <b>discriminant</b>. It tells you how many real solutions there are before you solve: <b>positive → two</b>, <b>zero → exactly one</b> (a repeated root), <b>negative → none</b> (the parabola misses the ${X}-axis).`) +
      example('Example', `${big(`${M.poly([2, -3, -4])} = 0`)}${V('a')} = 2, ${V('b')} = −3, ${V('c')} = −4. Discriminant: 9 − 4(2)(−4) = 41, positive, so two solutions. ${X} = ${F(`3 ± ${R(41)}`, 4)}, so ${X} ≈ <b>2.35</b> or ${X} ≈ <b>−0.85</b>.`),
    make(rng) {
      const kind = rng.pick(['root', 'root', 'count', 'disc']);
      let a, b, c, D;
      do { a = rng.int(1, 3); b = rng.nz(-9, 9); c = rng.nz(-9, 9); D = b * b - 4 * a * c; } while (kind === 'root' && D <= 0);
      if (kind === 'count' && rng.chance(0.3)) { const m = rng.nz(-5, 5); a = 1; b = 2 * m; c = m * m; D = 0; }     // a repeated root now and then
      const eqn = `${M.poly([a, b, c])} = 0`;
      const h1 = `Identify ${V('a')} = ${N(a)}, ${V('b')} = ${N(b)}, ${V('c')} = ${N(c)}.`;
      const h2 = `Discriminant: ${sq(V('b'))} − 4${V('a')}${V('c')} = ${wrap(b)}² − 4(${N(a)})(${wrap(c)}) = ${N(b * b)} − ${wrap(4 * a * c)} = ${N(D)}.`;
      if (kind === 'disc') return { prompt: `What is the discriminant of this equation?${big(eqn)}`, type: 'number', answer: D, params: { kind, a, b, c }, hints: [h1, `Substitute into ${sq(V('b'))} − 4${V('a')}${V('c')}: ${wrap(b)}² − 4(${N(a)})(${wrap(c)}).`, `${N(b * b)} − ${wrap(4 * a * c)} = <b>${N(D)}</b>.`] };
      const counts = ['Two real solutions', 'One real solution', 'No real solutions'];
      if (kind === 'count') {
        const ans = D > 0 ? counts[0] : D === 0 ? counts[1] : counts[2];
        return { prompt: `How many real solutions does this equation have?${big(eqn)}`, type: 'choice', choices: counts, keepOrder: true, answer: ans, params: { kind, a, b, c },
          hints: [h1, h2, `The discriminant is ${D > 0 ? 'positive' : D === 0 ? 'zero' : 'negative'}, so there ${D === 0 ? 'is' : 'are'} <b>${ans.toLowerCase()}</b>.`] };
      }
      const which = rng.bool(), rt = Math.sqrt(D), rt3 = M.round(rt, 3);
      const ans = M.round((-b + (which ? 1 : -1) * rt) / (2 * a), 2);
      return { prompt: `Use the quadratic formula to solve. Enter the ${which ? 'larger' : 'smaller'} solution, rounded to two decimal places if needed.${big(eqn)}`, type: 'number', answer: ans, tolerance: 0.006, params: { kind, a, b, c, which },
        hints: [h1, `Substitute: ${X} = ${F(`${N(-b)} ± ${R(`${wrap(b)}² − 4(${N(a)})(${wrap(c)})`)}`, `2(${N(a)})`)}.`,
          `${h2} So ${X} = ${F(`${N(-b)} ± ${R(N(D))}`, N(2 * a))}, and ${R(N(D))} ${rt3 === rt ? '=' : '≈'} ${N(rt3)}.`,
          `The ${which ? 'larger' : 'smaller'} solution uses the ${which ? '+' : '−'} sign: ${X} = ${F(`${N(-b)} ${which ? '+' : '−'} ${N(rt3)}`, N(2 * a))} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const { kind, a, b, c, which } = q.params, f = x => a * x * x + b * x + c;
      const xv = -b / (2 * a), fv = f(xv);                            // the vertex decides everything
      if (kind === 'disc') return Math.abs(q.answer - (-4 * a * fv)) < 1e-6;
      if (kind === 'count') return q.answer === (a * fv < -1e-9 ? 'Two real solutions' : Math.abs(fv) < 1e-9 ? 'One real solution' : 'No real solutions');
      const x = q.answer, slope = Math.abs(2 * a * x + b);
      if (Math.abs(f(x)) > slope * 0.0051 + 1e-6) return false;      // f(x) ≈ 0, allowing for the rounding of x
      return which ? x >= xv - 0.006 : x <= xv + 0.006;
    },
  });

  /* ---------- Unit 3: Quadratic functions ---------- */
  A.skill({
    id: 'int2.parabola-features', title: 'Features of parabolas',
    learn: p(`The graph of ${Y} = ${V('a')}${sq(X)} + ${V('b')}${X} + ${V('c')} is a parabola. It opens up if ${V('a')} is positive and down if ${V('a')} is negative. Its <b>axis of symmetry</b> is the vertical line ${X} = ${F(`−${V('b')}`, `2${V('a')}`)}, and the <b>vertex</b> sits on that line: substitute that ${X} to get its ${Y}-coordinate.`) +
      p(`The <b>${Y}-intercept</b> is where ${X} = 0, so it is simply (0, ${V('c')}). The <b>${X}-intercepts</b> (also called zeros or roots) are where ${Y} = 0; in factored form ${Y} = ${V('a')}(${X} − ${V('r')})(${X} − ${V('s')}) they are ${X} = ${V('r')} and ${X} = ${V('s')}, and the axis of symmetry runs halfway between them.`) +
      example('Example', `${big(`${Y} = ${M.poly([2, -8, 5])}`)}Axis: ${X} = −(−8) ÷ (2 · 2) = 2. Vertex: ${Y} = 2(4) − 16 + 5 = −3, so the vertex is <b>(2, −3)</b>. The ${Y}-intercept is (0, 5).`),
    make(rng) {
      const kind = rng.pick(['axis', 'vertex', 'vertex', 'yint', 'xint']);
      if (kind === 'xint') {
        const a = rng.pick([1, 1, -1, 2]);
        let r = rng.nz(-7, 7), s = rng.nz(-7, 7); while (s === r || s === -r) s = rng.nz(-7, 7); if (r > s) [r, s] = [s, r];
        const coefs = mulPoly([a], mulPoly([1, -r], [1, -s]));
        const fact = `${coef(a)}(${M.poly([1, -r])})(${M.poly([1, -s])})`;
        const shown = rng.bool() ? fact : M.poly(coefs);
        const pts = (u, w) => `${M.pt(Math.min(u, w), 0)} and ${M.pt(Math.max(u, w), 0)}`;
        const answer = pts(r, s);
        return { prompt: `What are the ${X}-intercepts of the graph?${big(`${Y} = ${shown}`)}`, type: 'choice', answer, choices: rng.shuffle([answer, pts(-r, -s), pts(r, -s), pts(-r, s)]), params: { kind, coefs, r, s },
          hints: [`The ${X}-intercepts are the points where ${Y} = 0.`, `${shown === fact ? 'The function is already factored' : 'Factor'}: ${Y} = ${fact}. Set each bracket equal to 0.`, `${X} = ${N(r)} or ${X} = ${N(s)}, so the intercepts are <b>${answer}</b>.`] };
      }
      const a = rng.pick([1, 1, -1, 2, -2, 3]), h = rng.nz(-6, 6), k = rng.int(-9, 9);
      const b = -2 * a * h, c = a * h * h + k;                        // vertex (h, k) written out in standard form
      const fn = `${Y} = ${M.poly([a, b, c])}`;
      const h1 = `Read off ${V('a')} = ${N(a)}, ${V('b')} = ${N(b)}, ${V('c')} = ${N(c)}.`;
      const h2 = `Axis of symmetry: ${X} = ${F(`−${V('b')}`, `2${V('a')}`)} = ${F(N(-b), N(2 * a))} = ${N(h)}`;
      if (kind === 'axis') return { prompt: `What is the axis of symmetry of the graph? Enter the number ${V('k')} in its equation ${X} = ${V('k')}.${big(fn)}`, type: 'number', answer: h, params: { kind, a, b, c }, hints: [h1, `${h2}.`, `The axis of symmetry is the line <b>${X} = ${N(h)}</b>.`] };
      if (kind === 'yint') return { prompt: `What is the ${Y}-intercept of the graph? Enter its ${Y}-coordinate.${big(fn)}`, type: 'number', answer: c, params: { kind, a, b, c }, hints: [`The ${Y}-intercept is where ${X} = 0.`, `Substitute ${X} = 0: every term with an ${X} disappears, leaving ${Y} = ${N(c)}.`, `The ${Y}-intercept is (0, ${N(c)}), so the answer is <b>${N(c)}</b>.`] };
      const answer = M.pt(h, k);
      const choices = rng.shuffle([answer].concat(distinct(answer, [M.pt(-h, k), M.pt(h, c), M.pt(k, h), M.pt(h, -k), M.pt(-h, -k)], 3)));
      return { prompt: `What is the vertex of the parabola?${big(fn)}`, type: 'choice', answer, choices, params: { kind, a, b, c },
        hints: [h1, `${h2}, so the vertex has ${X} = ${N(h)}.`, `Substitute ${X} = ${N(h)}: ${Y} = ${coef(a)}${wrap(h)}² ${M.signed(b)}(${N(h)}) ${M.signed(c)} = ${N(k)}.`, `The vertex is <b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, a, b, c, coefs, r, s } = q.params;
      if (kind === 'xint') return evalPoly(coefs, r) === 0 && evalPoly(coefs, s) === 0 && q.answer === `${M.pt(r, 0)} and ${M.pt(s, 0)}`;
      const f = x => a * x * x + b * x + c;
      if (kind === 'yint') return q.answer === f(0);
      let best = -30, bestV = f(-30);                                 // brute-force the extreme point on a half-unit grid
      for (let x = -30; x <= 30; x += 0.5) if ((a > 0 && f(x) < bestV) || (a < 0 && f(x) > bestV)) { bestV = f(x); best = x; }
      return kind === 'axis' ? q.answer === best : q.answer === M.pt(best, bestV);
    },
  });

  A.skill({
    id: 'int2.transformations', title: 'Transforming the parent function y = x²',
    learn: p(`Every parabola is a transformed copy of the parent graph ${Y} = ${sq(X)}. In <b>vertex form</b> ${Y} = ${V('a')}${sq(`(${X} − ${V('h')})`)} + ${V('k')}, the graph is shifted <b>${V('h')} units horizontally</b> and <b>${V('k')} units vertically</b>, so the vertex moves from (0, 0) to (${V('h')}, ${V('k')}).`) +
      p(`The horizontal shift is the counter-intuitive one: ${sq(`(${X} − 3)`)} shifts <i>right</i> 3, and ${sq(`(${X} + 3)`)} shifts <i>left</i> 3. The number ${V('a')} stretches the graph vertically (makes it narrower) when |${V('a')}| is bigger than 1, compresses it (makes it wider) when |${V('a')}| is between 0 and 1, and flips it upside down when ${V('a')} is negative.`) +
      example('Example', `${big(`${Y} = −2${sq(`(${X} + 1)`)} + 5`)}Compared with ${Y} = ${sq(X)}: reflected over the ${X}-axis, stretched vertically by a factor of 2, and shifted <b>left 1</b> and <b>up 5</b>. The vertex is (−1, 5).`),
    make(rng) {
      const kind = rng.pick(['describe', 'describe', 'equation', 'stretch']);
      const dir = (h, k) => `${h < 0 ? 'left' : 'right'} ${N(Math.abs(h))} and ${k < 0 ? 'down' : 'up'} ${N(Math.abs(k))}`;
      const vform = (a, h, k) => `${Y} = ${coef(a)}${sq(`(${M.poly([1, -h])})`)} ${M.signed(k)}`;
      const h = rng.nz(-7, 7), k = rng.nz(-7, 7);
      if (kind === 'describe') {
        const answer = `Shift ${dir(h, k)}`;
        return { prompt: `How is the graph of this function related to the graph of ${Y} = ${sq(X)}?${big(vform(1, h, k))}`, type: 'choice', answer, choices: rng.shuffle([answer, `Shift ${dir(-h, k)}`, `Shift ${dir(h, -k)}`, `Shift ${dir(-h, -k)}`]), params: { kind, h, k },
          hints: [`In ${Y} = ${sq(`(${X} − ${V('h')})`)} + ${V('k')} the vertex moves to (${V('h')}, ${V('k')}). The bracket here is (${M.poly([1, -h])}), so ${V('h')} = ${N(h)}: the sign inside the bracket is flipped.`, `${V('k')} = ${N(k)} is added outside the bracket, so the graph moves ${k < 0 ? 'down' : 'up'} ${N(Math.abs(k))}.`, `<b>Shift ${dir(h, k)}</b>: the vertex is now at ${M.pt(h, k)}.`] };
      }
      if (kind === 'equation') {
        const answer = vform(1, h, k);
        return { prompt: `Which function is the graph of ${Y} = ${sq(X)} shifted ${dir(h, k)}?`, type: 'choice', answer, choices: rng.shuffle([answer, vform(1, -h, k), vform(1, h, -k), vform(1, -h, -k)]), params: { kind, h, k },
          hints: [`A shift ${h < 0 ? 'left' : 'right'} ${N(Math.abs(h))} puts ${V('h')} = ${N(h)} inside the bracket: (${X} − ${wrap(h)}) = (${M.poly([1, -h])}).`, `A shift ${k < 0 ? 'down' : 'up'} ${N(Math.abs(k))} adds ${N(k)} outside the bracket.`, `<b>${answer}</b>.`] };
      }
      const a = rng.pick([2, 3, 4, -2, -3, 0.5, 0.25, -0.5]);
      const words = aa => cap((aa < 0 ? `reflected over the ${X}-axis and ` : '') + (Math.abs(aa) > 1 ? `stretched vertically by a factor of ${N(Math.abs(aa))}` : `compressed vertically by a factor of ${N(Math.abs(aa))}`));
      const answer = words(a);
      const choices = rng.shuffle([answer].concat(distinct(answer, [words(-a), words(1 / a), words(-1 / a), `Shifted ${a < 0 ? 'down' : 'up'} ${N(Math.abs(a))}`], 3)));
      return { prompt: `Compared with the graph of ${Y} = ${sq(X)}, the graph of this function is …${big(`${Y} = ${coef(a)}${sq(X)}`)}`, type: 'choice', answer, choices, params: { kind, a },
        hints: [`The number in front of ${sq(X)} is ${V('a')} = ${N(a)}. ${a < 0 ? 'It is negative, so the parabola is flipped to open downward.' : 'It is positive, so the parabola still opens upward.'}`, `|${V('a')}| = ${N(Math.abs(a))}, which is ${Math.abs(a) > 1 ? 'bigger than 1: every height is multiplied by ' + N(Math.abs(a)) + ', a vertical stretch (narrower).' : 'between 0 and 1: every height is multiplied by ' + N(Math.abs(a)) + ', a vertical compression (wider).'}`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, h, k, a } = q.params;
      if (kind === 'stretch') return q.answer === cap((a < 0 ? `reflected over the ${X}-axis and ` : '') + (Math.abs(a) > 1 ? `stretched vertically by a factor of ${N(Math.abs(a))}` : `compressed vertically by a factor of ${N(Math.abs(a))}`)) && Math.abs(a * 4 - (a * (2 * 2))) < 1e-9;
      const f = x => (x - h) * (x - h) + k;                            // brute-force the vertex of the shifted graph
      let best = -20, bestV = f(-20);
      for (let x = -20; x <= 20; x++) if (f(x) < bestV) { bestV = f(x); best = x; }
      const dirTxt = `${best < 0 ? 'left' : 'right'} ${N(Math.abs(best))} and ${bestV < 0 ? 'down' : 'up'} ${N(Math.abs(bestV))}`;
      return q.answer === (kind === 'describe' ? `Shift ${dirTxt}` : `${Y} = ${sq(`(${M.poly([1, -best])})`)} ${M.signed(bestV)}`);
    },
  });

  A.skill({
    id: 'int2.quadratic-models', title: 'Quadratic word problems',
    learn: p(`Things that are thrown or launched follow a parabola. If ${V('h')}(${V('t')}) is the height after ${V('t')} seconds, the highest point is the <b>vertex</b>: it happens at ${V('t')} = ${F(`−${V('b')}`, `2${V('a')}`)}, and the maximum height is ${V('h')} of that time. The object lands when ${V('h')}(${V('t')}) = 0: solve with factoring or the quadratic formula and keep the positive time.`) +
      p(`Area problems work the same way. A rectangle with a fixed amount of fencing ${V('P')} and width ${V('w')} has length ${V('P')}/2 − ${V('w')}, so its area ${V('A')} = ${V('w')}(${V('P')}/2 − ${V('w')}) is a parabola opening down, and the biggest area is at the vertex.`) +
      example('Example', `${big(`${V('h')}(${V('t')}) = −16${sq(V('t'))} + 64${V('t')} + 5`)}Vertex at ${V('t')} = −64 ÷ (2 · (−16)) = 2 seconds. Maximum height: ${V('h')}(2) = −64 + 128 + 5 = <b>69 feet</b>.`),
    make(rng) {
      const kind = rng.pick(['max', 'tmax', 'ground', 'area']);
      const name = rng.pick(NAMES), T = V('t');
      if (kind === 'area') {
        const P = rng.pick([40, 48, 60, 80, 100, 120, 160, 200]), w = P / 4, wantArea = rng.bool();
        const thing = rng.pick(['a rectangular garden', 'a dog pen', 'a vegetable patch', 'a chicken run']);
        return { prompt: `${name} has ${N(P)} metres of fencing for ${thing}. If the width is ${V('w')} metres, the area is ${V('A')}(${V('w')}) = ${V('w')}(${N(P / 2)} − ${V('w')}). ${wantArea ? 'What is the largest area possible?' : 'What width gives the largest area?'}`, type: 'number', answer: wantArea ? w * w : w, unit: wantArea ? 'm²' : 'm', params: { kind, P, wantArea },
          hints: [`Expand: ${V('A')} = −${sq(V('w'))} + ${N(P / 2)}${V('w')}. This parabola opens down, so its vertex is the maximum.`, `Vertex at ${V('w')} = ${F(`−${V('b')}`, `2${V('a')}`)} = ${F(N(-P / 2), N(-2))} = ${N(w)}, so the best shape is a ${N(w)} by ${N(w)} square.`, wantArea ? `Largest area: ${N(w)} × ${N(w)} = <b>${N(w * w)}</b> m².` : `The best width is <b>${N(w)}</b> m.`] };
      }
      const t2 = rng.pick([0.5, 1, 1.5]), t1 = rng.pick([1.5, 2, 2.5, 3, 4, 5].filter(t => t > t2));
      const v = 16 * (t1 - t2), h0 = 16 * t1 * t2;                    // h(t) = −16(t − t1)(t + t2) = −16t² + vt + h0
      const tmax = v / 32, hmax = h0 + v * v / 64, D = v * v + 64 * h0;
      const scene = rng.pick([`${name} throws a ball straight up from a balcony`, `A model rocket is launched from a platform`, `${name} tosses a stone upward from a bridge`, `A ball is kicked upward from the top of a ramp`]);
      const fnTxt = `${V('h')}(${T}) = ${M.poly([-16, v, h0], 't')}`;
      const intro = `${scene}. Its height in feet after ${T} seconds is ${fnTxt}.`;
      if (kind === 'ground') return { prompt: `${intro} After how many seconds does it hit the ground?`, type: 'number', answer: t1, unit: 's', params: { kind, v, h0 },
        hints: [`On the ground the height is 0: solve −16${sq(T)} + ${N(v)}${T} + ${N(h0)} = 0.`, `Quadratic formula with ${V('a')} = −16, ${V('b')} = ${N(v)}, ${V('c')} = ${N(h0)}: the discriminant is ${N(v * v)} + ${N(64 * h0)} = ${N(D)}, and ${R(N(D))} = ${N(Math.sqrt(D))}.`, `${T} = ${F(`−${N(v)} ± ${N(Math.sqrt(D))}`, '−32')} gives ${N(t1)} or ${N(-t2)}. Time cannot be negative, so it lands after <b>${N(t1)}</b> seconds.`] };
      const hints = [`The maximum height is at the vertex. With ${V('a')} = −16 and ${V('b')} = ${N(v)}, the vertex is at ${T} = ${F(`−${V('b')}`, `2${V('a')}`)} = ${F(N(-v), N(-32))} = ${N(tmax)} seconds.`];
      if (kind === 'tmax') return { prompt: `${intro} After how many seconds does it reach its maximum height?`, type: 'number', answer: tmax, unit: 's', params: { kind, v, h0 }, hints: hints.concat(`The maximum height is reached after <b>${N(tmax)}</b> seconds.`) };
      return { prompt: `${intro} What is its maximum height?`, type: 'number', answer: hmax, unit: 'ft', params: { kind, v, h0 },
        hints: hints.concat(`Substitute ${T} = ${N(tmax)}: ${V('h')} = −16(${N(tmax)})² + ${N(v)}(${N(tmax)}) + ${N(h0)} = ${N(-16 * tmax * tmax)} + ${N(v * tmax)} + ${N(h0)}.`, `The maximum height is <b>${N(hmax)}</b> feet.`) };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'area') {
        let bestW = 0, bestA = 0;                                    // scan every half-metre width
        for (let w = 0; w <= P.P / 2; w += 0.5) { const area = w * (P.P / 2 - w); if (area > bestA) { bestA = area; bestW = w; } }
        return Math.abs(q.answer - (P.wantArea ? bestA : bestW)) < 1e-9;
      }
      const h = t => -16 * t * t + P.v * t + P.h0;
      if (P.kind === 'ground') return q.answer > 0 && Math.abs(h(q.answer)) < 1e-9;
      let bestT = 0, bestH = h(0);                                   // scan the flight in small steps
      for (let t = 0; t <= 10; t += 0.005) if (h(t) > bestH + 1e-12) { bestH = h(t); bestT = t; }
      return Math.abs(q.answer - (P.kind === 'tmax' ? bestT : bestH)) < 1e-6;
    },
  });

  /* ---------- Unit 4: Exponents and radicals ---------- */
  A.skill({
    id: 'int2.rational-exponents', title: 'Rational exponents',
    learn: p(`A fraction in an exponent means a root: <b>${S(V('b'), `1/${V('n')}`)} = ${nroot(V('n'), V('b'))}</b>. So ${S(8, '1/3')} is the cube root of 8, which is 2. With a numerator too, the denominator is still the root and the numerator is a power: <b>${S(V('b'), `${V('m')}/${V('n')}`)} = ${nroot(V('n'), S(V('b'), V('m')))} = ${S(`(${nroot(V('n'), V('b'))})`, V('m'))}</b>. Taking the root first keeps the numbers small.`) +
      p(`${S(8, '2/3')} = ${S(`(${nroot(3, 8)})`, 2)} = ${sq(2)} = 4. A negative exponent still means “reciprocal”: ${S(8, '−2/3')} = ${F(1, 4)}. The same rule turns radicals into powers: ${nroot(5, S(X, 2))} = ${S(X, '2/5')}.`) +
      example('Example', `${big(S(16, '3/4'))}Fourth root first: ${nroot(4, 16)} = 2. Then the power: ${S(2, 3)} = <b>8</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'eval', 'power']);
      if (kind === 'power') {
        const n = rng.pick([2, 3, 3, 4, 5]), m = rng.pick([1, 2, 3, 5, 7].filter(x => x !== n && M.gcd(x, n) === 1));
        const e = (num, den) => den === 1 ? String(num) : `${num}/${den}`;
        const opts = m === 1 ? [{ t: S(X, e(1, n)), v: 1 / n }, { t: S(X, String(n)), v: n }, { t: S(X, `−1/${n}`), v: -1 / n }, { t: S(X, `−${n}`), v: -n }]
          : [{ t: S(X, e(m, n)), v: m / n }, { t: S(X, e(n, m)), v: n / m }, { t: S(X, e(m * n, 1)), v: m * n }, { t: S(X, e(1, m * n)), v: 1 / (m * n) }];
        return { prompt: `Write as a single power of ${X}.${big(nroot(n, m === 1 ? X : S(X, m)))}`, type: 'choice', answer: opts[0].t, choices: rng.shuffle(opts.map(o => o.t)), params: { kind, m, n, opts },
          hints: [`The index of the root (${N(n)}) becomes the denominator of the exponent: ${nroot(n, X)} = ${S(X, e(1, n))}.`, `The power inside (${N(m)}) is the numerator.`, `<b>${opts[0].t}</b>.`] };
      }
      const [r, n] = rng.pick([[2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [9, 2], [10, 2], [2, 3], [3, 3], [4, 3], [5, 3], [2, 4], [3, 4], [2, 5]]);
      const m = rng.pick([1, 2, 3].filter(x => x !== n && M.gcd(x, n) === 1 && Math.pow(r, x) <= 1000));
      const base = Math.pow(r, n), pw = Math.pow(r, m), neg = rng.chance(0.25);
      const ans = neg ? 1 / pw : pw;
      const hints = [`The denominator ${N(n)} is the root: ${nroot(n, N(base))} = ${N(r)}, because ${S(N(r), n)} = ${N(base)}.`, m === 1 ? `The numerator is 1, so there is no further power.` : `The numerator ${N(m)} is the power: ${S(N(r), m)} = ${N(pw)}.`];
      if (neg) hints.push(`The negative sign means the reciprocal: ${F(1, N(pw))}.`);
      hints.push(`<b>${S(N(base), `${neg ? '−' : ''}${m}/${n}`)} = ${neg ? F(1, pw) : N(pw)}</b>.`);
      return { prompt: `Evaluate.${big(S(N(base), `${neg ? '−' : ''}${m}/${n}`))}`, type: 'number', answer: ans, answerText: neg ? M.fracText(1, pw) : String(pw), params: { kind, base, m, n, neg }, hints };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'power') { const o = P.opts.find(x => x.t === q.answer); return !!o && Math.abs(Math.pow(2, o.v) - Math.pow(Math.pow(2, P.m), 1 / P.n)) < 1e-9; }
      return Math.abs(Math.pow(P.base, (P.neg ? -1 : 1) * P.m / P.n) - q.answer) < 1e-9 * Math.max(1, q.answer);
    },
  });

  A.skill({
    id: 'int2.radicals', title: 'Simplifying and combining radicals',
    learn: p(`A square root is <b>simplified</b> when the number under it has no perfect-square factor left. Use ${R(`${V('a')}${V('b')}`)} = ${R(V('a'))} · ${R(V('b'))}: find the largest perfect square that divides the radicand and take its root outside. ${R(72)} = ${R(36)} · ${R(2)} = 6${R(2)}.`) +
      p(`<b>Adding and subtracting</b> works like combining like terms: only like radicals combine. 3${R(5)} + 4${R(5)} = 7${R(5)}, but 3${R(5)} + 4${R(3)} stays as it is. Simplify first: ${R(8)} + ${R(2)} = 2${R(2)} + ${R(2)} = 3${R(2)}.`) +
      p(`<b>Multiplying</b>: multiply the outsides, multiply the insides, then simplify. 2${R(3)} · 5${R(6)} = 10${R(18)} = 10 · 3${R(2)} = 30${R(2)}.`) +
      example('Example', `${big(`Simplify ${R(50)}`)}The largest perfect square in 50 is 25: ${R(50)} = ${R(25)} · ${R(2)} = <b>5${R(2)}</b>.`),
    make(rng) {
      const kind = rng.pick(['simplify', 'simplify', 'add', 'mul']);
      const sqf = [2, 3, 5, 6, 7, 10, 11, 13];
      const val = o => o.k * Math.sqrt(o.r);
      const opts = (ans, cands) => {                                // the answer first, then up to three choices that differ in value and in text
        const out = [{ t: rad(ans.k, ans.r), k: ans.k, r: ans.r }];
        for (const c of cands) { const t = rad(c.k, c.r); if (out.length < 4 && c.k !== 0 && Math.abs(val(c) - val(ans)) > 1e-9 && !out.some(o => key(o.t) === key(t))) out.push({ t, k: c.k, r: c.r }); }
        return out;
      };
      const finish = (prompt, o, params, hints) => ({ prompt, type: 'choice', answer: o[0].t, choices: rng.shuffle(o.map(x => x.t)), params: Object.assign({ kind, opts: o }, params), hints });
      if (kind === 'simplify') {
        const k = rng.int(2, 7), r = rng.pick(sqf), n = k * k * r;
        const o = opts({ k, r }, [{ k: k * k, r }, { k: r, r: k }, { k: k + 1, r }, { k: k - 1, r }]);
        return finish(`Simplify.${big(R(N(n)))}`, o, { n }, [`Look for the largest perfect square that divides ${N(n)}: ${N(n)} = ${N(k * k)} × ${N(r)}.`, `${R(N(n))} = ${R(N(k * k))} · ${R(N(r))} = ${N(k)} · ${R(N(r))}.`, `<b>${o[0].t}</b>.`]);
      }
      if (kind === 'add') {
        const r = rng.pick(sqf), a = rng.int(2, 9), b = rng.int(1, 9), sub = rng.bool() && a > b, hidden = rng.chance(0.4) && b > 1 && b < 6;
        const total = sub ? a - b : a + b, second = hidden ? R(N(b * b * r)) : rad(b, r);
        const o = opts({ k: total, r }, [{ k: sub ? a + b : a - b, r }, { k: a * b, r }, hidden ? { k: sub ? a - b * b : a + b * b, r } : { k: total, r: sqf[(sqf.indexOf(r) + 1) % sqf.length] }, { k: total + 1, r }]);
        return finish(`Simplify.${big(`${rad(a, r)} ${sub ? '−' : '+'} ${second}`)}`, o, { a, b, r, sub, hidden }, [hidden ? `First simplify ${R(N(b * b * r))}: ${N(b * b * r)} = ${N(b * b)} × ${N(r)}, so ${R(N(b * b * r))} = ${rad(b, r)}.` : `Both terms are multiples of ${R(N(r))}, so they are like radicals.`, `${sub ? 'Subtract' : 'Add'} the numbers in front and keep the radical: ${N(a)} ${sub ? '−' : '+'} ${N(b)} = ${N(total)}.`, `<b>${o[0].t}</b>.`]);
      }
      const a = rng.int(2, 6), b = rng.int(2, 6), r = rng.pick(sqf.slice(0, 5)), s = rng.pick(sqf.slice(0, 5));
      const [k2, r2] = rootParts(r * s), [k3, r3] = rootParts(r + s);
      const o = opts({ k: a * b * k2, r: r2 }, [{ k: (a + b) * k2, r: r2 }, { k: a * b * k3, r: r3 }, { k: a * b * k2 * k2, r: r2 }, { k: a * b * k2 + 1, r: r2 }]);
      return finish(`Multiply and simplify.${big(`${rad(a, r)} · ${rad(b, s)}`)}`, o, { a, b, r, s }, [`Multiply the numbers in front and the numbers under the roots separately: ${N(a)} · ${N(b)} = ${N(a * b)} and ${R(N(r))} · ${R(N(s))} = ${R(N(r * s))}.`, k2 === 1 ? `${R(N(r * s))} has no perfect-square factor, so it is already simplified.` : `Simplify ${R(N(r * s))}: ${N(r * s)} = ${N(k2 * k2)} × ${N(r2)}, so ${R(N(r * s))} = ${rad(k2, r2)}.`, `<b>${o[0].t}</b>.`]);
    },
    verify(q) {
      const P = q.params, o = P.opts.find(x => x.t === q.answer);
      if (!o || !squareFree(o.r)) return false;                      // must be fully simplified
      const v = P.kind === 'simplify' ? Math.sqrt(P.n) : P.kind === 'add' ? P.a * Math.sqrt(P.r) + (P.sub ? -1 : 1) * Math.sqrt(P.b * P.b * P.r) : P.a * Math.sqrt(P.r) * P.b * Math.sqrt(P.s);
      return Math.abs(v - o.k * Math.sqrt(o.r)) < 1e-9;
    },
  });

  /* ---------- Unit 5: Complex numbers ---------- */
  A.skill({
    id: 'int2.imaginary-numbers', title: 'The imaginary unit',
    learn: p(`No real number squares to a negative, so mathematicians defined a new one: <b>${I} = ${R('−1')}</b>, which means <b>${sq(I)} = −1</b>. Square roots of negatives become multiples of ${I}: ${R('−36')} = ${R(36)} · ${R('−1')} = 6${I}, and ${R('−12')} = ${R(12)} · ${I} = 2${I}${R(3)} (simplify the root as usual).`) +
      p(`Powers of ${I} cycle every four: ${S(I, 1)} = ${I}, ${sq(I)} = −1, ${S(I, 3)} = −${I}, ${S(I, 4)} = 1, then it repeats. To find ${S(I, V('n'))}, divide ${V('n')} by 4 and look at the remainder: remainder 1 → ${I}, 2 → −1, 3 → −${I}, 0 → 1.`) +
      example('Example', `${big(S(I, 23))}23 ÷ 4 = 5 remainder 3, so ${S(I, 23)} has the same value as ${S(I, 3)}: <b>−${I}</b>.`),
    make(rng) {
      const kind = rng.pick(['power', 'power', 'sqrt', 'simplify']);
      if (kind === 'power') {
        const n = rng.int(5, 60), rem = n % 4, cycle = ['1', I, '−1', `−${I}`];
        return { prompt: `Simplify.${big(S(I, n))}`, type: 'choice', choices: cycle, keepOrder: true, answer: cycle[rem], params: { kind, n },
          hints: [`Powers of ${I} repeat every 4: ${I}, −1, −${I}, 1, ${I}, −1, …`, `${N(n)} ÷ 4 = ${N(Math.floor(n / 4))} remainder ${rem}, so ${S(I, n)} has the same value as ${S(I, rem === 0 ? 4 : rem)}.`, `<b>${S(I, n)} = ${cycle[rem]}</b>.`] };
      }
      const val = o => o.k * Math.sqrt(o.r) * (o.im ? 1 : -1000);   // keeps real and imaginary options apart
      const opts = (ans, cands) => {
        const out = [Object.assign({ t: rad(ans.k, ans.r, ans.im ? I : '') }, ans)];
        for (const c of cands) { const t = rad(c.k, c.r, c.im ? I : ''); if (out.length < 4 && Math.abs(val(c) - val(ans)) > 1e-9 && !out.some(o => key(o.t) === key(t))) out.push(Object.assign({ t }, c)); }
        return out;
      };
      if (kind === 'sqrt') {
        const k = rng.int(2, 12), K = k * k;
        const o = opts({ k, r: 1, im: true }, [{ k: -k, r: 1, im: false }, { k, r: 1, im: false }, { k: K, r: 1, im: true }, { k: k * 2, r: 1, im: true }]);
        return { prompt: `Simplify.${big(R(N(-K)))}`, type: 'choice', answer: o[0].t, choices: rng.shuffle(o.map(x => x.t)), params: { kind, K, opts: o },
          hints: [`Split off the negative: ${R(N(-K))} = ${R(N(K))} · ${R('−1')}.`, `${R(N(K))} = ${N(k)} and ${R('−1')} = ${I}.`, `<b>${o[0].t}</b>.`] };
      }
      const k = rng.int(2, 5), r = rng.pick([2, 3, 5, 6, 7]), K = k * k * r;
      const o = opts({ k, r, im: true }, [{ k, r, im: false }, { k: -k, r, im: false }, { k: r, r: k, im: true }, { k: k * k, r, im: true }]);
      return { prompt: `Simplify.${big(R(N(-K)))}`, type: 'choice', answer: o[0].t, choices: rng.shuffle(o.map(x => x.t)), params: { kind, K, opts: o },
        hints: [`Split off the negative: ${R(N(-K))} = ${R(N(K))} · ${R('−1')} = ${R(N(K))} · ${I}.`, `Simplify ${R(N(K))}: ${N(K)} = ${N(k * k)} × ${N(r)}, so ${R(N(K))} = ${rad(k, r)}.`, `<b>${o[0].t}</b> (the ${I} is usually written before the root so it is not mistaken for part of the radicand).`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'power') {
        let re = 1, im = 0;                                            // multiply by i, n times
        for (let j = 0; j < P.n; j++) [re, im] = [-im, re];
        return q.answer === (re === 1 ? '1' : re === -1 ? '−1' : im === 1 ? I : `−${I}`);
      }
      const o = P.opts.find(x => x.t === q.answer);
      return !!o && o.im === true && o.k > 0 && squareFree(o.r) && o.k * o.k * o.r === P.K;
    },
  });

  A.skill({
    id: 'int2.complex-arithmetic', title: 'Adding, subtracting, and multiplying complex numbers',
    learn: p(`A <b>complex number</b> has the form ${V('a')} + ${V('b')}${I}: a real part ${V('a')} and an imaginary part ${V('b')}. To <b>add or subtract</b>, combine real parts with real parts and imaginary parts with imaginary parts, just like like terms: (3 + 2${I}) + (1 − 5${I}) = 4 − 3${I}. When subtracting, distribute the minus over both parts.`) +
      p(`To <b>multiply</b>, expand with FOIL, replace ${sq(I)} with −1, and collect: (2 + 3${I})(1 − 4${I}) = 2 − 8${I} + 3${I} − 12${sq(I)} = 2 − 5${I} + 12 = 14 − 5${I}.`) +
      example('Example', `${big(`(4 − ${I})(2 + 3${I})`)}8 + 12${I} − 2${I} − 3${sq(I)} = 8 + 10${I} + 3 = <b>11 + 10${I}</b>.`),
    make(rng) {
      const op = rng.pick(['add', 'sub', 'mul', 'mul']);
      const a = rng.nz(-9, 9), b = rng.nz(-9, 9), c = rng.nz(-9, 9), d = rng.nz(-9, 9);
      const z = (re, im) => `(${cplx(re, im)})`;
      let re, im, cands, expr, hints;
      if (op === 'add') { re = a + c; im = b + d; expr = `${z(a, b)} + ${z(c, d)}`; cands = [[a + c, b - d], [a - c, b + d], [a + c, b * d], [a + c + 1, b + d]]; hints = [`Add the real parts: ${N(a)} + ${wrap(c)} = ${N(re)}.`, `Add the imaginary parts: ${N(b)}${I} + ${wrap(d)}${I} = ${N(im)}${I}.`]; }
      else if (op === 'sub') { re = a - c; im = b - d; expr = `${z(a, b)} − ${z(c, d)}`; cands = [[a - c, b + d], [a + c, b - d], [c - a, d - b], [a - c, b]]; hints = [`Distribute the minus sign: ${cplx(a, b)} − ${wrap(c)} − ${wrap(d)}${I}.`, `Real parts: ${N(a)} − ${wrap(c)} = ${N(re)}. Imaginary parts: ${N(b)}${I} − ${wrap(d)}${I} = ${N(im)}${I}.`]; }
      else { re = a * c - b * d; im = a * d + b * c; expr = `${z(a, b)}${z(c, d)}`; cands = [[a * c + b * d, im], [a * c, b * d], [re, a * d - b * c], [re, -im]]; hints = [`FOIL: ${N(a)}·${wrap(c)} + ${N(a)}·${wrap(d)}${I} + ${N(b)}${I}·${wrap(c)} + ${N(b)}${I}·${wrap(d)}${I} = ${N(a * c)} ${M.signed(a * d)}${I} ${M.signed(b * c)}${I} ${M.signed(b * d)}${sq(I)}.`, `${sq(I)} = −1, so ${N(b * d)}${sq(I)} = ${N(-b * d)}.`, `Collect: real ${N(a * c)} ${M.signed(-b * d)} = ${N(re)}; imaginary ${N(a * d)}${I} ${M.signed(b * c)}${I} = ${N(im)}${I}.`]; }
      const opts = [{ t: cplx(re, im), re, im }];
      for (const [r2, i2] of cands) { const t = cplx(r2, i2); if (opts.length < 4 && (r2 !== re || i2 !== im) && !opts.some(o => key(o.t) === key(t))) opts.push({ t, re: r2, im: i2 }); }
      return { prompt: `${op === 'add' ? 'Add' : op === 'sub' ? 'Subtract' : 'Multiply'}. Write the result in the form ${V('a')} + ${V('b')}${I}.${big(expr)}`, type: 'choice', answer: opts[0].t, choices: rng.shuffle(opts.map(o => o.t)), params: { op, a, b, c, d, opts }, hints: hints.concat(`<b>${opts[0].t}</b>.`) };
    },
    verify(q) {
      const { op, a, b, c, d, opts } = q.params, o = opts.find(x => x.t === q.answer);
      if (!o) return false;
      if (op === 'add') return o.re - a === c && o.im - b === d;        // undo the operation instead of redoing it
      if (op === 'sub') return o.re + c === a && o.im + d === b;
      const m1 = a * a + b * b;                                         // z1·z2·conj(z1) must equal z2·|z1|²
      return o.re * a + o.im * b === c * m1 && o.im * a - o.re * b === d * m1;
    },
  });

  /* ---------- Unit 6: Similarity and right triangles ---------- */
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  const toRad = d => d * Math.PI / 180;

  A.skill({
    id: 'int2.similar-triangles', title: 'Solving similar triangles',
    learn: p(`Two triangles are <b>similar</b> when one is a scaled copy of the other: corresponding angles are equal and <b>corresponding sides are in the same ratio</b>. That ratio is the <b>scale factor</b>. In △ABC ~ △DEF the order of the letters tells you which parts match: A ↔ D, B ↔ E, C ↔ F, so side AB matches DE, BC matches EF and AC matches DF.`) +
      p(`To find a missing side, find the scale factor from a pair of matching sides you know (new ÷ original), then multiply. Or set up a proportion and cross-multiply: ${F('AB', 'DE')} = ${F('BC', 'EF')}.`) +
      example('Example', `△ABC ~ △DEF with AB = 6, BC = 9 and DE = 10. The scale factor from ABC to DEF is 10 ÷ 6 = ${F(5, 3)}, so EF = 9 × ${F(5, 3)} = <b>15</b>.`),
    make(rng) {
      const [k, kTxt] = rng.pick([[2, '2'], [3, '3'], [1.5, '1.5'], [2.5, '2.5'], [0.5, '0.5'], [4, '4']]);
      const base = [rng.int(2, 9) * 2, rng.int(2, 9) * 2, rng.int(2, 9) * 2];
      const names = [['AB', 'DE'], ['BC', 'EF'], ['AC', 'DF']];
      const [known, ask] = rng.sample([0, 1, 2], 2);
      const reverse = rng.bool();                                     // ask for a side of the small triangle instead
      const small = base, large = base.map(s => s * k);
      const given = reverse ? { orig: large, img: small, from: 1, to: 0 } : { orig: small, img: large, from: 0, to: 1 };
      const ans = given.img[ask];
      const sentence = reverse
        ? `${names[known][1]} = ${N(large[known])}, ${names[ask][1]} = ${N(large[ask])} and ${names[known][0]} = ${N(small[known])}. Find ${names[ask][0]}.`
        : `${names[known][0]} = ${N(small[known])}, ${names[ask][0]} = ${N(small[ask])} and ${names[known][1]} = ${N(large[known])}. Find ${names[ask][1]}.`;
      const kk = reverse ? 1 / k : k;
      const sf = given.img[known] / given.orig[known];
      return { prompt: `△ABC ~ △DEF. ${sentence}`, type: 'number', answer: ans, params: { a1: given.orig[known], b1: given.img[known], a2: given.orig[ask] },
        hints: [`Match the sides by the order of the letters: ${names[known][0]} ↔ ${names[known][1]} and ${names[ask][0]} ↔ ${names[ask][1]}.`,
          `Scale factor: ${N(given.img[known])} ÷ ${N(given.orig[known])} = ${N(M.round(sf, 4))}${Math.abs(kk - sf) < 1e-9 && kk < 1 ? ` (${M.fracText(given.img[known], given.orig[known])})` : ''}.`,
          `Multiply the matching side: ${N(given.orig[ask])} × ${N(M.round(sf, 4))} = <b>${N(ans)}</b>.`] };
    },
    verify(q) { const { a1, b1, a2 } = q.params; return Math.abs(a1 * q.answer - b1 * a2) < 1e-9; },     // cross-multiply the proportion
  });

  A.skill({
    id: 'int2.pythagorean-theorem', title: 'The Pythagorean theorem',
    learn: p(`In a right triangle with legs ${V('a')} and ${V('b')} and hypotenuse ${V('c')} (the longest side, opposite the right angle): <b>${sq(V('a'))} + ${sq(V('b'))} = ${sq(V('c'))}</b>. To find the hypotenuse, add the squares and take the square root. To find a leg, subtract: ${sq(V('a'))} = ${sq(V('c'))} − ${sq(V('b'))}.`) +
      p(`Some whole-number triples come up again and again: 3-4-5, 5-12-13, 8-15-17, 7-24-25, and their multiples such as 6-8-10 or 9-12-15. Spotting one saves the arithmetic.`) +
      example('Example', `Legs 9 and 12. ${sq(9)} + ${sq(12)} = 81 + 144 = 225, and ${R(225)} = <b>15</b>. (It is 3-4-5 scaled by 3.)`),
    make(rng) {
      const t = rng.pick(TRIPLES), m = t[2] > 20 ? 1 : rng.int(1, t[2] > 13 ? 2 : 4);
      const [a, b, c] = t.map(x => x * m), kind = rng.pick(['hyp', 'leg', 'leg', 'word']);
      if (kind === 'word') {
        const name = rng.pick(NAMES);
        return { prompt: `${name} leans a ${N(c)}-foot ladder against a wall. The foot of the ladder is ${N(a)} feet from the wall. How high up the wall does the ladder reach?`, type: 'number', answer: b, unit: 'ft', params: { a, c, find: 'leg' },
          hints: [`The wall, the ground and the ladder form a right triangle; the ladder is the hypotenuse.`, `${sq(V('h'))} = ${sq(N(c))} − ${sq(N(a))} = ${N(c * c)} − ${N(a * a)} = ${N(b * b)}.`, `${V('h')} = ${R(N(b * b))} = <b>${N(b)}</b> feet.`] };
      }
      if (kind === 'hyp') return { prompt: `A right triangle has legs of length ${N(a)} and ${N(b)}. How long is the hypotenuse?${triFig(N(a), N(b), V('c'))}`, type: 'number', answer: c, params: { a, b, find: 'hyp' },
        hints: [`${sq(V('c'))} = ${sq(V('a'))} + ${sq(V('b'))} = ${sq(N(a))} + ${sq(N(b))}.`, `${N(a * a)} + ${N(b * b)} = ${N(c * c)}.`, `${V('c')} = ${R(N(c * c))} = <b>${N(c)}</b>.`] };
      return { prompt: `A right triangle has hypotenuse ${N(c)} and one leg ${N(a)}. How long is the other leg?${triFig(N(a), V('b'), N(c))}`, type: 'number', answer: b, params: { a, c, find: 'leg' },
        hints: [`The hypotenuse is ${N(c)}, so ${sq(V('b'))} = ${sq(V('c'))} − ${sq(V('a'))}.`, `${N(c * c)} − ${N(a * a)} = ${N(b * b)}.`, `${V('b')} = ${R(N(b * b))} = <b>${N(b)}</b>.`] };
    },
    verify(q) { const P = q.params; return P.find === 'hyp' ? Math.abs(Math.hypot(P.a, P.b) - q.answer) < 1e-9 : Math.abs(Math.hypot(P.a, q.answer) - P.c) < 1e-9; },
  });

  A.skill({
    id: 'int2.special-right-triangles', title: 'Special right triangles',
    learn: p(`A <b>45°-45°-90°</b> triangle is half a square. Its legs are equal, and the hypotenuse is <b>leg × ${R(2)}</b>. So legs of 5 give a hypotenuse of 5${R(2)}; a hypotenuse of 8${R(2)} gives legs of 8.`) +
      p(`A <b>30°-60°-90°</b> triangle is half an equilateral triangle. If the short leg (opposite 30°) is ${V('s')}, the hypotenuse is <b>2${V('s')}</b> and the long leg (opposite 60°) is <b>${V('s')}${R(3)}</b>. Always find the short leg first, then everything else follows.`) +
      example('Example', `A 30°-60°-90° triangle has hypotenuse 14. The short leg is 14 ÷ 2 = 7, and the long leg is <b>7${R(3)}</b>.`),
    make(rng) {
      const s = rng.int(2, 12), kind = rng.pick(['45leg', '45hyp', '30short', '30hyp', '30long']);
      let given, ask, ans, cands, hints;
      if (kind === '45leg') { given = `each leg is ${N(s)}`; ask = 'the hypotenuse'; ans = { k: s, r: 2 }; cands = [{ k: s, r: 3 }, { k: 2 * s, r: 1 }, { k: 2 * s, r: 2 }, { k: s + 1, r: 2 }]; hints = [`In a 45°-45°-90° triangle the hypotenuse is leg × ${R(2)}.`, `${N(s)} × ${R(2)} = <b>${rad(s, 2)}</b>.`]; }
      else if (kind === '45hyp') { given = `the hypotenuse is ${rad(s, 2)}`; ask = 'each leg'; ans = { k: s, r: 1 }; cands = [{ k: 2 * s, r: 1 }, { k: s, r: 2 }, { k: s, r: 3 }, { k: s + 1, r: 1 }]; hints = [`hypotenuse = leg × ${R(2)}, so leg = hypotenuse ÷ ${R(2)}.`, `${rad(s, 2)} ÷ ${R(2)} = <b>${N(s)}</b>.`]; }
      else if (kind === '30short') { given = `the short leg (opposite 30°) is ${N(s)}`; ask = 'the long leg'; ans = { k: s, r: 3 }; cands = [{ k: s, r: 2 }, { k: 2 * s, r: 1 }, { k: 2 * s, r: 3 }, { k: 3 * s, r: 1 }]; hints = [`The long leg is short leg × ${R(3)}.`, `${N(s)} × ${R(3)} = <b>${rad(s, 3)}</b>.`]; }
      else if (kind === '30hyp') { given = `the hypotenuse is ${N(2 * s)}`; ask = 'the long leg (opposite 60°)'; ans = { k: s, r: 3 }; cands = [{ k: 2 * s, r: 3 }, { k: s, r: 2 }, { k: s, r: 1 }, { k: 4 * s, r: 1 }]; hints = [`Find the short leg first: it is half the hypotenuse, ${N(2 * s)} ÷ 2 = ${N(s)}.`, `The long leg is short leg × ${R(3)}.`, `<b>${rad(s, 3)}</b>.`]; }
      else { given = `the long leg (opposite 60°) is ${rad(s, 3)}`; ask = 'the hypotenuse'; ans = { k: 2 * s, r: 1 }; cands = [{ k: s, r: 1 }, { k: 2 * s, r: 3 }, { k: s, r: 2 }, { k: 3 * s, r: 1 }]; hints = [`long leg = short leg × ${R(3)}, so the short leg is ${rad(s, 3)} ÷ ${R(3)} = ${N(s)}.`, `The hypotenuse is twice the short leg.`, `2 × ${N(s)} = <b>${N(2 * s)}</b>.`]; }
      const opts = [{ t: rad(ans.k, ans.r), v: ans.k * Math.sqrt(ans.r) }];
      cands.forEach(c => { const t = rad(c.k, c.r), v = c.k * Math.sqrt(c.r); if (opts.length < 4 && Math.abs(v - opts[0].v) > 1e-9 && !opts.some(o => key(o.t) === key(t))) opts.push({ t, v }); });
      return { prompt: `In a ${kind.startsWith('45') ? '45°-45°-90°' : '30°-60°-90°'} triangle, ${given}. What is ${ask}?`, type: 'choice', answer: opts[0].t, choices: rng.shuffle(opts.map(o => o.t)), params: { kind, s, opts }, hints };
    },
    verify(q) {
      const { kind, s, opts } = q.params, o = opts.find(x => x.t === q.answer);
      if (!o) return false;
      const want = kind === '45leg' ? s / Math.sin(toRad(45)) : kind === '45hyp' ? s * Math.SQRT2 * Math.cos(toRad(45))
        : kind === '30short' ? s * Math.tan(toRad(60)) : kind === '30hyp' ? 2 * s * Math.sin(toRad(60)) : s * Math.sqrt(3) / Math.sin(toRad(60));    // trig as the second opinion
      return Math.abs(o.v - want) < 1e-9;
    },
  });

  A.skill({
    id: 'int2.trig-ratios', title: 'Trigonometric ratios',
    learn: p(`In a right triangle, name the sides from the point of view of one acute angle: the <b>hypotenuse</b> is opposite the right angle, the <b>opposite</b> side is across from the angle, and the <b>adjacent</b> side is the leg touching it. Then <b>SOH CAH TOA</b>: sin = ${F('opposite', 'hypotenuse')}, cos = ${F('adjacent', 'hypotenuse')}, tan = ${F('opposite', 'adjacent')}.`) +
      p(`The ratios depend only on the angle, not on the size of the triangle, which is why similar triangles give the same values. Switching to the other acute angle swaps opposite and adjacent: sin A = cos B.`) +
      example('Example', `A right triangle has legs 8 and 15 and hypotenuse 17. For the angle opposite the side 8: sin = ${F(8, 17)}, cos = ${F(15, 17)}, tan = <b>${F(8, 15)}</b>.`),
    make(rng) {
      const t = rng.pick(TRIPLES.slice(0, 5)), m = rng.pick([1, 1, 2]);
      const swap = rng.bool(), [ac, bc] = swap ? [t[1] * m, t[0] * m] : [t[0] * m, t[1] * m], ab = t[2] * m;
      const ang = rng.pick(['A', 'B']), fn = rng.pick(['sin', 'cos', 'tan']);
      const opp = ang === 'A' ? bc : ac, adj = ang === 'A' ? ac : bc;
      const [num, den] = fn === 'sin' ? [opp, ab] : fn === 'cos' ? [adj, ab] : [opp, adj];
      const oppName = ang === 'A' ? 'BC' : 'AC', adjName = ang === 'A' ? 'AC' : 'BC';
      const word = { sin: 'opposite ÷ hypotenuse', cos: 'adjacent ÷ hypotenuse', tan: 'opposite ÷ adjacent' }[fn];
      return { prompt: `In right triangle ABC, angle C is the right angle. Find ${fn} ${ang} as a fraction in simplest form.${triFig(N(ac), N(bc), N(ab), ang)}`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { ac, bc, ab, ang, fn },
        hints: [`From angle ${ang}: the hypotenuse is AB = ${N(ab)}, the opposite side is ${oppName} = ${N(opp)}, and the adjacent side is ${adjName} = ${N(adj)}.`,
          `${fn} = ${word} = ${F(num, den, { raw: true })}.`,
          `${M.gcd(num, den) > 1 ? `Simplify: ` : ''}${fn} ${ang} = <b>${M.fracText(num, den)}</b>.`] };
    },
    verify(q) {
      const { ac, bc, ab, ang, fn } = q.params;
      const A0 = Math.atan2(bc, ac), theta = ang === 'A' ? A0 : Math.PI / 2 - A0;      // measure the angle, then use Math's trig
      return Math.abs(ac * ac + bc * bc - ab * ab) < 1e-9 && Math.abs(Math[fn](theta) - q.answer) < 1e-9;
    },
  });

  A.skill({
    id: 'int2.solve-right-triangles', title: 'Solving right triangles with trigonometry',
    learn: p(`To find a <b>side</b>, pick the ratio that links the angle you know, the side you know, and the side you want. Write the equation, then solve: if sin 35° = ${F(V('x'), 12)}, then ${X} = 12 sin 35° ≈ 12 × 0.5736 ≈ 6.9. If the unknown ends up on the bottom, divide: tan 40° = ${F(9, V('x'))} gives ${X} = 9 ÷ tan 40°.`) +
      p(`To find an <b>angle</b>, form the ratio from two known sides and use the <b>inverse</b> function on a calculator: if tan ${V('A')} = ${F(5, 8)}, then ${V('A')} = tan<sup>−1</sup>(0.625) ≈ 32°.`) +
      example('Example', `A ramp makes a 20° angle with the ground and is 6 m long. Its height is the side opposite 20°, and the ramp is the hypotenuse: height = 6 sin 20° ≈ 6 × 0.3420 ≈ <b>2.1 m</b>.`),
    make(rng) {
      const kind = rng.pick(['side', 'side', 'angle']);
      if (kind === 'angle') {
        const ac = rng.int(3, 20), bc = rng.int(3, 20), ab = Math.hypot(ac, bc);
        const fn = rng.pick(['tan', 'sin', 'cos']);
        const f2 = fn !== 'tan' && Number.isInteger(ab) ? fn : 'tan';     // sin and cos only when the hypotenuse is a whole number
        const [num, den] = f2 === 'sin' ? [bc, ab] : f2 === 'cos' ? [ac, ab] : [bc, ac];
        const ans = Math.round(Math.atan2(bc, ac) * 180 / Math.PI);
        const labels = f2 === 'tan' ? [N(ac), N(bc), ''] : f2 === 'sin' ? ['', N(bc), N(ab)] : [N(ac), '', N(ab)];
        const inv = { sin: 'sin', cos: 'cos', tan: 'tan' }[f2], word = { sin: 'opposite ÷ hypotenuse', cos: 'adjacent ÷ hypotenuse', tan: 'opposite ÷ adjacent' }[f2];
        return { prompt: `In right triangle ABC, angle C is the right angle. Find the measure of angle A, to the nearest degree.${triFig(labels[0], labels[1], labels[2], 'A', '?')}`, type: 'number', answer: ans, unit: '°', params: { kind, num, den, fn: f2 },
          hints: [`From angle A, the sides you know are the ${f2 === 'tan' ? 'opposite and adjacent' : f2 === 'sin' ? 'opposite and hypotenuse' : 'adjacent and hypotenuse'}, so use ${inv}: ${inv} A = ${word} = ${F(num, den, { raw: true })} ≈ ${N(M.round(num / den, 4))}.`,
            `Use the inverse: A = ${inv}<sup>−1</sup>(${N(M.round(num / den, 4))}) ≈ ${N(M.round(Math.atan2(bc, ac) * 180 / Math.PI, 2))}°.`,
            `To the nearest degree, angle A ≈ <b>${N(ans)}°</b>.`] };
      }
      const deg = rng.int(15, 75), known = rng.pick(['hyp', 'adj', 'opp']);
      const want = rng.pick(['hyp', 'adj', 'opp'].filter(x => x !== known)), len = rng.int(4, 30);
      const sides = { hyp: 1, opp: Math.sin(toRad(deg)), adj: Math.cos(toRad(deg)) };
      const ans = M.round(len * sides[want] / sides[known], 1);
      const pair = [known, want].sort().join('-');
      const fn = pair === 'hyp-opp' ? 'sin' : pair === 'adj-hyp' ? 'cos' : 'tan';
      const val = M.round(Math[fn](toRad(deg)), 4);
      const top = fn === 'cos' ? 'adj' : 'opp', bottom = fn === 'tan' ? 'adj' : 'hyp';
      const lab = s => s === known ? N(len) : s === want ? X : '';
      const unknownOnTop = want === top;
      return { prompt: `In right triangle ABC, angle C is the right angle and angle A = ${N(deg)}°. Find ${X}, to the nearest tenth. (Use ${fn} ${N(deg)}° ≈ ${N(val)}.)${triFig(lab('adj'), lab('opp'), lab('hyp'), 'A', deg + '°')}`, type: 'number', answer: ans, tolerance: 0.05, params: { kind, deg, known, want, len },
        hints: [`From the ${N(deg)}° angle, ${N(len)} is the ${{ hyp: 'hypotenuse', opp: 'opposite side', adj: 'adjacent side' }[known]} and ${X} is the ${{ hyp: 'hypotenuse', opp: 'opposite side', adj: 'adjacent side' }[want]}, so use ${fn} = ${{ opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' }[top]} ÷ ${{ opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' }[bottom]}.`,
          `${fn} ${N(deg)}° = ${unknownOnTop ? F(X, N(len)) : F(N(len), X)}.`,
          unknownOnTop ? `Multiply: ${X} = ${N(len)} × ${fn} ${N(deg)}° ≈ ${N(len)} × ${N(val)} ≈ ${N(M.round(len * val, 3))}.` : `Solve for ${X}: ${X} = ${N(len)} ÷ ${fn} ${N(deg)}° ≈ ${N(len)} ÷ ${N(val)} ≈ ${N(M.round(len / val, 3))}.`,
          `To the nearest tenth, ${X} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'angle') { const ratio = P.num / P.den, inv = { sin: Math.asin, cos: Math.acos, tan: Math.atan }[P.fn]; return Math.abs(inv(ratio) * 180 / Math.PI - q.answer) <= 0.5; }
      const opp = P.known === 'opp' ? P.len : null, t = toRad(P.deg);       // rebuild the whole triangle from the known side
      const hyp = P.known === 'hyp' ? P.len : P.known === 'opp' ? P.len / Math.sin(t) : P.len / Math.cos(t);
      const sides = { hyp, opp: opp != null ? opp : hyp * Math.sin(t), adj: Math.sqrt(hyp * hyp - Math.pow(opp != null ? opp : hyp * Math.sin(t), 2)) };
      return Math.abs(sides[P.want] - q.answer) <= 0.05 + 1e-9;
    },
  });

  /* ---------- Unit 7: Circles ---------- */
  A.skill({
    id: 'int2.arc-sector', title: 'Arc length and sector area',
    learn: p(`A central angle of ${V('θ')} degrees cuts off the fraction ${F(V('θ'), 360)} of the whole circle. So the <b>arc length</b> is that fraction of the circumference, ${F(V('θ'), 360)} · 2π${V('r')}, and the <b>sector area</b> is that fraction of the area, ${F(V('θ'), 360)} · π${sq(V('r'))}.`) +
      p(`Simplify the fraction first: 90° is ${F(1, 4)} of the circle, 120° is ${F(1, 3)}, 45° is ${F(1, 8)}. Keep units straight: arc length is a length (cm), sector area is an area (cm²).`) +
      example('Example', `Radius 6 cm, central angle 120°. ${F(120, 360, { raw: true })} = ${F(1, 3)}. Arc length = ${F(1, 3)} × 2 × 3.14 × 6 = <b>12.56 cm</b>. Sector area = ${F(1, 3)} × 3.14 × 36 = <b>37.68 cm²</b>.`),
    make(rng) {
      const deg = rng.pick([30, 40, 45, 60, 72, 90, 120, 135, 150, 180, 210, 240, 270, 300]), r = rng.int(2, 15), area = rng.bool();
      const frac = M.simp(deg, 360), whole = area ? 3.14 * r * r : 2 * 3.14 * r;
      const ans = M.round(whole * deg / 360, 2);
      return { prompt: `A circle has radius ${N(r)} cm. Find the ${area ? 'area of the sector' : 'length of the arc'} cut off by a central angle of ${N(deg)}°. Use 3.14 for π and round to the nearest hundredth.`, type: 'number', answer: ans, unit: area ? 'cm²' : 'cm', tolerance: 0.05, params: { deg, r, area },
        hints: [`The angle is ${F(deg, 360, { raw: true })} = ${F(frac[0], frac[1])} of the full circle.`,
          area ? `The whole circle's area is π${sq(V('r'))} = 3.14 × ${sq(N(r))} = ${N(M.round(whole, 4))} cm².` : `The whole circumference is 2π${V('r')} = 2 × 3.14 × ${N(r)} = ${N(M.round(whole, 4))} cm.`,
          `${F(frac[0], frac[1])} × ${N(M.round(whole, 4))} ≈ <b>${N(ans)}</b> ${area ? 'cm²' : 'cm'}.`] };
    },
    verify(q) {
      const { deg, r, area } = q.params, rad0 = toRad(deg);              // radians: s = rθ, A = r²θ/2, with 3.14 for π
      const v = area ? r * r * rad0 / 2 : r * rad0;
      return Math.abs(v * 3.14 / Math.PI - q.answer) <= 0.006;
    },
  });

  A.skill({
    id: 'int2.inscribed-angles', title: 'Inscribed angles',
    learn: p(`A <b>central angle</b> has its vertex at the centre of the circle, and it has the same measure as the arc it cuts off. An <b>inscribed angle</b> has its vertex on the circle itself, and it is <b>half the measure of its intercepted arc</b>. So an inscribed angle is half the central angle that cuts off the same arc.`) +
      p(`Two consequences: inscribed angles that cut off the same arc are equal, and an inscribed angle that cuts off a semicircle (its sides go through the ends of a diameter) is always 90°.`) +
      example('Example', `Central angle AOB = 110°, and C is on the circle away from arc AB. The inscribed angle ACB cuts off the same arc, so it is 110° ÷ 2 = <b>55°</b>.`),
    make(rng) {
      const m = rng.pick([40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160]);
      const kind = rng.pick(['central', 'inscribed', 'arc', 'semi']);
      const aPos = 230, bPos = aPos + m, cPos = 50 + m / 2;
      if (kind === 'semi') {
        const x = rng.int(20, 70), fig = circleFig({ A: 180, B: 0, C: 2 * x }, [['A', 'B'], ['A', 'C'], ['C', 'B']]);
        return { prompt: `AB is a diameter of the circle with centre O, and C is on the circle. Angle CAB = ${N(x)}°. What is angle CBA?${fig}`, type: 'number', answer: 90 - x, unit: '°', params: { kind, x },
          hints: [`Angle ACB is inscribed in a semicircle, so it is 90°.`, `The angles of triangle ABC add to 180°: ${N(x)}° + 90° + angle CBA = 180°.`, `Angle CBA = 180° − 90° − ${N(x)}° = <b>${N(90 - x)}°</b>.`] };
      }
      const fig = circleFig({ A: aPos, B: bPos, C: cPos }, [['O', 'A'], ['O', 'B'], ['C', 'A'], ['C', 'B']], ['A', 'B']);
      if (kind === 'central') return { prompt: `O is the centre of the circle. The central angle AOB is ${N(m)}°. What is the inscribed angle ACB?${fig}`, type: 'number', answer: m / 2, unit: '°', params: { kind, m },
        hints: [`Both angles cut off the same arc AB. The central angle equals the arc, so arc AB = ${N(m)}°.`, `An inscribed angle is half its arc: ${N(m)}° ÷ 2 = <b>${N(m / 2)}°</b>.`] };
      if (kind === 'inscribed') return { prompt: `O is the centre of the circle. The inscribed angle ACB is ${N(m / 2)}°. What is the central angle AOB?${fig}`, type: 'number', answer: m, unit: '°', params: { kind, m },
        hints: [`An inscribed angle is half the arc it cuts off, so arc AB = 2 × ${N(m / 2)}° = ${N(m)}°.`, `The central angle equals its arc: angle AOB = <b>${N(m)}°</b>.`] };
      return { prompt: `The inscribed angle ACB is ${N(m / 2)}°. What is the measure of the highlighted arc AB?${fig}`, type: 'number', answer: m, unit: '°', params: { kind, m },
        hints: [`An inscribed angle is half its intercepted arc.`, `So the arc is twice the angle: 2 × ${N(m / 2)}° = <b>${N(m)}°</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'semi') {                                          // coordinates: A(−1,0), B(1,0), C on the unit circle
        const t = toRad(2 * P.x), C = [Math.cos(t), Math.sin(t)];
        const ang = Math.atan2(C[1], 1 - C[0]) * 180 / Math.PI;        // angle at B between BA and BC
        return Math.abs(ang - q.answer) < 1e-6;
      }
      const a = toRad(230), b = toRad(230 + P.m), c = toRad(50 + P.m / 2);     // measure angle ACB from coordinates
      const v1 = [Math.cos(a) - Math.cos(c), Math.sin(a) - Math.sin(c)], v2 = [Math.cos(b) - Math.cos(c), Math.sin(b) - Math.sin(c)];
      const acb = Math.acos((v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2))) * 180 / Math.PI;
      return Math.abs((P.kind === 'central' ? acb : 2 * acb) - q.answer) < 1e-6;
    },
  });

  A.skill({
    id: 'int2.circle-equation', title: 'Equation of a circle',
    learn: p(`A circle is every point at distance ${V('r')} from its centre (${V('h')}, ${V('k')}). Writing that distance with the Pythagorean theorem gives the <b>equation of a circle</b>: <b>${sq(`(${X} − ${V('h')})`)} + ${sq(`(${Y} − ${V('k')})`)} = ${sq(V('r'))}</b>.`) +
      p(`Watch two things. The signs inside the brackets are the opposite of the centre's coordinates: centre (−2, 5) gives ${sq(`(${X} + 2)`)} + ${sq(`(${Y} − 5)`)}. And the right side is the radius <i>squared</i>: radius 3 means = 9, and = 49 means the radius is 7.`) +
      example('Example', `Centre (4, −1), radius 6: <b>${sq(`(${X} − 4)`)} + ${sq(`(${Y} + 1)`)} = 36</b>.`),
    make(rng) {
      const h = rng.int(-8, 8), k = rng.int(-8, 8), r = rng.int(2, 9);
      const eqn = (hh, kk, rr) => `${sqBin('x', hh)} + ${sqBin('y', kk)} = ${N(rr)}`;
      if (rng.chance(0.35)) {
        const wantR = rng.bool();
        return { prompt: `What is the ${wantR ? 'radius of the circle' : `${X}-coordinate of the centre of the circle`}?${big(eqn(h, k, r * r))}`, type: 'number', answer: wantR ? r : h, params: { kind: wantR ? 'r' : 'h', h, k, r },
          hints: [`Compare with ${sq(`(${X} − ${V('h')})`)} + ${sq(`(${Y} − ${V('k')})`)} = ${sq(V('r'))}.`, wantR ? `${sq(V('r'))} = ${N(r * r)}, so ${V('r')} = ${R(N(r * r))}.` : `The bracket ${h === 0 ? sq(X) : `(${M.poly([1, -h])})`} means ${X} − ${wrap(h)}, so ${V('h')} = ${N(h)}.`, wantR ? `The radius is <b>${N(r)}</b>.` : `The centre is ${M.pt(h, k)}, so its ${X}-coordinate is <b>${N(h)}</b>.`] };
      }
      const answer = eqn(h, k, r * r);
      const choices = rng.shuffle([answer].concat(distinct(answer, [eqn(-h, -k, r * r), eqn(h, k, r), eqn(-h, -k, r), eqn(k, h, r * r), eqn(h, -k, r * r), eqn(h, k, 2 * r)], 3)));
      return { prompt: `Which is the equation of the circle with centre ${M.pt(h, k)} and radius ${N(r)}?`, type: 'choice', answer, choices, params: { kind: 'eq', h, k, r },
        hints: [`Use ${sq(`(${X} − ${V('h')})`)} + ${sq(`(${Y} − ${V('k')})`)} = ${sq(V('r'))} with ${V('h')} = ${N(h)}, ${V('k')} = ${N(k)}, ${V('r')} = ${N(r)}.`, `${X} − ${wrap(h)} = ${h === 0 ? X : M.poly([1, -h])} and ${Y} − ${wrap(k)} = ${k === 0 ? Y : M.poly([1, -k], 'y')}; the right side is ${sq(N(r))} = ${N(r * r)}.`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, h, k, r } = q.params;
      if (kind === 'r') return q.answer * q.answer === r * r && q.answer > 0;
      if (kind === 'h') return q.answer === h;
      // test four points that must lie on the circle against the chosen equation's own numbers
      const m = A.stripTags(q.answer).replace(/\s+/g, '').replace(/−/g, '-').match(/^(?:\(x([+-]\d+)\)|x)2\+(?:\(y([+-]\d+)\)|y)2=(\d+)$/);
      if (!m) return false;
      const hh = -(Number(m[1]) || 0), kk = -(Number(m[2]) || 0), rr = Number(m[3]);
      return [[h + r, k], [h - r, k], [h, k + r], [h, k - r]].every(([x, y]) => (x - hh) ** 2 + (y - kk) ** 2 === rr) && hh === h && kk === k;
    },
  });

  /* ---------- Unit 8: Probability ---------- */
  A.skill({
    id: 'int2.compound-probability', title: 'Probability of “and” and “or” events',
    learn: p(`<b>And, for independent events.</b> Two events are independent when one happening does not change the chance of the other (a coin and a die, or two spins of a spinner). Then <b>P(A and B) = P(A) · P(B)</b>.`) +
      p(`<b>Or.</b> If A and B cannot both happen (they are <b>mutually exclusive</b>), just add: P(A or B) = P(A) + P(B). If they can overlap, adding counts the overlap twice, so subtract it once: <b>P(A or B) = P(A) + P(B) − P(A and B)</b>.`) +
      example('Example', `A number is picked from 1 to 10. P(even or greater than 7)? Even: 5 numbers; greater than 7: 8, 9, 10, 3 numbers; both: 8 and 10, 2 numbers. P = ${F(5, 10, { raw: true })} + ${F(3, 10, { raw: true })} − ${F(2, 10, { raw: true })} = ${F(6, 10, { raw: true })} = <b>${F(3, 5)}</b>.`),
    make(rng) {
      const kind = rng.pick(['indep', 'indep', 'mutex', 'overlap', 'overlap']);
      const name = rng.pick(NAMES);
      const fracHint = (n, d) => `<b>${M.fracText(n, d)}</b>`;
      if (kind === 'indep') {
        const s1 = rng.pick([4, 5, 6, 8]), w1 = rng.int(1, s1 - 1), d = rng.pick([6, 10, 12]), w2 = rng.int(1, d - 1);
        const [n, dd] = M.simp(w1 * w2, s1 * d);
        return { prompt: `A spinner has ${N(s1)} equal sections, ${N(w1)} of them red. ${name} spins it and also rolls a fair ${N(d)}-sided die numbered 1 to ${N(d)}. What is the probability that the spinner lands on red <i>and</i> the die shows a number less than or equal to ${N(w2)}? Give a fraction.`, type: 'number', answer: n / dd, answerText: M.fracText(n, dd), params: { kind, s1, w1, d, w2 },
          hints: [`The spinner and the die do not affect each other, so the events are independent: multiply.`, `P(red) = ${F(w1, s1, { raw: true })} and P(at most ${N(w2)}) = ${F(w2, d, { raw: true })}.`, `${F(w1, s1, { raw: true })} × ${F(w2, d, { raw: true })} = ${F(w1 * w2, s1 * d, { raw: true })} = ${fracHint(n, dd)}.`] };
      }
      const top = rng.pick([10, 12, 15, 20, 24, 30]);
      const tests = { even: ['even', x => x % 2 === 0], odd: ['odd', x => x % 2 === 1], m3: ['a multiple of 3', x => x % 3 === 0], m4: ['a multiple of 4', x => x % 4 === 0], m5: ['a multiple of 5', x => x % 5 === 0] };
      const big1 = rng.int(Math.floor(top / 2), top - 2), small1 = rng.int(2, Math.floor(top / 3));
      tests.gt = [`greater than ${big1}`, x => x > big1]; tests.lt = [`less than ${small1}`, x => x < small1];
      let a, b;
      if (kind === 'mutex') [a, b] = rng.pick([['lt', 'gt'], ['gt', 'lt'], ['odd', 'm4'], ['m4', 'odd']]);
      else [a, b] = rng.pick([['even', 'm3'], ['even', 'm5'], ['m3', 'm5'], ['odd', 'm3'], ['even', 'gt'], ['m3', 'gt'], ['odd', 'lt'], ['m4', 'm3']]);
      const nums = Array.from({ length: top }, (_, i) => i + 1);
      const nA = nums.filter(tests[a][1]).length, nB = nums.filter(tests[b][1]).length, nAB = nums.filter(x => tests[a][1](x) && tests[b][1](x)).length;
      const tot = nA + nB - nAB, [n, dd] = M.simp(tot, top);
      const hints = [`Count: ${tests[a][0]} → ${N(nA)} numbers; ${tests[b][0]} → ${N(nB)} numbers.`,
        nAB === 0 ? `No number is both, so the events are mutually exclusive: just add, ${N(nA)} + ${N(nB)} = ${N(tot)}.` : `${N(nAB)} number${nAB === 1 ? ' is' : 's are'} both (${nums.filter(x => tests[a][1](x) && tests[b][1](x)).join(', ')}) and would be counted twice, so subtract: ${N(nA)} + ${N(nB)} − ${N(nAB)} = ${N(tot)}.`,
        `P = ${F(tot, top, { raw: true })} = ${fracHint(n, dd)}.`];
      return { prompt: `${name} picks a whole number from 1 to ${N(top)} at random. What is the probability that it is ${tests[a][0]} <i>or</i> ${tests[b][0]}? Give a fraction.`, type: 'number', answer: n / dd, answerText: M.fracText(n, dd), params: { kind, top, a, b, big1, small1 }, hints };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'indep') {                                         // list every (section, face) pair
        let hit = 0; for (let s = 1; s <= P.s1; s++) for (let f = 1; f <= P.d; f++) if (s <= P.w1 && f <= P.w2) hit++;
        return Math.abs(hit / (P.s1 * P.d) - q.answer) < 1e-12;
      }
      const t = { even: x => x % 2 === 0, odd: x => x % 2 === 1, m3: x => x % 3 === 0, m4: x => x % 4 === 0, m5: x => x % 5 === 0, gt: x => x > P.big1, lt: x => x < P.small1 };
      let hit = 0; for (let x = 1; x <= P.top; x++) if (t[P.a](x) || t[P.b](x)) hit++;
      return Math.abs(hit / P.top - q.answer) < 1e-12;
    },
  });

  A.skill({
    id: 'int2.conditional-probability', title: 'Conditional probability and two-way tables',
    learn: p(`<b>P(B | A)</b>, read “the probability of B given A”, is the chance of B when you already know A happened. Knowing A shrinks the group you are choosing from: <b>P(B | A) = ${F('number in both A and B', 'number in A')}</b>.`) +
      p(`In a two-way table, “given A” means: look only at the row (or column) for A, and use its total as the denominator. Order matters: P(B | A) and P(A | B) use different totals and are usually different.`) +
      example('Example', `${M.table(['', 'Likes soccer', 'Does not', 'Total'], [['7th grade', 18, 12, 30], ['8th grade', 10, 20, 30], ['Total', 28, 32, 60]], { compact: true })}P(likes soccer | 7th grade) = ${F(18, 30, { raw: true })} = <b>${F(3, 5)}</b>, but P(7th grade | likes soccer) = ${F(18, 28, { raw: true })} = ${F(9, 14)}.`),
    make(rng) {
      const [rows, cols] = rng.pick([
        [['Juniors', 'Seniors'], ['Has a pet', 'No pet']],
        [['Morning', 'Evening'], ['Ran', 'Walked']],
        [['Band', 'Choir'], ['Plays a sport', 'No sport']],
        [['Bus', 'Car'], ['Late', 'On time']]]);
      const t = [[rng.int(4, 30), rng.int(4, 30)], [rng.int(4, 30), rng.int(4, 30)]];
      const r0 = t[0][0] + t[0][1], c0 = t[0][0] + t[1][0], tot = r0 + t[1][0] + t[1][1];
      const table = M.table(['', cols[0], cols[1], 'Total'], [[rows[0], t[0][0], t[0][1], r0], [rows[1], t[1][0], t[1][1], t[1][0] + t[1][1]], ['Total', c0, t[0][1] + t[1][1], tot]]);
      const kind = rng.pick(['colGivenRow', 'rowGivenCol', 'joint']);
      const [num, den] = kind === 'colGivenRow' ? [t[0][0], r0] : kind === 'rowGivenCol' ? [t[0][0], c0] : [t[0][0], tot];
      const [n, d] = M.simp(num, den);
      const ask = kind === 'colGivenRow' ? `Someone is chosen at random from the “${rows[0]}” row. What is the probability that they are in the “${cols[0]}” column? That is, P(${cols[0]} | ${rows[0]}).`
        : kind === 'rowGivenCol' ? `Someone is chosen at random from the “${cols[0]}” column. What is the probability that they are in the “${rows[0]}” row? That is, P(${rows[0]} | ${cols[0]}).`
          : `Someone is chosen at random from everyone in the table. What is the probability that they are in the “${rows[0]}” row <i>and</i> the “${cols[0]}” column?`;
      return { prompt: `${table}${ask} Give a fraction.`, type: 'number', answer: n / d, answerText: M.fracText(n, d), params: { kind, t },
        hints: [kind === 'joint' ? `There is no “given” here, so the denominator is everyone: ${N(tot)}.` : `“Given ${kind === 'colGivenRow' ? rows[0] : cols[0]}” means look only at the ${kind === 'colGivenRow' ? `${rows[0]} row` : `${cols[0]} column`}. Its total, ${N(den)}, is the denominator.`,
          `The cell for ${rows[0]} and ${cols[0]} holds ${N(num)}.`, `P = ${F(num, den, { raw: true })} = <b>${M.fracText(n, d)}</b>.`] };
    },
    verify(q) {
      const { kind, t } = q.params;                                     // P(A and B) / P(A) with probabilities out of the grand total
      const all = t[0][0] + t[0][1] + t[1][0] + t[1][1], both = t[0][0] / all;
      const given = kind === 'colGivenRow' ? (t[0][0] + t[0][1]) / all : kind === 'rowGivenCol' ? (t[0][0] + t[1][0]) / all : 1;
      return Math.abs(both / given - q.answer) < 1e-12;
    },
  });

  A.skill({
    id: 'int2.expected-value', title: 'Expected value',
    learn: p(`The <b>expected value</b> of a game is the average result per play over the long run. Multiply each outcome by its probability and add: <b>E = Σ (value × probability)</b>. It does not have to be a value you can actually get on one play.`) +
      p(`If a game costs money to play, count the cost too: either subtract it from every outcome, or subtract it from the expected winnings at the end. A negative expected value means you lose money on average; an expected value of 0 means the game is <b>fair</b>.`) +
      example('Example', `A spinner has 4 equal sections worth $0, $0, $2 and $10. E = ${F(1, 4)}(0 + 0 + 2 + 10) = <b>$3</b> per spin. If a spin costs $4, the expected net result is $3 − $4 = −$1 per spin.`),
    make(rng) {
      const kind = rng.pick(['spinner', 'spinner', 'ticket']);
      const name = rng.pick(NAMES);
      if (kind === 'ticket') {
        const nT = rng.pick([50, 100, 200, 250, 500]), prize = rng.pick([20, 25, 40, 50, 100, 200]), cost = rng.pick([1, 2, 5]);
        const ans = M.round(prize / nT - cost, 2);
        return { prompt: `A raffle sells ${N(nT)} tickets for ${M.money(cost)} each, and one ticket wins ${M.money(prize)}. ${name} buys one ticket. What is ${name}'s expected net gain, in dollars? (It may be negative.)`, type: 'number', answer: ans, unit: '$', tolerance: 0.005, params: { kind, nT, prize, cost },
          hints: [`The chance of winning is ${F(1, nT)}, so the expected prize is ${F(1, nT)} × ${M.money(prize)} = ${M.money(M.round(prize / nT, 2))}.`, `Subtract the cost of the ticket: ${M.money(M.round(prize / nT, 2))} − ${M.money(cost)}.`, `The expected net gain is <b>${M.money(ans)}</b> per ticket.`] };
      }
      const n = rng.pick([4, 5, 10]), cost = rng.chance(0.5) ? rng.int(1, 5) : 0;
      const vals = Array.from({ length: n }, () => rng.pick([0, 0, 1, 2, 3, 5, 8, 10, 20]));
      const sum = vals.reduce((a, b) => a + b, 0), ans = M.round(sum / n - cost, 2);
      const counts = {}; vals.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
      const terms = Object.keys(counts).map(Number).sort((a, b) => a - b).map(v => `${N(v)} × ${F(counts[v], n, { raw: true })}`);
      return { prompt: `A spinner has ${N(n)} equal sections. Landing on a section wins that many dollars: ${vals.map(v => M.money(v)).join(', ')}.${cost ? ` Each spin costs ${M.money(cost)}.` : ''} What is the expected ${cost ? 'net gain' : 'amount won'} per spin, in dollars?${cost ? ' (It may be negative.)' : ''}`, type: 'number', answer: ans, unit: '$', tolerance: 0.005, params: { kind, vals, cost },
        hints: [`Each section has probability ${F(1, n)}. Group equal prizes: E = ${terms.join(' + ')}.`, `That is the total of the sections divided by ${N(n)}: ${N(sum)} ÷ ${N(n)} = ${N(M.round(sum / n, 2))}.`].concat(cost ? [`Subtract the ${M.money(cost)} cost: ${N(M.round(sum / n, 2))} − ${N(cost)}.`] : []).concat(`The expected ${cost ? 'net gain' : 'amount won'} is <b>${M.money(ans)}</b> per spin.`) };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'ticket') {                                        // total money in minus total money out, shared over every ticket
        const perTicket = (P.prize - P.nT * P.cost) / P.nT;
        return Math.abs(perTicket - q.answer) < 0.0051;
      }
      let total = 0; P.vals.forEach(v => { total += v - P.cost; });     // net result of one spin on each section, averaged
      return Math.abs(total / P.vals.length - q.answer) < 0.0051;
    },
  });

})();
