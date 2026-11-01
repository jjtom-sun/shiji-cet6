/*
 * Corpus frequency for the CET-6 listening bank.
 *
 * Design notes:
 * - Document frequency is the number of exam sets containing a lemma.
 * - Tokens are matched case-sensitively for proper-noun rejection: a
 *   capitalised word inside a sentence is treated as a name and skipped.
 * - Inflection is folded to a dictionary lemma, but lexicalised forms
 *   (processing n., intriguing adj.) stay as their own entries.
 * - An example is only attached when the sentence actually contains the
 *   lemma or one of its observed inflected forms.
 */

const IRREGULAR_VERB = {
  arose: 'arise', arisen: 'arise', awoke: 'awake', awoken: 'awake',
  was: 'be', were: 'be', been: 'be', being: 'be',
  bore: 'bear', borne: 'bear', born: 'bear',
  beat: 'beat', beaten: 'beat', became: 'become', began: 'begin', begun: 'begin',
  bent: 'bend', bound: 'bind', bit: 'bite', bitten: 'bite', bled: 'bleed',
  blew: 'blow', blown: 'blow', broke: 'break', broken: 'break', bred: 'breed',
  brought: 'bring', built: 'build', burnt: 'burn', bought: 'buy',
  caught: 'catch', chose: 'choose', chosen: 'choose', clung: 'cling',
  came: 'come', crept: 'creep', dealt: 'deal', dug: 'dig', dived: 'dive', dove: 'dive',
  did: 'do', done: 'do', drew: 'draw', drawn: 'draw', dreamt: 'dream',
  drank: 'drink', drunk: 'drink', drove: 'drive', driven: 'drive',
  ate: 'eat', eaten: 'eat', fell: 'fall', fallen: 'fall', fed: 'feed',
  felt: 'feel', fought: 'fight', found: 'find', fled: 'flee',
  flew: 'fly', flown: 'fly', forbade: 'forbid', forbidden: 'forbid',
  forgot: 'forget', forgotten: 'forget', forgave: 'forgive', forgiven: 'forgive',
  froze: 'freeze', frozen: 'freeze', got: 'get', gotten: 'get',
  gave: 'give', given: 'give', went: 'go', gone: 'go', grew: 'grow', grown: 'grow',
  hung: 'hang', had: 'have', heard: 'hear', hid: 'hide', hidden: 'hide',
  held: 'hold', kept: 'keep', knew: 'know', known: 'know', laid: 'lay', led: 'lead',
  leant: 'lean', leapt: 'leap', learnt: 'learn', left: 'leave', lent: 'lend',
  lay: 'lie', lain: 'lie', lit: 'light', lost: 'lose', made: 'make',
  meant: 'mean', met: 'meet', mistook: 'mistake', mistaken: 'mistake',
  overcame: 'overcome', paid: 'pay', proved: 'prove', proven: 'prove',
  rode: 'ride', ridden: 'ride', rang: 'ring', rung: 'ring',
  rose: 'rise', risen: 'rise', ran: 'run', said: 'say', saw: 'see', seen: 'see',
  sought: 'seek', sold: 'sell', sent: 'send', sewed: 'sew', sewn: 'sew',
  shook: 'shake', shaken: 'shake', shone: 'shine', shot: 'shoot',
  showed: 'show', shown: 'show', shrank: 'shrink', shrunk: 'shrink',
  sang: 'sing', sung: 'sing', sank: 'sink', sunk: 'sink', sat: 'sit',
  slept: 'sleep', slid: 'slide', spoke: 'speak', spoken: 'speak',
  sped: 'speed', spelt: 'spell', spent: 'spend', spilt: 'spill',
  spun: 'spin', spat: 'spit', sprang: 'spring', sprung: 'spring',
  stood: 'stand', stole: 'steal', stolen: 'steal', stuck: 'stick',
  stung: 'sting', stank: 'stink', stunk: 'stink', strode: 'stride',
  struck: 'strike', strung: 'string', strove: 'strive', striven: 'strive',
  swore: 'swear', sworn: 'swear', swept: 'sweep', swelled: 'swell', swollen: 'swell',
  swam: 'swim', swum: 'swim', swung: 'swing', took: 'take', taken: 'take',
  taught: 'teach', tore: 'tear', torn: 'tear', told: 'tell',
  thought: 'think', threw: 'throw', thrown: 'throw', thrust: 'thrust',
  understood: 'understand', undertook: 'undertake', undertaken: 'undertake',
  woke: 'wake', woken: 'wake', wore: 'wear', worn: 'wear',
  wove: 'weave', woven: 'weave', wept: 'weep', won: 'win', wound: 'wind',
  withdrew: 'withdraw', withdrawn: 'withdraw', wrote: 'write', written: 'write'
};

