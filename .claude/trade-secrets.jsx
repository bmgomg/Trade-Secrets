import React, { useState, useEffect, useRef } from "react";

const DICT = "ACE ACT ADD ADO AGE AGO AHA AID AIL AIM AIR ALE ALL AMP AND ANT ANY APE APP APT ARC ARE ARK ARM ART ASH ASK ASS ATE AWE AXE AYE BAD BAG BAN BAR BAT BAY BED BEE BEG BET BIB BID BIG BIN BIO BIT BOA BOB BOG BOO BOT BOW BOX BOY BRA BRO BUD BUG BUM BUN BUS BUT BUY BYE CAB CAN CAP CAR CAT CAW COB COD COG CON COO COP COT COW COY CRY CUB CUE CUP CUT DAB DAD DAM DAY DEN DEW DID DIE DIG DIM DIN DIP DOC DOE DOG DON DOT DRY DUB DUD DUE DUG DUO DYE EAR EAT EBB ECO EEL EGG EGO EKE ELF ELK ELM EMU END EON ERA ERR EVE EWE EYE FAD FAN FAR FAT FAX FED FEE FEN FEW FIB FIG FIN FIR FIT FIX FLU FLY FOE FOG FOR FOX FRY FUN FUR GAG GAL GAP GAS GAY GEL GEM GET GIG GIN GOD GOO GOT GUM GUN GUT GUY GYM HAD HAG HAM HAS HAT HAW HAY HEM HEN HER HEW HEX HEY HID HIM HIP HIS HIT HOE HOG HOP HOT HOW HUB HUE HUG HUM HUT ICE ICY ILL IMP INK INN ION IRE IRK ITS IVY JAB JAM JAR JAW JAY JET JIG JOB JOG JOT JOY JUG JUT KEG KEN KEY KID KIN KIT LAB LAD LAG LAP LAW LAX LAY LED LEG LET LID LIE LIP LIT LOB LOG LOO LOT LOW LOX LUG MAD MAN MAP MAR MAT MAX MAY MEN MET MIC MIX MOB MOM MOO MOP MOW MUD MUG MUM NAB NAG NAP NAY NET NEW NIL NIP NIX NOD NOR NOT NOW NUN NUT OAF OAK OAR OAT ODD ODE OFF OHM OIL OLD ONE OPT ORB ORE OUR OUT OWE OWL OWN PAD PAL PAN PAR PAT PAW PAY PEA PEE PEG PEN PEP PER PET PEW PIE PIG PIN PIT PLY POD POP POT POX PRO PRY PUB PUG PUN PUP PUT RAG RAM RAN RAP RAT RAW RAY RED REV RIB RID RIG RIM RIP ROB ROD ROE ROT ROW RUB RUG RUM RUN RUT RYE SAD SAG SAP SAT SAW SAX SAY SEA SEE SET SEW SEX SHE SHY SIN SIP SIR SIT SIX SKI SKY SLY SOB SOD SON SOW SOY SPA SPY SUB SUE SUM SUN TAB TAD TAG TAN TAP TAR TAX TEA TEE TEN THE TIE TIN TIP TOE TON TOO TOP TOT TOW TOY TRY TUB TUG TWO UGH URN USE VAN VAT VET VEX VIA VOW WAD WAG WAN WAR WAS WAX WAY WEB WED WEE WET WHO WHY WIG WIN WIT WOE WOK WON WOO WOW WRY YAK YAM YAP YEN YES YET YOU ZAP ZEN ZIP ZOO".split(" ");
const DICT_SET = new Set(DICT);

const INK = ["#E0457B", "#F2B134", "#2FB3A8"];

/* ---------- puzzle helpers ---------- */

function shuffle(a) {
  const c = a.slice();
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

function rows(cells) {
  return [0, 3, 6].map((i) =>
    cells.slice(i, i + 3).map((c) => c.letter).join("")
  );
}

function isSolved(cells) {
  const r = rows(cells);
  if (!r.every((w) => DICT_SET.has(w))) return false;
  // Each row must also be a single color: the right words, split the right way.
  // Row order doesn't matter.
  for (let i = 0; i < 9; i += 3) {
    if (cells[i].color !== cells[i + 1].color) return false;
    if (cells[i].color !== cells[i + 2].color) return false;
  }
  return true;
}

const sortKey = (ls) => ls.slice().sort().join("");

const ANAGRAMS = (() => {
  const m = {};
  for (const w of DICT) {
    const k = sortKey(w.split(""));
    (m[k] = m[k] || []).push(w);
  }
  return m;
})();

function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of permutations(rest)) out.push([arr[i]].concat(p));
  }
  return out;
}

function countCycles(f) {
  const seen = new Array(f.length).fill(false);
  let n = 0;
  for (let i = 0; i < f.length; i++) {
    if (seen[i]) continue;
    n++;
    let j = i;
    while (!seen[j]) {
      seen[j] = true;
      j = f[j];
    }
  }
  return n;
}

