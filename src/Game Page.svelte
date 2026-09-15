<script>
	import { ss } from './shared.svelte';
	import Toolbar from './Toolbar.svelte';
</script>

<div class="game-page ga11" class:show={!ss.home}>
	<!-- <Stats /> -->
	<!-- <Scoreboard /> -->
	<!-- <Board /> -->
	<!-- <Launcher /> -->
	<!-- <Message/> -->
	<!-- <Prompt/> -->
	<Toolbar />
</div>

<style>
	.game-page {
		display: grid;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.show {
		opacity: 1;
	}
</style>
