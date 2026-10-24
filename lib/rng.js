/* Seeded random numbers. Every question on the site is rebuilt from (skill id, seed), so the same
   seed always gives the same question: that is what lets a missed question be asked again later
   without storing it, and what lets the tests re-derive every answer. */
'use strict';
(function () {
  // FNV-1a, 32-bit: turns a string like "math7.percent-of:12" into a seed.
  function hash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function make(seed) {
    const next = mulberry32(typeof seed === 'string' ? hash(seed) : (Number(seed) >>> 0));
    const rng = {
      next,
      /** integer in [a, b], both ends included */
      int(a, b) { return a + Math.floor(next() * (b - a + 1)); },
      /** non-zero integer in [a, b] */
      nz(a, b) { let v; do { v = rng.int(a, b); } while (v === 0); return v; },
      pick(arr) { return arr[Math.floor(next() * arr.length)]; },
      chance(p) { return next() < p; },
      bool() { return next() < 0.5; },
      sign() { return next() < 0.5 ? -1 : 1; },
      /** a shuffled copy */
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
      },
      /** k distinct items */
      sample(arr, k) { return rng.shuffle(arr).slice(0, k); },
      /** a float in [a, b) rounded to `places` decimals */
      dec(a, b, places) { const p = Math.pow(10, places || 1); return Math.round((a + next() * (b - a)) * p) / p; },
    };
    return rng;
  }
  const RNG = { hash, make };
  if (typeof module !== 'undefined') module.exports = RNG;
  if (typeof window !== 'undefined') window.RNG = RNG;
})();