const ROW_ORDERS = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

/** Every arrangement that wins: each color group spelling a word, in any row order. */
function winningTargets(cells) {
  const groups = [[], [], []];
  cells.forEach((c) => groups[c.color].push(c.letter));
  const opts = groups.map((g) => ANAGRAMS[sortKey(g)] || []);
  const out = [];
  for (const a of opts[0])
    for (const b of opts[1])
      for (const c of opts[2]) {
        const w = [a, b, c];
        for (const order of ROW_ORDERS) {
          const target = [];
          order.forEach((k) =>
            w[k].split("").forEach((letter) => target.push({ letter, color: k }))
          );
          out.push(target);
        }
      }
  return out;
}

/** Fewest swaps from cells to target, matching on letter AND color. */
function swapsTo(cells, target) {
  const g = {};
  const key = (c) => c.letter + c.color;
  cells.forEach((c, i) => {
    const k = key(c);
    (g[k] = g[k] || { s: [], t: [] }).s.push(i);
  });
  target.forEach((c, i) => {
    const k = key(c);
    (g[k] = g[k] || { s: [], t: [] }).t.push(i);
  });
  const ks = Object.keys(g);
  if (ks.some((k) => g[k].s.length !== g[k].t.length)) return Infinity;
  const f = new Array(9);
  let best = 0;
  (function rec(k) {
    if (k === ks.length) {
      best = Math.max(best, countCycles(f));
      return;
    }
    const gg = g[ks[k]];
    for (const p of permutations(gg.t)) {
      gg.s.forEach((pos, i) => (f[pos] = p[i]));
      rec(k + 1);
    }
  })(0);
  return 9 - best;
}

function floorFor(cells) {
  const t = winningTargets(cells);
  return t.length ? Math.min(...t.map((x) => swapsTo(cells, x))) : Infinity;
}

function newGame() {
  for (let attempt = 0; attempt < 400; attempt++) {
    const picked = [];
    while (picked.length < 3) {
      const w = DICT[Math.floor(Math.random() * DICT.length)];
      if (!picked.includes(w)) picked.push(w);
    }
    const words = picked.slice().sort();
    const solved = [];
    words.forEach((w, i) =>
      w.split("").forEach((letter) => solved.push({ letter, color: i }))
    );
    // A letter that appears in two different words is indistinguishable without
    // memory. One or two of those is the point; three at once is a pile-up.
    const seenIn = {};
    solved.forEach((c) => {
      (seenIn[c.letter] = seenIn[c.letter] || new Set()).add(c.color);
    });
    const spanning = Object.values(seenIn).filter((set) => set.size > 1).length;
    if (spanning > 2) continue;
    for (let t = 0; t < 40; t++) {
      const cells = shuffle(solved);
      if (isSolved(cells)) continue;
      const floor = floorFor(cells);
      // Par allows two extra swaps: one same-color block, routed through a third tile.
      if (floor >= 3 && floor < Infinity)
        return { words, cells, floor, parValue: floor + 2 };
    }
  }
  const words = ["CAT", "DOG", "ELF"];
  const cells = [];
  words.forEach((w, i) =>
    w.split("").forEach((letter) => cells.push({ letter, color: i }))
  );
  return { words, cells: shuffle(cells), floor: 4, parValue: 6 };
}

function scoreLine(swaps, parValue) {
  const d = swaps - parValue;
  const n = `${swaps} ${swaps === 1 ? "swap" : "swaps"}`;
  if (d === 0) return `Solved in ${n}. Even par.`;
  if (d < 0) return `Solved in ${n}, ${-d} under par.`;
  return `Solved in ${n}, ${d} over par.`;
}

/* ---------- component ---------- */

