const CACHE_NAME = 'csharp-tutorial-v0.9.9';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/js/data.js',
  '/js/menu.js',
  '/js/topic.js',
  '/js/glossary.js',
  '/js/graph.js',
  '/js/print.js',
  '/js/theme.js',
  '/js/main.js',
  '/js/quiz.js',
  '/lib/highlight.min.js',
  '/lib/github-dark.min.css',
  "/lib/vis-network.min.js",
  '/db/topics.json',
  '/db/quiz.json',
  '/db/glossary.json',
  '/images/icon.svg',
  '/screenshots/0/create_project_1.jpg',
  '/screenshots/0/install_3.jpg',
  '/screenshots/0/install_5.jpg',
  '/screenshots/0/install_6.jpg',
  '/screenshots/0/install_8.jpg',
  '/screenshots/0/properties_1.jpg',
  '/screenshots/0/run_program_1.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

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

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});