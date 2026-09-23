<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { loadCommon, onPlay, ss } from './shared.svelte';
	import TextButton from './Text Button.svelte';
	import { _range } from './utils';
	import Hero from './Hero.svelte';

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

	const LINE = `Sixteen letters hide four words, one ${hi}secret color</span> each.`;

	const style =
		'font-size: 24px; width: 100%; padding: 10px 0; background: var(--ice); color: var(--dark); letter-spacing: 3px; font-weight: 600; border-radius: 999px;';
</script>

{#if ss.home}
	<div class="home ga11 nohi" in:fade={{ duration: 200 }}>
		<div class="title">Trade Secrets</div>
		<div class="tagline">Every peek risks a move</div>
		<div class="heros grid flowcol psc">
			<Hero size={3} />
			<Hero size={4} />
		</div>
		<div class="bullets">
			{#each _range(1, BULLETS.length) as id (id)}
				<div class="bullet-item">
					<div class="bullet bg-{((id - 1) % 3) + 1}"></div>
					{#if id === 1}
						{#key ss.size}
							{@const line = ss.size === 4 ? LINE : BULLETS[id - 1]}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<div class="text" in:fade>{@html line}</div>
						{/key}
					{:else}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<div class="text">{@html BULLETS[id - 1]}</div>
					{/if}
				</div>
			{/each}
		</div>
		<TextButton text={['PLAY']} onClick={onPlay} {style} />
	</div>
{/if}

<style>
	.home {
		display: grid;
		z-index: 1;
		place-content: center;
	}

	.heros {
		gap: 30px;
	}

	.title {
		justify-self: center;
		font-size: 48px;
		font-weight: 600;
		letter-spacing: 0.05em;
		color: var(--ink);
	}

	.tagline {
		justify-self: center;
		font-weight: 500;
		font-size: 16px;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		margin-bottom: 45px;
		opacity: 0.6;
		color: var(--ice);
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
		height: 9px;
		aspect-ratio: 1;
		translate: 0 8px;
		box-shadow: 2px 2px 2px black;
	}

	.text {
		line-height: 1.2em;
		letter-spacing: 0.04em;
		color: var(--ice);
	}
</style>
