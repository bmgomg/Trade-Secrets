<script>
	import NumberFlow from '@number-flow/svelte';
	import { ss } from './shared.svelte';
	// import Rating from './Rating.svelte';
	// import { starRating } from './shared.svelte';

	const par = $derived(ss.pzl.floor ?? 0);
</script>

<div class="scoreboard grid psc flowcol">
	{#snippet item(value, label)}
		<div class="counter grid">
			<span class="label">{label}</span>
			{#if label === 'Rating'}
				<!-- <Rating /> -->
			{:else}
				<div class="value"><NumberFlow value={value || 0} format={{ useGrouping: false }} /></div>
			{/if}
		</div>
	{/snippet}
	{@render item(par, 'trade floor')}
	{@render item(ss.pzl.trades ?? 0, 'your trades')}
	<!-- {@render item(starRating(), 'Rating')} -->
</div>

<style>
	.scoreboard {
		gap: 40px;
	}

	.counter {
		justify-items: center;
	}

	.value {
		font-family: Archivo;
		font-size: 44px;
        font-weight: 800;
        /* color: var(--ice); */
	}

	.label {
		/* font-size: 24px; */
        text-transform: uppercase;
		letter-spacing: 0.15em;
	}
</style>
