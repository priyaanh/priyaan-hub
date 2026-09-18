/* choices.js — turns a generated question into a pick-one question.
   Works in the browser (window.PH_CHOICES) and in Node (require('./choices.js')). No dependencies.

     PH_CHOICES.build(items, pool, seed)

   `items` are {from, answer, choices?} — anything that already has choices is left alone.
   `pool` is a flat list of {from, answer} gathered by the caller from a SECOND, larger draw of the same
   generator with a seed of its own. The wrong options are real answers to other questions of the same
   topic and the same shape, which is what makes them plausible: other verb forms beside a verb form,
   other fractions beside a fraction, a near miss beside a number. Where nothing of the same shape turns
   up, words pair with words and numbers with numbers rather than an option being invented, because an
   invented word gives the answer away.

   Deterministic: the same items, pool and seed always give the same options in the same order, so a
   round can be asked again exactly as it was. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PH_CHOICES = factory();
})(this, function () {
  'use strict';

  function rng(seed) {
    var a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function key(s) { return String(s == null ? '' : s).replace(/<[^>]+>/g, '').toLowerCase().replace(/\s+/g, ' ').trim(); }
  var MINUS = /[−–—]/g;

  /* What KIND of answer this is. Wrong options have to be the same kind as the right one, or the
     question answers itself: a number beside three equations is not a choice, it is a giveaway. */
  function shapeOf(a) {
    var t = key(a).replace(MINUS, '-');
    if (/^-?\d+(\.\d+)?$/.test(t)) return 'num';
    if (/^-?\d+\/\d+$/.test(t)) return 'frac';
    if (/^-?\$/.test(t)) return 'money';
    if (/%$/.test(t)) return 'percent';
    if (/^\(.*,.*\)$/.test(t)) return 'point';
    if (/^\{.*\}$/.test(t)) return 'set';
    var eq = t.match(/^([a-z][a-z0-9()]*)\s*(=|<=|>=|<|>)/);
    if (eq) return 'eq:' + eq[1] + eq[2];
    return 'text:' + Math.min(4, t.split(' ').length);
  }
  /* Coarser than the shape: words with words, numbers with numbers. Used only when nothing of exactly
     the same shape turned up, so a lone answer still gets three plausible neighbours rather than none. */
  function classOf(shape) {
    if (shape === 'num' || shape === 'frac' || shape === 'money' || shape === 'percent') return 'num';
    return shape.indexOf('text:') === 0 ? 'text' : shape;
  }
  function numOf(a) {
    var t = key(a).replace(MINUS, '-').replace(/[$,%]/g, '');
    var fr = t.match(/^(-?\d+)\/(\d+)$/);
    if (fr) return Number(fr[1]) / Number(fr[2]);
    return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
  }
  /* Rebuilt from the number rather than patched into the text, so "−$3.00" becomes "−$5.00", never "−$−5". */
  function reformat(sample, value) {
    var src = String(sample);
    var minus = src.indexOf('−') >= 0 ? '−' : '-';
    var dec = (src.match(/\d+\.(\d+)/) || ['', ''])[1].length;
    var abs = Math.abs(value);
    var body = dec ? abs.toFixed(dec) : String(Math.round(abs * 1000) / 1000);
    if (/\$/.test(src)) body = '$' + body;
    if (/%$/.test(src)) body = body + '%';
    return (value < 0 ? minus : '') + body;
  }
  function nudge(ans, n) {
    var deltas = [1, -1, 2, -2, 3, -3, 10, -10];
    var d = deltas[n % deltas.length];
    var fr = key(ans).replace(MINUS, '-').match(/^(-?\d+)\/(\d+)$/);
    if (fr) {
      var top = Number(fr[1]) + d;
      return (top < 0 ? (String(ans).indexOf('−') >= 0 ? '−' : '-') : '') + Math.abs(top) + '/' + fr[2];
    }
    var v = numOf(ans);
    if (v !== null) return reformat(ans, Number.isInteger(v) ? v + d : Math.round((v + d) * 100) / 100);
    return String(ans) + ['s', 'es', 'n', 'o'][n % 4];
  }

  /* Some generators write the options into the question itself and expect the letter back --
     "(a) ... <br>(b) ...". Those are already multiple choice; lift them out so they are shown as
     buttons rather than asking for a letter that would clash with the A/B/C/D beside it. */
  function liftLettered(it) {
    if (it.choices || !/^[a-e]$/i.test(key(it.answer))) return null;
    var parts = String(it.q == null ? it.question : it.q).split(/<br\s*\/?>/i);
    var opts = [], labels = [], stem = [];
    parts.forEach(function (seg) {
      var m = seg.match(/^\s*\(([a-e])\)\s*([\s\S]+)$/i);
      if (m) { labels.push(m[1].toLowerCase()); opts.push(m[2].trim()); }
      else if (!opts.length) stem.push(seg);
    });
    if (opts.length < 2) return null;
    var at = labels.indexOf(key(it.answer));
    if (at < 0) return null;
    var out = {};
    Object.keys(it).forEach(function (k) { out[k] = it[k]; });
    var stemText = stem.join('<br>').trim();
    if (out.q != null) out.q = stemText; else out.question = stemText;
    out.choices = opts; out.correct = at; out.answer = opts[at];
    out.check = function (typed, pick) { return pick === at; };
    return out;
  }

  /* What counts as "the same kind of question". Defaults to the topic it came from, but a page can set
     `group` to something finer: Spanish vocabulary asked into English and into Spanish are one topic and
     two very different sets of answers, and mixing them would make the right one obvious. */
  function groupOf(it) { return String(it.group || it.from || ''); }
  function poolBy(pool) {
    var by = {};
    (pool || []).forEach(function (it) {
      var shape = shapeOf(it.answer);
      [shape + '|' + groupOf(it), shape + '|*', classOf(shape) + '|~'].forEach(function (k) {
        (by[k] = by[k] || []).push(String(it.answer));
      });
    });
    return by;
  }

  function build(items, pool, seed) {
    var by = poolBy(pool);
    var base = Math.abs(Math.floor(Number(seed) || 1)) % 4294967296;
    return items.map(function (it0, idx) {
      var lifted = liftLettered(it0);
      var it = lifted || it0;
      if (it.choices && it.choices.length >= 2) return it;
      var r = rng((base + idx * 131) % 4294967296);
      var right = key(it.answer), shape = shapeOf(it.answer), target = numOf(it.answer);
      var seen = {}; seen[right] = 1;
      var opts = [];
      var take = function (list) {
        var cands = (list || []).filter(function (c) { var k = key(c); return k && !seen[k]; });
        /* for numbers, near misses make a real question; anything else is a giveaway */
        if (target !== null) cands.sort(function (a, b) {
          return Math.abs((numOf(a) == null ? 1e9 : numOf(a)) - target) - Math.abs((numOf(b) == null ? 1e9 : numOf(b)) - target);
        });
        else for (var i = cands.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = cands[i]; cands[i] = cands[j]; cands[j] = t; }
        cands.forEach(function (c) { var k = key(c); if (opts.length < 3 && !seen[k]) { seen[k] = 1; opts.push(String(c)); } });
      };
      take(by[shape + '|' + groupOf(it)]);
      if (opts.length < 3) take(by[shape + '|*']);
      if (!opts.length) take(by[classOf(shape) + '|~']);
      /* Made-up options are only honest for numbers, where a near miss is a real wrong answer.
         Inventing a word would be a giveaway, so a short question gets three options, or two. */
      if (target !== null || shape === 'frac') {
        var n = 0;
        while (opts.length < 3 && n < 16) { var c = nudge(it.answer, n++); var k2 = key(c); if (!seen[k2]) { seen[k2] = 1; opts.push(c); } }
      }
      if (!opts.length) return it;                       /* nothing plausible to offer: ask for it typed */
      var choices = opts.concat([String(it.answer)]);
      for (var i2 = choices.length - 1; i2 > 0; i2--) { var j2 = Math.floor(r() * (i2 + 1)); var t2 = choices[i2]; choices[i2] = choices[j2]; choices[j2] = t2; }
      var at = choices.map(key).indexOf(right);
      var out = {};
      Object.keys(it).forEach(function (k) { out[k] = it[k]; });
      out.choices = choices; out.correct = at;
      out.check = function (typed, pick) { return pick === at; };
      return out;
    });
  }

  return { build: build, shapeOf: shapeOf, classOf: classOf, groupOf: groupOf, numOf: numOf, nudge: nudge,
    liftLettered: liftLettered, answerKey: key, rng: rng };
});
