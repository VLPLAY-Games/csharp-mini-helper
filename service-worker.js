// service-worker.js

const CACHE_NAME = 'csharp-tutorial-v0.9.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/quiz.js',
  '/lib/highlight.min.js',
  '/lib/github-dark.min.css',
  '/db/topics.json',
  '/db/quiz.json',
  '/images/icon.svg'
];

// Установка Service Worker и кэширование всех файлов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Активация: удаляем старые версии кэша
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(keyList.map(key => {
        if (!cacheWhitelist.includes(key)) {
          return caches.delete(key);
        }
      }))
    ).then(() => self.clients.claim())
  );
});

// Перехват запросов: сначала пытаемся взять из кэша, если нет – идём в сеть
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});