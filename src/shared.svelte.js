import { generate, isSolved, tileSolution } from '$lib/puzzle';
import { cloneDeep } from 'lodash-es';
import { APP_STATE, BRACKETS, COLORS, FLIP_MS, PROMPT_PLAY_AGAIN } from './const';
import { _sound, sfx, swhoosh } from './sound.svelte';
import { post } from './utils';

export const newStats = () => ({ plays: 0, wins: 0, total: 0 });

export const ss = $state({
    stats: newStats(),
    home: true,
    scale: 1,
    size: 3,
    pzl: {},
});

const appKey = $derived(APP_STATE + ' • ' + ss.size);

export const _log = (value) => console.log($state.snapshot(value));

export const persistCommon = () => {
    const json = JSON.stringify({ size: ss.size, sfx: _sound.sfx, music: _sound.music });
    localStorage.setItem(APP_STATE, json);
};

export const loadCommon = () => {
    const json = localStorage.getItem(APP_STATE);
    const job = JSON.parse(json);

    if (job) {
        ss.size = job.size;
        _sound.sfx = job.sfx;
        _sound.music = job.music;
    }
};

export const persist = () => {
    if (ss.auto || ss.replay) {
        return;
    }

    const json = JSON.stringify({ stats: ss.stats, over: ss.over, pzl: ss.pzl });
    localStorage.setItem(appKey, json);
};

export const loadGame = () => {
    const json = localStorage.getItem(appKey);
    const job = JSON.parse(json);

    if (!job) {
        ss.stats = newStats();
        return false;
    }

    ss.stats = job.stats;

    if (!job.over) {
        ss.pzl = job.pzl;
        return true;
    }

    return false;
};

export const onAutoPlay = () => {
    delete ss.over;

    ss.auto = true;
    ss.pzl = cloneDeep(ss.repzl);

    swhoosh();

    const tileWithId = id => ss.pzl.tiles.find(t => t.id === id);

    const autoSwap = (i = 0) => {
        if (!ss.auto) {
            return;
        }

        // a swap is a pair of tile ids; ids are stable, so the tiles may sit anywhere by now
        const [id1, id2] = ss.pzl.solution[i];

        sfx('click');
        ss.trade = [tileWithId(id1)];

        post(() => {
            sfx('click');
            ss.trade.push(tileWithId(id2));

            post(doTrade, 800);

            if (i + 1 < ss.pzl.solution.length) {
                post(() => autoSwap(i + 1), 2500);
            } else {
                delete ss.auto;
            }
        }, 800);
    };

    post(autoSwap, 2000);
};

export const onReplay = () => {
    delete ss.over;

    ss.replay = true;
    ss.pzl = cloneDeep(ss.repzl);

    swhoosh();
};

export const onPlay = () => {
    if (!loadGame() || isOver()) {
        const pzl = generate({ size: ss.size/* , seed: '2026-09-17' */ });
        ss.pzl = { tiles: pzl.tiles, floor: pzl.floor, solution: pzl.solution, trades: 0 };

        sfx('dice');
        persist();
    }

    ss.repzl = cloneDeep(ss.pzl);

    if (!_sound.musicPlayed) {
        _sound.playMusic();
    }

    delete ss.over;
    delete ss.home;
};

export const bg = id => {
    const i = (id - 1) % 4;
    return 'var(--' + COLORS[i] + ')';
};

const swapTiles = () => {
    const { tiles } = ss.pzl;

    const i = tiles.indexOf(ss.trade[0]);
    const j = tiles.indexOf(ss.trade[1]);

    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];

    if (isOver()) {
        ss.over = 'won';
    }

    ss.pzl.trades++;
    persist();
};

export const doTrade = () => {
    swapTiles();

    post(() => sfx('cluck'), FLIP_MS);

    if (isOver()) {
        post(() => onOver(true), FLIP_MS + 500);
    }

    // the tiles stay lit through the flip, then go dark
    post(() => delete ss.trade, FLIP_MS + 200);
};

export const rowCol = (i, size = ss.size) => {
    const row = Math.floor(i / size) + 1;
    const col = i % size + 1;

    return { row, col };
};

export const starRating = () => {
    if (ss.pzl.trades === 0 || !ss.pzl.floor || ss.over !== 'won') {
        return 0;
    }

    const d = ss.pzl.trades / ss.pzl.floor;
    const b = BRACKETS[ss.size - 3];

    for (let i = 0; i < b.length; i++) {
        if (d <= b[i]) {
            return 5 - i;
        }
    }

    return 1;
};

export const setPrompt = prompt => {
    if (ss.prompt) {
        delete ss.prompt;
    }

    post(() => ss.prompt = prompt);
};

export const isOver = () => isSolved(ss.pzl.tiles);

export const onOver = (won) => {
    ss.over = won ? 'won' : 'lost';

    if (won) {
        sfx('won');
        post(() => setPrompt(PROMPT_PLAY_AGAIN), 1000);

        if (!ss.auto && !ss.replay) {
            ss.stats.wins++;
            ss.stats.total += starRating();
        }
    } else {
        sfx('lost');
        post(() => setPrompt(PROMPT_PLAY_AGAIN), 1200);
    }

    if (!ss.auto && !ss.replay) {
        ss.stats.plays++;
        persist();
    }

    delete ss.auto;
    delete ss.replay;
};

export const doSurrender = () => {
    onOver(false);

    // reveal the winning arrangement closest to where the player left the board, rather than
    // snapping back to the original deal, so whatever they did get right stays put
    const { tiles } = ss.pzl;
    const { swaps } = tileSolution(tiles);

    for (const [id1, id2] of swaps) {
        const i = tiles.findIndex(t => t.id === id1);
        const j = tiles.findIndex(t => t.id === id2);

        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
};