/* 8th grade math. Exponents and scientific notation, equations with one unknown, linear equations
   and functions, systems of equations, geometry, and data. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v, S = M.sup, PT = M.pt;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const X = V('x'), Y = V('y');
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);
  const minus = s => String(s).replace(/−/g, '-');                 // typographic minus → JavaScript minus
  /** "3.6 × 10⁵" and its reader */
  const sci = (m, e) => `${N(m)} × ${S(10, N(e))}`;
  const parseSci = html => { const mm = String(html).match(/^(−?[\d.]+) × 10<sup>(−?\d+)<\/sup>$/); return mm ? { m: Number(minus(mm[1])), e: Number(minus(mm[2])) } : null; };
  /** "(3, −4)" back to [3, -4] */
  const parsePt = html => { const mm = String(html).match(/^\((−?\d+), (−?\d+)\)$/); return mm ? [Number(minus(mm[1])), Number(minus(mm[2]))] : null; };
  /** y = mx + b, and its reader (returns [m, b]) */
  const eqn = (m, b) => `${Y} = ${M.poly([m, b])}`;
  const parseEqn = html => {
    const s = minus(A.stripTags(html)).replace(/\s+/g, '');            // "y=2x-3", "y=-x", "y=x+4", "y=5"
    const mm = s.match(/^y=(-?\d*)x([+-]\d+)?$/);
    if (mm) return [mm[1] === '' ? 1 : mm[1] === '-' ? -1 : Number(mm[1]), mm[2] ? Number(mm[2]) : 0];
    const cc = s.match(/^y=(-?\d+)$/);
    return cc ? [0, Number(cc[1])] : null;
  };
  /** "3x + 2y = 7" */
  const lin2 = (a, b, c) => `${M.term(a, 'x')} ${b < 0 ? '−' : '+'} ${M.term(Math.abs(b), 'y')} = ${N(c)}`;
  /** a stacked fraction whose parts are already HTML */
  const fracH = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
  const cbrt = x => `<span class="sqrt">∛<span class="rad">${x}</span></span>`;
  /** k distinct options from a list of candidates, skipping ones that read like the answer or each other */
  const distinct = (answer, candidates, k) => {
    const seen = new Set([A.normText(A.stripTags(answer))]), out = [];
    for (const c of candidates) { const key = A.normText(A.stripTags(c)); if (!seen.has(key)) { seen.add(key); out.push(c); } if (out.length === k) break; }
    return out;
  };

  A.course({
    id: 'math-8', title: '8th grade math', subject: 'Middle school', grade: 8, icon: '📊', hue: 265,
    blurb: 'Exponents and scientific notation, equations with the unknown on both sides, slope and linear functions, systems of equations, the Pythagorean theorem, volume, transformations, and two-way tables.',
    units: [
      { id: 'numbers', title: 'Numbers and operations', blurb: 'Exponent rules, negative exponents, scientific notation, square and cube roots.', skills: ['math8.exponent-properties', 'math8.negative-exponents', 'math8.scientific-notation', 'math8.roots'] },
      { id: 'equations', title: 'Solving equations with one unknown', blurb: 'The unknown on both sides, the distributive property, and how many solutions an equation has.', skills: ['math8.variables-both-sides', 'math8.distributive-equations', 'math8.number-of-solutions'] },
      { id: 'linear', title: 'Linear equations and functions', blurb: 'Slope and rate of change, slope-intercept form, recognising functions, linear and nonlinear tables.', skills: ['math8.slope', 'math8.slope-intercept-form', 'math8.recognize-functions', 'math8.linear-nonlinear'] },
      { id: 'systems', title: 'Systems of equations', blurb: 'Two equations, two unknowns: solving them, and how many solutions there are.', skills: ['math8.solve-systems', 'math8.systems-solutions'] },
      { id: 'geometry', title: 'Geometry', blurb: 'The Pythagorean theorem and distance, volume of cylinders, cones and spheres, triangle angles, transformations.', skills: ['math8.pythagorean-theorem', 'math8.volume', 'math8.triangle-angles', 'math8.transformations'] },
      { id: 'data', title: 'Data and modelling', blurb: 'Two-way tables and the story a scatter plot tells.', skills: ['math8.two-way-tables', 'math8.scatter-plots'] },
    ],
  });

  /* ---------- Unit 1: Numbers and operations ---------- */
  A.skill({
    id: 'math8.exponent-properties', title: 'Exponent properties',
    learn: p(`An exponent counts repeated multiplication: ${S(X, 4)} means ${X} · ${X} · ${X} · ${X}. Three rules follow from that counting, and they only apply when the <b>bases are the same</b>.`) +
      p(`<b>Product rule:</b> ${S(X, 'm')} × ${S(X, 'n')} = ${S(X, 'm + n')} — add the exponents.<br><b>Quotient rule:</b> ${S(X, 'm')} ÷ ${S(X, 'n')} = ${S(X, 'm − n')} — subtract the exponents.<br><b>Power of a power:</b> (${S(X, 'm')})${S('', 'n')} = ${S(X, 'mn')} — multiply the exponents.`) +
      p(`The base never changes: ${S(3, 4)} × ${S(3, 2)} is ${S(3, 6)}, not ${S(9, 6)}. Check small cases if you forget a rule: ${S(2, 3)} × ${S(2, 2)} = 8 × 4 = 32 = ${S(2, 5)}.`) +
      example('Example', `${big(`${S(5, 7)} ÷ ${S(5, 3)}`)}Same base, a division, so subtract the exponents: 7 − 3 = 4. The answer is <b>${S(5, 4)}</b>.`),
    make(rng) {
      const rule = rng.pick(['product', 'quotient', 'power']);
      const base = rng.pick(['2', '3', '5', '7', '10', 'x', 'x', 'y', 'a']);
      const numeric = /^\d/.test(base), B = numeric ? base : V(base);
      let m = rng.int(2, 9), n = rng.int(2, 9);
      if (rule === 'quotient') { if (m === n) m = n === 9 ? 8 : n + 1; if (m < n) [m, n] = [n, m]; }
      if (rule === 'power') { m = rng.int(2, 6); n = rng.int(2, 5); if (m === 2 && n === 2) n = 3; }
      const right = rule === 'product' ? m + n : rule === 'quotient' ? m - n : m * n;
      const expr = rule === 'product' ? `${S(B, m)} × ${S(B, n)}` : rule === 'quotient' ? `${S(B, m)} ÷ ${S(B, n)}` : `(${S(B, m)})${S('', n)}`;
      const answer = S(B, right);
      let cands;
      if (rule === 'product') cands = [S(B, m * n), S(B, Math.abs(m - n)), numeric ? S(N(Number(base) * Number(base)), m + n) : S(B, m + n + 1)];
      else if (rule === 'quotient') cands = [S(B, m + n), S(B, N(n - m)), numeric ? S('1', m - n) : S(B, m * n)];
      else cands = [S(B, m + n), `${N(n)}${numeric ? ' × ' : ''}${S(B, m)}`];
      const choices = [answer].concat(distinct(answer, cands, 3));
      const ruleName = { product: 'product rule', quotient: 'quotient rule', power: 'power of a power rule' }[rule];
      const hints = [
        `The bases are the same (${B}), so the ${ruleName} applies: ${rule === 'product' ? 'add' : rule === 'quotient' ? 'subtract' : 'multiply'} the exponents.`,
        rule === 'product' ? `${N(m)} + ${N(n)} = ${N(right)}.` : rule === 'quotient' ? `${N(m)} − ${N(n)} = ${N(right)}.` : `${N(m)} × ${N(n)} = ${N(right)}.`,
        `Keep the base as it is: ${expr} = <b>${answer}</b>.`,
      ];
      return { prompt: `Write as a single power of ${B}.${big(expr)}`, type: 'choice', choices, answer, hints, params: { rule, base, m, n } };
    },
    verify(q) {
      const { rule, base, m, n } = q.params;
      const mm = q.answer.match(/^(.*)<sup>(−?\d+)<\/sup>$/); if (!mm) return false;
      const numeric = /^\d/.test(base), bv = numeric ? Number(base) : 2;        // a variable base is tested at x = 2
      if (mm[1] !== (numeric ? base : `<i>${base}</i>`)) return false;
      const got = Math.pow(bv, Number(minus(mm[2])));
      const want = rule === 'product' ? Math.pow(bv, m) * Math.pow(bv, n) : rule === 'quotient' ? Math.pow(bv, m) / Math.pow(bv, n) : Math.pow(Math.pow(bv, m), n);
      return Math.abs(got - want) <= 1e-9 * want;
    },
  });

  A.skill({
    id: 'math8.negative-exponents', title: 'Negative exponents',
    learn: p(`A negative exponent means “one over”: <b>${S(X, '−n')} = ${fracH('1', S(X, 'n'))}</b>. So ${S(2, '−3')} = ${F(1, 8)} and ${S(10, '−2')} = ${F(1, 100, { raw: true })} = 0.01. The result is small, but it is still positive.`) +
      p(`Why? The quotient rule says ${S(2, 2)} ÷ ${S(2, 5)} = ${S(2, '−3')}, and working it out directly gives 4 ÷ 32 = ${F(1, 8)}. For a fraction, flipping it makes the exponent positive: (${F(2, 3)})${S('', '−2')} = (${F(3, 2)})${S('', 2)} = ${F(9, 4)}.`) +
      example('Example', `${big(S(5, '−2'))}${S(5, '−2')} = 1 ÷ ${S(5, 2)} = 1 ÷ 25 = <b>${F(1, 25)}</b>, which is 0.04.`),
    make(rng) {
      const kind = rng.pick(['plain', 'plain', 'ten', 'frac', 'product']);
      if (kind === 'ten') {
        const e = rng.int(1, 5), ans = Number('1e-' + e);
        return { prompt: `Write as a decimal.${big(S(10, N(-e)))}`, type: 'number', answer: ans, params: { kind, e },
          hints: [`${S(10, N(-e))} = 1 ÷ ${S(10, e)} = 1 ÷ ${N(Math.pow(10, e))}.`, `Dividing 1 by ${N(Math.pow(10, e))} moves the decimal point ${e} place${e > 1 ? 's' : ''} to the left: <b>${N(ans)}</b>.`] };
      }
      if (kind === 'frac') {
        const pairs = [[2, 3], [3, 2], [2, 5], [5, 2], [3, 4], [4, 3], [3, 5], [5, 3], [1, 2], [1, 3], [1, 4], [2, 7], [4, 5]];
        const [a, b] = rng.pick(pairs), e = rng.int(1, 2);
        const num = Math.pow(b, e), den = Math.pow(a, e);
        return { prompt: `Evaluate. Give your answer as a fraction or whole number in simplest form.${big(`(${F(a, b)})${S('', N(-e))}`)}`, type: 'number', answer: num / den, answerText: M.fracText(num, den), params: { kind, a, b, e },
          hints: [`A negative exponent flips the fraction: (${F(a, b)})${S('', N(-e))} = (${F(b, a)})${S('', e)}.`, e === 1 ? `A power of 1 is the number itself.` : `Square the top and the bottom: ${S(b, e)} = ${N(num)} and ${S(a, e)} = ${N(den)}.`, `The value is <b>${F(num, den)}</b>${den === 1 ? '' : ` (${M.fracText(num, den)})`}.`] };
      }
      if (kind === 'product') {
        const b = rng.int(2, 5), m = rng.int(1, 4), n = m + rng.int(1, 3);
        const den = Math.pow(b, n - m);
        return { prompt: `Evaluate. Give your answer as a fraction in simplest form.${big(`${S(b, m)} × ${S(b, N(-n))}`)}`, type: 'number', answer: 1 / den, answerText: M.fracText(1, den), params: { kind, b, m, n },
          hints: [`Same base, so add the exponents: ${N(m)} + (${N(-n)}) = ${N(m - n)}. The expression equals ${S(b, N(m - n))}.`, `A negative exponent means one over the positive power: ${S(b, N(m - n))} = 1 ÷ ${S(b, n - m)}.`, `${S(b, n - m)} = ${N(den)}, so the value is <b>${F(1, den)}</b> (${M.fracText(1, den)}).`] };
      }
      const b = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      let e = rng.int(1, 3); while (Math.pow(b, e) > 1000) e--;
      const den = Math.pow(b, e);
      return { prompt: `Evaluate. Give your answer as a fraction in simplest form.${big(S(b, N(-e)))}`, type: 'number', answer: 1 / den, answerText: M.fracText(1, den), params: { kind, b, e },
        hints: [`A negative exponent means “one over the positive power”: ${S(b, N(-e))} = 1 ÷ ${S(b, e)}.`, `${S(b, e)} = ${N(den)}.`, `So ${S(b, N(-e))} = <b>${F(1, den)}</b> (${M.fracText(1, den)}).`] };
    },
    verify(q) {
      const p = q.params;
      const v = p.kind === 'ten' ? Math.pow(10, -p.e) : p.kind === 'frac' ? Math.pow(p.a / p.b, -p.e) : p.kind === 'product' ? Math.pow(p.b, p.m) * Math.pow(p.b, -p.n) : Math.pow(p.b, -p.e);
      return Math.abs(v - q.answer) < 1e-12;
    },
  });

  A.skill({
    id: 'math8.scientific-notation', title: 'Scientific notation',
    learn: p(`<b>Scientific notation</b> writes a number as a value from 1 up to (but not including) 10, times a power of ten: 3,600,000 = ${sci(3.6, 6)} and 0.00042 = ${sci(4.2, -4)}. The exponent tells how many places the decimal point moved: positive for big numbers, negative for small ones.`) +
      p(`<b>To write a number in scientific notation</b>, move the decimal point until exactly one non-zero digit is in front of it, and count the places. <b>To write it out</b>, move the point back: a positive exponent moves it right, a negative exponent moves it left, filling with zeros.`) +
      p(`<b>To multiply</b>, multiply the front numbers and add the exponents: (${sci(2, 3)})(${sci(4, 5)}) = ${sci(8, 8)}. If the front number comes out 10 or more, slide the point one more place and add 1 to the exponent: ${sci(24, 8)} becomes ${sci(2.4, 9)}.`) +
      example('Example', `${big('Write 0.00075 in scientific notation.')}Move the point 4 places right to get 7.5, so the exponent is −4: <b>${sci(7.5, -4)}</b>.`),
    make(rng) {
      const kind = rng.pick(['in', 'in', 'out', 'multiply', 'multiply']);
      const mants = [1.2, 1.5, 2, 2.4, 3, 3.6, 4.2, 4.5, 5, 5.8, 6.3, 7, 7.5, 8.1, 9, 9.6];
      if (kind === 'multiply') {
        const a = rng.pick([1.5, 2, 2.5, 3, 4, 5, 6, 1.2, 8, 2.4]), b = rng.pick([1.5, 2, 2.5, 3, 4, 5, 6, 7, 3.5]);
        const m = rng.int(1, 6), n = rng.chance(0.3) ? -rng.int(1, 4) : rng.int(1, 6), s = m + n;
        const P = M.round(a * b, 3), norm = P >= 10;
        const answer = norm ? sci(M.round(P / 10, 3), s + 1) : sci(P, s);
        const cands = norm ? [sci(M.round(P / 10, 3), s), sci(M.round(P / 10, 3), s + 2), sci(M.round(P / 10, 3), m * n), sci(M.round(P / 10, 3), s - 1)] : [sci(P, m * n), sci(P, s + 1), a + b < 10 ? sci(a + b, s) : sci(P, s - 1), sci(P, s - 1)];
        const choices = [answer].concat(distinct(answer, cands, 3));
        const hints = [`Multiply the front numbers: ${N(a)} × ${N(b)} = ${N(P)}. Add the exponents: ${N(m)} + ${wrap(n)} = ${N(s)}. That gives ${sci(P, s)}.`];
        if (norm) hints.push(`${N(P)} is not between 1 and 10, so move its decimal point one place left to ${N(P / 10)} and add 1 to the exponent.`);
        hints.push(`The product is <b>${answer}</b>.`);
        return { prompt: `Multiply. Give the answer in scientific notation.${big(`(${sci(a, m)}) × (${sci(b, n)})`)}`, type: 'choice', choices, answer, hints, params: { kind, a, b, m, n } };
      }
      const mant = rng.pick(mants);
      const e = rng.bool() ? rng.int(3, 8) : -rng.int(1, 5);
      const value = Number(`${mant}e${e}`);
      if (kind === 'out') {
        return { prompt: `Write in standard form (as an ordinary number).${big(sci(mant, e))}`, type: 'number', answer: value, params: { kind, mant, e },
          hints: [`${S(10, N(e))} ${e > 0 ? `= ${N(Math.pow(10, e))}, so multiply ${N(mant)} by ${N(Math.pow(10, e))}` : `= ${N(Math.pow(10, e))}, so divide ${N(mant)} by ${N(Math.pow(10, -e))}`}.`,
            `Move the decimal point of ${N(mant)} ${Math.abs(e)} place${Math.abs(e) > 1 ? 's' : ''} to the ${e > 0 ? 'right' : 'left'}, adding zeros as needed.`,
            `${sci(mant, e)} = <b>${N(value)}</b>.`] };
      }
      const answer = sci(mant, e);
      const cands = [sci(mant, e + 1), sci(mant, e - 1), sci(mant, -e), sci(mant, e + 2)];
      const choices = [answer].concat(distinct(answer, cands, 3));
      return { prompt: `Write in scientific notation.${big(N(value))}`, type: 'choice', choices, answer, params: { kind, mant, e },
        hints: [`Move the decimal point so that one non-zero digit is in front of it: ${N(value)} becomes ${N(mant)}.`,
          `Count the places the point moved: ${Math.abs(e)}, to the ${e > 0 ? 'left, so the exponent is positive' : 'right, so the exponent is negative'}.`,
          `${N(value)} = <b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'out') return Math.abs(q.answer - p.mant * Math.pow(10, p.e)) <= 1e-12 * Math.max(1, Math.abs(q.answer));
      const got = parseSci(q.answer); if (!got || got.m < 1 || got.m >= 10) return false;
      const want = p.kind === 'multiply' ? (p.a * Math.pow(10, p.m)) * (p.b * Math.pow(10, p.n)) : Number(`${p.mant}e${p.e}`);
      return Math.abs(got.m * Math.pow(10, got.e) - want) <= 1e-9 * want;
    },
  });

  A.skill({
    id: 'math8.roots', title: 'Square roots and cube roots',
    learn: p(`The <b>square root</b> of a number is the number that, squared, gives it back: ${M.sqrt(49)} = 7 because ${S(7, 2)} = 49. The <b>cube root</b> undoes cubing: ${cbrt(64)} = 4 because ${S(4, 3)} = 64. A cube root can be negative (${cbrt('−8')} = −2), but ${M.sqrt(X)} always means the positive root.`) +
      p(`Learn the perfect squares up to 15² = 225 and the cubes up to 10³ = 1000; most problems use them. A square with area 81 cm² has sides of ${M.sqrt(81)} = 9 cm; a cube with volume 125 cm³ has edges of ${cbrt(125)} = 5 cm.`) +
      p(`When a number is <b>not</b> a perfect square, its square root lies between two whole numbers. Find the perfect squares on either side: 36 < 40 < 49, so 6 < ${M.sqrt(40)} < 7, and because 40 is closer to 36 the root is a bit above 6 (it is about 6.3).`) +
      example('Example', `${big(M.sqrt(144))}Which number times itself is 144? 12 × 12 = 144, so ${M.sqrt(144)} = <b>12</b>.`),
    make(rng) {
      const kind = rng.pick(['square', 'square', 'cube', 'area', 'volume', 'estimate', 'estimate']);
      if (kind === 'square') {
        const k = rng.int(2, 20), n = k * k;
        return { prompt: `Evaluate.${big(M.sqrt(n))}`, type: 'number', answer: k, params: { kind, n },
          hints: [`Ask: which number times itself gives ${n}?`, `${N(k)} × ${N(k)} = ${N(n)}, so ${M.sqrt(n)} = <b>${N(k)}</b>.`] };
      }
      if (kind === 'cube') {
        const k = rng.int(2, 10) * (rng.chance(0.25) ? -1 : 1), n = k * k * k;
        return { prompt: `Evaluate.${big(cbrt(N(n)))}`, type: 'number', answer: k, params: { kind, n },
          hints: [`Ask: which number cubed (used three times in a product) gives ${N(n)}?${n < 0 ? ' A negative number cubed is negative, so the root is negative.' : ''}`, `${wrap(k)} × ${wrap(k)} × ${wrap(k)} = ${N(n)}, so ${cbrt(N(n))} = <b>${N(k)}</b>.`] };
      }
      if (kind === 'area') {
        const k = rng.int(3, 20), n = k * k;
        return { prompt: `A square has an area of ${N(n)} cm². How long is each side?`, type: 'number', answer: k, unit: 'cm', params: { kind, n },
          hints: [`Area of a square = side × side, so the side is the square root of the area: ${M.sqrt(n)}.`, `${N(k)} × ${N(k)} = ${N(n)}, so each side is <b>${N(k)} cm</b>.`] };
      }
      if (kind === 'volume') {
        const k = rng.int(2, 10), n = k * k * k;
        return { prompt: `A cube has a volume of ${N(n)} cm³. How long is each edge?`, type: 'number', answer: k, unit: 'cm', params: { kind, n },
          hints: [`Volume of a cube = edge × edge × edge, so the edge is the cube root of the volume: ${cbrt(n)}.`, `${N(k)} × ${N(k)} × ${N(k)} = ${N(n)}, so each edge is <b>${N(k)} cm</b>.`] };
      }
      let n = rng.int(2, 150); while (Number.isInteger(Math.sqrt(n))) n++;
      const f = Math.floor(Math.sqrt(n)), lo = Math.max(1, f - rng.int(0, 2));
      const choices = [0, 1, 2, 3].map(i => `${N(lo + i)} and ${N(lo + i + 1)}`);
      const answer = `${N(f)} and ${N(f + 1)}`;
      return { prompt: `${M.sqrt(n)} is between which two whole numbers?`, type: 'choice', choices, answer, keepOrder: true, params: { kind, n },
        hints: [`Find the perfect squares on either side of ${n}: ${S(f, 2)} = ${f * f} and ${S(f + 1, 2)} = ${(f + 1) * (f + 1)}.`,
          `${f * f} < ${n} < ${(f + 1) * (f + 1)}, so taking square roots: ${f} < ${M.sqrt(n)} < ${f + 1}.`,
          `${M.sqrt(n)} is between <b>${N(f)} and ${N(f + 1)}</b>${n - f * f < (f + 1) * (f + 1) - n ? `, closer to ${f}` : `, closer to ${f + 1}`}.`] };
    },
    verify(q) {
      const { kind, n } = q.params;
      if (kind === 'estimate') { const mm = q.answer.match(/^(\d+) and (\d+)$/); return !!mm && Number(mm[1]) * Number(mm[1]) < n && n < Number(mm[2]) * Number(mm[2]) && Number(mm[2]) === Number(mm[1]) + 1; }
      if (kind === 'cube' || kind === 'volume') return q.answer * q.answer * q.answer === n;
      return q.answer * q.answer === n && q.answer > 0;
    },
  });

  /* ---------- Unit 2: Solving equations with one unknown ---------- */
  /** a·x + b, printed: "3x − 5", "−x + 4", "7" */
  const lin = (a, b) => M.poly([a, b]);
  /** "Subtract 3x from" / "Add 3x to": taking an x-term off both sides, said the natural way */
  const takeAway = c => c < 0 ? `Add ${M.term(-c, 'x')} to` : `Subtract ${M.term(c, 'x')} from`;

  A.skill({
    id: 'math8.variables-both-sides', title: 'Equations with variables on both sides',
    learn: p(`When ${X} appears on both sides, first gather the ${X}-terms on one side and the plain numbers on the other. <b>Whatever you do to one side, do to the other</b>, so the equation stays balanced.`) +
      p(`A good habit: subtract the smaller ${X}-term from both sides, so the ${X}-coefficient left over is positive. Then it is an ordinary two-step equation. Finish by checking: put your answer back into <b>both</b> sides and make sure they match.`) +
      example('Example', `${big(`5${X} − 4 = 2${X} + 11`)}Subtract 2${X} from both sides: 3${X} − 4 = 11. Add 4: 3${X} = 15. Divide by 3: <b>${X} = 5</b>. Check: 5(5) − 4 = 21 and 2(5) + 11 = 21. ✓`),
    make(rng) {
      const x = rng.int(-10, 10);
      let a = rng.nz(-9, 9), c = rng.nz(-9, 9);
      if (a === c) c = a + rng.pick([-3, -2, 2, 3]);
      if (c === 0) c = a + 4;
      const b = rng.int(-15, 15), d = (a - c) * x + b;
      const [hi, lo, hiK, loK] = a > c ? [a, c, b, d] : [c, a, d, b];      // keep the bigger x-coefficient on the left in the working
      const left = a > c ? 'left' : 'right';
      const hints = [
        `${takeAway(lo)} both sides to gather the ${X}-terms on the ${left}: ${lin(hi - lo, hiK)} = ${N(loK)}.`,
        `${hiK === 0 ? 'There is no number to move.' : `${hiK > 0 ? `Subtract ${N(hiK)} from` : `Add ${N(-hiK)} to`} both sides: ${M.term(hi - lo, 'x')} = ${N(loK - hiK)}.`}`,
        hi - lo === 1 ? `The coefficient of ${X} is already 1, so ${X} = ${N(loK - hiK)}.` : `Divide both sides by ${N(hi - lo)}: ${X} = ${N(loK - hiK)} ÷ ${N(hi - lo)}.`,
        `<b>${X} = ${N(x)}</b>. Check: both sides equal ${N(a * x + b)}.`,
      ];
      return { prompt: `Solve for ${X}.${big(`${lin(a, b)} = ${lin(c, d)}`)}`, type: 'number', answer: x, hints, params: { a, b, c, d } };
    },
    verify(q) { const { a, b, c, d } = q.params; return a * q.answer + b === c * q.answer + d && a !== c; },
  });

  A.skill({
    id: 'math8.distributive-equations', title: 'Equations with parentheses',
    learn: p(`When an equation has parentheses, use the <b>distributive property</b> first: multiply the number outside by <b>every</b> term inside. 3(${X} − 4) = 3${X} − 12, and −2(${X} + 5) = −2${X} − 10 (the negative multiplies both terms).`) +
      p(`Then combine like terms on each side, gather the ${X}-terms on one side, and solve as usual. The most common slip is multiplying only the first term inside the parentheses.`) +
      example('Example', `${big(`4(${X} − 3) = 2${X} + 6`)}Distribute: 4${X} − 12 = 2${X} + 6. Subtract 2${X}: 2${X} − 12 = 6. Add 12: 2${X} = 18. So <b>${X} = 9</b>.`),
    make(rng) {
      const x = rng.int(-9, 9), form = rng.pick(['a(x+b)=c', 'a(x+b)=cx+d', 'a(x+b)+e=cx+d']);
      const a = rng.pick([-5, -4, -3, -2, 2, 3, 4, 5, 6]), b = rng.nz(-8, 8);
      let c = 0, e = 0;
      if (form !== 'a(x+b)=c') { c = rng.nz(-6, 6); if (c === a) c = a + 2; if (c === 0) c = 1; }
      if (form === 'a(x+b)+e=cx+d') e = rng.nz(-9, 9);
      const d = a * (x + b) + e - c * x;
      const L = `${N(a)}(${lin(1, b)})${e ? ` ${M.signed(e)}` : ''}`, R = c ? lin(c, d) : N(d);
      const k = a * b + e;                                         // constant on the left after distributing
      const hints = [
        `Distribute ${N(a)} to both terms inside: ${N(a)} × ${X} = ${M.term(a, 'x')} and ${N(a)} × ${wrap(b)} = ${N(a * b)}.${e ? ` Then combine ${N(a * b)} ${M.signed(e)} = ${N(k)}.` : ''} The left side is ${lin(a, k)}.`,
      ];
      if (c) hints.push(`${takeAway(c)} both sides: ${lin(a - c, k)} = ${N(d)}.`);
      hints.push(`${k === 0 ? 'Nothing to move' : `${k > 0 ? `Subtract ${N(k)} from` : `Add ${N(-k)} to`} both sides`}: ${M.term(a - c, 'x')} = ${N(d - k)}.`);
      hints.push(a - c === 1 ? `The coefficient of ${X} is 1, so <b>${X} = ${N(x)}</b>.` : `Divide by ${N(a - c)}: <b>${X} = ${N(x)}</b>.`);
      return { prompt: `Solve for ${X}.${big(`${L} = ${R}`)}`, type: 'number', answer: x, hints, params: { a, b, c, d, e } };
    },
    verify(q) { const { a, b, c, d, e } = q.params, x = q.answer; return a * (x + b) + e === c * x + d; },
  });

  A.skill({
    id: 'math8.number-of-solutions', title: 'Number of solutions to equations',
    learn: p(`Simplify both sides completely, then compare. If the ${X}-terms are <b>different</b>, the equation has <b>exactly one solution</b>.`) +
      p(`If the ${X}-terms are the same, they cancel when you subtract. What is left decides it: a true statement such as 6 = 6 means <b>infinitely many solutions</b> (every ${X} works, because the two sides are the same expression); a false statement such as 6 = 2 means <b>no solution</b> (no ${X} can make it true).`) +
      example('Example', `${big(`3(${X} + 2) = 3${X} + 2`)}Distribute: 3${X} + 6 = 3${X} + 2. Subtract 3${X}: 6 = 2, which is false. <b>No solution.</b>`),
    make(rng) {
      const kind = rng.pick(['one', 'none', 'many']);
      const pp = rng.pick([2, 3, 4, 5, -2, -3]), qq = rng.nz(-6, 6), r = rng.int(-3, 3);   // left: p(x + q) + r·x
      const a = pp + r, k = pp * qq;
      let c, d;
      if (kind === 'one') { c = a + rng.pick([-2, -1, 1, 2, 3]); d = rng.int(-12, 12); }
      else if (kind === 'many') { c = a; d = k; }
      else { c = a; d = k + rng.pick([-5, -3, -2, -1, 1, 2, 4, 6]); }
      const L = `${N(pp)}(${lin(1, qq)})${r ? ` ${r < 0 ? '−' : '+'} ${M.term(Math.abs(r), 'x')}` : ''}`;
      const choices = ['Exactly one solution', 'No solution', 'Infinitely many solutions'];
      const answer = { one: choices[0], none: choices[1], many: choices[2] }[kind];
      const hints = [`Simplify the left side: ${N(pp)}(${lin(1, qq)}) = ${lin(pp, k)}${r ? `, and combining with ${M.term(r, 'x')} gives ${lin(a, k)}` : ''}. The equation is ${lin(a, k)} = ${lin(c, d)}.`];
      if (kind === 'one') hints.push(`The ${X}-coefficients are different (${N(a)} and ${N(c)}), so subtracting leaves a single ${X}-term and one value of ${X} works.`, `<b>Exactly one solution</b> (${X} = ${M.fracText(d - k, a - c)}).`);
      else hints.push(`The ${X}-terms are the same, so ${takeAway(a).toLowerCase()} both sides: ${N(k)} = ${N(d)}.`, kind === 'many' ? `${N(k)} = ${N(d)} is always true, so every ${X} works: <b>infinitely many solutions</b>.` : `${N(k)} = ${N(d)} is false, so no ${X} works: <b>no solution</b>.`);
      return { prompt: `How many solutions does this equation have?${big(`${L} = ${lin(c, d)}`)}`, type: 'choice', choices, answer, keepOrder: true, hints, params: { pp, qq, r, c, d } };
    },
    verify(q) {
      const { pp, qq, r, c, d } = q.params;
      const f = x => pp * (x + qq) + r * x - (c * x + d);           // left minus right, evaluated, not simplified
      const want = f(0) !== f(1) ? 'Exactly one solution' : f(0) === 0 ? 'Infinitely many solutions' : 'No solution';
      return q.answer === want;
    },
  });

  /* ---------- Unit 3: Linear equations and functions ---------- */
  A.skill({
    id: 'math8.slope', title: 'Slope and rate of change',
    learn: p(`The <b>slope</b> of a line says how steep it is: how much ${Y} changes for each step of 1 in ${X}. From two points, <b>slope = (change in ${Y}) ÷ (change in ${X}) = (${M.sub(Y, 2)} − ${M.sub(Y, 1)}) ÷ (${M.sub(X, 2)} − ${M.sub(X, 1)})</b>. Subtract in the same order on top and bottom.`) +
      p(`A positive slope rises from left to right, a negative slope falls, and a horizontal line has slope 0. In a word problem the slope is the <b>rate of change</b>, with units such as dollars per hour or centimetres per day.`) +
      example('Example', `${big(`${PT(1, 2)} and ${PT(5, 10)}`)}Change in ${Y}: 10 − 2 = 8. Change in ${X}: 5 − 1 = 4. Slope = 8 ÷ 4 = <b>2</b>.`),
    make(rng) {
      const kind = rng.pick(['points', 'points', 'table', 'word']);
      if (kind === 'word') return slopeWord(rng);
      const x1 = rng.int(-8, 6), dx = rng.nz(-6, 7) || 1, x2 = x1 + dx;
      const dy = rng.int(-12, 12), y1 = rng.int(-9, 9), y2 = y1 + dy;
      const [sn, sd] = M.simp(dy, dx), ans = sn / sd;
      const shown = kind === 'table' ? `${M.table([X, Y], [[N(x1), N(y1)], [N(x2), N(y2)]].sort((r, t) => Number(minus(r[0])) - Number(minus(t[0]))))}` : big(`${PT(x1, y1)} and ${PT(x2, y2)}`);
      const lead = kind === 'table' ? `The points in this table lie on a line. What is its slope?` : `What is the slope of the line through these two points?`;
      return { prompt: `${lead} Give a fraction in simplest form if it is not a whole number.${shown}`, type: 'number', answer: ans, answerText: M.fracText(sn, sd), params: { kind, x1, y1, x2, y2 },
        hints: [`Slope = (change in ${Y}) ÷ (change in ${X}), subtracting in the same order: (${N(y2)} − ${wrap(y1)}) ÷ (${N(x2)} − ${wrap(x1)}).`,
          `Change in ${Y} = ${N(dy)}; change in ${X} = ${N(dx)}.`,
          `Slope = ${N(dy)} ÷ ${wrap(dx)}${sd !== 1 ? ` = ${F(sn, sd)}` : ''}, so the slope is <b>${M.fracText(sn, sd)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'word') return Math.abs((p.v2 - p.v1) / (p.t2 - p.t1) - q.answer) < 1e-9;
      // a line through both points with this slope: y1 + m(x2 − x1) must land on y2
      return Math.abs(p.y1 + q.answer * (p.x2 - p.x1) - p.y2) < 1e-9;
    },
  });
  function slopeWord(rng) {
    const name = rng.pick(NAMES);
    const t1 = rng.int(1, 4), t2 = t1 + rng.int(2, 5);
    const story = rng.pick([
      () => { const r = rng.pick([12, 15, 18, 20, 25]), v1 = r * t1 + rng.int(0, 4) * 10; return { r, v1, text: v => `${name}'s savings grow at a steady rate. After ${t1} weeks there is ${M.money(v1)} in the account; after ${t2} weeks there is ${M.money(v)}. What is the rate of change, in dollars per week?`, unitOut: '$/week', per: 'week' }; },
      () => { const r = -rng.pick([1.5, 2, 2.5, 3, 4]), v1 = rng.int(20, 30); return { r, v1, unitOut: 'cm/hour', per: 'hour', text: v => `A candle burns down at a steady rate. After ${t1} hours it is ${N(v1)} cm tall; after ${t2} hours it is ${N(v)} cm tall. What is the rate of change of its height, in centimetres per hour?` }; },
      () => { const r = rng.pick([45, 50, 55, 60, 65]), v1 = r * t1 + rng.int(0, 3) * 20; return { r, v1, unitOut: 'km/hour', per: 'hour', text: v => `A bus travels at a steady speed. After ${t1} hours it has gone ${N(v1)} km; after ${t2} hours it has gone ${N(v)} km. What is the rate of change, in kilometres per hour?` }; },
      () => { const r = -rng.pick([3, 4, 5, 6, 8]), v1 = rng.int(60, 90); return { r, v1, unitOut: 'L/min', per: 'minute', text: v => `A tank is drained at a steady rate. After ${t1} minutes it holds ${N(v1)} litres; after ${t2} minutes it holds ${N(v)} litres. What is the rate of change, in litres per minute?` }; },
    ])();
    const v2 = M.round(story.v1 + story.r * (t2 - t1), 2);
    return { prompt: story.text(v2), type: 'number', answer: story.r, unit: story.unitOut, params: { kind: 'word', t1, t2, v1: story.v1, v2 },
      hints: [`The rate of change is (change in amount) ÷ (change in time).`, `Change in amount: ${N(v2)} − ${N(story.v1)} = ${N(M.round(v2 - story.v1, 2))}. Change in time: ${t2} − ${t1} = ${t2 - t1}.`,
        `${N(M.round(v2 - story.v1, 2))} ÷ ${t2 - t1} = <b>${N(story.r)}</b> per ${story.per}${story.r < 0 ? ' (negative, because the amount is going down)' : ''}.`] };
  }

  A.skill({
    id: 'math8.slope-intercept-form', title: 'Writing slope-intercept equations',
    learn: p(`<b>Slope-intercept form</b> is ${Y} = ${V('m')}${X} + ${V('b')}, where ${V('m')} is the slope and ${V('b')} is the ${Y}-intercept (where the line crosses the ${Y}-axis, at ${X} = 0).`) +
      p(`If you know the slope and one point, put them into ${Y} = ${V('m')}${X} + ${V('b')} and solve for ${V('b')}. If you know two points, find the slope first, then use either point.`) +
      example('Example', `${big(`Slope 3, through ${PT(2, 1)}`)}1 = 3(2) + ${V('b')}, so 1 = 6 + ${V('b')} and ${V('b')} = −5. The equation is <b>${eqn(3, -5)}</b>.`),
    make(rng) {
      const kind = rng.pick(['slope-point', 'two-points']);
      const m = rng.nz(-5, 5), b = rng.int(-9, 9);
      const x1 = rng.nz(-5, 5), y1 = m * x1 + b;
      let x2 = rng.nz(-5, 5); if (x2 === x1) x2 = x1 + 2;
      const y2 = m * x2 + b;
      const answer = eqn(m, b);
      const cands = [eqn(m, y1 + m * x1), eqn(m, y1), eqn(-m, b), eqn(m, -b), eqn(m, b + 2 * m), eqn(b || 1, m)];
      const choices = [answer].concat(distinct(answer, cands.filter(c => parseEqn(c)), 3));
      const given = kind === 'slope-point' ? `has slope ${N(m)} and passes through ${PT(x1, y1)}` : `passes through ${PT(x1, y1)} and ${PT(x2, y2)}`;
      const hints = [];
      if (kind === 'two-points') hints.push(`Find the slope first: (${N(y2)} − ${wrap(y1)}) ÷ (${N(x2)} − ${wrap(x1)}) = ${N(y2 - y1)} ÷ ${N(x2 - x1)} = ${N(m)}.`);
      hints.push(`Put the slope and the point ${PT(x1, y1)} into ${Y} = ${V('m')}${X} + ${V('b')}: ${N(y1)} = ${N(m)} × ${wrap(x1)} + ${V('b')}, so ${N(y1)} = ${N(m * x1)} + ${V('b')}.`,
        `Solve for ${V('b')}: ${V('b')} = ${N(y1)} − ${wrap(m * x1)} = ${N(b)}.`, `The equation is <b>${answer}</b>.`);
      return { prompt: `Which equation describes the line that ${given}?`, type: 'choice', choices, answer, hints, params: { kind, m, x1, y1, x2, y2 } };
    },
    verify(q) {
      const p = q.params, got = parseEqn(q.answer); if (!got) return false;
      const on = (x, y) => got[0] * x + got[1] === y;
      return on(p.x1, p.y1) && (p.kind === 'slope-point' ? got[0] === p.m : on(p.x2, p.y2));
    },
  });

  A.skill({
    id: 'math8.recognize-functions', title: 'Recognizing functions',
    learn: p(`A <b>function</b> is a rule that gives <b>exactly one output for each input</b>. In a table or a list of ordered pairs, look at the inputs (the ${X}-values): if the same ${X} ever appears with two <b>different</b> ${Y}-values, it is not a function.`) +
      p(`Repeated <b>outputs</b> are fine. ${PT(1, 5)} and ${PT(2, 5)} can both belong to a function: two inputs share an output, but each input still has only one. A repeated pair like ${PT(3, 4)} written twice is also fine — it is the same input with the same output.`) +
      example('Example', `${big(`${PT(1, 4)}, ${PT(2, 6)}, ${PT(1, 8)}`)}The input 1 is paired with both 4 and 8. <b>Not a function.</b>`),
    make(rng) {
      const isFn = rng.bool(), form = rng.pick(['table', 'pairs']);
      const xs = rng.sample([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7], 5);
      const ys = xs.map(() => rng.int(-9, 9));
      if (isFn && rng.bool()) ys[3] = ys[1];                                   // a repeated output, still a function
      if (!isFn) { xs[4] = xs[rng.int(0, 2)]; let y = rng.int(-9, 9); const i = xs.indexOf(xs[4]); if (y === ys[i]) y = ys[i] + 3; ys[4] = y; }
      const order = rng.shuffle([0, 1, 2, 3, 4]);
      const rows = order.map(i => [xs[i], ys[i]]);
      const shown = form === 'table' ? M.table([`Input ${X}`, `Output ${Y}`], rows.map(r => [N(r[0]), N(r[1])])) : big(rows.map(r => PT(r[0], r[1])).join(', '));
      const choices = ['Yes: each input has exactly one output', 'No: an input has two different outputs', 'No: two inputs share the same output', 'Yes: every output is a different number'];
      const answer = isFn ? choices[0] : choices[1];
      const dupX = isFn ? null : xs[4];
      const hints = [`Look only at the inputs (the ${X}-values) and check whether any of them repeats.`,
        isFn ? `All the inputs are different: ${xs.map(N).join(', ')}. ${new Set(ys).size < 5 ? 'An output repeats, but that is allowed.' : ''}` : `The input ${N(dupX)} appears twice, with outputs ${N(ys[xs.indexOf(dupX)])} and ${N(ys[4])}.`,
        isFn ? `<b>Yes: each input has exactly one output</b>, so this is a function.` : `<b>No: an input has two different outputs</b>, so this is not a function.`];
      return { prompt: `Is this relation a function?${shown}`, type: 'choice', choices, answer, hints, params: { rows } };
    },
    verify(q) {
      const seen = new Map(); let fn = true;
      q.params.rows.forEach(([x, y]) => { if (seen.has(x) && seen.get(x) !== y) fn = false; seen.set(x, y); });
      return q.answer.startsWith(fn ? 'Yes: each input' : 'No: an input');
    },
  });

  A.skill({
    id: 'math8.linear-nonlinear', title: 'Linear and nonlinear functions',
    learn: p(`A function is <b>linear</b> when its rate of change is constant: every time ${X} goes up by the same step, ${Y} changes by the same amount. Its graph is a straight line, and its equation can be written ${Y} = ${V('m')}${X} + ${V('b')}.`) +
      p(`To test a table, find the change in ${Y} between rows and divide by the change in ${X}. If that rate is the same everywhere, the function is linear and the rate is its slope. If it changes (as with ${Y} = ${S(X, 2)} or a quantity that doubles), the function is <b>nonlinear</b>.`) +
      example('Example', `${M.table([X, Y], [[0, 1], [2, 7], [4, 13], [6, 19]], { compact: true })}${X} goes up by 2 each row and ${Y} goes up by 6 each row. The rate of change is 6 ÷ 2 = 3 every time, so it is <b>linear</b> with rate of change 3.`),
    make(rng) {
      const linear = rng.bool(), step = rng.pick([1, 1, 2]), x0 = rng.int(-2, 2);
      const xs = [0, 1, 2, 3].map(i => x0 + i * step);
      const m = rng.nz(-5, 5), b = rng.int(-6, 6);
      const kindNL = rng.pick(['square', 'double', 'cube-ish']);
      const fNL = { square: x => x * x + b, double: x => Math.pow(2, x - x0) * (Math.abs(m) + 1), 'cube-ish': x => x * x - x + b }[kindNL];
      const ys = xs.map(x => linear ? m * x + b : fNL(x));
      const rate = (ys[1] - ys[0]) / step;
      const opt = r => `Linear, with rate of change ${N(r)}`;
      const nl = 'Nonlinear: the rate of change varies';
      const answer = linear ? opt(m) : nl;
      const cands = linear ? [opt(m * step === m ? m + 1 : m * step), opt(-m), nl, opt(m + 1)] : [opt(rate), opt((ys[3] - ys[2]) / step), opt(rate + 1), opt(-rate)];
      const choices = [answer].concat(distinct(answer, cands, 3));
      const diffs = [1, 2, 3].map(i => ys[i] - ys[i - 1]);
      const hints = [`${X} goes up by ${step} each row. Find how much ${Y} changes each row: ${diffs.map(N).join(', ')}.`,
        linear ? `The change is always ${N(diffs[0])}, so the rate of change is ${N(diffs[0])} ÷ ${step} = ${N(m)} everywhere.` : `The changes are not all the same, so the rate of change is not constant.`,
        linear ? `<b>${answer}</b>.` : `<b>Nonlinear</b>: the rate of change varies.`];
      return { prompt: `Is the function in this table linear or nonlinear?${M.table([X, Y], xs.map((x, i) => [N(x), N(ys[i])]))}`, type: 'choice', choices, answer, hints, params: { xs, ys } };
    },
    verify(q) {
      const { xs, ys } = q.params;
      const r = [1, 2, 3].map(i => (ys[i] - ys[i - 1]) / (xs[i] - xs[i - 1]));
      return r.every(v => v === r[0]) ? q.answer === `Linear, with rate of change ${N(r[0])}` : q.answer.startsWith('Nonlinear');
    },
  });

  /* ---------- Unit 4: Systems of equations ---------- */
  A.skill({
    id: 'math8.solve-systems', title: 'Solving systems of equations',
    learn: p(`A <b>system</b> is two equations that must both be true at once. Its solution is the ordered pair ${PT('x', 'y').replace('x', X).replace('y', Y)} that works in <b>both</b> — the point where the two lines cross.`) +
      p(`<b>Substitution:</b> if one equation already says ${Y} = …, replace ${Y} in the other equation with that expression and solve for ${X}. <b>Elimination:</b> add or subtract the equations (multiplying one first if needed) so that one variable cancels. Either way, find the second variable by putting the first back into an equation, and check the pair in both.`) +
      example('Example', `${big(`${Y} = 2${X} + 1 and 3${X} + ${Y} = 16`)}Substitute: 3${X} + (2${X} + 1) = 16, so 5${X} = 15 and ${X} = 3. Then ${Y} = 2(3) + 1 = 7. The solution is <b>${PT(3, 7)}</b>.`),
    make(rng) {
      const x = rng.int(-6, 6), y = rng.int(-6, 6), form = rng.pick(['sub', 'elim']), ask = rng.pick(['x', 'pair', 'pair']);
      let e1, e2, coef, hints;
      if (form === 'sub') {
        const m = rng.nz(-4, 4), b = y - m * x;
        let a = rng.nz(-4, 5), c = rng.nz(-3, 3); if (a + c * m === 0) a += 1; if (a === 0) a = 2;
        const d = a * x + c * y;
        e1 = eqn(m, b); e2 = lin2(a, c, d); coef = { a1: -m, b1: 1, c1: b, a2: a, b2: c, c2: d };
        hints = [`The first equation gives ${Y} directly. Substitute it into the second: ${M.term(a, 'x')} ${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 ? '' : N(Math.abs(c))}(${lin(m, b)}) = ${N(d)}.`,
          `Expand and collect: ${lin(a + c * m, c * b)} = ${N(d)}, so ${M.term(a + c * m, 'x')} = ${N(d - c * b)} and ${X} = ${N(x)}.`,
          `Then ${Y} = ${N(m)} × ${wrap(x)} ${M.signed(b)} = ${N(y)}.`];
      } else {
        const a1 = rng.nz(-4, 4), b1 = rng.pick([1, 2, 3, -1, -2]), b2 = rng.pick([-1, 1]) * b1;
        let a2 = rng.nz(-4, 4); if (a2 * b1 === a1 * b2) a2 = a1 + (b2 === b1 ? 2 : 1) * rng.pick([1, -1]) || 3;
        if (a2 * b1 === a1 * b2) a2 = -a2 + 5;
        const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
        e1 = lin2(a1, b1, c1); e2 = lin2(a2, b2, c2); coef = { a1, b1, c1, a2, b2, c2 };
        const add = b2 === -b1;
        hints = [`The ${Y}-terms are ${M.term(b1, 'y')} and ${M.term(b2, 'y')}, so ${add ? 'adding' : 'subtracting'} the equations makes ${Y} cancel.`,
          `${add ? 'Add' : 'Subtract'}: ${M.term(add ? a1 + a2 : a1 - a2, 'x')} = ${N(add ? c1 + c2 : c1 - c2)}, so ${X} = ${N(x)}.`,
          `Put ${X} = ${N(x)} into the first equation: ${N(a1)} × ${wrap(x)} ${b1 < 0 ? '−' : '+'} ${M.term(Math.abs(b1), 'y')} = ${N(c1)}, which gives ${Y} = ${N(y)}.`];
      }
      const system = big(`${e1}<br>${e2}`);
      if (ask === 'x') {
        hints.push(`Check ${PT(x, y)} in both equations. The answer is <b>${X} = ${N(x)}</b>.`);
        return { prompt: `Solve the system. What is the value of ${X}?${system}`, type: 'number', answer: x, hints, params: coef };
      }
      const answer = PT(x, y);
      const choices = [answer].concat(distinct(answer, [PT(y, x), PT(x, -y), PT(-x, y), PT(x, y + 1), PT(-x, -y), PT(x + 1, y)], 3));
      hints.push(`Both equations check, so the solution is <b>${answer}</b>.`);
      return { prompt: `Solve the system of equations.${system}`, type: 'choice', choices, answer, hints, params: coef };
    },
    verify(q) {
      const { a1, b1, c1, a2, b2, c2 } = q.params;
      let found = null;                                            // brute force over a grid of integer points
      for (let x = -20; x <= 20; x++) for (let y = -60; y <= 60; y++) if (a1 * x + b1 * y === c1 && a2 * x + b2 * y === c2) found = [x, y];
      if (!found || a1 * b2 === a2 * b1) return false;
      if (q.type === 'number') return q.answer === found[0];
      const got = parsePt(q.answer); return !!got && got[0] === found[0] && got[1] === found[1];
    },
  });

  A.skill({
    id: 'math8.systems-solutions', title: 'Number of solutions to systems of equations',
    learn: p(`Two lines in a plane can meet in three ways. Different slopes: they cross once, so <b>exactly one solution</b>. Same slope, different ${Y}-intercepts: they are parallel and never meet, so <b>no solution</b>. Same slope and same intercept: they are the same line, so <b>infinitely many solutions</b>.`) +
      p(`So rewrite both equations in slope-intercept form ${Y} = ${V('m')}${X} + ${V('b')} and compare ${V('m')} first, then ${V('b')}. To rewrite 4${X} + 2${Y} = 6, subtract 4${X} and divide by 2: ${Y} = −2${X} + 3.`) +
      example('Example', `${big(`${Y} = 3${X} − 2 and 6${X} − 2${Y} = 4`)}The second becomes −2${Y} = −6${X} + 4, so ${Y} = 3${X} − 2. The same line: <b>infinitely many solutions</b>.`),
    make(rng) {
      const kind = rng.pick(['one', 'none', 'many']);
      const m1 = rng.nz(-4, 4), b1 = rng.int(-7, 7), k = rng.pick([1, 2, 3, -1, -2]);
      let m2 = m1, b2 = b1;
      if (kind === 'one') m2 = m1 + rng.pick([-2, -1, 1, 2]);
      if (kind === 'none') b2 = b1 + rng.pick([-4, -3, -2, 2, 3, 5]);
      // second equation in standard form: k(−m2·x + y) = k·b2, with a positive x-coefficient where possible
      let a = -m2 * k, bb = k, c = b2 * k; if (a < 0) { a = -a; bb = -bb; c = -c; }
      const e2 = a === 0 ? `${M.term(bb, 'y')} = ${N(c)}` : lin2(a, bb, c);
      const choices = ['Exactly one solution', 'No solution', 'Infinitely many solutions'];
      const answer = { one: choices[0], none: choices[1], many: choices[2] }[kind];
      const hints = [`Rewrite the second equation as ${Y} = … : ${a ? `move the ${X}-term across and ` : ''}divide by ${N(bb)} to get ${eqn(m2, b2)}.`,
        `Compare with ${eqn(m1, b1)}: the slopes are ${N(m1)} and ${N(m2)}${m1 === m2 ? `, the intercepts are ${N(b1)} and ${N(b2)}` : ''}.`,
        kind === 'one' ? `Different slopes, so the lines cross once: <b>exactly one solution</b>.` : kind === 'none' ? `Same slope but different intercepts: parallel lines, <b>no solution</b>.` : `Same slope and same intercept: the same line, <b>infinitely many solutions</b>.`];
      return { prompt: `How many solutions does this system have?${big(`${eqn(m1, b1)}<br>${e2}`)}`, type: 'choice', choices, answer, keepOrder: true, hints, params: { m1, b1, a, bb, c } };
    },
    verify(q) {
      const { m1, b1, a, bb, c } = q.params;
      const on2 = (x, y) => a * x + bb * y === c;
      const want = (on2(0, b1) && on2(1, m1 + b1)) ? 'Infinitely many solutions'       // two points of line 1 lie on line 2
        : (a * 1 + bb * m1 === 0) ? 'No solution' : 'Exactly one solution';           // line 1's direction is parallel to line 2
      return q.answer === want;
    },
  });

  /* ---------- Unit 5: Geometry ---------- */
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];

  A.skill({
    id: 'math8.pythagorean-theorem', title: 'Pythagorean theorem and distance',
    learn: p(`In a right triangle the two shorter sides are the <b>legs</b> (${V('a')} and ${V('b')}) and the side opposite the right angle is the <b>hypotenuse</b> (${V('c')}), always the longest side. The <b>Pythagorean theorem</b>: <b>${S(V('a'), 2)} + ${S(V('b'), 2)} = ${S(V('c'), 2)}</b>.`) +
      p(`To find the hypotenuse, add the squares of the legs and take the square root. To find a missing leg, <b>subtract</b>: ${S(V('b'), 2)} = ${S(V('c'), 2)} − ${S(V('a'), 2)}. The distance between two points is a hypotenuse too: the horizontal and vertical gaps are the legs.`) +
      example('Example', `${big(`Distance from ${PT(1, 2)} to ${PT(7, 10)}`)}The legs are 7 − 1 = 6 and 10 − 2 = 8. ${S(6, 2)} + ${S(8, 2)} = 36 + 64 = 100, and ${M.sqrt(100)} = <b>10</b>.`),
    make(rng) {
      const kind = rng.pick(['hyp', 'leg', 'distance', 'ladder']);
      const t = rng.pick(TRIPLES), k = t[2] > 25 ? 1 : rng.int(1, t[2] > 13 ? 2 : 4);
      let [a, b, c] = t.map(v => v * k); if (rng.bool()) [a, b] = [b, a];
      if (kind === 'distance') {
        const x1 = rng.int(-9, 9), y1 = rng.int(-9, 9), sx = rng.sign(), sy = rng.sign();
        const [dx, dy] = t[2] > 13 ? [t[0] * sx, t[1] * sy] : [a * sx, b * sy], d = Math.sqrt(dx * dx + dy * dy);
        const x2 = x1 + dx, y2 = y1 + dy;
        return { prompt: `What is the distance between ${PT(x1, y1)} and ${PT(x2, y2)}?`, type: 'number', answer: d, unit: 'units', params: { kind, x1, y1, x2, y2 },
          hints: [`Make a right triangle: the horizontal leg is |${N(x2)} − ${wrap(x1)}| = ${Math.abs(dx)} and the vertical leg is |${N(y2)} − ${wrap(y1)}| = ${Math.abs(dy)}.`,
            `${S(Math.abs(dx), 2)} + ${S(Math.abs(dy), 2)} = ${dx * dx} + ${dy * dy} = ${dx * dx + dy * dy}.`, `${M.sqrt(dx * dx + dy * dy)} = <b>${N(d)}</b> units.`] };
      }
      if (kind === 'ladder') {
        const name = rng.pick(NAMES);
        if (a > b) [a, b] = [b, a];                                // the foot is the short leg, so the ladder stands up steeply
        return { prompt: `${name} leans a ${N(c)} ft ladder against a wall. The foot of the ladder is ${N(a)} ft from the wall. How high up the wall does the ladder reach?`, type: 'number', answer: b, unit: 'ft', params: { kind, a, b, c },
          hints: [`The ladder is the hypotenuse (${N(c)} ft); the ground and the wall are the legs.`, `${S(V('b'), 2)} = ${S(c, 2)} − ${S(a, 2)} = ${c * c} − ${a * a} = ${c * c - a * a}.`, `${M.sqrt(c * c - a * a)} = <b>${N(b)} ft</b>.`] };
      }
      if (kind === 'hyp') {
        return { prompt: `A right triangle has legs of ${N(a)} cm and ${N(b)} cm. How long is the hypotenuse?`, type: 'number', answer: c, unit: 'cm', params: { kind, a, b, c },
          hints: [`Use ${S(V('a'), 2)} + ${S(V('b'), 2)} = ${S(V('c'), 2)}: ${S(a, 2)} + ${S(b, 2)} = ${a * a} + ${b * b} = ${c * c}.`, `${S(V('c'), 2)} = ${c * c}, so ${V('c')} = ${M.sqrt(c * c)}.`, `The hypotenuse is <b>${N(c)} cm</b>.`] };
      }
      return { prompt: `A right triangle has a hypotenuse of ${N(c)} cm and one leg of ${N(a)} cm. How long is the other leg?`, type: 'number', answer: b, unit: 'cm', params: { kind, a, b, c },
        hints: [`The hypotenuse is the longest side, so subtract: ${S(V('b'), 2)} = ${S(c, 2)} − ${S(a, 2)}.`, `${c * c} − ${a * a} = ${c * c - a * a}.`, `${M.sqrt(c * c - a * a)} = <b>${N(b)} cm</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'distance') return Math.abs(Math.hypot(p.x2 - p.x1, p.y2 - p.y1) - q.answer) < 1e-9 && Number.isInteger(q.answer);
      const legs = p.kind === 'hyp' ? [p.a, p.b, q.answer] : [p.a, q.answer, p.c];
      return legs[0] * legs[0] + legs[1] * legs[1] === legs[2] * legs[2];
    },
  });

  A.skill({
    id: 'math8.volume', title: 'Volume of cylinders, cones, and spheres',
    learn: p(`Each of these solids has a formula built on the area of a circle, π${S(V('r'), 2)}. <b>Cylinder:</b> ${V('V')} = π${S(V('r'), 2)}${V('h')} (the circle's area times the height). <b>Cone:</b> ${V('V')} = ${F(1, 3)}π${S(V('r'), 2)}${V('h')}, exactly one third of the cylinder with the same base and height. <b>Sphere:</b> ${V('V')} = ${F(4, 3)}π${S(V('r'), 3)}.`) +
      p(`Watch for a <b>diameter</b>: the radius is half of it. Volume is measured in cubic units such as cm³. In these exercises use <b>3.14 for π</b> and round to two decimal places.`) +
      example('Example', `${big('A cone with radius 3 cm and height 5 cm')}${V('V')} = ${F(1, 3)} × 3.14 × ${S(3, 2)} × 5 = ${F(1, 3)} × 3.14 × 45 = <b>47.1 cm³</b>.`),
    make(rng) {
      const shape = rng.pick(['cylinder', 'cone', 'sphere']), useD = rng.chance(0.3);
      const r = rng.int(1, 9), h = rng.int(2, 15), d = 2 * r;
      const size = useD ? `diameter ${d} cm` : `radius ${r} cm`;
      const ans = M.round(shape === 'cylinder' ? 3.14 * r * r * h : shape === 'cone' ? 3.14 * r * r * h / 3 : 4 * 3.14 * r * r * r / 3, 2);
      const prompt = shape === 'sphere' ? `What is the volume of a sphere with ${size}?` : `What is the volume of a ${shape} with ${size} and height ${h} cm?`;
      const formula = shape === 'cylinder' ? `${V('V')} = π${S(V('r'), 2)}${V('h')}` : shape === 'cone' ? `${V('V')} = ${F(1, 3)}π${S(V('r'), 2)}${V('h')}` : `${V('V')} = ${F(4, 3)}π${S(V('r'), 3)}`;
      const sub = shape === 'cylinder' ? `3.14 × ${S(r, 2)} × ${h} = 3.14 × ${r * r * h}` : shape === 'cone' ? `${F(1, 3)} × 3.14 × ${S(r, 2)} × ${h} = 3.14 × ${r * r * h} ÷ 3` : `${F(4, 3)} × 3.14 × ${S(r, 3)} = 4 × 3.14 × ${r * r * r} ÷ 3`;
      const hints = [];
      if (useD) hints.push(`The radius is half the diameter: ${d} ÷ 2 = ${r} cm.`);
      hints.push(`Use ${formula} with π ≈ 3.14.`, `${sub}.`, `That is ${N(ans)}, so the volume is <b>${N(ans)} cm³</b> (rounded to two decimal places).`);
      return { prompt: `${prompt} Use 3.14 for π and round to two decimal places.`, type: 'number', answer: ans, unit: 'cm³', tolerance: 0.05, hints, params: { shape, r, h } };
    },
    verify(q) {
      const { shape, r, h } = q.params;
      const cyl = 3.14 * r * r * h;
      const v = shape === 'cylinder' ? cyl : shape === 'cone' ? cyl / 3 : (2 / 3) * (3.14 * r * r * (2 * r));   // a sphere is 2/3 of the cylinder around it
      return Math.abs(v - q.answer) < 0.006;
    },
  });

  A.skill({
    id: 'math8.triangle-angles', title: 'Angles in triangles',
    learn: p(`The three <b>interior angles</b> of any triangle add up to <b>180°</b>. So if you know two of them, subtract their sum from 180° to get the third.`) +
      p(`An <b>exterior angle</b> is formed by extending one side. It sits on a straight line with its neighbouring interior angle, so the two add to 180°. That makes the exterior angle equal to the <b>sum of the two remote interior angles</b> (the two that are not next to it).`) +
      example('Example', `A triangle has angles 48° and 67°. The third is 180° − (48° + 67°) = 180° − 115° = <b>65°</b>. The exterior angle next to it is 48° + 67° = 115°.`),
    make(rng) {
      const kind = rng.pick(['third', 'third', 'exterior', 'remote', 'algebra']);
      let A1 = rng.int(25, 95), B1 = rng.int(20, 155 - A1); const C1 = 180 - A1 - B1;
      if (kind === 'third') return { prompt: `Two angles of a triangle measure ${M.deg(A1)} and ${M.deg(B1)}. What is the third angle?`, type: 'number', answer: C1, unit: '°', params: { kind, A1, B1 },
        hints: [`The angles of a triangle add to 180°.`, `${A1}° + ${B1}° = ${A1 + B1}°.`, `180° − ${A1 + B1}° = <b>${C1}°</b>.`] };
      if (kind === 'exterior') return { prompt: `In a triangle, two interior angles measure ${M.deg(A1)} and ${M.deg(B1)}. What is the exterior angle at the third vertex?`, type: 'number', answer: A1 + B1, unit: '°', params: { kind, A1, B1 },
        hints: [`The exterior angle equals the sum of the two remote interior angles — here, the two you are given.`, `(Check: the third interior angle is ${C1}°, and the exterior angle is 180° − ${C1}°.)`, `${A1}° + ${B1}° = <b>${A1 + B1}°</b>.`] };
      if (kind === 'remote') return { prompt: `An exterior angle of a triangle measures ${M.deg(A1 + B1)}. One of the two remote interior angles measures ${M.deg(A1)}. What is the other remote interior angle?`, type: 'number', answer: B1, unit: '°', params: { kind, A1, B1 },
        hints: [`The exterior angle equals the sum of the two remote interior angles: ${A1}° + ? = ${A1 + B1}°.`, `${A1 + B1}° − ${A1}° = <b>${B1}°</b>.`] };
      const k = rng.int(2, 4), xv = rng.int(10, Math.floor((180 - A1 - 5) / (k + 1))), extra = 180 - A1 - (k + 1) * xv;
      return { prompt: `The angles of a triangle are ${M.deg(A1)}, ${X}°, and (${k}${X} ${M.signed(extra)})°. What is the value of ${X}?`, type: 'number', answer: xv, params: { kind, A1, k, extra },
        hints: [`The angles add to 180°: ${A1} + ${X} + ${k}${X} ${M.signed(extra)} = 180.`, `Combine: ${k + 1}${X} + ${A1 + extra} = 180, so ${k + 1}${X} = ${180 - A1 - extra}.`, `${X} = ${180 - A1 - extra} ÷ ${k + 1} = <b>${xv}</b>.`] };
    },
    verify(q) {
      const p = q.params, a = q.answer;
      if (p.kind === 'third') return p.A1 + p.B1 + a === 180 && a > 0;
      if (p.kind === 'exterior') { const third = 180 - p.A1 - p.B1; return a + third === 180; }          // exterior + its neighbour make a straight line
      if (p.kind === 'remote') { const ext = p.A1 + p.B1, third = 180 - p.A1 - a; return third > 0 && third + ext === 180; }
      return p.A1 + a + (p.k * a + p.extra) === 180 && p.k * a + p.extra > 0;
    },
  });

  A.skill({
    id: 'math8.transformations', title: 'Translations, reflections, and rotations',
    learn: p(`A <b>translation</b> slides a point: “3 left and 2 up” sends ${PT('x', 'y').replace('x', X).replace('y', Y)} to (${X} − 3, ${Y} + 2). A <b>reflection over the ${X}-axis</b> flips the sign of ${Y}: (${X}, −${Y}). A <b>reflection over the ${Y}-axis</b> flips the sign of ${X}: (−${X}, ${Y}).`) +
      p(`Rotations about the origin: <b>90° counterclockwise</b> sends (${X}, ${Y}) to (−${Y}, ${X}); <b>90° clockwise</b> sends it to (${Y}, −${X}); <b>180°</b> sends it to (−${X}, −${Y}). Sketching the point on a grid is a quick way to check you turned the right way.`) +
      example('Example', `Rotate ${PT(4, 1)} by 90° counterclockwise about the origin. (${X}, ${Y}) → (−${Y}, ${X}) gives <b>${PT(-1, 4)}</b>.`),
    make(rng) {
      const x = rng.nz(-8, 8), y = rng.nz(-8, 8);
      const kind = rng.pick(['translate', 'reflect-x', 'reflect-y', 'rot90ccw', 'rot90cw', 'rot180']);
      const dx = rng.nz(-6, 6), dy = rng.nz(-6, 6);
      const img = { translate: [x + dx, y + dy], 'reflect-x': [x, -y], 'reflect-y': [-x, y], rot90ccw: [-y, x], rot90cw: [y, -x], rot180: [-x, -y] };
      const say = { translate: `translated ${Math.abs(dx)} unit${Math.abs(dx) > 1 ? 's' : ''} ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} unit${Math.abs(dy) > 1 ? 's' : ''} ${dy > 0 ? 'up' : 'down'}`, 'reflect-x': `reflected over the ${X}-axis`, 'reflect-y': `reflected over the ${Y}-axis`, rot90ccw: 'rotated 90° counterclockwise about the origin', rot90cw: 'rotated 90° clockwise about the origin', rot180: 'rotated 180° about the origin' }[kind];
      const rule = { translate: `(${X} ${M.signed(dx)}, ${Y} ${M.signed(dy)})`, 'reflect-x': `(${X}, −${Y})`, 'reflect-y': `(−${X}, ${Y})`, rot90ccw: `(−${Y}, ${X})`, rot90cw: `(${Y}, −${X})`, rot180: `(−${X}, −${Y})` }[kind];
      const answer = PT(...img[kind]);
      const wrong = kind === 'translate' ? [[x + dy, y + dx], [x - dx, y - dy], [x + dx, y - dy], [x - dx, y + dy]] : Object.keys(img).filter(k => k !== kind && k !== 'translate').map(k => img[k]).concat([[y, x]]);
      const choices = [answer].concat(distinct(answer, rng.shuffle(wrong).map(w => PT(...w)), 3));
      return { prompt: `The point ${PT(x, y)} is ${say}. What are the coordinates of its image?`, type: 'choice', choices, answer, params: { kind, x, y, dx, dy },
        hints: [`The rule for this transformation is (${X}, ${Y}) → ${rule}.`, `Here ${X} = ${N(x)} and ${Y} = ${N(y)}.`, `The image is <b>${answer}</b>.`] };
    },
    verify(q) {
      const { kind, x, y, dx, dy } = q.params, got = parsePt(q.answer); if (!got) return false;
      if (kind === 'translate') return got[0] - x === dx && got[1] - y === dy;
      if (kind === 'reflect-x' || kind === 'reflect-y') {                       // a reflection leaves the midpoint on the mirror line and the segment perpendicular to it
        const mx = (x + got[0]) / 2, my = (y + got[1]) / 2;
        return kind === 'reflect-x' ? my === 0 && got[0] === x : mx === 0 && got[1] === y;
      }
      const t = { rot90ccw: Math.PI / 2, rot90cw: -Math.PI / 2, rot180: Math.PI }[kind];   // rotate with cos and sin
      const rx = Math.round(x * Math.cos(t) - y * Math.sin(t)), ry = Math.round(x * Math.sin(t) + y * Math.cos(t));
      return got[0] === rx && got[1] === ry;
    },
  });

  /* ---------- Unit 6: Data and modelling ---------- */
  A.skill({
    id: 'math8.two-way-tables', title: 'Two-way tables',
    learn: p(`A <b>two-way table</b> sorts the same group of people by two questions at once: one along the rows, one along the columns. Each cell counts the people who fit both. The totals at the end of each row and column add up the cells, so a missing cell can be found by subtracting.`) +
      p(`A <b>row relative frequency</b> compares a cell with its row total: cell ÷ row total, written as a percent. It answers questions like “what percent of the 8th graders chose soccer?” Use the row total, not the grand total, as the bottom of the fraction.`) +
      example('Example', `40 students in 7th grade were asked; 30 of them have a pet. The row relative frequency is 30 ÷ 40 = 0.75 = <b>75%</b>.`),
    make(rng) {
      const set = rng.pick([
        { rows: ['7th grade', '8th grade'], cols: ['Has a pet', 'No pet'], who: 'students', q: (r, c) => `${c === 0 ? 'have a pet' : 'have no pet'}`, of: r => `${r} students` },
        { rows: ['Plays a sport', 'No sport'], cols: ['Plays music', 'No music'], who: 'students', q: (r, c) => `${c === 0 ? 'play music' : 'do not play music'}`, of: r => `students who ${r === 'Plays a sport' ? 'play a sport' : 'do not play a sport'}` },
        { rows: ['Walks to school', 'Rides to school'], cols: ['Eats breakfast', 'Skips breakfast'], who: 'students', q: (r, c) => `${c === 0 ? 'eat breakfast' : 'skip breakfast'}`, of: r => `students who ${r === 'Walks to school' ? 'walk' : 'ride'} to school` },
      ]);
      const totals = [rng.pick([20, 25, 40, 50]), rng.pick([20, 25, 40, 50])];
      const cell = totals.map(t => { const step = 100 / t; return t * rng.pick([20, 30, 40, 60, 70, 80, 25, 75].filter(pc => (pc / step) % 1 === 0)) / 100; });
      const grid = [[cell[0], totals[0] - cell[0]], [cell[1], totals[1] - cell[1]]];
      const colT = [grid[0][0] + grid[1][0], grid[0][1] + grid[1][1]], all = totals[0] + totals[1];
      const kind = rng.pick(['missing', 'pct', 'pct']);
      const r = rng.int(0, 1), c = rng.int(0, 1);
      const shownGrid = grid.map((row, i) => row.map((v, j) => (kind === 'missing' && i === r && j === c) ? '?' : N(v)));
      const table = M.table(['', set.cols[0], set.cols[1], 'Total'], [[`<b>${set.rows[0]}</b>`, ...shownGrid[0], N(totals[0])], [`<b>${set.rows[1]}</b>`, ...shownGrid[1], N(totals[1])], ['<b>Total</b>', N(colT[0]), N(colT[1]), N(all)]]);
      if (kind === 'missing') {
        const other = grid[r][1 - c];
        return { prompt: `A survey of ${all} students. What number belongs in the cell marked “?”${table}`, type: 'number', answer: grid[r][c], params: { kind, grid, r, c, totals },
          hints: [`Use the row total for “${set.rows[r]}”: the two cells in that row add to ${N(totals[r])}.`, `The other cell in the row is ${N(other)}, so ? = ${N(totals[r])} − ${N(other)}.`, `? = <b>${N(grid[r][c])}</b>. (Check with the column total: ${N(colT[c])} − ${N(grid[1 - r][c])} = ${N(grid[r][c])}.)`] };
      }
      const pc = M.round(grid[r][c] / totals[r] * 100, 4);
      return { prompt: `A survey of ${all} students. What percent of the ${set.of(set.rows[r])} ${set.q(r, c)}?${table}`, type: 'number', answer: pc, unit: '%', params: { kind, grid, r, c, totals },
        hints: [`This is a row relative frequency: use the “${set.rows[r]}” row only.`, `The cell is ${N(grid[r][c])} and the row total is ${N(totals[r])}: ${N(grid[r][c])} ÷ ${N(totals[r])} = ${N(pc / 100)}.`, `${N(pc / 100)} × 100 = <b>${N(pc)}%</b>.`] };
    },
    verify(q) {
      const { kind, grid, r, c, totals } = q.params;
      if (grid[r][0] + grid[r][1] !== totals[r]) return false;
      if (kind === 'missing') return q.answer === grid[r][c] && q.answer >= 0;
      return Math.abs(q.answer * totals[r] - 100 * grid[r][c]) < 1e-6;          // cross-multiply instead of dividing
    },
  });

  /** an inline SVG scatter plot of points in 0–10 × 0–10 */
  function scatterSvg(pts, xl, yl) {
    const X0 = 40, Y0 = 170, s = 15;
    const grid = [0, 2, 4, 6, 8, 10].map(v => `<line class="light" x1="${X0 + v * s}" y1="${Y0}" x2="${X0 + v * s}" y2="${Y0 - 150}"/><line class="light" x1="${X0}" y1="${Y0 - v * s}" x2="${X0 + 150}" y2="${Y0 - v * s}"/>`).join('');
    const dots = pts.map(([x, y]) => `<circle cx="${X0 + x * s}" cy="${Y0 - y * s}" r="4" class="fill"/>`).join('');
    return `<svg class="figure" viewBox="0 0 210 210" width="260" role="img" aria-label="Scatter plot of ${M.esc(yl)} against ${M.esc(xl)}">${grid}<line class="stroke" x1="${X0}" y1="${Y0}" x2="${X0 + 155}" y2="${Y0}"/><line class="stroke" x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y0 - 155}"/>${dots}<text x="${X0 + 75}" y="198" text-anchor="middle" font-size="12">${M.esc(xl)}</text><text x="14" y="${Y0 - 75}" text-anchor="middle" font-size="12" transform="rotate(-90 14 ${Y0 - 75})">${M.esc(yl)}</text></svg>`;
  }
  const corr = pts => {
    const n = pts.length, mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
    let sxy = 0, sxx = 0, syy = 0; pts.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; });
    return sxy / Math.sqrt(sxx * syy);
  };

  /** share of pairs of dots that rise minus share that fall (Kendall's tau) */
  const kendall = pts => {
    let up = 0, down = 0;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const s = (pts[j][0] - pts[i][0]) * (pts[j][1] - pts[i][1]); if (s > 0) up++; else if (s < 0) down++; }
    return (up - down) / (pts.length * (pts.length - 1) / 2);
  };

  A.skill({
    id: 'math8.scatter-plots', title: 'Describing scatter plots',
    learn: p(`A <b>scatter plot</b> shows pairs of measurements as dots, one dot per person or thing. Read it from left to right. If the dots tend to <b>rise</b>, the two quantities have a <b>positive association</b>: as one goes up, the other tends to go up. If they tend to <b>fall</b>, it is a <b>negative association</b>.`) +
      p(`If the dots form a shapeless cloud with no upward or downward drift, there is <b>no association</b>. When the dots hug a straight line the association is <b>linear</b>; the closer they hug it, the stronger it is. An association is a tendency, not a rule for every single dot.`) +
      example('Example', `Hours spent practising piano each week against mistakes made in a recital: more practice, fewer mistakes. The dots fall from left to right, a <b>negative association</b>.`),
    make(rng) {
      const kind = rng.pick(['positive', 'negative', 'none']);
      const ctx = rng.pick([
        { xl: 'Hours of study', yl: 'Test score', pos: true },
        { xl: 'Hours of practice', yl: 'Mistakes', pos: false },
        { xl: 'Height', yl: 'Shoe size', pos: true },
        { xl: 'Phone age (years)', yl: 'Battery life', pos: false },
        { xl: 'Temperature', yl: 'Ice creams sold', pos: true },
        { xl: 'Age of tree', yl: 'Trunk width', pos: true },
        { xl: 'Ticket price', yl: 'Tickets sold', pos: false },
        { xl: 'Screen time', yl: 'Hours of sleep', pos: false },
        { xl: 'Day of the month', yl: 'Rainfall', pos: null },
        { xl: 'Shoe size', yl: 'Test score', pos: null },
        { xl: 'House number', yl: 'Number of pets', pos: null },
        { xl: 'Birth month', yl: 'Height', pos: null },
      ].filter(c => kind === 'none' ? c.pos === null : c.pos === (kind === 'positive')));
      let pts, r, tries = 0;
      do {
        const xs = rng.sample([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5], 10);
        const b = kind === 'negative' ? rng.int(8, 9) : rng.int(1, 2), m = kind === 'positive' ? rng.dec(0.6, 0.8, 2) : kind === 'negative' ? -rng.dec(0.6, 0.8, 2) : 0;
        pts = xs.map(x => [x, Math.min(9.8, Math.max(0.2, kind === 'none' ? rng.dec(1, 9, 1) : M.round(b + m * x + rng.dec(-1.2, 1.2, 1), 1)))]);
        r = corr(pts); tries++;
      } while ((kind === 'none' ? Math.abs(r) > 0.2 || Math.abs(kendall(pts)) > 0.2 : Math.abs(r) < 0.75 || Math.abs(kendall(pts)) < 0.5) && tries < 200);
      const choices = ['Positive association', 'Negative association', 'No association'];
      const answer = { positive: choices[0], negative: choices[1], none: choices[2] }[kind];
      const hints = [`Read the dots from left to right, as ${ctx.xl.toLowerCase()} increases.`,
        kind === 'none' ? `The dots are scattered all over, with no upward or downward drift.` : `The dots tend to ${kind === 'positive' ? 'rise' : 'fall'}: larger values of ${ctx.xl.toLowerCase()} go with ${kind === 'positive' ? 'larger' : 'smaller'} values of ${ctx.yl.toLowerCase()}.`,
        `<b>${answer}</b>.`];
      return { prompt: `The scatter plot shows ${ctx.yl.toLowerCase()} against ${ctx.xl.toLowerCase()}. What kind of association does it show?${scatterSvg(pts, ctx.xl, ctx.yl)}`, type: 'choice', choices, answer, keepOrder: true, hints, params: { pts } };
    },
    verify(q) {
      const tau = kendall(q.params.pts);                         // rising vs falling pairs of dots, read straight from the points
      const want = tau > 0.4 ? 'Positive association' : tau < -0.4 ? 'Negative association' : Math.abs(tau) < 0.3 ? 'No association' : 'unclear';
      return q.answer === want || ('unclear: tau ' + tau.toFixed(2));
    },
  });

})();
