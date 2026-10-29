// Offline play. The app is all client-side, so with its files cached it runs with no network at all.
// - On install: every built file and every file in static/, except the music and platform icons, into a cache per build.
// - The music (the biggest file) is cached the first time it is fetched, in a cache of its own that outlives
//   builds: its file name carries a content hash, so it is only fetched again when it changes.
// - The page itself comes from the network when it answers within NAVIGATE_TIMEOUT, so updates show, else the cache.
// - A new build's cache replaces the old one when it activates (SvelteKit registers this file;
//   the itch.io build turns it off, see svelte.config.js).
import { build, files, version } from '$service-worker';

const APP = `app-${version}`;
const MEDIA = 'media';

// how long the page may take from the network before the cached one is used
const NAVIGATE_TIMEOUT = 3000;
const SLOW = 'slow';

const isMedia = (path) => /\.(mp3|ogg)$/.test(path) && path.includes('music');

// home screen and tile icons in all their sizes, for the OS to fetch when the app is installed; the game never uses them
const isPlatformIcon = (path) => /^\/(ios|android|windows\d*)\//.test(path);

const media = build.filter(isMedia);
const assets = [...build, ...files].filter((path) => !isMedia(path) && !isPlatformIcon(path));

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(APP);
			await cache.addAll(assets);
			// the page itself, for starting offline; not fatal if it can't be fetched now
			await cache.add('/').catch(() => {});
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== APP && key !== MEDIA) {
					await caches.delete(key);
				}
			}

			// drop music from older builds
			const cache = await caches.open(MEDIA);

			for (const req of await cache.keys()) {
				if (!media.includes(new URL(req.url).pathname)) {
					await cache.delete(req);
				}
			}
		})()
	);
});

self.addEventListener('fetch', (event) => {
	const req = event.request;
	const url = new URL(req.url);

	if (req.method !== 'GET' || url.origin !== location.origin) {
		return;
	}

	event.respondWith(
		(async () => {
			// built files never change under their names, so the cache wins (whatever their ?v= query);
			// not the manifest, which Android re-reads for an installed app's colors and icons
			if (assets.includes(url.pathname) && url.pathname !== '/manifest.json') {
				const hit = await caches.match(req, { ignoreSearch: true });

				if (hit) {
					return hit;
				}
			}

			if (media.includes(url.pathname)) {
				const cache = await caches.open(MEDIA);
				const hit = await cache.match(req);

				if (hit) {
					return hit;
				}

				const res = await fetch(req);

				if (res.status === 200) {
					await cache.put(req, res.clone());
				}

				return res;
			}

			// everything else, the page included: the network first, so updates show, then the cache
			const network = (async () => {
				const res = await fetch(req);

				if (res.status === 200 && req.mode === 'navigate') {
					const cache = await caches.open(APP);
					await cache.put('/', res.clone());
				}

				return res;
			})();
			const cached = async () => (await caches.match(req)) ?? (req.mode === 'navigate' ? await caches.match('/') : undefined);

			// a page the network is slow to send, as on a poor connection, comes from the cache instead;
			// the network can still finish in the background, to have the update cached for next time
			if (req.mode === 'navigate') {
				const timeout = new Promise((resolve) => setTimeout(() => resolve(SLOW), NAVIGATE_TIMEOUT));
				const first = await Promise.race([network.catch(() => null), timeout]);

				if (first instanceof Response) {
					return first;
				}

				const hit = await cached();

				if (hit) {
					if (first === SLOW) {
						event.waitUntil(network.catch(() => {}));
					}

					return hit;
				}

				// nothing cached yet: wait for the network after all
				return network;
			}

			try {
				return await network;
			} catch (err) {
				const hit = await cached();

				if (hit) {
					return hit;
				}

				throw err;
			}
		})()
	);
});
