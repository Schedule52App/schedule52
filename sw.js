// cache-bust: 20260611-1405 wc-v270x: Day-view chips now show the Dispatcher Notes (appt.notes). Always rendered when a note exists; the note line fills the remaining chip height (flex-1, overflow-hidden) so a tall appointment shows the full note while a short chip truncates cleanly without breaking layout. New JS index-Dh3LjPJl.js, new CSS index-BHjRZB38.css (added whitespace-pre-line/break-words utilities). (Prior wc-v270w: explicit bearer token on AppointmentDetail appt+technicians fetches — robustness only, not the end-time fix; that was wc-v270v + a device cache clear.)
const CACHE = "wc-v270x";
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
  // wc-v270s: clone the response SYNCHRONOUSLY, before any await. The old code
  // called res.clone() inside the async caches.open(...).then() callback, by
  // which point the body returned to the page could already be consumed,
  // throwing "Failed to execute 'clone' on 'Response': Response body is already
  // used" on every cacheable request. Clone first, then stash the copy.
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
