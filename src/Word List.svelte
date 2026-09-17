<script>
	import { dict3 } from '$lib/puzzle/dict3';
	import { dict4 } from '$lib/puzzle/dict4';
	import { fade } from 'svelte/transition';
	import { clientRect, scrollClass } from './utils';
	import { ss } from './shared.svelte';

	const d3 = [...dict3].sort();
	const d4 = [...dict4].sort();

	let style = $state('');
	let dict = $state(d3);
	const wordlen = $derived(dict[0].length);

	$effect(() => {
		const onResize = () => {
			const r = clientRect('.game-page');
			style = `left: ${r.x - 5}px; top: ${r.y}px; width: ${r.width + 10}px; height: ${r.height - 70}px;`;
		};

		onResize();

		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
</script>

{#if ss.showDictionary}
	<div class="wordlist" {style} transition:fade={{ duration: 200 }}>
		<div class="selector">
			<div class="selector-item {wordlen === 3 ? 'selected' : ''}" onpointerdown={() => (dict = d3)}>3</div>
			<div class="selector-item {wordlen === 4 ? 'selected' : ''}" onpointerdown={() => (dict = d4)}>4</div>
		</div>
		{#each [d3, d4] as d, i (i)}
			<div class="content {scrollClass()} {wordlen === i + 3 ? '' : 'hidden'}" tabindex="-1">
				{#each ABC as ch (ch)}
					{@const words = d.filter((word) => word.startsWith(ch))}
					{#if words.length}
						<div class="section">
							<div class="section-header">{ch}</div>
							<div class="section-content">
								{words.filter((word) => word.startsWith(ch)).join(' ')}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	.wordlist {
		position: absolute;
		z-index: 3;
		justify-self: center;
		display: grid;
		grid: auto 1fr / auto;
		padding: 18px 10px 18px;
		box-sizing: border-box;
		font-family: Poppins;
		font-size: 14px;
		background: #000000c0;
		border: 2px solid #c5e2ffc0;
		border-radius: 10px;
		backdrop-filter: blur(10px);
		filter: drop-shadow(0 0 3px black);
	}

	.selector {
		grid-area: 1/1;
		display: grid;
		grid-auto-flow: column;
		place-content: center;
		gap: 30px;
		padding: 0 0 15px;
		font-size: 16px;
	}

	.selector-item {
		display: grid;
		place-content: center;
		background: var(--lightblue);
		opacity: 0.7;
		font-weight: bold;
		border-radius: 50%;
		width: 28px;
		aspect-ratio: 1;
		cursor: pointer;
		transition: 0.35s;
	}

	.selected {
		pointer-events: none;
		cursor: initial;
		background: white;
		opacity: 1;
	}

	.selector-item:hover {
		opacity: 1;
	}

	.content {
		grid-area: 2/1;
		padding-right: 10px;
		display: grid;
		align-content: start;
		gap: 5px;
		outline: none !important;
		transition: opacity 0.35s;
		z-index: 1;
	}

	.hidden {
		opacity: 0;
		z-index: 0;
	}

	.section {
		display: grid;
		grid: auto / auto 1fr;
		gap: 20px;
	}

	.section-header {
		grid-area: 1/1;
		display: grid;
		place-content: center;
		background: var(--lightblue);
		opacity: 0.7;
		font-weight: bold;
		border-radius: 50%;
		width: 20px;
		aspect-ratio: 1;
		place-self: start;
	}

	.section-content {
		grid-area: 1/2;
		color: var(--lightblue);
		font-family: Roboto Mono;
	}
</style>
