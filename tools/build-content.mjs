/*
 * Builds the real-exam listening library, listening high-frequency bank,
 * and full CET-6 vocabulary lookup from attributed open sources.
 *
 * Sources (not bundled here):
 * - getfine333-ux/cet6-listening-study web/dist/data.js
 *   (real exam transcripts, options, answers, translations, timestamps;
 *    upstream CET-6 listening resources declared CC BY 4.0)
 * - KyleBing/english-vocabulary CET6/CET4/high-school JSONL (BSD-3-Clause)
 * - Corpus frequency is computed here by tools/frequency.mjs; stats.json only
 *   supplies the dictionary and level labels.
 *
 * Run with CONTENT_SRC pointing to the directory containing those files.
 * The current run reads them from the Windows temp directory.
 */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { buildFrequency } from './frequency.mjs';

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.CONTENT_SRC || path.join(process.env.TEMP || path.join(PROJECT, 'sources'));
const OUT = path.join(PROJECT, 'assets/js/data');
const SRC_DATA = path.join(SRC, 'glsrc/cet6-listening-study-main/web/dist/data.js');

const code = fs.readFileSync(SRC_DATA, 'utf8');
const cctx = { window: {} };
vm.createContext(cctx);
vm.runInContext(code, cctx);
const sets = cctx.window.CET6_DATA;
const sourceStats = JSON.parse(fs.readFileSync(path.join(SRC, 'stats.json'), 'utf8'));
const dict = sourceStats.dict;
const LEGACY_IDS = JSON.parse(fs.readFileSync(path.join(PROJECT, 'tools/legacy-listening-ids.json'), 'utf8'));

const STOP = new Set(('a an the and or but if because so as of to in on at by for with from into over under about between among through during before after above below up down out off again further then once here there all any both each few more most other some such no nor not only own same than too very can could may might must shall should will would do does did done doing have has had having is are was were be been being i you he she it we they me him her us them my your his its our their this that these those what which who whom whose when where why how also however therefore thus moreover furthermore nevertheless consequently').split(/\s+/));
const ULTRA = new Set(('people person thing things time year years day days way make made get got good well many much more most really just even new now first two one lot people something someone everything nothing work works working say said see seen take took look come came go went want wanted need needed know knew think thought find found give gave use used try tried keep kept put let become became start started help helped talk talked live lived feel felt leave left turn turned mean meant show showed play played run ran move moved like liked tell told call called write wrote provide provided sit sat stand stood lose lost pay paid meet met include included continue continued set setting learn learned change changed lead led understand understood watch watched follow followed stop stopped create created speak spoke read allow allowed add added spend spent grow grew open opened walk walked win won offer offered remember remembered love loved consider considered appear appeared buy bought wait waited serve served die died send sent expect expected build built stay stayed fall fell cut reached remain suggest raise pass sell require report decide pull return explain hope develop carry break receive agree support hit produce eat cover catch draw choose cause point listen realize place close involve reduce establish').split(/\s+/));
const KEY_STOP = new Set([...ULTRA, 'american','british','chinese','english','french','german','japanese','italian','european','asian','african','indian','australian','canadian','russian','spanish','dutch','irish','scottish','never','simply','different','soon','home','phone','bag','cook','book','fish','baby','city','adult','button','study','example']);

