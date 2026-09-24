<script>
	import { fade } from 'svelte/transition';
	import { MSG_DEMO, MSG_REPLAY } from './const';
	import { isOver, ss } from './shared.svelte';

	const message = $derived(ss.message ?? (ss.auto ? MSG_DEMO : ss.replay ? MSG_REPLAY : ''));
</script>

{#if message && !ss.prompt && !isOver()}
	<div class="message grid psc" in:fade>{message}</div>
{/if}

<style>
	.message {
		grid-area: 4/1;
		width: 380px;
		font-size: 20px;
		color: #ffffff70;
	}
</style>
