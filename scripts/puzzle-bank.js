// Precomputes a deterministic puzzle bank as JSON: an array of codes ("BAT-DOG-ELF:402135786").
// Decode with decodePuzzle() from src/lib/puzzle.
// Usage: node scripts/puzzle-bank.js --out=static/puzzles.json [--count=1000] [--seed=bank] [--size=3] [--floor=4,6]

import { writeFileSync } from 'node:fs';
import { makeBank } from '../src/lib/puzzle/index.js';

const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const range = (s) => (s ? s.split(',').map(Number) : undefined);

const out = arg('out');

if (!out) {
	console.error('Missing --out=<file.json>');
	process.exit(1);
}

const options = Object.fromEntries(
	[
		['size', +arg('size', 3)],
		['floor', range(arg('floor'))],
		['relaxed', range(arg('relaxed'))]
	].filter(([, v]) => v)
);

const t = performance.now();
const codes = makeBank({ count: +arg('count', 1000), seed: arg('seed', 'bank'), ...options });

writeFileSync(out, JSON.stringify(codes, null, '\t') + '\n');
console.log(`${codes.length} puzzles → ${out} (${(performance.now() - t).toFixed(0)} ms)`);
