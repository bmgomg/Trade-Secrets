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
	import { doSurrender, isOver, newStats, onAutoPlay, onPlay, onReplay, setPrompt, ss } from './shared.svelte';
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
			onReplay();
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
		post(doSurrender, 150);
	};

	const onShowFloor = () => {
		dismiss();
		ss.flip = true;

		post(() => {
			onAutoPlay();
			delete ss.flip;
		}, 500);
	};

	const onResetStats = () => {
		whoosh();

		dismiss();
		ss.stats = newStats();
	};

	const style = 'font-size: 20px; padding: 8px 25px 10px; letter-spacing: 0.03em; background: var(--ice); color: var(--dark); border-radius: 999px; ';
</script>

{#if ss.prompt}
	<div class="prompt grid psc flowcol" in:fade={{ duration: 200 }} out:fade={{ duration: 100 }}>
		{#if ss.prompt === PROMPT_PLAY_AGAIN}
			{@const s = 'font-weight: 500;'}
			<div class="grid panel flowcol">
				<TextButton text={[PROMPT_REPLAY]} onClick={onRepeatPlay} style={style + s} />
				<TextButton text={[PROMPT_SHOW_FLOOR]} onClick={onShowFloor} style={style + s} />
				<TextButton text={[PROMPT_PLAY_NEW]} onClick={onPlayNew} style={style + s} />
			</div>
		{:else if ss.prompt === PROMPT_SURRENDER}
			<div class="grid panel flowcol">
				<TextButton text={[PROMPT_SURRENDER]} onClick={onSurrender} style={style} />
				<TextButton text={[PROMPT_NO]} onClick={dismiss} style={style} />
			</div>
		{:else if ss.prompt === PROMPT_RESET_STATS}
			<div class="grid panel flowcol">
				<TextButton text={[PROMPT_RESET_STATS]} onClick={onResetStats} style={style} />
				<TextButton text={[PROMPT_NO]} onClick={dismiss} style={style} />
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
