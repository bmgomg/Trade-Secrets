<script>
	import { flip } from 'svelte/animate';
	import { FLIP_MS, GAP } from './const';
	import { ss } from './shared.svelte';
	import Tile from './Tile.svelte';
	import { linear } from 'svelte/easing';

	const repeat = $derived(`repeat(${ss.size}, auto)`);
</script>

<div class="board psc" class:pulse={ss.over} style="grid: {repeat} / {repeat}; gap: {GAP}px;">
	{#each ss.pzl.tiles as tile (tile.id)}
		<div animate:flip={{ duration: FLIP_MS, easing: linear }}>
			<Tile {tile} />
		</div>
	{/each}
</div>

<style>
	.board {
		display: grid;
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
</style>
