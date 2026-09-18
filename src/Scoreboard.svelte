<script>
	import NumberFlow from '@number-flow/svelte';
	import { ss, starRating } from './shared.svelte';
	import Rating from './Rating.svelte';

	const par = $derived(ss.pzl.floor ?? 0);
</script>

<div class="scoreboard grid psc flowcol">
	{#snippet item(value, label)}
		<div class="counter grid">
			<span class="label">{label}</span>
			{#if label === 'rating'}
				<Rating />
			{:else}
				<div class="value"><NumberFlow value={value || 0} format={{ useGrouping: false }} /></div>
			{/if}
		</div>
	{/snippet}
	{@render item(par, 'trade floor')}
	{@render item(starRating(), 'rating')}
	{@render item(ss.pzl.trades ?? 0, 'your trades')}
</div>

<style>
	.scoreboard {
		gap: 20px;
	}

	.counter {
		justify-items: center;
	}

	.value {
		font-family: Archivo;
		font-size: 40px;
        font-weight: 800;
        /* color: var(--ice); */
	}

	.label {
		font-size: 15px;
        text-transform: uppercase;
		letter-spacing: 0.15em;
	}
</style>
