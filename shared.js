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
  /* The generators also mark an aside in a question -- "(gustar)", "(e→ie)" -- with one known span. */
  var ALLOWED_CUE = /&lt;span class=&quot;cue&quot;&gt;([\s\S]*?)&lt;\/span&gt;/g;
  var ALLOWED_ENTS = /&amp;(lt|gt|le|ge|ne|amp|nbsp|deg|times|divide|minus|plusmn|#\d{1,5});/g;
  function safeHTML(s) { return esc(s).replace(ALLOWED_TAGS, '<$1$2>').replace(ALLOWED_CUE, '<span class="cue">$1</span>').replace(ALLOWED_ENTS, '&$1;'); }
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
  /* Secrets stay on the device they were typed on: never in a backup file, never synced.
     One list, so every page that copies data agrees about what must not be copied. An email address is
     on that list too. It is not a secret in the way an API key is, but it identifies a real person, and a
     backup file gets passed around: keeping it here means a copy of this hub can never carry someone's
     address to anyone else. Nothing on this site sends it anywhere either -- there is no server to send
     it to. Whoever types an address is the only one who ever sees it. */
  var SECRET_KEY = /^ph\.(ai\.key|sync\.token|email)/;
  function isSecretKey(k) { return SECRET_KEY.test(String(k || '')); }
  /** Everything this hub has saved, minus the secrets. */
  function exportable() {
    var out = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('ph.') === 0 && !isSecretKey(k)) out[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return out;
  }

  /* ---- whose hub this is ------------------------------------------------------------------------
     Nobody's name is baked into the pages. They carry a neutral "Practice Hub", and whatever name is
     saved here replaces it everywhere: titles, the hub heading, and the footer of anything printed. */
  var NAME_KEY = 'ph.name';
  function person() {
    try { var v = localStorage.getItem(NAME_KEY); return typeof v === 'string' ? v.trim().slice(0, 40) : ''; }
    catch (e) { return ''; }
  }
  function setPerson(v) {
    var name = String(v == null ? '' : v).trim().slice(0, 40);
    try { name ? localStorage.setItem(NAME_KEY, name) : localStorage.removeItem(NAME_KEY); } catch (e) {}
    applyName();
    document.dispatchEvent(new CustomEvent('ph:name', { detail: { name: name } }));
    return name;
  }
  var GENERIC_HUB = 'Practice Hub';
  function hubName() { var p = person(); return p ? p + '\u2019s Hub' : GENERIC_HUB; }
  /** Put the name wherever the page marked a slot for it, and into the tab title. */
  function applyName() {
    var hub = hubName(), who = person();
    if (document.title.indexOf(GENERIC_HUB) >= 0 || document.title.indexOf('\u2019s Hub') >= 0)
      document.title = document.title.replace(/[^·]*\u2019s Hub|Practice Hub/, hub);
    var slots = document.querySelectorAll('[data-ph]');
    for (var i = 0; i < slots.length; i++) {
      var k = slots[i].getAttribute('data-ph');
      if (k === 'hub') slots[i].textContent = hub;
      else if (k === 'name') slots[i].textContent = who;
      /* "Priyaan\u2019s " or nothing, so a heading reads right either way */
      else if (k === 'possessive') slots[i].textContent = who ? who + '\u2019s ' : '';
    }
  }

  /* ---- your email address -----------------------------------------------------------------------
     Optional, and only ever your own: it is what a printed sheet is labelled with when a teacher asks for
     one, nothing more. Kept out of exports and sync by SECRET_KEY above. Never type someone else's here. */
  var EMAIL_KEY = 'ph.email';
  /* Deliberately loose. The point is to catch a typo, not to police which addresses exist. */
  var EMAIL_RE = /^[^\s@,;:<>"'()\[\]\\]+@[^\s@,;:<>"'()\[\]\\]+\.[A-Za-z]{2,}$/;
  function validEmail(v) { var t = String(v == null ? '' : v).trim(); return t.length <= 120 && EMAIL_RE.test(t); }
  function personEmail() {
    try { var v = localStorage.getItem(EMAIL_KEY); return validEmail(v) ? String(v).trim() : ''; }
    catch (e) { return ''; }
  }
  /** Saves it and returns what was saved; returns null, saving nothing, if it is not an address. */
  function setPersonEmail(v) {
    var t = String(v == null ? '' : v).trim();
    if (t && !validEmail(t)) return null;
    try { t ? localStorage.setItem(EMAIL_KEY, t) : localStorage.removeItem(EMAIL_KEY); } catch (e) {}
    document.dispatchEvent(new CustomEvent('ph:email', { detail: { email: t } }));
    return t;
  }

  /* ---- which year at school ---------------------------------------------------------------------
     Optional, and used for one thing: it picks the grade the practice page opens on, so nobody has to
     choose it every time. Not a secret, so it travels in a backup like the rest of the settings. */
  var GRADE_KEY = 'ph.grade';
  var GRADES_LIST = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
  function schoolYear() {
    try { var v = localStorage.getItem(GRADE_KEY); return GRADES_LIST.indexOf(v) >= 0 ? v : ''; }
    catch (e) { return ''; }
  }
  function setSchoolYear(v) {
    var g = GRADES_LIST.indexOf(String(v)) >= 0 ? String(v) : '';
    try { g ? localStorage.setItem(GRADE_KEY, g) : localStorage.removeItem(GRADE_KEY); } catch (e) {}
    document.dispatchEvent(new CustomEvent('ph:grade', { detail: { grade: g } }));
    return g;
  }

  /* ---- themes ----------------------------------------------------------------------------------
     One stored choice for the whole site. "system" follows the device and keeps following it, so a
     phone that dims at sunset dims the hub too. Everything else is resolved once and pinned. */
  var THEMES = [
    { id: 'system',   name: 'Match my device', emoji: '\u{1F317}' },
    { id: 'light',    name: 'Light',           emoji: '\u2600\ufe0f' },
    { id: 'slate',    name: 'Slate',           emoji: '\u{1FAA8}' },
    { id: 'paper',    name: 'Paper',           emoji: '\u{1F4DC}' },
    { id: 'dark',     name: 'Dark',            emoji: '\u{1F319}' },
    { id: 'ink',      name: 'Ink',             emoji: '\u{1F58B}\ufe0f' },
    { id: 'midnight', name: 'Midnight',        emoji: '\u{1F30C}' },
    { id: 'dusk',     name: 'Dusk',            emoji: '\u{1F311}' },
    { id: 'forest',   name: 'Forest',          emoji: '\u{1F332}' },
    { id: 'contrast', name: 'High contrast',   emoji: '\u25D0' }
  ];
  var THEME_KEY = 'ph.theme';
  function themeChoice() {
    try { var v = localStorage.getItem(THEME_KEY); return THEMES.some(function (t) { return t.id === v; }) ? v : 'system'; }
    catch (e) { return 'system'; }
  }
  function prefersDark() {
    try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; }
  }
  function applyTheme(choice) {
    var resolved = choice === 'system' ? (prefersDark() ? 'dark' : 'light') : choice;
    document.documentElement.setAttribute('data-theme', resolved);
    return resolved;
  }
  function setTheme(choice) {
    if (!THEMES.some(function (t) { return t.id === choice; })) choice = 'system';
    try { localStorage.setItem(THEME_KEY, choice); } catch (e) { /* a private window still themes this visit */ }
    applyTheme(choice);
    document.dispatchEvent(new CustomEvent('ph:theme', { detail: { choice: choice } }));
  }
  applyTheme(themeChoice());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyName); else applyName();
  /* keep following the device while the choice is "system" */
  try {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () { if (themeChoice() === 'system') applyTheme('system'); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  } catch (e) { /* older browser: the page is still themed, it just will not follow along */ }
  /* another tab changed it */
  window.addEventListener('storage', function (e) {
    if (e.key === THEME_KEY) applyTheme(themeChoice());
    if (e.key === NAME_KEY) applyName();
  });

  return { load, save, todayISO, addDays, daysBetween, mondayOf, fmtDate, esc, safeHTML, plainText, uid, toast, download, pickFile, rng, openChatGPT, chatGPTUrl,
    THEMES: THEMES, themeChoice: themeChoice, setTheme: setTheme,
    person: person, setPerson: setPerson, hubName: hubName, applyName: applyName,
    personEmail: personEmail, setPersonEmail: setPersonEmail, validEmail: validEmail,
    schoolYear: schoolYear, setSchoolYear: setSchoolYear, GRADES_LIST: GRADES_LIST,
    isSecretKey: isSecretKey, exportable: exportable };
})();

