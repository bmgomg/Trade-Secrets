import { generate, isSolved } from '$lib/puzzle';
import { APP_STATE, BRACKETS, COLORS, FLIP_MS } from './const';
import { _sound, sfx } from './sound.svelte';
import { post } from './utils';

export const newStats = () => ({ plays: 0, total: 0, best: 0 });

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

export const onPlay = () => {
    delete ss.home;

    const pzl = generate({ size: ss.size, seed: '2026-09-17' });
    ss.pzl.tiles = pzl.tiles;
    ss.pzl.floor = pzl.floor;
    ss.pzl.trades = 0;

    sfx('dice');

    persist();
};

export const bg = id => {
    const i = (id - 1) % 4;
    return 'var(--' + COLORS[i] + ')';
};

export const doTrade = () => {
    const { tiles } = ss.pzl;

    const i = tiles.indexOf(ss.trade[0]);
    const j = tiles.indexOf(ss.trade[1]);

    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];

    if (isSolved(tiles)) {
        ss.over = 'won';
    }

    ss.pzl.trades++;

    persist();

    post(() => {
        sfx('cluck');

        if (ss.over) {
            post(() => sfx('won'), 500);
        }
    }, FLIP_MS);

    // the tiles stay lit through the flip, then go dark
    post(() => delete ss.trade, FLIP_MS + 200);
};

export const rowCol = (i, size = ss.size) => {
    const row = Math.floor(i / size) + 1;
    const col = i % size + 1;

    return { row, col };
};

export const starRating = () => {
    if (ss.pzl.trades === 0 || !ss.pzl.floor || !ss.over) {
        return 0;
    }

    const d = ss.pzl.trades - ss.pzl.floor;
    const b = BRACKETS[ss.size - 3];

    for (let i = 0; i < b.length; i++) {
        if (d <= b[i]) {
            return 5 - i;
        }
    }

    return 1;
};
