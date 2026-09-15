<script>
	let { children } = $props();
</script>

{@render children()}

<style>
	:global {
		body {
			margin: 0;
			padding: 0;
			height: 100dvh;
			width: 100%;
			font-family: Oswald;

			--bg: #123456;
			--ink: #b6cfe4;
			--water: #2c3a49;
			--dark: #0a1a18;
			--cream: #f0e9d9;
			--teal: #2fb3a8;
			--gold: #f2b134;
			--pink: #e0457b;
			background: var(--bg);
			color: var(--ink);
		}

		.button-base {
			box-sizing: border-box;
			display: grid;
			place-content: center;
			transition: transform 0.1s;
			cursor: pointer;
		}

		.button-base:focus {
			outline: none !important;
		}

		.nohi {
			-webkit-tap-highlight-color: transparent;
			-webkit-touch-callout: none;
			-webkit-user-select: none;
			-khtml-user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			user-select: none;
		}

		.nope {
			pointer-events: none;
			cursor: initial;
		}

		.hide {
			opacity: 0;
		}

		.grid {
			display: grid;
		}

		.ga11 {
			grid-area: 1/1;
		}

		@font-face {
			font-family: Archivo;
			src: url('$lib/fonts/Archivo.ttf');
		}

		@font-face {
			font-family: Oswald;
			src: url('$lib/fonts/Oswald.ttf');
		}

		@font-face {
			font-family: RC;
			src: url('$lib/fonts/Roboto Condensed.ttf');
		}
	}
</style>
