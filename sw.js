const CACHE_NAME = 'expedienteqx-pacientes-v1';
const ASSETS = [
  './registro-pacientes.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first para el shell de la app (HTML/manifest/íconos).
// Todo lo demás (Supabase, fuentes, CDN de supabase-js) pasa directo a la red;
// si falla por estar offline, la app sigue funcionando con los datos locales (IndexedDB).
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isAppShell = ASSETS.some((a) => url.pathname.endsWith(a.replace('./', '/')));

  if (isAppShell) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // Si no es del app shell, no interceptamos: se va directo a la red (Supabase, fuentes, etc).
});
