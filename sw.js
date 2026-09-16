/* Priyaan Hub service worker: makes the hosted site work offline.
   Strategy: network first (so updates show as soon as you are online), falling back to the cached copy when offline.
   Everything same-origin that has been visited is cached; the app shell below is cached up front on install. */
const VERSION = 'ph-v13';
const SHELL = [
  './', 'index.html', 'shared.css', 'shared.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png',
  'piano.html', 'badges.html', 'badges_catalog.js', 'badges/pdf/manifest.js', 'schedule.html',
  'math.html', 'im1.js', 'hindi.html', 'hindi_data.js', 'quizzes.html', 'cpm_int2_ch1.js', 'calendar.html', 'ai.html', 'grades.js', 'python.html', 'pyquiz.js', 'progress.html', 'review.html', 'search_index.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache =>
    Promise.all(SHELL.map(url => cache.add(url).catch(() => null)))   // a page that does not exist yet is skipped, not fatal
  ).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                      // USSSP workbooks etc. are left alone
  if (/\.pdf$/i.test(url.pathname)) return;                          // never cache big PDFs
  event.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
