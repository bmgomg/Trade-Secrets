// Player-model solver: sees letters and knows the dictionary, but learns colors only by tapping.
//
// Each turn it keeps every color hypothesis consistent with what it remembers (a split of the
// nine tiles into three words, with a color per word), all equally likely. Under a hypothesis h,
// tapping pair (a, b) is worth: 1 + floor_h(board after swap) if h gives them different colors,
// else floor_h(board). A progress swap and a refusal both keep the value at floor_h; a bad swap
// costs 1 or 2 more.
// 1. First tap: the tile minimizing expected value, given that its color shows before the partner
//    is picked (one-step lookahead over each possible color).
// 2. Its color shows; hypotheses that contradict it are dropped.
// 3. Second tap: the partner minimizing expected value over the remaining hypotheses.
// A pair of tiles known to share a color is never tapped (no swap, nothing learned). If no choice
// is expected to hold the current expected floor, the first tap goes to a tile whose color is
// still uncertain, so every turn either learns a color or makes a certain swap that lowers the
// expected floor — the solver can't cycle (with full memory).
// Ties prefer tiles whose color is uncertain, then random.

import { ANAGRAMS, sortKey } from './dict.js';
import { createRng } from './rng.js';
import { CELLS, floors } from './rules.js';

const LABELINGS = [
	[1, 2, 3],
	[1, 3, 2],
	[2, 1, 3],
	[2, 3, 1],
	[3, 1, 2],
	[3, 2, 1]
];

/** Every colors-by-tile-id array in which each color's three tiles spell a word. */
export const colorHypotheses = (letterById, all) => {
	const isWord = (ids) => ANAGRAMS.has(sortKey(ids.map((id) => letterById[id])));
	const out = [];

	for (let i = 1; i < CELLS; i++) {
		for (let j = i + 1; j < CELLS; j++) {
			const t0 = [all[0], all[i], all[j]];

			if (!isWord(t0)) {
				continue;
			}

			const rem = all.filter((id) => !t0.includes(id));

			for (let k = 1; k < rem.length; k++) {
				for (let l = k + 1; l < rem.length; l++) {
					const t1 = [rem[0], rem[k], rem[l]];
					const t2 = rem.filter((id) => !t1.includes(id));

					if (!isWord(t1) || !isWord(t2)) {
						continue;
					}

					for (const lab of LABELINGS) {
						const h = [];
						[t0, t1, t2].forEach((t, g) => t.forEach((id) => (h[id] = lab[g])));
						out.push(h);
					}
				}
			}
		}
	}

	return out;
};

/**
 * Plays a puzzle ({ tiles }) to the win.
 *
 * options:
 * - strategy    'expect' (one-step expected value, above) or 'guess' (commits to one random
 *               consistent hypothesis and plays toward it, re-guessing when a color contradicts it)
 * - seed / rng  tie-breaking
 * - memory      how many past tap pairs' colors it remembers (Infinity = all, 0 = none)
 * - oracle      knows every color from the start (should score exactly the legal floor)
 * - maxTaps     give up after this many tap pairs
 * - trace       record every tap pair
 *
 * Returns { solved, swaps, taps, trace? }. taps = tapped pairs (swaps + same-color refusals).
 */
