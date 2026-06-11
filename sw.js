// cache-bust: 20260610-2010 wc-v270j: Settings > Technicians list cards now use <TechAvatar> (photo when set, initials fallback) instead of a hand-rolled initials chip — so uploaded tech photos show in the Settings list too, matching the Techs dropdown. (wc-v270i fixed the avatar bucket URL.)
const CACHE = "wc-v270j";
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
