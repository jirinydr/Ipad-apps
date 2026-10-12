// Offline pro rozcestník a všechny nové aplikace (Písmenka mají vlastní service worker).
// Při připojení se stránky vždy načtou nové (network-first), offline se použije uložená kopie.
// Po změně souborů zvyš číslo verze.
const CACHE = 'ucime-se-v1';
const APPS = ['prvni-pismeno', 'poslouchej', 'spojovacka', 'skladani-slov', 'slabiky'];
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png',
  './shared/common.css', './shared/common.js', './shared/psaci.ttf',
  ...APPS.flatMap(a => ['./' + a + '/', './' + a + '/index.html'])];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: 'reload'})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('ucime-se-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.pathname.includes('/pismenka-ipad/')) return;          // o Písmenka se stará jejich vlastní worker
  const isPage = e.request.mode === 'navigate' || e.request.destination === 'document';
  e.respondWith(caches.open(CACHE).then(async c => {
    if (isPage) {
      try {
        const r = await fetch(e.request, {cache: 'no-store'});
        if (r && r.ok) c.put(e.request, r.clone());
        return r;
      } catch (err) {
        return (await c.match(e.request, {ignoreSearch: true})) || (await c.match('./index.html')) || Response.error();
      }
    }
    const hit = await c.match(e.request, {ignoreSearch: true});
    const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || Response.error();
  }));
});
