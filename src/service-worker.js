// Simple offline service worker compatible with module-style loading.

const offlineFallbackResponse = new Response(
  `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Offline</title>
      <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; background: #f8fafc; color: #111; }
        h1 { margin: 0 0 1rem; font-size: 1.75rem; }
        p { margin: 0; max-width: 36rem; line-height: 1.6; }
      </style>
    </head>
    <body>
      <h1>Offline</h1>
      <p>You are currently offline. Reconnect to load the app again.</p>
    </body>
  </html>`,
  { headers: { 'Content-Type': 'text/html' } }
);

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') {
    return;
  }

  event.respondWith((async () => {
    try {
      const preloadResponse = await event.preloadResponse;
      if (preloadResponse) {
        return preloadResponse;
      }

      return await fetch(event.request);
    } catch {
      return offlineFallbackResponse;
    }
  })());
});