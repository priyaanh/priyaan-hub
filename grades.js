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
  var NAMES = ['Priyaan', 'Maya', 'Arjun', 'Sofia', 'Liam', 'Nina', 'Diego', 'Aisha', 'Noah', 'Leena'];
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
        var k = ri(r, 1, 3);
        var list = set.join(', ');
        if (k === 1) {
          var sum = set.reduce(function (a, b) { return a + b; }, 0);
          while (sum % n !== 0) { set[0] += 1; sum = set.reduce(function (a, b) { return a + b; }, 0); }   // keep the mean whole
          list = set.join(', ');
          return P('Find the mean of: ' + list, String(sum / n), [], 'Sum = ' + sum + ', then ÷ ' + n + '.');
        }
        if (k === 2) return P('Find the median of: ' + list, String(sorted[(n - 1) / 2]), [], 'In order: ' + sorted.join(', ') + '. The middle value is ' + sorted[(n - 1) / 2] + '.');
        return P('Find the range of: ' + list, String(sorted[n - 1] - sorted[0]), [], 'Largest ' + sorted[n - 1] + ' − smallest ' + sorted[0] + '.');
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
          (b < 0 ? 'Add ' + Math.abs(b) : 'Subtract ' + b) + ' from both sides, then divide by ' + num(a) + '.');
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
        var eq = function (p, q, rhs) { return term(p, 'x') + (q < 0 ? ' ' + MINUS + ' ' + Math.abs(q) : ' + ' + q) + 'y = ' + num(rhs); };
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

  var LEVELS = [
    { id: '6', name: 'Grade 6', sub: 'Ratios, fractions, decimals, early algebra', topics: G6 },
    { id: '7', name: 'Grade 7', sub: 'Rationals, proportions, percents, geometry, probability', topics: G7 },
    { id: '8', name: 'Grade 8', sub: 'Exponents, linear equations, Pythagoras, functions', topics: G8 }
  ];
  var BY_ID = {}; LEVELS.forEach(function (g) { BY_ID[g.id] = g; });

  function generate(opts) {
    opts = opts || {};
    var grade = BY_ID[String(opts.grade)] || LEVELS[1];
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
      .replace(/^[a-z]=/, '').replace(/^\(|\)$/g, '').replace(/[$,]/g, '');
  }
  function checkAnswer(p, typed) {
    if (!p || typed == null || String(typed).trim() === '') return false;
    var want = [p.answer].concat(p.accept || []).map(norm);
    var got = norm(typed);
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
