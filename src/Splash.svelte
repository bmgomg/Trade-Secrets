<script>
    import { fade } from 'svelte/transition';
    import { APP_STATE } from './const';

    let classes = $state('splash');

    const onPointerDown = () => {
        Object.keys(localStorage)
            .filter((key) => key.startsWith(APP_STATE))
            .forEach((key) => localStorage.removeItem(key));
        classes = 'splash dark';
    };
</script>

<div class={classes} out:fade={{ duration: 300 }} onpointerdown={onPointerDown}>
    <div class="bmg"></div>
</div>

<style>
    .splash {
        position: absolute;
        background: #8A0000;
        background-image: radial-gradient(transparent, black 100%);
        z-index: 300;
        transition: background-color 0.3s;
    }

    .dark {
        background-color: #500000;
    }

    .bmg {
        width: 100dvw;
        height: 100dvh;
        background-image: url($lib/images/BMG.webp);
        background-size: calc(min(300px, min(100dvh, 100dvw) * 0.6));
        background-repeat: no-repeat;
        background-attachment: fixed;
        background-position: center;
    }
</style>
