// cache-bust: 20260610-2156 wc-v270p: Customers card affordance fix. The whole card body is NO LONGER clickable to expand. The two Completed/Open counts are now clearly-styled clickable PILLS (bordered, cursor-pointer, hover + active-highlight, underlined labels) so users can tell they're tappable. The bottom-row chevron is now a real button that toggles the full "show all" job list (it did nothing before). Three expand entry points: Completed pill (completed only), Open pill (open only), chevron (all). Behavior/counts otherwise unchanged from wc-v270o. New JS index-hV5H_Gg2.js (CSS index-D4OTVTTE.css unchanged).
const CACHE = "wc-v270p";
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
