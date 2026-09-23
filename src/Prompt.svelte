<script>
	import { fade } from 'svelte/transition';
	import {
		PROMPT_NO,
		PROMPT_PLAY_AGAIN,
		PROMPT_PLAY_NEW,
		PROMPT_REPLAY,
		PROMPT_RESET_STATS,
		PROMPT_SHOW_FLOOR,
		PROMPT_SURRENDER
	} from './const';
	import { doSurrender, isOver, newStats, onPlay, setPrompt, ss } from './shared.svelte';
	import { sfx, whoosh } from './sound.svelte';
	import TextButton from './Text Button.svelte';
	import { post } from './utils';

	$effect(() => {
		if (ss.prompt) {
			sfx('plop');
		}
	});

	const dismiss = () => {
		if (ss.prompt === PROMPT_RESET_STATS && isOver()) {
			post(() => setPrompt(PROMPT_PLAY_AGAIN), 200);
		}

		delete ss.prompt;
	};

	const onRepeatPlay = () => {
		dismiss();

		ss.flip = true;

		post(() => {
			// onReplay();
			delete ss.flip;
		}, 500);
	};

	const onPlayNew = () => {
		dismiss();

		ss.flip = true;

		post(() => {
			onPlay();
			delete ss.flip;
		}, 500);
	};

	const onSurrender = () => {
		dismiss();
		delete ss.from;

		post(doSurrender, 150);
	};

	const onShowBest = () => {
		dismiss();
		ss.flip = true;

		post(() => {
			// onAutoPlay();
			delete ss.flip;
		}, 500);
	};

	const onResetStats = () => {
		whoosh();

		dismiss();
		ss.stats = newStats();
	};

	const style = 'letter-spacing: 0.03em; background: var(--ice); color: var(--dark); border-radius: 999px; ';
</script>

{#if ss.prompt}
	<div class="prompt grid psc flowcol" in:fade={{ duration: 200 }} out:fade={{ duration: 100 }}>
		{#if ss.prompt === PROMPT_PLAY_AGAIN}
			{@const s = 'font-size: 18px; padding: 8px 20px 10px; font-weight: 500;'}
			<div class="grid panel flowcol">
				<TextButton text={[PROMPT_REPLAY]} onClick={onRepeatPlay} style={style + s} />
				<TextButton text={[PROMPT_SHOW_FLOOR]} onClick={onShowBest} style={style + s} />
				<TextButton text={[PROMPT_PLAY_NEW]} onClick={onPlayNew} style={style + s} />
			</div>
		{:else if ss.prompt === PROMPT_SURRENDER}
			{@const s = 'font-size: 20px; padding: 8px 25px 10px;'}
			<div class="grid panel flowcol">
				<TextButton text={[PROMPT_SURRENDER]} onClick={onSurrender} style={style + s} />
				<TextButton text={[PROMPT_NO]} onClick={dismiss} style={style + s} />
			</div>
		{:else if ss.prompt === PROMPT_RESET_STATS}
			{@const s = 'font-size: 20px; padding: 8px 25px 10px;'}
			<div class="grid panel flowcol">
				<TextButton text={[PROMPT_RESET_STATS]} onClick={onResetStats} style={style + s} />
				<TextButton text={[PROMPT_NO]} onClick={dismiss} style={style + s} />
			</div>
		{/if}
	</div>
{/if}

<style>
	.prompt {
		grid-area: 4/1;
		display: grid;
	}

	.panel {
		gap: 15px;
	}
</style>
