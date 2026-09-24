<script>
	import Frame from '../Frame.svelte';
	import GamePage from '../Game Page.svelte';
	import Home from '../Home.svelte';
	import Splash from '../Splash.svelte';
	import Dictionary from '../Dictionary.svelte';
	import { DX, DY } from '../const';
	import { ss } from '../shared.svelte';
	import { _sound } from '../sound.svelte';
	import { clientRect, post, underMouse } from '../utils';

	let scale = $state(1);
	let border = $state();

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
			border = r.width - DX * scale > 50 && r.height - DY * scale > 50;
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

	const onPointerDown = (e) => {
		if (ss.showDictionary) {
			if (!underMouse(e, ['.Dictionary', '#tb-dict', '#tb-sfx', '#tb-music'])) {
				delete ss.showDictionary;
			}
		}
	};
</script>

<div id="app" class="nohi" onpointerdown={onPointerDown}>
	{#if splash}
		<Splash />
	{:else}
		<div class="vignette"></div>
		<div id="app-content" class:border style="scale: {scale};">
			<Frame />
			<GamePage />
			<Home />
			<Dictionary />
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
		background-size: 350px;
		background-position: center;
	}

	.vignette {
		position: absolute;
		width: 100dvw;
		height: 100dvh;
		background: radial-gradient(transparent, black 150%);
	}

	#app-content {
		position: relative;
		grid-area: 1/1;
		place-self: center;
		display: grid;
		touch-action: none;
		z-index: 1;
		background: var(--bg);
		box-sizing: border-box;
	}

	.border {
		border: 1px dotted var(--ink);
	}
</style>
