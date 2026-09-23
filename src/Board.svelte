<script>
	import { flip } from 'svelte/animate';
	import { FLIP_MS, GAP } from './const';
	import { rowCol, ss } from './shared.svelte';
	import Tile from './Tile.svelte';
	import { linear } from 'svelte/easing';
	import { wordRows } from '$lib/puzzle';

	const valids = $derived(ss.pzl.tiles ? wordRows(ss.pzl.tiles) : []);
	const repeat = $derived(`repeat(${ss.size}, auto)`);
</script>

<div class="board psc" class:flip={ss.flip} class:pulse={ss.over} style="grid: {repeat} / {repeat}; gap: {GAP}px;">
	{#key ss.pzl}
		{#each ss.pzl.tiles as tile, i (tile.id)}
			{@const { row } = rowCol(i, ss.size)}
			{@const inWord = valids[row - 1]}
			<div animate:flip={{ duration: ss.over ? 1000 : FLIP_MS, easing: linear }}>
				<Tile {tile} {inWord} />
			</div>
		{/each}
	{/key}
</div>

<style>
	.board {
		display: grid;
		grid-area: 3/1;
		transition: rotate 0.5s linear;
	}

	@keyframes pulse {
		0% {
			scale: 1;
		}

		100% {
			scale: 0.9;
		}
	}

	.pulse {
		animation: pulse 0.15s linear 6 alternate 0.7s;
	}

	.flip {
		rotate: y 90deg;
	}
</style>
