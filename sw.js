/* Britland Academy service worker.
   Change VERSION every time the app is updated, so students always get the new files. */
const VERSION = "1.4.2";
const CACHE = 'bl-' + VERSION;
const CORE = ['offline.html', 'img/britland-shield.png', 'img/icons/icon-192.png', 'favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('bl-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'version' && e.source) e.source.postMessage({ version: VERSION }); });

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method === 'GET' && /\/@supabase\/supabase-js@[\d.]+\/dist\/umd\/supabase\.js$/.test(url.href)) {   // sign-in library: kept for offline use
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.status === 200 || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
      return r;
    })));
    return;
  }
  if (req.method !== 'GET' || url.origin !== location.origin) return;           // Supabase, CDN: always the network
  if (/\/audio\//.test(url.pathname) || /\/exam\.html$/.test(url.pathname)) return; // audio and exams: never stored
  const isAsset = /\.(png|jpe?g|svg|webp|woff2?|ico)$/i.test(url.pathname);
  if (isAsset) {                                                                   // images and fonts: cache first
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
      return r;
    })));
    return;
  }
  e.respondWith(fetch(req).then(r => {                                              // pages, scripts, styles: network first
    if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
    return r;
  }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('offline.html') : Response.error()))));
});

/* ---- push notifications ---- */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  const title = d.title || 'Britland Academy';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    list.forEach(c => { if (c.visibilityState === 'visible') c.postMessage({ type: 'bl-roar' }); });
  }).then(() => self.registration.showNotification(title, {
    body: d.body || '', icon: 'img/icons/icon-192.png', badge: 'img/icons/badge-96.png',
    tag: d.tag || undefined, silent: !!d.silent, data: { url: d.url || './' }
  })));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.startsWith(self.registration.scope) && 'focus' in c) { c.navigate(target); return c.focus(); } }
    return self.clients.openWindow(target);
  }));
});
