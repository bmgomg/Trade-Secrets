// Board rules and exact move counts.
//
// A board of size n (3 or 4) is n² tiles in reading order, each { id, letter, color } with
// id 1..n² and color 1..n. Tile ids are stable across swaps (position in the solved layout),
// so a UI can animate by id.

import { isWord, lexiconFor, sortKey } from './dict.js';

export const SIZES = [3, 4];

export const sizeOf = (tiles) => Math.round(Math.sqrt(tiles.length));

const permutations = (items) =>
	items.length <= 1 ? [items] : items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((p) => [x, ...p]));

const ROW_ORDERS = Object.fromEntries(SIZES.map((n) => [n, permutations([...Array(n).keys()])]));

export const rowWords = (tiles) => {
	const n = sizeOf(tiles);
	return [...Array(n).keys()].map((r) =>
		tiles
			.slice(r * n, r * n + n)
			.map((t) => t.letter)
			.join('')
	);
};

/** Per row, whether its letters spell a dictionary word. Letters only: says nothing about colors. */
export const wordRows = (tiles) => rowWords(tiles).map(isWord);

/** Win: every row is a dictionary word in a single color. Row order doesn't matter. */
export const isSolved = (tiles) => {
	const n = sizeOf(tiles);
	const { set } = lexiconFor(n);

	for (let r = 0; r < n; r++) {
		const row = tiles.slice(r * n, r * n + n);

		if (row.some((t) => t.color !== row[0].color) || !set.has(row.map((t) => t.letter).join(''))) {
			return false;
		}
	}

	return true;
};

/** Only different colors swap. Returns a new array, or the same one if the tap is refused. */
export const tapPair = (tiles, a, b) => {
	if (a === b || tiles[a].color === tiles[b].color) {
		return tiles;
	}

	const next = tiles.slice();
	[next[a], next[b]] = [next[b], next[a]];

	return next;
};

/** Letters that occur in two different words (repeats inside one word don't count). */
export const spanningLetters = (words) => {
	const seenIn = new Map();

	words.forEach((w, i) => {
		for (const ch of w) {
			seenIn.has(ch) ? seenIn.get(ch).add(i) : seenIn.set(ch, new Set([i]));
		}
	});

	return [...seenIn].filter(([, s]) => s.size > 1).map(([ch]) => ch);
};

/**
 * Fewest swaps to any winning arrangement, given perfect color knowledge.
 * `letters` and `colors` are per-position arrays (length n²).
 *
 * Returns both measures:
 * - floor: legal swaps only. A same-color pair can't trade, so every cycle of the tile
 *   permutation that is a single color costs 2 extra (it must be merged with a cycle of
 *   another color first), less 2 for each pair of such cycles of different colors that
 *   can be merged with each other.
 * - relaxed: n² − cycles, as if any two tiles could trade (the prototype's "floor").
 * - plan: the floor-achieving target, for `planSwaps` to turn into an actual swap list.
 */
export const floors = (letters, colors) => {
	const cells = letters.length;
	const n = Math.round(Math.sqrt(cells));
	const { anagrams } = lexiconFor(n);
	const groups = Array.from({ length: n }, () => []);

	for (let p = 0; p < cells; p++) {
		groups[colors[p] - 1].push(letters[p]);
	}

	const words = groups.map((g) => (g.length === n ? anagrams.get(sortKey(g)) : undefined));

	if (words.some((w) => !w)) {
		return { floor: Infinity, relaxed: Infinity, plan: null };
	}

	const tl = new Array(cells);
	const tc = new Array(cells);
	const f = new Array(cells);
	const used = new Array(cells);
	const seen = new Array(cells);
	const mono = new Array(n);
	let floor = Infinity;
	let relaxed = Infinity;
	let plan = null;

	const leaf = () => {
		seen.fill(false);
		mono.fill(0);
		let cycles = 0;
		let m = 0;

		for (let i = 0; i < cells; i++) {
			if (seen[i]) {
				continue;
			}

			cycles++;
			let len = 0;
			let pure = true;

			for (let j = i; !seen[j]; j = f[j]) {
				seen[j] = true;
				len++;
				pure &&= colors[j] === colors[i];
			}

			if (len > 1 && pure) {
				mono[colors[i] - 1]++;
				m++;
			}
		}

		const pairs = Math.min(m >> 1, m - Math.max(...mono));
		const cost = cells - cycles + 2 * (m - pairs);

		relaxed = Math.min(relaxed, cells - cycles);

		if (cost < floor) {
			floor = cost;
			plan = { f: f.slice(), tc: tc.slice() };
		}
	};

	// assign each position to a target slot holding the same letter and color
	const assign = (p) => {
		if (p === cells) {
			return leaf();
		}

		for (let q = 0; q < cells; q++) {
			if (!used[q] && tl[q] === letters[p] && tc[q] === colors[p]) {
				used[q] = true;
				f[p] = q;
				assign(p + 1);
				used[q] = false;
			}
		}
	};

	// one word per color, from each color's anagrams
	const combos = words.reduce((acc, ws) => acc.flatMap((c) => ws.map((w) => [...c, w])), [[]]);

	for (const byColor of combos) {
		for (const order of ROW_ORDERS[n]) {
			order.forEach((c, r) => {
				for (let k = 0; k < n; k++) {
					tl[r * n + k] = byColor[c][k];
					tc[r * n + k] = c + 1;
				}
			});

			used.fill(false);
			assign(0);
		}
	}

	return { floor, relaxed, plan };
};

