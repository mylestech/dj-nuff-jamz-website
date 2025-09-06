// DJ Nuff Jamz Entertainment - Service Worker
// Performance optimization and caching strategy

const CACHE_NAME = 'djnuffjamz-v1.0.2';
const STATIC_CACHE = 'djnuffjamz-static-v3';
const DYNAMIC_CACHE = 'djnuffjamz-dynamic-v3';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/css/style.css',
    '/css/calendar.css',
    '/js/analytics.js',
    // '/js/music-player.js', // Temporarily disabled
    '/js/gallery.js',
    '/js/calendar.js',
    '/assets/favicon.ico',
    '/assets/logo.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch((error) => {
                console.error('Failed to cache static files:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first strategy for development
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip analytics and API calls
    if (url.pathname.startsWith('/api/analytics') || 
        url.pathname.startsWith('/api/email') ||
        url.hostname.includes('google-analytics.com') ||
        url.hostname.includes('googletagmanager.com')) {
        return;
    }

    // Network first strategy - always try to get fresh content
    event.respondWith(
        fetch(request)
            .then((networkResponse) => {
                // Don't cache if not successful
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // For HTML and CSS files, always return fresh content without caching during development
                if (url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname === '/') {
                    return networkResponse;
                }

                // Cache other successful responses (images, fonts, etc.)
                const responseToCache = networkResponse.clone();
                
                // Determine cache type
                let cacheName = DYNAMIC_CACHE;
                if (request.url.includes('fonts.googleapis.com') || 
                    url.pathname.includes('/images/') ||
                    url.pathname.includes('/assets/')) {
                    cacheName = STATIC_CACHE;
                }

                caches.open(cacheName)
                    .then((cache) => {
                        cache.put(request, responseToCache);
                    });

                return networkResponse;
            })
            .catch(() => {
                // Fallback to cache only when network fails
                return caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Return offline fallback for HTML pages
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('/');
                        }
                    });
            })
    );
});

// Background sync for analytics
self.addEventListener('sync', (event) => {
    if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalytics());
    }
});

// Sync analytics data when online
async function syncAnalytics() {
    try {
        const cache = await caches.open('analytics-queue');
        const requests = await cache.keys();
        
        for (const request of requests) {
            try {
                await fetch(request);
                await cache.delete(request);
            } catch (error) {
                console.log('Failed to sync analytics:', error);
            }
        }
    } catch (error) {
        console.log('Analytics sync error:', error);
    }
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/favicon.ico',
            badge: '/assets/favicon.ico',
            vibrate: [200, 100, 200],
            data: data.data || {},
            actions: data.actions || []
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Performance monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
        // Log performance metrics
        console.log('Performance measure:', event.data.data);
    }
});

console.log('DJ Nuff Jamz Service Worker loaded');
