import { dict4 } from './dict4.js';

// 459 words: the original dict3.js (424) plus 35 common additions (see CLAUDE.md).
export const DICT = (
	'ACE ACT ADD ADO AGE AGO AHA AID AIL AIM AIR ALE ALL AMP AND ANT ANY APE APP APT ARC ARE ARK ARM ART ASH ASK ASS ATE AWE AXE AYE ' +
	'BAD BAG BAN BAR BAT BAY BED BEE BEG BET BIB BID BIG BIN BIO BIT BOA BOB BOG BOO BOT BOW BOX BOY BRA BRO BUD BUG BUM BUN BUS BUT BUY BYE ' +
	'CAB CAN CAP CAR CAT CAW COB COD COG CON COO COP COT COW COY CRY CUB CUE CUP CUT ' +
	'DAB DAD DAM DAY DEN DEW DID DIE DIG DIM DIN DIP DOC DOE DOG DON DOT DRY DUB DUD DUE DUG DUO DYE ' +
	'EAR EAT EBB ECO EEL EGG EGO EKE ELF ELK ELM EMU END EON ERA ERR EVE EWE EYE ' +
	'FAD FAN FAR FAT FAX FED FEE FEN FEW FIB FIG FIN FIR FIT FIX FLU FLY FOE FOG FOR FOX FRY FUN FUR ' +
	'GAG GAL GAP GAS GAY GEL GEM GET GIG GIN GOD GOO GOT GUM GUN GUT GUY GYM ' +
	'HAD HAG HAM HAS HAT HAW HAY HEM HEN HER HEW HEX HEY HID HIM HIP HIS HIT HOE HOG HOP HOT HOW HUB HUE HUG HUM HUT ' +
	'ICE ICY ILL IMP INK INN ION IRE IRK ITS IVY JAB JAM JAR JAW JAY JET JIG JOB JOG JOT JOY JUG JUT KEG KEN KEY KID KIN KIT ' +
	'LAB LAD LAG LAP LAW LAX LAY LED LEG LET LID LIE LIP LIT LOB LOG LOO LOT LOW LOX LUG ' +
	'MAD MAN MAP MAR MAT MAX MAY MEN MET MIC MIX MOB MOM MOO MOP MOW MUD MUG MUM ' +
	'NAB NAG NAP NAY NET NEW NIL NIP NIX NOD NOR NOT NOW NUN NUT ' +
	'OAF OAK OAR OAT ODD ODE OFF OHM OIL OLD ONE OPT ORB ORE OUR OUT OWE OWL OWN ' +
	'PAD PAL PAN PAR PAT PAW PAY PEA PEE PEG PEN PEP PER PET PEW PIE PIG PIN PIT PLY POD POP POT POX PRO PRY PUB PUG PUN PUP PUT ' +
	'RAG RAM RAN RAP RAT RAW RAY RED REV RIB RID RIG RIM RIP ROB ROD ROE ROT ROW RUB RUG RUM RUN RUT RYE ' +
	'SAD SAG SAP SAT SAW SAX SAY SEA SEE SET SEW SEX SHE SHY SIN SIP SIR SIT SIX SKI SKY SLY SOB SOD SON SOW SOY SPA SPY SUB SUE SUM SUN ' +
	'TAB TAD TAG TAN TAP TAR TAX TEA TEE TEN THE TIE TIN TIP TOE TON TOO TOP TOT TOW TOY TRY TUB TUG TWO ' +
	'UGH URN USE VAN VAT VET VEX VIA VOW WAD WAG WAN WAR WAS WAX WAY WEB WED WEE WET WHO WHY WIG WIN WIT WOE WOK WON WOO WOW WRY ' +
	'YAK YAM YAP YEN YES YET YOU ZAP ZEN ZIP ZOO'
).split(' ');

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
