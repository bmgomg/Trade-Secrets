# Trade Secrets — design history

Condensed from the claude.ai prototyping chat of 2026-09-14
(https://claude.ai/chat/52a536df-0dc9-4e3d-ac12-c9bf4fd046be, 81 messages). Chronological.

1. **Original pitch.** Three 3-letter words in a 3×3 grid, alphabetical top to bottom, scrambled. Each word has a secret color. Tap two letters to reveal colors; different colors swap, same colors stay; colors disappear. Game ends when all three words are in place. Goal: minimize swaps. Working title "Swap Meet".
2. **Colors show on first tap**, immediately. Deselect removed so colors can't be read for free.
3. **"Win didn't fire"** — grid was JET/TAB/USE by color but TAB wasn't in the dictionary. Showed that a color-pure but misordered row (TAB→BAT) needs a 3-cycle through another color.
4. **Dictionary expanded** 424 → 459 with common words only (list in CLAUDE.md). Interjections kept.
5. **Multiple solutions.** Measured: 95% of boards had more than one valid word triple; par (computed against the dealt words) was wrong in 76%.
6. **Par is not the minimum.** User: under par is fine, par shouldn't mean "absolute minimum". Agreed: par = expected score for a competent player. Built a no-color-knowledge solver; median = floor + 2 at every floor 3–7. **Par = floor + 2.** Side effect: scores clump on even numbers (floor 37%, +2 37%, +4 18%).
7. **Title/theme.** Jam theme GENRE COLLISION. Golf-scoring framing ("Course Language", nine holes) proposed, then rejected by user as too subtle for the jam crowd; golf vocabulary removed. Title chosen: **Trade Secrets**. "Par" restored as a plain term (no birdie/eagle/bogey). Tagline: **"Every peek is a move."**
8. **Genre discussion.** Word + logic + memory read as one genre ("puzzle game") to judges. A Tetris/word game (Worded Well) was discussed as a better theme fit. Conclusion: Trade Secrets is a good puzzle game that isn't about a collision.
9. **Paid reveal idea.** Reveal all colors for a few seconds at a cost (e.g. 10 swaps); once-per-game limit dropped. Measured: reveal saves nothing because same-color taps are free (perfect info ≈ perfect memory ≈ no memory ≈ 5.86 swaps). Options: make failed taps cost (then reveal worth ~1 tap), or make reveal a comfort feature. **Undecided; code unchanged.**
10. **Alternate-triple "bug."** Player won with BIG/DUD/FIG while colors hid BID/DUG/FIG → rows not color-pure. Briefly tried a unique-solution deal filter (6% of triples survive, 50 ms, skews to X/J/K). **User's rule adopted instead: win requires each row to be a word AND a single color.** Filter removed; generation < 1 ms; par rose to 7–8; anagrams within a color group (BAT/TAB) still win.
11. **Feedback signal.** Wrong split is contradicted by colors after a median of 3 cross-word taps (40% within 1–2). Same-color taps inside a row can't swap — they're positive confirmation. **Memory load is by design.**
12. **Dictionary checks.** MET (added), PLY and ARE (original). PLY flagged as the weakest.
13. **Row order.** User found PLY/ARE/MET color-pure but out of order; 6 pure-execution swaps remained, user gave up. **Any row order now wins**; rows snap alphabetically on the reveal. Saves median 1 swap (0 on 26% of boards, up to 4). **Par now 6–7.** Deduction is the whole game; rounds end on the insight.
14. **Swap animations.** Scoped (CSS transform, stable tile ids, same-color nudge) and deferred to the Svelte version.
15. **Duplicates.** Board DOG/DUG/RUB had 3 letters spanning words (6% of boards). Kept duplicates (they give the colors teeth) but **capped spanning letters at 2**. New distribution: 20% / 48% / 32%. Hazard noted: swapping two identical letters of different colors changes nothing visible.
16. **Stale build.** A "no win" report was an older artifact version without the any-order change; current code wins.
17. **No reveal snap.** Rows stay where they are on the win; the alphabetical snap from item 13 is dropped. Row order still doesn't matter.
