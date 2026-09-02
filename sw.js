const CACHE_NAME = 'pena-kanza-v3';
const DYNAMIC_CACHE = 'pena-kanza-dynamic-v1';

// Daftar semua file HTML, CSS, JS, JSON dari repository + icon.png
const ASSETS_TO_CACHE = [
  './',
  './icon.png',
  './img/img19.jpg',
  // File HTML
  './index.html',
  './alquran.html',
  './baca_quran.html',
  './curhat.html',
  './daftar_pdf.html',
  './daftar_rumusan_by_kategori.html',
  './detail_rumusan.html',
  './kategori.html',
  './kitab_digital.html',
  './lain_lain.html',
  './pencarian.html',
  './sholawat.html',
  './tambah_data.html',
  './tambah_rumusan.html',
  './tambah_sholawat.html',

  // File CSS
  './styles.css',
  './alquran.css',
  './curhat.css',
  './kitab_digital.css',
  './lain_lain.css',
  './sholawat.css',
  './tambah_data.css',
  './tambah_rumusan.css',
  './tambah_sholawat.css',

  // File JS
  './script.js',
  './alquran.js',
  './baca_quran.js',
  './curhat.js',
  './kitab_digital.js',
  './lain_lain.js',
  './sholawat.js',
  './tambah_data.js',
  './tambah_rumusan.js',
  './tambah_sholawat.js',

  // File JSON
  './rumusan_data.json',
  './data_sholawat.json',
  './kitab_bajuri.json',
  './kitab_sharqawi.json',
  './lain_lain.json',

    // Font & FontAwesome External (Menggunakan Request no-cors agar tidak terblokir)
  new Request('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css', { mode: 'no-cors' }),
  new Request('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap', { mode: 'no-cors' })
];


// 1. Install Service Worker & Simpan Aset Utama (Versi Aman Offline)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Menyimpan seluruh aset ke cache...');
      // Menggunakan Promise.allSettled agar jika 1 file error/404, file lain tetap tersimpan
      await Promise.allSettled(
        ASSETS_TO_CACHE.map(url => 
          cache.add(url).catch(err => console.error(`Gagal menyimpan cache: ${url}`, err))
        )
      );
    })
  );
  self.skipWaiting();
});


// 2. Aktivasi & Hapus Cache Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Menghapus cache lama:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch (Cek Cache + Runtime Caching untuk Gambar/File Lain)
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    // Tambahkan { ignoreSearch: true } di sini
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0)) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();

          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          console.log('[Service Worker] Gagal mengambil file secara offline.');
        });
    })
  );
});