export default function TradeSecrets() {
  const [game, setGame] = useState(newGame);
  const [sel, setSel] = useState(null);
  const [shown, setShown] = useState([]);
  const [flash, setFlash] = useState([]);
  const [busy, setBusy] = useState(false);
  const [swaps, setSwaps] = useState(0);
  const [probes, setProbes] = useState(0);
  const [won, setWon] = useState(false);
  const [quit, setQuit] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!won && !quit && isSolved(game.cells) && probes > 0) {
      setWon(true);
    }
  }, [game, won, quit, probes]);

  function reset() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setGame(newGame());
    setSel(null);
    setShown([]);
    setFlash([]);
    setBusy(false);
    setSwaps(0);
    setProbes(0);
    setWon(false);
    setQuit(false);
  }

  function tap(i) {
    if (busy || won || quit) return;
    if (sel === null) {
      setSel(i);
      return;
    }
    if (sel === i) return;
    const a = sel;
    const b = i;
    const differ = game.cells[a].color !== game.cells[b].color;
    setSel(null);
    setShown([a, b]);
    setBusy(true);
    setProbes((p) => p + 1);
    timers.current.push(
      setTimeout(() => {
        if (differ) {
          setGame((g) => {
            const cells = g.cells.slice();
            const t = cells[a];
            cells[a] = cells[b];
            cells[b] = t;
            return { ...g, cells };
          });
          setSwaps((s) => s + 1);
          setFlash([a, b]);
        }
        setShown([]);
        timers.current.push(
          setTimeout(() => {
            setFlash([]);
            setBusy(false);
          }, 280)
        );
      }, 850)
    );
  }

  const open = won || quit;

  return (
    <div className="ts-root">
      <style>{css}</style>

      <header className="ts-head">
        <h1>Trade Secrets</h1>
        <p className="ts-tag">Every peek risks a move.</p>
        <p>
          Three words hide in this grid, one color each. Tap two letters to see
          their colors. Different colors trade places; matching colors stay
          put. Either way the colors go dark again. You win when each row is a
          word in a single color.
        </p>
      </header>

      <div className="ts-grid" role="grid">
        {game.cells.map((cell, i) => {
          const lit = open || sel === i || shown.includes(i);
          return (
            <button
              key={i}
              className={
                "ts-tile" +
                (lit ? " lit" : "") +
                (sel === i ? " sel" : "") +
                (flash.includes(i) ? " flash" : "")
              }
              style={lit ? { background: INK[cell.color] } : undefined}
              onClick={() => tap(i)}
              disabled={busy || open}
              aria-label={`Row ${Math.floor(i / 3) + 1}, position ${
                (i % 3) + 1
              }, letter ${cell.letter}`}
            >
              {cell.letter}
            </button>
          );
        })}
      </div>

      <div className="ts-score">
        <span className="ts-count">{swaps}</span>
        <span className="ts-unit">
          {swaps === 1 ? "swap" : "swaps"} · par {game.parValue}
        </span>
        <span className="ts-probes">{probes} tapped pairs</span>
      </div>

      <p className="ts-status" aria-live="polite">
        {won
          ? scoreLine(swaps, game.parValue)
          : quit
          ? `The words were ${game.words.join(", ")}.`
          : sel !== null
          ? "Now pick its partner."
          : "Pick two letters."}
      </p>

      <div className="ts-actions">
        <button className="ts-btn" onClick={reset}>
          New puzzle
        </button>
        {!open && (
          <button className="ts-btn ghost" onClick={() => setQuit(true)}>
            Show the answer
          </button>
        )}
      </div>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;800&display=swap');

.ts-root{
  --paper:#E4E7EC;
  --ice:#191C22;
  --slate:#2E3440;
  --mute:#6A7180;
  font-family:'Archivo',system-ui,-apple-system,'Segoe UI',sans-serif;
  background:var(--paper);
  color:var(--ice);
  min-height:100%;
  padding:40px 20px 48px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:26px;
}
.ts-head{max-width:34ch;text-align:center}
.ts-head h1{
  font-size:15px;font-weight:700;letter-spacing:.14em;
  margin:0 0 12px;text-transform:uppercase;
}
.ts-tag{margin:0 0 10px;font-size:15px;font-weight:500;color:var(--ice)}
.ts-head p{margin:0;font-size:14px;line-height:1.55;color:var(--mute)}

.ts-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:8px;
  width:min(320px,86vw);
}
.ts-tile{
  aspect-ratio:1;
  border:none;
  border-radius:3px;
  background:var(--slate);
  color:#EDEFF3;
  font-family:inherit;
  font-size:clamp(30px,10vw,42px);
  font-weight:800;
  letter-spacing:.02em;
  cursor:pointer;
  transition:background .22s ease,color .22s ease,transform .18s ease,box-shadow .15s ease;
}
.ts-tile:hover:not(:disabled){transform:translateY(-2px)}
.ts-tile:focus-visible{outline:3px solid var(--ice);outline-offset:3px}
.ts-tile.sel{box-shadow:inset 0 0 0 4px rgba(25,28,34,.85)}
.ts-tile.lit{color:#1A1D23}
.ts-tile.flash{transform:scale(.88)}
.ts-tile:disabled{cursor:default}

.ts-score{display:flex;align-items:baseline;gap:8px}
.ts-count{font-size:40px;font-weight:800;line-height:1}
.ts-unit{font-size:14px;color:var(--mute)}
.ts-probes{font-size:14px;color:var(--mute);margin-left:10px}

.ts-status{margin:0;font-size:14px;min-height:1.4em;text-align:center}

.ts-actions{display:flex;gap:10px}
.ts-btn{
  font-family:inherit;font-size:14px;font-weight:500;
  padding:9px 16px;border-radius:3px;cursor:pointer;
  background:var(--ice);color:var(--paper);border:1px solid var(--ice);
}
.ts-btn.ghost{background:transparent;color:var(--mute);border-color:#C3C8D1}

@media (prefers-reduced-motion:reduce){
  .ts-tile{transition:background .01s,color .01s}
  .ts-tile:hover:not(:disabled),.ts-tile.flash{transform:none}
}
`;
