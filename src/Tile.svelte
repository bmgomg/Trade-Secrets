<script>
	import { TILE_SIZE } from './const';
	import { bg, ss } from './shared.svelte';
	import { tap } from './sound.svelte';
	import { post, rowCol } from './utils';

	const { tile, index } = $props();
	const selected = $derived(ss.trade?.includes(tile));
	const background = $derived(selected ? bg(tile.color) : 'var(--water)');
	const color = $derived(selected ? 'var(--dark)' : 'var(--ice)');
	const trading = $derived(ss.trade?.length === 2);
	const nope = $derived(selected || trading);

	const off = $derived.by(() => {
		if (!trading || !ss.trade.includes(tile)) {
			return { x: 0, y: 0 };
		}

		const { row: r1, col: c1 } = rowCol(index);

		let i = 1 - ss.trade.indexOf(tile);
		const other = ss.trade[i];

		i = ss.pzl.tiles.indexOf(other);
		const { row: r2, col: c2 } = rowCol(i);

		return { x: (c2 - c1) * 110, y: (r2 - r1) * 110 };
	});

	const onTap = () => {
		tap();

		ss.trade ??= [];
		ss.trade.push(tile);

		if (ss.trade?.length === 2) {
			post(() => delete ss.trade, 1000);
		}
	};

	const style = $derived(`translate: ${off.x}px ${off.y}px;`);
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
		transition:
			background-color 0.2s,
			color 0.2s;
	}
</style>
