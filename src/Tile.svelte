<script>
	import { cid } from './shared.svelte';

	const { tile, id } = $props();
</script>

<div id={'tile-' + id} class="tile grid bg-{cid(tile.color)}">
	{tile.letter}
</div>

<style>
	.tile {
		width: 100px;
		aspect-ratio: 1;
		place-content: center;
		font-family: Archivo;
		font-size: 48px;
		font-weight: 800;
		color: var(--dark);
	}
</style>
