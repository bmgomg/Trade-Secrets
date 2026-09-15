<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { loadCommon, ss } from './shared.svelte';
	import TextButton from './Text Button.svelte';
	import { _range } from './utils';

	onMount(loadCommon);

	const hi = '<span style="color: var(--teal);">';

	const BULLETS = [
		`Nine letters hide three words, one ${hi}secret color</span> each.`,
		`Tap two letters to ${hi}reveal their colors</span>.`,
		`${hi}Different colors</span> trade places. ${hi}Matching colors</span> stay put.`,
		'Either way, the colors go dark again.',
		`You win when each row is a word in a ${hi}single color</span>.`,
		'Solve in as few trades as possible.'
	];

	const TILES = [
		{ ch: 'Y', bg: 1 },
		{ ch: 'G', bg: 2 },
		{ ch: 'A', bg: 3 },
		{ ch: 'P', bg: 1 },
		{ ch: 'S', bg: 1 },
		{ ch: 'I', bg: 2 },
		{ ch: 'N', bg: 2 },
		{ ch: 'D', bg: 3 },
		{ ch: 'F', bg: 3 }
	];

	const style =
		'font-size: 24px; width: 100%; padding: 10px 0; background: var(--teal); color: var(--dark); letter-spacing: 3px; font-weight: 600; border-radius: 999px;';
</script>

{#if ss.home}
	<div class="home ga11 nohi" in:fade={{ duration: 200 }}>
		<!-- <img src={Hero} alt="" width={200} /> -->
		<div class="hero psc grid">
			{#each _range(1, 9) as i (i)}
				{@const tile = TILES[i - 1]}
				<div class="tile grid bg-{((tile.bg - 1) % 3) + 1}">{tile.ch}</div>
			{/each}
		</div>
		<div class="title">Trade Secrets</div>
		<div class="tagline">Every peek risks a move</div>
		<div class="bullets">
			{#each _range(1, BULLETS.length) as i (i)}
				<div class="bullet-item">
					<div class="bullet bg-{((i - 1) % 3) + 1}"></div>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<div class="text">{@html BULLETS[i - 1]}</div>
				</div>
			{/each}
		</div>
		<TextButton text={['PLAY']} onClick={() => delete ss.home} {style} />
	</div>
{/if}

<style>
	.home {
		display: grid;
		z-index: 1;
		place-content: center;
	}

	.hero {
		gap: 10px;
		grid: repeat(3, 60px) / repeat(3, 60px);
	}

	.tile {
		border-radius: 9px;
		place-content: center;
		font-family: Archivo;
		font-weight: 800;
		font-size: 28px;
		color: var(--dark);
	}

	.title {
		justify-self: center;
		font-size: 48px;
		font-weight: 600;
		letter-spacing: 0.05em;
		margin-top: 25px;
		color: var(--ice);
	}

	.tagline {
		justify-self: center;
		font-weight: 500;
		font-size: 16px;
		letter-spacing: 1.5px;
		text-transform: uppercase;
	}

	.bullets {
		margin: 40px 0 50px;
		width: 380px;
		display: grid;
		gap: 10px;
		font-size: 19px;
		text-wrap: pretty;
	}

	.bullet-item {
		display: grid;
		grid: auto / auto 1fr;
		gap: 1em;
	}

	.bullet {
		background: var(--cream);
		height: 9px;
		aspect-ratio: 1;
		translate: 0 8px;
		box-shadow: 2px 2px 2px black;
	}

	.bg-1 {
		background: var(--teal);
	}

	.bg-2 {
		background: var(--gold);
	}

	.bg-3 {
		background: var(--pink);
	}

	.text {
		line-height: 1.2em;
		letter-spacing: 0.04em;
	}
</style>