const IRREGULAR_PLURAL = {
  analyses: 'analysis', bacteria: 'bacterium', crises: 'crisis',
  criteria: 'criterion', curricula: 'curriculum', diagnoses: 'diagnosis',
  emphases: 'emphasis', fungi: 'fungus', genera: 'genus', hypotheses: 'hypothesis',
  loci: 'locus', nuclei: 'nucleus', oases: 'oasis', phenomena: 'phenomenon',
  parentheses: 'parenthesis', radii: 'radius', stimuli: 'stimulus',
  syllabi: 'syllabus', syntheses: 'synthesis', theses: 'thesis'
};

const IRREGULAR_ADJ = { better: 'good', best: 'good', worse: 'bad', worst: 'bad' };

function levelOf(d) {
  const levels = d.levels || [];
  if (levels.includes('cet6') && !levels.includes('cet4') && !levels.includes('hs')) return 'cet6-only';
  if (levels.includes('cet6')) return 'cet6';
  if (levels.includes('cet4')) return 'cet4';
  if (levels.includes('hs')) return 'hs';
  return 'other';
}

function candidates(tok) {
  const out = [];
  if (/ies$/.test(tok) && tok.length > 4) out.push(tok.slice(0, -3) + 'y');
  if (/ied$/.test(tok) && tok.length > 4) out.push(tok.slice(0, -3) + 'y');
  if (/ing$/.test(tok) && tok.length > 5) {
    out.push(tok.slice(0, -3) + 'e');
    out.push(tok.slice(0, -3));
    if (/([b-df-hj-np-tv-z])\1ing$/.test(tok)) out.push(tok.slice(0, -4));
  }
  if (/ed$/.test(tok) && tok.length > 4) {
    out.push(tok.slice(0, -1));
    out.push(tok.slice(0, -2));
    if (/([b-df-hj-np-tv-z])\1ed$/.test(tok)) out.push(tok.slice(0, -3));
  }
  if (/s$/.test(tok) && !/ss$/.test(tok) && tok.length > 3) {
    out.push(tok.slice(0, -1));
    if (/es$/.test(tok) && tok.length > 4) out.push(tok.slice(0, -2));
  }
  if (/ly$/.test(tok) && tok.length > 4) out.push(tok.slice(0, -2));
  return [...new Set(out)];
}

function makeLemmatiser(dict, stop) {
  return function lemmaOf(tok) {
    if (IRREGULAR_VERB[tok]) return IRREGULAR_VERB[tok];
    if (IRREGULAR_PLURAL[tok]) return IRREGULAR_PLURAL[tok];
    if (IRREGULAR_ADJ[tok]) return IRREGULAR_ADJ[tok];
    const d = dict[tok];
    if (d) {
      const pos = String(d.pos || '').toLowerCase();
      const looksInflected = /(?:ed|ing|s)$/.test(tok);
      if (!looksInflected || /^(n|adj|adv|prep|conj|num|pron|art|int)/.test(pos)) return tok;
    }
    const found = candidates(tok).find(x => dict[x] && !stop.has(x));
    if (found) return found;
    return d ? tok : null;
  };
}

function isCapitalised(part) {
  return /^[A-Z]/.test(part);
}

