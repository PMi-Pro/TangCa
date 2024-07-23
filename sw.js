// Đăng ký Service Worker: Đặt sau thẻ script (main) trong html, hoặc cuối file main.js
/*window.onload = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('sw.js');
      console.log('[Service Worker]: Register Complete!');
    } catch (error) {
      console.error('[Service Worker]: Register Failed!', error);
    }
  }
  else console.log('This browser does not support Service Worker!');
}*/

// Phiên bản bộ đệm
const version = '1.0.0'; // 22.07.2024
// Tên bộ đệm
const cacheName = `TangCa-v${version}`;
// Danh sách các file cần đưa vào bộ đệm
const contentToCache = [
  'bg.jpg',
  'icon.png',
  'index.html',
  'style.css',
  'main.js',
  'version.txt'
];

// Đưa các file dữ liệu vào bộ đệm
self.addEventListener('install', (e) => {
  //console.log('[Service Worker]: Install!');
  self.skipWaiting();
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(contentToCache);
    //console.log('[Service Worker]: Caching All!');
  })());
});

// Kích hoạt SW và loại bỏ bộ đệm cũ nếu phát hiện dữ liệu mới
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(async (cache) => {
      if (cache !== cacheName) {
        await caches.delete(cache);
        //console.log(`[Service Worker]: Removing Old Cache: ${cache}`);
      }
    }));
  })());
  self.clients.claim();
});

// Trả về dữ liệu trong bộ đệm, nếu không có trả về dữ liệu từ tang web (Online) sau đó cache lại dữ liệu để sử dụng cho lần sau (Offline)
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const rq = await caches.match(e.request);
    //console.log(`[Service Worker]: Fetching Resource: ${e.request.url}`);
    if (rq) return rq;
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    await cache.put(e.request, response.clone());
    //console.log(`[Service Worker]: Caching New Resource: ${e.request.url}`);
    return response;
  })());
});
