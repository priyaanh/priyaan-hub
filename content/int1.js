/* Integrated Math 1 (CPM Core Connections Integrated I). Functions, linear functions and arithmetic
   sequences, equations and inequalities, systems, exponential functions and geometric sequences,
   statistics, transformations and congruence. */
'use strict';
(function () {
  const A = window.ACADEMY, M = window.M;
  const F = M.frac, N = M.n, V = M.v;
  const NAMES = ['Ana', 'Ben', 'Chloe', 'Dev', 'Ella', 'Finn', 'Grace', 'Hugo', 'Iris', 'Jai', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Ravi', 'Sara', 'Theo', 'Uma', 'Zoe'];
  const p = s => `<p>${s}</p>`;
  const example = (title, body) => `<div class="example"><div class="ex-title">${title}</div>${body}</div>`;
  const big = s => `<div class="big">${s}</div>`;
  const X = V('x'), Y = V('y');
  const wrap = x => x < 0 ? `(${N(x)})` : N(x);                   // a negative after an operator or a coefficient
  const tail = c => c ? ' ' + M.signed(c) : '';                    // " + 3", " − 3", or nothing for 0
  const coef = a => a === 1 ? '' : a === -1 ? '−' : N(a);           // the coefficient written in front of a variable
  const mult = (a, v) => a === 1 ? N(v) : a === -1 ? '−' + N(v) : `${N(a)}(${N(v)})`;   // "2(9)", "9", "−9"
  const sfrac = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;   // a fraction of expressions
  const fn = (name, arg) => `${V(name)}(${arg})`;
  const lin2 = (a, b, c) => `${M.term(a, 'x')} ${b < 0 ? '−' : '+'} ${M.term(Math.abs(b), 'y')} = ${N(c)}`;   // "3x − 2y = 7"
  const lineEq = (m, b) => `${Y} = ${M.poly([m, b])}`;
  const expRule = (a, base) => `${Y} = ${N(a)} · ${M.sup(base, X)}`;
  const set = xs => `{${xs.map(N).join(', ')}}`;
  const sorted = xs => xs.slice().sort((a, b) => a - b);
  const uniq = xs => xs.filter((x, i) => xs.indexOf(x) === i);
  const sum = xs => xs.reduce((a, b) => a + b, 0);
  const plain = s => A.stripTags(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/−/g, '-').replace(/\s+/g, ' ').trim();   // answer HTML → parseable text, for verify()
  const nums = s => (plain(s).replace(/(\d),(?=\d{3})/g, '$1').replace(/- /g, '-').match(/-?\d+(\.\d+)?/g) || []).map(Number);
  const moveWord = v => v < 0 ? `Add ${N(-v)} to` : `Subtract ${N(v)} from`;
  const moveTerm = c => c < 0 ? `add ${M.term(-c, 'x')} to` : `subtract ${M.term(c, 'x')} from`;
  /** the first k candidates that read differently from `answer` and from each other */
  function distinct(answer, cands, k) {
    const seen = new Set([A.normText(A.stripTags(answer))]), out = [];
    for (const c of cands) {
      const key = A.normText(A.stripTags(c));
      if (!seen.has(key)) { seen.add(key); out.push(c); }
      if (out.length === k) break;
    }
    return out;
  }

  A.course({
    id: 'int-1', title: 'Integrated Math 1', subject: 'High school', grade: 9, icon: '📈', hue: 190,
    blurb: 'Functions, linear and exponential models, equations, inequalities and systems, one-variable statistics, and transformations and congruence.',
    units: [
      { id: 'functions', title: 'Functions', blurb: 'What a function is, evaluating one, and its domain and range.', skills: ['int1.evaluate-functions', 'int1.domain-range', 'int1.function-or-not'] },
      { id: 'linear', title: 'Linear functions and arithmetic sequences', blurb: 'Slope, writing y = mx + b, reading it in context, and sequences that grow by adding.', skills: ['int1.slope', 'int1.linear-equations', 'int1.interpret-linear', 'int1.arithmetic-sequences'] },
      { id: 'equations', title: 'Equations and inequalities', blurb: 'Multi-step equations, rearranging formulas, and inequalities with a flip.', skills: ['int1.multistep-equations', 'int1.literal-equations', 'int1.inequalities'] },
      { id: 'systems', title: 'Systems of equations', blurb: 'Two equations, two unknowns: substitution, elimination, and word problems.', skills: ['int1.solve-systems', 'int1.systems-word-problems'] },
      { id: 'exponential', title: 'Exponential functions and geometric sequences', blurb: 'Sequences that grow by multiplying, percent growth and decay, and rules from tables.', skills: ['int1.geometric-sequences', 'int1.exponential-growth-decay', 'int1.exponential-from-table'] },
      { id: 'statistics', title: 'Statistics', blurb: 'Center and spread of a data set, and association in scatter plots.', skills: ['int1.center-and-spread', 'int1.scatter-association'] },
      { id: 'congruence', title: 'Transformations and congruence', blurb: 'Translations, reflections and rotations, and the triangle congruence criteria.', skills: ['int1.transformations', 'int1.congruence-criteria'] },
    ],
  });

  /* ---------- Unit 1: Functions ---------- */
  A.skill({
    id: 'int1.evaluate-functions', title: 'Evaluating functions',
    learn: p(`A function is a rule that turns each input into exactly one output. ${fn('f', X)} is read “f of ${X}” and means the output of the rule f for the input ${X}. So ${fn('f', 3)} says “put 3 in for every ${X}”.`) +
      p(`<b>To evaluate a function, substitute the input for every copy of the variable, then follow the order of operations.</b> Put a negative input in parentheses so the signs survive: if ${fn('f', X)} = ${X}² − 3${X}, then ${fn('f', '−2')} = (−2)² − 3(−2) = 4 + 6 = 10, not −10 or −2.`) +
      p(`Absolute value works the same way: for ${fn('g', X)} = 2|${X} − 5| + 1, ${fn('g', 1)} = 2|1 − 5| + 1 = 2(4) + 1 = 9.`) +
      example('Example', `${big(`${fn('h', X)} = 2${X}² − 5${X} + 1. Find ${fn('h', '−3')}.`)}Substitute −3 for ${X}: 2(−3)² − 5(−3) + 1 = 2(9) + 15 + 1 = <b>34</b>.`),
    make(rng) {
      const name = rng.pick(['f', 'g', 'h']), kind = rng.pick(['linear', 'quad', 'quad', 'abs']);
      const x = rng.chance(0.6) ? rng.int(-6, -1) : rng.int(0, 6);
      let rule, ans, middle, params;
      if (kind === 'linear') {
        const m = rng.nz(-6, 6), b = rng.nz(-9, 9);
        rule = arg => `${coef(m)}${arg}${tail(b)}`; ans = m * x + b; middle = `${N(m * x)}${tail(b)}`; params = { kind, x, m, b };
      } else if (kind === 'quad') {
        const a = rng.pick([1, 1, 2, 3, -1, -2]), b = rng.nz(-5, 5), c = rng.int(-9, 9);
        rule = arg => `${coef(a)}${arg}² ${b < 0 ? '−' : '+'} ${coef(Math.abs(b))}${arg}${tail(c)}`; ans = a * x * x + b * x + c;
        middle = `${mult(a, x * x)} ${M.signed(b * x)}${tail(c)} = ${N(a * x * x)} ${M.signed(b * x)}${tail(c)}`; params = { kind, x, a, b, c };
      } else {
        const a = rng.pick([1, 2, 3, -1, -2]), h = rng.nz(-5, 5), k = rng.int(-6, 6);
        rule = arg => `${coef(a)}|${arg}${tail(-h)}|${tail(k)}`; ans = a * Math.abs(x - h) + k;
        middle = `${coef(a)}|${N(x - h)}|${tail(k)} = ${mult(a, Math.abs(x - h))}${tail(k)}`; params = { kind, x, a, h, k };
      }
      return { prompt: `${big(`${fn(name, X)} = ${rule(X)}`)}Find ${fn(name, N(x))}.`, type: 'number', answer: ans, params, hints: [
        `Replace every ${X} with ${wrap(x)}: ${fn(name, N(x))} = ${rule(`(${N(x)})`)}.`,
        `${kind === 'quad' ? 'Square first, then multiply' : kind === 'abs' ? 'Work out the inside of the absolute value first' : 'Multiply first'}: ${middle}.`,
        `${fn(name, N(x))} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params, x = `(${p.x})`;
      const expr = p.kind === 'linear' ? `(${p.m})*${x}+(${p.b})` : p.kind === 'quad' ? `(${p.a})*${x}**2+(${p.b})*${x}+(${p.c})` : `(${p.a})*Math.abs(${x}-(${p.h}))+(${p.k})`;
      return new Function('return ' + expr)() === q.answer;      // JavaScript's own arithmetic as the second opinion
    },
  });

  /* situations with a sensible domain and range, for int1.domain-range */
  function discreteSit(text, cap, per, things, thing) {
    return { text, discrete: true, per, dBounds: [0, cap], rBounds: [0, per * cap],
      dom: `whole numbers from 0 to ${cap}`, ran: `multiples of ${per} from 0 to ${N(per * cap)}`,
      wrongDom: [`all real numbers from 0 to ${cap}`, `whole numbers from 0 to ${N(per * cap)}`, `all real numbers from 0 to ${N(per * cap)}`],
      wrongRan: [`all real numbers from 0 to ${N(per * cap)}`, `whole numbers from 0 to ${N(per * cap)}`, `multiples of ${per} from 0 to ${cap}`],
      inputNote: `you can only have a whole number of ${things}, and at most ${cap}.`,
      outputNote: `each extra ${thing} adds ${per}, so the outputs go up in steps of ${per}, from 0 to ${per} × ${cap} = ${N(per * cap)}.` };
  }
  function continuousSit(text, T, r, units, what) {
    const H = r * T;
    return { text, discrete: false, per: 0, dBounds: [0, T], rBounds: [0, H],
      dom: `all real numbers from 0 to ${T}`, ran: `all real numbers from 0 to ${H}`,
      wrongDom: [`whole numbers from 0 to ${T}`, `all real numbers from 0 to ${H}`, `whole numbers from 0 to ${H}`],
      wrongRan: [`whole numbers from 0 to ${H}`, `all real numbers from 0 to ${T}`, `whole numbers from 0 to ${T}`],
      inputNote: `time flows continuously, so any number of ${units} from 0 up to the moment it runs out (${H} ÷ ${r} = ${T}) makes sense.`,
      outputNote: `the ${what} starts at ${H} and falls smoothly to 0, taking every value in between.` };
  }
  const SITUATIONS = [
    rng => { const pr = rng.pick([5, 6, 8, 10, 12]), cap = rng.pick([40, 50, 60, 80, 100, 120]); return discreteSit(`Tickets to a school play cost ${M.money(pr)} each, and the hall holds ${cap} people. The function ${fn('C', V('n'))} gives the cost in dollars of buying ${V('n')} tickets.`, cap, pr, 'tickets', 'ticket'); },
    rng => { const per = rng.pick([4, 6, 8, 12]), cap = rng.pick([10, 15, 20, 25, 30]); return discreteSit(`A bakery packs muffins ${per} to a box and bakes at most ${cap} boxes a day. The function ${fn('M', V('b'))} gives the number of muffins in ${V('b')} boxes.`, cap, per, 'boxes', 'box'); },
    rng => { const r = rng.pick([2, 3, 4]), T = rng.int(4, 10); return continuousSit(`A candle ${N(r * T)} cm tall burns down at a steady ${r} cm per hour until it is gone. The function ${fn('h', V('t'))} gives its height in cm after ${V('t')} hours.`, T, r, 'hours', 'height'); },
    rng => { const r = rng.pick([20, 25, 40, 50]), T = rng.int(6, 15); return continuousSit(`A tank holding ${N(r * T)} litres drains at a steady ${r} litres per minute until it is empty. The function ${fn('V', V('t'))} gives the volume in litres after ${V('t')} minutes.`, T, r, 'minutes', 'volume'); },
  ];

  A.skill({
    id: 'int1.domain-range', title: 'Domain and range',
    learn: p(`The <b>domain</b> of a function is the set of all its inputs (the ${X}-values); the <b>range</b> is the set of all its outputs (the ${Y}-values). For a list of points, the domain is the set of first coordinates and the range the set of second coordinates. A value that repeats is written only once.`) +
      p(`For a real situation, ask which inputs make sense. Tickets come in whole numbers; time flows continuously, so it takes every value in an interval. The range is then every output those inputs can produce: whole-number tickets at $8 give costs that go up in steps of 8.`) +
      example('Example', `${big('{(−2, 4), (0, 1), (3, 4), (5, 7)}')}Domain: {−2, 0, 3, 5}. Range: {1, 4, 7} — the output 4 is listed once.`),
    make(rng) {
      const ask = rng.pick(['dom', 'ran']), word = ask === 'dom' ? 'domain' : 'range';
      if (rng.bool()) {
        const xs = sorted(rng.sample([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], 4));
        const ys = [0, 1, 2, 3].map(() => rng.int(-9, 9));
        if (rng.bool()) ys[rng.int(2, 3)] = ys[rng.int(0, 1)];                      // a repeated output
        const dom = uniq(sorted(xs)), ran = uniq(sorted(ys));
        const right = ask === 'dom' ? dom : ran, other = ask === 'dom' ? ran : dom;
        const swapIn = (a, b) => { const v = b.find(z => !a.includes(z)); const out = a.slice(); out[rng.int(0, a.length - 1)] = v == null ? Math.max(...a) + 1 : v; return uniq(sorted(out)); };
        const answer = set(right);
        const choices = [answer].concat(distinct(answer, [set(other), set(swapIn(right, other)), set(swapIn(other, right)), set(sorted(ys)), set(right.map(v => -v))], 3));
        const shown = rng.shuffle([0, 1, 2, 3]).map(i => M.pt(xs[i], ys[i])).join(', ');
        return { prompt: `What is the ${word} of this relation?${big(`{${shown}}`)}`, type: 'choice', choices, answer, params: { kind: 'points', ask, xs, ys },
          hints: [`The ${ask === 'dom' ? 'domain is the set of inputs: the first coordinate' : 'range is the set of outputs: the second coordinate'} of every point.`,
            `Collect them: ${(ask === 'dom' ? xs : ys).map(N).join(', ')}. ${right.length < 4 ? 'A value that repeats is listed only once.' : 'List each value once, in order.'}`,
            `The ${word} is <b>${answer}</b>.`] };
      }
      const idx = rng.int(0, SITUATIONS.length - 1), s = SITUATIONS[idx](rng);
      const answer = ask === 'dom' ? s.dom : s.ran;
      return { prompt: `${s.text} What is a reasonable ${word} for this function?`, type: 'choice', choices: [answer].concat(ask === 'dom' ? s.wrongDom : s.wrongRan), answer,
        params: { kind: 'situation', ask, discrete: s.discrete, bounds: ask === 'dom' ? s.dBounds : s.rBounds, per: s.per },
        hints: [ask === 'dom' ? `The domain is the set of inputs that make sense here: ${s.inputNote}` : `The range is the set of outputs the function can actually produce: ${s.outputNote}`, `So the ${word} is <b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params, got = nums(q.answer);
      if (p.kind === 'points') { const want = uniq(sorted(p.ask === 'dom' ? p.xs : p.ys)); return got.length === want.length && got.every((v, i) => v === want[i]); }
      const kindOk = p.discrete ? (p.ask === 'dom' ? q.answer.startsWith('whole numbers') : q.answer.startsWith(`multiples of ${p.per} `)) : q.answer.startsWith('all real numbers');
      const b = p.discrete && p.ask === 'ran' ? got.slice(1) : got;        // skip the "multiples of 8"
      return kindOk && b.length === 2 && b[0] === p.bounds[0] && b[1] === p.bounds[1];
    },
  });

  A.skill({
    id: 'int1.function-or-not', title: 'Recognizing functions',
    learn: p(`A relation is a <b>function</b> when every input has exactly one output. The test: <b>if any input appears twice with different outputs, it is not a function.</b> Two different inputs are allowed to share an output; that does not break the rule.`) +
      p(`In a table, scan the input column for repeats. In a list of ordered pairs, look for the same first coordinate twice. On a graph, the vertical line test does the same job: a vertical line may cross the graph at most once.`) +
      example('Example', `${big('{(1, 4), (2, 7), (3, 4), (2, 9)}')}The input 2 is paired with both 7 and 9, so this is <b>not a function</b>. The repeated output 4 is fine.`),
    make(rng) {
      const isFn = rng.bool(), n = 5;
      const xs = rng.sample([-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8], n), ys = rng.sample([-5, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12], n);
      let dupX = null, dupY = null, i = rng.int(0, n - 2);
      if (!isFn) { xs[i + 1] = xs[i]; dupX = xs[i]; }                                  // same input, two outputs
      if (rng.chance(isFn ? 0.7 : 0.4)) { const j = isFn ? i : (i + 2) % (n - 1); ys[j + 1] = ys[j]; dupY = ys[j]; }   // a shared output is allowed
      const order = rng.shuffle([0, 1, 2, 3, 4]), asTable = rng.bool();
      const shown = asTable ? M.table([X, Y], order.map(k => [N(xs[k]), N(ys[k])])) : big(`{${order.map(k => M.pt(xs[k], ys[k])).join(', ')}}`);
      const a = dupX != null ? dupX : rng.pick(xs), b = dupY != null ? dupY : rng.pick(ys);
      const yes = 'Yes: every input has exactly one output', noIn = `No: the input ${N(a)} has two different outputs`, noOut = `No: the output ${N(b)} appears twice`;
      const answer = isFn ? yes : noIn;
      const outs = isFn ? [] : [ys[i], ys[i + 1]];
      return { prompt: `Is ${Y} a function of ${X}?${shown}`, type: 'choice', choices: [yes, noIn, noOut], answer, params: { xs, ys },
        hints: [`Look through the inputs (the ${X}-values) for a value that appears more than once.`,
          isFn ? `No input repeats${dupY != null ? `. The output ${N(dupY)} appears twice, but a shared output is allowed` : ''}.` : `The input ${N(dupX)} appears twice, paired with ${N(outs[0])} and ${N(outs[1])}: one input, two outputs.`,
          `<b>${answer}</b>.`] };
    },
    verify(q) {
      const { xs, ys } = q.params;
      let bad = null;
      for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) if (xs[i] === xs[j] && ys[i] !== ys[j]) bad = xs[i];
      return bad == null ? q.answer.startsWith('Yes') : q.answer.startsWith('No: the input') && nums(q.answer)[0] === bad;
    },
  });

  /* ---------- Unit 2: Linear functions and arithmetic sequences ---------- */
  A.skill({
    id: 'int1.slope', title: 'Slope and rate of change',
    learn: p(`The <b>slope</b> of a line measures how steep it is: how much ${Y} changes for each step of 1 in ${X}. From two points (${X}₁, ${Y}₁) and (${X}₂, ${Y}₂): <b>slope = ${sfrac(`change in ${Y}`, `change in ${X}`)} = ${sfrac(`${Y}₂ − ${Y}₁`, `${X}₂ − ${X}₁`)}</b>. Subtract in the same order on top and bottom.`) +
      p(`A positive slope rises from left to right, a negative slope falls, and a slope of 0 is a flat line. In a table or a story the slope is the <b>rate of change</b>: dollars per hour, centimetres per week, degrees per hour.`) +
      example('Example', `${big('Find the slope of the line through (−2, 7) and (4, −5).')}${sfrac('−5 − 7', '4 − (−2)')} = ${sfrac('−12', '6')} = <b>−2</b>.`),
    make(rng) {
      const kind = rng.pick(['points', 'points', 'table', 'rate']);
      const den = kind === 'rate' ? 1 : rng.pick([1, 1, 2, 3, 4]), num = kind === 'rate' ? rng.nz(-4, 5) : rng.nz(-6, 8), k = rng.int(1, 3);
      const x1 = kind === 'rate' ? rng.int(1, 5) : rng.int(-6, 6), y1 = kind === 'rate' ? rng.int(12, 24) : rng.int(-8, 8);
      const x2 = x1 + den * k, y2 = y1 + num * k;
      const [sn, sd] = M.simp(y2 - y1, x2 - x1), ans = sn / sd;
      const base = { type: 'number', answer: ans, answerText: M.fracText(sn, sd), params: { x1, y1, x2, y2 } };
      if (kind === 'rate') {
        const ctx = rng.pick([
          { text: `At ${x1} pm the temperature was ${y1}°C, and at ${x2} pm it was ${y2}°C.`, what: 'temperature', per: 'hour', unit: '°C per hour' },
          { text: `A plant was ${y1} cm tall after ${x1} weeks and ${y2} cm tall after ${x2} weeks.`, what: 'height', per: 'week', unit: 'cm per week' },
          { text: `A tank held ${y1} litres after ${x1} minutes and ${y2} litres after ${x2} minutes.`, what: 'volume', per: 'minute', unit: 'litres per minute' }].filter(c => num > 0 || c.what !== 'height'));
        return Object.assign(base, { prompt: `${ctx.text} What was the rate of change of the ${ctx.what}, in ${ctx.unit}?`, unit: ctx.unit,
          hints: [`Rate of change = change in ${ctx.what} ÷ change in time.`, `${sfrac(`${N(y2)} − ${N(y1)}`, `${N(x2)} − ${N(x1)}`)} = ${N(y2 - y1)} ÷ ${N(x2 - x1)}.`, `The rate of change is <b>${N(ans)}</b> ${ctx.unit}.`] });
      }
      const hints = [`Slope = ${sfrac(`${Y}₂ − ${Y}₁`, `${X}₂ − ${X}₁`)}. Subtract the ${Y}-values and the ${X}-values in the same order.`,
        `${sfrac(`${N(y2)} − ${wrap(y1)}`, `${N(x2)} − ${wrap(x1)}`)} = ${sfrac(N(y2 - y1), N(x2 - x1))}.`,
        `${M.gcd(y2 - y1, x2 - x1) !== 1 ? 'Simplify: ' : ''}the slope is <b>${F(sn, sd)}</b>${sd === 1 ? '' : ` (${M.fracText(sn, sd)})`}.`];
      if (kind === 'table') {
        const xs = [x1, x2, x1 + 2 * den * k], ys = [y1, y2, y1 + 2 * num * k];
        return Object.assign(base, { hints, prompt: `The table shows points on a line. What is the slope of the line?${M.table([X, Y], xs.map((x, i) => [N(x), N(ys[i])]))}` });
      }
      return Object.assign(base, { hints, prompt: `What is the slope of the line through ${M.pt(x1, y1)} and ${M.pt(x2, y2)}?` });
    },
    verify(q) { const { x1, y1, x2, y2 } = q.params; return Math.abs(q.answer * (x2 - x1) - (y2 - y1)) < 1e-9; },   // rise = slope × run
  });

  A.skill({
    id: 'int1.linear-equations', title: 'Writing linear equations',
    learn: p(`A line is described by <b>${Y} = ${V('m')}${X} + ${V('b')}</b>, where ${V('m')} is the slope and ${V('b')} is the ${Y}-intercept: the value of ${Y} when ${X} = 0.`) +
      p(`<b>From a slope and a point:</b> put the slope in for ${V('m')}, substitute the point's coordinates for ${X} and ${Y}, and solve for ${V('b')}. <b>From two points:</b> find the slope first, then use either point to find ${V('b')}. A point's ${Y}-value is the intercept only when its ${X}-value is 0.`) +
      example('Example', `${big('Slope 3, through (2, 1).')}${Y} = 3${X} + ${V('b')}. Substitute (2, 1): 1 = 3(2) + ${V('b')}, so ${V('b')} = −5. The line is <b>${Y} = 3${X} − 5</b>.`),
    make(rng) {
      const m = rng.nz(-4, 4), x1 = rng.nz(-5, 5);
      let y1 = rng.int(-8, 8), b = y1 - m * x1;
      if (b === 0) { y1 += 2; b = 2; }
      const two = rng.bool(), dx = rng.int(1, 4) * rng.sign(), x2 = x1 + dx, y2 = y1 + m * dx;
      const answer = lineEq(m, b);
      const choices = [answer].concat(distinct(answer, [lineEq(m, y1), lineEq(m, -b), lineEq(-m, b), lineEq(b, m)], 3));
      const hints = two ? [`Find the slope first: ${sfrac(`${N(y2)} − ${wrap(y1)}`, `${N(x2)} − ${wrap(x1)}`)} = ${N(m)}.`] : [];
      hints.push(`Start from ${Y} = ${M.term(m, 'x')} + ${V('b')} and substitute ${M.pt(x1, y1)}: ${N(y1)} = ${N(m)}(${N(x1)}) + ${V('b')}.`,
        `${N(y1)} = ${N(m * x1)} + ${V('b')}, so ${V('b')} = ${N(y1)} − ${wrap(m * x1)} = ${N(b)}.`, `<b>${answer}</b>.`);
      return { prompt: two ? `Write the equation of the line through ${M.pt(x1, y1)} and ${M.pt(x2, y2)}.` : `Write the equation of the line with slope ${N(m)} that passes through ${M.pt(x1, y1)}.`,
        type: 'choice', choices, answer, params: { m, b, pts: [[x1, y1], [x2, y2]] }, hints };
    },
    verify(q) { const { m, b, pts } = q.params; return pts.every(([x, y]) => m * x + b === y) && q.answer === lineEq(m, b); },   // both points lie on the line
  });

  /* stories for int1.interpret-linear: the slope meanings say "each"/"per", the intercept meanings say "before"/"start" */
  const CONTEXTS = [
    (rng, name) => { const r = rng.pick([1.5, 2, 2.5, 3]), f = rng.int(4, 6); return { story: `A taxi company charges according to ${V('C')} = ${N(r)}${V('m')} + ${f}, where ${V('C')} is the cost in dollars of a ride of ${V('m')} miles.`, slope: r, icpt: f, v: 'm', dep: 'cost', slopeMeaning: 'The charge for each mile driven', icptMeaning: 'The fee charged before the ride starts', others: ['The total cost of the ride', 'The number of miles driven'] }; },
    (rng, name) => { const g = rng.pick([0.5, 1, 1.5, 2]), s = rng.int(6, 15); return { story: `The height in cm of ${name}'s sunflower after ${V('w')} weeks is ${V('h')} = ${N(g)}${V('w')} + ${s}.`, slope: g, icpt: s, v: 'w', dep: 'height', slopeMeaning: 'The number of cm the plant grows each week', icptMeaning: 'The height of the plant when measuring started', others: ['The height of the plant after w weeks', 'The number of weeks of growing'] }; },
    (rng, name) => { const r = rng.pick([1.5, 2, 3]), H = rng.int(15, 30); return { story: `A candle's height in cm after burning for ${V('t')} hours is ${V('h')} = −${N(r)}${V('t')} + ${H}.`, slope: -r, icpt: H, v: 't', dep: 'height', slopeMeaning: 'The number of cm the candle burns down each hour', icptMeaning: 'The height of the candle before it was lit', others: ['The height of the candle after t hours', 'The number of hours the candle has burned'] }; },
    (rng, name) => { const a = rng.pick([10, 15, 20, 25]), d = rng.int(3, 12) * 10; return { story: `${name} saves money according to ${V('S')} = ${a}${V('w')} + ${d}, where ${V('S')} is the amount in dollars saved after ${V('w')} weeks.`, slope: a, icpt: d, v: 'w', dep: 'savings', slopeMeaning: 'The amount saved each week', icptMeaning: 'The amount already saved at the start', others: ['The total amount saved after w weeks', 'The number of weeks of saving'] }; },
    (rng, name) => { const g = rng.pick([5, 8, 10]), c = rng.pick([20, 25, 30, 35]); return { story: `A phone plan costs ${V('P')} = ${g}${V('d')} + ${c} dollars a month, where ${V('d')} is the number of gigabytes of data used.`, slope: g, icpt: c, v: 'd', dep: 'bill', slopeMeaning: 'The charge per gigabyte of data', icptMeaning: 'The monthly charge before any data is used', others: ['The total monthly bill', 'The number of gigabytes used'] }; },
    (rng, name) => { const r = rng.pick([80, 100, 120, 150]), v0 = rng.int(20, 60) * 100; return { story: `A pool is being drained. Its volume in litres after ${V('t')} minutes is ${V('V')} = −${r}${V('t')} + ${N(v0)}.`, slope: -r, icpt: v0, v: 't', dep: 'volume', slopeMeaning: 'The number of litres drained each minute', icptMeaning: 'The volume of water before draining started', others: ['The volume left after t minutes', 'The number of minutes of draining'] }; },
  ];

  A.skill({
    id: 'int1.interpret-linear', title: 'Interpreting slope and intercept in context',
    learn: p(`When a line models a situation, its two numbers each mean something. In ${Y} = ${V('m')}${X} + ${V('b')}, the <b>slope ${V('m')} is the rate of change</b>: how much the output changes for each extra unit of input (dollars per mile, cm per week). The <b>${Y}-intercept ${V('b')} is the starting value</b>: the output when the input is 0, before anything has happened.`) +
      p(`A negative slope means the output goes down as the input goes up: a candle burning, a pool draining. The intercept is still the value at the start.`) +
      example('Example', `${big(`${V('C')} = 2.5${V('m')} + 4`)}for a taxi ride of ${V('m')} miles. The 2.5 is the charge for each mile; the 4 is the fee you pay before the car moves.`),
    make(rng) {
      const name = rng.pick(NAMES), ctx = rng.pick(CONTEXTS)(rng, name), which = rng.pick(['slope', 'icpt']);
      const val = which === 'slope' ? ctx.slope : ctx.icpt, answer = which === 'slope' ? ctx.slopeMeaning : ctx.icptMeaning;
      const choices = [ctx.slopeMeaning, ctx.icptMeaning].concat(ctx.others);
      return { prompt: `${ctx.story} What does the ${N(val)} represent?`, type: 'choice', choices, answer, params: { which },
        hints: [`In ${Y} = ${V('m')}${X} + ${V('b')} form, the number multiplying the variable is the slope (the rate of change), and the constant is the value when the variable is 0.`,
          which === 'slope' ? `${N(val)} multiplies ${V(ctx.v)}, so it is the change in the ${ctx.dep} for each extra unit of ${V(ctx.v)}.` : `${N(val)} is the ${ctx.dep} when ${V(ctx.v)} = 0, before anything has happened.`,
          `<b>${answer}</b>.`] };
    },
    verify(q) { return q.params.which === 'slope' ? /\b(each|per)\b/.test(q.answer) : /\b(before|start|started)\b/.test(q.answer); },
  });

  A.skill({
    id: 'int1.arithmetic-sequences', title: 'Arithmetic sequences',
    learn: p(`An <b>arithmetic sequence</b> adds the same number each time: 5, 8, 11, 14, … adds 3. That number is the <b>common difference ${V('d')}</b>. To get from the first term to the ${V('n')}th you make ${V('n')} − 1 jumps, so <b>${V('t')}(${V('n')}) = ${V('t')}(1) + (${V('n')} − 1)${V('d')}</b>.`) +
      p(`Multiplying out gives the explicit rule in slope form: ${V('t')}(${V('n')}) = ${V('d')}${V('n')} + (${V('t')}(1) − ${V('d')}). For 5, 8, 11, … that is ${V('t')}(${V('n')}) = 3${V('n')} + 2. Check it: ${V('t')}(1) = 5, ${V('t')}(2) = 8. An arithmetic sequence is a linear function whose inputs are the counting numbers.`) +
      example('Example', `${big('−4, 1, 6, 11, … What is the 20th term?')}${V('d')} = 5. ${V('t')}(20) = −4 + 19 × 5 = <b>91</b>.`),
    make(rng) {
      const d = rng.nz(-6, 8), kind = rng.pick(['nth', 'nth', 'rule', 'word']);
      let a = rng.nz(-9, 15); if (a === d) a = d > 0 ? d + 1 : d - 1;
      const terms = [0, 1, 2, 3].map(i => a + d * i), seq = `${terms.map(N).join(', ')}, …`;
      if (kind === 'rule') {
        const rule = (c0, c1) => `${V('t')}(${V('n')}) = ${M.poly([c0, c1], 'n')}`, answer = rule(d, a - d);
        const choices = [answer].concat(distinct(answer, [rule(d, a), rule(a, d), rule(d, a + d), rule(a, a - d)], 3));
        return { prompt: `An arithmetic sequence begins ${seq} Which explicit rule gives the ${V('n')}th term?`, type: 'choice', choices, answer, params: { kind, a, d, coefs: [d, a - d] },
          hints: [`The common difference is ${N(d)}, so the rule has the form ${V('t')}(${V('n')}) = ${M.term(d, 'n')} + ${V('c')}: the difference is the “slope”.`,
            `Use the first term to find ${V('c')}: ${V('t')}(1) = ${N(d)}(1) + ${V('c')} = ${N(a)}, so ${V('c')} = ${N(a)} − ${wrap(d)} = ${N(a - d)}.`,
            `<b>${answer}</b>. Check: ${V('t')}(2) = ${N(d)}(2) ${M.signed(a - d)} = ${N(terms[1])}.`] };
      }
      if (kind === 'word') {
        const s = rng.int(10, 24), dd = rng.int(2, 4), n = rng.int(8, 20), ans = s + dd * (n - 1);
        return { prompt: `A theater has ${s} seats in the first row, and each row has ${dd} more seats than the row in front of it. How many seats are in row ${n}?`, type: 'number', answer: ans, params: { kind, a: s, d: dd, n },
          hints: [`The rows form an arithmetic sequence: first term ${s}, common difference ${dd}.`, `Row ${n} is ${n - 1} jumps after row 1: ${s} + ${n - 1} × ${dd}.`, `${s} + ${N(dd * (n - 1))} = <b>${N(ans)}</b> seats.`] };
      }
      const n = rng.int(8, 30), ans = a + d * (n - 1);
      return { prompt: `An arithmetic sequence begins ${seq} What is the ${M.ordinal(n)} term?`, type: 'number', answer: ans, params: { kind, a, d, n },
        hints: [`Each term is ${N(Math.abs(d))} ${d > 0 ? 'more' : 'less'} than the one before: the common difference is ${N(d)}.`,
          `The ${M.ordinal(n)} term is the first term plus ${n - 1} jumps: ${N(a)} + ${n - 1} × ${wrap(d)}.`,
          `${N(a)} ${M.signed((n - 1) * d)} = <b>${N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'rule') return [1, 2, 3, 4].every(n => p.coefs[0] * n + p.coefs[1] === p.a + (n - 1) * p.d) && q.answer === `${V('t')}(${V('n')}) = ${M.poly(p.coefs, 'n')}`;
      let t = p.a; for (let i = 1; i < p.n; i++) t += p.d;        // walk the sequence one jump at a time
      return t === q.answer;
    },
  });

  /* ---------- Unit 3: Equations and inequalities ---------- */
  A.skill({
    id: 'int1.multistep-equations', title: 'Multi-step equations',
    learn: p(`To solve an equation, undo what has been done to ${X}, doing the same thing to both sides each step. <b>Distribute first</b> to clear any parentheses, then <b>collect the ${X} terms on one side</b> and the plain numbers on the other, then divide by the coefficient of ${X}.`) +
      p(`With ${X} on both sides, subtract the smaller ${X} term from both sides so it disappears. Check at the end by substituting your answer into the original equation: both sides must come out equal.`) +
      example('Example', `${big(`3(${X} − 2) = 5${X} + 4`)}Distribute: 3${X} − 6 = 5${X} + 4. Subtract 3${X}: −6 = 2${X} + 4. Subtract 4: −10 = 2${X}. So ${X} = <b>−5</b>. Check: 3(−7) = −21 and 5(−5) + 4 = −21.`),
    make(rng) {
      const x0 = rng.int(-8, 8), kind = rng.pick(['both', 'both', 'dist', 'dist-both']);
      let left, right, params, hints;
      if (kind === 'both') {
        const a = rng.nz(-7, 7); let c = rng.nz(-7, 7); if (c === a) c = -a;
        const b = rng.nz(-9, 9), d = a * x0 + b - c * x0;
        left = M.poly([a, b]); right = M.poly([c, d]); params = { kind, a, b, c, d };
        hints = [`Get the ${X} terms together: ${moveTerm(c)} both sides to get ${M.poly([a - c, b])} = ${N(d)}.`, `${moveWord(b)} both sides: ${M.term(a - c, 'x')} = ${N(d - b)}.`, `Divide both sides by ${N(a - c)}: ${X} = <b>${N(x0)}</b>.`];
      } else if (kind === 'dist') {
        const a = rng.pick([2, 3, 4, 5, -2, -3, -4]), b = rng.nz(-6, 6), c = rng.chance(0.5) ? rng.nz(-9, 9) : 0, d = a * (x0 + b) + c;
        left = `${N(a)}(${M.poly([1, b])})${tail(c)}`; right = N(d); params = { kind, a, b, c, d };
        hints = [`Distribute: ${N(a)}(${M.poly([1, b])}) = ${M.poly([a, a * b])}, so the equation is ${M.poly([a, a * b + c])} = ${N(d)}.`, `${moveWord(a * b + c)} both sides: ${M.term(a, 'x')} = ${N(d - a * b - c)}.`, `Divide both sides by ${N(a)}: ${X} = <b>${N(x0)}</b>.`];
      } else {
        const a = rng.pick([2, 3, 4, 5, -2, -3]), b = rng.nz(-6, 6); let c = rng.nz(-6, 6); if (c === a) c = -a;
        const d = a * (x0 + b) - c * x0;
        left = `${N(a)}(${M.poly([1, b])})`; right = M.poly([c, d]); params = { kind, a, b, c, d };
        hints = [`Distribute: ${M.poly([a, a * b])} = ${M.poly([c, d])}.`, `${moveTerm(c)[0].toUpperCase() + moveTerm(c).slice(1)} both sides: ${M.poly([a - c, a * b])} = ${N(d)}. Then ${moveWord(a * b).toLowerCase()} both sides: ${M.term(a - c, 'x')} = ${N(d - a * b)}.`, `Divide both sides by ${N(a - c)}: ${X} = <b>${N(x0)}</b>.`];
      }
      return { prompt: `Solve for ${X}.${big(`${left} = ${right}`)}`, type: 'number', answer: x0, params, hints };
    },
    verify(q) {
      const { kind, a, b, c, d } = q.params;
      const [l, r] = kind === 'both' ? [`(${a})*x+(${b})`, `(${c})*x+(${d})`] : kind === 'dist' ? [`(${a})*(x+(${b}))+(${c})`, `${d}`] : [`(${a})*(x+(${b}))`, `(${c})*x+(${d})`];
      const f = new Function('x', `return [${l}, ${r}];`), [lv, rv] = f(q.answer), [l1, r1] = f(q.answer + 1);
      return lv === rv && l1 !== r1;        // the answer balances the equation, and it is not an identity
    },
  });

  /* formulas for int1.literal-equations; `solved` and `holds` let verify() test the rearrangement with numbers */
  const FORMULAS = [
    { eq: `${V('P')} = 2${V('l')} + 2${V('w')}`, t: 'w', right: `${V('w')} = ${sfrac(`${V('P')} − 2${V('l')}`, '2')}`, wrong: [`${V('w')} = ${sfrac(V('P'), '2')} − 2${V('l')}`, `${V('w')} = ${sfrac(`${V('P')} + 2${V('l')}`, '2')}`, `${V('w')} = ${V('P')} − 2${V('l')}`],
      steps: [`Subtract 2${V('l')} from both sides: ${V('P')} − 2${V('l')} = 2${V('w')}.`, `Divide both sides by 2.`], vals: { P: 20, l: 6 }, solved: v => (v.P - 2 * v.l) / 2, holds: (v, w) => v.P === 2 * v.l + 2 * w },
    { eq: `${V('A')} = ${F(1, 2)}${V('b')}${V('h')}`, t: 'h', right: `${V('h')} = ${sfrac(`2${V('A')}`, V('b'))}`, wrong: [`${V('h')} = ${sfrac(V('A'), `2${V('b')}`)}`, `${V('h')} = ${sfrac(V('b'), `2${V('A')}`)}`, `${V('h')} = 2${V('A')} − ${V('b')}`],
      steps: [`Multiply both sides by 2 to clear the fraction: 2${V('A')} = ${V('b')}${V('h')}.`, `Divide both sides by ${V('b')}.`], vals: { A: 12, b: 4 }, solved: v => 2 * v.A / v.b, holds: (v, h) => v.A === v.b * h / 2 },
    { eq: `${V('d')} = ${V('r')}${V('t')}`, t: 't', right: `${V('t')} = ${sfrac(V('d'), V('r'))}`, wrong: [`${V('t')} = ${sfrac(V('r'), V('d'))}`, `${V('t')} = ${V('d')} − ${V('r')}`, `${V('t')} = ${sfrac('1', `${V('d')}${V('r')}`)}`],
      steps: [`${V('t')} is multiplied by ${V('r')}, so undo that by dividing both sides by ${V('r')}.`], vals: { d: 60, r: 12 }, solved: v => v.d / v.r, holds: (v, t) => v.d === v.r * t },
    { eq: `${Y} = ${V('m')}${X} + ${V('b')}`, t: 'x', right: `${X} = ${sfrac(`${Y} − ${V('b')}`, V('m'))}`, wrong: [`${X} = ${sfrac(Y, V('m'))} − ${V('b')}`, `${X} = ${sfrac(`${Y} + ${V('b')}`, V('m'))}`, `${X} = ${sfrac(`${V('b')} − ${Y}`, V('m'))}`],
      steps: [`Subtract ${V('b')} from both sides: ${Y} − ${V('b')} = ${V('m')}${X}.`, `Divide both sides by ${V('m')}.`], vals: { y: 11, m: 3, b: 2 }, solved: v => (v.y - v.b) / v.m, holds: (v, x) => v.y === v.m * x + v.b },
    { eq: `${V('C')} = 2π${V('r')}`, t: 'r', right: `${V('r')} = ${sfrac(V('C'), '2π')}`, wrong: [`${V('r')} = ${sfrac('2π', V('C'))}`, `${V('r')} = ${sfrac(V('C'), 'π')}`, `${V('r')} = ${V('C')} − 2π`],
      steps: [`${V('r')} is multiplied by 2π, so divide both sides by 2π.`], vals: { C: 6 * Math.PI }, solved: v => v.C / (2 * Math.PI), holds: (v, r) => Math.abs(v.C - 2 * Math.PI * r) < 1e-9 },
    { eq: `${V('V')} = ${V('l')}${V('w')}${V('h')}`, t: 'h', right: `${V('h')} = ${sfrac(V('V'), `${V('l')}${V('w')}`)}`, wrong: [`${V('h')} = ${sfrac(`${V('l')}${V('w')}`, V('V'))}`, `${V('h')} = ${V('V')} − ${V('l')}${V('w')}`, `${V('h')} = ${sfrac(V('V'), V('l'))} − ${V('w')}`],
      steps: [`${V('h')} is multiplied by both ${V('l')} and ${V('w')}, so divide both sides by ${V('l')}${V('w')}.`], vals: { V: 24, l: 2, w: 3 }, solved: v => v.V / (v.l * v.w), holds: (v, h) => v.V === v.l * v.w * h },
    { eq: `${V('F')} = ${F(9, 5)}${V('C')} + 32`, t: 'C', right: `${V('C')} = ${F(5, 9)}(${V('F')} − 32)`, wrong: [`${V('C')} = ${F(9, 5)}(${V('F')} − 32)`, `${V('C')} = ${F(5, 9)}${V('F')} + 32`, `${V('C')} = ${F(5, 9)}(32 − ${V('F')})`],
      steps: [`Subtract 32 from both sides: ${V('F')} − 32 = ${F(9, 5)}${V('C')}.`, `Multiply both sides by ${F(5, 9)}, the reciprocal of ${F(9, 5)}.`], vals: { F: 212 }, solved: v => 5 / 9 * (v.F - 32), holds: (v, C) => Math.abs(v.F - (9 / 5 * C + 32)) < 1e-9 },
    { eq: `${V('a')}${X} + ${V('b')}${Y} = ${V('c')}`, t: 'y', right: `${Y} = ${sfrac(`${V('c')} − ${V('a')}${X}`, V('b'))}`, wrong: [`${Y} = ${sfrac(V('c'), V('b'))} − ${V('a')}${X}`, `${Y} = ${sfrac(`${V('c')} + ${V('a')}${X}`, V('b'))}`, `${Y} = ${sfrac(`${V('a')}${X} − ${V('c')}`, V('b'))}`],
      steps: [`Subtract ${V('a')}${X} from both sides: ${V('b')}${Y} = ${V('c')} − ${V('a')}${X}.`, `Divide both sides by ${V('b')}.`], vals: { a: 2, x: 3, b: 4, c: 18 }, solved: v => (v.c - v.a * v.x) / v.b, holds: (v, y) => v.a * v.x + v.b * y === v.c },
    { eq: `${V('v')} = ${V('u')} + ${V('a')}${V('t')}`, t: 'a', right: `${V('a')} = ${sfrac(`${V('v')} − ${V('u')}`, V('t'))}`, wrong: [`${V('a')} = ${sfrac(V('v'), V('t'))} − ${V('u')}`, `${V('a')} = ${sfrac(`${V('u')} − ${V('v')}`, V('t'))}`, `${V('a')} = ${sfrac(`${V('v')} + ${V('u')}`, V('t'))}`],
      steps: [`Subtract ${V('u')} from both sides: ${V('v')} − ${V('u')} = ${V('a')}${V('t')}.`, `Divide both sides by ${V('t')}.`], vals: { v: 20, u: 5, t: 3 }, solved: v => (v.v - v.u) / v.t, holds: (v, a) => v.v === v.u + a * v.t },
    { eq: `${V('A')} = ${F(1, 2)}(${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)})${V('h')}`, t: 'h', right: `${V('h')} = ${sfrac(`2${V('A')}`, `${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)}`)}`, wrong: [`${V('h')} = ${sfrac(V('A'), `2(${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)})`)}`, `${V('h')} = ${sfrac(`${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)}`, `2${V('A')}`)}`, `${V('h')} = 2${V('A')} − (${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)})`],
      steps: [`Multiply both sides by 2: 2${V('A')} = (${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)})${V('h')}.`, `Divide both sides by the whole bracket (${M.sub(V('b'), 1)} + ${M.sub(V('b'), 2)}).`], vals: { A: 20, b1: 3, b2: 5 }, solved: v => 2 * v.A / (v.b1 + v.b2), holds: (v, h) => v.A === (v.b1 + v.b2) * h / 2 },
    { eq: `${V('I')} = ${V('P')}${V('r')}${V('t')}`, t: 'r', right: `${V('r')} = ${sfrac(V('I'), `${V('P')}${V('t')}`)}`, wrong: [`${V('r')} = ${sfrac(`${V('P')}${V('t')}`, V('I'))}`, `${V('r')} = ${V('I')} − ${V('P')}${V('t')}`, `${V('r')} = ${sfrac(V('I'), V('P'))} − ${V('t')}`],
      steps: [`${V('r')} is multiplied by ${V('P')} and by ${V('t')}, so divide both sides by ${V('P')}${V('t')}.`], vals: { I: 30, P: 100, t: 3 }, solved: v => v.I / (v.P * v.t), holds: (v, r) => Math.abs(v.I - v.P * r * v.t) < 1e-9 },
    { eq: `${V('S')} = 180(${V('n')} − 2)`, t: 'n', right: `${V('n')} = ${sfrac(V('S'), '180')} + 2`, wrong: [`${V('n')} = ${sfrac(`${V('S')} + 2`, '180')}`, `${V('n')} = ${sfrac(V('S'), '180')} − 2`, `${V('n')} = ${sfrac(`${V('S')} − 2`, '180')}`],
      steps: [`Divide both sides by 180 first: ${sfrac(V('S'), '180')} = ${V('n')} − 2.`, `Add 2 to both sides.`], vals: { S: 540 }, solved: v => v.S / 180 + 2, holds: (v, n) => v.S === 180 * (n - 2) },
  ];

  A.skill({
    id: 'int1.literal-equations', title: 'Solving literal equations',
    learn: p(`A <b>literal equation</b> is a formula with several letters, like ${V('P')} = 2${V('l')} + 2${V('w')}. Solving it for one letter means rearranging until that letter is alone on one side. <b>Use exactly the same moves as with numbers:</b> undo addition with subtraction, undo multiplication with division, and do each move to both sides.`) +
      p(`Treat every other letter as if it were a known number. If the letter you want is inside a bracket or multiplied by a bracket, divide by the whole bracket. A fraction like ${F(1, 2)} is cleared by multiplying both sides by 2.`) +
      example('Example', `${big(`Solve ${V('A')} = ${F(1, 2)}${V('b')}${V('h')} for ${V('b')}.`)}Multiply both sides by 2: 2${V('A')} = ${V('b')}${V('h')}. Divide by ${V('h')}: <b>${V('b')} = ${sfrac(`2${V('A')}`, V('h'))}</b>.`),
    make(rng) {
      const idx = rng.int(0, FORMULAS.length - 1), e = FORMULAS[idx];
      return { prompt: `Solve for ${V(e.t)}.${big(e.eq)}`, type: 'choice', choices: [e.right].concat(e.wrong), answer: e.right, params: { idx }, hints: e.steps.concat([`<b>${e.right}</b>.`]) };
    },
    verify(q) { const e = FORMULAS[q.params.idx], t = e.solved(e.vals); return isFinite(t) && e.holds(e.vals, t) && q.answer === e.right; },   // the rearranged formula satisfies the original with numbers
  });

  A.skill({
    id: 'int1.inequalities', title: 'Linear and compound inequalities',
    learn: p(`Solve an inequality with the same moves as an equation, with one extra rule: <b>when you multiply or divide both sides by a negative number, flip the inequality sign.</b> −2${X} &lt; 6 becomes ${X} &gt; −3. Adding or subtracting never flips it.`) +
      p(`A <b>compound inequality</b> is two conditions at once. “And” form, like −3 &lt; 2${X} + 1 ≤ 7, is solved on all three parts together: subtract 1 everywhere, divide by 2 everywhere, to get −2 &lt; ${X} ≤ 3. “Or” form, like 3${X} &lt; −6 or 3${X} ≥ 9, is two separate inequalities whose answers are joined with “or”.`) +
      example('Example', `${big(`5 − 3${X} ≥ 17`)}Subtract 5: −3${X} ≥ 12. Divide by −3 and flip: <b>${X} ≤ −4</b>. Check ${X} = −5: 5 + 15 = 20 ≥ 17. ✓`),
    make(rng) {
      const kind = rng.pick(['flip', 'flip', 'and', 'or']);
      const flip = r => ({ '<': '>', '>': '<', '≤': '≥', '≥': '≤' })[r], tog = r => ({ '<': '≤', '≤': '<', '>': '≥', '≥': '>' })[r];
      if (kind === 'flip') {
        const a = -rng.int(2, 6), x0 = rng.nz(-7, 7), b = rng.int(-9, 9), rel = rng.pick(['<', '>', '≤', '≥']);
        let c = rng.chance(0.4) ? rng.int(1, 5) : 0; if (a + c === 0) c++;
        const d = a * x0 + b, ineq = r => `${X} ${r} `;
        const answer = `${ineq(flip(rel))}${N(x0)}`, choices = [answer, `${ineq(rel)}${N(x0)}`, `${ineq(flip(rel))}${N(-x0)}`, `${ineq(rel)}${N(-x0)}`];
        const hints = c ? [`Get the ${X} terms together: ${moveTerm(c)} both sides to get ${M.poly([a, b])} ${rel} ${N(d)}.`] : [];
        hints.push(`${moveWord(b)} both sides: ${M.term(a, 'x')} ${rel} ${N(d - b)}.`, `Divide both sides by ${N(a)}. Dividing by a negative number flips the inequality sign: ${X} ${flip(rel)} ${N(x0)}.`, `<b>${answer}</b>.`);
        return { prompt: `Solve the inequality.${big(`${M.poly([a + c, b])} ${rel} ${c ? M.poly([c, d]) : N(d)}`)}`, type: 'choice', choices, answer, params: { kind, a, b, c, d, rel }, hints };
      }
      const m = rng.int(2, 4), k = rng.nz(-3, 3), b = m * k, lo = rng.int(-5, 3), hi = lo + rng.int(2, 6), L = m * lo + b, R = m * hi + b;
      const relL = rng.pick(['<', '≤']), relR = kind === 'and' ? rng.pick(['<', '≤']) : rng.pick(['>', '≥']);
      const both = (l, h, r1, r2) => kind === 'and' ? `${N(l)} ${r1} ${X} ${r2} ${N(h)}` : `${X} ${r1} ${N(l)} or ${X} ${r2} ${N(h)}`;
      const answer = both(lo, hi, relL, relR), choices = [answer, both(m * lo, m * hi, relL, relR), both(lo + 2 * k, hi + 2 * k, relL, relR), both(lo, hi, tog(relL), tog(relR))];
      const prompt = kind === 'and' ? `${N(L)} ${relL} ${M.poly([m, b])} ${relR} ${N(R)}` : `${M.poly([m, b])} ${relL} ${N(L)} or ${M.poly([m, b])} ${relR} ${N(R)}`;
      const hints = kind === 'and' ? [`Work on all three parts at once. ${moveWord(b)} each part: ${N(L - b)} ${relL} ${M.term(m, 'x')} ${relR} ${N(R - b)}.`, `Divide each part by ${m}. It is positive, so the signs stay as they are: ${N(lo)} ${relL} ${X} ${relR} ${N(hi)}.`]
        : [`Solve the two inequalities separately. ${moveWord(b)} both sides of each: ${M.term(m, 'x')} ${relL} ${N(L - b)} or ${M.term(m, 'x')} ${relR} ${N(R - b)}.`, `Divide by ${m} (positive, so no flip): ${X} ${relL} ${N(lo)} or ${X} ${relR} ${N(hi)}.`];
      return { prompt: `Solve the compound inequality.${big(prompt)}`, type: 'choice', choices, answer, params: { kind, m, b, L, R, relL, relR }, hints: hints.concat([`<b>${answer}</b>.`]) };
    },
    verify(q) {
      const p = q.params, s = plain(q.answer), cmp = (u, rel, v) => rel === '<' ? u < v : rel === '>' ? u > v : rel === '≤' ? u <= v : u >= v;
      let m, inSet;
      if ((m = s.match(/^x ([<>≤≥]) (-?\d+)$/))) inSet = t => cmp(t, m[1], Number(m[2]));
      else if ((m = s.match(/^(-?\d+) ([<≤]) x ([<≤]) (-?\d+)$/))) inSet = t => cmp(Number(m[1]), m[2], t) && cmp(t, m[3], Number(m[4]));
      else if ((m = s.match(/^x ([<≤]) (-?\d+) or x ([>≥]) (-?\d+)$/))) inSet = t => cmp(t, m[1], Number(m[2])) || cmp(t, m[3], Number(m[4]));
      else return 'could not parse ' + s;
      const truth = p.kind === 'flip' ? t => cmp((p.a + p.c) * t + p.b, p.rel, p.c * t + p.d)
        : p.kind === 'and' ? t => cmp(p.L, p.relL, p.m * t + p.b) && cmp(p.m * t + p.b, p.relR, p.R)
        : t => cmp(p.m * t + p.b, p.relL, p.L) || cmp(p.m * t + p.b, p.relR, p.R);
      for (let t = -25; t <= 25; t += 0.5) if (inSet(t) !== truth(t)) return false;   // the solution set matches the original inequality, point by point
      return true;
    },
  });

  /* ---------- Unit 4: Systems of equations ---------- */
  A.skill({
    id: 'int1.solve-systems', title: 'Solving systems of equations',
    learn: p(`A <b>system</b> is two equations that must both be true. Its solution is the one point (${X}, ${Y}) that satisfies both: where the two lines cross.`) +
      p(`<b>Substitution:</b> when one equation already says ${Y} = …, put that expression in for ${Y} in the other equation. Now there is only ${X} to solve for. <b>Elimination:</b> multiply the equations so one variable has matching coefficients, then add or subtract the equations to make it disappear. Either way, once you know one coordinate, substitute it back to find the other.`) +
      example('Example', `${big(`${Y} = 2${X} − 1 &nbsp;and&nbsp; 3${X} + ${Y} = 9`)}Substitute: 3${X} + (2${X} − 1) = 9, so 5${X} = 10 and ${X} = 2. Then ${Y} = 2(2) − 1 = 3. The solution is <b>(2, 3)</b>.`),
    make(rng) {
      const x0 = rng.nz(-6, 6); let y0 = rng.nz(-6, 6); while (y0 === x0) y0 = rng.nz(-6, 6);
      const kind = rng.pick(['sub', 'elim']), ask = rng.pick(['x', 'y', 'pt']);
      let lines, hints, params;
      if (kind === 'sub') {
        const m = rng.nz(-4, 4), b = y0 - m * x0, d = rng.nz(-5, 5); let c = rng.nz(-5, 5); if (c + d * m === 0) c = c === -1 ? 1 : c + 1;
        const e = c * x0 + d * y0;
        lines = [`${Y} = ${M.poly([m, b])}`, lin2(c, d, e)]; params = { kind, m, b, c, d, e };
        hints = [`Substitute ${M.poly([m, b])} for ${Y} in the second equation: ${M.term(c, 'x')} ${d < 0 ? '−' : '+'} ${N(Math.abs(d))}(${M.poly([m, b])}) = ${N(e)}.`,
          `Distribute and combine: ${M.poly([c + d * m, d * b])} = ${N(e)}, so ${M.term(c + d * m, 'x')} = ${N(e - d * b)} and ${X} = ${N(x0)}.`,
          `Then ${Y} = ${N(m)}(${N(x0)}) ${M.signed(b)} = ${N(y0)}.`];
      } else {
        const a = rng.nz(-5, 5), b = rng.nz(-5, 5), c = rng.nz(-5, 5); let d = rng.nz(-5, 5); if (a * d === b * c) d = d === -1 ? 1 : d + 1;
        const e = a * x0 + b * y0, f = c * x0 + d * y0;
        lines = [lin2(a, b, e), lin2(c, d, f)]; params = { kind, a, b, c, d, e, f };
        hints = [`Match the ${Y} coefficients: multiply the first equation by ${N(d)} and the second by ${N(b)}: ${lin2(a * d, b * d, e * d)} and ${lin2(c * b, d * b, f * b)}.`,
          `Subtract the second from the first to eliminate ${Y}: ${M.term(a * d - c * b, 'x')} = ${N(e * d - f * b)}, so ${X} = ${N(x0)}.`,
          `Substitute into the first equation: ${N(a * x0)} ${b < 0 ? '−' : '+'} ${M.term(Math.abs(b), 'y')} = ${N(e)}, so ${M.term(b, 'y')} = ${N(e - a * x0)} and ${Y} = ${N(y0)}.`];
      }
      const shown = big(lines.map(l => `<div>${l}</div>`).join(''));
      const base = { params: Object.assign(params, { ask }), hints };
      if (ask === 'pt') {
        const answer = M.pt(x0, y0), choices = [answer].concat(distinct(answer, [M.pt(y0, x0), M.pt(-x0, y0), M.pt(x0, -y0), M.pt(-x0, -y0)], 3));
        return Object.assign(base, { prompt: `Solve the system.${shown}Which point is the solution?`, type: 'choice', choices, answer, hints: hints.concat([`The solution is <b>${answer}</b>.`]) });
      }
      return Object.assign(base, { prompt: `Solve the system.${shown}What is the ${ask === 'x' ? X : Y}-coordinate of the solution?`, type: 'number', answer: ask === 'x' ? x0 : y0,
        hints: hints.concat([`The solution is ${M.pt(x0, y0)}, so ${ask === 'x' ? X : Y} = <b>${N(ask === 'x' ? x0 : y0)}</b>.`]) });
    },
    verify(q) {
      const p = q.params, found = [];
      for (let x = -15; x <= 15; x++) for (let y = -15; y <= 15; y++) {          // brute force over the integer grid
        const ok = p.kind === 'sub' ? y === p.m * x + p.b && p.c * x + p.d * y === p.e : p.a * x + p.b * y === p.e && p.c * x + p.d * y === p.f;
        if (ok) found.push([x, y]);
      }
      if (found.length !== 1) return 'solutions found: ' + found.length;
      const [x, y] = found[0];
      return p.ask === 'pt' ? q.answer === M.pt(x, y) : q.answer === (p.ask === 'x' ? x : y);
    },
  });

  A.skill({
    id: 'int1.systems-word-problems', title: 'Systems of equations word problems',
    learn: p(`Many stories hide a system: two kinds of thing, a total <b>count</b>, and a total <b>value</b>. Give each kind a letter. One equation says the counts add to the total; the other says the values add to the total value.`) +
      p(`For 30 tickets, adults at $9 and students at $4, taking in $200: ${V('a')} + ${V('s')} = 30 and 9${V('a')} + 4${V('s')} = 200. Substitute ${V('s')} = 30 − ${V('a')} into the second: 9${V('a')} + 120 − 4${V('a')} = 200, so 5${V('a')} = 80 and ${V('a')} = 16. Always check that the counts and the money both work out.`) +
      example('Example', `${big('22 coins, dimes and quarters, worth $3.70.')}${V('d')} + ${V('q')} = 22 and 10${V('d')} + 25${V('q')} = 370 (in cents). ${V('d')} = 22 − ${V('q')}: 220 − 10${V('q')} + 25${V('q')} = 370, so 15${V('q')} = 150 and ${V('q')} = <b>10</b> quarters.`),
    make(rng) {
      const name = rng.pick(NAMES), kind = rng.pick(['tickets', 'coins', 'items']);
      let n1, n2, p1, p2, text, what1, what2, verb = 'were sold', moneyTxt, unitNote = '';
      if (kind === 'tickets') {
        p1 = rng.int(8, 15); p2 = rng.int(3, 6); n1 = rng.int(8, 60); n2 = rng.int(8, 60); what1 = 'adult tickets'; what2 = 'student tickets';
        moneyTxt = M.money(p1 * n1 + p2 * n2); text = `A school play sold ${n1 + n2} tickets and took in ${moneyTxt}. Adult tickets cost ${M.money(p1)} and student tickets cost ${M.money(p2)}.`;
      } else if (kind === 'coins') {
        [p1, p2, what1, what2] = rng.pick([[25, 10, 'quarters', 'dimes'], [10, 5, 'dimes', 'nickels'], [25, 5, 'quarters', 'nickels']]); n1 = rng.int(3, 30); n2 = rng.int(3, 30); verb = `does ${name} have`;
        moneyTxt = M.money((p1 * n1 + p2 * n2) / 100); text = `${name} has ${n1 + n2} coins, all ${what1} and ${what2}, worth ${moneyTxt} in total.`; unitNote = ' (in cents)';
      } else {
        p1 = rng.int(6, 12); p2 = rng.int(2, 5); n1 = rng.int(5, 40); n2 = rng.int(5, 40); what1 = 'necklaces'; what2 = 'bracelets';
        moneyTxt = M.money(p1 * n1 + p2 * n2); text = `At a craft fair ${name} sold ${n1 + n2} items: necklaces for ${M.money(p1)} and bracelets for ${M.money(p2)}. The sales came to ${moneyTxt}.`;
      }
      const total = n1 + n2, money = p1 * n1 + p2 * n2, askFirst = rng.bool(), ans = askFirst ? n1 : n2, what = askFirst ? what1 : what2;
      return { prompt: `${text} How many ${what} ${verb}?`, type: 'number', answer: ans, params: { p1, p2, total, money, askFirst },
        hints: [`Let ${V('a')} be the number of ${what1} and ${V('b')} the number of ${what2}. Count: ${V('a')} + ${V('b')} = ${total}. Value${unitNote}: ${p1}${V('a')} + ${p2}${V('b')} = ${N(money)}.`,
          `From the count equation, ${V('b')} = ${total} − ${V('a')}. Substitute: ${p1}${V('a')} + ${p2}(${total} − ${V('a')}) = ${N(money)}.`,
          `Simplify: ${p1 - p2}${V('a')} + ${N(p2 * total)} = ${N(money)}, so ${p1 - p2}${V('a')} = ${N(money - p2 * total)} and ${V('a')} = ${n1}${askFirst ? '' : `. Then ${V('b')} = ${total} − ${n1} = ${n2}`}.`,
          `<b>${ans}</b> ${what}.`] };
    },
    verify(q) {
      const { p1, p2, total, money, askFirst } = q.params, hits = [];
      for (let a = 0; a <= total; a++) if (p1 * a + p2 * (total - a) === money) hits.push(a);     // try every possible count
      return hits.length === 1 && q.answer === (askFirst ? hits[0] : total - hits[0]);
    },
  });

  /* ---------- Unit 5: Exponential functions and geometric sequences ---------- */
  A.skill({
    id: 'int1.geometric-sequences', title: 'Geometric sequences',
    learn: p(`A <b>geometric sequence</b> multiplies by the same number each time: 3, 6, 12, 24, … doubles. That number is the <b>common ratio ${V('r')}</b>, and you find it by dividing any term by the one before it. The ratio can be negative (the signs alternate) or a fraction (the terms shrink).`) +
      p(`To reach the ${V('n')}th term you multiply by ${V('r')} a total of ${V('n')} − 1 times: <b>${V('t')}(${V('n')}) = ${V('t')}(1) · ${M.sup(V('r'), `${V('n')} − 1`)}</b>. Compare with an arithmetic sequence, which adds ${V('n')} − 1 times.`) +
      example('Example', `${big('2, 6, 18, 54, … What is the 7th term?')}${V('r')} = 6 ÷ 2 = 3. ${V('t')}(7) = 2 · 3⁶ = 2 · 729 = <b>1458</b>.`),
    make(rng) {
      const kind = rng.pick(['next', 'nth', 'nth', 'ratio']), r = rng.pick([2, 3, 4, 5, -2, -3, 0.5, 0.5]);
      const a = r === 0.5 ? 128 * rng.int(1, 8) : rng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]);
      const terms = [a]; for (let i = 1; i < 8; i++) terms.push(terms[i - 1] * r);
      const rTxt = r === 0.5 ? F(1, 2) : wrap(r), shown = k => `${terms.slice(0, k).map(N).join(', ')}, …`;
      const ratioHint = `Divide any term by the one before it: ${N(terms[1])} ÷ ${wrap(terms[0])} = ${rTxt}. That is the common ratio.`;
      if (kind === 'ratio') return { prompt: `What is the common ratio of the geometric sequence ${shown(4)}`, type: 'number', answer: r, answerText: r === 0.5 ? '1/2' : N(r), params: { kind, t0: terms[0], t1: terms[1], n: 2 },
        hints: [`The common ratio is what each term is multiplied by to get the next one. Divide a term by the one before it.`, `${N(terms[1])} ÷ ${wrap(terms[0])} = <b>${rTxt}</b>${r === 0.5 ? ' (0.5)' : ''}. Check: ${N(terms[2])} ÷ ${wrap(terms[1])} gives the same.`] };
      if (kind === 'next') return { prompt: `A geometric sequence begins ${shown(4)} What is the next term?`, type: 'number', answer: terms[4], params: { kind, t0: terms[0], t1: terms[1], n: 5 },
        hints: [ratioHint, `Multiply the last term by the ratio: ${N(terms[3])} × ${rTxt} = <b>${N(terms[4])}</b>.`] };
      const n = rng.int(5, 8);
      return { prompt: `A geometric sequence begins ${shown(3)} What is the ${M.ordinal(n)} term?`, type: 'number', answer: terms[n - 1], params: { kind, t0: terms[0], t1: terms[1], n },
        hints: [ratioHint, `The ${M.ordinal(n)} term is the first term times the ratio ${n - 1} times: ${N(a)} × ${M.sup(r === 0.5 ? `(${rTxt})` : rTxt, n - 1)}.`, `${M.sup(r === 0.5 ? `(${rTxt})` : rTxt, n - 1)} = ${N(Math.pow(r, n - 1))}, so the term is ${N(a)} × ${N(Math.pow(r, n - 1))} = <b>${N(terms[n - 1])}</b>.`] };
    },
    verify(q) { const { kind, t0, t1, n } = q.params, r = t1 / t0; return kind === 'ratio' ? Math.abs(q.answer - r) < 1e-9 : Math.abs(q.answer - t0 * Math.pow(r, n - 1)) < 1e-6; },   // a power instead of the generator's repeated multiplication
  });

  A.skill({
    id: 'int1.exponential-growth-decay', title: 'Exponential growth and decay',
    learn: p(`An <b>exponential function</b> has the form <b>${Y} = ${V('a')} · ${M.sup(V('b'), X)}</b>: a starting amount ${V('a')} multiplied by the same factor ${V('b')} for every step of ${X}. If ${V('b')} &gt; 1 the amount grows; if 0 &lt; ${V('b')} &lt; 1 it decays. To evaluate it, work out the power first, then multiply by ${V('a')}.`) +
      p(`A percent change each period gives the multiplier: <b>growing by ${V('p')}% means ${V('b')} = 1 + ${V('p')}/100</b>, and <b>shrinking by ${V('p')}% means ${V('b')} = 1 − ${V('p')}/100</b>. 4% growth is ×1.04 each year; 15% decay is ×0.85. After ${V('n')} periods the amount is ${V('a')} · ${M.sup(V('b'), V('n'))}.`) +
      example('Example', `${big('A $500 deposit earns 3% interest a year. How much after 4 years?')}Multiplier 1.03. 500 · 1.03⁴ = 500 · 1.1255… = <b>$562.75</b>.`),
    make(rng) {
      const kind = rng.pick(['evaluate', 'multiplier', 'value', 'value']), name = rng.pick(NAMES);
      if (kind === 'evaluate') {
        const b = rng.pick([2, 3, 4, 0.5, 1.5]), x = rng.int(1, b === 1.5 ? 3 : 4);
        const a = b === 0.5 ? rng.pick([16, 32, 48, 64, 80]) : b === 1.5 ? rng.pick([8, 16, 24, 40]) : rng.int(2, 9);
        const ans = M.round(a * Math.pow(b, x), 6), bTxt = b === 0.5 ? `(${F(1, 2)})` : N(b), pw = M.round(Math.pow(b, x), 6);
        return { prompt: `${big(expRule(a, bTxt))}Find ${Y} when ${X} = ${x}.`, type: 'number', answer: ans, params: { kind, a, b, x }, tolerance: 0.001,
          hints: [`Substitute ${x} for ${X}: ${N(a)} · ${M.sup(bTxt, x)}. Work out the power first.`, `${M.sup(bTxt, x)} = ${N(pw)}, so ${Y} = ${N(a)} × ${N(pw)}.`, `${Y} = <b>${N(ans)}</b>.`] };
      }
      const C = [
        { grow: true, money: false, noun: 'population', period: 'year', P: rng.int(20, 90) * 100, text: (P, pc) => `A town has ${N(P)} people, and its population grows by ${pc}% each year.` },
        { grow: false, money: true, noun: 'value of the car', period: 'year', P: rng.int(12, 40) * 500, text: (P, pc) => `${name} buys a car for ${M.money(P)}. It loses ${pc}% of its value each year.` },
        { grow: true, money: true, noun: 'balance', period: 'year', P: rng.int(2, 20) * 100, text: (P, pc) => `${name} puts ${M.money(P)} in an account that earns ${pc}% interest each year.` },
        { grow: true, money: false, noun: 'number of cells', period: 'hour', P: rng.int(2, 9) * 100, text: (P, pc) => `A bacteria culture starts with ${N(P)} cells, and the number grows by ${pc}% each hour.` },
        { grow: false, money: false, noun: 'number of fish', period: 'year', P: rng.int(10, 60) * 100, text: (P, pc) => `A lake holds ${N(P)} fish, and the number falls by ${pc}% each year.` },
      ];
      const ctx = rng.pick(C), pc = rng.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25]), mult = M.round((100 + (ctx.grow ? pc : -pc)) / 100, 4), P = ctx.P;
      const pctLine = `${ctx.grow ? 'Growing' : 'Shrinking'} by ${pc}% means the new amount is ${100 + (ctx.grow ? pc : -pc)}% of the old one, so each ${ctx.period} the ${ctx.noun} is multiplied by ${N(mult)}.`;
      if (kind === 'multiplier') return { prompt: `${ctx.text(P, pc)} By what number is the ${ctx.noun} multiplied each ${ctx.period}?`, type: 'number', answer: mult, params: { kind, pc, grow: ctx.grow }, tolerance: 0.001,
        hints: [pctLine, `${100 + (ctx.grow ? pc : -pc)}% = ${N(mult)}, so the multiplier is <b>${N(mult)}</b>.`] };
      const n = rng.int(2, 6), raw = P * Math.pow(mult, n), ans = ctx.money ? M.round(raw, 2) : Math.round(raw);
      return { prompt: `${ctx.text(P, pc)} What will the ${ctx.noun} be after ${n} ${ctx.period}s? Round to the nearest ${ctx.money ? 'cent' : 'whole number'}.`, type: 'number', answer: ans, unit: ctx.money ? '$' : undefined, params: { kind, P, mult, n, money: ctx.money }, tolerance: ctx.money ? 0.01 : 0.5,
        hints: [pctLine, `After ${n} ${ctx.period}s the ${ctx.noun} is ${N(P)} × ${M.sup(N(mult), n)}.`, `${M.sup(N(mult), n)} ≈ ${N(M.round(Math.pow(mult, n), 4))}, so the ${ctx.noun} is about <b>${ctx.money ? M.money(ans) : N(ans)}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'evaluate') { let v = p.a; for (let i = 0; i < p.x; i++) v *= p.b; return Math.abs(v - q.answer) < 1e-6; }      // repeated multiplication instead of a power
      if (p.kind === 'multiplier') return Math.abs(q.answer - (p.grow ? 1 + p.pc / 100 : 1 - p.pc / 100)) < 1e-9;
      let v = p.P; for (let i = 0; i < p.n; i++) v *= p.mult;
      return Math.abs(v - q.answer) <= (p.money ? 0.005 : 0.5) + 1e-9;
    },
  });

  A.skill({
    id: 'int1.exponential-from-table', title: 'Writing exponential functions from tables',
    learn: p(`A table shows an exponential function when the ${Y}-values are multiplied by the same factor for each step of 1 in ${X}: 2, 6, 18, 54 is ×3 each time. (A linear table <i>adds</i> the same amount each step instead.)`) +
      p(`To write the rule <b>${Y} = ${V('a')} · ${M.sup(V('b'), X)}</b>: the starting value ${V('a')} is the ${Y}-value when ${X} = 0, and the factor ${V('b')} is any ${Y}-value divided by the one before it. A factor less than 1, like ${F(1, 2)}, means the values are shrinking.`) +
      example('Example', `${M.table([X, Y], [[0, 5], [1, 10], [2, 20], [3, 40]], { compact: true })}At ${X} = 0, ${Y} = 5, so ${V('a')} = 5. Each step doubles: ${V('b')} = 2. The rule is <b>${Y} = 5 · ${M.sup(2, X)}</b>.`),
    make(rng) {
      const decay = rng.chance(0.3), b = decay ? 0.5 : rng.pick([2, 3, 4, 5]);
      let a = decay ? rng.pick([8, 16, 24, 32, 40, 48, 64, 80]) : rng.int(2, 9); if (a === b) a = b + 1;
      const xs = [0, 1, 2, 3], ys = xs.map(x => a * Math.pow(b, x)), bTxt = b === 0.5 ? `(${F(1, 2)})` : N(b);
      const answer = expRule(a, bTxt);
      const choices = [answer].concat(distinct(answer, [expRule(b === 0.5 ? F(1, 2) : N(b), N(a)), `${Y} = ${M.poly([ys[1] - ys[0], a])}`, expRule(ys[1], bTxt), expRule(a, N(b === 0.5 ? 2 : b + 1))], 3));
      return { prompt: `The table shows an exponential function. Which equation gives ${Y} in terms of ${X}?${M.table([X, Y], xs.map((x, i) => [N(x), N(ys[i])]))}`, type: 'choice', choices, answer, params: { a, b, ys },
        hints: [`The value at ${X} = 0 is the starting amount ${V('a')}: here ${V('a')} = ${N(a)}.`,
          `Each step in ${X} multiplies ${Y} by the same factor: ${N(ys[1])} ÷ ${N(ys[0])} = ${N(b)}${b === 0.5 ? ' (one half)' : ''}, so ${V('b')} = ${bTxt}.`,
          `<b>${answer}</b>. Check: at ${X} = 2, ${N(a)} · ${M.sup(bTxt, 2)} = ${N(ys[2])}.`] };
    },
    verify(q) {
      const { a, b, ys } = q.params; let v = a;
      for (let i = 0; i < ys.length; i++) { if (ys[i] !== v) return false; v *= b; }     // the rule reproduces every row
      return q.answer === expRule(a, b === 0.5 ? `(${F(1, 2)})` : N(b));
    },
  });

  /* ---------- Unit 6: Statistics ---------- */
  A.skill({
    id: 'int1.center-and-spread', title: 'Mean, median, quartiles, and IQR',
    learn: p(`Two numbers describe the <b>center</b> of a data set. The <b>mean</b> is the total divided by how many values there are. The <b>median</b> is the middle value once the data are in order; with an even number of values it is the average of the two middle ones. The median is the better summary when there is an outlier.`) +
      p(`<b>Spread</b>: the <b>range</b> is largest − smallest. For the quartiles, split the ordered list into a lower half and an upper half (leave out the middle value when there is an odd number). <b>Q1 is the median of the lower half, Q3 is the median of the upper half</b>, and the <b>interquartile range IQR = Q3 − Q1</b> is the spread of the middle 50% of the data. Minimum, Q1, median, Q3 and maximum make the five-number summary of a box plot.`) +
      example('Example', `${big('4, 9, 7, 12, 5, 8, 15')}In order: 4, 5, 7, 8, 9, 12, 15. Median = 8. Lower half 4, 5, 7 gives Q1 = 5; upper half 9, 12, 15 gives Q3 = 12. IQR = 12 − 5 = <b>7</b>. Mean = 60 ÷ 7 ≈ 8.6.`),
    make(rng) {
      const n = rng.pick([6, 7, 8, 9]), ask = rng.pick(['mean', 'median', 'range', 'q1', 'q3', 'iqr', 'iqr']);
      const data = Array.from({ length: n }, () => rng.int(2, 30));
      if (ask === 'mean') data[n - 1] += (n - sum(data) % n) % n;                     // a whole-number mean
      const s = sorted(data), med = h => h.length % 2 ? h[(h.length - 1) / 2] : (h[h.length / 2 - 1] + h[h.length / 2]) / 2;
      const lower = s.slice(0, Math.floor(n / 2)), upper = s.slice(Math.ceil(n / 2)), q1 = med(lower), q3 = med(upper);
      const vals = { mean: sum(data) / n, median: med(s), range: s[n - 1] - s[0], q1, q3, iqr: q3 - q1 };
      const label = { mean: 'mean', median: 'median', range: 'range', q1: 'first quartile (Q1)', q3: 'third quartile (Q3)', iqr: 'interquartile range (IQR)' }[ask];
      const ctx = rng.pick([`the numbers of pages ${n} students read last night`, `the quiz scores (out of 30) of ${n} students`, `the daily high temperatures in °C over ${n} days`, `the numbers of minutes ${n} friends spent on homework`]);
      const hints = [`Put the data in order: ${s.map(N).join(', ')}.`];
      if (ask === 'mean') hints.push(`Add the values: ${sum(data)}. Divide by the number of values: ${sum(data)} ÷ ${n}.`);
      else if (ask === 'median') hints.push(n % 2 ? `There are ${n} values, so the median is the middle one: the ${M.ordinal((n + 1) / 2)} value in the ordered list.` : `There are ${n} values, so the median is the average of the two middle ones: (${N(s[n / 2 - 1])} + ${N(s[n / 2])}) ÷ 2.`);
      else if (ask === 'range') hints.push(`Range = largest − smallest = ${N(s[n - 1])} − ${N(s[0])}.`);
      else hints.push(`Split the ordered list into halves${n % 2 ? ' (leave out the middle value)' : ''}: lower ${lower.map(N).join(', ')} and upper ${upper.map(N).join(', ')}. Q1 is the median of the lower half (${N(q1)}) and Q3 the median of the upper half (${N(q3)}).`);
      if (ask === 'iqr') hints.push(`IQR = Q3 − Q1 = ${N(q3)} − ${N(q1)}.`);
      hints.push(`The ${label} is <b>${N(vals[ask])}</b>.`);
      return { prompt: `Here are ${ctx}:${big(data.map(N).join(', '))}Find the ${label}.`, type: 'number', answer: vals[ask], params: { ask, data }, hints };
    },
    verify(q) {
      const { ask, data } = q.params, n = data.length, s = sorted(data), ans = q.answer;
      const isMedian = (arr, v) => arr.filter(x => x <= v).length * 2 >= arr.length && arr.filter(x => x >= v).length * 2 >= arr.length && (arr.length % 2 ? arr.includes(v) : 2 * v === arr[arr.length / 2 - 1] + arr[arr.length / 2]);   // counting, not slicing
      if (ask === 'mean') return sum(data) === ans * n;
      if (ask === 'median') return isMedian(s, ans);
      if (ask === 'range') return ans === Math.max(...data) - Math.min(...data);
      const lo = s.slice(0, n >> 1), hi = s.slice((n + 1) >> 1);
      if (ask === 'q1') return isMedian(lo, ans);
      if (ask === 'q3') return isMedian(hi, ans);
      let q1 = null, q3 = null;
      for (let v = 0; v <= 60; v += 0.5) { if (isMedian(lo, v)) q1 = v; if (isMedian(hi, v)) q3 = v; }
      return q1 != null && q3 != null && ans === q3 - q1;
    },
  });

  /* pairs of variables for int1.scatter-association */
  const PAIRS = [
    { k: 'positive', text: 'A child\'s age and the child\'s height', why: 'older children tend to be taller' },
    { k: 'positive', text: 'Hours spent studying and score on a test', why: 'more study tends to go with higher scores' },
    { k: 'positive', text: 'Size of a house and its heating bill', why: 'bigger houses cost more to heat' },
    { k: 'positive', text: 'Number of people at a picnic and sandwiches eaten', why: 'more people eat more sandwiches' },
    { k: 'negative', text: 'Outside temperature and sales of hot soup', why: 'the warmer it is, the less soup sells' },
    { k: 'negative', text: 'Age of a used car and its selling price', why: 'older cars sell for less' },
    { k: 'negative', text: 'Driving speed and the time a 100 km trip takes', why: 'faster driving means a shorter trip' },
    { k: 'negative', text: 'Altitude on a mountain hike and the air temperature', why: 'the air gets colder the higher you climb' },
    { k: 'none', text: 'Shoe size and score on a history test', why: 'foot size says nothing about history marks' },
    { k: 'none', text: 'Length of a person\'s first name and their height', why: 'a name has nothing to do with height' },
    { k: 'none', text: 'Day of the month someone was born and the number of pets they own', why: 'a birthday tells you nothing about pets' },
    { k: 'none', text: 'Last digit of a phone number and monthly rent', why: 'a phone digit is unrelated to rent' },
  ];

  A.skill({
    id: 'int1.scatter-association', title: 'Describing associations in scatter plots',
    learn: p(`A <b>scatter plot</b> puts one variable on each axis and a dot for each data pair. Describe what you see in two parts. <b>Direction:</b> a <b>positive</b> association means the dots rise from left to right (as one variable grows, so does the other); a <b>negative</b> association means they fall. If the dots are a shapeless cloud there is <b>no association</b>.`) +
      p(`<b>Strength:</b> the association is <b>strong</b> when the dots hug a line closely, and <b>weak</b> when they follow a trend only loosely. An association is not the same as a cause: ice-cream sales and sunburns rise together because of the sunshine, not because of each other.`) +
      example('Example', `${big('Hours of sleep vs. mistakes on a test')}The dots fall from upper left to lower right and sit close to a line: a <b>strong negative association</b>. More sleep goes with fewer mistakes.`),
    make(rng) {
      if (rng.chance(0.6)) {
        const dir = rng.pick(['positive', 'negative', 'none']), strong = rng.bool();
        const ctx = rng.pick([['hours spent practising', 'scores on a music exam'], ['outside temperature', 'cups of hot chocolate sold'], ['age of a used car', 'its selling price'], ['hours of sleep', 'number of mistakes on a test'], ['shoe size', 'score on a spelling test'], ['daily hours of sunshine', 'ice creams sold'], ['distance from the city centre', 'monthly rent of an apartment']]);
        const shape = dir === 'none' ? 'The dots are scattered all over the plot with no pattern.' : `The dots ${dir === 'positive' ? 'rise from the lower left to the upper right' : 'fall from the upper left to the lower right'}, ${strong ? 'tightly clustered around a line' : 'loosely scattered but with a clear trend'}.`;
        const choices = ['Strong positive association', 'Weak positive association', 'Strong negative association', 'Weak negative association', 'No association'];
        const answer = dir === 'none' ? choices[4] : `${strong ? 'Strong' : 'Weak'} ${dir} association`;
        return { prompt: `A scatter plot shows ${ctx[0]} on the horizontal axis and ${ctx[1]} on the vertical axis. ${shape} Which best describes the association?`, type: 'choice', choices, answer, keepOrder: true, params: { kind: 'describe', dir, strong },
          hints: [`Direction first: do the dots go up from left to right (positive), go down (negative), or show no trend at all?`, `Then strength: dots close to a line mean a strong association; a loose cloud with a trend is weak.`, `<b>${answer}</b>.`] };
      }
      const want = rng.pick(['positive', 'negative', 'none']);
      const right = rng.pick(PAIRS.filter(x => x.k === want)), others = rng.sample(PAIRS.filter(x => x.k !== want), 3);
      const choices = [right.text].concat(others.map(x => x.text));
      return { prompt: want === 'none' ? 'Which pair of variables would most likely show no association?' : `Which pair of variables would most likely show a ${want} association?`, type: 'choice', choices, answer: right.text, params: { kind: 'pairs', want, idx: PAIRS.indexOf(right) },
        hints: [`Positive: as one variable goes up, the other tends to go up. Negative: as one goes up, the other tends to go down. No association: knowing one tells you nothing about the other.`, `<b>${right.text}</b>: ${right.why}.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'pairs') return PAIRS[p.idx].k === p.want && q.answer === PAIRS[p.idx].text;
      return p.dir === 'none' ? q.answer === 'No association' : q.answer.startsWith(p.strong ? 'Strong' : 'Weak') && q.answer.includes(p.dir);
    },
  });

  /* ---------- Unit 7: Transformations and congruence ---------- */
  const MOVES = {
    'rot90': { name: 'a rotation of 90° counterclockwise about the origin', rule: `(${X}, ${Y}) → (−${Y}, ${X})`, f: (x, y) => [-y, x] },
    'rot180': { name: 'a rotation of 180° about the origin', rule: `(${X}, ${Y}) → (−${X}, −${Y})`, f: (x, y) => [-x, -y] },
    'rot270': { name: 'a rotation of 90° clockwise about the origin', rule: `(${X}, ${Y}) → (${Y}, −${X})`, f: (x, y) => [y, -x] },
    'refx': { name: `a reflection across the ${X}-axis`, rule: `(${X}, ${Y}) → (${X}, −${Y})`, f: (x, y) => [x, -y] },
    'refy': { name: `a reflection across the ${Y}-axis`, rule: `(${X}, ${Y}) → (−${X}, ${Y})`, f: (x, y) => [-x, y] },
    'refyx': { name: `a reflection across the line ${Y} = ${X}`, rule: `(${X}, ${Y}) → (${Y}, ${X})`, f: (x, y) => [y, x] },
  };

  A.skill({
    id: 'int1.transformations', title: 'Translations, reflections, and rotations',
    learn: p(`A <b>rigid transformation</b> moves a figure without changing its size or shape. Each one has a coordinate rule. A <b>translation</b> slides every point the same amount: “3 right and 2 down” is (${X}, ${Y}) → (${X} + 3, ${Y} − 2).`) +
      p(`<b>Reflections:</b> across the ${X}-axis, (${X}, ${Y}) → (${X}, −${Y}); across the ${Y}-axis, (${X}, ${Y}) → (−${X}, ${Y}); across ${Y} = ${X}, swap the coordinates. <b>Rotations about the origin:</b> 90° counterclockwise, (${X}, ${Y}) → (−${Y}, ${X}); 180°, (${X}, ${Y}) → (−${X}, −${Y}); 90° clockwise, (${X}, ${Y}) → (${Y}, −${X}).`) +
      example('Example', `${big('Rotate (4, −1) by 90° counterclockwise about the origin.')}Use (${X}, ${Y}) → (−${Y}, ${X}): (−(−1), 4) = <b>(1, 4)</b>.`),
    make(rng) {
      const x = rng.nz(-7, 7); let y = rng.nz(-7, 7); if (Math.abs(y) === Math.abs(x)) y = y > 0 ? y + 1 : y - 1;
      if (rng.chance(0.3)) {
        const dx = rng.nz(-6, 6), dy = rng.nz(-6, 6), ans = [x + dx, y + dy];
        const desc = `${Math.abs(dx)} unit${Math.abs(dx) === 1 ? '' : 's'} ${dx > 0 ? 'right' : 'left'} and ${Math.abs(dy)} unit${Math.abs(dy) === 1 ? '' : 's'} ${dy > 0 ? 'up' : 'down'}`;
        const answer = M.pt(...ans), choices = [answer].concat(distinct(answer, [M.pt(x - dx, y - dy), M.pt(x + dy, y + dx), M.pt(x + dx, y - dy), M.pt(x - dx, y + dy)], 3));
        return { prompt: `Point ${V('P')}${M.pt(x, y)} is translated ${desc}. What are the coordinates of its image ${V('P')}′?`, type: 'choice', choices, answer, params: { kind: 'trans', x, y, dx, dy },
          hints: [`A translation adds to each coordinate: right/left changes ${X}, up/down changes ${Y}. The rule is (${X}, ${Y}) → (${X} ${M.signed(dx)}, ${Y} ${M.signed(dy)}).`, `${N(x)} ${M.signed(dx)} = ${N(ans[0])} and ${N(y)} ${M.signed(dy)} = ${N(ans[1])}.`, `${V('P')}′ = <b>${answer}</b>.`] };
      }
      const key = rng.pick(Object.keys(MOVES)), mv = MOVES[key], ans = mv.f(x, y), answer = M.pt(...ans);
      const cands = Object.keys(MOVES).filter(k => k !== key).map(k => M.pt(...MOVES[k].f(x, y)));
      const choices = [answer].concat(distinct(answer, rng.shuffle(cands).concat([M.pt(x, y)]), 3));
      return { prompt: `Point ${V('P')}${M.pt(x, y)} is transformed by ${mv.name}. What are the coordinates of its image ${V('P')}′?`, type: 'choice', choices, answer, params: { kind: key, x, y },
        hints: [`The rule for ${mv.name} is ${mv.rule}.`, `Apply it to ${M.pt(x, y)}: ${X} = ${N(x)}, ${Y} = ${N(y)}.`, `${V('P')}′ = <b>${answer}</b>.`] };
    },
    verify(q) {
      const p = q.params;
      if (p.kind === 'trans') return q.answer === M.pt(p.x + p.dx, p.y + p.dy);
      // a second route: rotations by the angle with cos/sin, reflections by the mirror line's formula
      const ang = { rot90: Math.PI / 2, rot180: Math.PI, rot270: -Math.PI / 2 }[p.kind];
      let ix, iy;
      if (ang != null) { ix = Math.round(p.x * Math.cos(ang) - p.y * Math.sin(ang)); iy = Math.round(p.x * Math.sin(ang) + p.y * Math.cos(ang)); }
      else { const t = { refx: 0, refy: Math.PI / 2, refyx: Math.PI / 4 }[p.kind]; ix = Math.round(p.x * Math.cos(2 * t) + p.y * Math.sin(2 * t)); iy = Math.round(p.x * Math.sin(2 * t) - p.y * Math.cos(2 * t)); }
      return q.answer === M.pt(ix || 0, iy || 0);
    },
  });

  A.skill({
    id: 'int1.congruence-criteria', title: 'Triangle congruence criteria',
    learn: p(`Two triangles are <b>congruent</b> when one can be moved onto the other by rigid transformations, so all matching sides and angles are equal. You do not need all six facts; any of these is enough: <b>SSS</b> (three pairs of sides), <b>SAS</b> (two sides and the angle <i>between</i> them), <b>ASA</b> (two angles and the side <i>between</i> them), <b>AAS</b> (two angles and a side that is <i>not</i> between them).`) +
      p(`Order matters: in SAS the angle must be the one formed by the two sides, and in ASA the side must join the two angles. SSA and AAA do <b>not</b> prove congruence: AAA triangles can be different sizes.`) +
      example('Example', `In △ABC and △DEF, AB = DE, ∠A = ∠D and ∠B = ∠E. Side AB joins angles A and B, so this is <b>ASA</b>.`),
    make(rng) {
      const crit = rng.pick(['SSS', 'SAS', 'ASA', 'AAS']), [P, Q, R] = rng.pick([['A', 'B', 'C'], ['J', 'K', 'L'], ['P', 'Q', 'R']]), [S, T, U] = rng.pick([['D', 'E', 'F'], ['X', 'Y', 'Z'], ['S', 'T', 'U']]);
      const rot = rng.int(0, 2), a = [P, Q, R].map((_, i) => [P, Q, R][(i + rot) % 3]), b = [S, T, U].map((_, i) => [S, T, U][(i + rot) % 3]);
      const side = (i, j) => `${a[i]}${a[j]} = ${b[i]}${b[j]}`, ang = i => `∠${a[i]} = ∠${b[i]}`;
      const facts = { SSS: [side(0, 1), side(1, 2), side(2, 0)], SAS: [side(0, 1), ang(1), side(1, 2)], ASA: [ang(0), side(0, 1), ang(1)], AAS: [ang(0), ang(1), side(1, 2)] }[crit];
      const why = { SSS: 'all three pairs of sides are equal', SAS: `the angle ∠${a[1]} is between sides ${a[0]}${a[1]} and ${a[1]}${a[2]}`, ASA: `side ${a[0]}${a[1]} joins the two angles ∠${a[0]} and ∠${a[1]}`, AAS: `side ${a[1]}${a[2]} is next to ∠${a[1]} but not between the two angles` }[crit];
      return { prompt: `In △${P}${Q}${R} and △${S}${T}${U}, ${M.list(rng.shuffle(facts))}. Which criterion shows the triangles are congruent?`, type: 'choice', choices: ['SSS', 'SAS', 'ASA', 'AAS'], keepOrder: true, answer: crit, params: { facts },
        hints: [`Count the given facts: how many are sides and how many are angles?`, `Then check where they sit: ${why}.`, `<b>${crit}</b>.`] };
    },
    verify(q) {
      const f = q.params.facts, sides = f.filter(s => !s.startsWith('∠')).map(s => s.slice(0, 2)), angs = f.filter(s => s.startsWith('∠')).map(s => s[1]);
      let c;
      if (sides.length === 3) c = 'SSS';
      else if (sides.length === 2) c = sides[0].split('').some(v => sides[1].includes(v) && v === angs[0]) ? 'SAS' : 'SSA';
      else c = sides[0].includes(angs[0]) && sides[0].includes(angs[1]) ? 'ASA' : 'AAS';
      return q.answer === c;
    },
  });
})();
