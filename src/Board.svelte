<script>
	import { flip } from 'svelte/animate';
	import { FLIP_MS, GAP } from './const';
	import { ss } from './shared.svelte';
	import Tile from './Tile.svelte';
	import { linear } from 'svelte/easing';

	const repeat = $derived(`repeat(${ss.size}, auto)`);
</script>

<div class="board psc" style="grid: {repeat} / {repeat}; gap: {GAP}px;">
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
</style>