function cleanZh(s) { return String(s || '').replace(/\s+/g, ' ').replace(/\s+([，。；：！？、])/g, '$1').trim(); }
function cleanPhone(s) { return String(s || '').replace(/^\/|\/$/g, '').trim(); }
function tokenize(s) { return (String(s || '').toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []); }
function norm(s) { return String(s || '').toLowerCase().replace(/\[[0-9]+\]/g, ' ').replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function stripLead(s) { return s.replace(/^(well|oh|and|but|so|now|yes|yeah|right|okay|ok|you know|i mean|actually|look)\s+/, ''); }

function fixText(s) {
  let t = String(s || '').replace(/^\uFEFF/, '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  t = t.replace(/\$([0-9][0-9.,]*)\\%\$/g, '$1%');
  t = t.replace(/\bhis\.country's\b/gi, "his country's");
  t = t.replace(/\bforeignservice\b/gi, 'foreign service');
  t = t.replace(/\bambassadorto\b/gi, 'ambassador to');
  t = t.replace(/\bofwellbeing\b/gi, 'of wellbeing');
  t = t.replace(/\bmissing inaction\b/gi, 'missing in action');
  t = t.replace(/\s+/g, ' ').trim();
  t = t.replace(/\s+([,.;:!?])/g, '$1').replace(/([,;:!?])(?=[A-Za-z])/g, '$1 ');
  return t.replace(/\s+/g, ' ').trim();
}

function alignEvidence(transcript, sentences) {
  const map = {};
  const re = /\[([0-9]+)\]/g;
  let m;
  const marks = [];
  while ((m = re.exec(transcript))) {
    marks.push({ num: Number(m[1]), after: transcript.slice(m.index + m[0].length, Math.min(transcript.length, m.index + m[0].length + 260)) });
  }
  let cursor = 0;
  for (const mk of marks) {
    if (map[mk.num] !== undefined) continue;
    const target = stripLead(norm(mk.after));
    const words = target.split(' ').slice(0, 9).join(' ');
    if (!words) continue;
    let found = -1;
    for (let i = cursor; i < sentences.length; i++) {
      const t = stripLead(norm(sentences[i].text));
      if (t.startsWith(words) || (words.length > 25 && t.includes(words)) || (t.length > 20 && words.startsWith(t.slice(0, Math.min(t.length, 55))))) {
        found = i;
        break;
      }
    }
    if (found < 0) {
      for (let i = 0; i < sentences.length; i++) {
        if (stripLead(norm(sentences[i].text)).includes(words)) { found = i; break; }
      }
    }
    if (found >= 0) { map[mk.num] = found; cursor = found; }
  }
  return map;
}

function headOfToken(tok) {
  if (dict[tok]) return tok;
  const c = [];
  if (tok.endsWith('ies') && tok.length > 4) c.push(tok.slice(0, -3) + 'y');
  if (tok.endsWith('ied') && tok.length > 4) c.push(tok.slice(0, -3) + 'y');
  if (tok.endsWith('ing') && tok.length > 5) {
    c.push(tok.slice(0, -3) + 'e');
    c.push(tok.slice(0, -3));
    if (/([b-df-hj-np-tv-z])\1ing$/.test(tok)) c.push(tok.slice(0, -4));
  }
  if (tok.endsWith('ed') && tok.length > 4) {
    c.push(tok.slice(0, -1));
    c.push(tok.slice(0, -2));
    if (/([b-df-hj-np-tv-z])\1ed$/.test(tok)) c.push(tok.slice(0, -3));
  }
  if (tok.endsWith('s') && !tok.endsWith('ss') && tok.length > 3) {
    c.push(tok.slice(0, -1));
    if (tok.endsWith('es') && tok.length > 4) c.push(tok.slice(0, -2));
  }
  if (tok.endsWith('ly') && tok.length > 4) c.push(tok.slice(0, -2));
  const ok = [...new Set(c)].filter(x => dict[x]);
  return ok.length ? ok[0] : null;
}

const PHONETIC_FIX = {
  really: '/ˈriːəli/',
  sensitivity: '/ˌsensəˈtɪvəti/',
  errand: '/ˈerənd/',
  fighter: '/ˈfaɪtər/',
  reptile: '/ˈreptaɪl/',
  saturn: '/ˈsætɜːrn/',
  siren: '/ˈsaɪrən/',
  watchful: '/ˈwɒtʃfl/'
};

function phoneOf(word, raw) {
  if (PHONETIC_FIX[word]) return PHONETIC_FIX[word];
  return raw || '';
}

function exampleOf(x) {
  return x.example && x.example.en ? x.example : { en: '', zh: '' };
}

const lower = new Set(Object.keys(dict).filter(w => dict[w].levels.includes('cet4') || dict[w].levels.includes('hs')));
const EXCLUDE_FROM_FREQ = new Set(['hop', 'renewable']);
const SENSE_FIX = {
  intent: { pos: 'n&adj', zh: 'n. 意图，目的；adj. 专注的，坚决的' },
  texture: { pos: 'n', zh: 'n. 质地，口感；纹理' },
  aesthetic: { pos: 'n&adj', zh: 'n. 审美观，美学；adj. 审美的，美学的' },
  correlate: { pos: 'v&n', zh: 'v. 相关联；n. 相关物' },
  duplicate: { pos: 'v&n&adj', zh: 'v. 复制，重复；n. 副本；adj. 复制的' },
  array: { pos: 'n&v', zh: 'n. 一系列，大量；v. 排列' },
  alternate: { pos: 'adj&v', zh: 'adj. 替代的，交替的；v. 交替' },
  widely: { pos: 'adv', zh: 'adv. 广泛地；相差很大地' },
  positively: { pos: 'adv', zh: 'adv. 积极地，正面地；确实地' },
  bias: { pos: 'n', zh: 'n. 偏见；偏差' },
  tactics: { pos: 'n', zh: 'n. 策略，手段；战术' },
  bust: { pos: 'n&v', zh: 'n. 萧条，破产；v. 爆裂，打破' },
  stun: { pos: 'vt', zh: 'vt. 使震惊，使目瞪口呆（stunning adj. 令人惊叹的）' }
};
const freqBuild = buildFrequency(sets, dict, { stop: STOP, lowerLevel: lower, excludeWords: EXCLUDE_FROM_FREQ });
const freq = freqBuild.ranked;
for (const x of freq) {
  const fix = SENSE_FIX[x.word];
  if (fix) { x.pos = fix.pos; x.zh = fix.zh; }
}
const freqByWord = new Map(freq.map(x => [x.word, x]));
const cet6Words = Object.keys(dict).filter(w => dict[w].levels.includes('cet6') && dict[w].zh && /^[a-z][a-z'-]*$/.test(w)).sort();
const fullVocab = cet6Words.map(w => {
  const d = dict[w];
  const f = freqByWord.get(w);
  const fix = SENSE_FIX[w];
  return {
    word: w,
    phonetic: phoneOf(w, d.phonetic ? '/' + cleanPhone(d.phonetic) + '/' : ''),
    pos: fix ? fix.pos : (d.pos || ''),
    zh: fix ? fix.zh : cleanZh(d.zh),
    base: lower.has(w),
    listeningDf: f ? f.df : 0,
    listeningCount: f ? f.count : 0
  };
});

const cet6Only = freq.filter(x => x.level === 'cet6-only' && x.zh && dict[x.word]).sort((a, b) => b.df - a.df || b.count - a.count || a.word.localeCompare(b.word));
const allTop = freq.filter(x => x.zh && dict[x.word] && x.level !== 'other').sort((a, b) => b.df - a.df || b.count - a.count || a.word.localeCompare(b.word)).slice(0, 600);
const coreCount = cet6Only.filter(x => x.df >= 3).length;

const vctx = { window: { CET6: { data: {} } } };
vm.createContext(vctx);
vm.runInContext(fs.readFileSync(path.join(PROJECT, 'assets/js/data/vocab.data.js'), 'utf8'), vctx);
vm.runInContext(fs.readFileSync(path.join(PROJECT, 'assets/js/data/vocab-more.data.js'), 'utf8'), vctx);
const mainVocab = vctx.window.CET6.data.vocab;
const byWord = new Map(mainVocab.map(w => [w.word.toLowerCase(), w]));
const usedIds = new Set(mainVocab.map(w => w.id));

const newEntries = [];
const listeningWords = [];
const existingListeningMeta = {};
cet6Only.forEach((x, idx) => {
  const existing = byWord.get(x.word);
  const ex = exampleOf(x);
  const rank = idx + 1;
  let vid;
  if (existing) {
    vid = existing.id;
    existing.listeningRank = rank;
    existing.listeningDf = x.df;
    existing.listeningCount = x.count;
    existing.listeningExample = ex.en ? { en: ex.en, zh: ex.zh, src: 'CET6 真题听力原文（CC BY 4.0）' } : null;
    if (!(existing.tags || []).includes('听力')) existing.tags = (existing.tags || []).concat(['听力']);
    existingListeningMeta[x.word] = {
      listeningRank: rank, listeningDf: x.df, listeningCount: x.count,
      listeningExample: existing.listeningExample, tags: existing.tags
    };
  } else {
    vid = LEGACY_IDS[x.word];
    if (!vid || usedIds.has(vid)) vid = 'lw_' + x.word.replace(/[^a-z0-9]+/g, '_');
    usedIds.add(vid);
    const entry = {
      id: vid, word: x.word, phonetic: phoneOf(x.word, x.phonetic), pos: x.pos || '—', tier: 'listening',
      senses: [{ zh: cleanZh(x.zh), en: '' }],
      example: ex.en ? { en: ex.en, zh: ex.zh, src: 'CET6 真题听力原文（CC BY 4.0，译文为机器翻译）' } : null,
      collocations: [], synonyms: [], tags: ['听力'],
      listeningRank: rank, listeningDf: x.df, listeningCount: x.count
    };
    newEntries.push(entry);
    byWord.set(x.word, entry);
  }
  listeningWords.push({
    word: x.word, rank, id: vid, phonetic: phoneOf(x.word, x.phonetic), pos: x.pos || '', zh: cleanZh(x.zh),
    count: x.count, df: x.df, level: x.level, core: x.df >= 3,
    example: ex.en ? { en: ex.en, zh: ex.zh } : null, forms: x.forms
  });
});

const allTopOut = allTop.map((x, i) => ({
  rank: i + 1, word: x.word, phonetic: phoneOf(x.word, x.phonetic), pos: x.pos || '', zh: cleanZh(x.zh),
  count: x.count, df: x.df, level: x.level, core: x.df >= 5,
  id: (byWord.get(x.word) || {}).id || ''
}));

const corpusDict = {};
for (const w of Object.keys(dict)) {
  if (!dict[w].zh) continue;
  const f = freqByWord.get(w);
  if (!f) continue;
  const fix = SENSE_FIX[w];
  corpusDict[w] = {
    p: phoneOf(w, dict[w].phonetic ? '/' + cleanPhone(dict[w].phonetic) + '/' : ''),
    z: fix ? fix.zh : cleanZh(dict[w].zh),
    pos: fix ? fix.pos : (dict[w].pos || '')
  };
}

const EXCLUDE = new Set(['cet6_2016.12_set1', 'cet6_2016.12_set2', 'cet6_2017.06_set1', 'cet6_2017.06_set2', 'cet6_2019.12_set3', 'cet6_2022.06']);
const audioBase = 'https://media.githubusercontent.com/media/getfine333-ux/cet6-listening-study/main/';
const realSets = [];
const excludedList = [];
for (const s of sets) {
  if (EXCLUDE.has(s.id)) { excludedList.push(s.id); continue; }
  if (!s.quiz || s.quiz.length !== 25) { excludedList.push(s.id + ' (quiz ' + s.quiz.length + ')'); continue; }
  if (s.quiz.some(q => q.options.length !== 4 || !['A', 'B', 'C', 'D'].includes(q.correct))) {
    excludedList.push(s.id + ' (bad quiz)');
    continue;
  }
  const S = s.sentences.map((x, i) => ({
    i, en: fixText(x.text), zh: cleanZh(x.zh || ''), spk: x.speaker || '', section: x.section || '',
    start: typeof x.start === 'number' ? x.start : null, end: typeof x.end === 'number' ? x.end : null
  }));
  const ev = alignEvidence(s.transcript, S.map(x => ({ text: x.en })));
  const secNames = [...new Set(S.map(x => x.section).filter(Boolean))];
  const sections = secNames.map((name, si) => {
    const idxs = S.map((x, i) => x.section === name ? i : -1).filter(i => i >= 0);
    const startIdx = idxs[0];
    const endIdx = idxs[idxs.length - 1];
    const next = secNames[si + 1];
    const nextIdx = next ? S.findIndex(x => x.section === next) : -1;
    return {
      name, startIdx, endIdx,
      startTime: S[startIdx] ? S[startIdx].start : null,
      endTime: nextIdx >= 0 ? (S[nextIdx] ? S[nextIdx].start : null) : null,
      questionNumbers: []
    };
  });
  const secByName = new Map(sections.map(x => [x.name, x]));
  const questions = s.quiz.map(q => {
    const ai = 'ABCD'.indexOf(q.correct);
    let ei = ev[q.number];
    if (ei === undefined) ei = null;
    const evSen = ei !== null ? S[ei] : null;
    let section = evSen ? evSen.section : '';
    if (!section) {
      if (q.number <= 8) section = secNames[q.number <= 4 ? 0 : 1] || secNames[0] || '';
      else if (q.number <= 15) section = secNames[q.number <= 11 ? 2 : 3] || secNames[2] || '';
      else section = secNames[Math.min(secNames.length - 1, 4 + Math.floor((q.number - 16) / 4))] || secNames[secNames.length - 1] || '';
    }
    if (secByName.has(section)) secByName.get(section).questionNumbers.push(q.number);
    return {
      id: s.id + 'Q' + q.number, number: q.number,
      options: q.options.map(o => ({ letter: o.letter, text: fixText(o.text) })),
      answer: ai, evidence: ei,
      evidenceEn: evSen ? evSen.en : '', evidenceZh: evSen ? evSen.zh : '',
      section
    };
  }).filter(q => q.options.length === 4);
  const locals = {};
  for (const sen of S) {
    for (const t of tokenize(sen.en)) {
      if (t.length < 4 || t.includes("'") || STOP.has(t) || KEY_STOP.has(t)) continue;
      const h = dict[t] ? t : headOfToken(t);
      if (!h || !dict[h] || !dict[h].zh) continue;
      locals[h] = (locals[h] || 0) + 1;
    }
  }
  function keyScore(w, c) {
    const d = dict[w];
    const g = freqByWord.get(w);
    const isCet6 = d.levels.includes('cet6');
    const only = isCet6 && !lower.has(w);
    return c * 2 + (only ? 4 : isCet6 ? 2 : 0) + Math.min(6, (g ? g.df : 0) / 6) + Math.min(3, w.length / 4);
  }
  const keyWords = [];
  const keyPool = Object.entries(locals)
    .filter(([w]) => dict[w].levels.includes('cet6') && !lower.has(w))
    .sort((a, b) => keyScore(b[0], b[1]) - keyScore(a[0], a[1]));
  for (const [w, c] of keyPool) {
    if (keyWords.length >= 10) break;
    const d = dict[w];
    const g = freqByWord.get(w);
    const fix = SENSE_FIX[w];
    keyWords.push({
      word: w, phonetic: phoneOf(w, d.phonetic ? '/' + cleanPhone(d.phonetic) + '/' : ''),
      zh: fix ? fix.zh : cleanZh(d.zh), pos: fix ? fix.pos : (d.pos || ''), count: c,
      globalDf: g ? g.df : 0, globalCount: g ? g.count : 0,
      id: (byWord.get(w) || {}).id || ''
    });
  }
  if (keyWords.length < 10) {
    Object.entries(locals)
      .filter(([w]) => dict[w].levels.includes('cet6') && !keyWords.some(k => k.word === w))
      .sort((a, b) => keyScore(b[0], b[1]) - keyScore(a[0], a[1]))
      .forEach(([w, c]) => {
        if (keyWords.length >= 10) return;
        const d = dict[w];
        const g = freqByWord.get(w);
        const fix = SENSE_FIX[w];
        keyWords.push({
          word: w, phonetic: phoneOf(w, d.phonetic ? '/' + cleanPhone(d.phonetic) + '/' : ''),
          zh: fix ? fix.zh : cleanZh(d.zh), pos: fix ? fix.pos : (d.pos || ''), count: c,
          globalDf: g ? g.df : 0, globalCount: g ? g.count : 0,
          id: (byWord.get(w) || {}).id || ''
        });
      });
  }
  const maxEnd = Math.max.apply(null, S.map(x => x.end || 0));
  const audioPath = s.audio.replace(/^\.\.\/\.\.\//, '');
  realSets.push({
    id: s.id, session: s.session, setNo: s.set || 1,
    title: s.session.replace('.', '年') + '月' + (s.sentences.length ? ' 第' + (s.set || 1) + '套' : ''),
    sessionLabel: s.session,
    audioUrl: audioBase + encodeURI(audioPath),
    sourceUrl: 'https://github.com/getfine333-ux/cet6-listening-study/tree/main/resources/CET6_' + s.session,
    sentences: S,
    sections,
    questions,
    keyWords,
    durationSec: Math.round(maxEnd + 180),
    flags: []
  });
}

function wrap(name, body) {
  return '/* ' + name + ' — generated from attributed sources; see DATA_SOURCES.md */\n(function(){\nconst C=window.CET6=window.CET6||{};C.data=C.data||{};\n' + body + '\n})();\n';
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'listening-real.data.js'), wrap('Real CET-6 listening', 'C.data.realListening=' + JSON.stringify(realSets) + ';\nC.data.realListeningMeta=' + JSON.stringify({
  sets: realSets.length,
  questions: realSets.reduce((a, s) => a + s.questions.length, 0),
  sentences: realSets.reduce((a, s) => a + s.sentences.length, 0),
  source: {
    title: 'CET-6 Listening Resources & Analysis v1.0.0', author: 'Leif / Ysoseri1224',
    repo: 'https://github.com/Ysoseri1224/CET-6-Listening-10-Years-Resources-and-Analysis',
    mirror: 'https://github.com/getfine333-ux/cet6-listening-study',
    license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', doi: 'https://doi.org/10.5281/zenodo.20474009'
  },
  method: '基于上游 39 套真题听力资源；筛除无题目、答案不完整及音频/原文错配的套次；逐句切分、[n] 题号依据对齐、选项 OCR 清理；音频通过上游 Git LFS 流式播放，未内置。',
  excluded: excludedList,
  caveats: ['题目在真题音频中播报，卷面只有选项。', '部分套次的中译为上游机器翻译，仅供理解。', '音频仅在线流播；离线/网络受限时可用合成语音精听或载入本地音频。']
}) + ';\n'));
fs.writeFileSync(path.join(OUT, 'vocab-listening.data.js'), wrap('Listening high-frequency words + SRS merge', 'C.data.listeningWords=' + JSON.stringify(listeningWords) + ';\nC.data.listeningWordsAll=' + JSON.stringify(allTopOut) + ';\nC.data.listeningDict=' + JSON.stringify(corpusDict) + ';\nC.data.listeningWordsMeta=' + JSON.stringify({
  corpusSets: sets.length,
  corpusSentences: sets.reduce((a, s) => a + s.sentences.length, 0),
  corpusYears: '2016.12–2025.12',
  cet6Only: cet6Only.length,
  coreCount,
  allTop: allTopOut.length,
  auditedSenses: Object.keys(SENSE_FIX).length,
  excludedFromFrequency: [...EXCLUDE_FROM_FREQ],
  tokensScanned: freqBuild.meta.includedTokens,
  properNamesSkipped: freqBuild.meta.skippedNames,
  method: '从 39 套 2016.12–2025.12 真题听力原文逐句统计；去除功能词、专有名词与未收词；按规则屈折归并；按“出现套数”优先、总次数次之排序。出现套数≥3 记为高频核心，其余为进阶补充。',
  caveat: '“高频”仅指在这一组 39 套语料中的覆盖与频次，不等于官方词频或未来考试必然出现；表中同时给出套数与次数，便于自行判断。hop 仅见于 hip hop、renewable 仅见于 non-renewable，缺少独立用例，未列入本表，仍保留在大纲全词表。',
  source: 'CET-6 Listening Resources (CC BY 4.0), via getfine333-ux/cet6-listening-study; dictionary: KyleBing/english-vocabulary (BSD-3-Clause)'
}) + ';\nC.data.listeningExistingMeta=' + JSON.stringify(existingListeningMeta) + ';\nC.data.vocabTiers=C.data.vocabTiers||[];if(!C.data.vocabTiers.some(t=>t.id==="listening"))C.data.vocabTiers.push({id:"listening",name:"听力高频",short:"听力",desc:"从 39 套 2016–2025 真题听力原文统计出的六级进阶词；按语料覆盖排序，非官方词表。"});\nC.data.vocab=(C.data.vocab||[]).concat(' + JSON.stringify(newEntries) + ');\nif(C.data.listeningExistingMeta){const m=C.data.listeningExistingMeta;C.data.vocab.forEach(function(v){const x=m[String(v.word).toLowerCase()];if(x){v.listeningRank=x.listeningRank;v.listeningDf=x.listeningDf;v.listeningCount=x.listeningCount;v.listeningExample=x.listeningExample;v.tags=x.tags;}});}\n'));
fs.writeFileSync(path.join(OUT, 'vocab-full.data.js'), wrap('Full CET6 vocabulary', 'C.data.fullVocab=' + JSON.stringify(fullVocab) + ';\nC.data.fullVocabMeta=' + JSON.stringify({
  count: fullVocab.length,
  source: 'KyleBing/english-vocabulary (BSD-3-Clause), CET6 list; definitions and phonetics from the same open dataset',
  note: '基于 KyleBing/english-vocabulary 的六级词表与释义（BSD-3-Clause）整理；共 ' + fullVocab.length + ' 个词条。'
}) + ';\n'));

console.log(JSON.stringify({
  fullVocab: fullVocab.length, cet6Only: cet6Only.length, coreCount,
  newEntries: newEntries.length, allTop: allTopOut.length,
  realSets: realSets.length, questions: realSets.reduce((a, s) => a + s.questions.length, 0),
  sentences: realSets.reduce((a, s) => a + s.sentences.length, 0),
  excluded: excludedList,
  sampleKeyWords: realSets.slice(0, 3).map(s => ({ id: s.id, keyWords: s.keyWords.map(k => k.word), ev: s.questions.filter(q => q.evidence !== null).length }))
}, null, 2));
