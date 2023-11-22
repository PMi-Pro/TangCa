// Đăng ký Service Worker: Đặt ở cuối thẻ body (Html) hoặc cuối file main.js
/*window.onload = async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('sw.js');
      console.log('[Service Worker]: Register Complete!');
    } catch (error) { console.log('[Service Worker]: Register Failed!'); }
  } else console.log('This browser does not support Service Worker!');
}*/

// Phiên bản bộ đệm
const version = '0.8';
// Tên bộ đệm
const cacheName = `TangCa-v${version}`;
// Danh sách các file cần đưa vào bộ đệm
const contentToCache = [
  'index.html',
  'style.css',
  'main.js'
];

// Cài đặt và đưa các file dữ liệu vào bộ đệm
self.addEventListener('install', (e) => {
  //console.log('[Service Worker]: Install!');
  self.skipWaiting();
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    //console.log('[Service Worker]: Caching All!');
    return await cache.addAll(contentToCache);
  })(), );
});

// Kích hoạt SW và loại bỏ bộ đệm cũ nếu có dữ liệu mới
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    return await keys.map(async (cache) => {
      if (cache !== cacheName) {
        //console.log(`[Service Worker]: Removing Old Cache: ${cache}`);
        return await caches.delete(cache);
      }
    });
  })(), );
});

// Chặn sự kiện trình duyệt tìm nạp dữ liệu, và trả về dữ liệu trong bộ đệm nếu có
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const rq = await caches.match(e.request);
    //console.log(`[Service Worker]: Fetching Resource: ${e.request.url}`);
    if (rq) return rq;
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    //console.log(`[Service Worker]: Caching New Resource: ${e.request.url}`);
    await cache.put(e.request, response.clone());
    return await response;
  })(), );
});