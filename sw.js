const CACHE_NAME = 'expedienteqx-pacientes-v6';
const APP_ASSETS = [
  './index.html',
  './manifest.json',
  './icono-192.png',
  './icono-512.png'
];

// Dependencias externas que la app necesita para arrancar. Se guardan en caché
// cuando el dispositivo tiene conexión para que una sesión posterior pueda
// abrir la aplicación aunque lleve días sin conectarse.
const RUNTIME_URLS = [
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
  'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_ASSETS);
    // No hacemos fallar la instalación si un recurso externo no está disponible
    // en ese momento; se intentará guardar cuando vuelva a solicitarse online.
    await Promise.allSettled(RUNTIME_URLS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) await cache.put(url, response.clone());
      } catch (_) {}
    }));
  })());
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isAppAsset = APP_ASSETS.some((a) => url.pathname.endsWith(a.replace('./', '/')));
  const isRuntimeDependency = RUNTIME_URLS.includes(url.href);

  // HTML/app shell: primero intenta la red para actualizar; si no hay red,
  // utiliza la última versión guardada localmente.
  if (isAppAsset || (isSameOrigin && event.request.mode === 'navigate')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Librerías/fuentes externas: cache-first. Una vez descargadas, siguen
  // disponibles aunque el dispositivo permanezca offline varios días.
  if (isRuntimeDependency || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
  }
});
