// Custom push notification handler for service worker
// This file is imported by the main service worker

self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push received:', event)
  console.log('[Service Worker] Push data:', event.data)

  if (!event.data) {
    console.log('[Service Worker] Push event has no data')
    return
  }

  // Try different methods to read data
  console.log('[Service Worker] Trying to read data...')
  console.log('[Service Worker] data.text():', event.data.text ? 'available' : 'not available')
  console.log('[Service Worker] data.json():', event.data.json ? 'available' : 'not available')

  let data
  try {
    const text = event.data.text()
    console.log('[Service Worker] Raw text:', text)
    data = JSON.parse(text)
    console.log('[Service Worker] Parsed data:', data)
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error)
    console.log('[Service Worker] Trying json() method...')
    try {
      data = event.data.json()
      console.log('[Service Worker] Data from json():', data)
    } catch (error2) {
      console.error('[Service Worker] json() also failed:', error2)
      return
    }
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
