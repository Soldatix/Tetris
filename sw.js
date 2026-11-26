const CACHE_NAME = "modern-tetris-2026-11-26-seo-offline-v9";
const APP_ENTRY = new URL('./', self.location.href).href;
const APP_PATH = new URL(APP_ENTRY).pathname;
const LEGACY_PATH = new URL('index.html', APP_ENTRY).pathname;
const entryRequest = () => new Request(APP_ENTRY, { cache: 'reload', redirect: 'error' });
const cachedEntry = async () => (await caches.open(CACHE_NAME)).match(APP_ENTRY);
async function navigationNetworkFirst(request) {
  let response;
  try { response = await fetch(request); }
  catch { return (await cachedEntry()) || Response.error(); }
  if (!response.ok && response.type !== 'opaqueredirect') return (await cachedEntry()) || response;
  if (response.ok && !response.redirected && response.url === APP_ENTRY &&
      (response.headers.get('content-type') || '').toLowerCase().includes('text/html')) {
    try { await (await caches.open(CACHE_NAME)).put(APP_ENTRY, response.clone()); } catch {}
  }
  return response;
}
const CORE_ASSETS = [
  entryRequest(),
  "./manifest.webmanifest",
  "./ag-language-menu.css",
  "./ag-language-menu.js",
  "./tetris-safe-ui.js",
  "./tetris-safe-pwa.js",
  "./tetris-adsterra-loader.js",
  "./icons/tetris-192.png",
  "./icons/tetris-512.png"
];

self.addEventListener("install",(event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate",(event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch",(event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (url.pathname !== APP_PATH && url.pathname !== LEGACY_PATH) return;
    event.respondWith(navigationNetworkFirst(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request,response.clone()));
      return response;
    }))
  );
});
