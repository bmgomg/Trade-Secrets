import { generate } from '$lib/puzzle';
import { APP_STATE, COLORS } from './const';
import { _sound } from './sound.svelte';

export const newStats = () => ({ plays: 0, total: 0, best: 0 });

export const ss = $state({
    stats: newStats(),
    home: true,
    scale: 1,
    pzl: {},
});

const appKey = $derived(APP_STATE + ' • ' + '???');

export const _log = (value) => console.log($state.snapshot(value));

export const persistCommon = () => {
    const json = JSON.stringify({ sfx: _sound.sfx, music: _sound.music });
    localStorage.setItem(APP_STATE, json);
};

export const loadCommon = () => {
    const json = localStorage.getItem(APP_STATE);
    const job = JSON.parse(json);

    if (job) {
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

    const pzl = generate();
    ss.words = pzl.wordsByColor;
    ss.pzl.tiles = pzl.tiles;

    persist();
};

export const cid = id => (id - 1) % 3 + 1;

export const bg = id => {
    const i = (id - 1) % 3;
    return 'var(--' + COLORS[i] + ')';
};

export const onTradeComplete = () => {
    const { tiles } = ss.pzl;

    const i = tiles.indexOf(ss.trade[0]);
    const j = tiles.indexOf(ss.trade[1]);

    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];

    persist();

    delete ss.trade;
};