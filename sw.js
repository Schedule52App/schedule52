// cache-bust: 20260611-0926 wc-v270r: REAL CRASH FIX (confirmed via source-map decode of the live stack trace). The List-view crash "Cannot read properties of null (reading 'replace')" was Dashboard.tsx line 2002: statusFilter.replace("_"," "). statusFilter was NULL, not "all". Root cause in PreferencesProvider.tsx usePreference get(): it only fell back to the default when the stored pref was `undefined`, so a pref persisted as `null` (cleared/legacy) leaked through. Fixed get() to fall back for BOTH null AND undefined (=== undefined -> == null), plus a defensive (statusFilter ?? "all") guard at the call site. New JS index-D2ijUvMb.js (CSS index-D4OTVTTE.css unchanged). The prior wc-v270q global-search null-coalescing was unrelated and is retained.
const CACHE = "wc-v270r";
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
