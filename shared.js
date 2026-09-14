/* Priyaan Hub — tiny shared helpers. Every app stores its state as JSON under one localStorage key:
   ph.<app>.v1  and keeps a `summary: { headline, sub }` field up to date so the hub page can show it. */
window.PH = (function () {
  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  var warnedFull = false;
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) {
      console.warn('save failed', e);
      // A silent failure here loses the child's work without a word, so say it once per visit.
      if (!warnedFull) {
        warnedFull = true;
        var full = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
        setTimeout(function () {
          toast(full ? 'This browser is out of space — back up on the hub page, then delete some old items'
                     : 'Could not save: this browser is blocking storage (private window?)', 6000);
        }, 0);
      }
      return false;
    }
  }
  function todayISO(d) {
    d = d || new Date();
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10);
  }
  function addDays(iso, n) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return todayISO(d); }
  function daysBetween(a, b) { return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000); }
  /** Monday of the week containing iso (defaults to today). */
  function mondayOf(iso) { const d = new Date((iso || todayISO()) + 'T00:00:00'); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day); return todayISO(d); }
  function fmtDate(iso, opts) { return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, opts || { weekday: 'short', month: 'short', day: 'numeric' }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  /* Question text from the generators is written as a little HTML: <sup> for exponents, <br> between the
     lines of a system, <em> for emphasis, and &lt; &gt; &times; for symbols. Escaping it wholesale turns
     "x&lt;sup&gt;2&lt;/sup&gt;" into visible tags, so escape everything and then re-allow exactly that list.
     Nothing with an attribute survives, so a payload in saved data still cannot execute. */
  var ALLOWED_TAGS = /&lt;(\/?)(sup|sub|br|em|b|i|strong)&gt;/g;
  var ALLOWED_ENTS = /&amp;(lt|gt|le|ge|ne|amp|nbsp|deg|times|divide|minus|plusmn|#\d{1,5});/g;
  function safeHTML(s) { return esc(s).replace(ALLOWED_TAGS, '<$1$2>').replace(ALLOWED_ENTS, '&$1;'); }
  /** The same text with the markup taken out, for somewhere only plain text fits. */
  function plainText(s) {
    return String(s == null ? '' : s)
      .replace(/<\s*br\s*\/?>/gi, ' ')
      .replace(/<sup>([^<]*)<\/sup>/gi, '^$1')        /* x<sup>2</sup> reads as x2 if the tag just goes */
      .replace(/<sub>([^<]*)<\/sub>/gi, '_$1')
      .replace(/<\/?[a-z][a-z0-9]*[^>]*>/gi, '')
      .replace(/&(lt|gt|le|ge|ne|amp|nbsp|deg|times|divide|minus|plusmn);/gi, function (m, e) {
        return { lt: '<', gt: '>', le: '\u2264', ge: '\u2265', ne: '\u2260', amp: '&', nbsp: ' ',
                 deg: '\u00b0', times: '\u00d7', divide: '\u00f7', minus: '\u2212', plusmn: '\u00b1' }[e.toLowerCase()] || m;
      })
      .replace(/\s+/g, ' ').trim();
  }
  let toastEl, toastTimer;
  function toast(msg, ms) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms || 1800);
  }
  function download(filename, text, type) {
    const blob = new Blob([text], { type: type || 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function pickFile(accept) {
    return new Promise(resolve => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = accept || 'application/json';
      inp.onchange = () => { const f = inp.files[0]; if (!f) return resolve(null); const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsText(f); };
      inp.click();
    });
  }
  /** Simple seeded RNG (mulberry32) so worksheets are reproducible. */
  function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  /** Opens ChatGPT in an ordinary browser tab. It cannot be shown inside the page (chatgpt.com sends
      X-Frame-Options: SAMEORIGIN), and a pop-up window gets blocked, so this clicks a real link instead —
      browsers always allow that when it comes from a click. */
  function chatGPTUrl(prefill) {
    var base = 'https://chatgpt.com/';
    var url = prefill ? base + '?q=' + encodeURIComponent(prefill) : base;
    return url.length > 7500 ? base : url;                   // very long prompts do not survive a URL
  }
  function openChatGPT(prefill) {
    var a = document.createElement('a');
    a.href = chatGPTUrl(prefill);
    a.target = '_blank';
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { a.remove(); }, 0);
    return a.href;
  }
  return { load, save, todayISO, addDays, daysBetween, mondayOf, fmtDate, esc, safeHTML, plainText, uid, toast, download, pickFile, rng, openChatGPT, chatGPTUrl };
})();

/* Offline support on the hosted site: register the service worker (sw.js) and add the web-app manifest + iOS icon so the
   hub can be added to a home screen and opened without internet. Does nothing over file:// (browsers do not allow it there). */
(function () {
  if (!/^https?:$/.test(location.protocol)) return;
  var head = document.head;
  function link(rel, href) { if (!document.querySelector('link[rel="' + rel + '"]')) { var l = document.createElement('link'); l.rel = rel; l.href = href; head.appendChild(l); } }
  link('manifest', 'manifest.webmanifest');
  link('apple-touch-icon', 'apple-touch-icon.png');
  link('icon', 'icon.svg');
  ['mobile-web-app-capable', 'apple-mobile-web-app-capable'].forEach(function (name) {
    if (!document.querySelector('meta[name="' + name + '"]')) { var m = document.createElement('meta'); m.name = name; m.content = 'yes'; head.appendChild(m); }
  });
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      var sw = reg.installing;
      if (sw) sw.addEventListener('statechange', function () {
        if (sw.state === 'activated' && !navigator.serviceWorker.controller && window.PH) PH.toast('Ready to use offline', 2600);
      });
    }).catch(function () { /* offline support is optional */ });
  });
})();
