/* Integrated Math 3. Polynomials, rational expressions, inverses and logarithms, trigonometric functions,
   non-right triangles, series, the normal distribution and sampling, and solids. Follows CPM Core
   Connections Integrated III and Khan Academy's Integrated math 3. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v, X = M.v('x');
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const key = s => A.normText(A.stripTags(s));
  const close = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  const rad = d => d * Math.PI / 180, degOf = r => r * 180 / Math.PI;
  const r1 = x => M.round(x, 1), r2 = x => M.round(x, 2);
  const pw = x => x < 0 ? `(${N(x)})` : N(x);
  const LOG = b => `log<sub>${b}</sub>`;

  /** the answer plus up to `n − 1` distractors that read differently from it and from each other */
  function options(answer, cands, n) {
    const out = [answer], seen = new Set([key(answer)]);
    for (const c of cands) { if (out.length >= (n || 4)) break; const k = key(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }
  /** Horner evaluation, coefficients highest power first */
  const peval = (c, t) => c.reduce((s, k) => s * t + k, 0);
  const pmul = (a, b) => { const out = new Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; })); return out; };
  /** "(x − 3)", "(2x + 5)": a linear factor px + q */
  const lin = (pp, q) => `(${M.term(pp, 'x')} ${M.signed(q)})`;
  /** a factored polynomial {lead, x, lins: [[p, q], …], quad} as text; equal neighbours become a square */
  function renderFac(f) {
    let s = f.lead === 1 ? '' : f.lead === -1 ? '−' : N(f.lead);
    if (f.x) s += X;
    for (let i = 0; i < f.lins.length; i++) {
      const [pp, q] = f.lins[i], nx = f.lins[i + 1];
      if (nx && nx[0] === pp && nx[1] === q) { s += M.sup(lin(pp, q), 2); i++; } else s += lin(pp, q);
    }
    if (f.quad) s += `(${M.poly(f.quad)})`;
    return s;
  }
  const evalFac = (f, t) => f.lead * (f.x ? t : 1) * f.lins.reduce((s, [pp, q]) => s * (pp * t + q), 1) * (f.quad ? peval(f.quad, t) : 1);

  A.course({
    id: 'int-3', title: 'Integrated Math 3', subject: 'High school', grade: 11, icon: '🔺', hue: 20,
    blurb: 'Polynomials, rational expressions, logarithms, trigonometric functions, non-right triangles, series, the normal distribution, and solids.',
    units: [
      { id: 'polynomials', title: 'Polynomials', blurb: 'Factoring, dividing, the remainder theorem, and reading a graph from its zeros.', skills: ['int3.poly-factor', 'int3.poly-division', 'int3.poly-graphs'] },
      { id: 'rational', title: 'Rational expressions and equations', blurb: 'Fractions with polynomials on top and bottom.', skills: ['int3.rational-simplify', 'int3.rational-add', 'int3.rational-equations'] },
      { id: 'logarithms', title: 'Inverse functions and logarithms', blurb: 'Undoing a function, logarithms as inverses of exponentials, and models built from both.', skills: ['int3.inverse-functions', 'int3.log-properties', 'int3.exp-log-equations', 'int3.exp-log-models'] },
      { id: 'trig-functions', title: 'Trigonometric functions', blurb: 'Radians, the unit circle, sine and cosine graphs, and trig equations.', skills: ['int3.unit-circle', 'int3.sinusoid-graphs', 'int3.trig-equations'] },
      { id: 'triangles', title: 'Non-right triangles', blurb: 'The law of sines, the law of cosines, and area from two sides and an angle.', skills: ['int3.law-of-sines', 'int3.law-of-cosines'] },
      { id: 'series', title: 'Sequences and series', blurb: 'Adding up arithmetic and geometric sequences.', skills: ['int3.arithmetic-series', 'int3.geometric-series'] },
      { id: 'statistics', title: 'Statistics', blurb: 'The normal distribution, z-scores, sampling, and margin of error.', skills: ['int3.normal-distribution', 'int3.margin-of-error'] },
      { id: 'solids', title: '3D geometry', blurb: 'Slicing solids, and volume by Cavalieri’s principle.', skills: ['int3.cross-sections', 'int3.volume-cavalieri'] },
    ],
  });

  /* ---------- Unit 1: Polynomials ---------- */
  A.skill({
    id: 'int3.poly-factor', title: 'Factoring higher-degree polynomials',
    learn: p('To factor a cubic, try these in order. <b>1. Take out a common factor</b>, often a power of ' + X + '. <b>2. Group:</b> with four terms, factor the first two and the last two and look for a shared binomial. <b>3. Use a pattern:</b> difference of squares, or a sum or difference of cubes.') +
      p(`The cube patterns are <b>${M.sup(V('a'), 3)} − ${M.sup(V('b'), 3)} = (${V('a')} − ${V('b')})(${M.sup(V('a'), 2)} + ${V('a')}${V('b')} + ${M.sup(V('b'), 2)})</b> and <b>${M.sup(V('a'), 3)} + ${M.sup(V('b'), 3)} = (${V('a')} + ${V('b')})(${M.sup(V('a'), 2)} − ${V('a')}${V('b')} + ${M.sup(V('b'), 2)})</b>. The sign in the binomial matches the original; the middle sign of the trinomial is the opposite.`) +
      p('“Factor completely” means keep going until no factor can be split again over the integers.') +
      example('Example', `${big(M.poly([1, 3, -4, -12]))}Group: ${M.sup(X, 2)}(${X} + 3) − 4(${X} + 3) = (${X} + 3)(${M.sup(X, 2)} − 4). The second factor is a difference of squares, so the answer is <b>(${X} + 3)(${X} − 2)(${X} + 2)</b>.`),
    make(rng) {
      const kind = rng.pick(['gcf', 'group', 'group', 'cubes']);
      let fac, wrong, coefs, hints;
      if (kind === 'gcf') {
        const a = rng.pick([1, 1, 2, 3, -1, -2]);
        let r = rng.nz(-6, 6), s = rng.nz(-6, 6);
        while (Math.abs(s) === Math.abs(r)) s = rng.nz(-6, 6);
        if (r > s) [r, s] = [s, r];
        coefs = [a, -a * (r + s), a * r * s, 0];
        fac = { lead: a, x: true, lins: [[1, -r], [1, -s]] };
        wrong = [{ lead: a, x: true, lins: [[1, r], [1, s]] }, { lead: a, x: false, lins: [[1, -r], [1, -s]] }, { lead: a, x: true, lins: [[1, -r], [1, s]] }, { lead: a, x: true, lins: [[1, r], [1, -s]] }];
        hints = [`Every term has a factor of ${a === 1 ? X : M.term(a, 'x')}. Take it out: ${renderFac({ lead: a, x: true, lins: [] })}(${M.poly([1, -(r + s), r * s])}).`,
          `Factor the quadratic: find two numbers that multiply to ${N(r * s)} and add to ${N(-(r + s))}. They are ${N(-r)} and ${N(-s)}.`,
          `So the polynomial is <b>${renderFac(fac)}</b>.`];
      } else if (kind === 'group') {
        const a = rng.nz(-7, 7); let b = rng.int(1, 6); if (b === Math.abs(a)) b = b === 6 ? 5 : b + 1;
        coefs = [1, a, -b * b, -a * b * b];
        fac = { lead: 1, x: false, lins: [[1, a], [1, -b], [1, b]] };
        wrong = [{ lead: 1, x: false, lins: [[1, a], [1, -b], [1, -b]] }, { lead: 1, x: false, lins: [[1, -a], [1, -b], [1, b]] }, { lead: 1, x: false, lins: [[1, a]], quad: [1, 0, b * b] }, { lead: 1, x: false, lins: [[1, a], [1, b], [1, b]] }];
        hints = [`Group the first two terms and the last two: (${M.poly([1, a, 0, 0])}) ${M.signed(-b * b)}${X} ${M.signed(-a * b * b)}.`,
          `Factor each group: ${M.sup(X, 2)}${lin(1, a)} − ${N(b * b)}${lin(1, a)} = ${lin(1, a)}(${M.poly([1, 0, -b * b])}).`,
          `${M.poly([1, 0, -b * b])} is a difference of squares: ${lin(1, -b)}${lin(1, b)}.`,
          `So the polynomial is <b>${renderFac(fac)}</b>.`];
      } else {
        const c = rng.pick([1, 1, 2]), k = rng.int(1, 5), sg = rng.pick([1, -1]);
        coefs = [c * c * c, 0, 0, sg * k * k * k];
        fac = { lead: 1, x: false, lins: [[c, sg * k]], quad: [c * c, -sg * c * k, k * k] };
        wrong = [{ lead: 1, x: false, lins: [[c, sg * k]], quad: [c * c, sg * c * k, k * k] }, { lead: 1, x: false, lins: [[c, -sg * k]], quad: [c * c, -sg * c * k, k * k] }, { lead: 1, x: false, lins: [[c, sg * k]], quad: [c * c, -2 * sg * c * k, k * k] }, { lead: 1, x: false, lins: [[c, -sg * k]], quad: [c * c, sg * c * k, k * k] }];
        hints = [`This is a ${sg > 0 ? 'sum' : 'difference'} of cubes: ${M.sup(c === 1 ? X : `(${M.term(c, 'x')})`, 3)} ${sg > 0 ? '+' : '−'} ${M.sup(N(k), 3)}, with ${V('a')} = ${M.term(c, 'x')} and ${V('b')} = ${N(k)}.`,
          `The binomial is (${V('a')} ${sg > 0 ? '+' : '−'} ${V('b')}) = ${lin(c, sg * k)}. The trinomial is ${M.sup(V('a'), 2)} ${sg > 0 ? '−' : '+'} ${V('a')}${V('b')} + ${M.sup(V('b'), 2)}, with the opposite middle sign.`,
          `So the polynomial is <b>${renderFac(fac)}</b>.`];
      }
      const answer = renderFac(fac);
      const choices = options(answer, wrong.map(renderFac));
      return { prompt: `Factor completely.${big(M.poly(coefs))}`, type: 'choice', choices, answer, hints, params: { kind, coefs, fac } };
    },
    verify(q) {
      const { coefs, fac } = q.params;
      if (q.answer !== renderFac(fac)) return 'answer does not match the factors';
      for (let t = -3; t <= 4; t++) if (!close(evalFac(fac, t), peval(coefs, t))) return `the factors and the polynomial differ at x = ${t}`;
      return true;
    },
  });

  A.skill({
    id: 'int3.poly-division', title: 'Polynomial division and the remainder theorem',
    learn: p(`To divide a polynomial by ${X} − ${V('a')}, <b>synthetic division</b> is quick: write the coefficients, bring the first one down, then repeatedly multiply by ${V('a')} and add to the next coefficient. The last number is the remainder; the others are the quotient’s coefficients, one degree lower.`) +
      p(`<b>The remainder theorem:</b> the remainder when ${V('p')}(${X}) is divided by ${X} − ${V('a')} is ${V('p')}(${V('a')}). So you can find a remainder just by substituting. If ${V('p')}(${V('a')}) = 0, then ${X} − ${V('a')} is a factor (the factor theorem).`) +
      p(`Careful with the sign: dividing by ${X} + 3 means ${V('a')} = −3.`) +
      example('Example', `Find the remainder when ${M.poly([1, -2, 0, 5])} is divided by ${X} − 2.${big(`${V('p')}(2) = 8 − 8 + 0 + 5 = 5`)}The remainder is <b>5</b>.`),
    make(rng) {
      const kind = rng.pick(['quot', 'rem', 'rem', 'factor']);
      const a = rng.nz(-4, 4);
      if (kind === 'quot') {
        const b = rng.nz(-6, 6), c = rng.nz(-9, 9);
        const qc = [1, b, c], coefs = pmul([1, -a], qc);
        const synth = []; coefs.slice(0, -1).reduce((acc, k, i) => { const v = i === 0 ? k : k + acc * -a; synth.push(v); return v; }, 0);
        const answer = M.poly(qc);
        const choices = options(answer, [M.poly(synth), M.poly([1, -b, c]), M.poly([1, b, -c]), M.poly([1, -b, -c]), M.poly([1, b + 1, c])]);
        return { prompt: `Divide. The remainder is 0.${big(`(${M.poly(coefs)}) ÷ ${lin(1, -a)}`)}`, type: 'choice', choices, answer, params: { kind, a, coefs, qc },
          hints: [`Use synthetic division with ${N(a)} (the number that makes ${lin(1, -a)} zero). The coefficients are ${coefs.map(N).join(', ')}.`,
            `Bring down 1. Multiply by ${N(a)} and add: ${N(coefs[1])} + ${pw(a)} = ${N(b)}. Then ${N(coefs[2])} + ${pw(a * b)} = ${N(c)}. Then ${N(coefs[3])} + ${pw(a * c)} = 0, the remainder.`,
            `The quotient is <b>${answer}</b>.`] };
      }
      const c3 = [1, rng.int(-5, 5), rng.int(-9, 9)];
      if (kind === 'rem') {
        const coefs = [rng.pick([1, 1, 2, -1]), ...c3.slice(1), rng.int(-12, 12)];
        const ans = peval(coefs, a);
        return { prompt: `Find the remainder when ${V('p')}(${X}) is divided by ${lin(1, -a)}.${big(`${V('p')}(${X}) = ${M.poly(coefs)}`)}`, type: 'number', answer: ans, params: { kind, a, coefs },
          hints: [`By the remainder theorem, the remainder is ${V('p')}(${N(a)}), because ${lin(1, -a)} is zero when ${X} = ${N(a)}.`,
            `Substitute: ${N(coefs[0])}(${N(a)})³ + ${N(coefs[1])}(${N(a)})² + ${N(coefs[2])}(${N(a)}) + ${N(coefs[3])} = ${N(coefs[0] * a ** 3)} + ${N(coefs[1] * a * a)} + ${N(coefs[2] * a)} + ${N(coefs[3])}.`.replace(/\+ −/g, '− '),
            `The remainder is <b>${N(ans)}</b>.`]};
      }
      const partial = peval([...c3, 0], a);
      const k = -partial;
      return { prompt: `For what value of ${V('k')} is ${lin(1, -a)} a factor of ${V('p')}(${X})?${big(`${V('p')}(${X}) = ${M.poly([...c3, 0])} + ${V('k')}`)}`, type: 'number', answer: k, params: { kind, a, coefs: [...c3, 0] },
        hints: [`By the factor theorem, ${lin(1, -a)} is a factor exactly when ${V('p')}(${N(a)}) = 0.`,
          `${V('p')}(${N(a)}) = ${N(a ** 3)} + ${N(c3[1] * a * a)} + ${N(c3[2] * a)} + ${V('k')} = ${N(partial)} + ${V('k')}.`.replace(/\+ −/g, '− '),
          `Set ${N(partial)} + ${V('k')} = 0, so ${V('k')} = <b>${N(k)}</b>.`.replace(/\+ −/g, '− ')] };
    },
    verify(q) {
      const { kind, a, coefs } = q.params;
      const synthRem = cs => cs.reduce((acc, c) => acc * a + c, 0);          // synthetic division, last value
      if (kind === 'quot') { for (let t = -2; t <= 3; t++) if (!close(peval(q.params.qc, t) * (t - a), peval(coefs, t))) return 'quotient times divisor is not the dividend'; return q.answer === M.poly(q.params.qc); }
      if (kind === 'rem') return q.answer === synthRem(coefs);
      const cs = coefs.slice(); cs[3] = q.answer; return synthRem(cs) === 0;
    },
  });
  A.skill({
    id: 'int3.poly-graphs', title: 'Zeros and graphs of polynomials',
    learn: p(`In factored form, a polynomial shows its zeros directly: ${V('f')}(${X}) = (${X} − 2)²(${X} + 1) is zero at ${X} = 2 and ${X} = −1. The power on a factor is the zero’s <b>multiplicity</b>.`) +
      p('<b>Odd multiplicity: the graph crosses the x-axis. Even multiplicity: it touches and turns back.</b> A multiplicity of 3 or more also flattens the graph out at the zero, like ' + M.sup(X, 3) + ' does at 0.') +
      p(`<b>End behaviour</b> depends only on the leading term. Even degree: both ends point the same way (up if the leading coefficient is positive). Odd degree: the ends point opposite ways (rising on the right if the leading coefficient is positive). If you know one zero ${V('a')}, divide by ${X} − ${V('a')} to find the rest.`) +
      example('Example', `${big(`${V('f')}(${X}) = −2${X}${M.sup(`(${X} − 3)`, 2)}`)}The degree is 1 + 2 = 3 (odd) and the leading coefficient −2 is negative, so the graph <b>rises on the left and falls on the right</b>. It crosses at 0 and touches at 3.`),
    make(rng) {
      const kind = rng.pick(['cross', 'end', 'zero', 'zero']);
      if (kind === 'zero') {
        const roots = rng.sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 3).sort((x, y) => x - y);
        const coefs = pmul(pmul([1, -roots[0]], [1, -roots[1]]), [1, -roots[2]]);
        const gi = rng.int(0, 2), given = roots[gi], rest = roots.filter((_, i) => i !== gi);
        const askMax = rng.bool(), ans = askMax ? rest[1] : rest[0];
        const q1 = coefs[1] + given, q2 = coefs[2] + given * q1;
        return { prompt: `${X} = ${N(given)} is a zero of the polynomial below. Find the other two zeros, and enter the ${askMax ? 'greater' : 'smaller'} one.${big(`${V('f')}(${X}) = ${M.poly(coefs)}`)}`, type: 'number', answer: ans, params: { kind, coefs, given, askMax },
          hints: [`Since ${N(given)} is a zero, ${lin(1, -given)} is a factor. Divide it out with synthetic division using ${N(given)}.`,
            `The quotient is ${M.poly([1, q1, q2])}.`,
            `Factor it: ${M.poly([1, q1, q2])} = ${lin(1, -rest[0])}${lin(1, -rest[1])}, so the other zeros are ${N(rest[0])} and ${N(rest[1])}.`,
            `The ${askMax ? 'greater' : 'smaller'} one is <b>${N(ans)}</b>.`] };
      }
      const lead = rng.pick([1, 1, -1, 2, -2, 3, -3]);
      const k = rng.int(2, 3), roots = rng.sample([-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], k).sort((x, y) => x - y);
      const mults = roots.map(() => rng.pick([1, 1, 2, 2, 3]));
      const fTxt = (lead === 1 ? '' : lead === -1 ? '−' : N(lead)) + roots.map((r, i) => { const base = r === 0 ? X : lin(1, -r); return mults[i] > 1 ? M.sup(base, mults[i]) : base; }).join('');
      const fShow = `${V('f')}(${X}) = ${fTxt}`;
      const params = { kind, lead, roots, mults };
      if (kind === 'cross') {
        const i = rng.int(0, k - 1), r = roots[i], m = mults[i];
        const opts = ['It crosses the x-axis straight through.', 'It touches the x-axis and turns back.', 'It crosses the x-axis and flattens out.'];
        const answer = opts[m - 1];
        params.r = r;
        return { prompt: `What does the graph of ${V('f')} do at ${X} = ${N(r)}?${big(fShow)}`, type: 'choice', choices: opts, answer, params,
          hints: [`Find the factor that is zero at ${X} = ${N(r)}: ${r === 0 ? X : lin(1, -r)}. Its power is the multiplicity, ${m}.`,
            m % 2 ? `An odd multiplicity means the sign of ${V('f')} changes there, so the graph crosses.${m > 1 ? ' A multiplicity above 1 also makes it flat at the crossing.' : ' A multiplicity of 1 is a straight crossing.'}` : 'An even multiplicity means the sign does not change, so the graph only touches the axis.',
            `<b>${answer}</b>`] };
      }
      const deg = mults.reduce((s, m) => s + m, 0), sg = Math.sign(lead);
      const end = (l, r) => `As ${X} → −∞, ${V('f')}(${X}) → ${l}; as ${X} → ∞, ${V('f')}(${X}) → ${r}.`;
      const inf = s => s > 0 ? '∞' : '−∞';
      const L = deg % 2 ? -sg : sg;
      const answer = end(inf(L), inf(sg));
      const choices = [end('∞', '∞'), end('−∞', '−∞'), end('−∞', '∞'), end('∞', '−∞')];
      return { prompt: `Which describes the end behaviour of ${V('f')}?${big(fShow)}`, type: 'choice', choices, answer, params,
        hints: [`Find the degree by adding the multiplicities: ${mults.join(' + ')} = ${deg}. The leading coefficient is ${N(lead)}.`,
          `${deg % 2 ? 'Odd' : 'Even'} degree, so the ends point ${deg % 2 ? 'in opposite directions' : 'the same way'}. With a ${sg > 0 ? 'positive' : 'negative'} leading coefficient, the right end goes to ${inf(sg)}.`,
          `<b>${answer}</b>`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'zero') {
        const found = []; for (let t = -10; t <= 10; t++) if (peval(P.coefs, t) === 0 && t !== P.given) found.push(t);
        return found.length === 2 && q.answer === (P.askMax ? Math.max(...found) : Math.min(...found));
      }
      const f = t => P.lead * P.roots.reduce((s, r, i) => s * Math.pow(t - r, P.mults[i]), 1);
      if (P.kind === 'cross') {
        const h = 1e-4, crosses = f(P.r - h) * f(P.r + h) < 0, m = Math.round(Math.log2(Math.abs(f(P.r + 2 * h) / f(P.r + h)))), flat = m > 1;   // f grows like hᵐ near the zero
        const want = !crosses ? 'touches' : flat ? 'flattens' : 'straight';
        return q.answer.includes(want);
      }
      const L = f(-1e4) > 0 ? '∞' : '−∞', R = f(1e4) > 0 ? '∞' : '−∞';
      return q.answer.endsWith(`→ ${R}.`) && q.answer.includes(`→ ${L};`);
    },
  });

  /* ---------- Unit 2: Rational expressions and equations ---------- */
  const lp = c => M.poly([1, c]);                 // "x + c"
  const fr = (nn, d) => F(nn, d);                 // a stacked fraction of two expressions
  A.skill({
    id: 'int3.rational-simplify', title: 'Simplifying, multiplying, and dividing rational expressions',
    learn: p('A rational expression is a fraction with polynomials on top and bottom. <b>To simplify, factor the top and bottom completely, then cancel common factors.</b> You may only cancel whole factors, never single terms: in ' + fr(lp(2), lp(5)) + ' nothing cancels.') +
      p('<b>To multiply</b>, factor everything, cancel any factor that appears on a top and a bottom, and multiply what is left. <b>To divide</b>, flip the second fraction and multiply.') +
      p('Values that make an original denominator zero stay excluded, even after the factor cancels.') +
      example('Example', `${big(fr(M.poly([1, 1, -6]), M.poly([1, 7, 12])))}Factor: ${fr(`(${lp(3)})(${lp(-2)})`, `(${lp(3)})(${lp(4)})`)}. Cancel ${X} + 3 to get <b>${fr(lp(-2), lp(4))}</b>.`),
    make(rng) {
      const kind = rng.pick(['simp', 'simp', 'mul', 'div']);
      const [a, b, c, d] = rng.sample([-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7], 4);
      const quad = (u, v) => M.poly([1, u + v, u * v]);
      let prompt, hints, ansN, ansD, wrong;
      if (kind === 'simp') {
        prompt = `Simplify.${big(fr(quad(a, b), quad(a, c)))}`;
        ansN = b; ansD = c;
        wrong = [fr(lp(-b), lp(-c)), fr(lp(c), lp(b)), fr(lp(a), lp(c)), fr(lp(b), lp(a))];
        hints = [`Factor the top: ${quad(a, b)} = (${lp(a)})(${lp(b)}).`, `Factor the bottom: ${quad(a, c)} = (${lp(a)})(${lp(c)}).`, `Cancel the common factor ${lp(a)}: the result is <b>${fr(lp(b), lp(c))}</b>.`];
      } else if (kind === 'mul') {
        prompt = `Multiply and simplify.${big(`${fr(quad(a, b), quad(c, d))} · ${fr(lp(c), lp(a))}`)}`;
        ansN = b; ansD = d;
        wrong = [fr(lp(d), lp(b)), fr(lp(-b), lp(-d)), fr(lp(b), lp(c)), fr(lp(a), lp(d))];
        hints = [`Factor the first fraction: ${fr(`(${lp(a)})(${lp(b)})`, `(${lp(c)})(${lp(d)})`)}.`, `${lp(a)} appears on a top and a bottom, and so does ${lp(c)}. Cancel both.`, `What is left is <b>${fr(lp(b), lp(d))}</b>.`];
      } else {
        prompt = `Divide and simplify.${big(`${fr(quad(a, b), quad(c, d))} ÷ ${fr(lp(a), lp(c))}`)}`;
        ansN = b; ansD = d;
        wrong = [fr(lp(d), lp(b)), fr(lp(-b), lp(-d)), fr(lp(b), lp(c)), fr(lp(a), lp(d))];
        hints = [`Dividing means multiplying by the reciprocal: ${fr(quad(a, b), quad(c, d))} · ${fr(lp(c), lp(a))}.`, `Factor: ${fr(`(${lp(a)})(${lp(b)})`, `(${lp(c)})(${lp(d)})`)} · ${fr(lp(c), lp(a))}. Cancel ${lp(a)} and ${lp(c)}.`, `What is left is <b>${fr(lp(b), lp(d))}</b>.`];
      }
      const answer = fr(lp(ansN), lp(ansD));
      return { prompt, type: 'choice', choices: options(answer, wrong), answer, hints, params: { kind, a, b, c, d, ansN, ansD } };
    },
    verify(q) {
      const { kind, a, b, c, d, ansN, ansD } = q.params;
      if (q.answer !== fr(lp(ansN), lp(ansD))) return 'answer text does not match';
      const Q = (u, v, t) => t * t + (u + v) * t + u * v;
      for (const t of [0.37, 1.9, 8.3, -9.6]) {
        const orig = kind === 'simp' ? Q(a, b, t) / Q(a, c, t) : kind === 'mul' ? Q(a, b, t) / Q(c, d, t) * (t + c) / (t + a) : Q(a, b, t) / Q(c, d, t) / ((t + a) / (t + c));
        if (!close(orig, (t + ansN) / (t + ansD), 1e-9)) return `differs at x = ${t}`;
      }
      return true;
    },
  });

  A.skill({
    id: 'int3.rational-add', title: 'Adding and subtracting rational expressions',
    learn: p('Just as with number fractions, <b>you need a common denominator before you add or subtract</b>. When the denominators are different binomials, their product is the common denominator.') +
      p(`Rewrite each fraction over that denominator by multiplying its top and bottom by the missing factor, then combine the numerators. When subtracting, put the second numerator in parentheses so the minus sign reaches every term.`) +
      p('Never add the denominators: ' + fr(1, X) + ' + ' + fr(1, X) + ' is ' + fr(2, X) + ', not ' + fr(2, `2${X}`) + '.') +
      example('Example', `${big(`${fr(3, lp(1))} + ${fr(2, lp(-4))}`)}The common denominator is (${lp(1)})(${lp(-4)}). The numerator is 3(${lp(-4)}) + 2(${lp(1)}) = 3${X} − 12 + 2${X} + 2 = 5${X} − 10. So the sum is <b>${fr(M.poly([5, -10]), `(${lp(1)})(${lp(-4)})`)}</b>.`),
    make(rng) {
      const [pp, qq] = rng.sample([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 2);
      let a = rng.nz(-5, 6), b = rng.nz(-5, 6);
      const op = rng.pick(['+', '+', '−']);
      const sg = op === '+' ? 1 : -1;
      if (a + sg * b === 0) b = b + 1 === 0 ? 2 : b + 1;
      const num = [a + sg * b, a * qq + sg * b * pp];
      const den = `(${lp(pp)})(${lp(qq)})`;
      const answer = fr(M.poly(num), den);
      const wrong = [
        sg > 0 ? fr(N(a + b), M.poly([2, pp + qq])) : fr(M.poly([a - b, a * qq + b * pp]), den),
        fr(N(a + sg * b), den),
        fr(M.poly([a + sg * b, a * pp + sg * b * qq]), den),
        fr(M.poly([a + sg * b, -(a * qq + sg * b * pp)]), den),
        fr(N(a + sg * b), M.poly([2, pp + qq])),
      ];
      return { prompt: `${op === '+' ? 'Add' : 'Subtract'}. Leave the denominator factored.${big(`${fr(N(a), lp(pp))} ${op} ${fr(N(b), lp(qq))}`)}`, type: 'choice', choices: options(answer, wrong), answer, params: { a, b, pp, qq, sg, num },
        hints: [`The common denominator is ${den}.`,
          `Build up each numerator: ${N(a)}(${lp(qq)}) ${op} ${N(b)}(${lp(pp)}).`,
          `Expand: ${M.poly([a, a * qq])} ${op} (${M.poly([b, b * pp])}) = ${M.poly(num)}.`,
          `So the result is <b>${fr(M.poly(num), den)}</b>.`] };
    },
    verify(q) {
      const { a, b, pp, qq, sg, num } = q.params;
      for (const t of [0.5, 2.25, -7.5, 9.1]) if (!close(a / (t + pp) + sg * b / (t + qq), (num[0] * t + num[1]) / ((t + pp) * (t + qq)), 1e-9)) return `differs at x = ${t}`;
      return q.answer === fr(M.poly(num), `(${lp(pp)})(${lp(qq)})`);
    },
  });

  A.skill({
    id: 'int3.rational-equations', title: 'Rational equations',
    learn: p('<b>To solve a rational equation, multiply both sides by the common denominator.</b> The fractions disappear and you are left with an ordinary equation. When the equation is one fraction equal to another, cross-multiplying does the same job.') +
      p('Always check the answer in the original equation. A value that makes any denominator zero is <b>extraneous</b> and must be thrown out.') +
      p('Work problems are rational equations too: if one person does a job in ' + V('a') + ' hours and another in ' + V('b') + ' hours, together they finish ' + fr(1, V('a')) + ' + ' + fr(1, V('b')) + ' of the job each hour.') +
      example('Example', `${big(`${fr(6, lp(-1))} = ${fr(4, lp(1))}`)}Cross-multiply: 6(${lp(1)}) = 4(${lp(-1)}), so 6${X} + 6 = 4${X} − 4, 2${X} = −10 and <b>${X} = −5</b>. Neither denominator is zero at −5, so it stands.`),
    make(rng) {
      const kind = rng.pick(['split', 'cross', 'cross', 'work']);
      if (kind === 'work') {
        const [n1, n2] = rng.sample(NAMES, 2), [ta, tb] = rng.sample([2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 2);
        const job = rng.pick(['paint a fence', 'weed the garden', 'wash the team’s van', 'stack the chairs in the hall']);
        const ans = r2(ta * tb / (ta + tb));
        return { prompt: `${n1} can ${job} alone in ${ta} hours. ${n2} can do it alone in ${tb} hours. How many hours does it take them working together? Round to the nearest hundredth.`, type: 'number', answer: ans, unit: 'hours', tolerance: 0.01, params: { kind, ta, tb },
          hints: [`In one hour ${n1} does ${fr(1, ta)} of the job and ${n2} does ${fr(1, tb)}. In ${V('t')} hours together they do the whole job: ${fr(V('t'), ta)} + ${fr(V('t'), tb)} = 1.`,
            `Multiply both sides by ${ta * tb}: ${tb}${V('t')} + ${ta}${V('t')} = ${ta * tb}, so ${ta + tb}${V('t')} = ${ta * tb}.`,
            `${V('t')} = ${fr(ta * tb, ta + tb, { raw: true })} ≈ <b>${N(ans)}</b> hours.`] };
      }
      if (kind === 'split') {
        const x = rng.nz(-6, 6), b = rng.nz(-5, 5);
        let a = rng.nz(-9, 9); let c = a + b * x; if (c === 0) { a += 1; if (a === 0) a = 2; c = a + b * x; }
        return { prompt: `Solve for ${X}.${big(`${fr(N(a), X)} ${M.signed(b)} = ${fr(N(c), X)}`)}`, type: 'number', answer: x, params: { kind, a, b, c },
          hints: [`Multiply every term by ${X}: ${N(a)} ${M.signed(b)}${X} = ${N(c)}.`,
            `Subtract ${pw(a)}: ${M.term(b, 'x')} = ${N(c - a)}.`,
            `Divide by ${pw(b)}: ${X} = <b>${N(x)}</b>, which does not make a denominator zero.`] };
      }
      const [x, pp, qq] = rng.sample([-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7], 3);
      const k = rng.pick([1, 2, 3, -1, -2]);
      const a = k * (x - pp), b = k * (x - qq);
      return { prompt: `Solve for ${X}.${big(`${fr(N(a), lp(-pp))} = ${fr(N(b), lp(-qq))}`)}`, type: 'number', answer: x, params: { kind, a, b, pp, qq },
        hints: [`Cross-multiply: ${N(a)}(${lp(-qq)}) = ${N(b)}(${lp(-pp)}).`,
          `Expand: ${M.poly([a, -a * qq])} = ${M.poly([b, -b * pp])}.`,
          `Collect the ${X} terms: ${M.term(a - b, 'x')} = ${N(a * qq - b * pp)}, so ${X} = <b>${N(x)}</b>. It does not make either denominator zero.`] };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'work') return close(x / P.ta + x / P.tb, 1, 0.005);
      if (P.kind === 'split') return x !== 0 && close(P.a / x + P.b, P.c / x);
      return x !== P.pp && x !== P.qq && close(P.a / (x - P.pp), P.b / (x - P.qq));
    },
  });



  /* ---------- Unit 3: Inverse functions and logarithms ---------- */
  A.skill({
    id: 'int3.inverse-functions', title: 'Inverse functions',
    learn: p(`The inverse ${M.sup(V('f'), '−1')} undoes ${V('f')}: <b>if ${V('f')}(${V('a')}) = ${V('b')}, then ${M.sup(V('f'), '−1')}(${V('b')}) = ${V('a')}</b>. Inputs and outputs trade places, so the graph of the inverse is the graph of ${V('f')} reflected in the line ${V('y')} = ${X}.`) +
      p(`<b>To find a formula for the inverse,</b> write ${V('y')} = ${V('f')}(${X}), swap ${X} and ${V('y')}, and solve for ${V('y')}. To find a single value ${M.sup(V('f'), '−1')}(${V('c')}), you can skip the formula and solve ${V('f')}(${X}) = ${V('c')} instead.`) +
      p('Exponential and logarithmic functions are inverses of each other: the inverse of 2<sup>' + X + '</sup> is ' + LOG(2) + ' ' + X + '.') +
      example('Example', `${V('f')}(${X}) = 3${X} − 5. Find ${M.sup(V('f'), '−1')}(7).${big(`3${X} − 5 = 7 → 3${X} = 12 → ${X} = 4`)}So ${M.sup(V('f'), '−1')}(7) = <b>4</b>. Check: ${V('f')}(4) = 7.`),
    make(rng) {
      const kind = rng.pick(['lin', 'lin', 'cube', 'exp', 'formula']);
      const fi = `${M.sup(V('f'), '−1')}`;
      if (kind === 'formula') {
        let a = rng.nz(-6, 6); if (Math.abs(a) === 1) a = 2 * a; const b = rng.nz(-9, 9);
        const answer = fr(`${X} ${M.signed(-b)}`, N(a));
        const wrong = [fr(`${X} ${M.signed(b)}`, N(a)), `${fr(X, N(a))} ${M.signed(-b)}`, fr(`${X} ${M.signed(-a)}`, N(b)), `${N(a)}${X} ${M.signed(-b)}`];
        return { prompt: `Find the inverse of ${V('f')}.${big(`${V('f')}(${X}) = ${M.poly([a, b])}`)}`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, a, b },
          hints: [`Write ${V('y')} = ${M.poly([a, b])}, then swap the letters: ${X} = ${M.poly([a, b], 'y')}.`, `Solve for ${V('y')}: subtract ${pw(b)} from both sides, then divide by ${pw(a)}.`, `${fi}(${X}) = <b>${answer}</b>.`] };
      }
      let fTxt, y, c, hints, a, b, base, k;
      if (kind === 'lin') {
        a = rng.nz(-6, 6); b = rng.nz(-12, 12); y = rng.int(-8, 8); c = a * y + b;
        fTxt = M.poly([a, b]);
        hints = [`${fi}(${N(c)}) is the input that makes ${V('f')} equal ${N(c)}. Solve ${fTxt} = ${N(c)}.`, `${M.term(a, 'x')} = ${N(c - b)}, so ${X} = ${N(c - b)} ÷ ${pw(a)}.`, `${fi}(${N(c)}) = <b>${N(y)}</b>.`];
      } else if (kind === 'cube') {
        a = rng.pick([1, 2, -1]); b = rng.int(-10, 10); y = rng.int(-3, 4); c = a * y ** 3 + b;
        fTxt = M.poly([a, 0, 0, b]);
        hints = [`${fi}(${N(c)}) is the input that makes ${V('f')} equal ${N(c)}. Solve ${fTxt} = ${N(c)}.`, `${M.term(a, 'x', 3)} = ${N(c - b)}, so ${M.sup(X, 3)} = ${N((c - b) / a)}.`, `Take the cube root: ${fi}(${N(c)}) = <b>${N(y)}</b>.`];
      } else {
        base = rng.pick([2, 3, 5]); k = rng.int(-9, 9); y = rng.int(0, base === 2 ? 6 : 3); c = base ** y + k;
        fTxt = `${M.sup(N(base), X)} ${k ? M.signed(k) : ''}`.trim();
        hints = [`${fi}(${N(c)}) is the input that makes ${V('f')} equal ${N(c)}. Solve ${fTxt} = ${N(c)}.`, `${M.sup(N(base), X)} = ${N(c - k)}.`, `${N(c - k)} = ${M.sup(N(base), y)}, so ${fi}(${N(c)}) = <b>${N(y)}</b>.`];
      }
      return { prompt: `Find ${fi}(${N(c)}).${big(`${V('f')}(${X}) = ${fTxt}`)}`, type: 'number', answer: y, hints, params: { kind, a, b, base, k, c } };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'formula') { const g = t => (t - P.b) / P.a; for (const t of [-3, 0.5, 7]) if (!close(P.a * g(t) + P.b, t)) return 'not an inverse'; return q.answer === fr(`${X} ${M.signed(-P.b)}`, N(P.a)); }
      const y = q.answer;
      const fy = P.kind === 'lin' ? P.a * y + P.b : P.kind === 'cube' ? P.a * y * y * y + P.b : Math.pow(P.base, y) + P.k;
      return fy === P.c;      // the answer, put through f, gives back c
    },
  });

  A.skill({
    id: 'int3.log-properties', title: 'Evaluating logarithms and using their properties',
    learn: p(`A logarithm is an exponent. <b>${LOG(V('b'))} ${V('x')} = ${V('y')} means ${M.sup(V('b'), V('y'))} = ${V('x')}.</b> So ${LOG(2)} 32 = 5 because 2<sup>5</sup> = 32, and ${LOG(3)} ${fr(1, 9)} = −2 because 3<sup>−2</sup> = ${fr(1, 9)}.`) +
      p(`The properties come from the exponent rules: <b>${LOG(V('b'))} ${V('m')}${V('n')} = ${LOG(V('b'))} ${V('m')} + ${LOG(V('b'))} ${V('n')}</b>, <b>${LOG(V('b'))} (${V('m')}/${V('n')}) = ${LOG(V('b'))} ${V('m')} − ${LOG(V('b'))} ${V('n')}</b>, and <b>${LOG(V('b'))} ${M.sup(V('m'), V('k'))} = ${V('k')} ${LOG(V('b'))} ${V('m')}</b>.`) +
      p('These let you combine logs whose arguments are not powers of the base into one log that is.') +
      example('Example', `${big(`${LOG(6)} 4 + ${LOG(6)} 9`)}Combine: ${LOG(6)} (4 · 9) = ${LOG(6)} 36. Since 6<sup>2</sup> = 36, the value is <b>2</b>.`),
    make(rng) {
      const kind = rng.pick(['eval', 'eval', 'sum', 'diff', 'given']);
      if (kind === 'eval') {
        const b = rng.pick([2, 3, 4, 5, 10]), maxK = { 2: 7, 3: 5, 4: 4, 5: 4, 10: 5 }[b];
        const k = rng.chance(0.15) ? 0.5 : rng.int(-3, maxK);
        const arg = k === 0.5 ? M.sqrt(b) : k >= 0 ? N(b ** k) : F(1, b ** -k);
        const q = { prompt: `Evaluate.${big(`${LOG(b)} ${arg}`)}`, type: 'number', answer: k, params: { kind, b, x: Math.pow(b, k) },
          hints: [`Ask: ${N(b)} to what power gives ${arg}?`, k === 0.5 ? `A square root is a power of ${fr(1, 2)}: ${M.sqrt(b)} = ${M.sup(N(b), '1/2')}.` : k < 0 ? `${arg} = ${fr(1, M.sup(N(b), -k))} = ${M.sup(N(b), N(k))}.` : `${N(b ** k)} = ${M.sup(N(b), k)}.`, `So ${LOG(b)} ${arg} = <b>${k === 0.5 ? '1/2' : N(k)}</b>.`] };
        if (k === 0.5) q.answerText = '1/2';
        return q;
      }
      if (kind === 'sum') {
        const b = rng.pick([6, 10, 12, 15]), k = rng.int(2, 3), total = b ** k;
        const divs = []; for (let d = 2; d * d < total; d++) if (total % d === 0 && d % b !== 0) divs.push(d);
        let m = rng.pick(divs), n = total / m; if (rng.bool()) [m, n] = [n, m];
        return { prompt: `Evaluate.${big(`${LOG(b)} ${N(m)} + ${LOG(b)} ${N(n)}`)}`, type: 'number', answer: k, params: { kind, b, m, n },
          hints: [`Use the product rule: ${LOG(b)} ${N(m)} + ${LOG(b)} ${N(n)} = ${LOG(b)} (${N(m)} · ${N(n)}).`, `${N(m)} · ${N(n)} = ${N(total)} = ${M.sup(N(b), k)}.`, `So the value is <b>${k}</b>.`] };
      }
      if (kind === 'diff') {
        const b = rng.pick([2, 3, 5]), k = rng.int(1, 3); let n = rng.int(2, 9); if (n % b === 0) n += 1;
        const m = n * b ** k;
        return { prompt: `Evaluate.${big(`${LOG(b)} ${N(m)} − ${LOG(b)} ${N(n)}`)}`, type: 'number', answer: k, params: { kind, b, m, n },
          hints: [`Use the quotient rule: ${LOG(b)} ${N(m)} − ${LOG(b)} ${N(n)} = ${LOG(b)} ${fr(m, n, { raw: true })}.`, `${N(m)} ÷ ${N(n)} = ${N(b ** k)} = ${M.sup(N(b), k)}.`, `So the value is <b>${k}</b>.`] };
      }
      const u = rng.nz(-4, 5), w = rng.nz(-4, 5), pp = rng.int(1, 3), qq = rng.int(1, 3), op = rng.pick(['mul', 'div']);
      const sgn = op === 'mul' ? '+' : '−';
      const ans = pp * u + (op === 'mul' ? 1 : -1) * qq * w;
      const xp = pp > 1 ? M.sup(V('x'), pp) : V('x'), yq = qq > 1 ? M.sup(V('y'), qq) : V('y');
      const arg = op === 'mul' ? `${xp}${yq}` : `(${xp}/${yq})`;
      return { prompt: `${LOG(V('b'))} ${V('x')} = ${N(u)} and ${LOG(V('b'))} ${V('y')} = ${N(w)}. Find the value.${big(`${LOG(V('b'))} ${arg}`)}`, type: 'number', answer: ans, params: { kind, u, w, pp, qq, op },
        hints: [`Split with the ${op === 'mul' ? 'product' : 'quotient'} rule: ${LOG(V('b'))} ${xp} ${sgn} ${LOG(V('b'))} ${yq}.`,
          `Bring the powers down: ${pp > 1 ? pp + ' ' : ''}${LOG(V('b'))} ${V('x')} ${sgn} ${qq > 1 ? qq + ' ' : ''}${LOG(V('b'))} ${V('y')} = ${pp}(${N(u)}) ${sgn} ${qq}(${N(w)}).`,
          `That is ${N(pp * u)} ${sgn} ${pw(qq * w)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params, L = (b, x) => Math.log10(x) / Math.log10(b);
      if (P.kind === 'eval') return close(L(P.b, P.x), q.answer, 1e-9);
      if (P.kind === 'sum') return close(L(P.b, P.m) + L(P.b, P.n), q.answer, 1e-9);
      if (P.kind === 'diff') return close(L(P.b, P.m) - L(P.b, P.n), q.answer, 1e-9);
      const x = Math.pow(2, P.u), y = Math.pow(2, P.w);              // try it with base 2
      const v = P.op === 'mul' ? Math.pow(x, P.pp) * Math.pow(y, P.qq) : Math.pow(x, P.pp) / Math.pow(y, P.qq);
      return close(Math.log2(v), q.answer, 1e-9);
    },
  });

  A.skill({
    id: 'int3.exp-log-equations', title: 'Solving exponential and logarithmic equations',
    learn: p(`<b>If both sides can be written as powers of the same base, set the exponents equal.</b> 3<sup>2${X} − 1</sup> = 243 = 3<sup>5</sup> gives 2${X} − 1 = 5, so ${X} = 3.`) +
      p(`<b>To solve a log equation, rewrite it in exponential form:</b> ${LOG(V('b'))} (stuff) = ${V('k')} means stuff = ${M.sup(V('b'), V('k'))}. Then check that the stuff inside the log is positive.`) +
      p(`When the bases do not match, isolate the power and take a logarithm of both sides: ${M.sup(V('b'), X)} = ${V('c')} gives ${X} = ${fr(`log ${V('c')}`, `log ${V('b')}`)}. With base ${V('e')}, use the natural log: ${M.sup(V('e'), V('k') + X)} = ${V('c')} gives ${X} = ${fr(`ln ${V('c')}`, V('k'))}.`) +
      example('Example', `${big(`5 · ${M.sup('2', X)} = 60`)}Divide by 5: 2<sup>${X}</sup> = 12. Then ${X} = ${fr('log 12', 'log 2')} ≈ <b>3.58</b>.`),
    make(rng) {
      const kind = rng.pick(['same', 'log', 'unlike', 'ln']);
      if (kind === 'same') {
        const b = rng.pick([2, 3, 5]), maxE = { 2: 7, 3: 5, 5: 4 }[b];
        const e = rng.int(-2, maxE), a = rng.pick([1, 2, 3]), x = rng.nz(-4, 4), c = e - a * x;
        const val = e >= 0 ? N(b ** e) : F(1, b ** -e);
        return { prompt: `Solve for ${X}.${big(`${M.sup(N(b), M.poly([a, c]))} = ${val}`)}`, type: 'number', answer: x, params: { kind, b, a, c, e },
          hints: [`Write the right side as a power of ${b}: ${val} = ${M.sup(N(b), N(e))}.`, `Set the exponents equal: ${M.poly([a, c])} = ${N(e)}.`, `${M.term(a, 'x')} = ${N(e - c)}, so ${X} = <b>${N(x)}</b>.`] };
      }
      if (kind === 'log') {
        const b = rng.pick([2, 3, 5, 10]), k = rng.int(1, { 2: 6, 3: 4, 5: 3, 10: 3 }[b]);
        const a = rng.int(1, 4), x = rng.nz(-9, 12), c = b ** k - a * x;
        return { prompt: `Solve for ${X}.${big(`${LOG(b)} (${M.poly([a, c])}) = ${k}`)}`, type: 'number', answer: x, params: { kind, b, k, a, c },
          hints: [`Rewrite in exponential form: ${M.poly([a, c])} = ${M.sup(N(b), k)} = ${N(b ** k)}.`, `Subtract ${pw(c)} from both sides${a > 1 ? `, then divide by ${a}` : ''}.`, `${X} = <b>${N(x)}</b>. The inside of the log is then ${N(b ** k)}, which is positive, so it checks.`] };
      }
      if (kind === 'unlike') {
        const b = rng.pick([2, 3, 4, 1.5]), a = rng.int(2, 9);
        let m = rng.int(5, 60); while (Number.isInteger(Math.round(Math.log(m) / Math.log(b) * 1e9) / 1e9)) m += 1;
        const c = a * m, x = r2(Math.log(m) / Math.log(b));
        return { prompt: `Solve for ${X}. Round to the nearest hundredth.${big(`${N(a)} · ${M.sup(N(b), X)} = ${N(c)}`)}`, type: 'number', answer: x, tolerance: 0.01, params: { kind, b, a, c },
          hints: [`Isolate the power: divide by ${a} to get ${M.sup(N(b), X)} = ${N(m)}.`, `Take the log of both sides: ${X} log ${N(b)} = log ${N(m)}, so ${X} = ${fr(`log ${N(m)}`, `log ${N(b)}`)}.`, `${X} ≈ <b>${N(x)}</b>.`] };
      }
      const k = rng.int(1, 4), c = rng.pick([2, 3, 5, 7, 10, 12, 15, 20, 25, 40, 50]);
      const x = r2(Math.log(c) / k);
      return { prompt: `Solve for ${X}. Round to the nearest hundredth.${big(`${M.sup(V('e'), k === 1 ? X : k + X)} = ${N(c)}`)}`, type: 'number', answer: x, tolerance: 0.01, params: { kind, k, c },
        hints: [`Take the natural log of both sides: ${k === 1 ? X : k + X} = ln ${N(c)}.`, `ln ${N(c)} ≈ ${N(M.round(Math.log(c), 4))}${k > 1 ? `, and dividing by ${k} gives ${N(M.round(Math.log(c) / k, 4))}` : ''}.`, `${X} ≈ <b>${N(x)}</b>.`] };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'same') return close(Math.pow(P.b, P.a * x + P.c), Math.pow(P.b, P.e), 1e-9);
      if (P.kind === 'log') return close(Math.log(P.a * x + P.c) / Math.log(P.b), P.k, 1e-9);
      if (P.kind === 'unlike') return Math.abs(x - Math.log10(P.c / P.a) / Math.log10(P.b)) <= 0.005 + 1e-9;
      return Math.abs(x - Math.log10(P.c) / Math.log10(Math.E) / P.k) <= 0.005 + 1e-9;
    },
  });

  A.skill({
    id: 'int3.exp-log-models', title: 'Exponential and logarithmic models',
    learn: p(`A quantity that grows or shrinks by the same <b>percent</b> each period is exponential: <b>${V('A')} = ${V('P')}(1 + ${V('r')})<sup>${V('t')}</sup></b> for growth and ${V('P')}(1 − ${V('r')})<sup>${V('t')}</sup> for decay, with ${V('r')} as a decimal. Interest compounded continuously uses ${V('A')} = ${V('P')}${M.sup(V('e'), V('rt'))}.`) +
      p(`A half-life ${V('h')} gives ${V('A')} = ${M.sub(V('A'), 0)}(${fr(1, 2)})<sup>${V('t')}/${V('h')}</sup>. To find <b>when</b> a target is reached, set the formula equal to the target and solve with logarithms.`) +
      p(`Logarithmic scales squeeze huge ranges into small numbers: acidity is pH = −log[H<sup>+</sup>], so each step of 1 in pH is a factor of 10 in concentration.`) +
      example('Example', `A town of 4,000 grows 3% a year. When does it reach 6,000?${big(`4000(1.03)<sup>${V('t')}</sup> = 6000 → 1.03<sup>${V('t')}</sup> = 1.5 → ${V('t')} = ${fr('log 1.5', 'log 1.03')}`)}${V('t')} ≈ <b>13.7 years</b>.`),
    make(rng) {
      const kind = rng.pick(['growth', 'decay', 'half', 'when', 'ph', 'cont']);
      const name = rng.pick(NAMES);
      if (kind === 'growth' || kind === 'decay') {
        const grow = kind === 'growth', r = rng.pick(grow ? [2, 3, 4, 5, 6, 8] : [8, 10, 12, 15, 18]), t = rng.int(3, 12);
        const P0 = grow ? rng.int(4, 60) * 100 : rng.int(12, 40) * 1000, g = 1 + (grow ? r : -r) / 100;
        const ans = Math.round(P0 * Math.pow(g, t));
        const prompt = grow ? `A town has ${N(P0)} people and grows by ${r}% each year. About how many people live there after ${t} years? Round to the nearest whole number.`
          : `${name} buys a used car for ${M.money(P0)}. It loses ${r}% of its value each year. What is it worth after ${t} years? Round to the nearest dollar.`;
        return { prompt, type: 'number', answer: ans, unit: grow ? 'people' : '$', tolerance: 0.5, params: { kind, P0, r, t },
          hints: [`Each year multiplies the amount by ${N(g)}${grow ? '' : ` (100% − ${r}%)`}, so use ${N(P0)}(${N(g)})<sup>${t}</sup>.`, `${N(g)}<sup>${t}</sup> ≈ ${N(M.round(Math.pow(g, t), 5))}, and ${N(P0)} × ${N(M.round(Math.pow(g, t), 5))} ≈ ${N(M.round(P0 * Math.pow(g, t), 2))}.`, `Rounded, that is <b>${grow ? N(ans) : M.money(ans)}</b>.`] };
      }
      if (kind === 'half') {
        const A0 = rng.pick([40, 50, 80, 100, 120, 200, 250]), h = rng.pick([3, 5, 6, 8, 10, 12]), t = rng.int(2, 30);
        const ans = r1(A0 * Math.pow(0.5, t / h));
        return { prompt: `A medicine has a half-life of ${h} hours. ${name} takes a dose of ${A0} mg. How much is left in the body after ${t} hours? Round to the nearest tenth of a milligram.`, type: 'number', answer: ans, unit: 'mg', tolerance: 0.05, params: { kind, A0, h, t },
          hints: [`Use ${V('A')} = ${A0}(${fr(1, 2)})<sup>${V('t')}/${h}</sup>.`, `${t} hours is ${t}/${h} ≈ ${N(M.round(t / h, 4))} half-lives.`, `${A0} × 0.5<sup>${N(M.round(t / h, 4))}</sup> ≈ <b>${N(ans)} mg</b>.`] };
      }
      if (kind === 'when') {
        const P0 = rng.int(2, 9) * 1000, r = rng.pick([2, 3, 4, 5, 6, 7]), f = rng.pick([1.5, 2, 2.5, 3]);
        const T = P0 * f, g = 1 + r / 100, ans = r1(Math.log(f) / Math.log(g));
        return { prompt: `A town of ${N(P0)} people grows by ${r}% a year, so its population after ${V('t')} years is ${N(P0)}(${N(g)})<sup>${V('t')}</sup>. After how many years does the population reach ${N(T)}? Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'years', tolerance: 0.05, params: { kind, P0, r, T },
          hints: [`Set up ${N(P0)}(${N(g)})<sup>${V('t')}</sup> = ${N(T)}, and divide by ${N(P0)}: ${N(g)}<sup>${V('t')}</sup> = ${N(f)}.`, `Take logs: ${V('t')} = ${fr(`log ${N(f)}`, `log ${N(g)}`)}.`, `${V('t')} ≈ <b>${N(ans)}</b> years.`] };
      }
      if (kind === 'ph') {
        const m = rng.pick([1.5, 2, 2.5, 3.2, 4, 5, 6.3, 8]), k = rng.int(3, 10);
        const ans = r2(k - Math.log10(m));
        return { prompt: `pH = −log[H<sup>+</sup>]. A solution has a hydrogen ion concentration of ${N(m)} × 10<sup>−${k}</sup> moles per litre. What is its pH? Round to the nearest hundredth.`, type: 'number', answer: ans, tolerance: 0.01, params: { kind, m, k },
          hints: [`pH = −log(${N(m)} × 10<sup>−${k}</sup>) = −(log ${N(m)} + log 10<sup>−${k}</sup>).`, `log ${N(m)} ≈ ${N(M.round(Math.log10(m), 4))} and log 10<sup>−${k}</sup> = −${k}.`, `pH ≈ ${k} − ${N(M.round(Math.log10(m), 4))} = <b>${N(ans)}</b>.`] };
      }
      const P0 = rng.int(5, 50) * 100, r = rng.pick([2, 2.5, 3, 4, 4.5, 5, 6]), t = rng.int(2, 20);
      const ans = r2(P0 * Math.exp(r / 100 * t)), rt = M.round(r / 100 * t, 4);
      return { prompt: `${name} deposits ${M.money(P0)} in an account paying ${r}% interest compounded continuously. How much is in the account after ${t} years? Round to the nearest cent.`, type: 'number', answer: ans, unit: '$', tolerance: 0.01, params: { kind, P0, r, t },
        hints: [`Use ${V('A')} = ${V('P')}${M.sup(V('e'), V('rt'))} with ${V('r')} = ${N(r / 100)} and ${V('t')} = ${t}.`, `${V('rt')} = ${N(rt)}, and ${M.sup(V('e'), N(rt))} ≈ ${N(M.round(Math.exp(rt), 6))}.`, `${N(P0)} × ${N(M.round(Math.exp(rt), 6))} ≈ <b>${M.money(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params, x = q.answer;
      if (P.kind === 'growth' || P.kind === 'decay') { let v = P.P0; for (let i = 0; i < P.t; i++) v *= 1 + (P.kind === 'growth' ? P.r : -P.r) / 100; return Math.abs(v - x) <= 0.5 + 1e-9; }
      if (P.kind === 'half') return Math.abs(P.A0 * Math.exp(-P.t * Math.LN2 / P.h) - x) <= 0.05 + 1e-9;
      if (P.kind === 'when') return Math.abs(P.P0 * Math.pow(1 + P.r / 100, x) / P.T - 1) < 0.004;
      if (P.kind === 'ph') return Math.abs(Math.pow(10, -x) / (P.m * Math.pow(10, -P.k)) - 1) < 0.012;
      const n = 1e6, v = P.P0 * Math.pow(1 + P.r / 100 / n, n * P.t);     // compounding a million times a year is nearly continuous
      return Math.abs(v - x) <= 0.01 + v * 1e-6;
    },
  });

  /* ---------- Unit 4: Trigonometric functions ---------- */
  /** kπ as stacked text: π/6, 5π/4, 2π */
  function piFrac(n, d) {
    [n, d] = M.simp(n, d);
    if (n === 0) return '0';
    const top = `${n === 1 ? '' : n === -1 ? '−' : N(n)}π`;
    return d === 1 ? top : F(top, d);
  }
  /** exact values on the unit circle, as HTML */
  const EXACT = [
    { v: 0, h: '0' }, { v: 0.5, h: F(1, 2) }, { v: Math.SQRT2 / 2, h: F(M.sqrt(2), 2) }, { v: Math.sqrt(3) / 2, h: F(M.sqrt(3), 2) }, { v: 1, h: '1' },
  ];
  function exactHtml(x) {
    const e = EXACT.find(e => close(e.v, Math.abs(x), 1e-9));
    return (x < -1e-12 ? '−' : '') + e.h;
  }
  const valueOf = h => { for (const e of EXACT) for (const s of [1, -1]) if ((s < 0 ? '−' : '') + e.h === h) return s * e.v; return NaN; };

  A.skill({
    id: 'int3.unit-circle', title: 'Radians and the unit circle',
    learn: p(`A <b>radian</b> is the angle that cuts off an arc as long as the radius. A full turn is 2π radians, so <b>180° = π radians</b>. To change degrees to radians multiply by ${F('π', 180)}; to change radians to degrees multiply by ${F(180, 'π')}.`) +
      p(`On the <b>unit circle</b> (radius 1), the point at angle θ is <b>(cos θ, sin θ)</b>. The special angles 30°, 45° and 60° give the values ${F(1, 2)}, ${F(M.sqrt(2), 2)} and ${F(M.sqrt(3), 2)}. In other quadrants, use the reference angle for the size and the quadrant for the sign: cosine is positive on the right, sine is positive on top.`) +
      example('Example', `Find cos ${F('5π', 6)}.${big(`${F('5π', 6)} = 150°`)}The reference angle is 30°, and 150° is in the second quadrant, where cosine is negative. So cos ${F('5π', 6)} = <b>−${F(M.sqrt(3), 2)}</b>.`),
    make(rng) {
      const kind = rng.pick(['d2r', 'r2d', 'exact', 'exact']);
      const degs = [30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
      const dg = rng.pick(kind === 'exact' ? degs.slice(0, -1).concat([0]) : degs);
      const [n, d] = M.simp(dg, 180);
      if (kind === 'd2r') {
        const answer = piFrac(n, d);
        const wrong = [piFrac(d, n), piFrac(n, 2 * d), piFrac(2 * n, d), piFrac(n + d, d), piFrac(n, d + 1)];
        return { prompt: `Convert ${M.deg(dg)} to radians.`, type: 'choice', choices: options(answer, wrong), answer, params: { kind, dg, n, d },
          hints: [`Multiply by ${F('π', 180)}: ${M.deg(dg)} × ${F('π', 180)} = ${F(dg + 'π', 180)}.`, `Simplify the fraction ${F(dg, 180, { raw: true })} = ${F(n, d)}.`, `${M.deg(dg)} = <b>${answer}</b> radians.`] };
      }
      if (kind === 'r2d') {
        return { prompt: `Convert ${piFrac(n, d)} radians to degrees.`, type: 'number', answer: dg, unit: '°', params: { kind, n, d },
          hints: [`Replace π with 180°: ${piFrac(n, d)} = ${n === 1 ? '' : `${n} × `}180°${d === 1 ? '' : ` ÷ ${d}`}.`, d === 1 ? `${n === 1 ? '' : `${n} × `}180 = ${dg}.` : `${n === 1 ? '' : `${n} × 180 = ${n * 180}, and `}${n * 180} ÷ ${d} = ${dg}.`, `${piFrac(n, d)} = <b>${M.deg(dg)}</b>.`] };
      }
      const fn = rng.pick(['sin', 'cos']);
      const s = Math.sin(rad(dg)), c = Math.cos(rad(dg)), val = fn === 'sin' ? s : c, other = fn === 'sin' ? c : s;
      const answer = exactHtml(val);
      const pool = [exactHtml(-val), exactHtml(other), exactHtml(-other), exactHtml(Math.abs(val) === 0.5 || close(Math.abs(val), 0.5) ? Math.sign(val || 1) * Math.SQRT2 / 2 : Math.sign(val || 1) * 0.5), '1', '0', '−1', F(1, 2)];
      const ref = dg % 180 === 0 || dg % 90 === 0 ? null : Math.min(dg % 180, 180 - dg % 180);
      const quad = Math.floor(dg / 90) + 1;
      return { prompt: `Find the exact value.${big(`${fn} ${dg === 0 ? '0' : piFrac(n, d)}`)}`, type: 'choice', choices: options(answer, pool), answer, params: { kind, fn, n, d },
        hints: [`Convert to degrees: ${dg === 0 ? '0' : piFrac(n, d)} = ${M.deg(dg)}.`,
          ref ? `The reference angle is ${M.deg(ref)}, and ${M.deg(dg)} is in quadrant ${quad}, where ${fn} is ${val > 0 ? 'positive' : 'negative'}.` : `${M.deg(dg)} lies on an axis: the unit-circle point there is (${N(Math.round(c))}, ${N(Math.round(s))}).`,
          `${fn} ${dg === 0 ? '0' : piFrac(n, d)} = <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'd2r') { const t = A.stripTags(q.answer).replace(/\s+/g, ''); const m = t.match(/^(−?\d*)π(\d*)$/); const k = (m[1] === '' ? 1 : m[1] === '−' ? -1 : Number(m[1])) / (m[2] ? Number(m[2]) : 1); return close(k * 180, P.dg); }
      if (P.kind === 'r2d') return close(q.answer * Math.PI / 180, P.n * Math.PI / P.d);
      const x = P.n * Math.PI / P.d;
      return close(valueOf(q.answer), P.fn === 'sin' ? Math.sin(x) : Math.cos(x), 1e-9);
    },
  });

  A.skill({
    id: 'int3.sinusoid-graphs', title: 'Graphs of sine and cosine',
    learn: p(`The graphs of ${V('y')} = ${V('a')} sin(${V('b')}${X}) + ${V('d')} and ${V('y')} = ${V('a')} cos(${V('b')}${X}) + ${V('d')} are waves. <b>The midline is ${V('y')} = ${V('d')}</b>, the level the wave rises above and falls below. <b>The amplitude is |${V('a')}|</b>, the distance from the midline to a peak.`) +
      p(`<b>The period is ${F('2π', V('b'))}</b>, the horizontal length of one full cycle. So the maximum value is ${V('d')} + |${V('a')}| and the minimum is ${V('d')} − |${V('a')}|. A negative ${V('a')} flips the wave upside down but does not change the amplitude.`) +
      example('Example', `${big(`${V('y')} = −3 cos(${F(`π${X}`, 4)}) + 5`)}Amplitude |−3| = 3, midline ${V('y')} = 5, period 2π ÷ ${F('π', 4)} = 8. The maximum is 5 + 3 = <b>8</b> and the minimum is <b>2</b>.`),
    make(rng) {
      const kind = rng.pick(['formula', 'formula', 'formula', 'wheel']);
      if (kind === 'wheel') {
        const name = rng.pick(NAMES), dia = rng.pick([20, 30, 40, 50, 60, 80, 100]), hub = dia / 2 + rng.int(1, 6), T = rng.pick([20, 30, 40, 45, 60, 90]);
        const ask = rng.pick(['amp', 'mid', 'per', 'max']);
        const ans = { amp: dia / 2, mid: hub, per: T, max: hub + dia / 2 }[ask];
        const what = { amp: 'the amplitude of the height function, in metres', mid: 'the midline height, in metres', per: 'the period, in seconds', max: 'the greatest height of the seat, in metres' }[ask];
        return { prompt: `A Ferris wheel is ${dia} m across and its centre is ${hub} m above the ground. It turns once every ${T} seconds. ${name}’s seat height is a sinusoidal function of time. What is ${what}?`, type: 'number', answer: ans, unit: ask === 'per' ? 's' : 'm', params: { kind, dia, hub, T, ask },
          hints: [`The seat swings between the bottom and the top of the wheel, ${dia / 2} m (the radius) below and above the centre.`, `So the midline is the centre height ${hub} m, the amplitude is the radius ${dia / 2} m, and one full cycle takes ${T} s.`, `The answer is <b>${N(ans)} ${ask === 'per' ? 's' : 'm'}</b>.`] };
      }
      const fn = rng.pick(['sin', 'cos']), a = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]), dd = rng.int(-6, 8), h = rng.pick([1, 2, 3, 4, 6]);
      const inner = h === 1 ? `π${X}` : F(`π${X}`, h);
      const fTxt = `${V('y')} = ${a === 1 ? '' : a === -1 ? '−' : N(a)} ${fn}(${inner})${dd ? ' ' + M.signed(dd) : ''}`.replace('=  ', '= ');
      const ask = rng.pick(['amp', 'per', 'mid', 'max', 'min']);
      const ans = { amp: Math.abs(a), per: 2 * h, mid: dd, max: dd + Math.abs(a), min: dd - Math.abs(a) }[ask];
      const what = { amp: 'the amplitude', per: 'the period', mid: `the midline (enter the number ${V('d')} in ${V('y')} = ${V('d')})`, max: 'the maximum value', min: 'the minimum value' }[ask];
      const hints = [`Match to ${V('y')} = ${V('a')} ${fn}(${V('b')}${X}) + ${V('d')}: ${V('a')} = ${N(a)}, ${V('b')} = ${h === 1 ? 'π' : F('π', h)}, ${V('d')} = ${N(dd)}.`];
      if (ask === 'per') hints.push(`Period = 2π ÷ ${h === 1 ? 'π' : F('π', h)} = 2π × ${h === 1 ? F(1, 'π') : F(h, 'π')} = ${2 * h}.`);
      else if (ask === 'amp') hints.push(`The amplitude is |${V('a')}| = |${N(a)}|. The sign only flips the wave.`);
      else if (ask === 'mid') hints.push(`The midline is ${V('y')} = ${V('d')}, the vertical shift.`);
      else hints.push(`The wave goes |${N(a)}| = ${Math.abs(a)} ${ask === 'max' ? 'above' : 'below'} the midline ${V('y')} = ${N(dd)}: ${N(dd)} ${ask === 'max' ? '+' : '−'} ${Math.abs(a)}.`);
      hints.push(`The ${ask === 'amp' ? 'amplitude' : ask === 'per' ? 'period' : ask === 'mid' ? 'midline is ' + V('y') + ' = ' + N(ans) + ', so the number' : ask === 'max' ? 'maximum' : 'minimum'} is <b>${N(ans)}</b>.`);
      return { prompt: `What is ${what}?${big(fTxt)}`, type: 'number', answer: ans, hints, params: { kind, fn, a, dd, h, ask } };
    },
    verify(q) {
      const P = q.params;
      let f, ask = P.ask, span;
      if (P.kind === 'wheel') { f = t => P.hub - (P.dia / 2) * Math.cos(2 * Math.PI * t / P.T); span = P.T; }
      else { const g = P.fn === 'sin' ? Math.sin : Math.cos; f = x => P.a * g(Math.PI * x / P.h) + P.dd; span = 2 * P.h; }
      const xs = []; for (let i = 0; i <= 480; i++) xs.push(2 * span * i / 480);
      const ys = xs.map(f), hi = Math.max(...ys), lo = Math.min(...ys);
      if (ask === 'per') { let per = null; for (let c = 1; c <= 200 && per === null; c++) if (xs.every(x => close(f(x + c), f(x), 1e-6))) per = c; return per === q.answer; }
      const got = { amp: (hi - lo) / 2, mid: (hi + lo) / 2, max: hi, min: lo }[ask];
      return close(got, q.answer, 1e-6);
    },
  });

  A.skill({
    id: 'int3.trig-equations', title: 'Solving trigonometric equations',
    learn: p(`<b>First isolate the trig function</b>, just as you would isolate ${X}: 2 sin ${X} + 1 = 0 becomes sin ${X} = −${F(1, 2)}.`) +
      p(`Then find the reference angle (here 30°) and use the signs to place the solutions. Sine is negative in quadrants 3 and 4, so in 0° ≤ ${X} &lt; 360° the solutions are 180° + 30° = 210° and 360° − 30° = 330°. <b>Sine and cosine equations usually have two solutions per turn</b>; an interval in the question tells you which one is wanted.`) +
      p(`When the value is not a special one, use the inverse key: sin ${X} = 0.4 gives ${X} = ${M.sup('sin', '−1')}(0.4) ≈ 23.6°, and the second solution is 180° − 23.6° = 156.4°.`) +
      example('Example', `Solve 2 cos ${X} = −${M.sqrt(3)} for 90° &lt; ${X} &lt; 180°.${big(`cos ${X} = −${F(M.sqrt(3), 2)}`)}The reference angle is 30°. In quadrant 2, ${X} = 180° − 30° = <b>150°</b>.`),
    make(rng) {
      const kind = rng.pick(['quad', 'quad', 'two', 'calc']);
      const fn = rng.pick(['sin', 'cos']), f = fn === 'sin' ? Math.sin : Math.cos;
      const lhs = `${fn} ${X}`;
      if (kind === 'calc') {
        const v = rng.int(15, 90) / 100, obtuse = fn === 'sin' && rng.bool(), neg = fn === 'cos' && rng.bool();
        const val = neg ? -v : v, base = fn === 'sin' ? degOf(Math.asin(v)) : degOf(Math.acos(val));
        const ans = r1(obtuse ? 180 - base : base);
        const lo = fn === 'sin' ? (obtuse ? 90 : 0) : 0, hi = fn === 'sin' ? (obtuse ? 180 : 90) : 180;
        return { prompt: `Solve for ${X}, where ${lo}° &lt; ${X} &lt; ${hi}°. Round to the nearest tenth of a degree.${big(`${lhs} = ${N(val)}`)}`, type: 'number', answer: ans, unit: '°', tolerance: 0.05, params: { kind, fn, val, lo, hi },
          hints: [`Use the inverse function: ${M.sup(fn, '−1')}(${N(val)}) ≈ ${N(r1(base))}°.`, obtuse ? `That is acute, but ${X} must be between 90° and 180°. Sine is also positive in quadrant 2: 180° − ${N(r1(base))}°.` : `That angle is in the interval ${lo}° to ${hi}°.`, `${X} ≈ <b>${N(ans)}°</b>.`] };
      }
      const th = rng.pick([30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330]);
      const v = f(rad(th)), av = Math.abs(v), neg = v < 0;
      let eq;
      if (close(av, 0.5)) { const m = rng.nz(-5, 5); eq = `2 ${lhs} ${M.signed(m)} = ${N(Math.round(2 * v) + m)}`; }
      else if (close(av, Math.sqrt(3) / 2)) eq = `2 ${lhs} = ${neg ? '−' : ''}${M.sqrt(3)}`;
      else eq = `${M.sqrt(2)} ${lhs} = ${neg ? '−' : ''}1`;
      const ref = Math.min(th % 180, 180 - th % 180);
      const sols = []; for (let x = 0; x < 360; x++) if (close(f(rad(x)), v, 1e-9)) sols.push(x);
      const iso = `${lhs} = ${exactHtml(v)}`;
      if (kind === 'two') {
        const ans = Math.max(...sols);
        return { prompt: `Solve for ${X} in 0° ≤ ${X} &lt; 360°. There are two solutions; enter the larger one.${big(eq)}`, type: 'number', answer: ans, unit: '°', params: { kind, fn, v, lo: 0, hi: 360, big: true },
          hints: [`Isolate the function: ${iso}.`, `The reference angle is ${ref}°. ${fn === 'sin' ? 'Sine' : 'Cosine'} is ${neg ? 'negative' : 'positive'} in quadrants ${fn === 'sin' ? (neg ? '3 and 4' : '1 and 2') : (neg ? '2 and 3' : '1 and 4')}.`, `The solutions are ${sols.map(s => s + '°').join(' and ')}. The larger is <b>${ans}°</b>.`] };
      }
      const lo = Math.floor(th / 90) * 90, hi = lo + 90;
      return { prompt: `Solve for ${X}, where ${lo}° &lt; ${X} &lt; ${hi}°.${big(eq)}`, type: 'number', answer: th, unit: '°', params: { kind, fn, v, lo, hi },
        hints: [`Isolate the function: ${iso}.`, `The reference angle is ${ref}°, and the interval is quadrant ${lo / 90 + 1}.`, `In that quadrant the angle is ${lo === 0 ? `${ref}°` : lo === 90 ? `180° − ${ref}°` : lo === 180 ? `180° + ${ref}°` : `360° − ${ref}°`}, so ${X} = <b>${th}°</b>.`] };
    },
    verify(q) {
      const P = q.params, f = P.fn === 'sin' ? Math.sin : Math.cos, x = q.answer;
      if (P.kind === 'calc') return x > P.lo && x < P.hi && Math.abs(f(rad(x)) - P.val) < 0.002;
      const sols = []; for (let t = P.lo; t < P.hi; t += 0.5) if (t > P.lo || P.big) if (Math.abs(f(rad(t)) - P.v) < 1e-9) sols.push(t);
      return P.kind === 'two' ? sols.length === 2 && x === sols[1] : sols.length === 1 && x === sols[0];
    },
  });

  /* ---------- Unit 5: Non-right triangles ---------- */
  /** the triangle with side a = BC on the x-axis and angles B, C (degrees) at its ends: returns sides b, c */
  function buildAAS(a, B, C) {
    const t = a / (Math.cos(rad(B)) + Math.sin(rad(B)) * Math.cos(rad(C)) / Math.sin(rad(C)));     // distance from B to A
    return { c: t, b: t * Math.sin(rad(B)) / Math.sin(rad(C)) };
  }
  const heron = (a, b, c) => { const s = (a + b + c) / 2; return Math.sqrt(s * (s - a) * (s - b) * (s - c)); };
  function triFigure(lab) {
    return `<svg class="figure" viewBox="0 0 220 120" width="220" height="120" role="img" aria-label="triangle ABC"><polygon points="20,100 200,100 140,20" fill="none" stroke="currentColor" stroke-width="2"/>` +
      `<text x="8" y="112" font-size="14">A</text><text x="204" y="112" font-size="14">B</text><text x="136" y="14" font-size="14">C</text>` +
      `<text x="105" y="116" font-size="12">${lab.c || ''}</text><text x="176" y="58" font-size="12">${lab.a || ''}</text><text x="56" y="54" font-size="12">${lab.b || ''}</text></svg>`;
  }

  A.skill({
    id: 'int3.law-of-sines', title: 'The law of sines and triangle area',
    learn: p(`Label a triangle so side ${V('a')} is opposite angle ${V('A')}, ${V('b')} opposite ${V('B')}, and ${V('c')} opposite ${V('C')}. <b>The law of sines:</b> ${F(V('a'), `sin ${V('A')}`)} = ${F(V('b'), `sin ${V('B')}`)} = ${F(V('c'), `sin ${V('C')}`)}. Use it when you know an angle and the side opposite it.`) +
      p(`To find a side, set up the proportion and multiply. To find an angle, solve for its sine and use ${M.sup('sin', '−1')}. If you need the third angle, remember the angles add to 180°.`) +
      p(`<b>Area = ½${V('ab')} sin ${V('C')}</b>: two sides and the angle between them. The height to side ${V('a')} is ${V('b')} sin ${V('C')}, which is where both formulas come from.`) +
      example('Example', `${V('A')} = 40°, ${V('B')} = 75°, ${V('a')} = 10. Find ${V('b')}.${big(`${V('b')} = ${F(`10 sin 75°`, `sin 40°`)}`)}≈ ${F('9.659', '0.643')} ≈ <b>15.0</b>.`),
    make(rng) {
      const kind = rng.pick(['side', 'side3', 'angle', 'area']);
      if (kind === 'area') {
        const a = rng.int(4, 25), b = rng.int(4, 25), C = rng.pick([rng.int(20, 85), rng.int(95, 160)]);
        const ans = r1(0.5 * a * b * Math.sin(rad(C)));
        return { prompt: `In triangle ${V('ABC')}, ${V('a')} = ${a} cm, ${V('b')} = ${b} cm and the angle between them is ${V('C')} = ${C}°. Find the area. Round to the nearest tenth.${triFigure({ a: a, b: b })}`, type: 'number', answer: ans, unit: 'cm²', tolerance: 0.05, params: { kind, a, b, C },
          hints: [`Two sides and the included angle: Area = ½${V('ab')} sin ${V('C')}.`, `½ × ${a} × ${b} × sin ${C}° = ${N(a * b / 2)} × ${N(M.round(Math.sin(rad(C)), 4))}.`, `Area ≈ <b>${N(ans)} cm²</b>.`] };
      }
      if (kind === 'angle') {
        const Aa = rng.int(35, 120), a = rng.int(10, 30), b = rng.int(4, a - 2);
        const ans = r1(degOf(Math.asin(b * Math.sin(rad(Aa)) / a)));
        return { prompt: `In triangle ${V('ABC')}, ${V('A')} = ${Aa}°, ${V('a')} = ${a} and ${V('b')} = ${b}. Find angle ${V('B')}. Round to the nearest tenth of a degree.${triFigure({ a, b })}`, type: 'number', answer: ans, unit: '°', tolerance: 0.05, params: { kind, Aa, a, b },
          hints: [`Set up the law of sines: ${F(`sin ${V('B')}`, b)} = ${F(`sin ${Aa}°`, a)}.`, `sin ${V('B')} = ${F(`${b} sin ${Aa}°`, a)} ≈ ${N(M.round(b * Math.sin(rad(Aa)) / a, 4))}.`, `${V('b')} is shorter than ${V('a')}, so ${V('B')} is smaller than ${V('A')} and acute: ${V('B')} ≈ <b>${N(ans)}°</b>.`] };
      }
      const Aa = rng.int(30, 100), B = rng.int(25, 150 - Aa), C = 180 - Aa - B, a = rng.int(6, 30);
      if (kind === 'side') {
        const ans = r1(a * Math.sin(rad(B)) / Math.sin(rad(Aa)));
        return { prompt: `In triangle ${V('ABC')}, ${V('A')} = ${Aa}°, ${V('B')} = ${B}° and ${V('a')} = ${a}. Find ${V('b')}. Round to the nearest tenth.${triFigure({ a, b: V('b') + ' = ?' })}`, type: 'number', answer: ans, tolerance: 0.05, params: { kind, Aa, B, a },
          hints: [`You know ${V('A')} and the side opposite it, so use ${F(V('b'), `sin ${B}°`)} = ${F(a, `sin ${Aa}°`)}.`, `${V('b')} = ${F(`${a} sin ${B}°`, `sin ${Aa}°`)} ≈ ${F(N(M.round(a * Math.sin(rad(B)), 4)), N(M.round(Math.sin(rad(Aa)), 4)))}.`, `${V('b')} ≈ <b>${N(ans)}</b>.`] };
      }
      const ans = r1(a * Math.sin(rad(C)) / Math.sin(rad(Aa)));
      return { prompt: `In triangle ${V('ABC')}, ${V('A')} = ${Aa}°, ${V('B')} = ${B}° and ${V('a')} = ${a}. Find ${V('c')}. Round to the nearest tenth.${triFigure({ a, c: V('c') + ' = ?' })}`, type: 'number', answer: ans, tolerance: 0.05, params: { kind, Aa, B, a },
        hints: [`First find the third angle: ${V('C')} = 180° − ${Aa}° − ${B}° = ${C}°.`, `Law of sines: ${V('c')} = ${F(`${a} sin ${C}°`, `sin ${Aa}°`)}.`, `${V('c')} ≈ <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'area') { const c = Math.sqrt(P.a * P.a + P.b * P.b - 2 * P.a * P.b * Math.cos(rad(P.C))); return Math.abs(heron(P.a, P.b, c) - q.answer) <= 0.05 + 1e-9; }
      if (P.kind === 'angle') {
        // find c from a² = b² + c² − 2bc cos A (the positive root), then B from the law of cosines
        const ca = Math.cos(rad(P.Aa)), c = P.b * ca + Math.sqrt(P.a * P.a - P.b * P.b * (1 - ca * ca));
        const B = degOf(Math.acos((P.a * P.a + c * c - P.b * P.b) / (2 * P.a * c)));
        return Math.abs(B - q.answer) <= 0.05 + 1e-9;
      }
      const t = buildAAS(P.a, P.B, 180 - P.Aa - P.B);
      return Math.abs((P.kind === 'side' ? t.b : t.c) - q.answer) <= 0.05 + 1e-9;
    },
  });

  A.skill({
    id: 'int3.law-of-cosines', title: 'The law of cosines',
    learn: p(`When you know two sides and the angle between them, or all three sides, the law of sines cannot get started. Use <b>the law of cosines: ${M.sup(V('c'), 2)} = ${M.sup(V('a'), 2)} + ${M.sup(V('b'), 2)} − 2${V('ab')} cos ${V('C')}</b>.`) +
      p(`It is the Pythagorean theorem with a correction term: when ${V('C')} = 90°, cos ${V('C')} = 0 and the correction disappears. To find an angle from three sides, rearrange: cos ${V('C')} = ${F(`${M.sup(V('a'), 2)} + ${M.sup(V('b'), 2)} − ${M.sup(V('c'), 2)}`, `2${V('ab')}`)}. A negative cosine means the angle is obtuse.`) +
      example('Example', `${V('a')} = 7, ${V('b')} = 9, ${V('C')} = 50°. Find ${V('c')}.${big(`${M.sup(V('c'), 2)} = 49 + 81 − 126 cos 50° ≈ 49.0`)}${V('c')} ≈ √49.0 ≈ <b>7.0</b>.`),
    make(rng) {
      const kind = rng.pick(['side', 'side', 'angle']);
      if (kind === 'side') {
        const a = rng.int(4, 25), b = rng.int(4, 25), C = rng.int(25, 150);
        const c2 = a * a + b * b - 2 * a * b * Math.cos(rad(C)), ans = r1(Math.sqrt(c2));
        const ctx = rng.bool() ? null : rng.pick(NAMES);
        const prompt = ctx ? `${ctx} walks ${a} m along one side of a field, turns, and walks ${b} m along a second path. The angle between the two paths is ${C}°. How far is ${ctx} from the start, in a straight line? Round to the nearest tenth.`
          : `In triangle ${V('ABC')}, ${V('a')} = ${a}, ${V('b')} = ${b} and ${V('C')} = ${C}°. Find ${V('c')}. Round to the nearest tenth.${triFigure({ a, b, c: V('c') + ' = ?' })}`;
        return { prompt, type: 'number', answer: ans, unit: ctx ? 'm' : undefined, tolerance: 0.05, params: { kind, a, b, C },
          hints: [`Two sides and the angle between them: ${M.sup(V('c'), 2)} = ${a}² + ${b}² − 2(${a})(${b}) cos ${C}°.`, `= ${a * a + b * b} − ${2 * a * b}(${N(M.round(Math.cos(rad(C)), 4))}) ≈ ${N(M.round(c2, 2))}.`, `Take the square root: <b>${N(ans)}</b>.`] };
      }
      let a, b, c;
      do { a = rng.int(4, 20); b = rng.int(4, 20); c = rng.int(4, 20); } while (a + b <= c + 1 || a + c <= b + 1 || b + c <= a + 1);
      const cosC = (a * a + b * b - c * c) / (2 * a * b), ans = r1(degOf(Math.acos(cosC)));
      return { prompt: `A triangle has sides ${V('a')} = ${a}, ${V('b')} = ${b} and ${V('c')} = ${c}. Find angle ${V('C')}, the angle opposite side ${V('c')}. Round to the nearest tenth of a degree.${triFigure({ a, b, c })}`, type: 'number', answer: ans, unit: '°', tolerance: 0.05, params: { kind, a, b, c },
        hints: [`Rearrange the law of cosines: cos ${V('C')} = ${F(`${a}² + ${b}² − ${c}²`, `2(${a})(${b})`)}.`, `cos ${V('C')} = ${F(a * a + b * b - c * c, 2 * a * b, { raw: true })} ≈ ${N(M.round(cosC, 4))}${cosC < 0 ? ', which is negative, so the angle is obtuse' : ''}.`, `${V('C')} = ${M.sup('cos', '−1')}(${N(M.round(cosC, 4))}) ≈ <b>${N(ans)}°</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'side') { const bx = P.b * Math.cos(rad(P.C)), by = P.b * Math.sin(rad(P.C)); return Math.abs(Math.hypot(bx - P.a, by) - q.answer) <= 0.05 + 1e-9; }
      const s = Math.min(1, 2 * heron(P.a, P.b, P.c) / (P.a * P.b)), acute = Math.asin(s) * 180 / Math.PI;
      const C = P.c * P.c > P.a * P.a + P.b * P.b ? 180 - acute : acute;
      return Math.abs(C - q.answer) <= 0.05 + 1e-9;
    },
  });

  /* ---------- Unit 6: Sequences and series ---------- */
  const sigma = (n, body) => `<span class="sigma">∑<sub>${V('k')} = 1</sub><sup>${n}</sup></span> (${body})`;

  A.skill({
    id: 'int3.arithmetic-series', title: 'Arithmetic series',
    learn: p(`An arithmetic sequence adds the same difference ${V('d')} each time. Its ${V('n')}th term is ${M.sub(V('a'), V('n'))} = ${M.sub(V('a'), 1)} + (${V('n')} − 1)${V('d')}.`) +
      p(`<b>The sum of the first ${V('n')} terms is ${M.sub(V('S'), V('n'))} = ${F(V('n'), 2)}(${M.sub(V('a'), 1)} + ${M.sub(V('a'), V('n'))})</b>: the number of terms times the average of the first and last. Pairing the first and last, the second and second-to-last, and so on gives equal sums each time.`) +
      p(`If you are given the last term instead of ${V('n')}, solve ${M.sub(V('a'), 1)} + (${V('n')} − 1)${V('d')} = last for ${V('n')} first. Sigma notation ${sigma(V('n'), '…')} means “add the expression for ${V('k')} = 1, 2, …, ${V('n')}”.`) +
      example('Example', `${big('5 + 9 + 13 + … + 41')}${V('d')} = 4, and 5 + 4(${V('n')} − 1) = 41 gives ${V('n')} = 10. ${M.sub(V('S'), 10)} = ${F(10, 2, { raw: true })}(5 + 41) = 5 × 46 = <b>230</b>.`),
    make(rng) {
      const kind = rng.pick(['sum', 'list', 'sigma', 'seats']);
      const a1 = rng.int(-10, 20), d = rng.nz(-5, 8), n = rng.int(8, 30);
      const last = a1 + (n - 1) * d, S = n * (a1 + last) / 2;
      const steps = [`The last term is ${M.sub(V('a'), n)} = ${N(a1)} + ${n - 1}(${N(d)}) = ${N(last)}.`, `${M.sub(V('S'), n)} = ${F(n, 2, { raw: true })}(${N(a1)} + ${pw(last)}) = ${F(n, 2, { raw: true })} × ${N(a1 + last)}.`, `The sum is <b>${N(S)}</b>.`];
      if (kind === 'list') {
        const shown = [a1, a1 + d, a1 + 2 * d].map(N).join(' + ').replace(/\+ −/g, '+ (−').replace(/\(−(\d+)/g, '(−$1)');
        return { prompt: `Find the sum.${big(`${shown} + … + ${pw(last)}`)}`, type: 'number', answer: S, params: { a1, d, n },
          hints: [`The common difference is ${N(d)}. Find how many terms: ${N(a1)} + (${V('n')} − 1)(${N(d)}) = ${N(last)} gives ${V('n')} − 1 = ${n - 1}, so ${V('n')} = ${n}.`, steps[1], steps[2]] };
      }
      if (kind === 'sigma') {
        const pp = rng.nz(-4, 6), qq = rng.int(-9, 9);
        const s1 = pp + qq, sl = pp * n + qq, Ss = n * (s1 + sl) / 2;
        return { prompt: `Evaluate.${big(sigma(n, M.poly([pp, qq], 'k')))}`, type: 'number', answer: Ss, params: { a1: s1, d: pp, n },
          hints: [`The terms form an arithmetic sequence. The first (${V('k')} = 1) is ${N(s1)} and the last (${V('k')} = ${n}) is ${N(sl)}.`, `There are ${n} terms, so the sum is ${F(n, 2, { raw: true })}(${N(s1)} + ${pw(sl)}).`, `${F(n, 2, { raw: true })} × ${N(s1 + sl)} = <b>${N(Ss)}</b>.`] };
      }
      if (kind === 'seats') {
        const r = rng.int(10, 30), dd = rng.int(1, 4), rows = rng.int(10, 25), lr = r + (rows - 1) * dd, tot = rows * (r + lr) / 2;
        return { prompt: `The front row of a theatre has ${r} seats, and each row behind it has ${dd} more seat${dd > 1 ? 's' : ''} than the row in front. There are ${rows} rows. How many seats are there in all?`, type: 'number', answer: tot, unit: 'seats', params: { a1: r, d: dd, n: rows },
          hints: [`The row sizes are arithmetic: ${r}, ${r + dd}, ${r + 2 * dd}, …. The last row has ${r} + ${rows - 1} × ${dd} = ${lr} seats.`, `Total = ${F(rows, 2, { raw: true })}(${r} + ${lr}).`, `That is <b>${N(tot)}</b> seats.`] };
      }
      return { prompt: `An arithmetic sequence has first term ${N(a1)} and common difference ${N(d)}. Find the sum of its first ${n} terms.`, type: 'number', answer: S, params: { a1, d, n }, hints: steps };
    },
    verify(q) { const { a1, d, n } = q.params; let s = 0; for (let k = 0; k < n; k++) s += a1 + k * d; return s === q.answer; },
  });

  A.skill({
    id: 'int3.geometric-series', title: 'Geometric series',
    learn: p(`A geometric sequence multiplies by the same ratio ${V('r')} each time: ${M.sub(V('a'), V('n'))} = ${M.sub(V('a'), 1)}${M.sup(V('r'), `${V('n')} − 1`)}.`) +
      p(`<b>The sum of the first ${V('n')} terms is ${M.sub(V('S'), V('n'))} = ${F(`${M.sub(V('a'), 1)}(1 − ${M.sup(V('r'), V('n'))})`, `1 − ${V('r')}`)}</b>. It comes from writing out ${M.sub(V('S'), V('n'))} and ${V('r')}${M.sub(V('S'), V('n'))} and subtracting: almost every term cancels.`) +
      p(`When |${V('r')}| &lt; 1 the terms shrink toward zero and ${M.sup(V('r'), V('n'))} vanishes, so the <b>infinite sum</b> is ${F(M.sub(V('a'), 1), `1 − ${V('r')}`)}. When |${V('r')}| ≥ 1 an infinite sum has no value.`) +
      example('Example', `${big('3 + 6 + 12 + … (8 terms)')}${V('r')} = 2, so ${M.sub(V('S'), 8)} = ${F('3(1 − 2<sup>8</sup>)', '1 − 2')} = ${F('3(−255)', '−1')} = <b>765</b>.`),
    make(rng) {
      const kind = rng.pick(['sum', 'sigma', 'infinite', 'infinite', 'savings']);
      if (kind === 'infinite') {
        const [rn, rd] = rng.pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [-1, 2], [-1, 3], [1, 5], [2, 5]]);
        const a1 = rng.int(1, 12) * rd * rd;               // keeps the shown terms whole
        const [sn, sd] = M.simp(a1 * rd, rd - rn), terms = [a1, a1 * rn / rd, a1 * rn * rn / (rd * rd)];
        const shown = terms.map(N).join(' + ').replace(/\+ −/g, '− ');
        return { prompt: `Find the sum of the infinite geometric series.${big(`${shown} + …`)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, a1, r: rn / rd },
          hints: [`The ratio is ${V('r')} = ${N(terms[1])} ÷ ${N(a1)} = ${F(rn, rd)}. Since |${V('r')}| &lt; 1, the sum exists.`, `${V('S')} = ${F(M.sub(V('a'), 1), `1 − ${V('r')}`)} = ${F(N(a1), `1 − (${M.fracText(rn, rd)})`)} = ${F(N(a1), F(rd - rn, rd))}.`, `${V('S')} = <b>${M.fracText(sn, sd)}</b>.`] };
      }
      const r = rng.pick([2, 3, -2, -3, 2, 4]), n = rng.int(4, r === 4 || Math.abs(r) === 3 ? 6 : 9), a1 = rng.nz(-5, 6);
      const S = a1 * (1 - r ** n) / (1 - r);
      const work = [`Use ${M.sub(V('S'), n)} = ${F(`${pw(a1)}(1 − ${M.sup(pw(r), n)})`, `1 − ${pw(r)}`)}.`, `${M.sup(pw(r), n)} = ${N(r ** n)}, so ${M.sub(V('S'), n)} = ${F(`${pw(a1)}(${N(1 - r ** n)})`, N(1 - r))}.`, `The sum is <b>${N(S)}</b>.`];
      if (kind === 'sigma') {
        return { prompt: `Evaluate.${big(sigma(n, `${N(a1)} · ${M.sup(pw(r), `${V('k')} − 1`)}`))}`, type: 'number', answer: S, params: { kind, a1, r, n },
          hints: [`This is a geometric series with first term ${N(a1)} (at ${V('k')} = 1), ratio ${N(r)}, and ${n} terms.`].concat(work) };
      }
      if (kind === 'savings') {
        const name = rng.pick(NAMES), s1 = rng.pick([1, 2, 3, 5]), wk = rng.int(5, 10), tot = s1 * (2 ** wk - 1);
        return { prompt: `${name} saves ${M.money(s1)} in week 1 and doubles the amount saved each week after. How much has ${name} saved in total after ${wk} weeks?`, type: 'number', answer: tot, unit: '$', params: { kind, a1: s1, r: 2, n: wk },
          hints: [`The weekly amounts are geometric: ${M.money(s1)}, ${M.money(2 * s1)}, ${M.money(4 * s1)}, … with ${V('r')} = 2.`, `${M.sub(V('S'), wk)} = ${F(`${s1}(1 − ${M.sup(2, wk)})`, '1 − 2')} = ${s1}(${M.sup(2, wk)} − 1) = ${s1} × ${2 ** wk - 1}.`, `${name} has saved <b>${M.money(tot)}</b>.`] };
      }
      const shown = [a1, a1 * r, a1 * r * r].map(N).join(', ');
      return { prompt: `The geometric sequence ${shown}, … continues. Find the sum of its first ${n} terms.`, type: 'number', answer: S, params: { kind, a1, r, n },
        hints: [`The ratio is ${V('r')} = ${N(a1 * r)} ÷ ${pw(a1)} = ${N(r)}.`].concat(work) };
    },
    verify(q) {
      const P = q.params;
      let s = 0, t = P.a1;
      const terms = P.kind === 'infinite' ? 400 : P.n;
      for (let k = 0; k < terms; k++) { s += t; t *= P.r; }
      return close(s, q.answer, P.kind === 'infinite' ? 1e-6 : 1e-9);
    },
  });

  /* ---------- Unit 7: Statistics ---------- */
  const RULE_CDF = { '-3': 0.15, '-2': 2.5, '-1': 16, 0: 50, 1: 84, 2: 97.5, 3: 99.85 };      // percent below μ + kσ
  const SEG = [0.15, 2.35, 13.5, 34, 34, 13.5, 2.35, 0.15];                                 // below −3σ, …, above 3σ
  A.skill({
    id: 'int3.normal-distribution', title: 'The normal distribution and z-scores',
    learn: p(`A normal distribution is the symmetric bell curve, centred on the mean μ with spread σ. <b>The 68–95–99.7 rule:</b> about 68% of values lie within 1σ of the mean, 95% within 2σ, and 99.7% within 3σ.`) +
      p(`Halving those gives the pieces: 34% between μ and μ + σ, 13.5% between σ and 2σ, 2.35% between 2σ and 3σ, and 0.15% beyond 3σ, the same on each side. Add pieces to answer “what percent is between…” questions.`) +
      p(`<b>A z-score counts standard deviations from the mean: ${V('z')} = ${F(`${V('x')} − μ`, 'σ')}</b>. It lets you compare values from different distributions: the larger z is the more unusual (higher) result.`) +
      example('Example', `Heights have μ = 160 cm and σ = 8 cm. What percent are between 152 and 176?${big('152 = μ − σ, &nbsp; 176 = μ + 2σ')}34% + 34% + 13.5% = <b>81.5%</b>.`),
    make(rng) {
      const kind = rng.pick(['rule', 'rule', 'z', 'fromz', 'compare']);
      const ctx = rng.pick([{ what: 'adult heights', unit: 'cm', mu: [150, 180], sd: [5, 10] }, { what: 'scores on a test', unit: 'points', mu: [60, 80], sd: [4, 12] }, { what: 'apple weights', unit: 'g', mu: [140, 200], sd: [8, 20] }, { what: 'battery lifetimes', unit: 'hours', mu: [30, 60], sd: [2, 6] }]);
      const mu = rng.int(...ctx.mu), sd = rng.int(...ctx.sd) * (kind === 'z' ? 2 : 1);
      const intro = `${ctx.what.charAt(0).toUpperCase() + ctx.what.slice(1)} are normally distributed with mean ${mu} ${ctx.unit} and standard deviation ${sd} ${ctx.unit}.`;
      if (kind === 'rule') {
        const form = rng.pick(['between', 'between', 'above', 'below']);
        let k1, k2;
        if (form === 'between') { [k1, k2] = rng.sample([-3, -2, -1, 0, 1, 2, 3], 2).sort((x, y) => x - y); }
        else if (form === 'above') { k1 = rng.int(-2, 3); k2 = 4; } else { k1 = -4; k2 = rng.int(-3, 2); }
        const cdf = k => k <= -4 ? 0 : k >= 4 ? 100 : RULE_CDF[k];
        const ans = M.round(cdf(k2) - cdf(k1), 2);
        const at = k => mu + k * sd, zl = k => k === 0 ? 'μ' : `μ ${k > 0 ? '+' : '−'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}σ`;
        const ask = form === 'between' ? `between ${at(k1)} and ${at(k2)} ${ctx.unit}` : form === 'above' ? `above ${at(k1)} ${ctx.unit}` : `below ${at(k2)} ${ctx.unit}`;
        return { prompt: `${intro} Use the 68–95–99.7 rule: about what percent are ${ask}?`, type: 'number', answer: ans, unit: '%', params: { kind, k1, k2 },
          hints: [`Turn the values into standard deviations from the mean: ${form !== 'below' ? `${at(k1)} = ${zl(k1)}` : ''}${form === 'between' ? ' and ' : ''}${form !== 'above' ? `${at(k2)} = ${zl(k2)}` : ''}.`,
            `Add the pieces of the curve in that range: ${SEG.slice(k1 + 4, k2 + 4).map(s => N(s) + '%').join(' + ')}.`, `That is <b>${N(ans)}%</b>.`] };
      }
      if (kind === 'z' || kind === 'fromz') {
        const z = rng.pick([-2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3]), x = mu + z * sd;
        if (kind === 'z') return { prompt: `${intro} What is the z-score of a value of ${N(x)} ${ctx.unit}?`, type: 'number', answer: z, params: { kind, mu, sd, x },
          hints: [`${V('z')} = ${F(`${V('x')} − μ`, 'σ')} = ${F(`${N(x)} − ${mu}`, sd)}.`, `${N(x)} − ${mu} = ${N(x - mu)}, and ${N(x - mu)} ÷ ${sd} = ${N(z)}.`, `${V('z')} = <b>${N(z)}</b>.`] };
        return { prompt: `${intro} What value has a z-score of ${N(z)}?`, type: 'number', answer: x, unit: ctx.unit, params: { kind, mu, sd, z },
          hints: [`Solve ${V('z')} = ${F(`${V('x')} − μ`, 'σ')} for ${V('x')}: ${V('x')} = μ + ${V('z')}σ.`, `${V('x')} = ${mu} + ${pw(z)}(${sd}) = ${mu} ${M.signed(z * sd)}.`, `${V('x')} = <b>${N(x)}</b> ${ctx.unit}.`] };
      }
      const [n1, n2] = rng.sample(NAMES, 2);
      const m1 = rng.int(60, 80), s1 = rng.int(4, 10), m2 = rng.int(60, 80), s2 = rng.int(4, 10);
      let x1 = m1 + rng.int(2, 15), x2 = m2 + rng.int(2, 15);
      if (close((x1 - m1) / s1, (x2 - m2) / s2, 0.05)) x2 += 3;
      const z1 = (x1 - m1) / s1, z2 = (x2 - m2) / s2, answer = z1 > z2 ? n1 : n2;
      return { prompt: `${n1} scored ${x1} on a history test with mean ${m1} and standard deviation ${s1}. ${n2} scored ${x2} on a science test with mean ${m2} and standard deviation ${s2}. Who did better compared with their class?`, type: 'choice', choices: [n1, n2, 'They did equally well'], answer, params: { kind, x1, m1, s1, x2, m2, s2, n1, n2 },
        hints: [`Compare z-scores, not raw scores. ${n1}: ${F(`${x1} − ${m1}`, s1)} ≈ ${N(r2(z1))}.`, `${n2}: ${F(`${x2} − ${m2}`, s2)} ≈ ${N(r2(z2))}.`, `The larger z-score belongs to <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'rule') return close(SEG.slice(P.k1 + 4, P.k2 + 4).reduce((s, x) => s + x, 0), q.answer, 1e-9);
      if (P.kind === 'z') return close(P.mu + q.answer * P.sd, P.x);
      if (P.kind === 'fromz') return close((q.answer - P.mu) / P.sd, P.z);
      return q.answer === ((P.x1 - P.m1) * P.s2 > (P.x2 - P.m2) * P.s1 ? P.n1 : P.n2);
    },
  });

  const METHODS = ['Simple random sample', 'Stratified sample', 'Cluster sample', 'Systematic sample', 'Convenience sample'];
  A.skill({
    id: 'int3.margin-of-error', title: 'Sampling and margin of error',
    learn: p(`How a sample is chosen matters. In a <b>simple random sample</b> every group of the same size is equally likely. A <b>stratified</b> sample splits the population into groups and picks randomly from each; a <b>cluster</b> sample picks whole groups at random; a <b>systematic</b> sample takes every ${V('k')}th member of a list; a <b>convenience</b> sample takes whoever is easy to reach, and is usually biased.`) +
      p(`A sample proportion ${V('p̂')} only estimates the true proportion. <b>For 95% confidence, the margin of error is about ${V('z')}* ${M.sqrt(F(`${V('p̂')}(1 − ${V('p̂')})`, V('n')))} with ${V('z')}* = 1.96</b>. The interval ${V('p̂')} ± margin is likely to contain the truth. Bigger samples give smaller margins; four times the sample halves the margin.`) +
      example('Example', `In a sample of 400, 55% said yes.${big(`1.96 × ${M.sqrt(F('0.55 × 0.45', 400))} ≈ 0.049`)}The margin of error is about <b>4.9 percentage points</b>, so the interval is 50.1% to 59.9%.`),
    make(rng) {
      const kind = rng.pick(['moe', 'moe', 'interval', 'method', 'method']);
      const name = rng.pick(NAMES);
      if (kind === 'method') {
        const m = rng.int(0, 4), k = rng.int(3, 12), total = rng.int(20, 60) * 10;
        const what = rng.pick(['students at a school', 'members of a sports club', 'people who live in a town']);
        const desc = [
          `puts the names of all ${total} ${what} in a computer and has it choose ${k * 5} at random`,
          `splits the ${what} into age groups and chooses ${k} people at random from each group`,
          `divides the ${what} into ${k * 4} similar teams, picks ${Math.max(2, Math.round(k / 3))} teams at random, and surveys everyone on them`,
          `lists all ${total} ${what} alphabetically, picks a random start, and then surveys every ${M.ordinal(k)} person`,
          `surveys the first ${k * 5} of the ${what} who walk past ${name.endsWith('s') ? name + '’' : name + '’s'} table`,
        ][m];
        return { prompt: `${name} wants to survey the ${what}. ${name} ${desc}. What kind of sample is this?`, type: 'choice', choices: METHODS.slice(), answer: METHODS[m], params: { kind, m },
          hints: [`Ask how the people were chosen: by chance from everyone, by chance within groups, whole groups at once, by position in a list, or by who was easy to reach.`, ['Everyone had the same chance, and any group of that size could be chosen.', 'The population was split into groups and every group is represented.', 'Whole groups were chosen, and everyone in them was surveyed.', 'People were taken at a fixed spacing down a list.', 'Only people who happened to be nearby were asked.'][m], `It is a <b>${METHODS[m].toLowerCase()}</b>.`] };
      }
      const n = rng.pick([100, 200, 250, 400, 500, 600, 800, 1000, 1200, 1500, 2000]), ph = rng.int(25, 75);
      const moe = 1.96 * Math.sqrt(ph / 100 * (1 - ph / 100) / n) * 100;
      if (kind === 'moe') {
        const ans = r1(moe);
        return { prompt: `In a random sample of ${N(n)} voters, ${ph}% support a new park. Find the margin of error for 95% confidence, using ${V('z')}* = 1.96. Give it in percentage points, rounded to the nearest tenth.`, type: 'number', answer: ans, unit: '%', tolerance: 0.05, params: { kind, n, ph },
          hints: [`Use ${V('p̂')} = ${N(ph / 100)} and ${V('n')} = ${N(n)}: margin = 1.96 ${M.sqrt(F(`${N(ph / 100)} × ${N(1 - ph / 100)}`, N(n)))}.`, `${N(ph / 100)} × ${N(M.round(1 - ph / 100, 2))} ÷ ${N(n)} ≈ ${N(M.round(ph / 100 * (1 - ph / 100) / n, 7))}; its square root is ≈ ${N(M.round(Math.sqrt(ph / 100 * (1 - ph / 100) / n), 5))}.`, `Times 1.96 is ≈ ${N(M.round(moe / 100, 4))}, which is <b>${N(ans)} percentage points</b>.`] };
      }
      const me = rng.pick([2, 2.5, 3, 3.5, 4, 4.5, 5]), upper = rng.bool();
      const ans = M.round(ph + (upper ? me : -me), 1);
      return { prompt: `A poll reports that ${ph}% of residents want later library hours, with a margin of error of ${N(me)} percentage points. What is the ${upper ? 'upper' : 'lower'} end of the confidence interval?`, type: 'number', answer: ans, unit: '%', params: { kind, ph, me, upper },
        hints: [`The interval is the estimate plus or minus the margin: ${ph}% ± ${N(me)}%.`, `${upper ? 'Add' : 'Subtract'}: ${ph} ${upper ? '+' : '−'} ${N(me)} = ${N(ans)}.`, `The ${upper ? 'upper' : 'lower'} end is <b>${N(ans)}%</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'method') return q.answer === METHODS[P.m];
      if (P.kind === 'moe') { const se = Math.pow(P.ph * (100 - P.ph) / P.n, 0.5); return Math.abs(1.96 * se - q.answer) <= 0.05 + 1e-9; }    // in percent units directly
      const lo = P.ph - P.me, hi = P.ph + P.me;
      return close(q.answer, P.upper ? hi : lo);
    },
  });

  /* ---------- Unit 8: 3D geometry ---------- */
  const SHAPES = ['circle', 'ellipse', 'square', 'rectangle', 'triangle', 'trapezoid'];
  const SOLIDS = { cube: { base: 'square', side: 'square' }, box: { base: 'rectangle', side: 'rectangle' }, cylinder: { base: 'circle', side: 'rectangle', round: true }, cone: { base: 'circle', side: 'triangle', round: true }, pyramid: { base: 'square', side: 'triangle' }, tprism: { base: 'triangle', side: 'rectangle' }, sphere: { base: 'circle', side: 'circle', round: true } };
  const SOLID_NAME = { cube: 'a cube', box: 'a rectangular box that is not a cube', cylinder: 'a cylinder', cone: 'a cone', pyramid: 'a square pyramid', tprism: 'a triangular prism', sphere: 'a sphere' };
  const CUT_TEXT = { base: 'parallel to its base', side: 'perpendicular to its base, through its centre', tilt: 'at a slant, without touching the base' };
  const SPINS = [['a rectangle', 'one of its sides', 'cylinder'], ['a right triangle', 'one of its legs', 'cone'], ['a semicircle', 'its diameter', 'sphere'], ['a right trapezoid', 'its side that is perpendicular to both bases', 'frustum (a cone with its top cut off)']];
  A.skill({
    id: 'int3.cross-sections', title: 'Cross-sections and solids of revolution',
    learn: p('A <b>cross-section</b> is the flat shape you see when a plane slices through a solid. <b>A slice parallel to the base of a prism, cylinder, pyramid or cone has the same shape as the base</b> (smaller, for a pyramid or cone). A slice straight down through the centre shows the solid’s side profile: a rectangle for a prism or cylinder, a triangle for a pyramid or cone.') +
      p('Every slice of a sphere is a circle. A slanted slice through a cylinder or cone that misses the base is an <b>ellipse</b>.') +
      p('Spinning a flat shape around a line sweeps out a <b>solid of revolution</b>: a rectangle spun about one side makes a cylinder, a right triangle spun about a leg makes a cone, and a semicircle spun about its diameter makes a sphere.') +
      example('Example', 'A cone is sliced straight down through its tip and the centre of its base. The slice cuts the base along a diameter and meets the tip, so it is a <b>triangle</b>.'),
    make(rng) {
      if (rng.chance(0.3)) {
        const [shape, axis, solid] = rng.pick(SPINS);
        const pool = ['cylinder', 'cone', 'sphere', 'frustum (a cone with its top cut off)', 'pyramid', 'prism'];
        const choices = options(solid, rng.shuffle(pool.filter(s => s !== solid)));
        return { prompt: `${shape.charAt(0).toUpperCase() + shape.slice(1)} is spun all the way around ${axis}. What solid does it sweep out?`, type: 'choice', choices, answer: solid, params: { spin: shape },
          hints: ['Picture the shape turning around the line, like a door on a hinge. Each point traces a circle around the line.', `The edge that is not on the line sweeps out the curved surface, and the result is a <b>${solid}</b>.`] };
      }
      const solid = rng.pick(Object.keys(SOLIDS)), S = SOLIDS[solid];
      const cuts = solid === 'sphere' ? ['base'] : S.round ? ['base', 'side', 'tilt'] : ['base', 'side'];
      const cut = rng.pick(cuts);
      const answer = cut === 'tilt' ? 'ellipse' : S[cut];
      const choices = options(answer, rng.shuffle(SHAPES.filter(s => s !== answer)));
      const how = solid === 'sphere' ? rng.pick(['by any flat plane', 'by a plane that misses its centre', 'by a plane through its centre']) : CUT_TEXT[cut];
      return { prompt: `${SOLID_NAME[solid].charAt(0).toUpperCase() + SOLID_NAME[solid].slice(1)} is sliced ${how}. What is the shape of the cross-section?`, type: 'choice', choices, answer, params: { solid, cut },
        hints: [cut === 'base' ? 'A slice parallel to the base copies the shape of the base.' : cut === 'side' ? 'A slice straight down through the centre shows the side profile of the solid.' : 'A slanted slice through a round solid stretches the circle in one direction.',
          `So the cross-section is ${answer === 'ellipse' ? 'an' : 'a'} <b>${answer}</b>.`] };
    },
    verify(q) {
      const P = q.params;
      if (P.spin) return { 'a rectangle': 'cylinder', 'a right triangle': 'cone', 'a semicircle': 'sphere', 'a right trapezoid': 'frustum (a cone with its top cut off)' }[P.spin] === q.answer;
      // a second description: what the solid looks like from above (base) and from the side (profile)
      const top = { cube: 'square', box: 'rectangle', cylinder: 'circle', cone: 'circle', pyramid: 'square', tprism: 'triangle', sphere: 'circle' }[P.solid];
      const front = { cube: 'square', box: 'rectangle', cylinder: 'rectangle', cone: 'triangle', pyramid: 'triangle', tprism: 'rectangle', sphere: 'circle' }[P.solid];
      return q.answer === (P.cut === 'tilt' ? 'ellipse' : P.cut === 'base' ? top : front);
    },
  });

  A.skill({
    id: 'int3.volume-cavalieri', title: 'Volume and Cavalieri’s principle',
    learn: p(`<b>Cavalieri’s principle:</b> if two solids have the same height and every horizontal slice of one has the same area as the matching slice of the other, the solids have the same volume. That is why a slanted (oblique) stack of coins has the same volume as a straight one, and why an oblique cylinder still has volume π${M.sup(V('r'), 2)}${V('h')}, with ${V('h')} the <b>perpendicular</b> height, not the slant length.`) +
      p(`<b>Prism or cylinder: ${V('V')} = ${V('Bh')}</b> (base area times height). <b>Pyramid or cone: ${V('V')} = ${F(1, 3)}${V('Bh')}</b>. <b>Sphere: ${V('V')} = ${F(4, 3)}π${M.sup(V('r'), 3)}</b>.`) +
      example('Example', `A cone has radius 3 cm and height 10 cm.${big(`${V('V')} = ${F(1, 3)} × π × 3² × 10 = 30π`)}≈ <b>94.2 cm³</b>.`),
    make(rng) {
      const kind = rng.pick(['cylinder', 'cone', 'sphere', 'pyramid', 'oblique', 'coins']);
      if (kind === 'coins') {
        const [n1, n2] = rng.sample(NAMES, 2), k = rng.int(10, 40);
        const opts = ['They have the same volume.', `${n1}’s stack has more volume.`, `${n2}’s stack has more volume.`];
        return { prompt: `${n1} and ${n2} each stack ${k} identical coins. ${n1}’s stack is perfectly straight; ${n2}’s leans to one side. How do the volumes compare?`, type: 'choice', choices: opts, answer: opts[0], params: { kind, k },
          hints: ['Compare the stacks slice by slice: at every height, each slice is one whole coin.', 'Same height and the same slice areas at every level, so Cavalieri’s principle applies.', `<b>They have the same volume.</b>`] };
      }
      const r = rng.int(2, 12), h = rng.int(3, 20);
      let ans, what, hints;
      if (kind === 'cylinder' || kind === 'oblique') {
        ans = r1(Math.PI * r * r * h);
        const slant = r1(Math.sqrt(h * h + rng.int(2, 8) ** 2));
        what = kind === 'cylinder' ? `a cylinder with radius ${r} cm and height ${h} cm` : `an oblique cylinder with radius ${r} cm. Its perpendicular height is ${h} cm and its slanted side is ${N(slant)} cm long`;
        hints = [kind === 'oblique' ? `By Cavalieri’s principle an oblique cylinder has the same volume as a straight one with the same perpendicular height. Ignore the slant length.` : `Use ${V('V')} = π${M.sup(V('r'), 2)}${V('h')}.`, `${V('V')} = π × ${r}² × ${h} = ${r * r * h}π.`, `${r * r * h}π ≈ <b>${N(ans)} cm³</b>.`];
      } else if (kind === 'cone') {
        ans = r1(Math.PI * r * r * h / 3);
        what = `a cone with radius ${r} cm and height ${h} cm`;
        hints = [`Use ${V('V')} = ${F(1, 3)}π${M.sup(V('r'), 2)}${V('h')}.`, `${V('V')} = ${F(1, 3)} × π × ${r}² × ${h} = ${F(r * r * h, 3)}π.`, `≈ <b>${N(ans)} cm³</b>.`];
      } else if (kind === 'sphere') {
        ans = r1(4 / 3 * Math.PI * r ** 3);
        what = `a sphere with radius ${r} cm`;
        hints = [`Use ${V('V')} = ${F(4, 3)}π${M.sup(V('r'), 3)}.`, `${r}³ = ${r ** 3}, so ${V('V')} = ${F(4 * r ** 3, 3)}π.`, `≈ <b>${N(ans)} cm³</b>.`];
      } else {
        ans = r1(r * r * h / 3);
        what = `a pyramid with a square base ${r} cm on each side and height ${h} cm`;
        hints = [`Use ${V('V')} = ${F(1, 3)}${V('Bh')}, where ${V('B')} is the base area.`, `${V('B')} = ${r}² = ${r * r} cm², so ${V('V')} = ${F(1, 3)} × ${r * r} × ${h}.`, `${V('V')} ≈ <b>${N(ans)} cm³</b>.`];
      }
      return { prompt: `Find the volume of ${what}. Round to the nearest tenth.`, type: 'number', answer: ans, unit: 'cm³', tolerance: Math.max(0.05, M.round(ans * 0.004, 2)), params: { kind, r, h },
        hints };
    },
    verify(q) {
      const P = q.params;
      if (P.kind === 'coins') return q.answer.startsWith('They have the same');
      // Cavalieri in action: add up thin horizontal slices
      const { r, h } = P, n = 4000;
      let area, lo = 0, hi = h;
      if (P.kind === 'cylinder' || P.kind === 'oblique') area = () => Math.PI * r * r;
      else if (P.kind === 'cone') area = y => Math.PI * Math.pow(r * (1 - y / h), 2);
      else if (P.kind === 'pyramid') area = y => Math.pow(r * (1 - y / h), 2);
      else { area = y => Math.PI * (r * r - y * y); lo = -r; hi = r; }
      let v = 0; const dy = (hi - lo) / n; for (let i = 0; i < n; i++) v += area(lo + (i + 0.5) * dy) * dy;
      return Math.abs(v - q.answer) <= 0.05 + 1e-6 * v;
    },
  });
})();
