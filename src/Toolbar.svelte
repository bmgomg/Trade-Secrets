<script>
	import { PROMPT_RESET_STATS, PROMPT_SURRENDER } from './const';
	import { persistCommon, ss } from './shared.svelte';
	import { _sound } from './sound.svelte';
	import TextButton from './Text Button.svelte';

	const noSurrender = $derived(ss.over || ss.startPrompt || ss.prompt == PROMPT_SURRENDER);
	const noResetStats = $derived(ss.stats.plays === 0 || ss.prompt === PROMPT_RESET_STATS);

	const onHome = () => {
		delete ss.prompt;
		ss.home = true;
	};

	const onSurrender = () => {
		// showPrompt(PROMPT_SURRENDER);
	};

	const onResetStats = () => {
		// showPrompt(PROMPT_RESET_STATS);
	};

	const onSfx = () => {
		_sound.sfx = 1 - _sound.sfx;

		if (_sound.sfx) {
			_sound.play('won', { rate: 4 });
		}

		persistCommon();
	};

	const onMusic = () => {
		_sound.music = 1 - _sound.music;
		_sound.playMusic();

		persistCommon();
	};
</script>

<div class="toolbar">
	<TextButton text={['  Home  ']} onClick={onHome} />
	<TextButton text={['  Give  ', 'Up']} disabled={noSurrender} onClick={onSurrender} />
	<TextButton text={['  Reset  ', 'Stats']} onClick={onResetStats} disabled={noResetStats} />
	<TextButton text={_sound.sfx ? ['  Sound  ', 'On'] : ['  Sound  ', 'Off']} onClick={onSfx} />
	<TextButton text={_sound.music ? ['  Music  ', 'On'] : ['  Music  ', 'Off']} onClick={onMusic} />
</div>

<style>
	.toolbar {
		display: grid;
		margin: 0 0 20px;
		grid-auto-flow: column;
		place-content: center;
		align-items: center;
		gap: 2px;
		place-self: end center;
	}
</style>
