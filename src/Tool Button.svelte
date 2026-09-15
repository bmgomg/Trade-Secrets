<script>
	import { _sound } from './sound.svelte';
	import { post } from './utils';

	const { src, width = 50, disabled, showDisabled = true, opaque = false, sound = true, onClick } = $props();

	let _this = $state();
	let scale = $state(1);
	let timer = $state(false);

	const classes = $derived(
		`button-base nohi button ${opaque ? 'opaque' : ''} ${disabled ? 'disabled' : ''} ${disabled && showDisabled ? 'gray' : ''}`
	);

	const style = $derived(`width: ${width}px; height: ${width}px; scale: ${scale};`);

	$effect(() => {
		const onTransitionEnd = (e) => {
			if (e.propertyName !== 'scale') {
				return;
			}

			if (scale < 1) {
				scale = 1;
			} else {
				if (sound) {
					_sound.play('tap');
				}

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

		scale = 0.7;

		timer = post(() => (timer = null), 500);
	};
</script>

<div bind:this={_this} class={classes} onpointerdown={onPointerDown} {style}>
	{#if true}
		{@const style = 'user-drag: none;'}
		<img class="img" {style} {src} alt="" {width} />
	{/if}
</div>

<style>
	.button {
		place-self: center;
		display: grid;
		place-items: center;
		border-radius: 25%;
		opacity: 0.7;
		transition: scale 0.1s, opacity 0.2s, filter 0.2s;
	}

	.opaque {
		opacity: 1;
	}

	.button:hover {
		opacity: 1;
	}

	.disabled {
		pointer-events: none;
	}

	.gray {
		filter: opacity(0.4);
	}

	.button:focus {
		outline: none !important;
	}

	.img {
		grid-area: 1/1;
		-webkit-user-drag: none; /* For WebKit browsers (Chrome, Safari) */
	}
</style>