export const tileFloors = (tiles) =>
	floors(
		tiles.map((t) => t.letter),
		tiles.map((t) => t.color)
	);

/**
 * Turns a `floors` plan into an actual shortest solution: a list of legal swaps, each a pair of
 * *starting* positions (indices into the tile array the plan was computed from).
 *
 * The plan's `f` maps each position to the target slot its tile belongs in; its cycles are what
 * the floor counts. A cycle of length L resolves in L−1 swaps, each sending one tile home, as
 * long as the two tiles involved differ in color. A monochrome cycle can't start, so it is first
 * merged (one swap) with a cycle of another color — with a second monochrome cycle when one is
 * available, since that pays the +2 for both at once, otherwise with any differently-colored
 * tile, a tile already at home included.
 */
export const planSwaps = ({ f, tc }) => {
	const cells = f.length;
	const dest = f.slice(); // dest[p] = target slot of the tile now at p
	const at = f.map((_, p) => p); // at[p] = starting position of the tile now at p
	const colorAt = (p) => tc[dest[p]];
	const swaps = [];

	const swap = (a, b) => {
		swaps.push([at[a], at[b]]);
		[dest[a], dest[b]] = [dest[b], dest[a]];
		[at[a], at[b]] = [at[b], at[a]];
	};

	const cycles = () => {
		const seen = new Array(cells).fill(false);
		const out = [];

		for (let i = 0; i < cells; i++) {
			if (seen[i] || dest[i] === i) {
				continue;
			}

			const cycle = [];

			for (let j = i; !seen[j]; j = dest[j]) {
				seen[j] = true;
				cycle.push(j);
			}

			out.push(cycle);
		}

		return out;
	};

	const isMono = (cycle) => cycle.every((p) => colorAt(p) === colorAt(cycle[0]));

	// merge every monochrome cycle away, pairing two of them whenever their colors differ
	for (;;) {
		const monos = cycles().filter(isMono);

		if (!monos.length) {
			break;
		}

		const byColor = new Map();

		for (const cycle of monos) {
			const color = colorAt(cycle[0]);
			byColor.set(color, [...(byColor.get(color) ?? []), cycle]);
		}

		// pairing off the two largest color groups first maximizes the number of pairs
		const groups = [...byColor.values()].sort((a, b) => b.length - a.length);

		if (groups.length > 1) {
			swap(groups[0][0][0], groups[1][0][0]);
			continue;
		}

		const cycle = groups[0][0];
		const inCycle = new Set(cycle);
		const color = colorAt(cycle[0]);
		const outside = [...Array(cells).keys()].filter((p) => !inCycle.has(p) && colorAt(p) !== color);

		// a tile already at home is the cheapest router: it only rejoins the cycle, nothing else
		swap(cycle[0], outside.find((p) => dest[p] === p) ?? outside[0]);
	}

	for (let rest of cycles()) {
		while (rest.length > 1) {
			const colors = rest.map(colorAt);

			// send one tile home, but not if that would leave a monochrome cycle behind
			const legal = (i) => colorAt(rest[i]) !== colorAt(dest[rest[i]]);
			const safe = (i) => {
				const left = colors.filter((_, k) => k !== i);
				return left.length <= 1 || left.some((c) => c !== left[0]);
			};

			const keys = [...rest.keys()];
			const i = keys.find((k) => legal(k) && safe(k)) ?? keys.find(legal);
			const p = rest[i];
			const home = dest[p];

			swap(p, home);
			rest = rest.filter((q) => q !== home);
		}
	}

	return swaps;
};

/** `{ floor, relaxed, swaps }` — swaps as pairs of tile ids, in order. */
export const tileSolution = (tiles) => {
	const { floor, relaxed, plan } = tileFloors(tiles);

	return { floor, relaxed, swaps: plan ? planSwaps(plan).map(([a, b]) => [tiles[a].id, tiles[b].id]) : null };
};

/**
 * Exact fewest legal swaps by iterative-deepening A*, with the relaxed floor as the heuristic
 * (it's admissible: one swap changes it by at most 1). Independent of the monochrome-cycle
 * reasoning in `floors`, so it's used to verify it. Slow on hard 4×4 boards.
 */
export const searchFloor = (tiles, limit = 24) => {
	const cells = tiles.length;
	const key = (ts) => ts.map((t) => t.letter + t.color).join('');
	const hCache = new Map();

	const h = (ts, k) => {
		if (!hCache.has(k)) {
			hCache.set(k, tileFloors(ts).relaxed);
		}

		return hCache.get(k);
	};

	let bound = h(tiles, key(tiles));

	while (bound <= limit) {
		const bestG = new Map();
		let next = Infinity;

		const dfs = (ts, g) => {
			const k = key(ts);
			const est = g + h(ts, k);

			if (est > bound) {
				next = Math.min(next, est);
				return false;
			}

			if (est === g) {
				return true; // relaxed floor 0 = solved
			}

			if (bestG.get(k) <= g) {
				return false;
			}

			bestG.set(k, g);

			for (let a = 0; a < cells; a++) {
				for (let b = a + 1; b < cells; b++) {
					const moved = tapPair(ts, a, b);

					if (moved !== ts && dfs(moved, g + 1)) {
						return true;
					}
				}
			}

			return false;
		};

		if (dfs(tiles, 0)) {
			return bound;
		}

		bound = next;
	}

	return Infinity;
};
