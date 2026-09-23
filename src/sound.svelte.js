import music from '$lib/sounds/music.mp3';
import sounds from '$lib/sounds/sfx.mp3';
import { Howl } from 'howler/dist/howler.core.min';

const sprite = {
    click: [0, 160],
    cluck: [230, 180],
    coin1: [430, 440],
    coin2: [930, 440],
    coins: [1400, 1054],
    dice: [3020, 910],
    draw: [3980, 1750],
    drop: [5750, 600],
    link1: [6400, 420],
    link2: [6900, 420],
    lost: [7370, 680],
    plop: [8130, 220],
    player1wins: [8430, 1540],
    player2wins: [10030, 1700],
    score1: [11780, 260],
    score2: [12080, 310],
    tap: [12430, 210],
    won: [12680, 2010],
};

const MUSIC_VOLUMES = [0, 0.2, 0.4, 0.6, 0.8];

const howl = new Howl({ src: [sounds], sprite });
const loop = new Howl({ src: [music], loop: true });

export const _sound = $state({
    sfx: 1,
    music: 1,
    play: (id, options = {}) => {
        const { rate = 1, volume = 1 } = options;

        if (_sound.sfx) {
            howl.play(id);
            howl.rate(rate);
            howl.volume(volume);
        }
    },
    playMusic: () => {
        if (!_sound.musicPlayed) {
            _sound.musicPlayed = true;
            loop.play();
        }

        loop.volume(_sound.music > 0 ? MUSIC_VOLUMES[_sound.music] : 0);
    },
    stopMusic: () => {
        loop.stop();
    }
});

export const sfx = (chime, rate) => _sound.play(chime, { rate: rate ?? 1 });

export const tap = () => sfx('tap');

export const whoosh = () => sfx('score1', 0.8);

export const swhoosh = () => sfx('score2', 0.8);
