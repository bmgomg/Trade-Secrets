<script>
	import NumberFlow from '@number-flow/svelte';
	import { ss } from './shared.svelte';
</script>

<div id="stats">
	{#snippet score(label, value)}
		<div class="item">
			<span class="label">{label}</span>
			<div class="value">
				<NumberFlow {value} />
			</div>
		</div>
	{/snippet}
	{@render score('plays', ss.stats.plays)}
	{@render score('ave', 0)}
	{@render score('best', ss.stats.best)}
</div>

<style>
	#stats {
		display: grid;
		cursor: initial;
		grid: auto/auto;
		grid-auto-flow: column;
		place-self: end center;
		gap: 30px;
		min-width: 330px;
	}

	.item {
		display: grid;
		align-items: baseline;
		grid-auto-flow: column;
		gap: 5px;
	}

	.label {
		font-size: 16px;
		letter-spacing: 0.25em;
		text-transform: uppercase;
	}

	.value {
		font-family: Archivo;
		font-size: 19px;
		font-weight: 800;
        color: var(--ice);
	}
</style>
