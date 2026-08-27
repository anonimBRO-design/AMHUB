// AMHUB Progressive Web App Service Worker
const CACHE_NAME = "amhub-cache-v1";
const PRECACHE_ASSETS = [
	"/",
	"/favicon.png",
	"/logo.png",
	"/icon-192.png",
	"/icon-512.png",
	"/apple-touch-icon.png",
	"/manifest.json",
];

// Install Event - Precache static assets
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				return cache.addAll(PRECACHE_ASSETS).catch((err) => {
					console.warn("[PWA SW] Pre-cache partial fail:", err);
				});
			})
			.then(() => self.skipWaiting()),
	);
});

// Activate Event - Clean up old caches
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cache) => {
						if (cache !== CACHE_NAME) {
							return caches.delete(cache);
						}
					}),
				);
			})
			.then(() => self.clients.claim()),
	);
});

// Fetch Event - Network First with Stale-While-Revalidate fallback for static assets
self.addEventListener("fetch", (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET requests, API calls, and Supabase auth/storage requests from aggressive cache
	if (
		request.method !== "GET" ||
		url.pathname.startsWith("/api/") ||
		url.hostname.includes("supabase.co") ||
		url.hostname.includes("posthog.com")
	) {
		return;
	}

	// Handle Static Assets (Images, Icons, Fonts, CSS, JS) -> Stale-While-Revalidate
	if (
		request.destination === "image" ||
		request.destination === "font" ||
		request.destination === "style" ||
		request.destination === "script" ||
		url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|woff2|woff|css|js)$/)
	) {
		event.respondWith(
			caches.open(CACHE_NAME).then((cache) => {
				return cache.match(request).then((cachedResponse) => {
					const fetchPromise = fetch(request)
						.then((networkResponse) => {
							if (networkResponse && networkResponse.status === 200) {
								cache.put(request, networkResponse.clone());
							}
							return networkResponse;
						})
						.catch(() => cachedResponse);

					return cachedResponse || fetchPromise;
				});
			}),
		);
		return;
	}

	// Navigation Requests (HTML Pages) -> Network First, Fallback to Cache
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					if (response && response.status === 200) {
						const responseClone = response.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(request, responseClone);
						});
					}
					return response;
				})
				.catch(() => {
					return caches.match(request).then((cachedResponse) => {
						if (cachedResponse) return cachedResponse;
						return caches.match("/");
					});
				}),
		);
	}
});
