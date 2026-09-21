const CACHE_NAME = 'expedienteqx-pacientes-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icono-192.png',
  './icono-512.png'
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

// Network-first para el shell de la app: si hay internet, SIEMPRE trae la versión
// mas reciente del servidor (y actualiza la copia local). Si falla por estar
// offline, entonces sirve la ultima copia guardada, para que la app siga
// funcionando sin conexion.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isAppShell = ASSETS.some((a) => url.pathname.endsWith(a.replace('./', '/')));

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
  // Si no es del app shell (Supabase, fuentes, tesseract.js, etc.), va directo a la red.
});
