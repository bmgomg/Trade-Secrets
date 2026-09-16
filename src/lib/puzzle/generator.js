import { DICT } from './dict.js';
import { createRng } from './rng.js';
import { CELLS, SIDE, isSolved, spanningLetters, tileFloors } from './rules.js';

// Par allows two extra swaps: one same-color block, routed through a third tile.
export const PAR_OFFSET = 2;

export const parFor = (relaxedFloor) => relaxedFloor + PAR_OFFSET;

// ids and colors are 1-based; a tile's id is its position in the solved layout, reading order
const solvedTiles = (wordsByColor) =>
	wordsByColor.flatMap((w, c) => [...w].map((letter, k) => ({ id: c * SIDE + k + 1, letter, color: c + 1 })));

const inRange = (v, min, max) => v >= min && v <= max;

/**
 * Deals a puzzle.
 *
 * options:
 * - seed         number or string; same seed + options → same puzzle
 * - rng          an existing createRng() instance (overrides seed)
 * - floor        [min, max] legal floor (perfect-info swaps), default any
 * - relaxed      [min, max] prototype floor (par − 2), default [3, ∞] as in the prototype
 * - par          [min, max] par, default any
 * - maxSpanning  cap on letters shared by two different words, default 2
 * - randomColors shuffle which word gets which color, default true
 *                (otherwise color order = alphabetical word order, which leaks information)
 *
 * Returns null if nothing matched within maxDeals.
 */
export const generate = ({
	seed,
	rng = createRng(seed),
	floor = [0, Infinity],
	relaxed = [3, Infinity],
	par = [0, Infinity],
	maxSpanning = 2,
	randomColors = true,
	maxDeals = 5000,
	shufflesPerDeal = 40
} = {}) => {
	for (let deal = 0; deal < maxDeals; deal++) {
		const picked = new Set();

		while (picked.size < SIDE) {
			picked.add(rng.pick(DICT));
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
			const p = parFor(f.relaxed);

			if (f.floor < Infinity && inRange(f.floor, ...floor) && inRange(f.relaxed, ...relaxed) && inRange(p, ...par)) {
				return { words, wordsByColor, tiles, floor: f.floor, relaxedFloor: f.relaxed, par: p, spanning };
			}
		}
	}

	return null;
};

/** Compact, JSON-friendly form: "BAT-DOG-ELF:402135786" = words by color, then tile ids in reading order. */
export const encodePuzzle = ({ wordsByColor, tiles }) => `${wordsByColor.join('-')}:${tiles.map((t) => t.id).join('')}`;

export const decodePuzzle = (code) => {
	const [w, ids] = code.split(':');
	const wordsByColor = w.split('-');
	const solved = solvedTiles(wordsByColor);
	const tiles = [...ids].map((id) => solved[+id - 1]);
	if (tiles.length !== CELLS || tiles.some((t) => !t)) {
		throw new Error(`Bad puzzle code: ${code}`);
	}

	const words = wordsByColor.slice().sort();
	const f = tileFloors(tiles);

	return { words, wordsByColor, tiles, floor: f.floor, relaxedFloor: f.relaxed, par: parFor(f.relaxed), spanning: spanningLetters(words) };
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
