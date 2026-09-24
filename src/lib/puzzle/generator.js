import { lexiconFor } from './dict.js';
import { createRng } from './rng.js';
import { isSolved, planSwaps, spanningLetters, tileFloors } from './rules.js';

// per grid size: cap on letters shared by two different words.
// Both reject the top tail of deals: 6% for 3×3 (3+), 15% for 4×4 (5+, where the median deal has 3).
export const MAX_SPANNING = { 3: 2, 4: 4 };

// ids and colors are 1-based; a tile's id is its position in the solved layout, reading order
const solvedTiles = (wordsByColor) => {
	const n = wordsByColor.length;
	return wordsByColor.flatMap((w, c) => [...w].map((letter, k) => ({ id: c * n + k + 1, letter, color: c + 1 })));
};

const inRange = (v, min, max) => v >= min && v <= max;

// A shortest solution: `floor` swaps, each a pair of tile ids to tap. Ids are stable across swaps,
// so a swap says which two tiles to trade without caring where they've drifted to.
const solutionFor = (tiles, plan) => planSwaps(plan).map(([a, b]) => [tiles[a].id, tiles[b].id]);

/**
 * Deals a puzzle.
 *
 * options:
 * - size         3 (3×3, three 3-letter words) or 4 (4×4, four 4-letter words), default 3
 * - seed         number or string; same seed + options → same puzzle
 * - rng          an existing createRng() instance (overrides seed)
 * - floor        [min, max] legal floor (perfect-info swaps; the game's "trade floor"), default [3, ∞]
 * - relaxed      [min, max] relaxed floor (as if any two tiles could trade), default any
 * - maxSpanning  cap on letters shared by two different words, default MAX_SPANNING[size]
 * - randomColors shuffle which word gets which color, default true
 *                (otherwise color order = alphabetical word order, which leaks information)
 *
 * Returns null if nothing matched within maxDeals.
 */
export const generate = ({
	size = 3,
	seed,
	rng = createRng(seed),
	floor = [3, Infinity],
	relaxed = [0, Infinity],
	maxSpanning = MAX_SPANNING[size],
	randomColors = true,
	maxDeals = 5000,
	shufflesPerDeal = 40
} = {}) => {
	const { words: dictionary } = lexiconFor(size);

	for (let deal = 0; deal < maxDeals; deal++) {
		const picked = new Set();

		while (picked.size < size) {
			picked.add(rng.pick(dictionary));
		}

		const words = [...picked].sort();
		const spanning = spanningLetters(words);

		if (spanning.length > maxSpanning) {
			continue;
		}

		const wordsByColor = randomColors ? rng.shuffle(words) : words;
		const solved = solvedTiles(wordsByColor);

		for (let s = 0; s < shufflesPerDeal; s++) {
			const tiles = rng.shuffle(solved);

			if (isSolved(tiles)) {
				continue;
			}

			const f = tileFloors(tiles);

			if (f.floor < Infinity && inRange(f.floor, ...floor) && inRange(f.relaxed, ...relaxed)) {
				return {
					size,
					words,
					wordsByColor,
					tiles,
					floor: f.floor,
					relaxedFloor: f.relaxed,
					spanning,
					solution: solutionFor(tiles, f.plan)
				};
			}
		}
	}

	return null;
};

/**
 * Compact, JSON-friendly form: words by color, then tile ids in reading order, one base-36 digit each.
 * "BAT-DOG-ELF:452136789" (3×3), "BARK-COIN-DUST-FLEW:3g1...": size is the word length.
 */
export const encodePuzzle = ({ wordsByColor, tiles }) => `${wordsByColor.join('-')}:${tiles.map((t) => t.id.toString(36)).join('')}`;

export const decodePuzzle = (code) => {
	const [w, ids] = code.split(':');
	const wordsByColor = w.split('-');
	const size = wordsByColor.length;
	const solved = solvedTiles(wordsByColor);
	const tiles = [...ids].map((id) => solved[parseInt(id, 36) - 1]);

	if (wordsByColor.some((word) => word.length !== size) || tiles.length !== size * size || tiles.some((t) => !t)) {
		throw new Error(`Bad puzzle code: ${code}`);
	}

	const words = wordsByColor.slice().sort();
	const f = tileFloors(tiles);

	return {
		size,
		words,
		wordsByColor,
		tiles,
		floor: f.floor,
		relaxedFloor: f.relaxed,
		spanning: spanningLetters(words),
		solution: solutionFor(tiles, f.plan)
	};
};

/** Deterministic bank of distinct puzzles (as codes). Same options as generate(). */
export const makeBank = ({ count, seed = 'bank', ...options }) => {
	const rng = createRng(seed);
	const codes = new Set();
	let misses = 0;

	while (codes.size < count) {
		const p = generate({ ...options, rng });

		if (!p) {
			throw new Error(`No puzzle matches ${JSON.stringify(options)}`);
		}

		const code = encodePuzzle(p);

		if (codes.has(code) && ++misses > count * 10) {
			throw new Error(`Only ${codes.size} distinct puzzles match ${JSON.stringify(options)}`);
		}

		codes.add(code);
	}

	return [...codes];
};
