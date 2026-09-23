<script>
	import Board from './Board.svelte';
	import { DY } from './const';
	import Prompt from './Prompt.svelte';
	import Scoreboard from './Scoreboard.svelte';
	import { ss } from './shared.svelte';
	import Stats from './Stats.svelte';
	import Toolbar from './Toolbar.svelte';
</script>

<div class="game-page ga11" class:show={!ss.home} style="height: {DY}px;">
	<Stats />
	<Scoreboard />
	<Board />
	<!-- <Message/> -->
	<Prompt/>
	<Toolbar />
</div>

<style>
	.game-page {
		display: grid;
		grid: 50px 1fr auto 0.8fr 60px / auto;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.show {
		opacity: 1;
	}
</style>
