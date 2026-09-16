<script>
	import { GAP, TILE_SIZE } from './const';
	import { bg, onTradeComplete, ss } from './shared.svelte';
	import { tap } from './sound.svelte';
	import { post, rowCol } from './utils';

	const { tile, index } = $props();
	const selected = $derived(ss.trade?.includes(tile));
	const background = $derived(selected ? bg(tile.color) : 'var(--water)');
	const color = $derived(selected ? 'var(--dark)' : 'var(--ice)');
	const trading = $derived(ss.trade?.length === 2);
	const nope = $derived(selected || trading);

	const off = $derived.by(() => {
		if (!trading || !selected) {
			return { x: 0, y: 0 };
		}

		const { row: r1, col: c1 } = rowCol(index);

		let i = 1 - ss.trade.indexOf(tile);
		const other = ss.trade[i];

		i = ss.pzl.tiles.indexOf(other);
		const { row: r2, col: c2 } = rowCol(i);

        const sz = TILE_SIZE + GAP;
		return { x: (c2 - c1) * sz, y: (r2 - r1) * sz };
	});

	const onTap = () => {
		tap();

		ss.trade ??= [];
		ss.trade.push(tile);

		if (ss.trade?.length === 2) {
			post(onTradeComplete, 1200);
		}
	};

	const style = $derived(`translate: ${off.x}px ${off.y}px; z-index: ${selected ? 1 : 0}`);
</script>

<div id={'tile-' + tile.id} class="tile grid" class:nope {style} onpointerdown={onTap}>
	<div class="inner grid" style="width: {TILE_SIZE}px; background: {background}; color: {color};">
		{tile.letter}
	</div>
</div>

<style>
	.tile {
		cursor: pointer;
		box-sizing: border-box;
		border-radius: 10px;
		transition: translate 0.5s 0.5s linear;
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
