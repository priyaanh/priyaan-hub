/* 7th grade math. Negative numbers, fractions and percents, rates, expressions and equations,
   geometry, statistics and probability. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = (s) => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;

  A.course({
    id: 'math-7', title: '7th grade math', subject: 'Middle school', grade: 7, icon: '➗', hue: 215,
    blurb: 'Negative numbers, fractions and percents, rates and proportions, expressions and equations, geometry, statistics and probability.',
    units: [
      { id: 'negatives-add', title: 'Negative numbers: addition and subtraction', blurb: 'Adding and subtracting on both sides of zero.', skills: ['math7.add-negatives', 'math7.sub-negatives', 'math7.abs-distance'] },
      { id: 'negatives-mul', title: 'Negative numbers: multiplication and division', blurb: 'The sign rules, and expressions that mix the operations.', skills: ['math7.mul-div-negatives', 'math7.order-ops-negatives'] },
      { id: 'fractions', title: 'Fractions, decimals, and percentages', blurb: 'The same number three ways, and arithmetic with fractions.', skills: ['math7.add-sub-fractions', 'math7.mul-div-fractions', 'math7.convert-fdp', 'math7.percent-of'] },
      { id: 'rates', title: 'Rates and proportional relationships', blurb: 'Unit rates, proportional tables, the constant of proportionality, percent change.', skills: ['math7.unit-rate', 'math7.proportional-table', 'math7.constant-k', 'math7.percent-change'] },
      { id: 'expressions', title: 'Expressions, equations, and inequalities', blurb: 'Simplifying, expanding, and solving in two steps.', skills: ['math7.combine-like-terms', 'math7.distribute', 'math7.two-step-equations', 'math7.two-step-inequalities'] },
      { id: 'geometry', title: 'Geometry', blurb: 'Circles, angle pairs, and scale drawings.', skills: ['math7.circles', 'math7.angle-pairs', 'math7.scale-drawings'] },
      { id: 'stats', title: 'Statistics and probability', blurb: 'Describing data with one number, and the chance of an event.', skills: ['math7.mean-median', 'math7.simple-probability', 'math7.compound-probability'] },
    ],
  });

  /* ---------- Unit 1 ---------- */
  A.skill({
    id: 'math7.add-negatives', title: 'Adding negative numbers',
    learn: p('On a number line, adding a positive number moves you to the right and adding a negative number moves you to the left.') +
      p('<b>Same signs:</b> add the sizes and keep the sign. −4 + (−3) = −7.<br><b>Different signs:</b> subtract the smaller size from the larger, and keep the sign of the number with the larger size. −9 + 4 = −5, because 9 − 4 = 5 and the 9 was negative.') +
      example('Example', `${big('−12 + 7')}The signs differ. 12 − 7 = 5, and 12 is the bigger size and it was negative, so the answer is <b>−5</b>.`),
    make(rng) {
      let a = rng.nz(-20, 20), b = rng.nz(-20, 20);
      if (a > 0 && b > 0) a = -a;
      const ans = a + b;
      const bTxt = b < 0 ? `(${N(b)})` : N(b);
      const hints = [];
      if ((a < 0) === (b < 0)) hints.push(`Both numbers are negative, so add their sizes: ${N(Math.abs(a))} + ${N(Math.abs(b))} = ${N(Math.abs(a) + Math.abs(b))}, and keep the negative sign.`);
      else hints.push(`The signs are different, so subtract the sizes: ${N(Math.max(Math.abs(a), Math.abs(b)))} − ${N(Math.min(Math.abs(a), Math.abs(b)))} = ${N(Math.abs(Math.abs(a) - Math.abs(b)))}. The answer takes the sign of ${N(Math.abs(a) >= Math.abs(b) ? a : b)}, the number with the larger size.`);
      hints.push(`Picture the number line: start at ${N(a)} and move ${N(Math.abs(b))} to the ${b < 0 ? 'left' : 'right'}.`);
      hints.push(`${N(a)} + ${bTxt} = <b>${N(ans)}</b>.`);
      return { prompt: `Add.${big(`${N(a)} + ${bTxt} = ?`)}`, type: 'number', answer: ans, hints, params: { a, b } };
    },
    verify(q) { return q.answer === q.params.a + q.params.b; },
  });

  A.skill({
    id: 'math7.sub-negatives', title: 'Subtracting negative numbers',
    learn: p('Subtracting a number is the same as adding its opposite. So every subtraction can be rewritten as an addition, and then the addition rules take over.') +
      p(`${V('a')} − ${V('b')} = ${V('a')} + (−${V('b')}), and ${V('a')} − (−${V('b')}) = ${V('a')} + ${V('b')}. Two minus signs next to each other make a plus.`) +
      example('Example', `${big('−3 − (−8)')}Subtracting −8 is adding 8: −3 + 8 = <b>5</b>.`),
    make(rng) {
      let a = rng.nz(-20, 20), b = rng.nz(-20, 20);
      if (a > 0 && b > 0 && rng.chance(0.7)) b = -b;
      const ans = a - b;
      const bTxt = b < 0 ? `(${N(b)})` : N(b);
      const hints = [
        `Subtracting is adding the opposite. Rewrite ${N(a)} − ${bTxt} as ${N(a)} + ${-b < 0 ? `(${N(-b)})` : N(-b)}.`,
        (a < 0) === (-b < 0) ? `Same signs: add the sizes ${N(Math.abs(a))} + ${N(Math.abs(b))} = ${N(Math.abs(a) + Math.abs(b))} and keep the sign.` : `Different signs: subtract the sizes, ${N(Math.max(Math.abs(a), Math.abs(b)))} − ${N(Math.min(Math.abs(a), Math.abs(b)))} = ${N(Math.abs(Math.abs(a) - Math.abs(b)))}, and keep the sign of the larger one.`,
        `${N(a)} − ${bTxt} = <b>${N(ans)}</b>.`,
      ];
      return { prompt: `Subtract.${big(`${N(a)} − ${bTxt} = ?`)}`, type: 'number', answer: ans, hints, params: { a, b } };
    },
    verify(q) { return q.answer === q.params.a - q.params.b; },
  });

  A.skill({
    id: 'math7.abs-distance', title: 'Absolute value and distance',
    learn: p('The absolute value of a number is its distance from zero, so it is never negative: |−7| = 7 and |7| = 7.') +
      p(`The distance between two numbers on the number line is the absolute value of their difference: distance from ${V('a')} to ${V('b')} is |${V('a')} − ${V('b')}|. The order does not matter, because |−5| and |5| are both 5.`) +
      example('Example', `How far apart are −6 and 9? |−6 − 9| = |−15| = <b>15</b>.`),
    make(rng) {
      const kind = rng.pick(['abs', 'dist', 'dist', 'temp']);
      if (kind === 'abs') {
        const inner = rng.nz(-30, 30), shift = rng.int(0, 1) ? rng.nz(-9, 9) : 0;
        const ans = Math.abs(inner) + shift;
        const expr = shift ? `${M.abs(N(inner))} ${M.signed(shift)}` : M.abs(N(inner));
        return { prompt: `Evaluate.${big(expr)}`, type: 'number', answer: ans, params: { kind, inner, shift }, hints: [`|${N(inner)}| is the distance of ${N(inner)} from zero, which is ${N(Math.abs(inner))}.`, shift ? `Then ${N(Math.abs(inner))} ${M.signed(shift)} = <b>${N(ans)}</b>.` : `So the value is <b>${N(ans)}</b>.`] };
      }
      const a = rng.int(-25, 25); let b = rng.int(-25, 25); if (b === a) b += 3;
      const ans = Math.abs(a - b);
      if (kind === 'temp') {
        return { prompt: `The temperature at dawn was ${N(a)}°C. By noon it was ${N(b)}°C. By how many degrees did it change?`, type: 'number', answer: ans, unit: '°C', params: { kind, a, b },
          hints: [`The change is the distance between the two readings on the number line: |${N(b)} − ${N(a)}|.`, `${N(b)} − ${N(a)} = ${N(b - a)}, and its absolute value is <b>${N(ans)}</b> degrees.`] };
      }
      return { prompt: `How far apart are ${N(a)} and ${N(b)} on the number line?`, type: 'number', answer: ans, params: { kind, a, b },
        hints: [`Distance is the absolute value of the difference: |${N(a)} − ${N(b)}|.`, `${N(a)} − ${N(b)} = ${N(a - b)}, and |${N(a - b)}| = <b>${N(ans)}</b>.`] };
    },
    verify(q) { const p = q.params; if (p.kind === 'abs') return q.answer === Math.abs(p.inner) + p.shift; return q.answer === Math.max(p.a, p.b) - Math.min(p.a, p.b); },
  });

  /* ---------- Unit 2 ---------- */
  A.skill({
    id: 'math7.mul-div-negatives', title: 'Multiplying and dividing negative numbers',
    learn: p('Multiply or divide the sizes as usual, then decide the sign: <b>same signs give a positive</b>, <b>different signs give a negative</b>.') +
      p('(−6) × (−4) = 24 because both are negative. 36 ÷ (−9) = −4 because the signs differ. With three or more factors, count the negatives: an even number of them gives a positive, an odd number gives a negative.') +
      example('Example', `${big('(−3) × 5 × (−2)')}Two negatives, so the result is positive: 3 × 5 × 2 = <b>30</b>.`),
    make(rng) {
      const kind = rng.pick(['mul', 'mul', 'div', 'triple']);
      const wrap = x => x < 0 ? `(${N(x)})` : N(x);
      if (kind === 'triple') {
        const f = [rng.nz(-6, 6), rng.nz(-6, 6), rng.nz(-6, 6)];
        if (f.every(x => x > 0)) f[1] = -f[1];
        const ans = f[0] * f[1] * f[2], negs = f.filter(x => x < 0).length;
        return { prompt: `Multiply.${big(f.map(wrap).join(' × '))}`, type: 'number', answer: ans, params: { kind, f },
          hints: [`Multiply the sizes first: ${f.map(x => Math.abs(x)).join(' × ')} = ${N(Math.abs(ans))}.`, `Count the negative factors: ${negs}. ${negs % 2 ? 'An odd number of negatives makes the product negative.' : 'An even number of negatives makes the product positive.'}`, `So the product is <b>${N(ans)}</b>.`] };
      }
      if (kind === 'div') {
        const q = rng.nz(-12, 12); let d = rng.nz(-12, 12);
        if (q > 0 && d > 0) d = -d;              // keep at least one negative in sight
        const dividend = q * d;
        return { prompt: `Divide.${big(`${wrap(dividend)} ÷ ${wrap(d)}`)}`, type: 'number', answer: q, params: { kind, dividend, d },
          hints: [`Divide the sizes: ${N(Math.abs(dividend))} ÷ ${N(Math.abs(d))} = ${N(Math.abs(q))}.`, `${(dividend < 0) === (d < 0) ? 'Same signs, so the quotient is positive.' : 'Different signs, so the quotient is negative.'}`, `${wrap(dividend)} ÷ ${wrap(d)} = <b>${N(q)}</b>.`] };
      }
      let a = rng.nz(-12, 12), b = rng.nz(-12, 12);
      if (a > 0 && b > 0) a = -a;
      return { prompt: `Multiply.${big(`${wrap(a)} × ${wrap(b)}`)}`, type: 'number', answer: a * b, params: { kind, a, b },
        hints: [`Multiply the sizes: ${N(Math.abs(a))} × ${N(Math.abs(b))} = ${N(Math.abs(a * b))}.`, `${(a < 0) === (b < 0) ? 'Same signs, so the product is positive.' : 'Different signs, so the product is negative.'}`, `${wrap(a)} × ${wrap(b)} = <b>${N(a * b)}</b>.`] };
    },
    verify(q) { const p = q.params; if (p.kind === 'triple') return q.answer === p.f[0] * p.f[1] * p.f[2]; if (p.kind === 'div') return q.answer * p.d === p.dividend; return q.answer === p.a * p.b; },
  });

  A.skill({
    id: 'math7.order-ops-negatives', title: 'Order of operations with negative numbers',
    learn: p('Work in this order: anything in <b>parentheses</b>, then <b>exponents</b>, then <b>multiplication and division</b> from left to right, then <b>addition and subtraction</b> from left to right.') +
      p('Negative numbers follow the same order; just keep the sign rules in mind at each step. Writing one step per line keeps the signs straight.') +
      example('Example', `${big('−4 + 3 × (−5)')}Multiply first: 3 × (−5) = −15. Then −4 + (−15) = <b>−19</b>.`),
    make(rng) {
      const wrap = x => x < 0 ? `(${N(x)})` : N(x);
      const form = rng.pick(['a+b*c', '(a+b)*c', 'a-b*c', 'a*b-c*d', 'a/b+c']);
      let a = rng.nz(-9, 9), b = rng.nz(-9, 9), c = rng.nz(-9, 9), d = rng.nz(-9, 9);
      let expr, ans, hints;
      if (form === 'a+b*c') { ans = a + b * c; expr = `${N(a)} + ${wrap(b)} × ${wrap(c)}`; hints = [`Multiply before adding: ${wrap(b)} × ${wrap(c)} = ${N(b * c)}.`, `Now add: ${N(a)} + ${wrap(b * c)} = <b>${N(ans)}</b>.`]; }
      else if (form === '(a+b)*c') { ans = (a + b) * c; expr = `(${N(a)} + ${wrap(b)}) × ${wrap(c)}`; hints = [`Parentheses first: ${N(a)} + ${wrap(b)} = ${N(a + b)}.`, `Then multiply: ${wrap(a + b)} × ${wrap(c)} = <b>${N(ans)}</b>.`]; }
      else if (form === 'a-b*c') { ans = a - b * c; expr = `${N(a)} − ${wrap(b)} × ${wrap(c)}`; hints = [`Multiply first: ${wrap(b)} × ${wrap(c)} = ${N(b * c)}.`, `Then subtract: ${N(a)} − ${wrap(b * c)} = <b>${N(ans)}</b>.`]; }
      else if (form === 'a*b-c*d') { ans = a * b - c * d; expr = `${wrap(a)} × ${wrap(b)} − ${wrap(c)} × ${wrap(d)}`; hints = [`Do both multiplications first: ${wrap(a)} × ${wrap(b)} = ${N(a * b)} and ${wrap(c)} × ${wrap(d)} = ${N(c * d)}.`, `Then subtract: ${N(a * b)} − ${wrap(c * d)} = <b>${N(ans)}</b>.`]; }
      else { a = b * rng.nz(-6, 6); ans = a / b + c; expr = `${wrap(a)} ÷ ${wrap(b)} + ${wrap(c)}`; hints = [`Divide first: ${wrap(a)} ÷ ${wrap(b)} = ${N(a / b)}.`, `Then add: ${N(a / b)} + ${wrap(c)} = <b>${N(ans)}</b>.`]; }
      return { prompt: `Evaluate.${big(expr)}`, type: 'number', answer: ans, hints, params: { form, a, b, c, d } };
    },
    verify(q) {
      const { form, a, b, c, d } = q.params;
      const expr = form.replace(/a/g, `(${a})`).replace(/b/g, `(${b})`).replace(/c/g, `(${c})`).replace(/d/g, `(${d})`);
      return Math.abs(new Function('return ' + expr)() - q.answer) < 1e-9;      // JavaScript's own precedence as the second opinion
    },
  });

  /* ---------- Unit 3 ---------- */
  A.skill({
    id: 'math7.add-sub-fractions', title: 'Adding and subtracting fractions',
    learn: p('Fractions can only be added or subtracted when they have the same denominator. Find a common denominator (the least common multiple works best), rewrite each fraction, then add or subtract the numerators and keep the denominator.') +
      p('Finish by simplifying: divide the top and bottom by their greatest common factor.') +
      example('Example', `${big(`${F(3, 4)} + ${F(1, 6)}`)}The least common denominator is 12. ${F(3, 4)} = ${F(9, 12, { raw: true })} and ${F(1, 6)} = ${F(2, 12, { raw: true })}. Add: ${F(11, 12)}.`),
    make(rng) {
      const dens = [2, 3, 4, 5, 6, 8, 9, 10, 12];
      let d1 = rng.pick(dens), d2 = rng.pick(dens);
      if (d1 === d2) d2 = dens[(dens.indexOf(d2) + 1) % dens.length];
      const coprime = d => { const opts = []; for (let k = 1; k < d; k++) if (M.gcd(k, d) === 1) opts.push(k); return rng.pick(opts); };
      const n1 = coprime(d1), n2 = coprime(d2);
      const sub = rng.bool();
      const lcd = d1 * d2 / M.gcd(d1, d2);
      const a = n1 * lcd / d1, b = n2 * lcd / d2;
      let num = sub ? a - b : a + b;
      if (num === 0) num = a + b;
      const [sn, sd] = M.simp(num, lcd);
      const op = (sub && a - b !== 0) ? '−' : '+';
      const ans = sn / sd;
      return { prompt: `${op === '−' ? 'Subtract' : 'Add'}. Give your answer as a fraction in simplest form.${big(`${F(n1, d1, { raw: true })} ${op} ${F(n2, d2, { raw: true })}`)}`, type: 'number', answer: ans, answerText: M.fracText(sn, sd), params: { n1, d1, n2, d2, op },
        hints: [`The least common denominator of ${d1} and ${d2} is ${lcd}.`, `Rewrite: ${F(n1, d1, { raw: true })} = ${F(a, lcd, { raw: true })} and ${F(n2, d2, { raw: true })} = ${F(b, lcd, { raw: true })}.`, `${op === '−' ? 'Subtract' : 'Add'} the numerators: ${N(a)} ${op} ${N(b)} = ${N(num)}, over ${lcd}.`, `${M.gcd(num, lcd) !== 1 ? `Simplify ${F(num, lcd, { raw: true })} by dividing top and bottom by ${M.gcd(num, lcd)}: ` : ''}<b>${F(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)})`}.`] };
    },
    verify(q) { const { n1, d1, n2, d2, op } = q.params; const v = n1 / d1 + (op === '−' ? -1 : 1) * n2 / d2; return Math.abs(v - q.answer) < 1e-9; },
  });

  A.skill({
    id: 'math7.mul-div-fractions', title: 'Multiplying and dividing fractions',
    learn: p('To multiply fractions, multiply the numerators and multiply the denominators, then simplify. Cancelling common factors first keeps the numbers small.') +
      p('To divide by a fraction, multiply by its reciprocal (flip it): ' + `${F(2, 3)} ÷ ${F(4, 5)} = ${F(2, 3)} × ${F(5, 4)} = ${F(10, 12, { raw: true })} = ${F(5, 6)}.`) +
      example('Example', `${big(`${F(3, 8)} × ${F(4, 9)}`)}Multiply across: ${F(12, 72, { raw: true })}, which simplifies to <b>${F(1, 6)}</b>.`),
    make(rng) {
      const d1 = rng.int(2, 9), d2 = rng.int(2, 9);
      const n1 = rng.int(1, 9), n2 = rng.int(1, 9);
      const div = rng.bool();
      const num = div ? n1 * d2 : n1 * n2, den = div ? d1 * n2 : d1 * d2;
      const [sn, sd] = M.simp(num, den);
      const whole = !div && rng.chance(0.25);
      if (whole) {
        const w = rng.int(2, 9);
        const [wn, wd] = M.simp(w * n1, d1);
        return { prompt: `Multiply. Give your answer as a fraction or whole number in simplest form.${big(`${N(w)} × ${F(n1, d1, { raw: true })}`)}`, type: 'number', answer: wn / wd, answerText: M.fracText(wn, wd), params: { kind: 'whole', w, n1, d1 },
          hints: [`A whole number is a fraction over 1: ${N(w)} = ${F(w, 1, { raw: true })}.`, `Multiply across: ${N(w)} × ${N(n1)} = ${N(w * n1)} on top, ${d1} underneath: ${F(w * n1, d1, { raw: true })}.`, `Simplify: <b>${F(wn, wd)}</b>${wd === 1 ? '' : ` (${M.fracText(wn, wd)})`}.`] };
      }
      return { prompt: `${div ? 'Divide' : 'Multiply'}. Give your answer as a fraction or whole number in simplest form.${big(`${F(n1, d1, { raw: true })} ${div ? '÷' : '×'} ${F(n2, d2, { raw: true })}`)}`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind: div ? 'div' : 'mul', n1, d1, n2, d2 },
        hints: (div ? [`Dividing by a fraction is multiplying by its reciprocal: ${F(n1, d1, { raw: true })} × ${F(d2, n2, { raw: true })}.`] : []).concat([
          `Multiply the numerators and the denominators: ${N(num)} over ${N(den)}, that is ${F(num, den, { raw: true })}.`,
          `Simplify by dividing top and bottom by ${M.gcd(num, den)}: <b>${F(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)})`}.`]) };
    },
    verify(q) { const p = q.params; const v = p.kind === 'whole' ? p.w * p.n1 / p.d1 : p.kind === 'div' ? (p.n1 / p.d1) / (p.n2 / p.d2) : (p.n1 / p.d1) * (p.n2 / p.d2); return Math.abs(v - q.answer) < 1e-9; },
  });

  A.skill({
    id: 'math7.convert-fdp', title: 'Fractions, decimals, and percents',
    learn: p('A fraction, a decimal and a percent can all name the same number. <b>Fraction → decimal:</b> divide the top by the bottom. <b>Decimal → percent:</b> multiply by 100 (move the point two places right). <b>Percent → fraction:</b> write it over 100 and simplify.') +
      p(`${F(3, 8)} = 0.375 = 37.5%. &nbsp; 0.6 = 60% = ${F(3, 5)}. &nbsp; 45% = ${F(45, 100, { raw: true })} = ${F(9, 20)}.`) +
      example('Example', `Write ${F(7, 20)} as a percent. 7 ÷ 20 = 0.35, and 0.35 × 100 = <b>35%</b>.`),
    make(rng) {
      const kind = rng.pick(['f2d', 'f2p', 'd2p', 'p2f', 'd2f', 'p2d']);
      const dens = [2, 4, 5, 8, 10, 20, 25, 50];
      const d = rng.pick(dens);
      let n = rng.int(1, d - 1); [n] = M.simp(n, d); const [sn, sd] = M.simp(n, d);
      const value = sn / sd, pctv = M.round(value * 100, 4), dec = M.round(value, 6);
      if (kind === 'f2d') return { prompt: `Write ${F(sn, sd)} as a decimal.`, type: 'number', answer: dec, params: { kind, sn, sd }, hints: [`A fraction is a division: ${sn} ÷ ${sd}.`, `${sd === 10 || sd === 100 ? 'The denominator is a power of ten, so just place the decimal point.' : `Make the denominator a power of ten: ${F(sn, sd)} = ${F(sn * (100 / sd) % 1 === 0 ? sn * 100 / sd : sn * 1000 / sd, (100 / sd) % 1 === 0 ? 100 : 1000, { raw: true })}.`}`, `${F(sn, sd)} = <b>${N(dec)}</b>.`] };
      if (kind === 'f2p') return { prompt: `Write ${F(sn, sd)} as a percent.`, type: 'number', answer: pctv, unit: '%', params: { kind, sn, sd }, hints: [`First make it a decimal: ${sn} ÷ ${sd} = ${N(dec)}.`, `Then multiply by 100: ${N(dec)} × 100 = ${N(pctv)}.`, `${F(sn, sd)} = <b>${N(pctv)}%</b>.`] };
      if (kind === 'd2p') return { prompt: `Write ${N(dec)} as a percent.`, type: 'number', answer: pctv, unit: '%', params: { kind, sn, sd }, hints: [`Percent means “per hundred”, so multiply by 100.`, `${N(dec)} × 100 = <b>${N(pctv)}%</b>.`] };
      if (kind === 'p2d') return { prompt: `Write ${N(pctv)}% as a decimal.`, type: 'number', answer: dec, params: { kind, sn, sd }, hints: [`Divide by 100: move the decimal point two places to the left.`, `${N(pctv)}% = <b>${N(dec)}</b>.`] };
      if (kind === 'p2f') return { prompt: `Write ${N(pctv)}% as a fraction in simplest form.`, type: 'number', answer: value, answerText: M.fracText(sn, sd), params: { kind, sn, sd }, hints: [`Write it over 100: ${F(pctv, 100, { raw: true })}.`, `Divide top and bottom by ${M.gcd(pctv, 100)}.`, `${N(pctv)}% = <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] };
      const places = String(dec).split('.')[1].length, pow = Math.pow(10, places);
      return { prompt: `Write ${N(dec)} as a fraction in simplest form.`, type: 'number', answer: value, answerText: M.fracText(sn, sd), params: { kind, sn, sd }, hints: [`${N(dec)} has ${places} decimal place${places > 1 ? 's' : ''}, so write it over ${N(pow)}: ${F(Math.round(dec * pow), pow, { raw: true })}.`, `Divide top and bottom by ${M.gcd(Math.round(dec * pow), pow)}.`, `${N(dec)} = <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] };
    },
    verify(q) { const { kind, sn, sd } = q.params; const v = sn / sd; const expect = (kind === 'f2p' || kind === 'd2p') ? v * 100 : v; return Math.abs(expect - q.answer) < 1e-9; },
  });

  A.skill({
    id: 'math7.percent-of', title: 'Percent of a number',
    learn: p('To find a percent of a number, turn the percent into a decimal and multiply: 35% of 80 is 0.35 × 80 = 28.') +
      p('Useful landmarks: 10% is one tenth (move the point one place), 50% is half, 25% is a quarter, 1% is one hundredth. 15% of 60 is 10% (6) plus 5% (3), which is 9.') +
      example('Example', `${big('What is 12% of 250?')}0.12 × 250 = <b>30</b>. Or: 10% is 25 and 2% is 5, so 12% is 30.`),
    make(rng) {
      const pcts = [5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 60, 65, 70, 75, 80, 90];
      const pc = rng.pick(pcts);
      const base = rng.pick([20, 40, 50, 60, 80, 120, 150, 200, 240, 300, 400, 500, 640, 800, 1200]);
      const ans = M.round(pc * base / 100, 4);
      const kind = rng.pick(['plain', 'plain', 'word']);
      const name = rng.pick(NAMES);
      const prompt = kind === 'plain' ? `What is ${pc}% of ${N(base)}?` : rng.pick([
        `A class has ${N(base)} students and ${pc}% of them walk to school. How many students walk?`,
        `${name} has saved ${M.money(base)} and spends ${pc}% of it on a game. How much does the game cost?`,
        `A ${N(base)}-page book is ${pc}% read. How many pages have been read?`]);
      return { prompt, type: 'number', answer: ans, params: { pc, base }, tolerance: 0.001,
        hints: [`Write the percent as a decimal: ${pc}% = ${N(pc / 100)}.`, `Multiply: ${N(pc / 100)} × ${N(base)} = ${N(ans)}.`, `Check with 10%: 10% of ${N(base)} is ${N(base / 10)}, and ${pc}% is ${N(pc / 10)} times that. The answer is <b>${N(ans)}</b>.`] };
    },
    verify(q) { return Math.abs(q.answer - q.params.pc * q.params.base / 100) < 1e-6; },
  });

  /* ---------- Unit 4 ---------- */
  A.skill({
    id: 'math7.unit-rate', title: 'Unit rates',
    learn: p('A rate compares two quantities with different units, like 150 miles in 3 hours. A <b>unit rate</b> tells how much of the first for <b>one</b> of the second: divide. 150 ÷ 3 = 50 miles per hour.') +
      p('Unit rates make comparisons fair: 12 pens for $9 is $0.75 per pen; 8 pens for $6.40 is $0.80 per pen, so the first pack is the better deal.') +
      example('Example', `${big('A printer prints 180 pages in 4 minutes. Pages per minute?')}180 ÷ 4 = <b>45</b> pages per minute.`),
    make(rng) {
      const name = rng.pick(NAMES);
      const kinds = [
        () => { const r = rng.int(35, 75), t = rng.int(2, 6); return { prompt: `A train travels ${N(r * t)} km in ${t} hours at a steady speed. How many kilometres does it travel per hour?`, ans: r, unit: 'km/h', a: r * t, b: t, what: 'kilometres', per: 'hour' }; },
        () => { const r = rng.pick([0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 1.2, 1.25, 1.5, 2.5]), n = rng.int(4, 12); return { prompt: `${n} notebooks cost ${M.money(M.round(r * n, 2))}. What is the cost per notebook?`, ans: r, unit: '$', a: M.round(r * n, 2), b: n, what: 'dollars', per: 'notebook' }; },
        () => { const r = rng.int(20, 60), t = rng.int(3, 9); return { prompt: `${name} reads ${N(r * t)} pages in ${t} days, the same number each day. How many pages per day is that?`, ans: r, unit: 'pages/day', a: r * t, b: t, what: 'pages', per: 'day' }; },
        () => { const r = rng.pick([1.5, 2, 2.5, 3, 4, 6]), t = rng.int(2, 8); return { prompt: `A tap fills ${N(r * t)} litres in ${t} minutes. How many litres per minute?`, ans: r, unit: 'L/min', a: M.round(r * t, 2), b: t, what: 'litres', per: 'minute' }; },
        () => { const r = rng.int(8, 25), t = rng.int(3, 12); return { prompt: `${name} earns ${M.money(r * t)} for ${t} hours of work. How much is that per hour?`, ans: r, unit: '$/hour', a: r * t, b: t, what: 'dollars', per: 'hour' }; },
      ];
      const k = rng.pick(kinds)();
      return { prompt: k.prompt, type: 'number', answer: k.ans, unit: k.unit, params: { a: k.a, b: k.b }, tolerance: 0.005,
        hints: [`A unit rate is “how many ${k.what} for one ${k.per}”. Divide the ${k.what} by the number of ${k.per}s.`, `${N(k.a)} ÷ ${N(k.b)} = ${N(k.ans)}.`, `The unit rate is <b>${N(k.ans)}</b> ${k.what} per ${k.per}.`] };
    },
    verify(q) { return Math.abs(q.params.a / q.params.b - q.answer) < 1e-6; },
  });

  A.skill({
    id: 'math7.proportional-table', title: 'Recognising proportional relationships',
    learn: p(`Two quantities are <b>proportional</b> when ${V('y')} is always the same multiple of ${V('x')}: ${V('y')} = ${V('k')}${V('x')}. In a table, check the ratio ${V('y')} ÷ ${V('x')} in every row. If it is the same number each time, the relationship is proportional and that number is the constant ${V('k')}.`) +
      p('A relationship like y = 3x + 2 is not proportional: the ratio changes from row to row, and the graph does not pass through (0, 0).') +
      example('Example', `${M.table([V('x'), V('y')], [[2, 10], [5, 25], [8, 40]], { compact: true })}10 ÷ 2 = 5, 25 ÷ 5 = 5, 40 ÷ 8 = 5. Proportional, with ${V('y')} = 5${V('x')}.`),
    make(rng) {
      const k = rng.int(2, 9), prop = rng.chance(0.55), b = rng.nz(-6, 6);
      let xs = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12], 3).sort((a, c) => a - c);
      const ys = xs.map(x => prop ? k * x : k * x + b);
      const ratios = xs.map((x, i) => ys[i] / x);
      const choices = [`Yes: ${V('y')} = ${k}${V('x')}`, `Yes: ${V('y')} = ${k + 1}${V('x')}`, `Yes: ${V('y')} = ${k - 1 === 0 ? k + 2 : k - 1}${V('x')}`, `No, the ratio ${V('y')} ÷ ${V('x')} is not constant`];
      const answer = prop ? choices[0] : choices[3];
      return { prompt: `Is ${V('y')} proportional to ${V('x')}?${M.table([V('x'), V('y')], xs.map((x, i) => [N(x), N(ys[i])]))}`, type: 'choice', choices, answer, params: { prop, k, xs, ys },
        hints: [`Divide ${V('y')} by ${V('x')} in each row: ${ratios.map((r, i) => `${N(ys[i])} ÷ ${N(xs[i])} = ${M.fracText(ys[i], xs[i])}`).join(', ')}.`,
          prop ? `Every ratio is ${k}, so ${V('y')} is always ${k} times ${V('x')}.` : `The ratios are not all the same, so there is no single constant.`,
          prop ? `<b>Yes: ${V('y')} = ${k}${V('x')}</b>.` : `<b>No</b>: ${V('y')} is not proportional to ${V('x')} (here ${V('y')} = ${k}${V('x')} ${M.signed(b)}).`] };
    },
    verify(q) { const { xs, ys } = q.params; const r = ys.map((y, i) => y / xs[i]); const same = r.every(v => Math.abs(v - r[0]) < 1e-9); return same ? q.answer.startsWith('Yes') && q.answer.includes(`= ${r[0]}<i>`) : q.answer.startsWith('No'); },
  });

  A.skill({
    id: 'math7.constant-k', title: 'Constant of proportionality',
    learn: p(`In a proportional relationship ${V('y')} = ${V('k')}${V('x')}, the constant of proportionality ${V('k')} is the unit rate: ${V('k')} = ${V('y')} ÷ ${V('x')} for any pair. It is also the slope of the line through the origin.`) +
      p('From an equation, read it off directly. From a table or a point, divide. From a sentence like “3 kg costs $7.50”, divide to get $2.50 per kg.') +
      example('Example', `${V('y')} is proportional to ${V('x')}, and when ${V('x')} = 6, ${V('y')} = 27. ${V('k')} = 27 ÷ 6 = <b>4.5</b>.`),
    make(rng) {
      const kind = rng.pick(['point', 'equation', 'table', 'words']);
      const k = rng.pick([0.5, 1.5, 2, 2.5, 3, 4, 4.5, 5, 6, 7, 8, 12]);
      const x = rng.int(2, 12), y = M.round(k * x, 3);
      if (kind === 'equation') { const other = rng.nz(-9, 9); const eqn = rng.bool() ? `${V('y')} = ${N(k)}${V('x')}` : `${V('y')} = ${V('x')} × ${N(k)}`; return { prompt: `What is the constant of proportionality in ${eqn}?`, type: 'number', answer: k, params: { k, x, y }, hints: [`The equation has the form ${V('y')} = ${V('k')}${V('x')}; the constant is the number multiplying ${V('x')}.`, `${V('k')} = <b>${N(k)}</b>.`] }; }
      if (kind === 'table') { const xs = rng.sample([1, 2, 3, 4, 5, 6, 8, 10], 3).sort((a, b) => a - b); return { prompt: `${V('y')} is proportional to ${V('x')}. What is the constant of proportionality?${M.table([V('x'), V('y')], xs.map(xx => [N(xx), N(M.round(k * xx, 3))]))}`, type: 'number', answer: k, params: { k, x: xs[0], y: M.round(k * xs[0], 3) }, hints: [`Pick any row and divide ${V('y')} by ${V('x')}.`, `${N(M.round(k * xs[0], 3))} ÷ ${N(xs[0])} = ${N(k)}; the other rows give the same.`, `${V('k')} = <b>${N(k)}</b>.`] }; }
      if (kind === 'words') { const name = rng.pick(NAMES); const kg = rng.int(2, 8), price = M.round(k * kg, 2); return { prompt: `${name} pays ${M.money(price)} for ${kg} kg of apples. Apples cost the same per kilogram. What is the constant of proportionality, in dollars per kilogram?`, type: 'number', answer: k, unit: '$/kg', params: { k, x: kg, y: price }, hints: [`The constant is the unit rate: dollars divided by kilograms.`, `${N(price)} ÷ ${kg} = <b>${N(k)}</b> dollars per kilogram.`] }; }
      return { prompt: `${V('y')} is proportional to ${V('x')}. When ${V('x')} = ${x}, ${V('y')} = ${N(y)}. What is the constant of proportionality?`, type: 'number', answer: k, params: { k, x, y }, hints: [`${V('y')} = ${V('k')}${V('x')}, so ${V('k')} = ${V('y')} ÷ ${V('x')}.`, `${N(y)} ÷ ${x} = <b>${N(k)}</b>.`] };
    },
    verify(q) { return Math.abs(q.params.y / q.params.x - q.answer) < 1e-6; },
  });

  A.skill({
    id: 'math7.percent-change', title: 'Percent increase and decrease',
    learn: p('<b>Percent change</b> = (change ÷ original) × 100. The original amount is always the one you start from, even for a decrease.') +
      p('To find a new amount after a change, multiply the original by (1 + rate) for an increase or (1 − rate) for a decrease: a $40 jacket at 25% off costs 40 × 0.75 = $30. An 8% sales tax on $50 gives 50 × 1.08 = $54.') +
      example('Example', `${big('A plant grew from 20 cm to 26 cm.')}Change = 6. 6 ÷ 20 = 0.3, so a <b>30%</b> increase.`),
    make(rng) {
      const kind = rng.pick(['find-pct', 'find-pct', 'after-dec', 'after-inc']);
      const name = rng.pick(NAMES);
      if (kind === 'find-pct') {
        const orig = rng.pick([20, 25, 40, 50, 60, 80, 120, 150, 200, 250, 400]);
        const pc = rng.pick([5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75]);
        const inc = rng.bool(); const nw = M.round(orig * (1 + (inc ? pc : -pc) / 100), 2);
        return { prompt: rng.pick([`A price went from ${M.money(orig)} to ${M.money(nw)}. What was the percent ${inc ? 'increase' : 'decrease'}?`, `A town's population changed from ${N(orig * 10)} to ${N(nw * 10)}. What was the percent ${inc ? 'increase' : 'decrease'}?`]), type: 'number', answer: pc, unit: '%', params: { kind, orig, nw }, tolerance: 0.01,
          hints: [`Find the change: ${N(Math.abs(nw - orig))}.`, `Divide the change by the <b>original</b>: ${N(Math.abs(nw - orig))} ÷ ${N(orig)} = ${N(Math.abs(nw - orig) / orig)}.`, `Multiply by 100: a <b>${pc}%</b> ${inc ? 'increase' : 'decrease'}.`] };
      }
      const orig = rng.pick([24, 30, 40, 45, 50, 60, 75, 80, 90, 120, 150, 200]);
      const pc = rng.pick([5, 8, 10, 15, 20, 25, 30, 40, 50]);
      if (kind === 'after-dec') { const nw = M.round(orig * (1 - pc / 100), 2); return { prompt: `${name} buys a ${M.money(orig)} pair of shoes at ${pc}% off. What is the sale price?`, type: 'number', answer: nw, unit: '$', params: { kind, orig, pc }, tolerance: 0.01, hints: [`${pc}% off means you pay ${100 - pc}% of the price.`, `${N((100 - pc) / 100)} × ${N(orig)} = ${N(nw)}.`, `The sale price is <b>${M.money(nw)}</b>. (Or: the discount is ${N(pc / 100)} × ${N(orig)} = ${M.money(M.round(orig * pc / 100, 2))}; subtract it.)`] }; }
      const nw = M.round(orig * (1 + pc / 100), 2);
      return { prompt: rng.bool() ? `A meal costs ${M.money(orig)} and ${name} adds a ${pc}% tip. What is the total?` : `A ${M.money(orig)} item has ${pc}% tax added. What is the total price?`, type: 'number', answer: nw, unit: '$', params: { kind, orig, pc }, tolerance: 0.01, hints: [`Adding ${pc}% means paying ${100 + pc}% of the price.`, `${N((100 + pc) / 100)} × ${N(orig)} = ${N(nw)}.`, `The total is <b>${M.money(nw)}</b>.`] };
    },
    verify(q) { const p = q.params; if (p.kind === 'find-pct') return Math.abs(Math.abs(p.nw - p.orig) / p.orig * 100 - q.answer) < 1e-6; const expect = p.kind === 'after-dec' ? p.orig * (1 - p.pc / 100) : p.orig * (1 + p.pc / 100); return Math.abs(expect - q.answer) < 0.006; },
  });

  /* ---------- Unit 5 ---------- */
  const X = V('x');
  /** keep candidate choices that differ from the answer and from each other */
  function distinct(answer, candidates, need) {
    const out = [];
    candidates.forEach(c => { if (c !== answer && !out.includes(c)) out.push(c); });
    return out.slice(0, need);
  }

  A.skill({
    id: 'math7.combine-like-terms', title: 'Combining like terms',
    learn: p(`<b>Like terms</b> have exactly the same variable part: 3${X} and −5${X} are like terms; 3${X} and 3 are not. To simplify an expression, add the coefficients of like terms and keep the variable part. Constants combine with constants.`) +
      p('The sign in front of a term belongs to it. In 7x − 2 − 4x + 9, the terms are 7x, −2, −4x and 9. Group them: (7x − 4x) + (−2 + 9) = 3x + 7.') +
      example('Example', `${big(`5${X} + 3 − 8${X} + 4`)}${X} terms: 5 − 8 = −3. Constants: 3 + 4 = 7. Simplified: <b>−3${X} + 7</b>.`),
    make(rng) {
      let a = rng.nz(-9, 9), c = rng.nz(-9, 9), b = rng.nz(-9, 9), d = rng.nz(-9, 9);
      if (a + c === 0) c = c + (c > 0 ? 1 : -1);
      if (b + d === 0) d = d + (d > 0 ? 1 : -1);
      const terms = rng.shuffle([M.term(a, 'x'), N(b), M.term(c, 'x'), N(d)]);
      const expr = terms.map((t, i) => i === 0 ? t : (t.startsWith('−') ? ' − ' + t.slice(1) : ' + ' + t)).join('');
      const answer = M.poly([a + c, b + d]);
      const choices = [answer].concat(distinct(answer, [M.poly([a - c, b + d]), M.poly([a + c, b - d]), M.poly([a - c, b - d]), M.poly([a + c + b + d]), M.poly([a + c, 0]) + (b + d >= 0 ? ' + ' : ' − ') + M.sup(N(Math.abs(b + d)) + X, 2)], 3));
      return { prompt: `Simplify.${big(expr)}`, type: 'choice', choices, answer, params: { a, b, c, d, coef: a + c, konst: b + d },
        hints: [`Collect the ${X} terms: ${M.term(a, 'x')} and ${M.term(c, 'x')}. Their coefficients add: ${N(a)} ${M.signed(c)} = ${N(a + c)}.`, `Collect the constants: ${N(b)} ${M.signed(d)} = ${N(b + d)}.`, `Put them together: <b>${answer}</b>.`] };
    },
    verify(q) {
      const { a, b, c, d, coef, konst } = q.params;
      return [1, 10].every(x => a * x + b + c * x + d === coef * x + konst) && q.answer === M.poly([coef, konst]);
    },
  });

  A.skill({
    id: 'math7.distribute', title: 'The distributive property',
    learn: p(`Multiplying a number by a sum means multiplying it by <b>each</b> term: ${V('a')}(${V('b')} + ${V('c')}) = ${V('a')}${V('b')} + ${V('a')}${V('c')}. The number outside “distributes” over everything inside the parentheses.`) +
      p(`Watch the signs: −3(2${X} − 5) = −6${X} + 15, because −3 × (−5) = +15. The most common slip is multiplying only the first term.`) +
      example('Example', `${big(`4(3${X} − 7)`)}4 × 3${X} = 12${X} and 4 × (−7) = −28, so the result is <b>12${X} − 28</b>.`),
    make(rng) {
      const a = rng.nz(-8, 8), b = rng.nz(-7, 7), c = rng.nz(-9, 9);
      const inside = M.poly([b, c]);
      const expr = rng.bool() ? `${N(a)}(${inside})` : `(${inside}) × ${a < 0 ? `(${N(a)})` : N(a)}`;
      const answer = M.poly([a * b, a * c]);
      const choices = [answer].concat(distinct(answer, [M.poly([a * b, c]), M.poly([a * b, -a * c]), M.poly([a + b, a + c]), M.poly([a * b, a + c]), M.poly([-a * b, a * c])], 3));
      return { prompt: `Expand.${big(expr)}`, type: 'choice', choices, answer, params: { a, b, c },
        hints: [`Multiply ${N(a)} by the first term: ${N(a)} × ${M.term(b, 'x')} = ${M.term(a * b, 'x')}.`, `Multiply ${N(a)} by the second term, sign included: ${N(a)} × (${N(c)}) = ${N(a * c)}.`, `Add the two products: <b>${answer}</b>.`] };
    },
    verify(q) { const { a, b, c } = q.params; return q.answer === M.poly([a * b, a * c]) && [2, 5].every(x => a * (b * x + c) === a * b * x + a * c); },
  });

  A.skill({
    id: 'math7.two-step-equations', title: 'Two-step equations',
    learn: p(`A two-step equation like 3${X} + 5 = 20 is undone in the reverse order of operations: first undo the <b>addition or subtraction</b>, then undo the <b>multiplication or division</b>. Whatever you do to one side, do to the other.`) +
      p(`3${X} + 5 = 20 → subtract 5: 3${X} = 15 → divide by 3: ${X} = 5. Check by substituting: 3(5) + 5 = 20 ✓.`) +
      example('Example', `${big(`${F(1, 4, { raw: true })}${X} − 2 = 3`)}Add 2 to both sides: ${F(1, 4, { raw: true })}${X} = 5. Multiply both sides by 4: <b>${X} = 20</b>.`),
    make(rng) {
      const form = rng.pick(['ax+b', 'ax+b', 'x/a+b', 'a(x+b)', 'word']);
      const x = rng.nz(-12, 12);
      const name = rng.pick(NAMES);
      if (form === 'x/a+b') {
        const a = rng.int(2, 9), b = rng.nz(-15, 15), c = x + b;           // x/a + b = c with x = a·k
        const xx = x * a;
        return { prompt: `Solve for ${X}.${big(`${F(X, N(a), { raw: true })} ${M.signed(b)} = ${N(c)}`)}`, type: 'number', answer: xx, params: { form, a, b, c },
          hints: [`Undo the ${b < 0 ? 'subtraction' : 'addition'} first: ${b < 0 ? 'add' : 'subtract'} ${N(Math.abs(b))} on both sides to get ${F(X, N(a), { raw: true })} = ${N(c - b)}.`, `Undo the division by multiplying both sides by ${a}: ${X} = ${N(c - b)} × ${a}.`, `<b>${X} = ${N(xx)}</b>. Check: ${N(xx)} ÷ ${a} ${M.signed(b)} = ${N(c)} ✓`] };
      }
      if (form === 'a(x+b)') {
        const a = rng.nz(-6, 6), b = rng.nz(-9, 9), c = a * (x + b);
        return { prompt: `Solve for ${X}.${big(`${N(a)}(${X} ${M.signed(b)}) = ${N(c)}`)}`, type: 'number', answer: x, params: { form, a, b, c },
          hints: [`Undo the multiplication first: divide both sides by ${N(a)} to get ${X} ${M.signed(b)} = ${N(x + b)}.`, `Now ${b < 0 ? 'add' : 'subtract'} ${N(Math.abs(b))}: ${X} = ${N(x + b)} ${M.signed(-b)}.`, `<b>${X} = ${N(x)}</b>. Check: ${N(a)}(${N(x)} ${M.signed(b)}) = ${N(a)} × ${N(x + b)} = ${N(c)} ✓`] };
      }
      const a = rng.nz(-9, 9), b = rng.nz(-15, 15), c = a * x + b;
      if (form === 'word') {
        const xp = Math.abs(x) || 4, ap = Math.abs(a) || 3, bp = Math.abs(b), cp = ap * xp + bp;
        return { prompt: `${name} buys ${ap} notebooks and a ${M.money(bp)} pen, and pays ${M.money(cp)} in total. How much does one notebook cost, in dollars?`, type: 'number', answer: xp, unit: '$', params: { form, a: ap, b: bp, c: cp },
          hints: [`Let ${X} be the cost of a notebook. Then ${ap}${X} + ${bp} = ${cp}.`, `Subtract ${bp} from both sides: ${ap}${X} = ${cp - bp}.`, `Divide by ${ap}: <b>${X} = ${xp}</b>, so a notebook costs ${M.money(xp)}.`] };
      }
      return { prompt: `Solve for ${X}.${big(`${M.term(a, 'x')} ${M.signed(b)} = ${N(c)}`)}`, type: 'number', answer: x, params: { form, a, b, c },
        hints: [`Undo the ${b < 0 ? 'subtraction' : 'addition'} first: ${b < 0 ? 'add' : 'subtract'} ${N(Math.abs(b))} on both sides to get ${M.term(a, 'x')} = ${N(c - b)}.`, `Divide both sides by ${N(a)}: ${X} = ${N(c - b)} ÷ ${a < 0 ? `(${N(a)})` : N(a)}.`, `<b>${X} = ${N(x)}</b>. Check: ${N(a)} × ${x < 0 ? `(${N(x)})` : N(x)} ${M.signed(b)} = ${N(c)} ✓`] };
    },
    verify(q) {
      const { form, a, b, c } = q.params, x = q.answer;
      if (form === 'x/a+b') return x / a + b === c;
      if (form === 'a(x+b)') return a * (x + b) === c;
      return a * x + b === c;
    },
  });

  A.skill({
    id: 'math7.two-step-inequalities', title: 'Two-step inequalities',
    learn: p(`Solve an inequality the same way as an equation, with <b>one extra rule</b>: when you multiply or divide both sides by a <b>negative</b> number, flip the inequality sign.`) +
      p(`−2${X} + 3 > 11 → subtract 3: −2${X} > 8 → divide by −2 and flip: ${X} < −4. Check with ${X} = −5: −2(−5) + 3 = 13 > 11 ✓.`) +
      example('Example', `${big(`5${X} − 4 ≤ 16`)}Add 4: 5${X} ≤ 20. Divide by 5 (positive, no flip): <b>${X} ≤ 4</b>.`),
    make(rng) {
      const a = rng.nz(-8, 8), b = rng.nz(-12, 12), x = rng.nz(-9, 9), c = a * x + b;
      const op = rng.pick(['<', '>', '≤', '≥']);
      const flip = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
      const ansOp = a < 0 ? flip[op] : op;
      const answer = `${X} ${ansOp} ${N(x)}`;
      const choices = ['<', '>', '≤', '≥'].map(o => `${X} ${o} ${N(x)}`);
      return { prompt: `Solve for ${X}.${big(`${M.term(a, 'x')} ${M.signed(b)} ${op} ${N(c)}`)}`, type: 'choice', choices, answer, keepOrder: true, params: { a, b, c, op, x },
        hints: [`${b < 0 ? 'Add' : 'Subtract'} ${N(Math.abs(b))} on both sides: ${M.term(a, 'x')} ${op} ${N(c - b)}.`, `Divide both sides by ${N(a)}. ${a < 0 ? `Dividing by a <b>negative</b> flips the sign: ${op} becomes ${ansOp}.` : 'It is positive, so the sign stays the same.'}`, `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { a, b, c, op, x } = q.params;
      const holds = (lhs, o, rhs) => o === '<' ? lhs < rhs : o === '>' ? lhs > rhs : o === '≤' ? lhs <= rhs : lhs >= rhs;
      const ansOp = q.answer.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim().split(/\s+/)[1];
      // the answer and the original must agree on every integer near the boundary
      return [x - 2, x - 1, x, x + 1, x + 2].every(t => holds(a * t + b, op, c) === holds(t, ansOp, x));
    },
  });

  /* ---------- Unit 6 ---------- */
  A.skill({
    id: 'math7.circles', title: 'Area and circumference of circles',
    learn: p(`<b>Circumference</b> is the distance around a circle: ${V('C')} = 2π${V('r')} = π${V('d')}. <b>Area</b> is the space inside: ${V('A')} = π${V('r')}².`) +
      p('The radius goes from the centre to the edge; the diameter goes all the way across, so it is twice the radius. On this site use 3.14 for π and round to two decimal places.') +
      example('Example', `${big('A circle has radius 5 cm.')}${V('C')} = 2 × 3.14 × 5 = <b>31.4 cm</b>. ${V('A')} = 3.14 × 5² = 3.14 × 25 = <b>78.5 cm²</b>.`),
    make(rng) {
      const kind = rng.pick(['area-r', 'area-d', 'circ-r', 'circ-d', 'r-from-c']);
      const r = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]);
      const unit = rng.pick(['cm', 'm', 'in', 'ft']);
      if (kind === 'r-from-c') { const C = M.round(6.28 * r, 2); return { prompt: `A circle has a circumference of ${N(C)} ${unit}. What is its radius? Use 3.14 for π.`, type: 'number', answer: r, unit, params: { kind, r }, tolerance: 0.05, hints: [`${V('C')} = 2π${V('r')}, so ${V('r')} = ${V('C')} ÷ (2π).`, `${N(C)} ÷ 6.28 = ${N(r)}.`, `The radius is <b>${N(r)} ${unit}</b>.`] }; }
      const given = kind.endsWith('-d') ? `diameter ${N(2 * r)} ${unit}` : `radius ${N(r)} ${unit}`;
      if (kind.startsWith('area')) {
        const ans = M.round(3.14 * r * r, 2);
        return { prompt: `A circle has ${given}. What is its area? Use 3.14 for π.`, type: 'number', answer: ans, unit: unit + '²', params: { kind, r }, tolerance: 0.05,
          hints: [kind === 'area-d' ? `The radius is half the diameter: ${N(2 * r)} ÷ 2 = ${N(r)} ${unit}.` : `${V('A')} = π${V('r')}², and the radius is ${N(r)} ${unit}.`, `Square the radius: ${N(r)}² = ${N(r * r)}. Then multiply by 3.14.`, `3.14 × ${N(r * r)} = <b>${N(ans)} ${unit}²</b>.`] };
      }
      const ans = M.round(6.28 * r, 2);
      return { prompt: `A circle has ${given}. What is its circumference? Use 3.14 for π.`, type: 'number', answer: ans, unit, params: { kind, r }, tolerance: 0.05,
        hints: [kind === 'circ-d' ? `${V('C')} = π${V('d')}: multiply the diameter by 3.14.` : `${V('C')} = 2π${V('r')}: double the radius to get the diameter, ${N(2 * r)} ${unit}, then multiply by 3.14.`, `3.14 × ${N(2 * r)} = <b>${N(ans)} ${unit}</b>.`] };
    },
    verify(q) { const { kind, r } = q.params; const d = 2 * r; const expect = kind === 'r-from-c' ? r : kind.startsWith('area') ? 3.14 * (d / 2) * (d / 2) : 3.14 * d; return Math.abs(expect - q.answer) < 0.006; },
  });

  A.skill({
    id: 'math7.angle-pairs', title: 'Angle relationships',
    learn: p('<b>Complementary</b> angles add to 90°. <b>Supplementary</b> angles add to 180°, as do angles on a straight line. <b>Vertical</b> angles, the opposite pair made by two crossing lines, are equal. The three angles of any <b>triangle</b> add to 180°.') +
      p('Most angle questions are a subtraction: find what the angles must add to, then take away the ones you know.') +
      example('Example', `${big('Two angles of a triangle are 48° and 67°.')}180 − 48 − 67 = <b>65°</b>.`),
    make(rng) {
      const kind = rng.pick(['comp', 'supp', 'vert', 'tri', 'line']);
      const a = rng.int(15, 75), b = rng.int(20, 80);
      if (kind === 'comp') return { prompt: `Two angles are complementary. One measures ${a}°. What is the other?`, type: 'number', answer: 90 - a, unit: '°', params: { kind, a }, hints: [`Complementary angles add to 90°.`, `90 − ${a} = <b>${90 - a}°</b>.`] };
      if (kind === 'supp') { const s = a + 60; return { prompt: `Two angles are supplementary. One measures ${s}°. What is the other?`, type: 'number', answer: 180 - s, unit: '°', params: { kind, a: s }, hints: [`Supplementary angles add to 180°.`, `180 − ${s} = <b>${180 - s}°</b>.`] }; }
      if (kind === 'line') { const s = a + 30; return { prompt: `Two angles sit side by side on a straight line. One measures ${s}°. What is the other?`, type: 'number', answer: 180 - s, unit: '°', params: { kind, a: s }, hints: [`Angles on a straight line add to 180°.`, `180 − ${s} = <b>${180 - s}°</b>.`] }; }
      if (kind === 'vert') { const s = a + 40; return { prompt: `Two lines cross. One of the angles formed measures ${s}°. What is the measure of the angle directly opposite it (its vertical angle)?`, type: 'number', answer: s, unit: '°', params: { kind, a: s }, hints: [`Vertical angles are the opposite pair where two lines cross.`, `Vertical angles are equal, so the opposite angle is also <b>${s}°</b>.`] }; }
      return { prompt: `Two angles of a triangle measure ${a}° and ${b}°. What is the third angle?`, type: 'number', answer: 180 - a - b, unit: '°', params: { kind, a, b }, hints: [`The angles of a triangle add to 180°.`, `${a} + ${b} = ${a + b}, and 180 − ${a + b} = <b>${180 - a - b}°</b>.`] };
    },
    verify(q) { const { kind, a, b } = q.params; if (kind === 'comp') return q.answer + a === 90; if (kind === 'vert') return q.answer === a; if (kind === 'tri') return q.answer + a + b === 180; return q.answer + a === 180; },
  });

  A.skill({
    id: 'math7.scale-drawings', title: 'Scale drawings',
    learn: p('A scale drawing keeps every length in the same ratio to the real thing. A scale of <b>1 cm : 4 m</b> means each centimetre on the drawing stands for 4 metres in real life.') +
      p('Drawing → real: multiply by the scale. Real → drawing: divide by the scale. Between two similar figures, the <b>scale factor</b> is new length ÷ original length, and every length (but not the area) is multiplied by it.') +
      example('Example', `${big('Scale 1 cm : 4 m. A wall is 6.5 cm long on the plan.')}Real length = 6.5 × 4 = <b>26 m</b>.`),
    make(rng) {
      const kind = rng.pick(['to-real', 'to-real', 'to-drawing', 'factor']);
      const scale = rng.pick([2, 3, 4, 5, 8, 10, 20, 25, 50]);
      const draw = rng.pick([2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7.5, 8, 9, 12]);
      const real = M.round(draw * scale, 3);
      if (kind === 'to-real') return { prompt: `A map uses a scale of 1 cm : ${scale} km. Two towns are ${N(draw)} cm apart on the map. How far apart are they really?`, type: 'number', answer: real, unit: 'km', params: { kind, scale, draw, real }, hints: [`Each centimetre stands for ${scale} km, so multiply the map distance by ${scale}.`, `${N(draw)} × ${scale} = <b>${N(real)} km</b>.`] };
      if (kind === 'to-drawing') return { prompt: `A floor plan uses a scale of 1 cm : ${scale} m. A room is ${N(real)} m long. How long is it on the plan?`, type: 'number', answer: draw, unit: 'cm', params: { kind, scale, draw, real }, hints: [`Going from real life to the drawing, divide by the scale.`, `${N(real)} ÷ ${scale} = <b>${N(draw)} cm</b>.`] };
      const k = rng.pick([1.5, 2, 2.5, 3, 4]), s = rng.int(2, 9), other = rng.int(2, 9);
      return { prompt: `A triangle with sides ${s} cm and ${other} cm is enlarged so that the ${s} cm side becomes ${N(s * k)} cm. How long does the ${other} cm side become?`, type: 'number', answer: M.round(other * k, 3), unit: 'cm', params: { kind, s, k, other }, hints: [`Find the scale factor: new ÷ original = ${N(s * k)} ÷ ${s} = ${N(k)}.`, `Every side is multiplied by ${N(k)}: ${other} × ${N(k)} = <b>${N(M.round(other * k, 3))} cm</b>.`] };
    },
    verify(q) { const p = q.params; if (p.kind === 'to-real') return Math.abs(q.answer / p.scale - p.draw) < 1e-9; if (p.kind === 'to-drawing') return Math.abs(q.answer * p.scale - p.real) < 1e-9; return Math.abs(q.answer / p.other - (p.s * p.k) / p.s) < 1e-9; },
  });

  /* ---------- Unit 7 ---------- */
  A.skill({
    id: 'math7.mean-median', title: 'Mean, median, mode, and range',
    learn: p('<b>Mean</b>: add everything and divide by how many values there are. <b>Median</b>: put the values in order and take the middle one (with an even count, the mean of the two middle values). <b>Mode</b>: the value that appears most often. <b>Range</b>: largest minus smallest.') +
      p('The mean is pulled by very large or small values; the median is not. That is why house prices are usually reported with the median.') +
      example('Example', `${big('4, 9, 2, 9, 6')}Ordered: 2, 4, 6, 9, 9. Mean = 30 ÷ 5 = <b>6</b>. Median = <b>6</b>. Mode = <b>9</b>. Range = 9 − 2 = <b>7</b>.`),
    make(rng) {
      const n = rng.pick([5, 5, 6, 7]);
      const kind = rng.pick(['mean', 'median', 'mode', 'range']);
      let data = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30], n);
      if (kind === 'mode') data[n - 1] = data[0];                      // one value appears twice, the rest once: a single mode
      if (kind === 'mean') { const sum = data.reduce((a, b) => a + b, 0); data[n - 1] += (n - sum % n) % n; }
      data = rng.shuffle(data);
      const sorted = data.slice().sort((a, b) => a - b);
      const sum = data.reduce((a, b) => a + b, 0);
      let ans, hints;
      if (kind === 'mean') { ans = sum / n; hints = [`Add the values: ${data.join(' + ')} = ${sum}.`, `Divide by how many there are: ${sum} ÷ ${n} = <b>${N(ans)}</b>.`]; }
      else if (kind === 'median') { ans = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2; hints = [`Put the values in order: ${sorted.join(', ')}.`, n % 2 ? `With ${n} values the middle one is the ${M.ordinal((n + 1) / 2)}: <b>${N(ans)}</b>.` : `With ${n} values there are two middle ones, ${sorted[n / 2 - 1]} and ${sorted[n / 2]}. Their mean is <b>${N(ans)}</b>.`]; }
      else if (kind === 'mode') { const counts = {}; data.forEach(x => { counts[x] = (counts[x] || 0) + 1; }); ans = Number(Object.keys(counts).reduce((a, b) => counts[a] >= counts[b] ? a : b)); hints = [`Count how often each value appears.`, `${ans} appears ${counts[ans]} times, more than any other value, so the mode is <b>${ans}</b>.`]; }
      else { ans = sorted[n - 1] - sorted[0]; hints = [`Find the largest and smallest values: ${sorted[n - 1]} and ${sorted[0]}.`, `Range = ${sorted[n - 1]} − ${sorted[0]} = <b>${ans}</b>.`]; }
      return { prompt: `Find the <b>${kind}</b> of this data set.${big(data.join(', '))}`, type: 'number', answer: ans, params: { kind, data }, hints };
    },
    verify(q) {
      const { kind, data } = q.params, s = data.slice().sort((a, b) => a - b), n = s.length;
      if (kind === 'mean') return Math.abs(s.reduce((a, b) => a + b, 0) / n - q.answer) < 1e-9;
      if (kind === 'range') return q.answer === s[n - 1] - s[0];
      if (kind === 'median') return Math.abs(q.answer - (n % 2 ? s[Math.floor(n / 2)] : (s[n / 2 - 1] + s[n / 2]) / 2)) < 1e-9;
      const best = Math.max(...s.map(v => s.filter(x => x === v).length));
      const modes = [...new Set(s.filter(v => s.filter(x => x === v).length === best))];
      return modes.length === 1 && modes[0] === q.answer;
    },
  });

  A.skill({
    id: 'math7.simple-probability', title: 'Simple probability',
    learn: p('When every outcome is equally likely, <b>probability = favourable outcomes ÷ total outcomes</b>. It is a number from 0 (impossible) to 1 (certain), written as a fraction, decimal or percent.') +
      p(`A bag with 3 red and 5 blue marbles has 8 marbles, so P(red) = ${F(3, 8)}. The probability of <b>not</b> red is 1 − ${F(3, 8)} = ${F(5, 8)}.`) +
      example('Example', `${big('Roll a fair six-sided die. P(number greater than 4)?')}The outcomes greater than 4 are 5 and 6: two out of six. P = ${F(2, 6, { raw: true })} = <b>${F(1, 3)}</b>.`),
    make(rng) {
      const kind = rng.pick(['bag', 'bag', 'die', 'spinner', 'not']);
      if (kind === 'die') {
        const ev = rng.pick([{ t: 'an even number', set: [2, 4, 6] }, { t: 'an odd number', set: [1, 3, 5] }, { t: 'a number greater than 4', set: [5, 6] }, { t: 'a number less than 3', set: [1, 2] }, { t: 'a prime number', set: [2, 3, 5] }, { t: 'a multiple of 3', set: [3, 6] }, { t: 'a 6', set: [6] }, { t: 'a number greater than 1', set: [2, 3, 4, 5, 6] }]);
        const [sn, sd] = M.simp(ev.set.length, 6);
        return { prompt: `You roll a fair six-sided die. What is the probability of rolling ${ev.t}? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: ev.set.length, total: 6 },
          hints: [`List the outcomes that count: ${ev.set.join(', ')}. That is ${ev.set.length} of the 6 faces.`, `P = ${F(ev.set.length, 6, { raw: true })}${sd !== 6 ? ` = <b>${F(sn, sd)}</b>` : ''}${sd === 6 ? ' = <b>' + F(sn, sd) + '</b>' : ''} (${M.fracText(sn, sd)}).`] };
      }
      const colours = rng.sample(['red', 'blue', 'green', 'yellow', 'purple', 'orange'], 3);
      const counts = colours.map(() => rng.int(1, 9));
      const total = counts.reduce((a, b) => a + b, 0);
      const i = rng.int(0, 2);
      const fav = kind === 'not' ? total - counts[i] : counts[i];
      const [sn, sd] = M.simp(fav, total);
      const list = M.list(colours.map((c, k) => `${counts[k]} ${c}`));
      const thing = kind === 'spinner' ? 'spinner with equal sections' : 'bag of marbles';
      const pick = kind === 'spinner' ? 'The spinner lands on' : 'You pick one marble without looking. It is';
      const prompt = kind === 'spinner' ? `A spinner has ${total} equal sections: ${list}. What is the probability that it lands on ${colours[i]}? Give your answer as a fraction.` :
        kind === 'not' ? `A bag has ${list} marbles. You pick one without looking. What is the probability that it is <b>not</b> ${colours[i]}? Give your answer as a fraction.` :
          `A bag has ${list} marbles. You pick one without looking. What is the probability that it is ${colours[i]}? Give your answer as a fraction.`;
      return { prompt, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav, total },
        hints: [`Count all the ${kind === 'spinner' ? 'sections' : 'marbles'}: ${counts.join(' + ')} = ${total}.`, kind === 'not' ? `“Not ${colours[i]}” means any of the other ${total - counts[i]}: P = ${F(total - counts[i], total, { raw: true })}. (Or 1 − ${F(counts[i], total, { raw: true })}.)` : `${counts[i]} of them are ${colours[i]}: P = ${F(counts[i], total, { raw: true })}.`, `In simplest form: <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] };
    },
    verify(q) { return Math.abs(q.params.fav / q.params.total - q.answer) < 1e-9 && q.answer >= 0 && q.answer <= 1; },
  });

  A.skill({
    id: 'math7.compound-probability', title: 'Probability of compound events',
    learn: p('A <b>compound event</b> combines two or more simple events, like flipping a coin <i>and</i> rolling a die. When the events are <b>independent</b> (one does not change the other), multiply: P(A and B) = P(A) × P(B).') +
      p(`A sample space lists every possible outcome. Two dice have 6 × 6 = 36 equally likely outcomes, and P(sum is 7) = ${F(6, 36, { raw: true })} = ${F(1, 6)}, because six of them add to 7.`) +
      example('Example', `${big('Flip a coin and roll a die. P(heads and a 4)?')}P(heads) = ${F(1, 2)}, P(4) = ${F(1, 6)}. Multiply: ${F(1, 2)} × ${F(1, 6)} = <b>${F(1, 12)}</b>.`),
    make(rng) {
      const kind = rng.pick(['coin-die', 'two-coins', 'spinner-twice', 'dice-sum', 'bag-replace']);
      if (kind === 'coin-die') { const face = rng.int(1, 6); const side = rng.pick(['heads', 'tails']); const ev = rng.pick([{ t: `a ${face}`, k: 1 }, { t: 'an even number', k: 3 }, { t: 'a number greater than 4', k: 2 }]); const [sn, sd] = M.simp(ev.k, 12); return { prompt: `You flip a coin and roll a six-sided die. What is the probability of getting ${side} and ${ev.t}? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: ev.k, total: 12 }, hints: [`The events are independent. P(${side}) = ${F(1, 2)} and P(${ev.t}) = ${F(ev.k, 6)}.`, `Multiply: ${F(1, 2)} × ${F(ev.k, 6)} = ${F(ev.k, 12, { raw: true })}.`, `In simplest form: <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] }; }
      if (kind === 'two-coins') { const n = rng.pick([2, 3]); const ev = rng.pick([{ t: 'all heads', k: 1 }, { t: 'all tails', k: 1 }, { t: 'exactly one head', k: n }]); const total = Math.pow(2, n); const [sn, sd] = M.simp(ev.k, total); return { prompt: `You flip ${n} fair coins. What is the probability of ${ev.t}? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: ev.k, total }, hints: [`Each coin has 2 outcomes, so ${n} coins have ${Array(n).fill(2).join(' × ')} = ${total} equally likely outcomes.`, `${ev.k} of them ${ev.k === 1 ? 'is' : 'are'} “${ev.t}”.`, `P = <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] }; }
      if (kind === 'spinner-twice') { const n = rng.pick([4, 5, 6, 8]); const r = rng.int(1, n - 1); const [sn, sd] = M.simp(r * r, n * n); return { prompt: `A spinner has ${n} equal sections and ${r} of them ${r === 1 ? 'is' : 'are'} red. You spin it twice. What is the probability of red both times? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: r * r, total: n * n }, hints: [`The two spins are independent. P(red) on one spin is ${F(r, n, { raw: true })}.`, `Multiply: ${F(r, n, { raw: true })} × ${F(r, n, { raw: true })} = ${F(r * r, n * n, { raw: true })}.`, `In simplest form: <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] }; }
      if (kind === 'dice-sum') { const s = rng.int(3, 11); let k = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) k++; const [sn, sd] = M.simp(k, 36); return { prompt: `You roll two six-sided dice. What is the probability that the numbers add to ${s}? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, s, fav: k, total: 36 }, hints: [`Two dice have 6 × 6 = 36 equally likely outcomes.`, `Count the pairs that add to ${s}: there are ${k} of them (for example ${Math.max(1, s - 6)} + ${s - Math.max(1, s - 6)}).`, `P = ${F(k, 36, { raw: true })} = <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] }; }
      const red = rng.int(1, 6), blue = rng.int(1, 6), total = red + blue; const [sn, sd] = M.simp(red * blue, total * total);
      return { prompt: `A bag has ${red} red and ${blue} blue marbles. You pick one, put it back, and pick again. What is the probability of a red then a blue? Give your answer as a fraction.`, type: 'number', answer: sn / sd, answerText: M.fracText(sn, sd), params: { kind, fav: red * blue, total: total * total }, hints: [`Because the first marble goes back, the picks are independent. P(red) = ${F(red, total, { raw: true })}, P(blue) = ${F(blue, total, { raw: true })}.`, `Multiply: ${F(red, total, { raw: true })} × ${F(blue, total, { raw: true })} = ${F(red * blue, total * total, { raw: true })}.`, `In simplest form: <b>${F(sn, sd)}</b> (${M.fracText(sn, sd)}).`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'dice-sum') { let k = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === p.s) k++; return Math.abs(k / 36 - q.answer) < 1e-9; }
      return Math.abs(p.fav / p.total - q.answer) < 1e-9 && q.answer > 0 && q.answer <= 1;
    },
  });

})();
