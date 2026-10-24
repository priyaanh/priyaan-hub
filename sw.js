/* Offline support: network first, falling back to the last copy seen. Bump VERSION when files change shape. */
const VERSION = 'procademy-v2';
const SHELL = ['./', './index.html', './app.css', './icon.svg', './manifest.webmanifest',
  './lib/rng.js', './lib/math.js', './lib/content.js', './lib/store.js', './lib/engine.js', './lib/views.js', './lib/cpm-views.js', './lib/tutor.js', './lib/tutor-ui.js', './lib/app.js',
  './content/k.js', './content/g1.js', './content/g2.js', './content/g3.js', './content/g4.js', './content/g5.js', './content/g6.js', './content/math7.js', './content/math8.js', './content/alg1.js', './content/geo.js', './content/alg2.js', './content/precalc.js', './content/int1.js', './content/int2.js', './content/int3.js', './cpm/cc1.js', './cpm/cc2.js', './cpm/cc3.js', './cpm/int1.js', './cpm/int2.js', './cpm/int3.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
