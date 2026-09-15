// Board rules and exact move counts.
//
// A board is 9 tiles in reading order, each { id, letter, color } with color 0..2.
// Tile ids are stable across swaps (index in the solved layout), so a UI can animate by id.

import { ANAGRAMS, DICT_SET, sortKey } from './dict.js';

export const SIDE = 3;
export const CELLS = 9;

const ROW_ORDERS = [
	[0, 1, 2],
	[0, 2, 1],
	[1, 0, 2],
	[1, 2, 0],
	[2, 0, 1],
	[2, 1, 0]
];

export const rowWords = (tiles) => [0, 3, 6].map((i) => tiles[i].letter + tiles[i + 1].letter + tiles[i + 2].letter);

/** Win: every row is a dictionary word in a single color. Row order doesn't matter. */
export const isSolved = (tiles) => {
	for (let i = 0; i < CELLS; i += SIDE) {
		const [a, b, c] = [tiles[i], tiles[i + 1], tiles[i + 2]];

		if (a.color !== b.color || a.color !== c.color || !DICT_SET.has(a.letter + b.letter + c.letter)) {
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
 * `letters` and `colors` are per-position arrays (length 9).
 *
 * Returns both measures:
 * - floor: legal swaps only. A same-color pair can't trade, so every cycle of the tile
 *   permutation that is a single color costs 2 extra (it must be merged with a cycle of
 *   another color first), less 2 for each pair of such cycles of different colors that
 *   can be merged with each other.
 * - relaxed: 9 − cycles, as if any two tiles could trade (the prototype's "floor").
 */
export const floors = (letters, colors) => {
	const groups = [[], [], []];

	for (let p = 0; p < CELLS; p++) {
		groups[colors[p]].push(letters[p]);
	}

	const words = groups.map((g) => (g.length === SIDE ? ANAGRAMS.get(sortKey(g)) : undefined));

	if (words.some((w) => !w)) {
		return { floor: Infinity, relaxed: Infinity };
	}

	const tl = new Array(CELLS);
	const tc = new Array(CELLS);
	const f = new Array(CELLS);
	const used = new Array(CELLS);
	let floor = Infinity;
	let relaxed = Infinity;

	const leaf = () => {
		const seen = new Array(CELLS).fill(false);
		const mono = [0, 0, 0];
		let cycles = 0;

		for (let i = 0; i < CELLS; i++) {
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
				mono[colors[i]]++;
			}
		}

		const m = mono[0] + mono[1] + mono[2];
		const pairs = Math.min(m >> 1, m - Math.max(...mono));

		relaxed = Math.min(relaxed, CELLS - cycles);
		floor = Math.min(floor, CELLS - cycles + 2 * (m - pairs));
	};

	// assign each position to a target slot holding the same letter and color
	const assign = (p) => {
		if (p === CELLS) {
			return leaf();
		}

		for (let q = 0; q < CELLS; q++) {
			if (!used[q] && tl[q] === letters[p] && tc[q] === colors[p]) {
				used[q] = true;
				f[p] = q;
				assign(p + 1);
				used[q] = false;
			}
		}
	};

	for (const w0 of words[0]) {
		for (const w1 of words[1]) {
			for (const w2 of words[2]) {
				const byColor = [w0, w1, w2];

				for (const order of ROW_ORDERS) {
					order.forEach((c, r) => {
						for (let k = 0; k < SIDE; k++) {
							tl[r * SIDE + k] = byColor[c][k];
							tc[r * SIDE + k] = c;
						}
					});

					used.fill(false);
					assign(0);
				}
			}
		}
	}

	return { floor, relaxed };
};

export const tileFloors = (tiles) =>
	floors(
		tiles.map((t) => t.letter),
		tiles.map((t) => t.color)
	);

/** Breadth-first search over legal swaps. Slow; used to verify `floors`. */
export const searchFloor = (tiles, limit = 14) => {
	const key = (ts) => ts.map((t) => t.letter + t.color).join('');
	let frontier = [tiles];
	const seen = new Set([key(tiles)]);

	for (let depth = 0; depth <= limit; depth++) {
		const next = [];

		for (const ts of frontier) {
			if (isSolved(ts)) {
				return depth;
			}

			for (let a = 0; a < CELLS; a++) {
				for (let b = a + 1; b < CELLS; b++) {
					const moved = tapPair(ts, a, b);
					const k = key(moved);

					if (moved !== ts && !seen.has(k)) {
						seen.add(k);
						next.push(moved);
					}
				}
			}
		}

		frontier = next;
	}

	return Infinity;
};
