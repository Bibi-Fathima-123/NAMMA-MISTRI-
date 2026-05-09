self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  // Pass-through for now, required for 'installable' status
  e.respondWith(fetch(e.request));
});
