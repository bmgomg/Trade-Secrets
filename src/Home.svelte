<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { loadCommon, ss } from './shared.svelte';
	import TextButton from './Text Button.svelte';

	onMount(loadCommon);

    const hi = '<span style="color: var(--cream);">';
</script>

{#if ss.home}
	<div class="home ga11 nohi" in:fade={{ duration: 200 }}>
		{#snippet bullet(text)}
			<div class="bullet-item">
				<div class="bullet"></div>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<div class="text">{@html text}</div>
			</div>
		{/snippet}
		<div class="bullets">
			{@render bullet(`Nine letters hide three words, one ${hi}secret color</span> each.`)}
			{@render bullet(`Tap two letters to ${hi}reveal their colors</span>.`)}
			{@render bullet(`${hi}Different colors</span> trade places. ${hi}Matching colors</span> stay put.`)}
			{@render bullet('Either way, the colors go dark again.')}
			{@render bullet('You win when each row is a word in a single color.')}
		</div>
		<TextButton text={['PLAY']} onClick={() => delete ss.home} style='font-size: 28px;'/>
	</div>
{/if}

<style>
	.home {
		display: grid;
		z-index: 1;
		place-content: center;
	}

	.bullets {
		margin: 50px 0;
		width: 380px;
		display: grid;
		gap: 10px;
		font-size: 22px;
		text-shadow: 2px 2px 2px black;
	}

	.bullet-item {
		display: grid;
		grid: auto / auto 1fr;
		gap: 1em;
	}

	.bullet {
		background: var(--cream);
		border-radius: 50%;
		height: 5px;
		aspect-ratio: 1;
		translate: 0 10px;
		box-shadow: 2px 2px 2px black;
	}

	.text {
        line-height: 1.1em;
		letter-spacing: 0.04em;
	}
</style>