/* A palette button in every page's top bar. Built here rather than in each page so all twelve get it,
   and so the markup stays in one place. */
(function () {
  var bar = document.querySelector('.topbar .inner');
  if (!bar || document.getElementById('themeBtn')) return;
  var wrap = document.createElement('div');
  wrap.className = 'theme-wrap no-print';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-sm btn-icon';
  btn.id = 'themeBtn';
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');
  btn.title = 'Change the colours';
  var menu = document.createElement('div');
  menu.className = 'theme-menu';
  menu.id = 'themeMenu';
  menu.hidden = true;
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Colour theme');

  function label() {
    var cur = PH.themeChoice();
    var t = PH.THEMES.filter(function (x) { return x.id === cur; })[0] || PH.THEMES[0];
    btn.textContent = t.emoji;
    btn.setAttribute('aria-label', 'Colour theme: ' + t.name + '. Change it');
  }
  function draw() {
    var cur = PH.themeChoice();
    menu.innerHTML = PH.THEMES.map(function (t) {
      return '<button type="button" role="menuitemradio" class="theme-opt' + (t.id === cur ? ' on' : '') + '"' +
        ' data-theme-id="' + t.id + '" aria-checked="' + (t.id === cur ? 'true' : 'false') + '">' +
        '<span class="sw" aria-hidden="true" data-swatch="' + t.id + '"></span>' +
        '<span class="nm">' + PH.esc(t.name) + '</span>' +
        '<span class="tick" aria-hidden="true">' + (t.id === cur ? '✓' : '') + '</span></button>';
    }).join('');
    label();
  }
  function open(yes) {
    menu.hidden = !yes;
    btn.setAttribute('aria-expanded', yes ? 'true' : 'false');
    if (yes) { draw(); var first = menu.querySelector('.theme-opt.on') || menu.querySelector('.theme-opt'); if (first) first.focus(); }
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); open(menu.hidden); });
  menu.addEventListener('click', function (e) {
    var opt = e.target.closest('[data-theme-id]');
    if (!opt) return;
    PH.setTheme(opt.getAttribute('data-theme-id'));
    draw();
    open(false);
    btn.focus();
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.theme-wrap')) open(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); }
  });
  wrap.appendChild(btn);
  wrap.appendChild(menu);
  var spacer = bar.querySelector('.spacer');
  if (spacer && spacer.nextSibling) bar.insertBefore(wrap, spacer.nextSibling);
  else bar.appendChild(wrap);
  draw();
})();

