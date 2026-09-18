/* grades.js — practice problems by school grade, generated on the device.
   No network, no API key: pick a grade, get a worksheet. Same problem shape as im1.js, so
   IM1.renderWorksheet() can print these too.
     GRADES.LEVELS            -> [{ id, name, sub, topics: [{ id, name, description }] }]
     GRADES.generate(opts)    -> { grade, seed, difficulty, topics, problems: [...] }
     GRADES.checkAnswer(p, s) -> boolean
   Every generator must produce an exact, checkable answer: no "about", no rounding surprises. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GRADES = factory();
})(this, function () {
  'use strict';
  var MINUS = '−';

  /* ---------------- helpers ---------------- */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function ri(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }          // inclusive
  function rnz(r, lo, hi) { var v = 0; while (v === 0) v = ri(r, lo, hi); return v; }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function shuffle(r, arr) { var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function num(n) { return n < 0 ? MINUS + Math.abs(n) : String(n); }              // proper minus sign
  function money(n) { return '$' + n.toFixed(2); }
  function sup(x) { return '<sup>' + x + '</sup>'; }
  function frac(n, d) {                                                            // reduced a/b, or a whole number
    var s = (n < 0) !== (d < 0) ? -1 : 1; n = Math.abs(n); d = Math.abs(d);
    var g = gcd(n, d); n /= g; d /= g;
    return d === 1 ? num(s * n) : (s < 0 ? MINUS : '') + n + '/' + d;
  }
  function coef(a) { return a === 1 ? '' : a === -1 ? MINUS : num(a); }   // 1x prints as x
  function term(a, v) { return coef(a) + v; }
  function plus(n) { return n < 0 ? ' ' + MINUS + ' ' + Math.abs(n) : ' + ' + n; }
  /* " + 3x", " − x": a coefficient of one is written by leaving it out, never as "1x" */
  function plusTerm(n, v) { return !n ? '' : (n < 0 ? ' ' + MINUS + ' ' : ' + ') + (Math.abs(n) === 1 ? '' : Math.abs(n)) + v; }
  function tidy(n) { return Math.round(n * 1e6) / 1e6; }              // 28.000000000000004 -> 28
  function properFrac(r, maxDen) {                                   // n/d with n < d and gcd(n, d) = 1
    var d, n, guard = 0;
    do { d = ri(r, 2, maxDen || 12); n = ri(r, 1, d - 1); guard++; } while (gcd(n, d) !== 1 && guard < 40);
    return [n, d];
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function P(question, answer, accept, work) {
    return { question: question, answer: answer, accept: accept || [], work: work || '' };
  }
  function commas(v) { return String(Math.abs(Math.round(v))).replace(/\B(?=(\d{3})+(?!\d))/g, ',').replace(/^/, v < 0 ? MINUS : ''); }
  function ordinal(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function clock(mins) { var h = Math.floor(mins / 60) % 12 || 12, m = mins % 60; return h + ':' + (m < 10 ? '0' + m : m); }
  var NAMES = ['Rohan', 'Maya', 'Arjun', 'Sofia', 'Liam', 'Nina', 'Diego', 'Aisha', 'Noah', 'Leena'];
  var SHOPS = ['the bookshop', 'the bakery', 'the sports shop', 'the music shop', 'the corner store'];

  /* ================================================================ GRADE 6 ================================================================ */
  var G6 = [
    { id: 'integers', name: 'Integers & absolute value', description: 'Adding and subtracting negatives, comparing, absolute value.',
      gen: function (r, d) {
        var k = ri(r, 1, 4);
        if (k === 1) { var a = rnz(r, -20, 20), b = rnz(r, -20, 20);
          return P('Work out: ' + num(a) + ' + ' + (b < 0 ? '(' + num(b) + ')' : num(b)), num(a + b), [], 'Move ' + Math.abs(b) + ' ' + (b < 0 ? 'left' : 'right') + ' from ' + num(a) + '.'); }
        if (k === 2) { var c = rnz(r, -20, 20), e = rnz(r, -20, 20);
          return P('Work out: ' + num(c) + ' ' + MINUS + ' (' + num(e) + ')', num(c - e), [], 'Subtracting ' + num(e) + ' is the same as adding ' + num(-e) + '.'); }
        if (k === 3) { var f = rnz(r, -30, 30);
          return P('What is |' + num(f) + '|?', String(Math.abs(f)), [], 'Absolute value is the distance from 0, so it is never negative.'); }
        var x = rnz(r, -15, 15), y = rnz(r, -15, 15); while (y === x) y = rnz(r, -15, 15);
        return P('Which is greater: ' + num(x) + ' or ' + num(y) + '?', num(Math.max(x, y)), [], 'On a number line the greater number is further right.');
      } },
    { id: 'fractions', name: 'Fractions', description: 'Add, subtract, multiply and divide fractions, and simplify.',
      gen: function (r, d) {
        var k = ri(r, 1, 4);
        var f1 = properFrac(r, 12), f2 = properFrac(r, 12);
        var a = f1[0], b = f1[1], c = f2[0], e = f2[1];
        if (k === 1) return P('Add and simplify: ' + a + '/' + b + ' + ' + c + '/' + e, frac(a * e + c * b, b * e), [],
          'Common denominator ' + (b * e) + ': ' + (a * e) + '/' + (b * e) + ' + ' + (c * b) + '/' + (b * e) + '.');
        if (k === 2) {
          var big = a * e >= c * b ? [a, b, c, e] : [c, e, a, b];          // keep the answer positive
          return P('Subtract and simplify: ' + big[0] + '/' + big[1] + ' ' + MINUS + ' ' + big[2] + '/' + big[3],
            frac(big[0] * big[3] - big[2] * big[1], big[1] * big[3]), [], 'Common denominator ' + (big[1] * big[3]) + '.');
        }
        if (k === 3) return P('Multiply and simplify: ' + a + '/' + b + ' × ' + c + '/' + e, frac(a * c, b * e), [],
          'Multiply across: ' + (a * c) + '/' + (b * e) + ', then simplify.');
        return P('Divide and simplify: ' + a + '/' + b + ' ÷ ' + c + '/' + e, frac(a * e, b * c), [],
          'Multiply by the reciprocal: ' + a + '/' + b + ' × ' + (c === 1 ? String(e) : e + '/' + c) + '.');
      } },
    { id: 'decimals', name: 'Decimals', description: 'Adding, subtracting, multiplying and dividing decimals.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var a = ri(r, 10, 900) / 10, b = ri(r, 10, 900) / 10;
          return P('Work out: ' + a.toFixed(1) + ' + ' + b.toFixed(1), (a + b).toFixed(1), [], 'Line up the decimal points.'); }
        if (k === 2) { var c = ri(r, 11, 99) / 10, e = ri(r, 2, 9);
          return P('Work out: ' + c.toFixed(1) + ' × ' + e, (c * e).toFixed(1), [], String(c * 10) + ' × ' + e + ' = ' + (c * 10 * e) + ', then one decimal place.'); }
        var q = ri(r, 2, 12), div = ri(r, 2, 9);
        return P('Work out: ' + (q * div / 10).toFixed(1) + ' ÷ ' + div, (q / 10).toFixed(1), [], 'Think ' + (q * div) + ' ÷ ' + div + ' = ' + q + ', then one decimal place.');
      } },
    { id: 'ratios', name: 'Ratios & unit rate', description: 'Equivalent ratios, unit rates and simple scaling.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var n = ri(r, 2, 9), cost = n * ri(r, 2, 12);
          return P(pick(r, NAMES) + ' pays ' + money(cost) + ' for ' + plural(n, 'notebook', 'notebooks') + '. What is the cost of one notebook?',
            money(cost / n), [String(cost / n)], money(cost) + ' ÷ ' + n + ' = ' + money(cost / n) + '.'); }
        if (k === 2) { var a = ri(r, 2, 8), b = ri(r, 2, 9), m = ri(r, 2, 6);
          while (b === a) b = ri(r, 2, 9);                    // 3 : 3 teaches nothing
          return P('Fill in the missing number so the ratios are equal: ' + a + ' : ' + b + ' = ' + (a * m) + ' : ___', String(b * m), [],
            a + ' was multiplied by ' + m + ', so multiply ' + b + ' by ' + m + ' too.'); }
        var miles = ri(r, 2, 12), hours = ri(r, 1, 4), want = ri(r, 2, 8);
        while (want === hours) want = ri(r, 2, 8);            // asking for the time you were given is not a question
        return P('A bike travels ' + (miles * hours) + ' miles in ' + plural(hours, 'hour', 'hours') + ' at a steady speed. How far does it travel in ' + plural(want, 'hour', 'hours') + '?',
          String(miles * want) + ' miles', [String(miles * want)], 'Speed is ' + miles + ' miles per hour, so ' + miles + ' × ' + want + '.');
      } },
    { id: 'percents', name: 'Percents', description: 'Percent of a number, and percent / fraction / decimal.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var pc = pick(r, [10, 20, 25, 40, 50, 75]), whole = ri(r, 2, 20) * 20;
          return P('What is ' + pc + '% of ' + whole + '?', String(tidy(whole * pc / 100)), [],
            pc + '% = ' + (pc / 100) + ', and ' + (pc / 100) + ' × ' + whole + ' = ' + (whole * pc / 100) + '.'); }
        if (k === 2) { var dec = pick(r, [0.05, 0.12, 0.3, 0.45, 0.6, 0.85]);
          return P('Write ' + dec + ' as a percent.', tidy(dec * 100) + '%', [String(tidy(dec * 100))], 'Multiply by 100.'); }
        var top = pick(r, [1, 3, 7, 9, 11, 17]), bot = pick(r, [20, 25, 50]);
        return P('Write ' + top + '/' + bot + ' as a percent.', tidy(top / bot * 100) + '%', [String(tidy(top / bot * 100))],
          'Scale the denominator to 100: ' + top + '/' + bot + ' = ' + tidy(top * 100 / bot) + '/100.');
      } },
    { id: 'expressions6', name: 'Expressions & one-step equations', description: 'Evaluate expressions, write them, and solve one-step equations.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var a = ri(r, 2, 9), b = ri(r, 1, 20), x = ri(r, 2, 12);
          return P('Evaluate ' + a + 'n + ' + b + ' when n = ' + x + '.', String(a * x + b), [],
            a + ' × ' + x + ' + ' + b + ' = ' + (a * x + b) + '.'); }
        if (k === 2) { var c = ri(r, 2, 12), sol = ri(r, 2, 15);
          return P('Solve for x:  x + ' + c + ' = ' + (sol + c), 'x = ' + sol, [String(sol)], 'Subtract ' + c + ' from both sides.'); }
        var m = ri(r, 2, 9), s = ri(r, 2, 12);
        return P('Solve for x:  ' + m + 'x = ' + (m * s), 'x = ' + s, [String(s)], 'Divide both sides by ' + m + '.');
      } },
    { id: 'geometry6', name: 'Area, perimeter & volume', description: 'Rectangles, triangles, parallelograms and rectangular prisms.',
      gen: function (r, d) {
        var k = ri(r, 1, 4);
        if (k === 1) { var w = ri(r, 3, 15), h = ri(r, 3, 15);
          return P('A rectangle is ' + w + ' cm by ' + h + ' cm. What is its area?', (w * h) + ' cm' + sup(2), [String(w * h)], 'Area = length × width.'); }
        if (k === 2) { var b = ri(r, 2, 10) * 2, ht = ri(r, 3, 14);
          return P('A triangle has base ' + b + ' cm and height ' + ht + ' cm. What is its area?', (b * ht / 2) + ' cm' + sup(2), [String(b * ht / 2)],
            'Area = ½ × base × height = ½ × ' + b + ' × ' + ht + '.'); }
        if (k === 3) { var pb = ri(r, 3, 12), ph = ri(r, 3, 12);
          return P('A parallelogram has base ' + pb + ' cm and height ' + ph + ' cm. What is its area?', (pb * ph) + ' cm' + sup(2), [String(pb * ph)], 'Area = base × height.'); }
        var l = ri(r, 2, 9), wd = ri(r, 2, 9), hh = ri(r, 2, 9);
        return P('A box is ' + l + ' cm by ' + wd + ' cm by ' + hh + ' cm. What is its volume?', (l * wd * hh) + ' cm' + sup(3), [String(l * wd * hh)],
          'Volume = length × width × height.');
      } },
    { id: 'data6', name: 'Mean, median, mode & range', description: 'Summarising a small set of numbers.',
      gen: function (r, d) {
        var n = pick(r, [5, 5, 7]), set = [], i;
        for (i = 0; i < n; i++) set.push(ri(r, 1, 30));
        var sorted = set.slice().sort(function (a, b) { return a - b; });
        var k = ri(r, 1, 4);
        var list = set.join(', ');
        if (k === 1) {
          var sum = set.reduce(function (a, b) { return a + b; }, 0);
          while (sum % n !== 0) { set[0] += 1; sum = set.reduce(function (a, b) { return a + b; }, 0); }   // keep the mean whole
          list = set.join(', ');
          return P('Find the mean of: ' + list, String(sum / n), [], 'Sum = ' + sum + ', then ÷ ' + n + '.');
        }
        if (k === 2) return P('Find the median of: ' + list, String(sorted[(n - 1) / 2]), [], 'In order: ' + sorted.join(', ') + '. The middle value is ' + sorted[(n - 1) / 2] + '.');
        if (k === 3) return P('Find the range of: ' + list, String(sorted[n - 1] - sorted[0]), [], 'Largest ' + sorted[n - 1] + ' − smallest ' + sorted[0] + '.');
        /* Mode: the topic is named for it, so it has to be asked. Build a set with exactly one value
           repeated, or "the mode" would have more than one right answer. */
        var mode = ri(r, 1, 30), rest = [], used = {};
        used[mode] = 1;
        while (rest.length < n - 2) { var v = ri(r, 1, 30); if (!used[v]) { used[v] = 1; rest.push(v); } }
        var mset = rest.concat([mode, mode]);
        for (i = mset.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = mset[i]; mset[i] = mset[j]; mset[j] = t; }
        return P('Find the mode of: ' + mset.join(', '), String(mode), [],
          mode + ' appears twice and every other number appears once, so it is the mode.');
      } }
  ];

  /* ================================================================ GRADE 7 ================================================================ */
  var G7 = [
    { id: 'rational', name: 'Negative numbers & rationals', description: 'Operations with negative fractions and decimals.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var a = rnz(r, -12, 12), b = rnz(r, -12, 12);
          while (Math.abs(a) === 1) a = rnz(r, -12, 12);
          while (Math.abs(b) === 1) b = rnz(r, -12, 12);
          return P('Work out: ' + num(a) + ' × ' + (b < 0 ? '(' + num(b) + ')' : num(b)), num(a * b), [],
            'Signs the same → positive; signs different → negative.'); }
        if (k === 2) { var q = rnz(r, -12, 12), div = rnz(r, -9, 9);
          while (Math.abs(div) === 1) div = rnz(r, -9, 9);
          return P('Work out: ' + num(q * div) + ' ÷ ' + (div < 0 ? '(' + num(div) + ')' : num(div)), num(q), [], 'Divide, then decide the sign.'); }
        var fa = properFrac(r, 9), fb = properFrac(r, 9);
        var n1 = fa[0], d1 = fa[1], n2 = fb[0], d2 = fb[1];
        return P('Work out and simplify: ' + MINUS + n1 + '/' + d1 + ' + ' + n2 + '/' + d2, frac(-n1 * d2 + n2 * d1, d1 * d2), [],
          'Common denominator ' + (d1 * d2) + '.');
      } },
    { id: 'proportions', name: 'Proportional relationships', description: 'Constant of proportionality, solving proportions, scale.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var kk = ri(r, 2, 9), x = ri(r, 2, 9);
          return P('y is proportional to x, and y = ' + (kk * x) + ' when x = ' + x + '. What is the constant of proportionality k?',
            String(kk), ['k = ' + kk], 'k = y ÷ x = ' + (kk * x) + ' ÷ ' + x + '.'); }
        if (k === 2) { var a = ri(r, 2, 9), b = ri(r, 2, 9), m = ri(r, 2, 8);
          while (b === a) b = ri(r, 2, 9);                    // 5/5 = x/15 is not a proportion question
          return P('Solve the proportion:  ' + a + '/' + b + ' = x/' + (b * m), 'x = ' + (a * m), [String(a * m)],
            b + ' × ' + m + ' = ' + (b * m) + ', so x = ' + a + ' × ' + m + '.'); }
        var scale = pick(r, [2, 3, 4, 5]), real = ri(r, 3, 20);
        return P('A model is built to a scale of 1 : ' + scale + '. If the model is ' + real + ' cm long, how long is the real thing?',
          (real * scale) + ' cm', [String(real * scale)], 'Multiply by the scale factor ' + scale + '.');
      } },
    { id: 'percentapp', name: 'Percent in real life', description: 'Tax, tip, discount, markup, percent change and simple interest.',
      gen: function (r, d) {
        var k = ri(r, 1, 4);
        if (k === 1) { var price = ri(r, 4, 60) * 5, pc = pick(r, [10, 15, 20, 25]);
          return P('A jacket costs ' + money(price) + ' and is ' + pc + '% off. What is the sale price?',
            money(price * (100 - pc) / 100), [String(price * (100 - pc) / 100)],
            pc + '% of ' + money(price) + ' is ' + money(price * pc / 100) + ', so ' + money(price) + ' − ' + money(price * pc / 100) + '.'); }
        if (k === 2) { var bill = ri(r, 4, 30) * 5, tip = pick(r, [10, 15, 20]);
          return P('A meal costs ' + money(bill) + '. With a ' + tip + '% tip, what is the total?',
            money(bill * (100 + tip) / 100), [String(bill * (100 + tip) / 100)], 'Tip = ' + money(bill * tip / 100) + '.'); }
        if (k === 3) { var was = ri(r, 2, 20) * 10, now = was + was * pick(r, [10, 20, 25, 50]) / 100;
          return P('A price rises from ' + money(was) + ' to ' + money(now) + '. What is the percent increase?',
            Math.round((now - was) / was * 100) + '%', [String(Math.round((now - was) / was * 100))],
            'Change ' + money(now - was) + ' ÷ ' + money(was) + ' × 100.'); }
        var pr = ri(r, 2, 20) * 100, rate = pick(r, [2, 3, 4, 5]), yrs = ri(r, 1, 5);
        return P(pick(r, NAMES) + ' puts ' + money(pr) + ' in an account paying ' + rate + '% simple interest a year. How much interest after ' + plural(yrs, 'year', 'years') + '?',
          money(pr * rate / 100 * yrs), [String(pr * rate / 100 * yrs)], 'I = P × r × t = ' + pr + ' × 0.0' + rate + ' × ' + yrs + '.');
      } },
    { id: 'equations7', name: 'Two-step equations', description: 'Solve two-step equations, including negatives and fractions.',
      gen: function (r, d) {
        var a = rnz(r, -9, 9), x = rnz(r, -12, 12), b = rnz(r, -20, 20);
        while (Math.abs(a) === 1) a = rnz(r, -9, 9);
        if (d === 1) { a = ri(r, 2, 9); x = ri(r, 2, 12); b = ri(r, 1, 20); }
        var rhs = a * x + b;
        var lhs = term(a, 'x') + plus(b);
        if (d >= 3 && r() < 0.4) {
          var den = pick(r, [2, 3, 4]), xx = den * rnz(r, 1, 6), cc = rnz(r, -10, 10);
          return P('Solve for x:  x/' + den + plus(cc) + ' = ' + num(xx / den + cc), 'x = ' + num(xx), [num(xx)],
            'Subtract ' + num(cc) + ', then multiply both sides by ' + den + '.');
        }
        return P('Solve for x:  ' + lhs + ' = ' + num(rhs), 'x = ' + num(x), [num(x)],
          (b < 0 ? 'Add ' + Math.abs(b) + ' to' : 'Subtract ' + b + ' from') + ' both sides, then divide by ' + num(a) + '.');
      } },
    { id: 'inequalities7', name: 'Inequalities', description: 'Solve and interpret two-step inequalities.',
      gen: function (r, d) {
        var a = rnz(r, -8, 8), x = rnz(r, -10, 10), b = rnz(r, -15, 15);
        while (Math.abs(a) === 1) a = rnz(r, -8, 8);
        if (d === 1) a = ri(r, 2, 8);
        var rel = pick(r, ['&gt;', '&lt;', '≥', '≤']);
        var flipped = { '&gt;': '&lt;', '&lt;': '&gt;', '≥': '≤', '≤': '≥' };
        var out = a < 0 ? flipped[rel] : rel;
        var plain = { '&gt;': '>', '&lt;': '<', '≥': '>=', '≤': '<=' };
        return P('Solve:  ' + term(a, 'x') + plus(b) + ' ' + rel + ' ' + num(a * x + b),
          'x ' + out + ' ' + num(x), ['x' + plain[out] + num(x).replace(MINUS, '-')],
          a < 0 ? 'Dividing by a negative flips the sign.' : 'Undo the ' + (b < 0 ? 'subtraction' : 'addition') + ', then divide by ' + a + '.');
      } },
    { id: 'expressions7', name: 'Expressions', description: 'Distribute, combine like terms and factor.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var a = rnz(r, -9, 9), b = rnz(r, -9, 9);
          while (Math.abs(a) === 1) a = rnz(r, -9, 9);
          var t2 = a * b;
          return P('Expand: ' + num(a) + '(x' + plus(b) + ')', term(a, 'x') + plus(t2),
            [], 'Multiply both terms inside by ' + num(a) + '.'); }
        if (k === 2) { var p = rnz(r, -9, 9), q = rnz(r, -9, 9), s = rnz(r, -9, 9), t = rnz(r, -9, 9);
          var xs = p + s, cs = q + t;
          while (xs === 0) { s = rnz(r, -9, 9); xs = p + s; }
          var ans = term(xs, 'x') + (cs === 0 ? '' : plus(cs));
          var second = (s < 0 ? ' ' + MINUS + ' ' + term(Math.abs(s), 'x') : ' + ' + term(s, 'x'));
          return P('Simplify: ' + term(p, 'x') + plus(q) + second + plus(t), ans,
            [], 'Add the x terms and the numbers separately.'); }
        var g = ri(r, 2, 9), m = ri(r, 2, 9), n = ri(r, 1, 9);
        /* m and n must share nothing, or g is not the greatest common factor and the answer is
           only half factored: 27x + 27 came out as 9(3x + 3). */
        var hcf = function (a, b) { while (b) { var t = a % b; a = b; b = t; } return a; };
        var guard = 0;
        while (hcf(m, n) !== 1 && guard++ < 40) { n = ri(r, 1, 9); if (hcf(m, n) !== 1) m = ri(r, 2, 9); }
        if (hcf(m, n) !== 1) { m = 2; n = 1; }
        return P('Factor: ' + (g * m) + 'x + ' + (g * n), g + '(' + m + 'x + ' + n + ')', [],
          'The greatest common factor is ' + g + '.');
      } },
    { id: 'geometry7', name: 'Circles, angles & solids', description: 'Circumference and area, angle pairs, and prism volume.',
      gen: function (r, d) {
        var k = ri(r, 1, 4);
        if (k === 1) { var rad = ri(r, 2, 12);
          return P('A circle has radius ' + rad + ' cm. What is its circumference in terms of π?', (2 * rad) + 'π cm', [(2 * rad) + 'pi', String(2 * rad) + 'π'],
            'C = 2πr = 2π × ' + rad + '.'); }
        if (k === 2) { var rr = ri(r, 2, 12);
          return P('A circle has radius ' + rr + ' cm. What is its area in terms of π?', (rr * rr) + 'π cm' + sup(2), [(rr * rr) + 'pi'],
            'A = πr² = π × ' + rr + '².'); }
        if (k === 3) { var ang = ri(r, 10, 80);
          var type = pick(r, ['complementary', 'supplementary']);
          return P('Two angles are ' + type + '. One measures ' + ang + '°. What is the other?',
            ((type === 'complementary' ? 90 : 180) - ang) + '°', [String((type === 'complementary' ? 90 : 180) - ang)],
            type === 'complementary' ? 'They add to 90°.' : 'They add to 180°.'); }
        var bw = ri(r, 2, 9), bl = ri(r, 2, 9), bh = ri(r, 2, 9);
        return P('A rectangular prism is ' + bl + ' cm × ' + bw + ' cm × ' + bh + ' cm. What is its surface area?',
          (2 * (bl * bw + bl * bh + bw * bh)) + ' cm' + sup(2), [String(2 * (bl * bw + bl * bh + bw * bh))],
          'SA = 2(lw + lh + wh).');
      } },
    { id: 'probability', name: 'Probability', description: 'Simple and compound probability, and expected counts.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var red = ri(r, 2, 8), blue = ri(r, 2, 8);
          return P('A bag holds ' + red + ' red and ' + blue + ' blue counters. One is taken at random. What is P(red)?',
            frac(red, red + blue), [], 'Favourable ÷ total = ' + red + '/' + (red + blue) + '.'); }
        if (k === 2) { var sides = pick(r, [6, 6, 10]);
          var target = ri(r, 1, sides);
          return P('A fair ' + sides + '-sided die is rolled twice. What is P(rolling ' + target + ' both times)?',
            '1/' + (sides * sides), [], 'Independent events multiply: 1/' + sides + ' × 1/' + sides + '.'); }
        var trials = pick(r, [20, 50, 100]), p = pick(r, [[1, 2], [1, 4], [1, 5], [3, 10]]);
        return P('The probability of winning a game is ' + p[0] + '/' + p[1] + '. In ' + trials + ' games, how many wins would you expect?',
          String(tidy(trials * p[0] / p[1])), [], 'Expected = probability × trials.');
      } }
  ];

  /* ================================================================ GRADE 8 ================================================================ */
  var G8 = [
    { id: 'exponents8', name: 'Exponents & scientific notation', description: 'Exponent laws, negative and zero powers, scientific notation.',
      gen: function (r, d) {
        var k = ri(r, 1, 4);
        if (k === 1) { var a = ri(r, 2, 9), m = ri(r, 2, 6), n = ri(r, 2, 6);
          return P('Simplify: ' + a + sup(m) + ' × ' + a + sup(n), a + sup(m + n), [a + '^' + (m + n)], 'Same base: add the exponents.'); }
        if (k === 2) { var b = ri(r, 2, 9), p = ri(r, 5, 9), q = ri(r, 1, 4);
          return P('Simplify: ' + b + sup(p) + ' ÷ ' + b + sup(q), b + sup(p - q), [b + '^' + (p - q)], 'Same base: subtract the exponents.'); }
        if (k === 3) { var big = ri(r, 11, 99) / 10, ex = ri(r, 3, 8);
          return P('Write ' + (big * Math.pow(10, ex)).toLocaleString('en-US') + ' in scientific notation.',
            big + ' × 10' + sup(ex), [big + 'x10^' + ex, big + '*10^' + ex], 'Move the point so one digit is in front.'); }
        var c = ri(r, 2, 9), e2 = ri(r, 2, 4);
        return P('Simplify: (' + c + 'x' + sup(2) + ')' + sup(e2), Math.pow(c, e2) + 'x' + sup(2 * e2), [Math.pow(c, e2) + 'x^' + (2 * e2)],
          'Raise both parts: ' + c + '^' + e2 + ' and x^(2×' + e2 + ').');
      } },
    { id: 'linear8', name: 'Multi-step equations', description: 'Variables on both sides, brackets and fractions.',
      gen: function (r, d) {
        var x = rnz(r, -10, 10), a = rnz(r, -8, 8), b = rnz(r, -8, 8);
        while (b === a) b = rnz(r, -8, 8);
        var c = rnz(r, -15, 15);
        var e = (a - b) * x + c;                    // makes the equation true by construction
        var guard = 0;
        while (e === 0 && guard++ < 30) { c = rnz(r, -15, 15); e = (a - b) * x + c; }
        if (e === 0) { c += 1; e = (a - b) * x + c; }
        return P('Solve for x:  ' + term(a, 'x') + plus(c) + ' = ' + term(b, 'x') + plus(e),
          'x = ' + num(x), [num(x)],
          'Subtract ' + term(b, 'x') + ' from both sides, then undo the ' + (c < 0 ? 'subtraction' : 'addition') + '.');
      } },
    { id: 'slope8', name: 'Slope & linear functions', description: 'Slope from two points, y = mx + b, and reading a line.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) { var x1 = rnz(r, -8, 8), x2 = rnz(r, -8, 8); while (x2 === x1) x2 = rnz(r, -8, 8);
          var m = rnz(r, -5, 5), b0 = rnz(r, -9, 9);
          var y1 = m * x1 + b0, y2 = m * x2 + b0;
          return P('Find the slope of the line through (' + num(x1) + ', ' + num(y1) + ') and (' + num(x2) + ', ' + num(y2) + ').',
            num(m), [], 'Slope = (y₂ − y₁) ÷ (x₂ − x₁) = ' + num(y2 - y1) + ' ÷ ' + num(x2 - x1) + '.'); }
        if (k === 2) { var mm = rnz(r, -6, 6), bb = rnz(r, -9, 9);
          return P('A line has slope ' + num(mm) + ' and passes through (0, ' + num(bb) + '). Write it as y = mx + b.',
            'y = ' + term(mm, 'x') + plus(bb), [], 'The point (0, b) gives the y-intercept.'); }
        var m2 = rnz(r, -6, 6), b2 = rnz(r, -9, 9), xv = rnz(r, -6, 6);
        return P('For y = ' + term(m2, 'x') + plus(b2) + ', find y when x = ' + num(xv) + '.',
          num(m2 * xv + b2), [], 'Substitute x = ' + num(xv) + '.');
      } },
    { id: 'systems8', name: 'Systems of equations', description: 'Two equations, one integer solution.',
      gen: function (r, d) {
        var x = rnz(r, -6, 6), y = rnz(r, -6, 6);
        var a = rnz(r, -4, 4), b = rnz(r, -4, 4), c = rnz(r, -4, 4), e = rnz(r, -4, 4);
        while (a * e - b * c === 0) { c = rnz(r, -4, 4); e = rnz(r, -4, 4); }
        /* q went in raw, so a coefficient of one printed as "1y" beside a properly written "3x" */
        var eq = function (p, q, rhs) {
          return term(p, 'x') + (q < 0 ? ' ' + MINUS + ' ' + term(Math.abs(q), 'y') : ' + ' + term(q, 'y')) + ' = ' + num(rhs);
        };
        return P('Solve the system:<br>' + eq(a, b, a * x + b * y) + '<br>' + eq(c, e, c * x + e * y),
          '(' + num(x) + ', ' + num(y) + ')', [num(x) + ',' + num(y), 'x=' + num(x) + ', y=' + num(y)],
          'Eliminate one variable, then substitute back.');
      } },
    { id: 'pythagorean', name: 'Pythagorean theorem', description: 'Find a missing side, and distance between points.',
      gen: function (r, d) {
        var trip = pick(r, [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]]);
        var k = ri(r, 1, 3);
        if (k === 1) return P('A right triangle has legs ' + trip[0] + ' and ' + trip[1] + '. How long is the hypotenuse?',
          String(trip[2]), [], trip[0] + '² + ' + trip[1] + '² = ' + (trip[0] * trip[0] + trip[1] * trip[1]) + ', and √' + (trip[2] * trip[2]) + ' = ' + trip[2] + '.');
        if (k === 2) return P('A right triangle has hypotenuse ' + trip[2] + ' and one leg ' + trip[0] + '. How long is the other leg?',
          String(trip[1]), [], trip[2] + '² − ' + trip[0] + '² = ' + (trip[2] * trip[2] - trip[0] * trip[0]) + '.');
        var x1 = rnz(r, -6, 6), y1 = rnz(r, -6, 6);
        return P('How far apart are (' + num(x1) + ', ' + num(y1) + ') and (' + num(x1 + trip[0]) + ', ' + num(y1 + trip[1]) + ')?',
          String(trip[2]), [], 'Legs of ' + trip[0] + ' and ' + trip[1] + ' give a hypotenuse of ' + trip[2] + '.');
      } },
    { id: 'transformations', name: 'Transformations', description: 'Translate, reflect, rotate and dilate points.',
      gen: function (r, d) {
        var x = rnz(r, -9, 9), y = rnz(r, -9, 9), k = ri(r, 1, 4);
        if (k === 1) { var dx = rnz(r, -6, 6), dy = rnz(r, -6, 6);
          return P('Translate (' + num(x) + ', ' + num(y) + ') by ' + (dx < 0 ? Math.abs(dx) + ' left' : dx + ' right') + ' and ' + (dy < 0 ? Math.abs(dy) + ' down' : dy + ' up') + '.',
            '(' + num(x + dx) + ', ' + num(y + dy) + ')', [num(x + dx) + ',' + num(y + dy)], 'Add to each coordinate.'); }
        if (k === 2) { var axis = pick(r, ['x', 'y']);
          return P('Reflect (' + num(x) + ', ' + num(y) + ') across the ' + axis + '-axis.',
            axis === 'x' ? '(' + num(x) + ', ' + num(-y) + ')' : '(' + num(-x) + ', ' + num(y) + ')',
            [], 'Reflecting across the ' + axis + '-axis changes the sign of ' + (axis === 'x' ? 'y' : 'x') + '.'); }
        if (k === 3) return P('Rotate (' + num(x) + ', ' + num(y) + ') 180° about the origin.',
          '(' + num(-x) + ', ' + num(-y) + ')', [], 'Both coordinates change sign.');
        var sc = ri(r, 2, 4);
        return P('Dilate (' + num(x) + ', ' + num(y) + ') by a scale factor of ' + sc + ' about the origin.',
          '(' + num(x * sc) + ', ' + num(y * sc) + ')', [], 'Multiply both coordinates by ' + sc + '.');
      } },
    { id: 'volume8', name: 'Cylinders, cones & spheres', description: 'Volume in terms of π.',
      gen: function (r, d) {
        var rad = ri(r, 2, 9), h = ri(r, 2, 12), k = ri(r, 1, 3);
        if (k === 1) return P('A cylinder has radius ' + rad + ' and height ' + h + '. What is its volume in terms of π?',
          (rad * rad * h) + 'π', [(rad * rad * h) + 'pi'], 'V = πr²h = π × ' + rad + '² × ' + h + '.');
        if (k === 2) { var h3 = h * 3;
          return P('A cone has radius ' + rad + ' and height ' + h3 + '. What is its volume in terms of π?',
            (rad * rad * h3 / 3) + 'π', [(rad * rad * h3 / 3) + 'pi'], 'V = ⅓πr²h.'); }
        var r3 = pick(r, [3, 6, 9]);
        return P('A sphere has radius ' + r3 + '. What is its volume in terms of π?',
          (4 * r3 * r3 * r3 / 3) + 'π', [(4 * r3 * r3 * r3 / 3) + 'pi'], 'V = 4/3 πr³.');
      } },
    { id: 'functions8', name: 'Functions', description: 'Deciding what is a function, and rate of change.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) {
          var xs = shuffle(r, [1, 2, 3, 4, 5]).slice(0, 4);
          var isFn = r() < 0.5;
          var pts = xs.map(function (v) { return [v, ri(r, 1, 9)]; });
          if (!isFn) { pts[3][0] = pts[1][0]; if (pts[3][1] === pts[1][1]) pts[3][1] = pts[1][1] % 9 + 1; }
          return P('Is this relation a function? ' + pts.map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(', '),
            isFn ? 'yes' : 'no', [], isFn ? 'Every input appears once.' : 'The input ' + pts[1][0] + ' appears twice with different outputs.');
        }
        if (k === 2) { var m = rnz(r, -5, 5), b = rnz(r, -9, 9), x1 = ri(r, 1, 4), x2 = x1 + ri(r, 1, 4);
          return P('A linear function gives f(' + x1 + ') = ' + num(m * x1 + b) + ' and f(' + x2 + ') = ' + num(m * x2 + b) + '. What is its rate of change?',
            num(m), [], 'Change in output ÷ change in input.'); }
        var mm = rnz(r, -6, 6), bb = rnz(r, -9, 9), v = rnz(r, -5, 5);
        return P('For f(x) = ' + term(mm, 'x') + plus(bb) + ', find f(' + num(v) + ').',
          num(mm * v + bb), [], 'Substitute x = ' + num(v) + '.');
      } }
  ];

  /* ================================================================ GRADE 4 ================================================================ */
  var G4 = [
    { id: 'place4', name: 'Place value & rounding', description: 'What a digit is worth, comparing big numbers, and rounding to the nearest ten, hundred or thousand.',
      gen: function (r, d) {
        var hi = d === 1 ? 9999 : d === 2 ? 99999 : 999999;
        var n = ri(r, 1000, hi);
        var k = ri(r, 1, 3);
        if (k === 1) {
          var to = pick(r, d === 1 ? [10, 100] : [10, 100, 1000]);
          var rounded = Math.round(n / to) * to;
          return P('Round ' + commas(n) + ' to the nearest ' + (to === 10 ? 'ten' : to === 100 ? 'hundred' : 'thousand') + '.',
            commas(rounded), [String(rounded)], 'look at the digit one place to the right');
        }
        if (k === 2) {
          /* the digit has to appear once only, or "what is the 2 worth" has two answers */
          var s = String(n), at = -1, tries = 0;
          while (at < 0 && tries++ < 30) {
            var i2 = ri(r, 0, s.length - 1);
            if (s.split(s.charAt(i2)).length - 1 === 1) at = i2;
          }
          if (at < 0) { s = '1234567'.slice(0, s.length); n = Number(s); at = ri(r, 0, s.length - 1); }
          var digit = s.charAt(at);
          var worth = Number(digit) * Math.pow(10, s.length - 1 - at);
          return P('In ' + commas(n) + ', what is the digit ' + digit + ' worth?',
            commas(worth), [String(worth)], '');
        }
        var m = ri(r, 1000, hi);
        while (m === n) m = ri(r, 1000, hi);
        return P('Which is greater: ' + commas(n) + ' or ' + commas(m) + '?',
          commas(Math.max(n, m)), [String(Math.max(n, m))], 'compare the biggest place first');
      } },
    { id: 'mult4', name: 'Multiplying', description: 'Times tables, a big number times a small one, and two two-digit numbers.',
      gen: function (r, d) {
        if (d === 1) { var a = ri(r, 2, 12), b = ri(r, 2, 12); return P('Work out: ' + a + ' × ' + b + '', String(a * b), [], ''); }
        if (d === 2) { var c = ri(r, 21, 499), e = ri(r, 3, 9); return P('Work out: ' + c + ' × ' + e + '', commas(c * e), [String(c * e)], ''); }
        var f = ri(r, 12, 79), g = ri(r, 12, 49);
        return P('Work out: ' + f + ' × ' + g + '', commas(f * g), [String(f * g)], f + ' × ' + g + ' = ' + (f * g));
      } },
    { id: 'div4', name: 'Dividing with remainders', description: 'Sharing into equal groups, and what is left over.',
      gen: function (r, d) {
        var div = ri(r, 2, d === 1 ? 6 : 12);
        var q = ri(r, 3, d === 1 ? 12 : d === 2 ? 40 : 90);
        var rem = ri(r, 0, div - 1);
        var n = div * q + rem;
        if (rem === 0) return P('Work out: ' + commas(n) + ' ÷ ' + div + '', String(q), [], '');
        return P('Work out: ' + commas(n) + ' ÷ ' + div + ' (give the remainder too)',
          q + ' r ' + rem, [q + ' remainder ' + rem, q + 'r' + rem], div + ' × ' + q + ' = ' + (div * q) + ', and ' + rem + ' left over');
      } },
    { id: 'frac4', name: 'Equivalent fractions', description: 'Fractions that are worth the same, and which of two is bigger.',
      gen: function (r, d) {
        var f = properFrac(r, d === 1 ? 6 : 10), n = f[0], den = f[1];
        var k = ri(r, 1, 3);
        if (k === 1) {
          var mult = ri(r, 2, d === 1 ? 4 : 8);
          return P('Fill in the missing number: ' + n + '/' + den + ' = ?/' + (den * mult) + '',
            String(n * mult), [n * mult + '/' + den * mult], 'the bottom was multiplied by ' + mult + ', so the top is too');
        }
        if (k === 2) {
          var g2 = properFrac(r, 10), n2 = g2[0], d2 = g2[1];
          while (n / den === n2 / d2) { g2 = properFrac(r, 10); n2 = g2[0]; d2 = g2[1]; }
          var bigger = (n / den > n2 / d2) ? (n + '/' + den) : (n2 + '/' + d2);
          return P('Which is greater: ' + n + '/' + den + ' or ' + n2 + '/' + d2 + '?', bigger, [],
            'over a common bottom of ' + (den * d2) + ': ' + (n * d2) + '/' + (den * d2) + ' and ' + (n2 * den) + '/' + (den * d2));
        }
        var whole = den * ri(r, 2, 9);
        return P('What is ' + n + '/' + den + ' of ' + whole + '?',
          String(whole / den * n), [], whole + ' ÷ ' + den + ' = ' + (whole / den) + ', then × ' + n);
      } },
    { id: 'addfrac4', name: 'Adding fractions', description: 'Adding and subtracting fractions that share a bottom number.',
      gen: function (r, d) {
        var den = ri(r, 3, d === 1 ? 8 : 12);
        var a = ri(r, 1, den - 1), b = ri(r, 1, den - 1);
        if (r() < 0.5) {
          return P('Work out: ' + a + '/' + den + ' + ' + b + '/' + den + ' (simplify)',
            frac(a + b, den), [(a + b) + '/' + den], 'add the tops, keep the bottom');
        }
        var hi = Math.max(a, b), lo = Math.min(a, b);
        return P('Work out: ' + hi + '/' + den + ' − ' + lo + '/' + den + ' (simplify)',
          frac(hi - lo, den), [(hi - lo) + '/' + den], 'subtract the tops, keep the bottom');
      } },
    { id: 'dec4', name: 'Decimals', description: 'Tenths and hundredths: adding, comparing, and writing them as fractions.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) {
          var a = ri(r, 1, 99) / 100, b = ri(r, 1, 99) / 100;
          return P('Work out: ' + a.toFixed(2) + ' + ' + b.toFixed(2) + '', tidy(a + b).toFixed(2), [String(tidy(a + b))], '');
        }
        if (k === 2) {
          var x = ri(r, 1, 99) / 100, y = ri(r, 1, 99) / 100;
          while (x === y) y = ri(r, 1, 99) / 100;
          return P('Which is greater: ' + x.toFixed(2) + ' or ' + y.toFixed(2) + '?',
            Math.max(x, y).toFixed(2), [String(Math.max(x, y))], 'compare tenths first, then hundredths');
        }
        var t = ri(r, 1, 9);
        return P('Write 0.' + t + ' as a fraction in its simplest form.', frac(t, 10), [t + '/10'], '');
      } },
    { id: 'area4', name: 'Area & perimeter', description: 'Rectangles: the space inside and the distance around.',
      gen: function (r, d) {
        var w = ri(r, 3, d === 1 ? 12 : 25), h = ri(r, 3, d === 1 ? 12 : 25);
        if (r() < 0.45) return P('A rectangle is ' + w + ' cm by ' + h + ' cm. What is its area?',
          (w * h) + ' cm' + sup(2), [String(w * h)], w + ' × ' + h);
        if (r() < 0.6) return P('A rectangle is ' + w + ' cm by ' + h + ' cm. What is its perimeter?',
          (2 * (w + h)) + ' cm', [String(2 * (w + h))], '2 × (' + w + ' + ' + h + ')');
        return P('A rectangle has area ' + (w * h) + ' cm' + sup(2) + ' and one side ' + w + ' cm. How long is the other side?',
          h + ' cm', [String(h)], (w * h) + ' ÷ ' + w);
      } },
    { id: 'measure4', name: 'Measures & time', description: 'Changing between units, and working out how long something took.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) {
          var pairs = [['km', 'm', 1000], ['kg', 'g', 1000], ['m', 'cm', 100], ['L', 'mL', 1000], ['hours', 'minutes', 60], ['minutes', 'seconds', 60]];
          var p = pick(r, pairs), n = ri(r, 2, d === 1 ? 9 : 45);
          return P('How many ' + p[1] + ' are in ' + n + ' ' + p[0] + '?', commas(n * p[2]), [String(n * p[2])], n + ' × ' + p[2]);
        }
        if (k === 2) {
          var h1 = ri(r, 1, 10), m1 = pick(r, [0, 15, 20, 30, 45]);
          var mins = ri(r, 20, d === 1 ? 60 : 180);
          var start = h1 * 60 + m1, end = start + mins;
          return P('A film starts at ' + clock(start) + ' and ends at ' + clock(end) + '. How long is it, in minutes?',
            String(mins), [mins + ' minutes'], clock(start) + ' to ' + clock(end));
        }
        var g = ri(r, 2, 9), kg = ri(r, 1, 9);
        return P('A bag holds ' + kg + ' kg ' + (g * 100) + ' g. How many grams is that altogether?',
          commas(kg * 1000 + g * 100), [String(kg * 1000 + g * 100)], kg + ' × 1000 + ' + (g * 100));
      } },
    { id: 'factors4', name: 'Factors & multiples', description: 'What divides into a number, what it divides into, and whether it is prime.',
      gen: function (r, d) {
        var k = ri(r, 1, 3);
        if (k === 1) {
          var n = ri(r, 12, d === 1 ? 40 : 100);
          var fs = []; for (var i = 1; i <= n; i++) if (n % i === 0) fs.push(i);
          return P('List every factor of ' + n + '.', fs.join(', '), [fs.join(',')], n + ' has ' + fs.length + ' factors');
        }
        if (k === 2) {
          var m = ri(r, 3, 12), which = ri(r, 4, 9);
          return P('What is the ' + ordinal(which) + ' multiple of ' + m + '?', String(m * which), [], m + ' × ' + which);
        }
        /* worked out, not looked up: a hand-written list of primes stops being right the moment the
           range changes, and this one is asked about numbers up to sixty */
        var v = ri(r, 10, d === 1 ? 40 : 80);
        var isPrime = v > 1, j;
        for (j = 2; j * j <= v; j++) if (v % j === 0) { isPrime = false; break; }
        return P('Is ' + v + ' prime or composite?', isPrime ? 'prime' : 'composite', [],
          isPrime ? 'nothing but 1 and itself divides it' : 'it divides by ' + j);
      } },
    { id: 'patterns4', name: 'Number patterns', description: 'Spotting the rule in a sequence and carrying it on.',
      gen: function (r, d) {
        var start = ri(r, 1, 20), step = ri(r, 2, d === 1 ? 6 : 12);
        var mult = d === 3 && r() < 0.4;
        var seq = [], v = start;
        for (var i = 0; i < 5; i++) { seq.push(v); v = mult ? v * 2 : v + step; }
        var next = mult ? seq[4] * 2 : seq[4] + step;
        return P('What comes next? ' + seq.join(', ') + ', ?', commas(next), [String(next)],
          mult ? 'each one is double the one before' : 'each one is ' + step + ' more than the one before');
      } }
  ];

  /* ================================================================ GRADE 5 ================================================================ */
  var G5 = [
    { id: 'dec5', name: 'Decimal arithmetic', description: 'Adding, subtracting, multiplying and dividing decimals.',
      gen: function (r, d) {
        var k = ri(r, 1, 4);
        if (k === 1) { var a = ri(r, 10, 999) / 10, b = ri(r, 10, 999) / 10;
          return P('Work out: ' + a.toFixed(1) + ' + ' + b.toFixed(1) + '', tidy(a + b).toFixed(1), [String(tidy(a + b))], ''); }
        if (k === 2) { var c = ri(r, 100, 999) / 100, e = ri(r, 10, 99) / 100;
          return P('Work out: ' + c.toFixed(2) + ' − ' + e.toFixed(2) + '', tidy(c - e).toFixed(2), [String(tidy(c - e))], ''); }
        if (k === 3) { var f = ri(r, 11, 99) / 10, g = ri(r, 2, 9);
          return P('Work out: ' + f.toFixed(1) + ' × ' + g + '', tidy(f * g).toFixed(1), [String(tidy(f * g))], ''); }
        var q = ri(r, 2, 9), div = ri(r, 2, 8);
        var n = tidy(q * div) / 10;
        return P('Work out: ' + (q * div / 10).toFixed(1) + ' ÷ ' + div + '', (q / 10).toFixed(1), [String(q / 10)], '');
      } },
    { id: 'frac5', name: 'Fractions with different bottoms', description: 'Adding and subtracting fractions that need a common denominator.',
      gen: function (r, d) {
        var a = properFrac(r, d === 1 ? 6 : 10), b = properFrac(r, d === 1 ? 6 : 10);
        var guard = 0;
        while (a[1] === b[1] && guard++ < 20) b = properFrac(r, 10);
        var den = a[1] * b[1] / gcd(a[1], b[1]);
        var an = a[0] * (den / a[1]), bn = b[0] * (den / b[1]);
        if (r() < 0.55) return P('Work out: ' + a[0] + '/' + a[1] + ' + ' + b[0] + '/' + b[1] + ' (simplify)',
          frac(an + bn, den), [(an + bn) + '/' + den], 'a common bottom of ' + den + ': ' + an + '/' + den + ' + ' + bn + '/' + den);
        var hi = Math.max(an, bn), lo = Math.min(an, bn);
        return P('Work out: ' + (an >= bn ? a[0] + '/' + a[1] + ' − ' + b[0] + '/' + b[1] : b[0] + '/' + b[1] + ' − ' + a[0] + '/' + a[1]) + ' (simplify)',
          frac(hi - lo, den), [(hi - lo) + '/' + den], 'a common bottom of ' + den);
      } },
    { id: 'multfrac5', name: 'Multiplying fractions', description: 'A fraction of a number, and a fraction times a fraction.',
      gen: function (r, d) {
        if (d === 1 || r() < 0.4) {
          var f = properFrac(r, 8), whole = f[1] * ri(r, 2, 9);
          return P('What is ' + f[0] + '/' + f[1] + ' of ' + whole + '?', String(whole / f[1] * f[0]), [],
            whole + ' ÷ ' + f[1] + ' = ' + (whole / f[1]) + ', then × ' + f[0]);
        }
        var a = properFrac(r, 9), b = properFrac(r, 9);
        return P('Work out: ' + a[0] + '/' + a[1] + ' × ' + b[0] + '/' + b[1] + ' (simplify)',
          frac(a[0] * b[0], a[1] * b[1]), [(a[0] * b[0]) + '/' + (a[1] * b[1])], 'tops times tops, bottoms times bottoms');
      } },
    { id: 'vol5', name: 'Volume', description: 'How much a box holds: length × width × height.',
      gen: function (r, d) {
        var l = ri(r, 2, d === 1 ? 8 : 15), w = ri(r, 2, d === 1 ? 8 : 15), h = ri(r, 2, d === 1 ? 8 : 12);
        if (r() < 0.65) return P('A box is ' + l + ' cm long, ' + w + ' cm wide and ' + h + ' cm high. What is its volume?',
          (l * w * h) + ' cm' + sup(3), [String(l * w * h)], l + ' × ' + w + ' × ' + h);
        return P('A box has volume ' + (l * w * h) + ' cm' + sup(3) + '. Its base is ' + l + ' cm by ' + w + ' cm. How high is it?',
          h + ' cm', [String(h)], (l * w * h) + ' ÷ (' + l + ' × ' + w + ')');
      } },
    { id: 'ops5', name: 'Order of operations', description: 'Brackets first, then multiply and divide, then add and subtract.',
      gen: function (r, d) {
        var a = ri(r, 2, 12), b = ri(r, 2, 12), c = ri(r, 2, 9);
        if (d === 1) return P('Work out: ' + a + ' + ' + b + ' × ' + c + '', String(a + b * c), [], 'multiply before adding');
        if (d === 2) return P('Work out: (' + a + ' + ' + b + ') × ' + c + '', String((a + b) * c), [], 'brackets first');
        var e = ri(r, 2, 6);
        return P('Work out: ' + a + ' × ' + b + ' − ' + (c * e) + ' ÷ ' + e + '', String(a * b - c), [],
          'times and divide first: ' + (a * b) + ' − ' + c);
      } },
    { id: 'coord5', name: 'The coordinate plane', description: 'Reading and plotting points, and how far apart two of them are.',
      gen: function (r, d) {
        var x1 = ri(r, 0, d === 1 ? 10 : 20), y1 = ri(r, 0, d === 1 ? 10 : 20);
        if (r() < 0.5) {
          var dx = ri(r, 2, 9);
          return P('How far is it from (' + x1 + ', ' + y1 + ') to (' + (x1 + dx) + ', ' + y1 + ')?',
            String(dx), [dx + ' units'], 'the height is the same, so count along the x values');
        }
        var right = ri(r, 1, 9), up = ri(r, 1, 9);
        return P('Start at (' + x1 + ', ' + y1 + '), move ' + right + ' right and ' + up + ' up. Where are you?',
          '(' + (x1 + right) + ', ' + (y1 + up) + ')', [(x1 + right) + ',' + (y1 + up)], 'right changes x, up changes y');
      } },
    { id: 'powers5', name: 'Powers of ten', description: 'Multiplying and dividing by 10, 100 and 1000, and what the digits do.',
      gen: function (r, d) {
        var n = ri(r, 2, 999) / (r() < 0.5 ? 1 : 10);
        var p = pick(r, d === 1 ? [10, 100] : [10, 100, 1000]);
        if (r() < 0.55) {
          var v = tidy(n * p);
          return P('Work out: ' + n + ' × ' + commas(p) + '', commas(v), [String(v)], 'every digit moves ' + (String(p).length - 1) + ' places left');
        }
        var big = ri(r, 1, 999) * p;
        return P('Work out: ' + commas(big) + ' ÷ ' + commas(p) + '', String(big / p), [], '');
      } },
    { id: 'convert5', name: 'Converting units', description: 'Between metric units, including the decimal ones.',
      gen: function (r, d) {
        var pairs = [['m', 'cm', 100], ['km', 'm', 1000], ['kg', 'g', 1000], ['L', 'mL', 1000], ['cm', 'mm', 10]];
        var p = pick(r, pairs);
        if (r() < 0.5) {
          var n = d === 1 ? ri(r, 2, 9) : ri(r, 10, 99) / 10;
          return P('How many ' + p[1] + ' are in ' + n + ' ' + p[0] + '?', commas(tidy(n * p[2])), [String(tidy(n * p[2]))], '× ' + p[2]);
        }
        var small = ri(r, 2, 40) * p[2] / (d === 1 ? 1 : 2);
        return P('Write ' + commas(small) + ' ' + p[1] + ' in ' + p[0] + '.', String(tidy(small / p[2])), [tidy(small / p[2]) + ' ' + p[0]], '÷ ' + p[2]);
      } },
    { id: 'divide5', name: 'Long division', description: 'Dividing by a two-digit number.',
      gen: function (r, d) {
        var div = ri(r, d === 1 ? 11 : 12, d === 1 ? 25 : 45);
        var q = ri(r, 4, d === 1 ? 20 : 60);
        var rem = d === 1 ? 0 : ri(r, 0, div - 1);
        var n = div * q + rem;
        if (!rem) return P('Work out: ' + commas(n) + ' ÷ ' + div + '', String(q), [], div + ' × ' + q + ' = ' + commas(n));
        return P('Work out: ' + commas(n) + ' ÷ ' + div + ' (give the remainder too)',
          q + ' r ' + rem, [q + ' remainder ' + rem, q + 'r' + rem], div + ' × ' + q + ' = ' + commas(div * q) + ', and ' + rem + ' left over');
      } },
    { id: 'average5', name: 'Mean and range', description: 'The average of a small set of numbers, and how spread out they are.',
      gen: function (r, d) {
        var n = d === 1 ? 4 : ri(r, 5, 6);
        var vals = [], i;
        var mean = ri(r, 5, 40);
        for (i = 0; i < n - 1; i++) vals.push(ri(r, Math.max(1, mean - 12), mean + 12));
        var lastV = mean * n - vals.reduce(function (a, b) { return a + b; }, 0);
        if (lastV < 1) return P('Find the mean of: ' + [2, 4, 6, 8].join(', ') + '', '5', [], '20 ÷ 4');
        vals.push(lastV);
        vals = shuffle(r, vals);
        if (r() < 0.6) return P('Find the mean of: ' + vals.join(', ') + '',
          String(mean), [], 'add them up (' + (mean * n) + ') and divide by ' + n);
        return P('Find the range of: ' + vals.join(', ') + '',
          String(Math.max.apply(null, vals) - Math.min.apply(null, vals)), [],
          'biggest (' + Math.max.apply(null, vals) + ') − smallest (' + Math.min.apply(null, vals) + ')');
      } }
  ];

  /* ======================================================= INTEGRATED MATH 2 (CPM Core Connections) ======================================================= */
  /* Answers are kept exact and typeable: Pythagorean triples rather than decimals for trigonometry,
     integer answers rather than radicals for the special triangles, and π left in place for circles. */
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  var INT2 = [
    { id: 'quadfactor', name: 'Factoring quadratics', description: 'x² + bx + c and, at level 3, a quadratic with a number in front of x².',
      gen: function (r, d) {
        var p = rnz(r, -9, 9), q = rnz(r, -9, 9);
        if (d < 3) {
          var b = p + q, c = p * q;
          return P('Factor: x' + sup(2) + plusTerm(b, 'x') + plus(c),
            '(x' + plus(p) + ')(x' + plus(q) + ')', ['(x' + plus(q) + ')(x' + plus(p) + ')'],
            'two numbers that multiply to ' + c + ' and add to ' + b);
        }
        var a = ri(r, 2, 5), m = rnz(r, -6, 6);
        /* (a x + p)(x + m) = a x^2 + (am + p) x + pm */
        return P('Factor: ' + a + 'x' + sup(2) + plusTerm(a * m + p, 'x') + plus(p * m),
          '(' + a + 'x' + plus(p) + ')(x' + plus(m) + ')', ['(x' + plus(m) + ')(' + a + 'x' + plus(p) + ')'],
          'split the middle term using ' + (a * m) + ' and ' + p);
      } },
    { id: 'quadsolve', name: 'Solving quadratics', description: 'Solving by factoring, and reading the roots off a factored form.',
      gen: function (r, d) {
        var p = rnz(r, -9, 9), q = rnz(r, -9, 9);
        if (r() < 0.4) {
          return P('Solve: (x' + plus(-p) + ')(x' + plus(-q) + ') = 0',
            'x = ' + num(Math.min(p, q)) + ' or x = ' + num(Math.max(p, q)),
            [num(Math.min(p, q)) + ', ' + num(Math.max(p, q)), num(Math.max(p, q)) + ', ' + num(Math.min(p, q))],
            'a product is zero when one of its parts is');
        }
        var b = -(p + q), c = p * q;
        return P('Solve: x' + sup(2) + plusTerm(b, 'x') + plus(c) + ' = 0',
          'x = ' + num(Math.min(p, q)) + ' or x = ' + num(Math.max(p, q)),
          [num(Math.min(p, q)) + ', ' + num(Math.max(p, q)), num(Math.max(p, q)) + ', ' + num(Math.min(p, q))],
          'it factors to (x' + plus(-p) + ')(x' + plus(-q) + ')');
      } },
    { id: 'similar2', name: 'Similar figures', description: 'Scale factor between similar shapes, a missing side, and what it does to area.',
      gen: function (r, d) {
        var k = ri(r, 2, d === 1 ? 4 : 6);
        var a = ri(r, 3, 12), b = ri(r, 3, 12);
        var which = ri(r, 1, 3);
        if (which === 1) return P('Two similar triangles have matching sides of ' + a + ' cm and ' + (a * k) + ' cm. What is the scale factor from the smaller to the larger?',
          String(k), [k + ':1'], (a * k) + ' ÷ ' + a);
        if (which === 2) return P('Two triangles are similar with scale factor ' + k + '. A side of the smaller is ' + b + ' cm. How long is the matching side of the larger?',
          (b * k) + ' cm', [String(b * k)], b + ' × ' + k);
        return P('Two similar rectangles have scale factor ' + k + '. The smaller has area ' + (a * b) + ' cm' + sup(2) + '. What is the area of the larger?',
          (a * b * k * k) + ' cm' + sup(2), [String(a * b * k * k)], 'area scales by the square of ' + k + ', so × ' + (k * k));
      } },
    { id: 'trig2', name: 'Right triangle trigonometry', description: 'Sine, cosine and tangent in a right triangle, as exact fractions.',
      gen: function (r, d) {
        var t = pick(r, TRIPLES), scale = d === 3 ? ri(r, 1, 4) : 1;
        var opp = t[0] * scale, adj = t[1] * scale, hyp = t[2] * scale;
        if (r() < 0.35) {
          return P('A right triangle has legs ' + opp + ' and ' + adj + '. How long is the hypotenuse?',
            String(hyp), [hyp + ' units'], opp + sup(2) + ' + ' + adj + sup(2) + ' = ' + hyp + sup(2));
        }
        var fn = pick(r, ['sin', 'cos', 'tan']);
        var top = fn === 'sin' ? opp : fn === 'cos' ? adj : opp;
        var bot = fn === 'tan' ? adj : hyp;
        return P('In a right triangle, the side opposite angle A is ' + opp + ', the side next to it is ' + adj + ', and the hypotenuse is ' + hyp + '. Find ' + fn + '(A) as a fraction.',
          frac(top, bot), [(top / bot).toFixed(4), String(tidy(top / bot))],
          fn === 'sin' ? 'opposite over hypotenuse' : fn === 'cos' ? 'next-to over hypotenuse' : 'opposite over next-to');
      } },
    { id: 'special2', name: 'Special right triangles', description: 'The 45°–45°–90° and 30°–60°–90° triangles, and the sides they force.',
      gen: function (r, d) {
        var k = ri(r, 2, d === 1 ? 9 : 20);
        var which = ri(r, 1, 4);
        if (which === 1) return P('In a 45°–45°–90° triangle one leg is ' + k + '. How long is the other leg?',
          String(k), [k + ' units'], 'the two legs of a 45–45–90 triangle are equal');
        if (which === 2) return P('In a 45°–45°–90° triangle the hypotenuse is ' + k + '√2. How long is each leg?',
          String(k), [k + ' units'], 'the hypotenuse is a leg times √2');
        if (which === 3) return P('In a 30°–60°–90° triangle the hypotenuse is ' + (2 * k) + '. How long is the side opposite the 30° angle?',
          String(k), [k + ' units'], 'the short leg is half the hypotenuse');
        return P('In a 30°–60°–90° triangle the side opposite the 30° angle is ' + k + '. How long is the hypotenuse?',
          String(2 * k), [2 * k + ' units'], 'the hypotenuse is twice the short leg');
      } },
    { id: 'circles2', name: 'Circles', description: 'Circumference, area, arc length and sector area, left in terms of π.',
      gen: function (r, d) {
        var rad = ri(r, 2, d === 1 ? 24 : 20);
        var which = ri(r, 1, d === 1 ? 3 : 5);
        if (which === 1) return P('A circle has radius ' + rad + ' cm. What is its circumference, in terms of π?',
          (2 * rad) + 'π cm', [(2 * rad) + 'π', (2 * rad) + 'pi'], 'C = 2πr');
        if (which === 2) return P('A circle has radius ' + rad + ' cm. What is its area, in terms of π?',
          (rad * rad) + 'π cm' + sup(2), [(rad * rad) + 'π', (rad * rad) + 'pi'], 'A = πr' + sup(2));
        if (which === 3) return P('A circle has diameter ' + (2 * rad) + ' cm. What is its area, in terms of π?',
          (rad * rad) + 'π cm' + sup(2), [(rad * rad) + 'π', (rad * rad) + 'pi'], 'the radius is half of ' + (2 * rad) + ', so A = π × ' + rad + sup(2));
        if (which === 4) return P('A circle has circumference ' + (2 * rad) + 'π cm. What is its radius?',
          rad + ' cm', [String(rad)], 'C = 2πr, so r is half of ' + (2 * rad));
        var ang = pick(r, [30, 45, 60, 90, 120, 135, 180, 270]);
        var g = gcd(ang, 360);
        if (which === 5) {
          var arcTop = 2 * rad * ang / g, arcBot = 360 / g;
          return P('A circle has radius ' + rad + ' cm. What is the length of an arc of ' + ang + '°, in terms of π?',
            frac(arcTop, arcBot) + 'π cm', [frac(arcTop, arcBot) + 'π', frac(arcTop, arcBot) + 'pi'],
            ang + '/360 of the circumference ' + (2 * rad) + 'π');
        }
        var secTop = rad * rad * ang / g, secBot = 360 / g;
        return P('A circle has radius ' + rad + ' cm. What is the area of a sector of ' + ang + '°, in terms of π?',
          frac(secTop, secBot) + 'π cm' + sup(2), [frac(secTop, secBot) + 'π', frac(secTop, secBot) + 'pi'],
          ang + '/360 of the area ' + (rad * rad) + 'π');
      } },
    { id: 'prob2', name: 'Probability', description: 'Two-way tables, the chance of one thing and then another, and complements.',
      gen: function (r, d) {
        var which = ri(r, 1, d === 1 ? 2 : 4);
        var a = ri(r, 2, 12), b = ri(r, 2, 12);
        if (which === 1) return P('A bag holds ' + a + ' red and ' + b + ' blue counters. One is taken at random. What is P(red)?',
          frac(a, a + b), [(a / (a + b)).toFixed(4)], a + ' out of ' + (a + b));
        if (which === 2) return P('The chance of rain tomorrow is ' + frac(a, a + b) + '. What is the chance it does not rain?',
          frac(b, a + b), [(b / (a + b)).toFixed(4)], 'the two must add to 1');
        if (which === 3) {
          var c = ri(r, 2, 9), e = ri(r, 2, 9);
          return P('Two independent events have P(A) = ' + frac(1, c) + ' and P(B) = ' + frac(1, e) + '. What is P(A and B)?',
            frac(1, c * e), [(1 / (c * e)).toFixed(4)], 'independent, so multiply them');
        }
        var boys = ri(r, 4, 15), girls = ri(r, 4, 15), boysYes = ri(r, 1, boys - 1);
        return P('In a survey, ' + boys + ' boys and ' + girls + ' girls answered. ' + boysYes + ' of the boys said yes. If a boy is picked at random, what is the chance he said yes?',
          frac(boysYes, boys), [(boysYes / boys).toFixed(4)], 'out of the boys only: ' + boysYes + ' of ' + boys);
      } },
    { id: 'transform2', name: 'Transformations', description: 'Where a point lands after a reflection, a rotation about the origin, or a translation.',
      gen: function (r, d) {
        var x = rnz(r, -9, 9), y = rnz(r, -9, 9);
        var moves = d === 1
          ? [['reflected in the x-axis', x, -y], ['reflected in the y-axis', -x, y]]
          : [['reflected in the x-axis', x, -y], ['reflected in the y-axis', -x, y],
             ['reflected in the line y = x', y, x], ['rotated 180° about the origin', -x, -y],
             ['rotated 90° counter-clockwise about the origin', -y, x], ['rotated 90° clockwise about the origin', y, -x]];
        var m = pick(r, moves);
        if (d >= 2 && r() < 0.25) {
          var dx = rnz(r, -8, 8), dy = rnz(r, -8, 8);
          return P('The point (' + num(x) + ', ' + num(y) + ') is translated ' + Math.abs(dx) + ' ' + (dx > 0 ? 'right' : 'left') +
            ' and ' + Math.abs(dy) + ' ' + (dy > 0 ? 'up' : 'down') + '. Where does it land?',
            '(' + num(x + dx) + ', ' + num(y + dy) + ')', [num(x + dx) + ', ' + num(y + dy)], 'add to x, add to y');
        }
        return P('The point (' + num(x) + ', ' + num(y) + ') is ' + m[0] + '. Where does it land?',
          '(' + num(m[1]) + ', ' + num(m[2]) + ')', [num(m[1]) + ', ' + num(m[2])], '');
      } },
    { id: 'solids2', name: 'Surface area & volume', description: 'Prisms and cylinders, with π left in place.',
      gen: function (r, d) {
        var which = ri(r, 1, d === 1 ? 2 : 4);
        var a = ri(r, 2, 12), b = ri(r, 2, 12), h = ri(r, 2, 15);
        if (which === 1) return P('A rectangular prism is ' + a + ' cm × ' + b + ' cm × ' + h + ' cm. What is its volume?',
          (a * b * h) + ' cm' + sup(3), [String(a * b * h)], a + ' × ' + b + ' × ' + h);
        if (which === 2) return P('A rectangular prism is ' + a + ' cm × ' + b + ' cm × ' + h + ' cm. What is its surface area?',
          (2 * (a * b + a * h + b * h)) + ' cm' + sup(2), [String(2 * (a * b + a * h + b * h))], '2(' + (a * b) + ' + ' + (a * h) + ' + ' + (b * h) + ')');
        if (which === 3) return P('A cylinder has radius ' + a + ' cm and height ' + h + ' cm. What is its volume, in terms of π?',
          (a * a * h) + 'π cm' + sup(3), [(a * a * h) + 'π', (a * a * h) + 'pi'], 'V = πr' + sup(2) + 'h');
        return P('A cylinder has radius ' + a + ' cm and height ' + h + ' cm. What is its curved surface area, in terms of π?',
          (2 * a * h) + 'π cm' + sup(2), [(2 * a * h) + 'π', (2 * a * h) + 'pi'], 'the curved part is 2πrh');
      } },
    { id: 'expo2', name: 'Exponential growth & decay', description: 'The multiplier for a percent change, and the value after a number of steps.',
      gen: function (r, d) {
        var pct = pick(r, [2, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50]);
        var up = r() < 0.5;
        var f = up ? 100 + pct : 100 - pct;          /* the multiplier as hundredths, kept whole */
        var mult = f / 100;
        if (d === 1 && r() < 0.6) {
          return P('A quantity ' + (up ? 'grows' : 'falls') + ' by ' + pct + '% each year. What is the multiplier?',
            String(tidy(mult)), [tidy(mult).toFixed(2)], up ? '100% + ' + pct + '% = ' + f + '%' : '100% − ' + pct + '% = ' + f + '%');
        }
        /* Work the value out in whole numbers: base × f^n ÷ 100^n. Only a base that divides exactly is
           used, so the answer is a whole number and nothing has to be rounded or hedged. */
        var n = d === 1 ? 1 : ri(r, 2, 3);
        var den = Math.pow(100, n), fp = Math.pow(f, n);
        var bases = shuffle(r, [50, 100, 150, 200, 250, 400, 500, 800, 1000, 1250, 1600, 2000, 2500, 5000, 10000]);
        var base = 0, i;
        for (i = 0; i < bases.length; i++) { if ((bases[i] * fp) % den === 0) { base = bases[i]; break; } }
        if (!base) {
          return P('A quantity ' + (up ? 'grows' : 'falls') + ' by ' + pct + '% each year. What is the multiplier?',
            String(tidy(mult)), [tidy(mult).toFixed(2)], up ? '100% + ' + pct + '% = ' + f + '%' : '100% − ' + pct + '% = ' + f + '%');
        }
        var end = base * fp / den;
        return P('A population of ' + commas(base) + ' ' + (up ? 'grows' : 'falls') + ' by ' + pct + '% each year. What is it after ' +
          (n === 1 ? 'one year' : n + ' years') + '?',
          commas(end), [String(end)], commas(base) + ' × ' + tidy(mult) + (n > 1 ? sup(n) : '') + ' = ' + commas(end));
      } }
  ];

  /* Grades 6 to 8 follow the CPM Core Connections courses, which is what the school teaches from, so the
     topics and the words match the book rather than a generic scheme. Grades 4 and 5 come before CPM
     starts, so those are named by strand. */
  var LEVELS = [
    { id: '4', name: 'Grade 4', sub: 'Place value, multiplying and dividing, fractions, measures', topics: G4 },
    { id: '5', name: 'Grade 5', sub: 'Decimals, fractions, volume, coordinates, averages', topics: G5 },
    { id: '6', name: 'Grade 6', sub: 'CPM Core Connections Course 1 · ratios, fractions, decimals, early algebra', topics: G6 },
    { id: '7', name: 'Grade 7', sub: 'CPM Core Connections Course 2 · rationals, proportions, percents, geometry, probability', topics: G7 },
    { id: '8', name: 'Grade 8', sub: 'CPM Core Connections Course 3 · exponents, linear equations, Pythagoras, functions', topics: G8 },
    { id: 'int2', name: 'Integrated Math 2', sub: 'CPM Core Connections Integrated II · quadratics, similarity, trigonometry, circles, probability', topics: INT2 }
  ];
  var BY_ID = {}; LEVELS.forEach(function (g) { BY_ID[g.id] = g; });

  function generate(opts) {
    opts = opts || {};
    /* named, not positional: adding a grade to the front of LEVELS must not change what an unknown one means */
    var grade = BY_ID[String(opts.grade)] || BY_ID['7'];
    var wanted = Array.isArray(opts.topics) && opts.topics.length
      ? grade.topics.filter(function (t) { return opts.topics.indexOf(t.id) >= 0; })
      : grade.topics;
    if (!wanted.length) wanted = grade.topics;
    var rawCount = (opts.count == null || opts.count === '') ? 20 : Number(opts.count);
    var count = isFinite(rawCount) ? Math.min(60, Math.max(1, Math.round(rawCount))) : 20;
    var difficulty = [1, 2, 3].indexOf(Number(opts.difficulty)) >= 0 ? Number(opts.difficulty) : 2;
    var seed = isFinite(Number(opts.seed)) ? Number(opts.seed) >>> 0 : (Math.random() * 1e9) >>> 0;
    var r = rng(seed);
    var out = [], seen = {}, i, guard = 0;
    // even spread across the chosen topics, then shuffled
    var order = [];
    for (i = 0; i < count; i++) order.push(wanted[i % wanted.length]);
    order = shuffle(r, order);
    for (i = 0; i < order.length; i++) {
      var topic = order[i], p = null;
      for (guard = 0; guard < 40; guard++) {
        p = topic.gen(r, difficulty);
        if (p && p.question && !seen[p.question]) break;
      }
      if (!p || !p.question) continue;
      seen[p.question] = 1;
      out.push({ id: 'q' + (out.length + 1), topic: topic.id, topicName: topic.name,
        question: p.question, answer: p.answer, accept: p.accept || [], work: p.work || '' });
    }
    return { grade: grade.id, gradeName: grade.name, seed: seed, difficulty: difficulty,
      topics: wanted.map(function (t) { return t.id; }), problems: out };
  }

  function norm(s) {
    return String(s == null ? '' : s)
      .replace(/<sup>([^<]*)<\/sup>/g, '^$1').replace(/<[^>]+>/g, '')
      .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
      .replace(/[−–]/g, '-').replace(/[×·*]/g, '*').replace(/÷/g, '/')
      .replace(/\bpi\b/gi, 'π').replace(/\s+/g, '').toLowerCase()
      .replace(/^\(|\)$/g, '').replace(/[$,]/g, '');
  }
  function checkAnswer(p, typed) {
    if (!p || typed == null || String(typed).trim() === '') return false;
    var want = [p.answer].concat(p.accept || []).map(norm);
    var got = norm(typed);
    /* "x = 3" answers "x = 3" and "k = 8" answers "8", but "y = 3" does not answer "x = 3".
       A label is only wrong when the question named a different one. */
    var labelOf = function (v) { var m = /^([a-z])=/.exec(v); return m ? m[1] : ''; };
    var named = {};
    want.forEach(function (v) { var L = labelOf(v); if (L) named[L] = 1; });
    var mine = labelOf(got);
    if (mine && Object.keys(named).length && !named[mine]) return false;
    var unlabel = function (v) { return v.replace(/^[a-z]=/, ''); };
    if (want.map(unlabel).indexOf(unlabel(got)) >= 0) return true;
    /* norm() strips $ , ( ) and a leading "x=", so "$", "()" and "," all come out empty. Number('')
       is 0, which used to mark any of them right for a question whose answer is zero. */
    if (got === '') return false;
    if (want.indexOf(got) >= 0) return true;
    var gn = Number(got), wn = Number(want[0]);
    if (isFinite(gn) && isFinite(wn) && Math.abs(gn - wn) < 0.005) return true;
    // Only a known unit may differ; stripping every letter would let "zzz9" match "9".
    var unit = /(cm\^?[23]?|m\^?[23]?|units?|degrees|°|%|\$)+$/;
    var bare = function (t) { return t.replace(unit, ''); };
    return want.some(function (w) { return w !== '' && bare(w) !== '' && bare(w) === bare(got); });
  }

  return { LEVELS: LEVELS, generate: generate, checkAnswer: checkAnswer, rng: rng, MINUS: MINUS };
});
