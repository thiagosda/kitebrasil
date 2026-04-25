// sw.js — KiteInforma Service Worker
const CACHE = 'kiteinforma-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Recebe mensagem do app para disparar notificação
self.addEventListener('message', e => {
  if (e.data?.type === 'NOTIFY') {
    const { title, body } = e.data;
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'kiteinforma-alert',
      renotify: true,
      data: { url: '/' }
    });
  }
});

// Clique na notificação abre o app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin)) return c.focus();
      }
      return clients.openWindow(e.notification.data?.url ?? '/');
    })
  );
});
