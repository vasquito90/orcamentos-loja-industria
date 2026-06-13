// Service worker — Gerador de Orçamentos Loja Indústria
const VERSION = 'v31.5';
const CACHE = 'orc-loja-industria-' + VERSION;
const ASSETS = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept')||'').includes('text/html');
  if (isHTML) {
    // network-first: apanha atualizacoes assim que o ficheiro muda
    e.respondWith(
      fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
  } else {
    // cache-first para o resto (fontes, icones)
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res;
      }).catch(() => r))
    );
  }
});
