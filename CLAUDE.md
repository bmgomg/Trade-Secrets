# Trade Secrets

*Every peek risks a move.*

A word/logic/memory puzzle. Prototyped as a single React artifact in a claude.ai chat
(https://claude.ai/chat/52a536df-0dc9-4e3d-ac12-c9bf4fd046be); the real game will be built in Svelte.
Full decision history: [docs/design-notes.md](docs/design-notes.md).

## Files

- `trade-secrets.jsx` — the latest prototype. Self-contained: dictionary, generator, par calculation, UI.
  Treat it as the reference for rules and puzzle math, not as the architecture to keep.
- `src/lib/puzzle/` — standalone generator/solver (no UI), sizes 3 (3×3, `dict3.js`, exported as `DICT`) and 4 (4×4, `dict4.js`):
  `rules.js` (win, taps, legal + relaxed floor), `generator.js` (seeded deal, difficulty ranges, puzzle codes, bank),
  `solver.js` (player models; 'expect' is 3×3 only), `puzzle.test.js`.
- `scripts/puzzle-stats.js`, `scripts/puzzle-bank.js` — `npm run puzzle:stats`, `npm run puzzle:bank -- --out=…`.

## Rules (current, agreed)

- Three 3-letter dictionary words, each with its own **secret color**, are laid out in a 3×3 grid (one word per row) and scrambled.
- The player taps two tiles. Each tile's color shows **immediately on tap**; the first tap commits (no deselect, or colors could be read for free).
- **Different colors → the tiles swap. Same color → they stay put.** Either way the colors go dark again.
- **Win:** every row is a dictionary word **and** a single color. Row order does not matter, and rows stay where they are on the win (no alphabetical snap).
  - Consequence: an anagram inside one color group is fine (BAT or TAB from the same three same-colored tiles both win). A different split of the nine letters into words (letters from mixed colors) never wins.
- **Score = swaps.** Same-color taps are free. Lower is better. "Tapped pairs" is displayed but not scored.
- **Par = floor + 2**, where *floor* is the fewest swaps to any winning arrangement given perfect color knowledge.
  - +2 = one "same-color block": two letters that need to trade share a color, so a third tile must route the move (1 swap becomes 3).
  - Derived from a no-color-knowledge solver over 400 boards: its median was exactly floor + 2 at every floor from 3 to 7.
  - "Par" is plain-English benchmark language only — no birdie/eagle/bogey vocabulary. Win line: "Solved in N swaps. Even par." / "K under par." / "K over par."
- **Memory is a deliberate part of the design**, not a flaw to be fixed.

## Dictionary

`DICT` in `trade-secrets.jsx` (459 words) = user's original `dict3.js` (424) + 35 additions:
AHA AMP APP BIB BOO BRO COO DAB DID DOC DUD EMU FIN GOO GOT HEY HEX HUB IMP LED LOB LUG MET MIC MOO OAF PEW REV TAB TOT UGH WAG WOW YAK YAM.
No obscure / crossword-tier words (ASP, AWL, GNU, ELL, FRO, VIE, SIC…). PLY is a candidate for removal.

## Generator (as prototyped)

1. Pick 3 distinct words, sort them; row i gets color i.
2. **Spanning-letter cap:** count letters that occur in two *different* words (e.g. DOG/DUG/RUB → D, G, U = 3).
   Reject if more than 2. Repeats inside one word (ODD) are harmless and not counted.
   Distribution after cap: 20% zero, 48% one, 32% two. Duplicates are wanted — they're what makes colors/memory matter.
3. Shuffle up to 40 times; reject already-solved grids; compute floor; accept if `3 <= floor < ∞`.
4. Floor = min over all winning targets (every anagram per color group × 6 row orders) of min swaps, where swaps = 9 − max cycles over all letter+color-consistent assignments.
5. Typical par 6–7; ~0.2 ms per puzzle.

## Next task: puzzle generator / solver

Standalone (no UI), to be used by the Svelte game. Expected pieces:
- **Generator** — the rules above; deterministic/seedable; able to target a difficulty (floor/par) and ideally precompute a puzzle bank.
- **Exact floor** — perfect-information minimum swaps (as above).
- **Player-model solver** — knows letters + dictionary, learns colors only by tapping; used to calibrate par and to evaluate rule changes. Report swaps *and* taps.
- Stats harness: distributions of floor, solver score, score − floor, spanning letters, generation time.

## Open questions (parked, don't resolve silently)

- **Scores clump on even numbers** (each block costs exactly +2): solver landed on floor 37%, floor+2 37%, floor+4 18%.
- **Paid color reveal** (user likes it; no once-per-game limit): currently worthless — a solver that forgets colors instantly ties one with perfect info (~5.86 swaps), because same-color taps are free. It only has value if failed/same-color taps cost something (then it saves ~1 tap, so price ~1–2, not 10).
- **Svelte build:** swap animation via CSS transform (tiles need stable ids, not array-slot swaps); a nudge/shake for same-color refusals; animate same-letter swaps so they're visible.
- Game-jam fit: not a good fit for the "GENRE COLLISION" theme; golf framing was rejected as too subtle.

## Working with this user

Terse feedback; push back with measurements, not guesses. Don't re-open decisions listed above as "problems".