export function buildFrequency(sets, dict, options = {}) {
  const stop = options.stop || new Set();
  const lowerLevel = options.lowerLevel || new Set();
  const excludeWords = options.excludeWords || new Set();
  const lemmaOf = makeLemmatiser(dict, stop);

  const tokens = [];
  const lowerSeen = new Map();
  let sentences = 0;

  for (const set of sets) {
    for (let si = 0; si < set.sentences.length; si++) {
      const sen = set.sentences[si];
      const text = String(sen.text || '');
      sentences++;
      const re = /[A-Za-z]+(?:['’\-][A-Za-z]+)*/g;
      let m;
      while ((m = re.exec(text))) {
        const raw = m[0];
        if (/['’]/.test(raw)) continue;
        const parts = raw.split('-');
        const caps = parts.filter(isCapitalised).length;
        if (parts.length > 1 && caps === parts.length) continue;
        if (/^[A-Z]{2,}$/.test(raw)) continue;
        const lower = raw.toLowerCase();
        const atStart = /^[\s"'“”‘’(\[\-–—]*$/.test(text.slice(0, m.index));
        if (raw === lower) lowerSeen.set(lower, (lowerSeen.get(lower) || 0) + 1);
        tokens.push({ setId: set.id, sen, raw, lower, parts, atStart });
      }
    }
  }

  const stats = new Map();
  const occurrences = new Map();
  let includedTokens = 0;
  let skippedNames = 0;

  for (const t of tokens) {
    for (let pi = 0; pi < t.parts.length; pi++) {
      const partRaw = t.parts[pi];
      if (!/^[A-Za-z]+$/.test(partRaw)) continue;
      const tok = partRaw.toLowerCase();
      if (tok.length < 2 || stop.has(tok)) continue;
      if (isCapitalised(partRaw)) {
        if (!t.atStart || pi > 0) { skippedNames++; continue; }
        if (!(lowerSeen.get(tok) > 0 || lowerLevel.has(tok))) { skippedNames++; continue; }
      }
      const lemma = lemmaOf(tok);
      if (!lemma || excludeWords.has(lemma) || !dict[lemma] || !dict[lemma].zh) continue;
      if (!stats.has(lemma)) {
        stats.set(lemma, {
          word: lemma,
          sets: new Set(),
          count: 0,
          forms: new Map(),
          level: levelOf(dict[lemma]),
          zh: dict[lemma].zh,
          phonetic: dict[lemma].phonetic || '',
          pos: dict[lemma].pos || ''
        });
      }
      const st = stats.get(lemma);
      st.sets.add(t.setId);
      st.count++;
      st.forms.set(tok, (st.forms.get(tok) || 0) + 1);
      includedTokens++;
      if (!occurrences.has(lemma)) occurrences.set(lemma, []);
      occurrences.get(lemma).push({
        setId: t.setId,
        sen: t.sen,
        form: tok,
        exact: tok === lemma,
        compound: t.parts.length > 1
      });
    }
  }

  const ranked = [...stats.values()].map(st => {
    const forms = [...st.forms.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([f]) => f);
    return {
      word: st.word,
      df: st.sets.size,
      count: st.count,
      level: st.level,
      zh: st.zh,
      phonetic: st.phonetic,
      pos: st.pos,
      forms,
      example: pickExample(occurrences.get(st.word) || [])
    };
  }).sort((a, b) => b.df - a.df || b.count - a.count || a.word.localeCompare(b.word));

  return {
    ranked,
    meta: { sets: sets.length, sentences, tokens: tokens.length, includedTokens, skippedNames }
  };
}

function pickExample(list) {
  if (!list.length) return null;
  const scored = list.map(o => {
    let score = o.exact ? (o.compound ? 1 : 0) : (o.compound ? 3 : 2);
    if (!o.sen.zh) score += 0.25;
    if (!o.sen.text || o.sen.text.length > 280) score += 0.5;
    if (/\bnon-[a-z]+/i.test(o.sen.text) && !/^non/.test(o.form)) score += 0.75;
    return { o, score };
  }).sort((a, b) => a.score - b.score || a.o.sen.text.length - b.o.sen.text.length);
  const best = scored[0].o;
  return { en: best.sen.text, zh: best.sen.zh || '', setId: best.setId };
}
