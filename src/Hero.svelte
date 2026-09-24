<script>
	import { HERO_TILES } from './const';
	import { persistCommon, ss } from './shared.svelte';
	import { tap } from './sound.svelte';
	import { _range, post } from './utils';

	const { size } = $props();
	const selected = $derived(ss.size === size);

	const onTap = () => {
		tap();
		
		ss.sizeChanged = true;

		post(() => {
			ss.size = size;
			persistCommon();

			delete ss.sizeChanged;
		}, 150);
	};
</script>

<div class="hero grid hero-{size}" class:nope={selected} onpointerdown={onTap}>
	{#each _range(1, size * size) as i (i)}
		{@const tile = HERO_TILES[size - 3][i - 1]}
		<div class="grid tile-{size} bg-{tile.bg}" class:selected>{tile.ch}</div>
	{/each}
</div>

<style>
	.hero {
		font-family: Archivo;
		color: var(--dark);
		cursor: pointer;
	}

	.hero:hover {
		filter: brightness(1.1);
	}

	.hero-3 {
		gap: 10px;
		grid: repeat(3, 50px) / repeat(3, 50px);
		font-weight: 800;
		font-size: 28px;
	}

	.hero-4 {
		gap: 6px;
		grid: repeat(4, 38px) / repeat(4, 38px);
		font-weight: 800;
		font-size: 19px;
	}

	.tile-3,
	.tile-4 {
		filter: grayscale(1);
		place-content: center;
		opacity: 0.35;
		transition: all 0.3s;
	}

	.tile-3 {
		border-radius: 9px;
	}

	.tile-4 {
		border-radius: 6px;
	}

	.selected {
		opacity: 1;
		filter: none;
	}
</style>
