/* Small helpers that turn numbers into readable HTML: fractions, exponents, roots, polynomials.
   No formula library is loaded, so everything here is plain HTML styled by app.css. */
'use strict';
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  const round = (x, places) => { const p = Math.pow(10, places == null ? 6 : places); return Math.round(x * p) / p; };

  /** "−3", "2.5", "1,250": numbers the way a textbook prints them */
  function n(x, opts) {
    opts = opts || {};
    if (typeof x !== 'number' || !isFinite(x)) return String(x);      // already-rendered HTML passes through
    let s = String(round(Math.abs(x), opts.places == null ? 6 : opts.places));
    if (opts.places != null && opts.fixed) s = round(Math.abs(x), opts.places).toFixed(opts.places);
    if (opts.sep !== false && Math.abs(x) >= 1000) {
      const [whole, frac] = s.split('.');
      s = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (frac ? '.' + frac : '');
    }
    return (x < 0 ? '−' : '') + s;
  }
  /** reduce n/d; the sign goes on the numerator */
  function simp(num, den) {
    if (den < 0) { num = -num; den = -den; }
    const g = gcd(num, den);
    return [num / g, den / g];
  }
  /** a stacked fraction; whole numbers stay whole */
  function frac(num, den, opts) {
    opts = opts || {};
    if (typeof num !== 'number' || typeof den !== 'number') return `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;   // symbolic, e.g. x over 4
    if (!opts.raw) [num, den] = simp(num, den);
    if (den === 1) return n(num);
    const neg = num < 0; num = Math.abs(num);
    return (neg ? '−' : '') + `<span class="frac"><span class="num">${n(num)}</span><span class="den">${n(den)}</span></span>`;
  }
  /** plain-text fraction "−3/4", for answerText and hints that quote an answer */
  function fracText(num, den) {
    [num, den] = simp(num, den);
    return den === 1 ? n(num) : `${n(num)}/${den}`;
  }
  /** improper fraction shown as a mixed number: 7/2 → 3 1/2 */
  function mixed(num, den) {
    [num, den] = simp(num, den);
    if (den === 1) return n(num);
    const neg = num < 0; num = Math.abs(num);
    const w = Math.floor(num / den), r = num % den;
    if (w === 0) return (neg ? '−' : '') + frac(num, den);
    return (neg ? '−' : '') + `${w}<span class="mixed">${frac(r, den)}</span>`;
  }
  const sup = (base, e) => `${base}<sup>${e}</sup>`;
  const sub = (base, e) => `${base}<sub>${e}</sub>`;
  const sqrt = x => `<span class="sqrt">√<span class="rad">${x}</span></span>`;
  const v = name => `<i>${name}</i>`;
  const abs = x => `|${x}|`;
  const times = ' × ', div = ' ÷ ', dot = ' · ';
  /** "3x", "−x", "x²", "5": a coefficient and a variable with an optional power */
  function term(coef, varName, pow) {
    if (coef === 0) return '0';
    const vv = varName ? (pow && pow !== 1 ? sup(v(varName), pow) : v(varName)) : '';
    if (!varName) return n(coef);
    if (coef === 1) return vv;
    if (coef === -1) return '−' + vv;
    return n(coef) + vv;
  }
  /** polynomial from coefficients, highest power first: [2, -3, 1] → 2x² − 3x + 1 */
  function poly(coefs, varName) {
    varName = varName || 'x';
    const deg = coefs.length - 1;
    let out = '';
    coefs.forEach((c, i) => {
      if (c === 0) return;
      const p = deg - i;
      const t = term(Math.abs(c), p > 0 ? varName : '', p);
      if (out === '') out = (c < 0 ? '−' : '') + t;
      else out += (c < 0 ? ' − ' : ' + ') + t;
    });
    return out || '0';
  }
  /** "+ 3" / "− 3" for building expressions piece by piece */
  const signed = x => (x < 0 ? '− ' : '+ ') + n(Math.abs(x));
  const eq = (l, r) => `${l} = ${r}`;
  const money = x => (x < 0 ? '−' : '') + '$' + n(Math.abs(x), { places: 2, fixed: Math.abs(x) % 1 !== 0 });
  const pct = x => n(x) + '%';
  const pt = (x, y) => `(${n(x)}, ${n(y)})`;
  const deg = x => n(x) + '°';
  const units = (x, u) => n(x) + ' ' + u;
  function table(headers, rows, opts) {
    opts = opts || {};
    const th = headers.map(h => `<th>${h}</th>`).join('');
    const tr = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
    return `<table class="mtable${opts.compact ? ' compact' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
  }
  const ordinal = k => k + (['th', 'st', 'nd', 'rd'][(k % 100 > 10 && k % 100 < 14) ? 0 : Math.min(k % 10, 4) % 4] || 'th');
  function list(items, word) {
    word = word || 'and';
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return `${items[0]} ${word} ${items[1]}`;
    return items.slice(0, -1).join(', ') + `, ${word} ` + items[items.length - 1];
  }
  const plural = (k, one, many) => `${n(k)} ${k === 1 ? one : (many || one + 's')}`;
  /** a short piece of code */
  const code = s => `<code>${esc(s)}</code>`;
  /** a code block */
  const pre = s => `<pre class="code">${esc(s)}</pre>`;

  const M = { esc, gcd, round, n, simp, frac, fracText, mixed, sup, sub, sqrt, v, abs, times, div, dot, term, poly, signed, eq, money, pct, pt, deg, units, table, ordinal, list, plural, code, pre };
  if (typeof module !== 'undefined') module.exports = M;
  if (typeof window !== 'undefined') window.M = M;
})();
