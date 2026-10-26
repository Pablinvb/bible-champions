/*
 * Service worker: makes the whole game work with no network at all.
 *
 * This file is the source. `node build.mjs` writes sw.js at the repository root with the
 * version below replaced by a hash of the built page, so every build is a new cache and the
 * old one is thrown away.
 *
 * Strategy: serve from the cache first, and refresh the copy in the background. A hall with
 * bad wifi never waits on the network, and the next time the page is opened it is already the
 * new version. Navigations fall back to the cached page, so a reload with the wifi down still
 * opens the game rather than the browser's dinosaur.
 */
var VERSION = "__BUILD__";
var CACHE = "bible-champions-" + VERSION;

/* Everything the game needs to start cold. Audio is deliberately absent: those files are
   optional, the game runs silent without them, and they are picked up by the fetch handler
   if they are ever added. */
var PRECACHE = [
  "./",
  "index.html",
  "favicon.png",
  "vendor/react.production.min.js",
  "vendor/react-dom.production.min.js",
  "vendor/htm.js",
  "fonts/fonts.css",
  "art/prophecy.webp",
  "art/history.webp",
  "art/geography.webp",
  "art/art.webp",
  "art/sports.webp",
  "art/economics.webp",
  "art/riddles.webp",
  "art/crown.webp"
];

self.addEventListener("install", function (ev) {
  ev.waitUntil(
    caches.open(CACHE).then(function (cache) {
      /* one file missing must not cost the whole install, so they go in one at a time */
      return Promise.all(
        PRECACHE.map(function (url) {
          return cache.add(new Request(url, { cache: "reload" })).catch(function () {});
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (ev) {
  var req = ev.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var nav = req.mode === "navigate";
  ev.respondWith(
    caches.open(CACHE).then(function (cache) {
      /* a link with ?something on it is still the same page, so navigations ignore the query */
      return cache.match(req, nav ? { ignoreSearch: true } : undefined).then(function (hit) {
        var fresh = fetch(req).then(function (res) {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(function () {
          /* offline: a navigation still gets the page it was going to */
          if (hit) return hit;
          return nav ? cache.match("index.html").then(function (p) { return p || Response.error(); })
                     : Response.error();
        });
        return hit || fresh;
      });
    })
  );
});

/* The page asks for the fonts once it is up, so a first visit that never opens a question
   still ends up with everything it needs for the next one. */
self.addEventListener("message", function (ev) {
  if (!ev.data || ev.data.type !== "cache-fonts" || !ev.data.urls) return;
  ev.waitUntil(caches.open(CACHE).then(function (cache) {
    return Promise.all(ev.data.urls.map(function (u) {
      return cache.match(u).then(function (hit) { return hit ? null : cache.add(u).catch(function () {}); });
    }));
  }));
});
