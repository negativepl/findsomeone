// Custom push notification handler for service worker
// This file is imported by the main service worker

self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push received:', event)

  if (!event.data) {
    console.log('[Service Worker] Push event has no data')
    return
  }

  let data
  try {
    data = event.data.json()
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error)
    return
  }

  const options = {
    body: data.body || 'Masz nowe powiadomienie',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: data.url || '/',
      notificationId: data.notificationId,
    },
    tag: data.tag || 'notification',
    vibrate: [200, 100, 200],
    requireInteraction: false,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'FindSomeone', options)
  )
})

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification clicked:', event)

  event.notification.close()

  // Navigate to the URL when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      const url = event.notification.data.url || '/'

      // Check if there's already a window/tab open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }

      // Open a new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

console.log('[Service Worker] Push notification handler loaded')
