<script>
	import { GAP } from './const';
	import { ss } from './shared.svelte';
	import Tile from './Tile.svelte';
</script>

<div class="board grid psc" style="gap: {GAP}px;">
	{#each ss.pzl.tiles as tile, i (i)}
		<Tile bind:tile index={i} />
	{/each}
</div>

<style>
	.board {
		grid: repeat(3, auto) / repeat(3, auto);
	}
</style>
