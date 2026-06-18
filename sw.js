// cache-bust: 20260616-2055 s52-v10: Map pins now embed PNG-transcoded avatars
// with BOTH xlink:href and href on the nested <image> so they paint on every
// Chrome build (fixes tech photos not showing on map pins). IMPORTANT: this SW
// cache name had been frozen at s52-v6 across several bundle deploys, so the SW
// never re-activated and browsers kept serving stale bundles. The cache name is
// now tied to the bundle version and MUST be bumped on every deploy that ships
// a new index-*.js so the activate handler below purges old caches and clients
// pick up the fresh bundle automatically (no manual cache-clearing needed).
// cache-bust: 20260617 s52-v15: field-app gate fix — isFieldApp() now reads the
// hash (#/field) instead of pathname, and drops the legacy Wilbanks literals
// (fieldtech / wilbanks-fieldtech). All six inline gates route through it. This
// makes the hash-routed /field surface detectable so the field tech app works
// multi-tenant; data isolation remains JWT + Postgres RLS (verified disjoint).
// cache-bust: 20260617 s52-v16: field-tech JobDetail Apple Maps deep link
// restored to driving directions (daddr + dirflg=d) instead of the regressed
// ?q= search-pin. New bundle index-BKNHGdEg.js. Field source now matches the
// canonical dashboard-source repo; only intentional deltas are neutral Login
// branding and tenant-aware SMS company name (both already in place).
// cache-bust: 20260618 s52-v19: restore the account subscription UI under
// Settings > Subscription (real plan/pricing/Paddle checkout, billing-admin/owner
// gated); customer accounts-receivable threshold moved to the Dashboard tab.
// New bundle index-iX83Vjg7.js.
// cache-bust: 20260618 s52-v20: move the Subscription tab under the Settings
// "Admin" section header (privileged-tab placement); gating unchanged
// (admin/owner/both). New bundle index-DPajvk4g.js (CSS unchanged).
// cache-bust wc-v274 estimates grouped+convert
// cache-bust wc-v275 convert dialog hour-slots+grayout
const CACHE = "s52-v22";
// GitHub Pages serves this site under /schedule52/ so plain
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
