<script>
	import { dict3 } from '$lib/puzzle/dict3';
	import { dict4 } from '$lib/puzzle/dict4';
	import { fade } from 'svelte/transition';
	import { ss } from './shared.svelte';

	const d3 = [...dict3].sort();
	const d4 = [...dict4].sort();

	let size = $state(3);
	let dict = $derived(size === 3 ? d3 : d4);

	// each time the dictionary pops up, show the one matching the current puzzle size
	$effect(() => {
		if (ss.showDictionary) {
			size = ss.size;
		}
	});

	const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
</script>

{#if ss.showDictionary}
	<div class="Dictionary" transition:fade={{ duration: 200 }}>
		<div class="selector">
			<div class="selector-item" class:selected={size === 3} onpointerdown={() => (size = 3)}>3</div>
			<div class="selector-item" class:selected={size === 4} onpointerdown={() => (size = 4)}>4</div>
		</div>
		{#each [d3, d4] as d, i (i)}
			<div class="content" class:hidden={d !== dict} tabindex="-1">
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
	.Dictionary {
		position: absolute;
		/* 20px inside app-content; the bottom stops above the toolbar (50px buttons + 20px margin) */
		inset: 25px 25px 90px;
		z-index: 3;
		display: grid;
		grid: auto minmax(0, 1fr) / minmax(0, 1fr);
		padding: 18px 10px 18px 15px;
		box-sizing: border-box;
		font-family: Archivo;
		font-size: 14px;
		background: #000000c0;
		border: 2px solid #c5e2ffa0;
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
		background: var(--ink);
		color: var(--bg);
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
		overflow-y: auto;
		overscroll-behavior: contain;
		touch-action: pan-y;
		scrollbar-width: thin;
		scrollbar-color: var(--ink) transparent;
		display: grid;
		align-content: start;
		gap: 5px;
		outline: none !important;
		transition: opacity 0.35s;
		z-index: 1;
	}

	.hidden {
		opacity: 0;
		pointer-events: none;
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
		background: var(--ink);
		color: var(--bg);
		opacity: 0.7;
		font-weight: bold;
		border-radius: 50%;
		width: 20px;
		aspect-ratio: 1;
		place-self: start;
	}

	.section-content {
		grid-area: 1/2;
		color: var(--ink);
		font-family: RM;
	}
</style>