export const solve = (
	puzzle,
	{ strategy = 'expect', seed, rng = createRng(seed), memory = Infinity, oracle = false, maxTaps = 200, trace = false } = {}
) => {
	const letterById = [];
	const colorById = [];

	for (const t of puzzle.tiles) {
		letterById[t.id] = t.letter;
		colorById[t.id] = t.color;
	}

	const at = puzzle.tiles.map((t) => t.id); // position -> tile id
	const hypotheses = colorHypotheses(
		letterById,
		puzzle.tiles.map((t) => t.id).sort((x, y) => x - y)
	);
	const history = []; // tile ids revealed per tap pair
	const cache = new Map();
	const log = trace ? [] : undefined;
	let swaps = 0;
	let taps = 0;

	// legal floor of the board `ids` if colors were `h`; color labels are canonicalized for the cache
	const cost = (h, ids) => {
		const letters = ids.map((id) => letterById[id]);
		const relabel = [-1, -1, -1, -1];
		let n = 1;
		const colors = ids.map((id) => (relabel[h[id]] < 0 ? (relabel[h[id]] = n++) : relabel[h[id]]));
		const key = letters.join('') + colors.join('');

		if (!cache.has(key)) {
			cache.set(key, floors(letters, colors).floor);
		}

		return cache.get(key);
	};

	const solvedNow = () => cost(colorById, at) === 0;

	const remembered = () => {
		const known = new Map();

		if (oracle) {
			colorById.forEach((c, id) => known.set(id, c));
		} else {
			for (const ids of history.slice(Math.max(0, history.length - memory))) {
				ids.forEach((id) => known.set(id, colorById[id]));
			}
		}

		return known;
	};

	const consistent = (h, known) => [...known].every(([id, c]) => h[id] === c);

	// lowest score wins; ties prefer an uncertain tile, then random
	const argmin = (candidates, score, uncertain) => {
		let top = [];
		let topScore = Infinity;

		for (const p of candidates) {
			const s = score(p) * 2 + (uncertain(p) ? 0 : 1);

			if (s < topScore) {
				[top, topScore] = [[p], s];
			} else if (s === topScore) {
				top.push(p);
			}
		}

		return { pick: rng.pick(top), score: topScore >> 1 };
	};

	const positions = [...Array(CELLS).keys()];

	const swapCost = (h, a, b) => {
		const moved = at.slice();
		[moved[a], moved[b]] = [moved[b], moved[a]];
		return cost(h, moved);
	};

	// 'guess': commit to one random hypothesis and play toward it; re-guess when a color contradicts it
	let guess = null;

	const guessTurn = (live) => {
		const progress = (h) => {
			const base = cost(h, at);
			const pairs = [];

			for (const a of positions) {
				for (const b of positions) {
					if (h[at[a]] !== h[at[b]] && swapCost(h, a, b) < base) {
						pairs.push([a, b]);
					}
				}
			}

			return pairs;
		};

		if (!live.includes(guess)) {
			guess = rng.pick(live);
		}

		const a = rng.pick([...new Set(progress(guess).map(([p]) => p))]);

		if (guess[at[a]] !== colorById[at[a]]) {
			guess = rng.pick(live.filter((h) => h[at[a]] === colorById[at[a]]));
		}

		const partners = progress(guess)
			.filter(([p]) => p === a)
			.map(([, q]) => q);

		// no progress for a under the new guess: tap a tile it expects to share a's color
		return [a, partners.length ? rng.pick(partners) : rng.pick(positions.filter((q) => q !== a && guess[at[q]] === guess[at[a]]))];
	};

	const expectTurn = (live) => {
		const bases = live.map((h) => cost(h, at));
		const expected = bases.reduce((s, c) => s + c, 0); // summed over live, like the values below

		// value[i][a * 9 + b] under live[i]
		const value = live.map((h, i) => {
			const v = new Array(CELLS * CELLS).fill(bases[i]);

			for (let a = 0; a < CELLS; a++) {
				for (let b = a + 1; b < CELLS; b++) {
					if (h[at[a]] !== h[at[b]]) {
						v[a * CELLS + b] = v[b * CELLS + a] = 1 + swapCost(h, a, b);
					}
				}
			}

			return v;
		});

		const uncertainIn = (ids) => (p) => ids.some((i) => live[i][at[p]] !== live[ids[0]][at[p]]);
		const all = live.map((_, i) => i);
		const uncertain = uncertainIn(all);

		// best partner for a, over the hypotheses `ids` that agree with a's revealed color
		const partner = (a, ids, aWasUncertain) => {
			const sameColor = (q) => ids.every((i) => live[i][at[q]] === live[i][at[a]]);
			const candidates = positions.filter((q) => q !== a && (aWasUncertain || !sameColor(q)));

			return argmin(candidates, (q) => ids.reduce((s, i) => s + value[i][a * CELLS + q], 0), uncertainIn(ids));
		};

		// expected value of tapping a first, summed over the colors it might show
		const firstTapValue = (a) => {
			const byColor = [[], [], [], []];
			all.forEach((i) => byColor[live[i][at[a]]].push(i));

			return byColor.filter((ids) => ids.length).reduce((s, ids) => s + partner(a, ids, uncertain(a)).score, 0);
		};

		const values = positions.map(firstTapValue);
		const holds = positions.filter((p) => values[p] <= expected);
		const firsts = holds.length ? positions : positions.filter(uncertain);
		const a = argmin(firsts.length ? firsts : positions, (p) => values[p], uncertain).pick;

		const still = all.filter((i) => live[i][at[a]] === colorById[at[a]]);

		return [a, partner(a, still, uncertain(a)).pick];
	};

	while (!solvedNow() && taps < maxTaps) {
		const known = remembered();
		// no win fired, so any hypothesis under which the board is already solved is wrong
		const live = hypotheses.filter((h) => consistent(h, known) && cost(h, at) > 0);
		const [a, b] = strategy === 'guess' ? guessTurn(live) : expectTurn(live);
		const swapped = colorById[at[a]] !== colorById[at[b]];

		if (swapped) {
			[at[a], at[b]] = [at[b], at[a]];
			swaps++;
		}

		taps++;
		history.push([at[a], at[b]]);
		log?.push({ a, b, swapped, hypotheses: live.length });
	}

	return { solved: solvedNow(), swaps, taps, ...(trace && { trace: log }) };
};
