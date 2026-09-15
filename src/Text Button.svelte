<script>
	import { _sound } from './sound.svelte';
	import { post } from './utils';

	const { text, style: customStyle, sound = true, disabled, onClick } = $props();

	let _this = $state();
	let scale = $state(1);
	let timer = $state(false);

	const classes = $derived('button-base nohi button' + (disabled || !onClick ? ' disabled' : ''));
	const style = $derived(`${customStyle}; scale: ${scale}`);

	$effect(() => {
		const onTransitionEnd = (e) => {
			if (e.propertyName !== 'scale') {
				return;
			}

			if (scale < 1) {
				scale = 1;
			} else {
				post(onClick);
			}
		};

		_this.addEventListener('transitionend', onTransitionEnd);
		return () => _this.removeEventListener('transitionend', onTransitionEnd);
	});

	const onPointerDown = () => {
		if (timer) {
			return;
		}

		if (sound) {
			_sound.play('tap');
		}

		scale = 0.85;
		timer = post(() => (timer = null), 500);
	};
</script>

<div bind:this={_this} class={classes} onpointerdown={onPointerDown} {style} role="button" tabindex={disabled ? -1 : 0}>
	{#each text as line, i (i)}
		<div>{line}</div>
	{/each}
</div>

<style>
	.button {
		place-self: center;
		display: grid;
		place-items: center;
		transition: scale 0.1s;
		cursor: pointer;
		box-sizing: border-box;
		white-space: nowrap;
	}

	.button:hover {
		filter: brightness(1.1);
	}

	.disabled {
		pointer-events: none;
		color: var(--tan);
	}

	.button:focus {
		outline: none !important;
	}
</style>
