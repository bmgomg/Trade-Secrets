<script>
	import { TILE_SIZES } from './const';
	import { bg, doTrade, ss } from './shared.svelte';
	import { sfx, tap } from './sound.svelte';
	import { post } from './utils';

	const { tile } = $props();
	const selected = $derived(ss.trade?.includes(tile));
	const background = $derived(selected ? bg(tile.color) : 'var(--water)');
	const color = $derived(selected ? 'var(--dark)' : 'var(--ice)');
	const trading = $derived(ss.trade?.length === 2);
	const nope = $derived(selected || trading);

	const onTap = () => {
		ss.trade ??= [];
		ss.trade.push(tile);

		if (ss.trade?.length !== 2) {
			sfx('click');
			return;
		}

		if (ss.trade[0].color === ss.trade[1].color) {
			sfx('cluck');
			post(() => delete ss.trade, 800);
		} else {
			sfx('click');
			post(doTrade, 500);
		}
	};
</script>

<div id={'tile-' + tile.id} class="tile grid" class:nope onpointerdown={onTap}>
	<div class="inner grid" style="width: {TILE_SIZES[ss.size - 3]}px; background: {background}; color: {color};">
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
