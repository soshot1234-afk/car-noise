// 카롱도르 서비스워커 — 오프라인에서도 마지막으로 본 화면을 띄움
const V = 'carro-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k.startsWith('carro-')).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 페이지·데이터: 새 버전 우선, 인터넷이 안 되면 저장본
  if (req.mode === 'navigate' || (url.origin === location.origin && /\.(html|json|webmanifest)$|\/$/.test(url.pathname))) {
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(V).then((c) => c.put(req, cp)); return r; }).catch(() => caches.match(req).then((m) => m || caches.match('./index.html'))));
    return;
  }
  // 차 사진·아이콘: 저장본 우선 (위키미디어 썸네일)
  if (url.hostname === 'upload.wikimedia.org' || (url.origin === location.origin && /\.png$/.test(url.pathname))) {
    e.respondWith(caches.open(V + '-img').then((c) => c.match(req).then((m) => m || fetch(req).then((r) => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }))));
  }
});
