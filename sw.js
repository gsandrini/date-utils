'use strict';

/**
 * Service Worker
 * Caches all static assets on install so the app works offline.
 * Update CACHE_VERSION when deploying new files.
 */
const CACHE_VERSION = 'v7';
const CACHE_NAME = `date-utils-${CACHE_VERSION}`;

/**
 * All files to pre-cache on install
 */
const STATIC_ASSETS = [
  '/date-utils/',
  '/date-utils/index.html',
  '/date-utils/manifest.json',
  '/date-utils/assets/js/app.js',
  '/date-utils/assets/js/alpine.min.js',
  '/date-utils/assets/css/tailwind.min.css',
  '/date-utils/assets/icons/icon-192x192.png',
  '/date-utils/assets/icons/icon-512x512.png',
];

/**
 * Install: pre-cache all static assets
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate: delete old caches from previous versions
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch: serve from cache first, fall back to network
 */
self.addEventListener('fetch', event => {
  /* Only handle GET requests */
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached ?? fetch(event.request))
  );
});
