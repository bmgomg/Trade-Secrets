// Stats harness for the puzzle generator and player-model solver.
// Usage: node scripts/puzzle-stats.js [--size=3] [--n=400] [--seed=stats] [--maxSpanning=2]
//        [--memory=Infinity,1] [--strategy=expect,guess]
// Limited memory can make the solver cycle; those games count as unsolved at maxTaps.
// The 'expect' strategy is skipped for 4×4 (too slow).

import { MAX_SPANNING, generate, solve, sortKey, wordSplits } from '../src/lib/puzzle/index.js';
import { createRng } from '../src/lib/puzzle/rng.js';

const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;

const size = +arg('size', 3);
const n = +arg('n', 400);
const seed = arg('seed', 'stats');
const maxSpanning = +arg('maxSpanning', MAX_SPANNING[size]);
const memories = arg('memory', 'Infinity').split(',').map(Number);
const strategies = arg('strategy', size > 3 ? 'guess' : 'expect,guess').split(',');

// ambiguity: tile-level word splits, and distinct sets of words they spell (ignoring anagrams and which tile is which)
const ambiguity = (p) => {
	const letterById = [];
	p.tiles.forEach((t) => (letterById[t.id] = t.letter));

	const splits = wordSplits(
		letterById,
		p.tiles.map((t) => t.id).sort((x, y) => x - y)
	);

	const sets = new Set(
		splits.map((s) => {
			const groups = Array.from({ length: size }, () => []);
			s.forEach((g, id) => groups[g].push(letterById[id]));
			return groups.map(sortKey).sort().join(' ');
		})
	);

	return { splits: splits.length, wordSets: sets.size };
};

const median = (xs) => {
	const s = xs.slice().sort((a, b) => a - b);
	return s.length ? s[s.length >> 1] : NaN;
};

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

const histogram = (title, xs) => {
	const counts = new Map();
	xs.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1));
	console.log(`\n${title}  (mean ${mean(xs).toFixed(2)}, median ${median(xs)})`);

	for (const [v, c] of [...counts].sort((a, b) => a[0] - b[0])) {
		const pct = (100 * c) / xs.length;
		console.log(`  ${String(v).padStart(3)}  ${pct.toFixed(1).padStart(5)}%  ${'#'.repeat(Math.round(pct / 2))}`);
	}
};

const byKey = (title, rows, key, value) => {
	console.log(`\n${title}`);
	const groups = new Map();
	rows.forEach((r) => (groups.has(r[key]) ? groups.get(r[key]).push(r) : groups.set(r[key], [r])));

	for (const [k, rs] of [...groups].sort((a, b) => a[0] - b[0])) {
		const vs = rs.map(value);
		console.log(`  ${key} ${String(k).padStart(2)}  n=${String(rs.length).padStart(4)}  median ${median(vs)}  mean ${mean(vs).toFixed(2)}`);
	}
};

const rng = createRng(seed);
const puzzles = [];
const genMs = [];

for (let i = 0; i < n; i++) {
	const t = performance.now();
	const p = generate({ size, maxSpanning, rng });
	genMs.push(performance.now() - t);
	puzzles.push({ ...p, spanningCount: p.spanning.length, ...ambiguity(p) });
}

console.log(`${n} ${size}×${size} puzzles, seed "${seed}", maxSpanning ${maxSpanning}`);
console.log(
	`generation: mean ${mean(genMs).toFixed(3)} ms, median ${median(genMs).toFixed(3)} ms, max ${Math.max(...genMs).toFixed(1)} ms`
);
histogram(
	'legal floor (perfect info, legal swaps)',
	puzzles.map((p) => p.floor)
);
histogram(
	'relaxed floor (prototype: any two tiles may trade)',
	puzzles.map((p) => p.relaxedFloor)
);
histogram(
	'legal − relaxed',
	puzzles.map((p) => p.floor - p.relaxedFloor)
);
histogram(
	'spanning letters',
	puzzles.map((p) => p.spanningCount)
);
console.log(
	`\ndistinct word sets the letters could spell: mean ${mean(puzzles.map((p) => p.wordSets)).toFixed(1)}, median ${median(puzzles.map((p) => p.wordSets))}`
);
byKey('legal floor, by spanning letters', puzzles, 'spanningCount', (p) => p.floor);
byKey('distinct word sets, by spanning letters', puzzles, 'spanningCount', (p) => p.wordSets);
byKey('tile-level splits, by spanning letters', puzzles, 'spanningCount', (p) => p.splits);

const variants = [
	{ name: 'oracle (knows all colors)', oracle: true },
	...strategies
		.filter((strategy) => size === 3 || strategy !== 'expect')
		.flatMap((strategy) => memories.map((memory) => ({ name: `${strategy}, memory ${memory} tap pairs`, strategy, memory })))
];

for (const v of variants) {
	const t = performance.now();
	const rows = puzzles.map((p, i) => ({ ...p, ...solve(p, { ...v, seed: `${seed}:${i}` }) }));
	const ms = (performance.now() - t) / n;
	const done = rows.filter((r) => r.solved);

	console.log(`\n=== solver: ${v.name} ===`);
	console.log(`solved ${done.length}/${n}, ${ms.toFixed(1)} ms per game`);

	if (!done.length) {
		continue;
	}

	console.log(`swaps mean ${mean(done.map((r) => r.swaps)).toFixed(2)}, taps mean ${mean(done.map((r) => r.taps)).toFixed(2)}`);
	histogram(
		'swaps',
		done.map((r) => r.swaps)
	);
	histogram(
		'tapped pairs',
		done.map((r) => r.taps)
	);
	histogram(
		'swaps − legal floor',
		done.map((r) => r.swaps - r.floor)
	);
	byKey('swaps − relaxed floor, by relaxed floor', done, 'relaxedFloor', (r) => r.swaps - r.relaxedFloor);
	byKey('swaps − legal floor, by legal floor', done, 'floor', (r) => r.swaps - r.floor);
	byKey('swaps − legal floor, by spanning letters', done, 'spanningCount', (r) => r.swaps - r.floor);
	byKey('tapped pairs − swaps, by spanning letters', done, 'spanningCount', (r) => r.taps - r.swaps);
}
