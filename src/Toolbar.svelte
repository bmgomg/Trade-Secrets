<script>
	import Dictionary from '$lib/images/Dictionary.webp';
	import Home from '$lib/images/Home.webp';
	import MusicOff from '$lib/images/Music Off.webp';
	import MusicOn from '$lib/images/Music On.webp';
	import SoundOff from '$lib/images/Sound Off.webp';
	import SoundOn from '$lib/images/Sound On.webp';
	import Stats from '$lib/images/Stats.webp';
	import Surrender from '$lib/images/Surrender.webp';
	import { PROMPT_RESET_STATS, PROMPT_SURRENDER } from './const';
	import { persistCommon, ss } from './shared.svelte';
	import { _sound } from './sound.svelte';
	import ToolButton from './Tool Button.svelte';

	const noSurrender = $derived(ss.over || ss.startPrompt || ss.prompt == PROMPT_SURRENDER);
	const noResetStats = $derived(ss.stats.plays === 0 || ss.prompt === PROMPT_RESET_STATS);

	const onHome = () => {
		delete ss.prompt;
		delete ss.over;

		ss.home = true;
	};

	const onSurrender = () => {
		// showPrompt(PROMPT_SURRENDER);
	};

	const onResetStats = () => {
		// showPrompt(PROMPT_RESET_STATS);
	};

	const onDictionary = () => {
		if (ss.showDictionary) {
			delete ss.showDictionary;
		} else {
			ss.showDictionary = true;
		}
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
	<ToolButton src={Home} onClick={onHome} />
	<ToolButton src={Surrender} onClick={onSurrender} disabled={noSurrender} />
	<ToolButton id="tb-wordlist" src={Dictionary} onClick={onDictionary} />
	<ToolButton src={Stats} onClick={onResetStats} disabled={noResetStats} />
	<ToolButton id="tb-sfx" src={_sound.sfx ? SoundOn : SoundOff} sound={false} onClick={onSfx} />
	<ToolButton id="tb-music" src={_sound.music ? MusicOn : MusicOff} onClick={onMusic} />
</div>

<style>
	.toolbar {
		display: grid;
		margin: 0 0 20px;
		grid-auto-flow: column;
		place-content: center;
		align-items: center;
		gap: 15px;
		place-self: end center;
	}
</style>
