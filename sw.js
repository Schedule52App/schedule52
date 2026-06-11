// cache-bust: 20260610-2148 wc-v270o: Customers page card now shows two clickable job counts top-right — Completed (left) and Open (right) — instead of a single misleading number. Completed = status completed; Open = anything not completed and not cancelled; cancelled counts in neither. Each count drops down its filtered job list (reuses the existing expand machinery); clicking the card body still shows all jobs. Counts are derived client-side from the already-loaded appointments, so a customer whose jobs are all completed no longer reads "0 jobs." Removed the redundant inline "N Jobs" name-badge chip that used the server appointment_count. New JS index-S89WYimN.js (CSS index-D4OTVTTE.css unchanged).
const CACHE = "wc-v270o";
// GitHub Pages serves this site under /wilbanks-scheduler-staging/ so plain
// "/" and "/index.html" 404. We try to precache them best-effort but DO NOT
// fail the install if they're unreachable. Without this, install rejection
// kept the previous SW active and stuck the PWA on an old bundle.
const OFFLINE = ["./", "./index.html"];
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.all(OFFLINE.map(u => c.add(u).catch(err => {
        try { console.warn("[sw] precache miss", u, err && err.message); } catch (_) {}
      })))
    )
  );
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.url.includes("/api/") || e.request.url.includes("/uploads/")) return;
  e.respondWith(
    fetch(e.request).then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; })
      .catch(() => caches.match(e.request))
  );
});