/* A name button beside it, so the person whose hub this is can put their name in from any page rather
   than only from the hub. One control, built here, shared by all thirteen pages. */
(function () {
  var bar = document.querySelector('.topbar .inner');
  if (!bar || document.getElementById('whoBtn')) return;
  var wrap = document.createElement('div');
  wrap.className = 'who-wrap no-print';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-sm btn-ghost';
  btn.id = 'whoBtn';
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span class="who-face" aria-hidden="true">👤</span><span class="who-lbl"></span>';
  var menu = document.createElement('div');
  menu.className = 'who-menu';
  menu.id = 'whoMenu';
  menu.hidden = true;
  menu.innerHTML =
    '<label for="whoIn">Your name</label>' +
    '<input class="input" id="whoIn" maxlength="40" autocomplete="given-name" spellcheck="false" placeholder="Your name">' +
    '<label for="whoEmail">Your email <span class="opt">(optional)</span></label>' +
    '<input class="input" id="whoEmail" type="email" maxlength="120" autocomplete="email" spellcheck="false" placeholder="you@example.com" aria-describedby="whoErr">' +
    '<p class="hint" id="whoErr" role="status"></p>' +
    '<p class="hint">Your own name and address, nobody else\u2019s. They stay in this browser, are left out of backups, and are never sent anywhere.</p>' +
    '<div class="row"><button type="button" class="btn btn-sm btn-primary" id="whoSave">Save</button>' +
    '<button type="button" class="btn btn-sm btn-ghost" id="whoClear">Clear</button></div>';

  /* First name only on the button: a top bar has room for one word, not for "Firstname Lastname". */
  function label() {
    var who = PH.person();
    var short = who ? who.split(/\s+/)[0] : '';
    btn.querySelector('.who-lbl').textContent = short || 'Add your name';
    btn.className = 'btn btn-sm btn-ghost' + (who ? '' : ' unset');
    btn.setAttribute('aria-label', who ? 'Your name: ' + who + '. Change it' : 'Add your name');
    btn.title = btn.getAttribute('aria-label');
  }
  function open(yes) {
    menu.hidden = !yes;
    btn.setAttribute('aria-expanded', yes ? 'true' : 'false');
    if (yes) {
      var input = menu.querySelector('#whoIn');
      input.value = PH.person();
      menu.querySelector('#whoEmail').value = PH.personEmail();
      menu.querySelector('#whoErr').textContent = '';
      menu.querySelector('#whoClear').disabled = !PH.person() && !PH.personEmail();
      input.focus();
      input.select();
    }
  }
  function save() {
    var mail = menu.querySelector('#whoEmail');
    /* a typo in an address is worth catching before it ends up on a printed sheet */
    if (PH.setPersonEmail(mail.value) === null) {
      menu.querySelector('#whoErr').textContent = 'That does not look like an email address.';
      mail.focus();
      mail.select();
      return;
    }
    var set = PH.setPerson(menu.querySelector('#whoIn').value);
    open(false);
    btn.focus();
    PH.toast(set ? 'Hello, ' + set : 'Saved');
  }
  btn.addEventListener('click', function (e) { e.stopPropagation(); open(menu.hidden); });
  menu.addEventListener('click', function (e) { e.stopPropagation(); });
  menu.querySelector('#whoSave').addEventListener('click', save);
  menu.querySelector('#whoClear').addEventListener('click', function () {
    menu.querySelector('#whoIn').value = '';
    menu.querySelector('#whoEmail').value = '';
    save();
  });
  /* Enter saves: the input is not in a form, because a top bar sits inside whatever the page already has. */
  ['#whoIn', '#whoEmail'].forEach(function (sel) {
    menu.querySelector(sel).addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.who-wrap')) open(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); }
  });
  /* the hub and the profile page have their own name field; keep the button in step with them */
  document.addEventListener('ph:name', label);
  wrap.appendChild(btn);
  wrap.appendChild(menu);
  var spacer = bar.querySelector('.spacer');
  if (spacer && spacer.nextSibling) bar.insertBefore(wrap, spacer.nextSibling);
  else bar.appendChild(wrap);
  label();
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
