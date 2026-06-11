// cache-bust: 20260611-1355 wc-v270w: real root cause of appt Edit showing Multi-Day/Multi-Hour toggle OFF + no End Time on records that genuinely have an end time (e.g. #440, endTime=16:00). AppointmentDetail's single-appointment fetch (and the technicians fetch) called requireAuth routes WITHOUT an Authorization header, relying on the global auth-layer.js window.fetch patch; when that injection did not apply to this React Query queryFn the request 401'd and React Query served a thinner cached object lacking the freshest endDate/endTime, so startEdit seeded empty end fields. Fix: attach the bearer token explicitly to both fetches (matches every other authed fetch in this file). New JS index-DIKfmNKh.js (CSS index-D4OTVTTE.css unchanged).
const CACHE = "wc-v270w";
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
