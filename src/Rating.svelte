<script>
	import { starRating } from './shared.svelte';

	const r = $derived(starRating());
</script>

<div class="rating" onpointerdown={() => starRating()}>
	{#each [1, 2, 3, 4, 5] as i (i)}
		{@const dim = r === 0 || i > r}
		<span class={dim ? 'dim' : 'bright'} in>{dim ? '☆' : '★'}</span>
	{/each}
</div>

<style>
	.rating {
		font-size: 28px;
		letter-spacing: 0.15em;
		margin-top: -9px;
		display: grid;
		grid-auto-flow: column;
		cursor:pointer;
	}

	.dim {
		color: #e6f1fb60;
	}

	.bright {
		color: #e8cc80;
		text-shadow: 0 0 20px #e8cc8080;
	}
</style>
