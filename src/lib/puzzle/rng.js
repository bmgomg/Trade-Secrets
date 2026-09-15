// Seedable PRNG (mulberry32). Seeds may be numbers or strings, e.g. a date for a daily puzzle.

export const hashSeed = (seed) => {
	if (typeof seed === 'number') {
		return seed >>> 0;
	}

	// FNV-1a
	let h = 0x811c9dc5;

	for (const ch of String(seed)) {
		h ^= ch.codePointAt(0);
		h = Math.imul(h, 0x01000193);
	}

	return h >>> 0;
};

export const createRng = (seed = Date.now()) => {
	let s = hashSeed(seed);

	const next = () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};

	const int = (n) => Math.floor(next() * n);

	const pick = (array) => array[int(array.length)];

	const shuffle = (array) => {
		const a = array.slice();

		for (let i = a.length - 1; i > 0; i--) {
			const j = int(i + 1);
			[a[i], a[j]] = [a[j], a[i]];
		}

		return a;
	};

	return { next, int, pick, shuffle };
};
