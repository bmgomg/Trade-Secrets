// node --test src/lib/puzzle

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MAX_SPANNING, createRng, decodePuzzle, encodePuzzle, generate, isSolved, makeBank, searchFloor, solve, tapPair } from './index.js';

test('generation is deterministic per seed', () => {
	assert.equal(encodePuzzle(generate({ seed: 'x' })), encodePuzzle(generate({ seed: 'x' })));
	assert.deepEqual(makeBank({ count: 20, seed: 7 }), makeBank({ count: 20, seed: 7 }));
});

test('generated puzzles follow the deal rules and round-trip through codes', () => {
	const rng = createRng(1);

	for (let i = 0; i < 200; i++) {
		const p = generate({ rng });
		assert.ok(!isSolved(p.tiles));
		assert.ok(p.floor >= 3 && p.floor >= p.relaxedFloor);
		assert.ok(p.spanning.length <= 2);
		assert.deepEqual(decodePuzzle(encodePuzzle(p)), p);
	}
});

test('difficulty targeting', () => {
	const rng = createRng(2);

	for (let i = 0; i < 20; i++) {
		assert.equal(generate({ rng, floor: [6, 6] }).floor, 6);
		const p = generate({ rng, floor: [4, 5] });
		assert.ok(p.floor >= 4 && p.floor <= 5);
	}
});

test('legal floor matches search', () => {
	const rng = createRng(3);

	for (let i = 0; i < 60; i++) {
		const p = generate({ rng });
		assert.equal(p.floor, searchFloor(p.tiles), encodePuzzle(p));
	}
});

test('4×4: deal rules, codes, legal floor matches search, player model finishes', () => {
	const rng = createRng(5);

	for (let i = 0; i < 20; i++) {
		const p = generate({ size: 4, rng });
		assert.equal(p.tiles.length, 16);
		assert.ok(!isSolved(p.tiles));
		assert.ok(p.spanning.length <= MAX_SPANNING[4]);
		assert.deepEqual(decodePuzzle(encodePuzzle(p)), p);
	}

	for (let i = 0; i < 4; i++) {
		const p = generate({ size: 4, rng, floor: [0, 5] });
		assert.equal(p.floor, searchFloor(p.tiles), encodePuzzle(p));
	}

	for (let i = 0; i < 3; i++) {
		const p = generate({ size: 4, rng });
		assert.equal(solve(p, { oracle: true, strategy: 'guess', seed: i }).swaps, p.floor);
		assert.ok(solve(p, { strategy: 'guess', seed: i }).solved, encodePuzzle(p));
	}
});

test('same-color taps are refused', () => {
	const tiles = decodePuzzle('BAT-DOG-ELF:123456789').tiles;
	assert.equal(tapPair(tiles, 0, 1), tiles);
	assert.notEqual(tapPair(tiles, 0, 3), tiles);
});

test('oracle solver scores exactly the legal floor; player models always finish', () => {
	const rng = createRng(4);

	for (let i = 0; i < 40; i++) {
		const p = generate({ rng });
		assert.equal(solve(p, { oracle: true, seed: i }).swaps, p.floor);

		for (const strategy of ['expect', 'guess']) {
			const r = solve(p, { strategy, seed: i });
			assert.ok(r.solved, `${strategy} ${encodePuzzle(p)}`);
			assert.ok(r.swaps >= p.floor && r.taps >= r.swaps);
		}
	}
});

test('the returned solution is a legal, shortest, winning swap sequence', () => {
	for (const size of [3, 4]) {
		const rng = createRng(11);

		for (let i = 0; i < 100; i++) {
			const p = generate({ size, rng });
			const code = encodePuzzle(p);
			let tiles = p.tiles;

			assert.equal(p.solution.length, p.floor, code);

			for (const [a, b] of p.solution) {
				const next = tapPair(
					tiles,
					tiles.findIndex((t) => t.id === a),
					tiles.findIndex((t) => t.id === b)
				);

				assert.notEqual(next, tiles, code); // a same-color pair would have been refused
				tiles = next;
			}

			assert.ok(isSolved(tiles), code);
			assert.deepEqual(decodePuzzle(code).solution, p.solution);
		}
	}
});
