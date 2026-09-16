// Player-model solver: sees letters and knows the dictionary, but learns colors only by tapping.
//
// Each turn it keeps every color hypothesis consistent with what it remembers (a split of the
// tiles into words, with a color per word), all equally likely. Under a hypothesis h,
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

import { lexiconFor, sortKey } from './dict.js';
import { createRng } from './rng.js';
import { SIZES, floors } from './rules.js';

const permutations = (items) =>
	items.length <= 1 ? [items] : items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((p) => [x, ...p]));

// size -> every assignment of colors 1..n to the n words
const LABELINGS = Object.fromEntries(SIZES.map((n) => [n, permutations([...Array(n).keys()].map((c) => c + 1))]));

/**
 * Every way to split the tiles into words, as group-by-tile-id arrays (group 0 holds the lowest id).
 * `ids` are all tile ids. Colors aren't assigned yet: each split stands for n! color hypotheses.
 */
export const wordSplits = (letterById, ids) => {
	const n = Math.round(Math.sqrt(ids.length));
	const { anagrams } = lexiconFor(n);
	const isWord = (group) => anagrams.has(sortKey(group.map((id) => letterById[id])));
	const out = [];
	const groups = [];

	// the lowest remaining id goes in the next group, with n − 1 others
	const split = (rest) => {
		if (!rest.length) {
			const s = [];
			groups.forEach((g, i) => g.forEach((id) => (s[id] = i)));
			out.push(s);
			return;
		}

		const choose = (start, group) => {
			if (group.length === n) {
				if (isWord(group)) {
					groups.push(group);
					split(rest.filter((id) => !group.includes(id)));
					groups.pop();
				}

				return;
			}

			for (let i = start; i < rest.length; i++) {
				choose(i + 1, [...group, rest[i]]);
			}
		};

		choose(1, [rest[0]]);
	};

	split(ids);

	return out;
};

// color per group, as fixed by `known` (tile id -> color); null if the split contradicts it
const groupColors = (s, known, n) => {
	const fixed = new Array(n).fill(0);

	for (const [id, c] of known) {
		if (fixed[s[id]] && fixed[s[id]] !== c) {
			return null;
		}

		fixed[s[id]] = c;
	}

	return new Set(fixed.filter(Boolean)).size === fixed.filter(Boolean).length ? fixed : null;
};

/** Colors-by-tile-id arrays for split `s` that agree with `known` (tile id -> color). */
export const labelSplit = (s, known = new Map()) => {
	const n = Math.max(...s.filter((g) => g !== undefined)) + 1;
	const fixed = groupColors(s, known, n);

	if (!fixed) {
		return [];
	}

	return LABELINGS[n].filter((lab) => lab.every((c, g) => !fixed[g] || fixed[g] === c)).map((lab) => s.map((g) => lab[g]));
};

/** Every colors-by-tile-id array in which each color's tiles spell a word. */
export const colorHypotheses = (letterById, ids, known) => wordSplits(letterById, ids).flatMap((s) => labelSplit(s, known));

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
	const cells = puzzle.tiles.length;
	const n = Math.round(Math.sqrt(cells));
	const letterById = [];
	const colorById = [];

	for (const t of puzzle.tiles) {
		letterById[t.id] = t.letter;
		colorById[t.id] = t.color;
	}

	if (strategy === 'expect' && n > 3 && !oracle) {
		throw new Error(`The 'expect' strategy is too slow for ${n}×${n}; use 'guess'`);
	}

	const at = puzzle.tiles.map((t) => t.id); // position -> tile id
	const splits = wordSplits(
		letterById,
		puzzle.tiles.map((t) => t.id).sort((x, y) => x - y)
	);
	let pool = splits; // with full memory, splits consistent with everything seen so far only shrink
	const history = []; // tile ids revealed per tap pair
	const cache = new Map();
	const log = trace ? [] : undefined;
	let swaps = 0;
	let taps = 0;

	// legal floor of the board `ids` if colors were `h`; color labels are canonicalized for the cache
	const cost = (h, ids) => {
		const letters = ids.map((id) => letterById[id]);
		const relabel = new Array(n + 1).fill(-1);
		let next = 1;
		const colors = ids.map((id) => (relabel[h[id]] < 0 ? (relabel[h[id]] = next++) : relabel[h[id]]));
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

	// no win fired, so a hypothesis under which the board is already solved is wrong
	const possible = (h) => cost(h, at) > 0;

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

	const positions = [...Array(cells).keys()];

	const swapCost = (h, a, b) => {
		const moved = at.slice();
		[moved[a], moved[b]] = [moved[b], moved[a]];
		return cost(h, moved);
	};

	// 'guess': commit to one random hypothesis and play toward it; re-guess when a color contradicts it
	let guess = null;

	// a random hypothesis agreeing with `known`, among `live` splits
	const pickGuess = (live, known) => {
		for (const s of rng.shuffle(live)) {
			const h = rng.shuffle(labelSplit(s, known)).find(possible);

			if (h) {
				return h;
			}
		}
	};

	const guessTurn = (live, known) => {
		const progress = (h) => {
			const base = cost(h, at);
			const pairs = [];

			for (let a = 0; a < cells; a++) {
				for (let b = a + 1; b < cells; b++) {
					if (h[at[a]] !== h[at[b]] && swapCost(h, a, b) < base) {
						pairs.push([a, b], [b, a]);
					}
				}
			}

			return pairs;
		};

		if (!guess || !consistent(guess, known) || !possible(guess)) {
			guess = pickGuess(live, known);
		}

		const a = rng.pick([...new Set(progress(guess).map(([p]) => p))]);

		if (guess[at[a]] !== colorById[at[a]]) {
			const revealed = new Map(known).set(at[a], colorById[at[a]]);
			guess = pickGuess(
				live.filter((s) => groupColors(s, revealed, n)),
				revealed
			);
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

		// value[i][a * cells + b] under live[i]
		const value = live.map((h, i) => {
			const v = new Array(cells * cells).fill(bases[i]);

			for (let a = 0; a < cells; a++) {
				for (let b = a + 1; b < cells; b++) {
					if (h[at[a]] !== h[at[b]]) {
						v[a * cells + b] = v[b * cells + a] = 1 + swapCost(h, a, b);
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

			return argmin(candidates, (q) => ids.reduce((s, i) => s + value[i][a * cells + q], 0), uncertainIn(ids));
		};

		// expected value of tapping a first, summed over the colors it might show
		const firstTapValue = (a) => {
			const byColor = Array.from({ length: n + 1 }, () => []);
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
		const live = (memory === Infinity ? pool : splits).filter((s) => groupColors(s, known, n));

		if (memory === Infinity) {
			pool = live;
		}

		const [a, b] = strategy === 'guess' ? guessTurn(live, known) : expectTurn(live.flatMap((s) => labelSplit(s, known)).filter(possible));
		const swapped = colorById[at[a]] !== colorById[at[b]];

		if (swapped) {
			[at[a], at[b]] = [at[b], at[a]];
			swaps++;
		}

		taps++;
		history.push([at[a], at[b]]);
		log?.push({ a, b, swapped, splits: live.length });
	}

	return { solved: solvedNow(), swaps, taps, splits: splits.length, ...(trace && { trace: log }) };
};
