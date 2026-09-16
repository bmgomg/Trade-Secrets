<script>
	import { ss } from './shared.svelte';
	import Tile from './Tile.svelte';
</script>

<div class="board grid psc">
	{#each ss.pzl.tiles as tile, i (i)}
		<Tile {tile} id={i + 1}/>
	{/each}
</div>

<style>
	.board {
		display: grid;
		grid: repeat(3, auto) / repeat(3, auto);
		gap: 10px;
	}
</style>
