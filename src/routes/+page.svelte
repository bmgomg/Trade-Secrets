<script>
	import Frame from '../Frame.svelte';
	import GamePage from '../Game Page.svelte';
	import Home from '../Home.svelte';
	import Splash from '../Splash.svelte';
	import { DX, DY } from '../const';
	import { _sound } from '../sound.svelte';
	import { clientRect, post } from '../utils';

	let scale = $state(1);

	$effect(() => {
		const disable = (e) => {
			e.preventDefault();
		};

		const onResize = () => {
			let scx = 1;
			let scy = 1;

			const r = clientRect('#app');

			if (r.width < DX) {
				scx = r.width / DX;
			}

			if (r.height < DY) {
				scy = r.height / DY;
			}

			scale = Math.min(scx, scy);
		};

		const toggleMusic = () => {
			_sound.music = -_sound.music;
			_sound.playMusic();
		};

		const onBlur = () => {
			if (_sound.music > 0 && _sound.musicPlayed) {
				toggleMusic();
			}
		};

		const onFocus = () => {
			if (_sound.music < 0) {
				toggleMusic();
			}
		};

		onResize();

		window.addEventListener('contextmenu', disable);
		window.addEventListener('dblclick', disable);
		window.addEventListener('resize', onResize);
		window.addEventListener('blur', onBlur);
		window.addEventListener('focus', onFocus);

		return () => {
			window.removeEventListener('contextmenu', disable);
			window.removeEventListener('dblclick', disable);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('blur', onBlur);
			window.removeEventListener('focus', onFocus);
		};
	});

	let splash = $state(true);
	post(() => (splash = false), 2000);
</script>

<div id="app" class='nohi'>
	{#if splash}
		<Splash />
	{:else}
		<div class="vignette"></div>
		<div id="app-content" style="scale: {scale};">
			<Frame />
			<GamePage />
			<Home />
		</div>
	{/if}
</div>

<style>
	#app {
		height: 100dvh;
		display: grid;
		place-content: center;
		box-sizing: border-box;
		background-image: url('$lib/images/Pattern.webp');
		background-size: 150px;
		background-position: center;
	}

	.vignette {
        position: absolute;
        width: 100dvw;
        height: 100dvh;
		background: radial-gradient(transparent, black 150%);
	}

	#app-content {
		grid-area: 1/1;
		place-self: center;
		display: grid;
		touch-action: none;
		z-index: 1;
		background: var(--bg);
	}
</style>
