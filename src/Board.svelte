<script>
	import { flip } from 'svelte/animate';
	import { FLIP_MS, GAP } from './const';
	import { ss } from './shared.svelte';
	import Tile from './Tile.svelte';
	import { linear } from 'svelte/easing';
</script>

<div class="board grid psc" style="gap: {GAP}px;">
	{#each ss.pzl.tiles as tile (tile.id)}
		<div animate:flip={{ duration: FLIP_MS, easing: linear }}>
			<Tile {tile} />
		</div>
	{/each}
</div>

<style>
	.board {
		grid: repeat(3, auto) / repeat(3, auto);
	}
</style>
