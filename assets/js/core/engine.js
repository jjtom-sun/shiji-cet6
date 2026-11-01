/* Rule-based writing & translation feedback engine */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};

  const STOPWORDS = new Set(('a an the and or but if while because although though since as of to in on at by for with from into over under about between among through during before after above below up down out off again further then once here there all any both each few more most other some such no nor not only own same so than too very can will just should now i you he she it we they me him her us them my your his its our their this that these those is are was were be been being have has had do does did doing get got make made also however therefore thus moreover furthermore nevertheless consequently'.split(/\s+/)));
  const TRANSITIONS = ['however', 'therefore', 'moreover', 'furthermore', 'nevertheless', 'consequently', 'in addition', 'for instance', 'for example', 'in contrast', 'on the other hand', 'as a result', 'in short', 'to sum up', 'first', 'finally', 'meanwhile', 'similarly', 'admittedly', 'ultimately'];
  const SUBORDINATORS = /\b(although|though|while|whereas|because|since|unless|if|when|whenever|which|who|whom|whose|whether|after|before|until|once|provided|despite|that)\b/gi;
  const COMMON = new Set(('a about above after again against all also always am among an and another any are around as at be because been before being below between both but by can could did do does doing down during each either else even ever every few for from further get got had has have having he her here hers him his how however i if in into is it its itself just kind less let like likely long made make many may me might more most much must my near need never no nor not now of off often on once one only or other our out over own per put quite rather really same say see seem shall she should since so some such than that the their them then there these they this those though through thus to too under until up upon us use very via was way we well were what when where whether which while who whom whose why will with within without would yes yet you your yours zero also ability accept according account achieve across act action activity add admit adult advance advantage advice affect afford agree allow almost alone along already although among amount analysis answer apply approach area argue arrive article ask available avoid aware back base become begin believe benefit best better big body bring build business call case cause center certain change child children choose city class clear close come common community company compare complete concern consider continue control cost country course create current data day deal decide decision describe design detail develop different difficult direct discuss done drive early economic education effect end energy enough environment especially establish event evidence example expect experience explain face fact family far feel field find first focus follow form free friend full general give go good government great group grow hand happen hard help high history hold home human idea important improve increase individual industry information interest international issue job keep know land language large last late lead learn leave left level life light likely line little live local long look lose love low main major manage mean measure meet member method mind minute model money month move music name national nature need new news next night number offer office old open order organization part particular people period person place plan play point policy political possible power practice present president pressure problem process produce product program project property provide public purpose question range rate read real reason receive recent recognize record reduce region relationship remain report require research resource respond result return right role room rule run school science season second section see sell sense series service set several show side significant similar simple small social society some source south space special specific spend stand start state stay step still stop story strong student study subject success support sure system take talk teach team tell term test text thing think time today together top total toward town trade train try turn type understand unit university value various view visit voice want war watch water week white whole wide wife win window woman word work world write wrong year young harm harmful video videos skill skills platform platforms online digital media screen screens sleep attention algorithm algorithms recommend content device devices app apps social mental physical beneficial drawback downside upside trend viral browse scroll notification notifications distraction wellbeing'.split(/\s+/)));

  function wordsOf(text) { return String(text || '').toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*/g) || []; }

  function contentWords(text) {
    return wordsOf(text).filter(function (w) {
      return !STOPWORDS.has(w) && w.length > 2;
    });
  }

  function ttr(text) {
    const cw = contentWords(text);
    if (!cw.length) return 0;
    return new Set(cw).size / cw.length;
  }

  function sentenceLengths(text) {
    return C.splitSentences(text).map(function (s) { return C.countWords(s); }).filter(function (n) { return n > 0; });
  }

  function stdDev(arr) {
    if (arr.length < 2) return 0;
    const mean = arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
    const variance = arr.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / arr.length;
    return Math.sqrt(variance);
  }

  function paragraphCount(text) {
    const t = String(text || '').trim();
    if (!t) return 0;
    const blocks = t.split(/\n+/).map(function (p) { return p.trim(); }).filter(Boolean);
    return blocks.length;
  }

  function computeMetrics(text) {
    const wc = C.countWords(text);
    const sentences = C.splitSentences(text);
    const lens = sentenceLengths(text);
    const cw = contentWords(text);
    const unique = new Set(cw);
    const clauseMatches = text.match(SUBORDINATORS) || [];
    let transitions = 0;
    const lower = text.toLowerCase();
    TRANSITIONS.forEach(function (t) {
      const re = new RegExp('\\b' + C.escapeRegExp(t) + '\\b', 'g');
      transitions += (lower.match(re) || []).length;
    });
    const firstWords = sentences.map(function (s) { return (s.match(/[A-Za-z]+/) || [''])[0].toLowerCase(); }).filter(Boolean);
    const uniqueFirst = new Set(firstWords).size;
    const freq = {};
    cw.forEach(function (w) { freq[w] = (freq[w] || 0) + 1; });
    const repeated = Object.keys(freq).filter(function (w) { return freq[w] >= 4 && w.length > 3; }).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, 5);
    const vocabSet = getVocabSet();
    const advanced = Array.from(unique).filter(function (w) { return vocabSet.has(w) || w.length >= 9; });
    return {
      wordCount: wc,
      sentenceCount: sentences.length,
      paragraphCount: paragraphCount(text),
      avgSentenceLength: lens.length ? Math.round((lens.reduce(function (a, b) { return a + b; }, 0) / lens.length) * 10) / 10 : 0,
      maxSentenceLength: lens.length ? Math.max.apply(null, lens) : 0,
      sentenceVariety: lens.length ? Math.round((stdDev(lens) / Math.max(1, lens.reduce(function (a, b) { return a + b; }, 0) / lens.length)) * 100) / 100 : 0,
      ttr: Math.round(ttr(text) * 100) / 100,
      uniqueContent: unique.size,
      contentCount: cw.length,
      clauseDensity: sentences.length ? Math.round((clauseMatches.length / sentences.length) * 100) / 100 : 0,
      transitions: transitions,
      sentenceOpeningVariety: sentences.length ? Math.round((uniqueFirst / sentences.length) * 100) : 0,
      advancedCount: advanced.length,
      repeatedWords: repeated,
      freq: freq
    };
  }

  let vocabSetCache = null;
  function getVocabSet() {
    if (vocabSetCache) return vocabSetCache;
    const set = new Set();
    ((C.data && C.data.vocab) || []).forEach(function (v) {
      set.add(v.word.toLowerCase());
      (v.synonyms || []).forEach(function (s) { wordsOf(s).forEach(function (w) { set.add(w); }); });
    });
    vocabSetCache = set;
    return set;
  }

  /* ---------- Spelling ---------- */
  const MISSPELLINGS = {
    goverment: 'government', enviroment: 'environment', developement: 'development', recieve: 'receive',
    seperate: 'separate', occured: 'occurred', sucess: 'success', thier: 'their', wich: 'which',
    becuase: 'because', definately: 'definitely', accomodate: 'accommodate', neccessary: 'necessary',
    concious: 'conscious', existance: 'existence', maintainance: 'maintenance', responsability: 'responsibility',
    strenght: 'strength', sincerly: 'sincerely', tommorow: 'tomorrow', untill: 'until', wierd: 'weird',
    begining: 'beginning', beleive: 'believe', calender: 'calendar', independant: 'independent',
    knowlege: 'knowledge', peice: 'piece', publically: 'publicly', refered: 'referred', succesful: 'successful',
    writting: 'writing', adress: 'address', arguement: 'argument', avaliable: 'available', benifit: 'benefit',
    changable: 'changeable', comparision: 'comparison', comming: 'coming', familar: 'familiar',
    finaly: 'finally', foriegn: 'foreign', fourty: 'forty', happend: 'happened', immediatly: 'immediately',
    intrest: 'interest', langauge: 'language', libary: 'library', managment: 'management',
    noticable: 'noticeable', occurance: 'occurrence', posession: 'possession', prefered: 'preferred',
    probablly: 'probably', reccomend: 'recommend', relevent: 'relevant', remeber: 'remember',
    resturant: 'restaurant', similiar: 'similar', suprise: 'surprise', temprature: 'temperature',
    thourough: 'thorough', unfortunatly: 'unfortunately', vaccum: 'vacuum', visable: 'visible',
    wellcome: 'welcome', welfair: 'welfare', enviromental: 'environmental', culturaly: 'culturally'
  };

  let lexiconCache = null;
  let lexiconListCache = null;
  let lexiconByLetter = null;

  function buildLexicon() {
    if (lexiconCache) return lexiconCache;
    const set = new Set(COMMON);
    function add(text) { wordsOf(text).forEach(function (w) { set.add(w); }); }
    const D = C.data || {};
    (D.vocab || []).forEach(function (v) {
      add(v.word); add((v.synonyms || []).join(' '));
      (v.collocations || []).forEach(add);
      if (v.example) add(v.example.en);
    });
    (D.listening || []).forEach(function (s) {
      (s.script || []).forEach(function (l) { add(l.en); });
      (s.questions || []).forEach(function (q) { add(q.q); (q.options || []).forEach(add); add(q.explain); });
    });
    (D.longSentences || []).forEach(function (s) { add(s.sentence); add(s.translation); (s.points || []).forEach(function (p) { add(p.text); }); });
    (D.cloze || []).forEach(function (c) { add(c.passage); (c.bank || []).forEach(function (b) { add(b.word); }); });
    (D.matching || []).forEach(function (m) { (m.paragraphs || []).forEach(function (p) { add(p.text); }); (m.statements || []).forEach(function (s) { add(s.text); add(s.explain); }); });
    (D.careful || []).forEach(function (r) { (r.paragraphs || []).forEach(function (p) { (p.sentences || []).forEach(function (s) { add(s.en); }); }); (r.questions || []).forEach(function (q) { add(q.q); (q.options || []).forEach(add); add(q.explain); }); });
    (D.writingPrompts || []).forEach(function (p) { add(p.task); add(p.model); });
    (D.translations || []).forEach(function (t) { add(t.reference); (t.terms || []).forEach(function (x) { (x.en || []).forEach(add); }); (t.chunks || []).forEach(function (c) { add(c.en); }); });
    (D.replacements || []).forEach(function (r) { add(r.better); add(r.eg); });
    (D.patterns || []).forEach(function (p) { add(p.pattern); add(p.eg); });
    (D.templates || []).forEach(function (t) { add(t.opening); add(t.body); add(t.closing); });
    (D.topicVocab || []).forEach(function (t) { add(t.en); add(t.eg); });
    // Add common inflected/base variants so valid forms such as "scientists"
    // do not get flagged because only one form appeared in the corpus.
    Array.from(set).forEach(function (w) {
      if (w.length < 4) return;
      set.add(w + 's');
      if (/s$/.test(w) && w.length > 4) set.add(w.slice(0, -1));
      if (/es$/.test(w) && w.length > 5) set.add(w.slice(0, -2));
      if (/ies$/.test(w) && w.length > 5) set.add(w.slice(0, -3) + 'y');
      if (/ed$/.test(w) && w.length > 5) { set.add(w.slice(0, -2)); set.add(w.slice(0, -1)); }
      if (/ing$/.test(w) && w.length > 6) { set.add(w.slice(0, -3)); set.add(w.slice(0, -3) + 'e'); }
      if (/ly$/.test(w) && w.length > 5) set.add(w.slice(0, -2));
    });
    lexiconCache = set;
    lexiconListCache = Array.from(set);
    lexiconByLetter = {};
    lexiconListCache.forEach(function (w) {
      const k = w.charAt(0);
      if (!lexiconByLetter[k]) lexiconByLetter[k] = [];
      lexiconByLetter[k].push(w);
    });
    return set;
  }

  function spellingIssues(text) {
    const lexicon = buildLexicon();
    const found = [];
    const re = /[A-Za-z][A-Za-z’'-]{2,}/g;
    let m;
    let checked = 0;
    while ((m = re.exec(text)) && checked < 30) {
      const original = m[0];
      const lower = original.toLowerCase().replace(/[’]/g, "'");
      if (lower.length < 4) continue;
      if (/[A-Z]/.test(original) && original !== original.toUpperCase()) continue;
      if (original === original.toUpperCase()) continue;
      if (lexicon.has(lower)) continue;
      if (MISSPELLINGS[lower]) {
        found.push(makeIssue(m.index, m.index + original.length, original, 'spelling', 'high',
          '常见拼写错误', MISSPELLINGS[lower], '拼写'));
        checked++;
        continue;
      }
      const baseForms = [lower];
      if (/s$/.test(lower)) baseForms.push(lower.slice(0, -1));
      if (/es$/.test(lower)) baseForms.push(lower.slice(0, -2));
      if (/ies$/.test(lower)) baseForms.push(lower.slice(0, -3) + 'y');
      if (/ed$/.test(lower)) { baseForms.push(lower.slice(0, -2)); baseForms.push(lower.slice(0, -1)); }
      if (/ing$/.test(lower)) { baseForms.push(lower.slice(0, -3)); baseForms.push(lower.slice(0, -3) + 'e'); }
      if (/ly$/.test(lower)) baseForms.push(lower.slice(0, -2));
      if (baseForms.some(function (f) { return f.length > 2 && lexicon.has(f); })) continue;
      if (/\d/.test(original)) continue;
      if (lower.length < 5) continue;
      const candidates = lexiconByLetter[lower.charAt(0)] || [];
      let best = null, bestD = 99;
      for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        if (Math.abs(cand.length - lower.length) > 2) continue;
        const d = C.levenshtein(lower, cand);
        if (d < bestD) { bestD = d; best = cand; }
        if (bestD === 1) break;
      }
      const threshold = lower.length <= 7 ? 1 : 2;
      if (best && bestD <= threshold) {
        found.push(makeIssue(m.index, m.index + original.length, original, 'spelling', 'low',
          '疑似拼写错误（未收录词，可能不是错误）', best, '拼写'));
        checked++;
      }
    }
    return found;
  }

  /* ---------- Grammar / usage rules ---------- */
  const RULES = [
    { id: 'although-but', re: /\b(?:Although|Though|Because|Since)\b[^.!?\n]{0,140}?,\s*(?:but|so|yet)\b/gi, type: 'grammar', severity: 'high', message: '连词叠用：although / because 与 but / so 不能同时连接两个分句。', fix: function (s) { return s.replace(/,\s*(?:but|so|yet)\b/i, ''); } },
    { id: 'reason-because', re: /\bthe reason (?:is|was) because\b/gi, type: 'grammar', severity: 'high', message: 'the reason is because 属于冗余结构，应改为 the reason is that。', fix: function (s) { return s.replace(/because/i, 'that'); } },
    { id: 'despite-of', re: /\bdespite of\b/gi, type: 'grammar', severity: 'high', message: 'despite 后不接 of；可改为 despite 或 in spite of。', fix: function () { return 'despite'; } },
    { id: 'double-comparative', re: /\bmore (?:better|worse|easier|faster|harder|bigger|smaller|higher|lower|cheaper|richer)\b/gi, type: 'grammar', severity: 'high', message: '比较级重复：more 不能与 -er 形式连用。', fix: function (s) { return s.replace(/\bmore\s+/i, ''); } },
    { id: 'most-superlative', re: /\bmost (?:best|worst|easiest|fastest|hardest|biggest|smallest|highest|lowest|cheapest)\b/gi, type: 'grammar', severity: 'high', message: '最高级重复：most 不能与 -est 形式连用。', fix: function (s) { return s.replace(/\bmost\s+/i, ''); } },
    { id: 'in-nowadays', re: /\bin nowadays\b/gi, type: 'grammar', severity: 'mid', message: 'nowadays 是副词，前面不加 in。', fix: function () { return 'nowadays'; } },
    { id: 'according-to-me', re: /\baccording to me\b/gi, type: 'collocation', severity: 'mid', message: 'according to 不用于引出自己的观点；可改为 in my opinion / from my perspective。', fix: function () { return 'in my opinion'; } },
    { id: 'discuss-about', re: /\b(?:discuss|mention|explain|describe) about\b/gi, type: 'collocation', severity: 'mid', message: 'discuss / mention / explain / describe 是及物动词，后面直接接宾语。', fix: function (s) { return s.replace(/\s+about\b/i, ''); } },
    { id: 'emphasize-on', re: /\bemphasize on\b/gi, type: 'collocation', severity: 'mid', message: 'emphasize 是及物动词，直接接宾语。', fix: function () { return 'emphasize'; } },
    { id: 'comprise-of', re: /\bcomprise of\b/gi, type: 'collocation', severity: 'mid', message: 'comprise 不接 of；可用 consist of 或 be composed of。', fix: function () { return 'consist of'; } },
    { id: 'uncountable-plural', re: /\b(informations|advices|equipments|furnitures|knowledges)\b/gi, type: 'grammar', severity: 'high', message: '该名词为不可数名词，不能加 -s。', fix: function (s) { return s.replace(/s$/i, ''); } },
    { id: 'make-a-progress', re: /\bmake a (?:great |good |big )?progress\b/gi, type: 'collocation', severity: 'high', message: 'progress 不可数；make progress 或 make great progress。', fix: function (s) { return s.replace(/\ba\s+/i, ''); } },
    { id: 'an-consonant', re: /\ban (?:university|European|one|uniform|useful|unique|user|usual)\b/gi, type: 'grammar', severity: 'high', message: '该词以辅音音素开头，应用 a 而非 an。', fix: function (s) { return s.replace(/^an\b/i, 'a'); } },
    { id: 'a-vowel', re: /\ba (?:hour|honest|honor|heir)\b/gi, type: 'grammar', severity: 'high', message: '该词以元音音素开头，应用 an 而非 a。', fix: function (s) { return s.replace(/^a\b/i, 'an'); } },
    { id: 'a-vowel-noun', re: /\ba (answer|idea|example|issue|article|essay|opinion|advantage|opportunity|approach|area|effect|increase|effort|experience|environment|activity|alternative|argument|aspect|attitude|author|exam|event|image|impact|individual|industry|information|interest|island|object|offer|option|organization|outcome|umbrella|uncle|economic|effective|efficient|important|interesting|open|old|easy|early)\b/gi, type: 'grammar', severity: 'high', message: '该词以元音音素开头，应用 an 而非 a。', fix: function (s) { return s.replace(/^a\b/i, 'an'); } },
    { id: 'there-is-many', re: /\bthere (?:is|was) (?:many|several|numerous|a number of|a lot of|two|three|four|five)\b/gi, type: 'grammar', severity: 'high', message: 'there be 结构应与后面的复数名词一致，用 there are/were。', fix: function (s) { return s.replace(/\bis\b/i, 'are').replace(/\bwas\b/i, 'were'); } },
    { id: 'the-number-are', re: /\bthe number of\b[^.!?\n]{0,50}?\b(are|were|have)\b/gi, type: 'grammar', severity: 'high', message: 'the number of 中心词是 number，谓语用单数 is/was/has。', skip: function (s) { return /\b(who|which|that|whose)\b/i.test(s); }, fix: function (s) { return s.replace(/\bare\b/i, 'is').replace(/\bwere\b/i, 'was').replace(/\bhave\b/i, 'has'); } },
    { id: 'a-number-is', re: /\ba number of\b[^.!?\n]{0,50}?\b(is|was|has)\b/gi, type: 'grammar', severity: 'high', message: 'a number of 表示“许多”，谓语用复数 are/were/have。', skip: function (s) { return /\b(who|which|that|whose)\b/i.test(s); }, fix: function (s) { return s.replace(/\bis\b/i, 'are').replace(/\bwas\b/i, 'were').replace(/\bhas\b/i, 'have'); } },
    { id: 'he-dont', re: /\b(he|she|it) don['’]t\b/gi, type: 'grammar', severity: 'high', message: '第三人称单数应与 doesn’t 搭配。', fix: function (s) { return s.replace(/don['’]t/i, 'doesn’t'); } },
    { id: 'i-be', re: /\bI (?:is|are)\b/g, type: 'grammar', severity: 'high', message: '第一人称单数与 am 搭配。', fix: function () { return 'I am'; } },
    { id: 'we-is', re: /\b(we|they|you) is\b/gi, type: 'grammar', severity: 'high', message: '主语为复数或 you 时，be 动词用 are。', fix: function (s) { return s.replace(/\bis\b/i, 'are'); } },
    { id: 'we-was', re: /\b(we|they|you) was\b/gi, type: 'grammar', severity: 'high', message: '主语为复数或 you 时，be 动词过去式用 were。', fix: function (s) { return s.replace(/\bwas\b/i, 'were'); } },
    { id: 'in-the-other-hand', re: /\bin the other hand\b/gi, type: 'collocation', severity: 'high', message: '固定短语为 on the other hand。', fix: function () { return 'on the other hand'; } },
    { id: 'married-with', re: /\bmarried with\b/gi, type: 'collocation', severity: 'mid', message: '“与某人结婚”用 be married to。', fix: function () { return 'married to'; } },
    { id: 'responsible-of', re: /\bresponsible (?:of|with)\b/gi, type: 'collocation', severity: 'mid', message: 'responsible 后接 for。', fix: function () { return 'responsible for'; } },
    { id: 'superior-than', re: /\b(superior|inferior|senior|junior|prior) than\b/gi, type: 'collocation', severity: 'high', message: '这些词表示比较时用 to，不用 than。', fix: function (s) { return s.replace(/\bthan\b/i, 'to'); } },
    { id: 'depend-of', re: /\b(depend|rely) of\b/gi, type: 'collocation', severity: 'high', message: 'depend / rely 后接 on。', fix: function (s) { return s.replace(/\bof\b/i, 'on'); } },
    { id: 'look-forward-to', re: /\blook(?:ing)? forward to (hear|see|meet|receive|visit|work|talk)\b/gi, type: 'grammar', severity: 'high', message: 'look forward to 中 to 是介词，后接动名词。', fix: function (s) { return s.replace(/\b(hear|see|meet|receive|visit|work|talk)\b/i, function (v) { return gerund(v); }); } },
    { id: 'suggest-sb-to', re: /\bsuggest(?:s|ed)? (?:me|him|her|us|them|you) to\b/gi, type: 'grammar', severity: 'mid', message: 'suggest 不接“宾语 + to do”；用 suggest that + 主语 + (should) + 动词原形，或 suggest doing。', fix: function (s) { return s.replace(/\bto\b/i, 'that ... should'); } },
    { id: 'everyday-adverb', re: /\beveryday (?:go|goes|do|does|use|uses|see|sees|read|reads|check|checks|study|studies|work|works)\b/gi, type: 'grammar', severity: 'mid', message: '表示“每天”应用 every day；everyday 是形容词。', fix: function (s) { return s.replace(/^everyday/i, 'every day'); } },
    { id: 'alot', re: /\balot\b/gi, type: 'spelling', severity: 'high', message: 'a lot 是两个词。', fix: function () { return 'a lot'; } },
    { id: 'infront', re: /\binfront of\b/gi, type: 'spelling', severity: 'high', message: 'in front of 是三个词。', fix: function () { return 'in front of'; } },
    { id: 'much-people', re: /\bmuch (?:people|students|jobs|problems|books|options|factors)\b/gi, type: 'grammar', severity: 'mid', message: '修饰可数名词复数应用 many。', fix: function (s) { return s.replace(/\bmuch\b/i, 'many'); } },
    { id: 'less-fewer', re: /\bless (?:people|students|jobs|problems|books|options|cars|houses|factors)\b/gi, type: 'grammar', severity: 'mid', message: '修饰可数名词复数应用 fewer。', fix: function (s) { return s.replace(/\bless\b/i, 'fewer'); } },
    { id: 'many-uncountable', re: /\bmany (?:information|money|evidence|advice|equipment|furniture|knowledge|progress)\b/gi, type: 'grammar', severity: 'high', message: '该名词不可数，应用 much / a great deal of / a large amount of。', fix: function (s) { return s.replace(/\bmany\b/i, 'much'); } },
    { id: 'chinese-punct', re: /[，。；：！？、]/g, type: 'punctuation', severity: 'high', message: '英文写作中应使用英文标点。', fix: function (s) {
      return ({ '，': ', ', '。': '. ', '；': '; ', '：': ': ', '！': '! ', '？': '? ', '、': ', ' })[s] || ', ';
    } },
    { id: 'chinese-quotes', re: /[“”‘’]/g, type: 'punctuation', severity: 'mid', message: '英文引号应使用 " " 或 \' \'。', fix: function (s) { return /[“”]/.test(s) ? '"' : "'"; } },
    { id: 'missing-space', re: /[,;:!?][A-Za-z]|(?<![A-Za-z])\.[A-Za-z]/g, type: 'punctuation', severity: 'mid', message: '标点后应有一个空格。', fix: function (s) { return s.charAt(0) + ' ' + s.charAt(1); } },
    { id: 'lowercase-sentence', re: /(?:^|[.!?]\s+)([a-z])/g, type: 'punctuation', severity: 'low', message: '句首字母通常应大写。', fix: function (s) { return s.replace(/([a-z])$/, function (c) { return c.toUpperCase(); }); } }
  ];

  function gerund(v) {
    const map = { hear: 'hearing', see: 'seeing', meet: 'meeting', receive: 'receiving', visit: 'visiting', work: 'working', talk: 'talking' };
    return map[v.toLowerCase()] || (v + 'ing');
  }

  function makeIssue(start, end, text, type, severity, message, suggestion, rule) {
    return { start: start, end: end, text: text, type: type, severity: severity, message: message, suggestion: suggestion || '', rule: rule || '' };
  }

  function grammarIssues(text) {
    const issues = [];
    RULES.forEach(function (rule) {
      let m;
      const re = new RegExp(rule.re.source, rule.re.flags);
      while ((m = re.exec(text))) {
        if (m[0].length === 0) { re.lastIndex++; continue; }
        if (rule.skip && rule.skip(m[0])) continue;
        let suggestion = '';
        try { suggestion = rule.fix ? rule.fix(m[0]) : ''; } catch (e) { suggestion = ''; }
        issues.push(makeIssue(m.index, m.index + m[0].length, m[0], rule.type, rule.severity, rule.message, suggestion, rule.id));
      }
    });
    return issues;
  }

  function dedupeIssues(issues) {
    issues.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
    const out = [];
    let lastEnd = -1;
    issues.forEach(function (issue) {
      if (issue.start < lastEnd) return;
      out.push(issue);
      lastEnd = issue.end;
    });
    return out;
  }

  /* ---------- Coverage / upgrades ---------- */
  function termHit(text, alt) {
    const lower = text.toLowerCase();
    const a = String(alt || '').toLowerCase();
    if (!a) return false;
    if (/\s/.test(a) || /[^a-z]/.test(a)) return lower.indexOf(a) !== -1;
    const re = new RegExp('\\b' + C.escapeRegExp(a) + '(?:s|es|ed|ing|d)?\\b', 'i');
    return re.test(text);
  }

  function coverage(text, terms) {
    const list = (terms || []).map(function (t) {
      const alts = t.en || t.alternatives || [];
      let matched = '';
      for (let i = 0; i < alts.length; i++) {
        if (termHit(text, alts[i])) { matched = alts[i]; break; }
      }
      return { zh: t.zh, en: alts, hit: !!matched, matched: matched };
    });
    return { items: list, hit: list.filter(function (x) { return x.hit; }).length, total: list.length };
  }

  function buildUpgrades(text) {
    const candidates = [];
    const seen = new Set();
    const reps = (C.data && C.data.replacements) || [];
    reps.forEach(function (r) {
      const from = String(r.basic || '').replace(/\s*\/.*$/, '').trim();
      if (!from || seen.has(from.toLowerCase())) return;
      const re = new RegExp('\\b' + C.escapeRegExp(from) + '\\b', 'i');
      const m = text.match(re);
      if (!m) return;
      const to = String(r.better || '').split('/')[0].trim();
      if (!to || to.toLowerCase() === from.toLowerCase()) return;
      candidates.push({ from: from, to: to, note: r.note, options: r.better, index: m.index, length: m[0].length });
      seen.add(from.toLowerCase());
    });
    // Prefer phrases such as "I think" over their shorter overlaps ("think"),
    // otherwise a one-click replacement can produce broken grammar.
    candidates.sort(function (a, b) { return b.length - a.length || a.index - b.index; });
    const chosen = [];
    candidates.forEach(function (c) {
      const overlaps = chosen.some(function (x) { return c.index < x.index + x.length && c.index + c.length > x.index; });
      if (!overlaps) chosen.push(c);
    });
    return chosen.sort(function (a, b) { return a.index - b.index; }).slice(0, 10).map(function (u) {
      return { from: u.from, to: u.to, note: u.note, options: u.options };
    });
  }

  function applyUpgrades(text, upgrades) {
    let out = String(text || '');
    let applied = 0;
    (upgrades || []).slice().sort(function (a, b) { return b.from.length - a.from.length; }).forEach(function (u) {
      const re = new RegExp('\\b' + C.escapeRegExp(u.from) + '\\b', 'i');
      const hit = out.match(re);
      if (hit) {
        let to = u.to;
        if (/^[A-Z]/.test(hit[0])) to = to.charAt(0).toUpperCase() + to.slice(1);
        out = out.replace(re, to);
        applied++;
      }
    });
    return { text: out, applied: applied };
  }

  function renderMarked(text, issues) {
    const valid = (issues || []).filter(function (i) { return i.end > i.start && i.start >= 0; });
    dedupeIssues(valid);
    let out = '';
    let pos = 0;
    valid.forEach(function (i) {
      if (i.start < pos) return;
      out += C.esc(text.slice(pos, i.start));
      out += '<mark class="' + C.esc(i.severity || 'mid') + '" title="' + C.esc(i.message + (i.suggestion ? ' → ' + i.suggestion : '')) + '">' + C.esc(text.slice(i.start, i.end)) + '</mark>';
      pos = i.end;
    });
    out += C.esc(text.slice(pos));
    return out || C.esc(text);
  }

  /* ---------- Scoring ---------- */
  function descriptor(band) {
    const list = (C.data && C.data.bandDescriptors) || [];
    return list.find(function (d) { return band >= d.min && band <= d.max; }) || { label: '—', desc: '' };
  }

  function weightedError(issues) {
    let w = 0;
    issues.forEach(function (i) {
      if (i.type === 'style') return;
      if (i.type === 'grammar') w += i.severity === 'high' ? 2.2 : i.severity === 'mid' ? 1.2 : 0.5;
      else if (i.type === 'spelling') w += i.severity === 'high' ? 2.6 : i.severity === 'mid' ? 1.4 : 0.6;
      else if (i.type === 'collocation') w += 1.3;
      else if (i.type === 'punctuation') w += 0.7;
    });
    return w;
  }

  function analyze(text, opts) {
    opts = opts || {};
    const type = opts.type || 'writing';
    const prompt = opts.prompt || null;
    const metrics = computeMetrics(text);
    const issues = dedupeIssues(grammarIssues(text).concat(spellingIssues(text)));
    const ups = buildUpgrades(text);
    let terms = [];
    if (type === 'translation' && prompt && prompt.terms) terms = prompt.terms;
    else if (prompt && prompt.expectedTerms) terms = prompt.expectedTerms;
    const cov = coverage(text, terms);

    const target = (prompt && prompt.wordTarget) || [150, 200];
    const wc = metrics.wordCount;
    let lengthScore;
    let lengthStatus;
    if (type === 'writing') {
      if (wc >= target[0] && wc <= target[1]) { lengthScore = 1; lengthStatus = 'ok'; }
      else if (wc >= target[0] - 15 && wc <= target[1] + 25) { lengthScore = 0.86; lengthStatus = 'slight'; }
      else if (wc >= target[0] - 35 && wc <= target[1] + 50) { lengthScore = 0.62; lengthStatus = 'off'; }
      else { lengthScore = wc < 80 ? 0.2 : 0.4; lengthStatus = wc < target[0] ? 'short' : 'long'; }
    } else {
      const refWords = prompt && prompt.reference ? C.countWords(prompt.reference) : 0;
      const ratio = refWords ? wc / refWords : 0.8;
      if (ratio >= 0.75 && ratio <= 1.3) { lengthScore = 1; lengthStatus = 'ok'; }
      else if (ratio >= 0.55 && ratio <= 1.5) { lengthScore = 0.8; lengthStatus = 'slight'; }
      else if (ratio >= 0.4 && ratio <= 1.7) { lengthScore = 0.55; lengthStatus = 'off'; }
      else { lengthScore = 0.3; lengthStatus = wc < (refWords * 0.6) ? 'short' : 'long'; }
    }

    const covRatio = cov.total ? cov.hit / cov.total : 0.7;
    const task = Math.round(100 * (type === 'translation'
      ? (0.7 * covRatio + 0.3 * lengthScore)
      : (0.55 * covRatio + 0.45 * lengthScore)));

    const errW = weightedError(issues);
    const per100 = errW / Math.max(wc / 100, 0.6);
    const accuracy = C.clamp(Math.round(100 - per100 * 7), 25, 100);

    const ttrScore = C.clamp(Math.round(((metrics.ttr - 0.32) / 0.33) * 100), 20, 100);
    const advDensity = metrics.uniqueContent ? metrics.advancedCount / metrics.uniqueContent : 0;
    const advScore = C.clamp(Math.round((advDensity / 0.22) * 100), 0, 100);
    const lexis = Math.round(0.55 * ttrScore + 0.45 * advScore);

    const idealAvg = type === 'translation' ? 19 : 17;
    const avgScore = C.clamp(Math.round(100 - Math.abs(metrics.avgSentenceLength - idealAvg) * 4), 25, 100);
    const densityScore = C.clamp(Math.round(100 - Math.abs(metrics.clauseDensity - 0.95) * 55), 30, 100);
    const varietyScore = C.clamp(Math.round(100 - Math.abs(metrics.sentenceVariety - 0.38) * 160), 30, 100);
    const syntax = Math.round(0.4 * avgScore + 0.35 * densityScore + 0.25 * varietyScore);

    const paraScore = type === 'writing'
      ? (metrics.paragraphCount >= 3 ? 100 : metrics.paragraphCount === 2 ? 62 : 32)
      : C.clamp(60 + metrics.sentenceCount * 8, 40, 100);
    const transScore = C.clamp(metrics.transitions * 18, 0, 100);
    const coherence = type === 'writing'
      ? Math.round(0.45 * paraScore + 0.35 * transScore + 0.2 * metrics.sentenceOpeningVariety)
      : Math.round(0.55 * transScore + 0.45 * metrics.sentenceOpeningVariety);

    const overall = type === 'writing'
      ? Math.round(task * 0.30 + accuracy * 0.25 + lexis * 0.20 + syntax * 0.15 + coherence * 0.10)
      : Math.round(task * 0.35 + accuracy * 0.30 + syntax * 0.20 + lexis * 0.15);
    let band = C.clamp(Math.round((overall / 100) * 15), 1, 15);
    if (type === 'writing') {
      if (wc < target[0] * 0.5) band = Math.min(band, 7);
      else if (wc < target[0] * 0.7) band = Math.min(band, 9);
    } else if (prompt && prompt.reference) {
      const refWords = C.countWords(prompt.reference);
      if (refWords) {
        if (wc < refWords * 0.35) band = Math.min(band, 7);
        else if (wc < refWords * 0.55) band = Math.min(band, 9);
      }
    }
    const desc = descriptor(band);

    const dimensions = [
      { key: 'task', name: '任务完成', value: Math.round(task), color: 'var(--accent)' },
      { key: 'accuracy', name: '语言准确', value: Math.round(accuracy), color: 'var(--jade)' },
      { key: 'lexis', name: '词汇丰富', value: Math.round(lexis), color: 'var(--gold)' },
      { key: 'syntax', name: '句式语法', value: Math.round(syntax), color: 'var(--blue)' },
      { key: 'coherence', name: '衔接结构', value: Math.round(coherence), color: 'var(--violet)' }
    ];

    const advice = [];
    if (cov.total && cov.hit < cov.total) {
      const lengthNote = (type === 'writing' && wc < target[0]) ? ' 当前 ' + wc + ' 词，低于建议的 ' + target[0] + ' 词。' : '';
      advice.push({ title: '任务完成', text: '还缺少这些关键内容：' + cov.items.filter(function (x) { return !x.hit; }).map(function (x) { return x.zh; }).join('、') + '。补上后再检查是否每个要点都有例证。' + lengthNote });
    } else if (lengthStatus === 'short') {
      advice.push({ title: '任务完成', text: '字数偏少（' + wc + ' 词）。先补一个具体例子或一层让步，而不是重复观点。' });
    } else if (lengthStatus === 'long') {
      advice.push({ title: '任务完成', text: '字数偏多（' + wc + ' 词）。检查是否有重复表达，可删去与主题关系较弱的句子。' });
    }
    if (accuracy < 78) {
      const types = {};
      issues.forEach(function (i) { if (i.type !== 'style') types[i.type] = (types[i.type] || 0) + 1; });
      const top = Object.keys(types).sort(function (a, b) { return types[b] - types[a]; })[0];
      const label = { grammar: '语法', spelling: '拼写', collocation: '搭配', punctuation: '标点' }[top] || '语言';
      advice.push({ title: '语言准确', text: '共检出 ' + issues.length + ' 处可改进点，最集中的是' + label + '问题。优先修正红色高严重度标记，再处理低级错误。' });
    }
    if (lexis < 65) {
      advice.push({ title: '词汇丰富', text: '词汇重复或高阶词比例偏低。可从右侧升级清单中挑选 3–4 个替换，不要全篇替换，以免搭配出错。' });
    }
    if (syntax < 65) {
      advice.push({ title: '句式语法', text: '平均句长 ' + metrics.avgSentenceLength + ' 词，从句密度 ' + metrics.clauseDensity + '。尝试每段加入一个定语从句或让步状语从句，同时保留 1–2 个短句强调。' });
    }
    if (coherence < 65) {
      if (type === 'writing') {
        advice.push({ title: '衔接结构', text: '目前 ' + metrics.paragraphCount + ' 段，衔接词 ' + metrics.transitions + ' 处。建议按“立场—论证—让步/建议”分三段，并用 however / therefore / moreover 明确逻辑。' });
      } else {
        advice.push({ title: '衔接结构', text: '译文句子之间的逻辑连接还不够清楚。检查 however / therefore / while 等关系是否显化，并确认同一术语全篇译法一致；翻译不必强行分段。' });
      }
    }
    if (metrics.repeatedWords.length) {
      advice.push({ title: '重复词', text: '高频重复：' + metrics.repeatedWords.join('、') + '。可用同义表达轮换，或在第二次出现时改用代词/上位词。' });
    }
    if (!advice.length) advice.push({ title: '保持', text: '整体完成度较好。下一步可对照范文，检查论点是否有具体例证，并尝试更精确的动词搭配。' });

    return {
      type: type,
      promptId: prompt ? prompt.id : '',
      wordCount: wc,
      metrics: metrics,
      issues: issues,
      upgrades: ups,
      coverage: cov,
      length: { status: lengthStatus, target: target },
      scores: {
        overall: overall, band: band, bandLabel: desc.label, bandDesc: desc.desc,
        task: task, accuracy: accuracy, lexis: lexis, syntax: syntax, coherence: coherence
      },
      dimensions: dimensions,
      advice: advice.slice(0, 4)
    };
  }

  function llmReview(opts) {
    const cfg = (C.store && C.store.state.settings && C.store.state.settings.llm) || {};
    if (!cfg.enabled || !cfg.apiKey) return Promise.reject(new Error('还没有启用 AI 增强。请到设置中填写接口与 Key。'));
    let base = String(cfg.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const endpoint = /\/chat\/completions$/.test(base) ? base : base + '/chat/completions';
    const type = opts.type === 'translation' ? '翻译' : '写作';
    const reference = opts.type === 'translation' && opts.prompt.reference ? '\n参考译文（仅供你对照，不要照抄给学生）：\n' + opts.prompt.reference : '';
    const system = '你是大学英语六级阅卷老师，负责给学生的写作或翻译做二次批改。请用中文反馈，英文例句保留英文。不要重写全文，不要编造官方评分标准，不要声称自己给出的是官方分数。你的任务是指出最具体、最可执行的改进点。';
    const user = '题型：' + type + '\n题目：' + (opts.prompt.title || '') + '\n要求：' + (opts.prompt.task || opts.prompt.zh || '') + reference +
      '\n\n本地规则引擎估算档位：' + (opts.band || '未知') + '/15。请独立判断，不要只是同意它。\n\n学生文本：\n' + String(opts.text || '').slice(0, 6000) +
      '\n\n请按以下结构输出：\n1. 档位与一句总评（说明与本地引擎是否一致）\n2. 最关键的 3 个问题（引用原句，说明为什么）\n3. 逐句修改建议（只改有问题的句子，给出改后版本与一句理由）\n4. 一个 10–15 分钟可完成的练习';
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 40000);
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: JSON.stringify({
        model: cfg.model || 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 1000,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
      }),
      signal: controller.signal
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (txt) { throw new Error('接口返回 ' + res.status + '：' + C.truncate(txt, 120)); });
      return res.json();
    }).then(function (data) {
      const content = data && data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
      if (!content) throw new Error('接口没有返回可读内容。');
      return content;
    }).catch(function (err) {
      if (err.name === 'AbortError') throw new Error('请求超时，请检查网络或接口地址。');
      throw err;
    }).finally(function () { clearTimeout(timer); });
  }

  C.engine = {
    analyze: analyze,
    metrics: computeMetrics,
    spellingIssues: spellingIssues,
    grammarIssues: grammarIssues,
    renderMarked: renderMarked,
    buildUpgrades: buildUpgrades,
    applyUpgrades: applyUpgrades,
    llmReview: llmReview,
    descriptor: descriptor,
    coverage: coverage,
    termHit: termHit,
    buildLexicon: buildLexicon
  };
})();
