/**
 * Service Worker لنظام إدارة العيادة
 */

const CACHE_NAME = 'clinic-system-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/assets/css/main.css',
  '/assets/css/responsive.css',
  '/assets/css/themes.css',
  '/assets/fonts/arabic-fonts.css',
  '/assets/js/core/database.js',
  '/assets/js/core/auth.js',
  '/assets/js/core/ui.js',
  '/app.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// التثبيت
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// التنشيط
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع الملف المخبأ إذا كان موجوداً
        if (response) {
          return response;
        }

        // استدعاء الشبكة
        return fetch(event.request)
          .then(response => {
            // التحقق من أن الاستجابة صالحة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // استنساخ الاستجابة
            const responseToCache = response.clone();

            // تخزين في الكاش
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // عرض صفحة عدم الاتصال
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// الاستلام من Push
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: 'assets/images/icons/icon-192x192.png',
    badge: 'assets/images/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    }
  };

  event.waitUntil(
    self.registration.showNotification('نظام العيادة', options)
  );
});

// النقر على الإشعار
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// المزامنة في الخلفية
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// مزامنة البيانات
async function syncData() {
  try {
    const pendingData = await getPendingData();
    
    for (const data of pendingData) {
      await sendToServer(data);
      await markAsSynced(data.id);
    }
    
    console.log('تمت مزامنة البيانات بنجاح');
  } catch (error) {
    console.error('خطأ في مزامنة البيانات:', error);
  }
}

// الحصول على البيانات المعلقة
async function getPendingData() {
  // الحصول من IndexedDB أو LocalStorage
  return [];
}

// إرسال للخادم
async function sendToServer(data) {
  // إرسال البيانات للخادم
}

// تعليم البيانات كمزامنة
async function markAsSynced(id) {
  // تحديث حالة البيانات
}
