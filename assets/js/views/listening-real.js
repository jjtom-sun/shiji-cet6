/* Real CET-6 listening lab — streamed exam audio, guided intensive listening, evidence-backed quiz */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;
  const RATES = [0.6, 0.75, 1, 1.25, 1.5];

  function allSets() { return (C.data && C.data.realListening) || []; }
  function meta() { return (C.data && C.data.realListeningMeta) || {}; }
  function wordsMeta() { return (C.data && C.data.listeningWordsMeta) || {}; }
  function fmt(sec) { return C.fmtDuration(sec || 0); }
  function enc(id) { return encodeURIComponent(id); }
  function totalMinutes(set) { return Math.max(1, Math.round((set.durationSec || 0) / 60)); }

  function sourceLinks() {
    const m = meta().source || {};
    return '<div class="real-source-note">' +
      '真题听力原文、选项与答案：' + C.esc(m.title || 'CET-6 Listening Resources') + ' · ' +
      '<a href="' + (m.licenseUrl || 'https://creativecommons.org/licenses/by/4.0/') + '" target="_blank" rel="noopener">' + C.esc(m.license || 'CC BY 4.0') + '</a> · ' +
      '<a href="' + (m.mirror || '#') + '" target="_blank" rel="noopener">数据镜像</a> · ' +
      '<a href="' + (m.doi || '#') + '" target="_blank" rel="noopener">Zenodo</a>' +
      '<br>本站做了逐句切分、题目依据对齐、选项格式清理与学习功能；音频不内置，使用上游公开的真题音频流。中译为上游机器翻译，仅供理解。' +
      '</div>';
  }

  function realIdLink(set) { return '#/listening?real=' + enc(set.id); }

  function sectionLabel(name) {
    return String(name || 'Section').replace(/Conversation One/i, '长对话 1')
      .replace(/Conversation Two/i, '长对话 2')
      .replace(/Passage One/i, '篇章 1').replace(/Passage Two/i, '篇章 2')
      .replace(/Recording One/i, '讲座 1').replace(/Recording Two/i, '讲座 2').replace(/Recording Three/i, '讲座 3');
  }

  /* ================= Hub ================= */
  function renderHub(view, ctx) {
    const sets = allSets().slice().sort(function (a, b) {
      return b.session.localeCompare(a.session) || a.setNo - b.setNo;
    });
    const metaInfo = meta();
    const years = [];
    sets.forEach(function (s) { if (years.indexOf(s.session) === -1) years.push(s.session); });
    const wm = wordsMeta();
    if (!sets.length) {
      view.innerHTML = C.listeningUI.tabs('real') + C.emptyState('真题数据还没加载', '请确认 assets/js/data/listening-real.data.js 存在。', 'headphones');
      return function () { C.speech.stop(); };
    }
    const shortest = sets.slice().sort(function (a, b) { return totalMinutes(a) - totalMinutes(b); })[0];
    const bestList = sets.map(function (s) { return (S.state.listening[s.id] || {}).best || 0; });
    const avg = bestList.filter(Boolean).length ? Math.round(bestList.reduce(function (a, b) { return a + b; }, 0) / bestList.filter(Boolean).length) : 0;

    view.innerHTML = C.ui.pageHead({
      eyebrow: 'REAL CET-6 LISTENING',
      title: '真题精听',
      sub: sets.length + ' 套 · ' + metaInfo.questions + ' 道听力题 · ' + metaInfo.sentences + ' 个逐句单元 · 2016.12–2025.12。按真实考试音频练习，先词后句，再整段。',
      actions: '<a class="btn btn-primary" href="#/listening?tab=words">' + C.icon('volume', 14) + '听力高频词</a>' +
        '<a class="btn" href="#/listening?tab=original">' + C.icon('headphones', 14) + '原创训练</a>'
    }) + C.listeningUI.tabs('real') +
    '<div class="stat-row mb-3">' +
      C.ui.stat('REAL SETS', sets.length, '可练真题套数', '套') +
      C.ui.stat('QUESTIONS', metaInfo.questions || 825, '全部带答案', '题') +
      C.ui.stat('SENTENCES', metaInfo.sentences || 5196, '逐句对齐 + 机器中译', '句') +
      C.ui.stat('AVG BEST', avg ? avg + '%' : '—', '已做题的套均最佳', '') +
    '</div>' +
    '<div class="card real-guide mb-2">' +
      '<div class="card-head"><div><div class="card-kicker">LISTENING FIRST AID</div><div class="card-title">听不懂、跟不上时，不要直接做整卷</div><div class="card-sub">按“词 → 句 → 节 → 题”的顺序。先把听不懂的原因拆开，再回到题目。</div></div><span class="badge badge-jade">推荐路径</span></div>' +
      '<div class="real-steps">' +
        '<div class="real-step"><span class="real-step-no">01</span><b>先看 10 个词</b><p>进入一套后先看本套关键词，点发音，知道等会儿要听什么。</p><a href="#/listening?tab=words">去背六级听力高频词 →</a></div>' +
        '<div class="real-step"><span class="real-step-no">02</span><b>盲听一节</b><p>只播放一段 Conversation，不显示原文，不要求全懂；先抓场景和态度。</p></div>' +
        '<div class="real-step"><span class="real-step-no">03</span><b>逐句精听</b><p>0.6–0.75x 逐句循环；先听，再看英文/中文，最后处理连读与生词。</p></div>' +
        '<div class="real-step"><span class="real-step-no">04</span><b>再做题</b><p>题目在真题音频里播报，卷面只有选项；做完看依据句，不靠猜。</p></div>' +
      '</div>' +
      '<div class="row mt-2" style="flex-wrap:wrap">' +
        '<button class="btn btn-sm btn-primary" data-shortest>从最短的一套开始</button>' +
        '<a class="btn btn-sm" href="#/vocab?tab=review&focus=listening-core">' + C.icon('book', 13) + '先背高频核心 ' + (wm.coreCount || 0) + ' 词</a>' +
        '<span class="small muted">每套可按节练，不必一次听完 25 题。</span>' +
      '</div>' +
    '</div>' +
    '<div class="card mb-2"><div class="row-between" style="flex-wrap:wrap;gap:10px">' +
      '<div class="row" style="gap:7px;flex-wrap:wrap" id="real-years"><button class="chip active" data-year="all">全部年份</button>' + years.map(function (y) { return '<button class="chip" data-year="' + C.esc(y) + '">' + C.esc(y.replace('.', '年') + '月') + '</button>'; }).join('') + '</div>' +
      '<div class="row" style="gap:7px"><div class="input-group" style="width:190px">' + C.icon('search', 14) + '<input class="input search-input" id="real-search" placeholder="搜年份 / 套次…" style="height:32px;font-size:11.5px"></div>' +
      '<button class="btn btn-sm" id="real-reset">重置</button></div>' +
    '</div></div>' +
    '<div class="real-set-grid" id="real-set-grid"></div>' +
    '<div class="card mt-3"><div class="card-head"><div><div class="card-title">怎么用这一套</div><div class="card-sub">不要从第 1 题硬听到第 25 题</div></div><a class="section-link" href="#/listening?tab=words">高频词 ' + C.icon('arrow-right', 12) + '</a></div>' +
      '<div class="grid grid-3">' +
        '<div><div class="eyebrow no-rule">A · 关键词</div><p class="small mt-1">先看 10 个词，每个点一次发音；不知道的词先查，不要边听边查。</p></div>' +
        '<div><div class="eyebrow no-rule">B · 分节</div><p class="small mt-1">一次只练一个 Conversation / Passage；把长音频切成可完成的 4–5 题。</p></div>' +
        '<div><div class="eyebrow no-rule">C · 依据句</div><p class="small mt-1">批改后读原文依据句，确认是“没听到”还是“听错了同义替换”。</p></div>' +
      '</div>' +
      '<div class="notice mt-2">' + C.icon('info', 14) + '<span>题目的问句在真题音频中播报，卷面只有 A–D 选项。逐句模式适合精听，做题请用“本节/全卷”播放。</span></div>' +
      sourceLinks() +
    '</div>';

    const grid = view.querySelector('#real-set-grid');
    let filter = { year: 'all', q: '' };
    function renderGrid() {
      const q = filter.q.trim().toLowerCase();
      const list = sets.filter(function (s) {
        if (filter.year !== 'all' && s.session !== filter.year) return false;
        if (q && (s.title + ' ' + s.session + ' ' + s.keyWords.map(function (k) { return k.word; }).join(' ')).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      grid.innerHTML = list.length ? list.map(function (s) {
        const best = (S.state.listening[s.id] || {}).best || 0;
        const attempts = (S.state.listening[s.id] || {}).attempts || 0;
        const evCount = s.questions.filter(function (q) { return q.evidence !== null; }).length;
        return '<a class="real-set-card" href="' + realIdLink(s) + '">' +
          '<div class="row-between"><span class="badge badge-jade">真题 · CC BY</span><span class="tiny mono muted">' + C.esc(s.session) + '</span></div>' +
          '<div class="real-set-title">' + C.esc(s.title) + '</div>' +
          '<div class="small muted">' + s.sections.length + ' 节 · ' + s.questions.length + ' 题 · 约 ' + totalMinutes(s) + ' 分钟</div>' +
          '<div class="real-set-meta">' + C.icon('layers', 12) + evCount + ' 题有原文依据 · ' + s.sentences.length + ' 句</div>' +
          '<div class="row-between" style="margin-top:8px"><span class="small ' + (best ? 'jade' : 'muted') + '">' + (attempts ? '最佳 ' + best + '% · 已做 ' + attempts + ' 次' : '还没做过') + '</span><span class="section-link">进入 ' + C.icon('arrow-right', 12) + '</span></div>' +
          '</a>';
      }).join('') : C.emptyState('没有匹配的套次', '换一个年份或关键词。', 'search');
    }
    view.querySelectorAll('[data-year]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filter.year = btn.dataset.year;
        view.querySelectorAll('[data-year]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        renderGrid();
      });
    });
    view.querySelector('#real-search').addEventListener('input', C.debounce(function (e) { filter.q = e.target.value; renderGrid(); }, 130));
    view.querySelector('#real-reset').addEventListener('click', function () {
      filter = { year: 'all', q: '' };
      view.querySelector('#real-search').value = '';
      view.querySelectorAll('[data-year]').forEach(function (b) { b.classList.toggle('active', b.dataset.year === 'all'); });
      renderGrid();
    });
    const shortestBtn = view.querySelector('[data-shortest]');
    if (shortestBtn) shortestBtn.addEventListener('click', function () { C.app.navigate(realIdLink(shortest)); });
    renderGrid();
    return function () { C.speech.stop(); };
  }

  /* ================= Listening high-frequency words ================= */
  function renderWords(view, ctx) {
    const core = (C.data && C.data.listeningWords) || [];
    const all = (C.data && C.data.listeningWordsAll) || [];
    const wm = wordsMeta();
    if (!core.length) {
      view.innerHTML = C.listeningUI.tabs('words') + C.emptyState('听力词库还没加载', '请确认 vocab-listening.data.js 存在。', 'volume');
      return function () { C.speech.stop(); };
    }
    let scope = ctx.params.get('scope') || 'core';
    if (scope === 'listening') scope = 'cet6';
    let q = '';
    let sort = 'coverage';
    let limit = 80;
    const source = wm.source || '';
    view.innerHTML = C.ui.pageHead({
      eyebrow: 'LISTENING VOCABULARY',
      title: '听力高频词',
      sub: '从 39 套真题听力原文（2016.12–2025.12，' + (wm.corpusSentences || 6081) + ' 句）统计出的六级进阶词。每一个词都标出“出现套数 / 总次数”，不是凭感觉拼的清单。',
      actions: '<a class="btn btn-primary" href="#/vocab?tab=review&focus=listening-core">' + C.icon('book', 14) + '背高频核心</a>' +
        '<a class="btn" href="#/listening">' + C.icon('headphones', 14) + '回真题精听</a>'
    }) + C.listeningUI.tabs('words') +
    '<div class="stat-row mb-3">' +
      C.ui.stat('CORPUS', '39', '套真题听力原文', '套') +
      C.ui.stat('SENTENCES', C.data.listeningWordsMeta.corpusSentences || 6081, '逐句语料', '句') +
      C.ui.stat('CET-6', core.length, '六级进阶词（不含基础词）', '词') +
      C.ui.stat('CORE', wm.coreCount || 0, '出现 ≥3 套的高频核心', '词') +
    '</div>' +
    '<div class="card method-card mb-2"><div class="card-head"><div><div class="card-kicker">METHOD · 统计口径</div><div class="card-title">怎么定义“高频”</div><div class="card-sub">先看覆盖套数，再看总次数；不把只出现一两次的词硬说成必考。</div></div><span class="badge badge-jade">可复核</span></div>' +
      '<div class="grid grid-3">' +
        '<div><div class="eyebrow no-rule">01 · 语料</div><p class="small mt-1">2016.12–2025.12 共 39 套六级听力原文，逐句切分；只统计实际出现的词。</p></div>' +
        '<div><div class="eyebrow no-rule">02 · 过滤</div><p class="small mt-1">去除功能词、专有名词和词典未收词；按规则屈折归并（如 researchers → researcher）；例句只从命中该词形的原句生成。</p></div>' +
        '<div><div class="eyebrow no-rule">03 · 排序</div><p class="small mt-1">“出现套数”优先，其次总次数。≥3 套为高频核心；1–2 套保留为进阶补充，并明确标出。</p></div>' +
      '</div>' +
      '<div class="notice mt-2">' + C.icon('alert', 14) + '<span>这是“本语料中的高频”，不是官方词频，也不保证未来必考。表中同时给出套数和次数，你可以自己判断；只背高频核心即可先保证质量。</span></div>' +
      (wm.caveat ? '<div class="small muted mt-2" style="line-height:1.7">' + C.esc(wm.caveat) + '</div>' : '') +
      '<div class="source-note mt-2">' + C.esc(source) + '</div>' +
      '<div class="row mt-2"><a class="btn btn-sm" href="' + ((meta().source || {}).mirror || '#') + '" target="_blank" rel="noopener">数据镜像</a><a class="btn btn-sm" href="' + ((meta().source || {}).licenseUrl || 'https://creativecommons.org/licenses/by/4.0/') + '" target="_blank" rel="noopener">CC BY 4.0</a><a class="btn btn-sm" href="#/settings?to=about">说明</a></div>' +
    '</div>' +
    '<div class="card mb-2"><div class="row-between" style="flex-wrap:wrap;gap:10px">' +
      '<div class="seg" id="word-scope">' +
        '<button data-scope="core" class="' + (scope === 'core' ? 'active' : '') + '">高频核心 ' + (wm.coreCount || 0) + '</button>' +
        '<button data-scope="cet6" class="' + (scope === 'cet6' ? 'active' : '') + '">六级进阶 ' + core.length + '</button>' +
        '<button data-scope="all" class="' + (scope === 'all' ? 'active' : '') + '">全部实词 ' + all.length + '</button>' +
      '</div>' +
      '<div class="row" style="gap:7px"><div class="input-group" style="width:190px">' + C.icon('search', 15) + '<input class="input search-input" id="word-search" placeholder="搜单词或中文…" style="height:32px;font-size:11.5px"></div>' +
      '<select class="select input-inline" id="word-sort" style="width:auto;height:32px;font-size:11.5px"><option value="coverage">按覆盖套数</option><option value="count">按出现次数</option><option value="alpha">按字母</option></select></div>' +
    '</div></div>' +
    '<div class="card"><div class="row-between mb-2"><span class="small muted" id="word-meta">—</span><a class="btn btn-sm" id="word-review" href="#/vocab?tab=review&focus=listening-core">背这一组</a></div>' +
      '<div class="table-wrap" style="overflow-x:auto"><table class="replace-table real-word-table"><thead><tr><th style="width:46px">#</th><th>单词</th><th>音标 / 词性</th><th>中文</th><th style="width:92px">覆盖</th><th style="width:70px">次数</th><th style="width:90px">层级</th><th style="width:70px"></th></tr></thead><tbody id="word-body"></tbody></table></div>' +
      '<div class="center mt-2" id="word-more"></div>' +
    '</div>' +
    '<div class="card mt-2 card--soft"><div class="card-kicker">HOW TO MEMORISE</div><div class="card-title" style="font-size:17px;margin-top:4px">听力词不是“看懂”就够</div><p class="small muted mt-1">先听发音，再看中文；第二天用“看中文想发音”的方式复习。进入词条后可以加入记忆盒，按艾宾浩斯安排复习。不要从 A 到 Z 硬背 ' + (wm.cet6Only || 0) + ' 个。</p><div class="row mt-2"><a class="btn btn-sm btn-primary" href="#/vocab?tab=review&focus=listening-core">从高频核心开始</a><a class="btn btn-sm" href="#/listening">回到真题精听</a></div></div>';

    const body = view.querySelector('#word-body');
    const more = view.querySelector('#word-more');
    const metaEl = view.querySelector('#word-meta');
    const reviewBtn = view.querySelector('#word-review');

    function currentList() {
      let list = scope === 'all' ? all.slice() : core.slice();
      if (scope === 'core') list = list.filter(function (w) { return w.core; });
      const query = q.trim().toLowerCase();
      if (query) list = list.filter(function (w) { return (w.word + ' ' + w.zh + ' ' + (w.pos || '')).toLowerCase().indexOf(query) !== -1; });
      list.sort(function (a, b) {
        if (sort === 'count') return b.count - a.count || b.df - a.df || a.word.localeCompare(b.word);
        if (sort === 'alpha') return a.word.localeCompare(b.word);
        return b.df - a.df || b.count - a.count || a.word.localeCompare(b.word);
      });
      return list;
    }

    function render() {
      const list = currentList();
      const shown = list.slice(0, limit);
      body.innerHTML = shown.length ? shown.map(function (w, i) {
        const level = w.level === 'cet6-only' ? '<span class="badge badge-jade">六级进阶</span>' : w.level === 'cet6-basic' ? '<span class="badge badge-core">六级基础</span>' : '<span class="badge">基础</span>';
        return '<tr><td class="mono muted">' + (w.rank || i + 1) + '</td><td><b style="font-family:var(--serif);font-size:15px">' + C.esc(w.word) + '</b></td><td class="note mono">' + C.esc(w.phonetic || '—') + ' <span class="faint">' + C.esc(w.pos || '') + '</span></td><td class="note">' + C.esc(w.zh || '—') + '</td>' +
          '<td><b class="mono">' + w.df + '</b><span class="faint small"> / 39套</span></td><td class="mono">' + w.count + '</td><td>' + level + '</td>' +
          '<td><button class="icon-mini" data-speak="' + C.esc(w.word) + '" title="发音">' + C.icon('volume', 13) + '</button>' + (w.id ? '<a class="icon-mini" href="#/vocab?word=' + w.id + '" title="词条">' + C.icon('arrow-up-right', 13) + '</a>' : '') + '</td></tr>';
      }).join('') : '<tr><td colspan="8">' + C.emptyState('没有匹配的词', '换一个关键词或范围。', 'search') + '</td></tr>';
      metaEl.textContent = '当前 ' + list.length + ' 词 · 展示 ' + shown.length + ' · 每行标明覆盖套数与出现次数';
      more.innerHTML = list.length > shown.length ? '<button class="btn btn-sm" data-more>加载更多</button>' : '';
      const moreBtn = more.querySelector('[data-more]');
      if (moreBtn) moreBtn.addEventListener('click', function () { limit += 80; render(); });
      body.querySelectorAll('[data-speak]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!C.speech.supported) { C.toast('当前浏览器不支持语音合成', 'bad'); return; }
          C.speech.speak(btn.dataset.speak, { rate: 0.9 });
        });
      });
      reviewBtn.href = '#/vocab?tab=review&focus=' + (scope === 'core' ? 'listening-core' : 'listening');
      reviewBtn.textContent = scope === 'core' ? '背高频核心' : '背六级进阶';
    }

    view.querySelectorAll('[data-scope]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        scope = btn.dataset.scope;
        limit = 80;
        view.querySelectorAll('[data-scope]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        render();
      });
    });
    view.querySelector('#word-search').addEventListener('input', C.debounce(function (e) { q = e.target.value; limit = 80; render(); }, 130));
    view.querySelector('#word-sort').addEventListener('change', function (e) { sort = e.target.value; render(); });
    render();
    return function () { C.speech.stop(); };
  }

  /* ================= Set ================= */
  function renderSet(view, ctx, id) {
    const set = allSets().find(function (s) { return s.id === id; });
    if (!set) {
      view.innerHTML = C.listeningUI.tabs('real') + C.emptyState('找不到这套真题', '返回真题库重新选择。', 'headphones');
      return function () { C.speech.stop(); };
    }
    const mode = ctx.params.get('mode') === 'quiz' ? 'quiz' : 'study';
    const state = {
      mode, sectionIdx: 0, current: set.sections[0] ? set.sections[0].startIdx : 0,
      scope: mode === 'quiz' ? 'section' : 'sentence', rate: 1,
      loop: mode !== 'quiz', showEn: mode !== 'quiz', showZh: mode !== 'quiz',
      showTranscript: false, answers: {}, submitted: false, playing: false,
      stopAt: null, ttsToken: 0, audioReady: false, audioFailed: false,
      localUrl: null, addedErrors: new Set(), startedAt: Date.now(), logged: false,
      audioDuration: set.durationSec || 0
    };
    const wm = wordsMeta();
    const keySet = new Set(set.keyWords.map(function (k) { return k.word.toLowerCase(); }));
    const section = function () { return set.sections[state.sectionIdx] || set.sections[0]; };
    const sentence = function () { return set.sentences[state.current] || set.sentences[0]; };
    const inSection = function (q) { return !q.section || q.section === section().name; };
    const questionsForView = function () { return mode === 'study' ? set.questions.filter(inSection) : set.questions; };
    const source = meta().source || {};

    view.innerHTML = C.ui.pageHead({
      eyebrow: 'REAL LISTENING · ' + set.session,
      title: set.title,
      sub: set.sections.length + ' 节 · ' + set.questions.length + ' 题 · 约 ' + totalMinutes(set) + ' 分钟 · 真题音频在线播放；题干在录音中播报，卷面只有选项。',
      actions: '<a class="btn btn-sm" href="#/listening">' + C.icon('arrow-left', 13) + '真题库</a>' +
        '<a class="btn btn-sm" href="#/listening?tab=words">' + C.icon('volume', 13) + '听力词</a>' +
        '<a class="btn btn-sm" href="' + C.esc(set.sourceUrl) + '" target="_blank" rel="noopener">' + C.icon('external', 13) + '原始资料</a>'
    }) + C.listeningUI.tabs('real') +
    '<div class="tabs mb-3">' +
      '<a class="tab' + (mode === 'study' ? ' active' : '') + '" href="' + realIdLink(set) + '&mode=study">逐句精听</a>' +
      '<a class="tab' + (mode === 'quiz' ? ' active' : '') + '" href="' + realIdLink(set) + '&mode=quiz">做题模式</a>' +
    '</div>' +
    (mode === 'study' ? studyGuideHTML(set) : quizGuideHTML(set)) +
    '<div class="listen-layout real-layout">' +
      '<div class="stack">' + playerHTML(set, state) + (mode === 'study' ? transcriptHTML(set, state) : '') + (mode === 'study' ? dictationHTML(set) : '') + '</div>' +
      '<div class="stack">' + (mode === 'study' ? keyWordsHTML(set) : '') + '<div class="card" id="real-questions-card">' + questionsFrameHTML(set, state) + '</div>' + sourceCardHTML() + '</div>' +
    '</div>';

    const audio = view.querySelector('#real-audio');
    const sentenceHost = view.querySelector('#real-sentence');
    const transcriptHost = view.querySelector('#real-transcript');
    const questionsHost = view.querySelector('#real-questions');
    const questionCard = view.querySelector('#real-questions-card');
    const statusEl = view.querySelector('#real-audio-status');
    const seekEl = view.querySelector('#real-seek');
    const timeEl = view.querySelector('#real-time');
    const durEl = view.querySelector('#real-time-total');
    const playBtns = view.querySelectorAll('[data-real-play]');
    const scopeBtns = view.querySelectorAll('[data-scope]');
    const speedBtns = view.querySelectorAll('[data-real-rate]');

    function setStatus(text, bad) {
      if (statusEl) {
        statusEl.textContent = text;
        statusEl.classList.toggle('bad', !!bad);
      }
    }

    function updatePlayIcon() {
      view.querySelectorAll('[data-real-play]').forEach(function (b) {
        b.innerHTML = C.icon(state.playing ? 'pause' : 'play', 18);
      });
      const panel = view.querySelector('#real-player');
      if (panel) panel.classList.toggle('playing', state.playing);
    }

    function updateTimeUI() {
      if (!audio) return;
      const cur = state.audioReady ? audio.currentTime : (sentence().start || 0);
      const dur = state.audioReady && isFinite(audio.duration) ? audio.duration : state.audioDuration;
      if (timeEl) timeEl.textContent = fmt(cur);
      if (durEl) durEl.textContent = fmt(dur);
      if (seekEl && state.audioReady && dur) {
        seekEl.max = 1000;
        seekEl.value = Math.round((cur / dur) * 1000);
      }
    }

    function updateSectionUI() {
      view.querySelectorAll('[data-real-section]').forEach(function (b) {
        b.classList.toggle('active', Number(b.dataset.realSection) === state.sectionIdx);
      });
      const select = view.querySelector('#real-section-select');
      if (select) select.value = String(state.sectionIdx);
      const secLabel = view.querySelector('#real-section-label');
      if (secLabel) secLabel.textContent = sectionLabel(section().name);
      const nextBtn = view.querySelector('#real-next-section');
      if (nextBtn) nextBtn.disabled = state.sectionIdx >= set.sections.length - 1;
    }

    function updateSentence() {
      const s = sentence();
      const sec = section();
      if (!sentenceHost) return;
      const words = state.showEn ? wordify(s.en, keySet) : '<span class="muted">文本已遮住 · 先听再看</span>';
      const zh = state.showZh && s.zh ? '<div class="sentence-zh">' + C.esc(s.zh) + '</div>' : '';
      sentenceHost.innerHTML = '<div class="row-between"><div class="sentence-no">' + C.esc(sectionLabel(sec.name)) + ' · ' + C.pad2(state.current + 1) + ' / ' + set.sentences.length + '</div><span class="tiny mono muted">' + C.esc(s.spk || '') + '</span></div>' +
        '<div class="sentence-en real-sentence-en">' + words + '</div>' + zh +
        (state.showEn ? flowHTML(s.en) : '');
      updateSectionUI();
      updateTimeUI();
      updatePlayIcon();
      if (transcriptHost) {
        transcriptHost.querySelectorAll('[data-tidx]').forEach(function (el) {
          el.classList.toggle('active', Number(el.dataset.tidx) === state.current);
        });
      }
    }

    function updateTranscript() {
      if (!transcriptHost) return;
      let html = '';
      let last = '';
      set.sentences.forEach(function (s, i) {
        if (s.section !== last) {
          html += '<div class="real-transcript-section">' + C.esc(sectionLabel(s.section)) + '</div>';
          last = s.section;
        }
        html += '<div class="real-tline' + (i === state.current ? ' active' : '') + '" data-tidx="' + i + '"><span class="real-tline-no">' + C.pad2(i + 1) + '</span><span class="real-tline-text">' + C.esc(s.en) + (state.showZh && s.zh ? '<span class="zh">' + C.esc(s.zh) + '</span>' : '') + '</span></div>';
      });
      transcriptHost.innerHTML = html;
    }

    function flowHints(text) {
      const hints = [];
      const seen = new Set();
      const add = function (phrase, note) {
        const k = phrase.toLowerCase();
        if (!seen.has(k)) { seen.add(k); hints.push({ phrase: phrase, note: note }); }
      };
      const reductions = [
        [/\bgoing to\b/gi, 'going to → gonna（口语弱读）'],
        [/\bwant to\b/gi, 'want to → wanna（口语弱读）'],
        [/\bgot to\b/gi, 'got to → gotta（口语弱读）'],
        [/\bkind of\b/gi, 'kind of → kinda（弱读）'],
        [/\bsort of\b/gi, 'sort of → sorta（弱读）'],
        [/\bhave to\b/gi, 'have to → /hæftə/（弱读）'],
        [/\bhas to\b/gi, 'has to → /hæstə/（弱读）'],
        [/\bused to\b/gi, 'used to → /juːstə/（弱读）']
      ];
      reductions.forEach(function (r) { const m = text.match(r[0]); if (m) add(m[0], r[1]); });
      const contractions = text.match(/\b[A-Za-z]+n['’]t\b|\b[A-Za-z]+['’](?:s|re|ll|ve|d|m)\b/g) || [];
      const S_STEMS = new Set(['it','that','what','who','he','she','there','here','this','how','where','when','why','one','everybody','everyone','somebody','someone','nobody','nothing','something','everything','anything','which']);
      contractions.slice(0, 4).forEach(function (c) {
        const low = c.toLowerCase().replace(/’/g, "'");
        let note = null;
        if (/n't$/.test(low)) note = c + ' → ' + low.replace(/n't$/, ' not');
        else if (/'re$/.test(low)) note = c + ' → ' + low.replace(/'re$/, ' are');
        else if (/'ll$/.test(low)) note = c + ' → ' + low.replace(/'ll$/, ' will');
        else if (/'ve$/.test(low)) note = c + ' → ' + low.replace(/'ve$/, ' have');
        else if (/'m$/.test(low)) note = c + ' → ' + low.replace(/'m$/, ' am');
        else if (/'d$/.test(low)) note = c + ' → would / had（弱读）';
        else if (/'s$/.test(low)) {
          const stem = low.slice(0, -2);
          if (stem === 'let') note = c + ' → let us';
          else if (S_STEMS.has(stem)) note = c + ' → ' + stem + ' is / has';
        }
        if (note) add(c, note);
      });
      return hints.slice(0, 5);
    }

    function flowHTML(text) {
      const hints = flowHints(text);
      if (!hints.length) return '';
      return '<div class="real-flow"><span class="real-flow-label">语流提示（自动）</span>' + hints.map(function (h) {
        return '<span class="real-flow-chip" title="' + C.esc(h.note) + '">' + C.esc(h.phrase) + '</span>';
      }).join('') + '<span class="small faint">' + C.esc(hints[0].note) + '</span></div>';
    }

    function wordify(text, keys) {
      return C.esc(text).replace(/[A-Za-z]+(?:['’][A-Za-z]+)?/g, function (w) {
        const key = w.toLowerCase().replace(/[’]/g, "'");
        return '<button class="word-tap' + (keys && keys.has(key) ? ' is-key' : '') + '" data-word="' + C.esc(key) + '">' + w + '</button>';
      });
    }

    /* ---------- Audio ---------- */
    function setupAudio() {
      if (!audio) return;
      audio.playbackRate = state.rate;
      audio.addEventListener('loadedmetadata', function () {
        state.audioReady = true;
        state.audioFailed = false;
        state.audioDuration = isFinite(audio.duration) ? audio.duration : state.audioDuration;
        setStatus('真题音频已就绪 · ' + (state.localUrl ? '本地文件' : '在线流播'), false);
        updateTimeUI();
        renderQuestions();
      });
      audio.addEventListener('canplay', function () {
        state.audioReady = true;
        updateTimeUI();
        renderQuestions();
      });
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('ended', function () {
        state.playing = false;
        state.stopAt = null;
        state.showEn = state.mode === 'study' ? state.showEn : true;
        state.showZh = state.mode === 'study' ? state.showZh : true;
        updatePlayIcon(); updateSentence();
      });
      audio.addEventListener('play', function () { state.playing = true; updatePlayIcon(); });
      audio.addEventListener('pause', function () { state.playing = false; updatePlayIcon(); });
      audio.addEventListener('error', function () {
        state.audioFailed = true;
        state.audioReady = false;
        state.playing = false;
        setStatus('真题音频加载失败：网络受限时可改用合成语音精听，或载入本地音频。', true);
        updatePlayIcon();
        renderQuestions();
      });
      try { audio.load(); } catch (e) { /* noop */ }
      if (audio.readyState >= 1) {
        state.audioReady = true;
        state.audioDuration = isFinite(audio.duration) ? audio.duration : state.audioDuration;
        setStatus('真题音频已就绪 · ' + (state.localUrl ? '本地文件' : '在线流播'), false);
        updateTimeUI();
      }
      if (audio.readyState >= 2) renderQuestions();
    }

    function onTimeUpdate() {
      if (!audio || !state.audioReady) return;
      const t = audio.currentTime;
      if (seekEl) seekEl.value = Math.round((t / Math.max(1, audio.duration || state.audioDuration)) * 1000);
      if (timeEl) timeEl.textContent = fmt(t);
      const idx = findSentenceAt(t);
      if (idx !== state.current) {
        state.current = idx;
        updateSentence();
      }
      if (state.stopAt != null && t >= state.stopAt) {
        if (state.mode === 'study' && state.scope === 'sentence' && state.loop) {
          const s = sentence();
          audio.currentTime = s.start || state.stopAt;
        } else {
          audio.pause();
          audio.currentTime = Math.min(state.stopAt, audio.duration || state.stopAt);
          state.stopAt = null;
          state.playing = false;
          state.showEn = state.mode === 'study' ? state.showEn : true;
          updateSentence();
        }
      }
    }

    function findSentenceAt(t) {
      let best = state.current;
      for (let i = 0; i < set.sentences.length; i++) {
        const s = set.sentences[i];
        if (s.start != null && s.end != null && t >= s.start && t <= s.end) return i;
        if (s.start != null && t >= s.start) best = i;
      }
      return best;
    }

    function playAudio() {
      if (!audio || state.audioFailed || !state.audioReady) { playTTS(); return; }
      if (state.playing) { audio.pause(); return; }
      const s = sentence();
      let start = s.start || 0;
      let end = s.end;
      if (state.scope === 'section') {
        start = section().startTime == null ? 0 : section().startTime;
        end = section().endTime;
      } else if (state.scope === 'full') {
        start = 0;
        end = null;
      }
      state.stopAt = end == null ? null : end;
      if (Math.abs(audio.currentTime - start) > 0.4 && (state.scope !== 'sentence' || audio.currentTime < start || audio.currentTime > (end || Infinity))) {
        try { audio.currentTime = start; } catch (e) { /* noop */ }
      }
      audio.playbackRate = state.rate;
      audio.play().catch(function () {
        setStatus('浏览器拦截了播放，请再点一次播放。', true);
      });
    }

    function playTTS() {
      if (!C.speech.supported) { C.toast('当前浏览器不支持语音合成，也无法加载真题音频', 'bad'); return; }
      if (state.playing) { stopAll(); return; }
      if (state.mode === 'quiz') {
        C.toast('合成语音不包含题目音频，做题模式请使用真题音频或本地音频', 'info', 3200);
        return;
      }
      stopTTS();
      state.playing = true;
      state.stopAt = null;
      const token = ++state.ttsToken;
      const startIdx = state.scope === 'full' ? 0 : state.scope === 'section' ? (section().startIdx || 0) : state.current;
      const endIdx = state.scope === 'full' ? set.sentences.length - 1 : state.scope === 'section' ? (section().endIdx || set.sentences.length - 1) : state.current;
      state.current = startIdx;
      updateSentence();
      let i = startIdx;
      function next() {
        if (token !== state.ttsToken) return;
        if (i > endIdx) {
          state.playing = false; updatePlayIcon(); updateSentence(); return;
        }
        state.current = i;
        state.showEn = state.mode === 'study' ? state.showEn : true;
        updateSentence();
        C.speech.speak(set.sentences[i].en, { rate: state.rate }).then(function () {
          if (token !== state.ttsToken) return;
          if (state.mode === 'study' && state.scope === 'sentence' && state.loop) {
            setTimeout(next, 450);
            return;
          }
          i++;
          setTimeout(next, 300);
        });
      }
      next();
      updatePlayIcon();
    }

    function stopTTS() {
      state.ttsToken++;
      C.speech.stop();
    }

    function stopAll() {
      if (audio) { try { audio.pause(); } catch (e) { /* noop */ } }
      stopTTS();
      state.playing = false;
      state.stopAt = null;
      updatePlayIcon();
    }

    function setCurrent(idx, play) {
      const wasPlaying = state.playing;
      stopAll();
      state.current = C.clamp(idx, 0, set.sentences.length - 1);
      const s = sentence();
      if (audio && state.audioReady && s.start != null) {
        try { audio.currentTime = s.start; } catch (e) { /* noop */ }
      }
      updateSentence();
      if (play || wasPlaying) playAudio();
    }

    function setSection(idx) {
      stopAll();
      state.sectionIdx = C.clamp(idx, 0, set.sections.length - 1);
      state.current = section().startIdx;
      const s = sentence();
      if (audio && state.audioReady && s.start != null) {
        try { audio.currentTime = s.start; } catch (e) { /* noop */ }
      }
      updateSentence();
      renderQuestions();
    }

    function renderQuestions() {
      if (!questionsHost) return;
      const list = questionsForView();
      const quizSubmitted = state.submitted;
      const audioBlocked = state.mode === 'quiz' && state.audioFailed;
      const audioLoading = state.mode === 'quiz' && !state.audioReady && !state.audioFailed;
      const answeredCount = set.questions.filter(function (q) { return state.answers[q.id] !== undefined; }).length;
      let html = '';
      if (audioBlocked) {
        html += '<div class="real-audio-error">' + C.icon('alert', 15) + '<div><b>做题模式需要真题音频</b><p>题目问句只存在于录音里，合成语音无法替代。请检查网络后重试，或载入你下载的真题音频；也可以先切回“逐句精听”。</p><div class="row mt-1"><button class="btn btn-sm" data-real-retry>重试音频</button><label class="btn btn-sm" for="real-audio-file">载入本地音频</label><a class="btn btn-sm btn-ghost" href="' + realIdLink(set) + '&mode=study">去逐句精听</a></div></div></div>';
      } else if (audioLoading) {
        html += '<div class="notice mb-2">' + C.icon('clock', 14) + '<span>正在加载真题音频并准备本题音频…请稍等；如果网络较慢，可先检查网络或使用“载入本地音频”。</span></div>';
      }
      const qCountEl = view.querySelector('#real-q-count');
      if (qCountEl) qCountEl.textContent = list.length + ' 题';
      if (state.mode === 'quiz' && !state.submitted) {
        html += '<div class="real-quiz-head"><div><b>全卷 ' + set.questions.length + ' 题</b><span class="small muted"> · 播放本节/全卷，听清题目后再选</span></div><span class="badge ' + (answeredCount === set.questions.length ? 'badge-jade' : '') + '">已答 ' + answeredCount + ' / ' + set.questions.length + '</span></div>';
      }
      let lastSection = '';
      list.forEach(function (q) {
        if (state.mode === 'quiz' && q.section && q.section !== lastSection) {
          html += '<div class="real-q-section">' + C.esc(sectionLabel(q.section)) + '</div>';
          lastSection = q.section;
        }
        const picked = state.answers[q.id];
        const answered = picked !== undefined;
        const showFeedback = answered && (state.mode === 'study' || quizSubmitted);
        const ok = picked === q.answer;
        const options = q.options.map(function (o, oi) {
          let cls = 'option';
          if (answered && oi === picked) cls += ' selected';
          if (showFeedback && oi === q.answer) cls += ' correct';
          else if (showFeedback && oi === picked) cls += ' wrong';
          return '<button class="' + cls + '" data-real-opt="' + q.id + '" data-opt-index="' + oi + '"' + ((quizSubmitted || state.mode === 'study' && answered || audioBlocked || audioLoading) ? ' disabled' : '') + '><span class="k">' + C.esc(o.letter) + '</span><span>' + C.esc(o.text) + '</span></button>';
        }).join('');
        html += '<div class="q-card real-q" data-real-qid="' + q.id + '"><div class="q-head"><span class="q-no">Q' + q.number + '</span><div class="q-text">' + (state.mode === 'quiz' ? '题目在真题音频中播报' : '听录音中的问句，选择最合适的选项') + '</div><span class="q-type">' + C.esc(sectionLabel(q.section)) + '</span></div>' +
          '<div class="option-list">' + options + '</div>' +
          (showFeedback ? '<div class="q-result ' + (ok ? 'good' : 'bad') + '">' + C.icon(ok ? 'check-circle' : 'x-circle', 12) + (ok ? '正确' : '正确答案：' + C.esc(q.options[q.answer].letter)) + (q.evidence !== null ? ' · 有原文依据' : ' · 暂无依据标注') + '</div>' +
            '<div class="explain">' + (q.evidenceEn ? '<b>依据句：</b>' + C.esc(q.evidenceEn) + (q.evidenceZh ? '<br><span class="small muted">' + C.esc(q.evidenceZh) + '</span>' : '') : '本题暂无人工依据标注，请回听本节。') + '</div>' : '') +
          '</div>';
      });
      if (state.mode === 'quiz' && !state.submitted) {
        html += '<div class="real-quiz-foot"><button class="btn btn-primary" data-real-submit' + ((audioBlocked || audioLoading) ? ' disabled' : '') + '>交卷并看答案</button><span class="small muted">交卷后记录本套成绩；未答题目会算错。</span></div>';
      }
      if (state.mode === 'study') {
        const secQs = set.questions.filter(inSection);
        const secAns = secQs.filter(function (q) { return state.answers[q.id] !== undefined; });
        const secOk = secQs.filter(function (q) { return state.answers[q.id] === q.answer; }).length;
        if (secAns.length === secQs.length && secQs.length) {
          html += '<div class="reading-result"><div class="rs-score">' + secOk + ' / ' + secQs.length + '</div><div class="small muted">本节答案正确 · 进入下一节，或用“做题模式”完成全卷</div><div class="spacer"></div><button class="btn btn-sm" data-real-next-section>下一节 ' + C.icon('arrow-right', 12) + '</button></div>';
        } else {
          html += '<div class="real-q-foot small muted">本节 ' + secAns.length + ' / ' + secQs.length + ' 已答 · 先在音频里听到题目再选；逐句模式不会播放题目。</div>';
        }
      }
      questionsHost.innerHTML = html;
    }

    /* ---------- Events ---------- */
    function bindPlayer() {
      setupAudio();
      if (audio) {
        audio.addEventListener('timeupdate', function () { updateTimeUI(); });
      }
      view.querySelectorAll('[data-real-play]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (state.playing) { stopAll(); return; }
          if (state.audioReady && !state.audioFailed) playAudio(); else playTTS();
        });
      });
      view.querySelectorAll('[data-real-prev]').forEach(function (b) { b.addEventListener('click', function () { setCurrent(state.current - 1, false); }); });
      view.querySelectorAll('[data-real-next]').forEach(function (b) { b.addEventListener('click', function () { setCurrent(state.current + 1, false); }); });
      const loop = view.querySelector('#real-loop');
      if (loop) loop.addEventListener('change', function () { state.loop = loop.checked; });
      const showEn = view.querySelector('#real-show-en');
      if (showEn) showEn.addEventListener('change', function () { state.showEn = showEn.checked; updateSentence(); });
      const showZh = view.querySelector('#real-show-zh');
      if (showZh) showZh.addEventListener('change', function () { state.showZh = showZh.checked; updateSentence(); if (state.showTranscript) updateTranscript(); });
      const trBtn = view.querySelector('#real-toggle-transcript');
      if (trBtn) trBtn.addEventListener('click', function () {
        state.showTranscript = !state.showTranscript;
        const box = view.querySelector('#real-transcript-card');
        if (box) box.hidden = !state.showTranscript;
        if (state.showTranscript) { updateTranscript(); const act = transcriptHost.querySelector('.real-tline.active'); if (act) act.scrollIntoView({ block: 'nearest' }); }
      });
      view.querySelectorAll('[data-real-rate]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.rate = Number(b.dataset.realRate);
          view.querySelectorAll('[data-real-rate]').forEach(function (x) { x.classList.toggle('active', x === b); });
          if (audio) audio.playbackRate = state.rate;
        });
      });
      view.querySelectorAll('[data-scope]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.scope = b.dataset.scope;
          view.querySelectorAll('[data-scope]').forEach(function (x) { x.classList.toggle('active', x === b); });
          const secLabel = view.querySelector('#scope-hint');
          if (secLabel) secLabel.textContent = state.scope === 'sentence' ? '播当前句（含循环）' : state.scope === 'section' ? '播本节（含题目）' : '从开头播全卷';
          if (state.playing) { stopAll(); playAudio(); }
        });
      });
      const seek = view.querySelector('#real-seek');
      if (seek) seek.addEventListener('input', function () {
        if (!audio || !state.audioReady) return;
        const dur = isFinite(audio.duration) ? audio.duration : state.audioDuration;
        audio.currentTime = (Number(seek.value) / 1000) * dur;
      });
      const sectionSelect = view.querySelector('#real-section-select');
      if (sectionSelect) sectionSelect.addEventListener('change', function () { setSection(Number(sectionSelect.value)); });
      view.querySelectorAll('[data-real-section]').forEach(function (b) {
        b.addEventListener('click', function () { setSection(Number(b.dataset.realSection)); });
      });
      const upload = view.querySelector('#real-audio-file');
      if (upload) upload.addEventListener('change', function () {
        const f = upload.files && upload.files[0];
        if (!f || !audio) return;
        if (state.localUrl) URL.revokeObjectURL(state.localUrl);
        state.localUrl = URL.createObjectURL(f);
        audio.src = state.localUrl;
        state.audioFailed = false;
        state.audioReady = false;
        setStatus('正在载入本地音频…', false);
        audio.load();
        C.toast('已载入本地音频；若与原卷音频一致，时间轴可同步。', 'good', 3000);
      });
      const retry = view.querySelector('[data-real-retry]');
      if (retry) retry.addEventListener('click', function () {
        if (!audio) return;
        state.audioFailed = false;
        state.audioReady = false;
        audio.src = set.audioUrl;
        audio.load();
        setStatus('正在重试真题音频…', false);
      });
      view.querySelectorAll('[data-real-guide]').forEach(function (b) {
        b.addEventListener('click', function () {
          const kind = b.dataset.realGuide;
          if (kind === 'blind') {
            state.showEn = false; state.showZh = false; state.showTranscript = false;
            const e1 = view.querySelector('#real-show-en'); if (e1) e1.checked = false;
            const e2 = view.querySelector('#real-show-zh'); if (e2) e2.checked = false;
            state.scope = 'section';
            view.querySelectorAll('[data-scope]').forEach(function (x) { x.classList.toggle('active', x.dataset.scope === 'section'); });
            updateSentence();
            if (state.audioReady) playAudio(); else playTTS();
          } else if (kind === 'sentence') {
            state.scope = 'sentence';
            state.showEn = true; state.showZh = true;
            const e1 = view.querySelector('#real-show-en'); if (e1) e1.checked = true;
            const e2 = view.querySelector('#real-show-zh'); if (e2) e2.checked = true;
            view.querySelectorAll('[data-scope]').forEach(function (x) { x.classList.toggle('active', x.dataset.scope === 'sentence'); });
            updateSentence(); updateTranscript();
          } else if (kind === 'quiz') {
            C.app.navigate(realIdLink(set) + '&mode=quiz');
          } else if (kind === 'words') {
            const kw = view.querySelector('#real-keywords');
            if (kw) kw.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      });
      const kwSpeak = view.querySelector('[data-speak-keywords]');
      if (kwSpeak) kwSpeak.addEventListener('click', function () {
        if (!C.speech.supported) return;
        let i = 0;
        const next = function () {
          if (i >= set.keyWords.length) return;
          C.speech.speak(set.keyWords[i++].word, { rate: 0.85 }).then(function () { setTimeout(next, 180); });
        };
        next();
      });
      const shadow = view.querySelector('[data-real-shadow]');
      if (shadow) shadow.addEventListener('click', function () { shadowCurrent(); });
      sentenceHost.addEventListener('click', function (e) {
        const b = e.target.closest('[data-word]');
        if (b) { e.stopPropagation(); lookupWord(b.dataset.word); }
      });
      if (transcriptHost) transcriptHost.addEventListener('click', function (e) {
        const line = e.target.closest('[data-tidx]');
        if (line) setCurrent(Number(line.dataset.tidx), state.playing);
      });
      const dictCheck = view.querySelector('[data-dict-check]');
      if (dictCheck) dictCheck.addEventListener('click', function () {
        const input = view.querySelector('#real-dict-input');
        const fb = view.querySelector('#real-dict-feedback');
        if (!input || !fb) return;
        const diff = C.speech.diffWords(sentence().en, input.value.trim());
        fb.innerHTML = '<div class="dict-diff">' + C.speech.diffHTML(diff) + '</div><div class="small muted mt-1">词级准确率 <b>' + diff.accuracy + '%</b> · 漏 ' + diff.missing + ' · 多 ' + diff.extra + '</div>';
      });
      questionsHost.addEventListener('click', function (e) {
        const opt = e.target.closest('[data-real-opt]');
        if (opt) {
          e.preventDefault();
          answerQuestion(opt.dataset.realOpt, Number(opt.dataset.optIndex));
          return;
        }
        if (e.target.closest('[data-real-submit]')) { submitQuiz(); return; }
        if (e.target.closest('[data-real-next-section]')) {
          if (state.sectionIdx < set.sections.length - 1) { setSection(state.sectionIdx + 1); window.scrollTo({ top: view.querySelector('#real-player').offsetTop - 90, behavior: 'smooth' }); }
          return;
        }
      });
      const secSelect = view.querySelector('#real-section-select');
      if (secSelect) secSelect.value = String(state.sectionIdx);
      updateSentence();
      if (state.showTranscript) updateTranscript();
      updateSectionUI();
    }

    function answerQuestion(qid, idx) {
      if (state.submitted) return;
      const q = set.questions.find(function (x) { return x.id === qid; });
      if (!q || state.answers[qid] !== undefined) return;
      if (state.mode === 'quiz' && (state.audioFailed || !state.audioReady)) {
        C.toast('真题音频未就绪，先重试或载入本地音频', 'info', 2600);
        return;
      }
      state.answers[qid] = idx;
      if (state.mode === 'study') {
        if (idx !== q.answer) addRealError(q, q.options[idx].text);
        renderQuestions();
      } else {
        renderQuestions();
      }
    }

    function addRealError(q, yourText) {
      if (state.addedErrors.has(q.id)) return;
      state.addedErrors.add(q.id);
      S.addError({
        module: 'listening', sourceId: q.id + '-real', title: set.title,
        prompt: '真题听力 Q' + q.number + '（题干在音频中）',
        your: yourText || '未作答', correct: q.options[q.answer].text,
        cause: '未分类',
        explain: (q.evidenceEn ? '原文依据：' + q.evidenceEn + (q.evidenceZh ? ' / ' + q.evidenceZh : '') : '本题暂无人工依据标注。'),
        link: realIdLink(set) + '&mode=study'
      });
    }

    function submitQuiz() {
      if (state.submitted) return;
      const unanswered = set.questions.filter(function (q) { return state.answers[q.id] === undefined; }).length;
      C.confirmDialog({
        title: unanswered ? '还有 ' + unanswered + ' 题未答' : '确认交卷？',
        message: unanswered ? '未答题按错误计算。交卷后会记录本套成绩并显示所有原文依据。' : '交卷后会记录本套成绩并显示所有原文依据。',
        confirmText: '交卷'
      }).then(function (ok) {
        if (!ok) return;
        state.submitted = true;
        stopAll();
        const correct = set.questions.filter(function (q) { return state.answers[q.id] === q.answer; }).length;
        set.questions.forEach(function (q) { if (state.answers[q.id] !== q.answer) addRealError(q, state.answers[q.id] !== undefined ? q.options[state.answers[q.id]].text : '未作答'); });
        S.recordListening(set.id, correct, set.questions.length);
        const mins = Math.max(1, Math.round((Date.now() - state.startedAt) / 60000));
        S.logStudy('listening', mins, 1, 20);
        state.logged = true;
        addQuizScore(correct);
        renderQuestions();
        C.toast('本套完成：' + correct + ' / ' + set.questions.length, correct >= 15 ? 'good' : 'info');
        C.app.refreshShell();
      });
    }

    function addQuizScore(correct) {
      const scoreHost = view.querySelector('#real-quiz-score') || (function () {
        const el = document.createElement('div');
        el.id = 'real-quiz-score';
        questionCard.insertBefore(el, questionCard.querySelector('#real-questions'));
        return el;
      })();
      scoreHost.innerHTML = '<div class="score-bar"><div><div class="big">' + correct + ' / ' + set.questions.length + '</div><div class="small muted">本套正确率 ' + Math.round((correct / set.questions.length) * 100) + '% · 已记录最佳成绩</div></div><div class="spacer"></div><a class="btn btn-sm" href="#/errors">看错题</a></div>';
    }

    function lookupWord(word) {
      const w = String(word || '').toLowerCase();
      const d = (C.data.listeningDict && C.data.listeningDict[w]) || null;
      const fv = (C.data.fullVocab || []).find(function (x) { return x.word.toLowerCase() === w; });
      const v = (C.data.vocab || []).find(function (x) { return x.word.toLowerCase() === w; });
      const zh = d ? d.z : (fv ? fv.zh : (v ? v.senses[0].zh : ''));
      const ph = d ? d.p : (fv ? fv.phonetic : (v ? v.phonetic : ''));
      const pos = d ? d.pos : (fv ? fv.pos : (v ? v.pos : ''));
      if (!zh) { C.toast('这个词未收录在词典里，先听发音', 'info', 1800); if (C.speech.supported) C.speech.speak(w); return; }
      const link = v ? '<a class="btn btn-sm btn-primary" href="#/vocab?word=' + v.id + '" data-word-link>打开词条</a>' : '';
      const dialog = C.openModal({
        title: w, sub: (ph || '') + ' · ' + (pos || ''), size: 'narrow',
        body: '<p style="font-size:15px">' + C.esc(zh) + '</p>' +
          '<div class="notice mt-2">' + C.icon('info', 14) + '<span>来自真题听力词典；这里只显示核心释义。点开词条可看搭配、例句和记忆状态。</span></div>' +
          '<div class="row mt-2"><button class="btn btn-sm" data-lookup-speak>发音</button>' + link + '</div>',
        actions: [{ label: '关闭' }],
        onMount: function (modalEl) {
          const sp = modalEl.querySelector('[data-lookup-speak]');
          if (sp) sp.addEventListener('click', function () { C.speech.speak(w); });
          const a = modalEl.querySelector('[data-word-link]');
          if (a) a.addEventListener('click', function () { dialog.close(); });
        }
      });
    }

    function shadowCurrent() {
      if (!C.speech.recognitionSupported) { C.toast('当前浏览器不支持语音识别，请使用 Chrome 或 Edge', 'bad', 3200); return; }
      stopAll();
      const target = sentence().en;
      C.toast('请朗读当前句，正在聆听…', 'info', 2200);
      C.speech.recognize({ timeout: 15000 }).then(function (heard) {
        if (!view.isConnected) return;
        const review = C.speech.pronunciationReview(target, heard);
        C.openModal({
          title: '跟读评测', sub: '当前句 · 词级识别参考', size: 'narrow',
          body: '<div class="row" style="gap:16px;align-items:center"><div class="session-score num">' + review.score + '<small>%</small></div><div class="small muted">词级匹配参考<br>不是专业发音评分</div></div>' +
            '<div class="divider-dashed"></div><div class="small muted">识别到的内容</div><p style="font-family:var(--serif);font-size:14px">' + (heard ? C.esc(heard) : '（没有识别到内容）') + '</p>' +
            '<div class="small muted">目标句</div><p style="font-family:var(--serif);font-size:14px">' + C.esc(target) + '</p>' +
            '<div class="dict-diff">' + C.speech.diffHTML(C.speech.diffWords(target, heard)) + '</div>' +
            '<div class="notice mt-2">' + C.icon('info', 14) + '<span>受麦克风、口音和网络影响；这里只检查“是否读全了”，不是发音分。</span></div>',
          actions: [{ label: '关闭' }]
        });
      }).catch(function (err) { if (view.isConnected) C.toast(err.message, 'bad', 3800); });
    }

    bindPlayer();
    renderQuestions();
    if (state.showTranscript) updateTranscript();
    return function () {
      stopAll();
      if (state.localUrl) URL.revokeObjectURL(state.localUrl);
      if (state.answers && Object.keys(state.answers).length && !state.logged) {
        const mins = Math.max(1, Math.round((Date.now() - state.startedAt) / 60000));
        S.logStudy('listening', mins, 1, 0);
      }
    };
  }

  /* ================= HTML fragments ================= */
  function studyGuideHTML(set) {
    return '<div class="card real-guide mb-2"><div class="row-between" style="flex-wrap:wrap;gap:8px"><div><div class="card-kicker">GUIDED LISTENING</div><div class="card-title">先听，再看；一次只处理一节</div><div class="card-sub">本套有 ' + set.sections.length + ' 节。不要一上来做 25 题。</div></div><div class="row" style="gap:6px"><button class="btn btn-sm" data-real-guide="blind">' + C.icon('headphones', 13) + '盲听本节</button><button class="btn btn-sm" data-real-guide="sentence">逐句精听</button><button class="btn btn-sm btn-ghost" data-real-guide="quiz">去做题 →</button></div></div>' +
      '<div class="real-steps">' +
        '<div class="real-step"><span class="real-step-no">01</span><b>看关键词</b><p>右侧 10 个词，先点发音；不会的词先查。</p></div>' +
        '<div class="real-step"><span class="real-step-no">02</span><b>盲听本节</b><p>关掉原文和中文，只播放这一节；抓场景、人物和态度。</p></div>' +
        '<div class="real-step"><span class="real-step-no">03</span><b>逐句</b><p>0.6–0.75x 循环当前句；先听再看英文，最后看中文。</p></div>' +
        '<div class="real-step"><span class="real-step-no">04</span><b>做题</b><p>题目在音频中；切到“本节”或“全卷”播放后再选。</p></div>' +
      '</div></div>';
  }

  function quizGuideHTML(set) {
    return '<div class="notice mb-2">' + C.icon('timer', 14) + '<span>做题模式：播放<strong>本节</strong>或<strong>全卷</strong>，题目问句在真题音频里；逐句播放不会听到题目。建议先盲听，再作答。</span></div>';
  }

  function playerHTML(set, state) {
    return '<div class="card real-player" id="real-player">' +
      '<div class="card-head"><div><div class="card-kicker">EXAM AUDIO · ' + C.esc(set.session) + '</div><div class="card-title">真题录音</div><div class="card-sub" id="real-audio-status">正在加载真题音频…</div></div><div class="row" style="gap:6px"><span class="badge badge-jade">真题 · CC BY</span><span class="badge">在线流播</span></div></div>' +
      '<audio id="real-audio" preload="metadata" src="' + C.esc(set.audioUrl) + '"></audio>' +
      '<input type="file" id="real-audio-file" accept="audio/*" hidden>' +
      '<div class="real-section-row"><div class="row" style="gap:6px;flex-wrap:wrap" id="real-section-chip">' +
        set.sections.map(function (s, i) { return '<button class="chip' + (i === 0 ? ' active' : '') + '" data-real-section="' + i + '">' + C.esc(sectionLabel(s.name)) + '</button>'; }).join('') +
      '</div><select class="select" id="real-section-select" aria-label="选择小节">' + set.sections.map(function (s, i) { return '<option value="' + i + '">' + C.esc(sectionLabel(s.name)) + '</option>'; }).join('') + '</select></div>' +
      '<div class="real-controls"><div class="row">' +
        '<button class="icon-btn" data-real-prev aria-label="上一句">' + C.icon('back', 15) + '</button>' +
        '<button class="play-btn" data-real-play aria-label="播放">' + C.icon('play', 18) + '</button>' +
        '<button class="icon-btn" data-real-next aria-label="下一句">' + C.icon('forward', 15) + '</button>' +
        '<span class="real-time mono"><span id="real-time">00:00</span><span class="faint"> / </span><span id="real-time-total">' + fmt(set.durationSec) + '</span></span>' +
      '</div><div class="row" style="gap:10px;flex-wrap:wrap">' +
        '<div class="seg seg-sm real-scope" id="real-scope">' +
          '<button data-scope="sentence" class="' + (state.scope === 'sentence' ? 'active' : '') + '">逐句</button>' +
          '<button data-scope="section" class="' + (state.scope === 'section' ? 'active' : '') + '">本节</button>' +
          '<button data-scope="full" class="' + (state.scope === 'full' ? 'active' : '') + '">全卷</button>' +
        '</div>' +
        '<div class="seg seg-sm speed-seg">' + RATES.map(function (r) { return '<button data-real-rate="' + r + '" class="' + (r === 1 ? 'active' : '') + '">' + r + 'x</button>'; }).join('') + '</div>' +
        '<label class="toggle"><input type="checkbox" id="real-loop"' + (state.loop ? ' checked' : '') + '><span class="track"></span><span>循环</span></label>' +
      '</div></div>' +
      '<input class="real-seek" type="range" id="real-seek" min="0" max="1000" value="0" aria-label="音频进度">' +
      '<div class="real-sentence" id="real-sentence"></div>' +
      '<div class="toggles real-toggles">' +
        '<label class="toggle"><input type="checkbox" id="real-show-en"' + (state.showEn ? ' checked' : '') + '><span class="track"></span><span>英文</span></label>' +
        '<label class="toggle"><input type="checkbox" id="real-show-zh"' + (state.showZh ? ' checked' : '') + '><span class="track"></span><span>中文</span></label>' +
        '<button class="btn btn-sm btn-ghost" id="real-toggle-transcript">' + C.icon('file-text', 13) + '原文</button>' +
        '<button class="btn btn-sm btn-ghost" data-real-shadow>' + C.icon('mic', 13) + '跟读</button>' +
        '<label class="btn btn-sm btn-ghost" for="real-audio-file">' + C.icon('upload', 13) + '本地音频</label>' +
        '<button class="btn btn-sm btn-ghost" data-real-guide="words">' + C.icon('volume', 13) + '关键词</button>' +
      '</div>' +
      '<div class="real-scope-hint small faint" id="scope-hint">' + (state.scope === 'sentence' ? '播当前句（含循环）' : state.scope === 'section' ? '播本节（含题目）' : '从开头播全卷') + '</div>' +
      '<div class="notice mt-2 real-audio-note">' + C.icon('info', 14) + '<span>题目问句在音频中；卷面只有选项。音频来自公开真题资源，网络受限时可载入你本地下载的音频。</span></div>' +
      '</div>';
  }

  function transcriptHTML(set, state) {
    return '<div class="card" id="real-transcript-card" hidden><div class="row-between mb-2"><div><div class="card-title" style="font-size:17px">原文与中译</div><div class="card-sub">点击任意句可跳转；中文为机器翻译</div></div><span class="badge">' + set.sentences.length + ' 句</span></div><div class="real-transcript" id="real-transcript"></div></div>';
  }

  function dictationHTML(set) {
    return '<details class="card real-dictation"><summary>' + C.icon('type', 14) + '听写当前句（可选）</summary><div class="mt-2"><textarea class="dict-input" id="real-dict-input" placeholder="写下你听到的当前句…"></textarea><div class="row mt-1"><button class="btn btn-sm btn-primary" data-dict-check>检查</button><span class="small faint">按词级差异对照；不记录成绩</span></div><div id="real-dict-feedback"></div></div></details>';
  }

  function keyWordsHTML(set) {
    return '<div class="card" id="real-keywords"><div class="card-head"><div><div class="card-kicker">PRE-LISTEN</div><div class="card-title">先看 10 个词</div><div class="card-sub">点词发音；知道要听什么，再开始</div></div><button class="btn btn-sm btn-ghost" data-speak-keywords>' + C.icon('volume', 12) + '连读</button></div>' +
      '<div class="real-keywords">' + set.keyWords.map(function (k) {
        return '<div class="real-keyword"><button data-speak="' + C.esc(k.word) + '"><b>' + C.esc(k.word) + '</b><span class="mono">' + C.esc(k.phonetic || '') + '</span><small>' + C.esc(k.zh || '') + '</small></button>' + (k.id ? '<a class="icon-mini" href="#/vocab?word=' + k.id + '" aria-label="词条">' + C.icon('arrow-up-right', 12) + '</a>' : '') + '</div>';
      }).join('') + '</div></div>';
  }

  function questionsFrameHTML(set, state) {
    return '<div class="card-head"><div><div class="card-kicker">QUESTIONS</div><div class="card-title">' + (state.mode === 'quiz' ? '全卷题目' : '本节题目') + '</div><div class="card-sub">' + (state.mode === 'quiz' ? '25 题 · 题目在音频中播报 · 交卷后统一看依据' : '当前小节 · 选完即看依据，不猜答案') + '</div></div><span class="badge" id="real-q-count">' + set.questions.length + ' 题</span></div><div id="real-questions"></div>';
  }

  function sourceCardHTML() {
    return '<div class="card card--soft real-source-card"><div class="card-kicker">SOURCE & LICENSE</div><div class="small muted mt-1">真题原文、选项与答案来自公开的六级听力资源数据集（数据源声明 CC BY 4.0）；本站做逐句切分、依据句对齐、选项清理与学习界面。音频通过上游镜像流式播放，未内置；中译为上游机器翻译。</div><div class="row mt-2" style="flex-wrap:wrap"><a class="btn btn-sm" href="https://github.com/getfine333-ux/cet6-listening-study" target="_blank" rel="noopener">数据镜像</a><a class="btn btn-sm" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a><a class="btn btn-sm" href="https://doi.org/10.5281/zenodo.20474009" target="_blank" rel="noopener">Zenodo</a></div></div>';
  }

  C.realListening = { renderHub: renderHub, renderWords: renderWords, renderSet: renderSet };
})();
