import { dict3 } from './dict3.js';
import { dict4 } from './dict4.js';

export const DICT = dict3;

export const sortKey = (letters) => [...letters].sort().join('');

// words, a set of them, and sorted letters -> words spelled by them (e.g. 'ABT' -> ['BAT', 'TAB'])
const lexicon = (words) => {
	const anagrams = new Map();

	for (const w of words) {
		const k = sortKey(w);
		anagrams.has(k) ? anagrams.get(k).push(w) : anagrams.set(k, [w]);
	}

	return { words, set: new Set(words), anagrams };
};

// grid size -> lexicon of words that long
export const LEXICONS = { 3: lexicon(DICT), 4: lexicon(dict4) };

export const lexiconFor = (size) => {
	if (!LEXICONS[size]) {
		throw new Error(`No dictionary for size ${size}`);
	}

	return LEXICONS[size];
};

/** True if `word` (any case) is in the 3- or 4-letter dictionary. */
export const isWord = (word) => !!LEXICONS[word.length]?.set.has(word.toUpperCase());

export const DICT_SET = LEXICONS[3].set;
export const ANAGRAMS = LEXICONS[3].anagrams;
