<script>
	import { TILE_SIZE } from './const';
	import { bg, onTradeComplete, ss } from './shared.svelte';
	import { tap } from './sound.svelte';
	import { post } from './utils';

	const { tile } = $props();
	const selected = $derived(ss.trade?.includes(tile));
	const background = $derived(selected ? bg(tile.color) : 'var(--water)');
	const color = $derived(selected ? 'var(--dark)' : 'var(--ice)');
	const trading = $derived(ss.trade?.length === 2);
	const nope = $derived(selected || trading);

	const onTap = () => {
		tap();

		ss.trade ??= [];
		ss.trade.push(tile);

		if (ss.trade?.length === 2) {
			post(onTradeComplete, 500);
		}
	};
</script>

<div id={'tile-' + tile.id} class="tile grid" class:nope onpointerdown={onTap}>
	<div class="inner grid" style="width: {TILE_SIZE}px; background: {background}; color: {color};">
		{tile.letter}
	</div>
</div>

<style>
	.tile {
		cursor: pointer;
		box-sizing: border-box;
		border-radius: 10px;
	}

	.inner {
		aspect-ratio: 1;
		place-content: center;
		border-radius: inherit;
		font-family: Archivo;
		font-size: 40px;
		font-weight: 800;
		color: var(--ice);
		transition: all 0.5s;
	}
</style>
