/* Vocabulary — browse, Ebbinghaus review, confusables, collocations */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;

  const TIER_LABEL = { basic: '大纲基础', core: '六级高频', shift: '熟词生义', advanced: '高阶阅读', listening: '听力高频' };
  const STATUS_LABEL = { new: '新词', learning: '学习中', due: '待复习', mastered: '已掌握' };
  const MODE_LABEL = { listen: '听音辨义', spell: '拼写测试', cloze: '看句填空' };
  const IRREGULAR = { bear: 'borne', arise: 'arose', rise: 'rose', write: 'written', see: 'seen', take: 'taken' };

  function tierBadge(tier) {
    return '<span class="badge badge-' + C.esc(tier) + '">' + C.esc((C.data.vocabTiers.find(function (t) { return t.id === tier; }) || {}).short || tier) + '</span>';
  }

  function statusDot(status) {
    const color = status === 'mastered' ? 'var(--success)' : status === 'due' ? 'var(--gold)' : status === 'learning' ? 'var(--blue)' : 'var(--faint)';
    return '<span class="status-dot" style="background:' + color + '"></span>' + STATUS_LABEL[status];
  }

  function speakWord(text) {
    if (!C.speech.supported) { C.toast('当前浏览器不支持语音合成', 'bad'); return; }
    C.speech.speak(text);
  }

  function charFeedback(target, typed) {
    const a = String(target || '').toLowerCase();
    const b = String(typed || '').toLowerCase();
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    const targetHtml = C.esc(a.slice(0, i)) + (i < a.length ? '<span class="miss">' + C.esc(a.slice(i)) + '</span>' : '');
    const typedHtml = C.esc(b.slice(0, i)) + (i < b.length ? '<span class="extra">' + C.esc(b.slice(i)) + '</span>' : '');
    return { prefix: i, targetHtml: targetHtml, typedHtml: typedHtml };
  }

  function blankExample(word) {
    const example = word.example && word.example.en ? word.example.en : '';
    const forms = [word.word];
    if (IRREGULAR[word.word]) forms.push(IRREGULAR[word.word]);
    let re = new RegExp('\\b(' + forms.map(C.escapeRegExp).join('|') + ')(?:s|es|ed|ing|d)?\\b', 'i');
    let m = example.match(re);
    if (!m) {
      const alt = new RegExp('\\b' + C.escapeRegExp(word.word) + '\\w{0,3}\\b', 'i');
      m = example.match(alt);
    }
    if (!m) return { ok: false, sentence: example, before: '', after: '' };
    const start = m.index;
    const end = m.index + m[0].length;
    return { ok: true, before: example.slice(0, start), after: example.slice(end), full: example };
  }

  function renderWordCard(w) {
    const st = S.wordStatus(w.id);
    const meaning = (w.senses || []).map(function (s) { return s.zh; }).join('；');
    return '<article class="word-card" data-word-id="' + w.id + '" tabindex="0" role="button" aria-label="查看 ' + C.esc(w.word) + '">' +
      '<div class="word-card-top"><div><div class="word">' + C.esc(w.word) + '<small>' + C.esc(w.pos) + '</small></div>' +
      '<div class="phonetic">' + C.esc(w.phonetic) + '</div></div>' + tierBadge(w.tier) + '</div>' +
      '<div class="word-meaning">' + C.esc(C.truncate(meaning, 54)) + '</div>' +
      '<div class="word-example">' + C.esc(C.truncate(w.example ? w.example.en : '', 112)) + '</div>' +
      '<div class="word-foot"><span class="word-status">' + statusDot(st) + '</span>' +
      '<div class="word-actions"><button class="icon-mini" data-speak="' + C.esc(w.word) + '" title="发音" aria-label="播放发音">' + C.icon('volume', 14) + '</button>' +
      '<button class="icon-mini" data-open="' + w.id + '" title="查看词条" aria-label="查看词条">' + C.icon('arrow-up-right', 14) + '</button></div></div>' +
      '</article>';
  }

  function openDetail(view, ctx, id) {
    const w = C.data.vocab.find(function (x) { return x.id === id; });
    if (!w) return;
    const rec = S.wordRecord(id);
    const st = S.wordStatus(id);
    const pairs = (C.data.confusablePairs || []).filter(function (p) {
      return p.a.word.toLowerCase() === w.word.toLowerCase() || p.b.word.toLowerCase() === w.word.toLowerCase();
    });
    const related = (w.confusables || []).map(function (c) {
      return '<div class="confuse-box"><b>' + C.esc(c.word) + '</b> · ' + C.esc(c.note) + '</div>';
    }).join('');
    let html = '<div class="word-detail"><div>' +
      '<div class="wd-head"><div><div class="wd-word">' + C.esc(w.word) + '</div>' +
      '<div class="phonetic" style="font-size:11px;margin-top:6px">' + C.esc(w.phonetic) + ' · ' + C.esc(w.pos) + ' · ' + C.esc(TIER_LABEL[w.tier]) + '</div></div>' +
      '<button class="btn btn-sm" data-speak="' + C.esc(w.word) + '">' + C.icon('volume', 13) + '发音</button></div>' +
      '<div class="divider"></div>' +
      '<div>' + (w.senses || []).map(function (s) {
        return '<div class="sense"><span class="pos">' + C.esc(w.pos) + '</span><div><div class="zh">' + C.esc(s.zh) + '</div>' + (s.en ? '<div class="en">' + C.esc(s.en) + '</div>' : '') + '</div></div>';
      }).join('') + '</div>' +
      (w.example ? '<div class="example-box"><div class="en">' + C.esc(w.example.en) + '</div><div class="zh">' + C.esc(w.example.zh) + '</div><div class="src">' + C.esc(w.example.src || '原创仿真例句 · CET-6 风格') + '</div></div>' : '') +
      (w.listeningExample && (!w.example || w.example.en !== w.listeningExample.en) ? '<div class="example-box" style="border-left-color:var(--jade)"><div class="en">' + C.esc(w.listeningExample.en) + '</div><div class="zh">' + C.esc(w.listeningExample.zh) + '</div><div class="src">' + C.esc(w.listeningExample.src || 'CET6 真题听力原文（CC BY 4.0）') + '</div></div>' : '') +
      (w.shiftNote ? '<div class="notice accent mt-2">' + C.icon('lightbulb', 14) + '<span>' + C.esc(w.shiftNote) + '</span></div>' : '') +
      (w.collocations && w.collocations.length ? '<div class="mt-3"><div class="field-label">高频搭配</div><div class="colloc-list mt-1">' + w.collocations.map(function (c) { return '<span class="colloc-pill">' + C.esc(c) + '</span>'; }).join('') + '</div></div>' : '') +
      (w.synonyms && w.synonyms.length ? '<div class="mt-2"><div class="syn-row"><b>近义</b><span>' + C.esc(w.synonyms.join(' · ')) + '</span></div>' +
        (w.antonyms ? '<div class="syn-row"><b>反义</b><span>' + C.esc(w.antonyms.join(' · ')) + '</span></div>' : '') +
        (w.root ? '<div class="syn-row"><b>词根</b><span>' + C.esc(w.root) + '</span></div>' : '') + '</div>' : '') +
      (related ? '<div class="mt-2">' + related + '</div>' : '') +
      (pairs.length ? '<div class="mt-2">' + pairs.map(function (p) {
        return '<div class="confuse-box"><b>' + C.esc(p.a.word) + ' vs ' + C.esc(p.b.word) + '</b><br>' + C.esc(p.note) + '</div>';
      }).join('') + '</div>' : '') +
      '</div><aside>' +
        '<div class="card card--soft" style="padding:16px">' +
          '<div class="card-kicker">MEMORY STATE</div>' +
          '<div class="row-between mt-1"><b>' + statusDot(st) + '</b><span class="small muted">' + (rec ? '记忆盒 ' + rec.box + ' / 5' : '尚未开始') + '</span></div>' +
          '<div class="progress progress-sm mt-1"><i style="width:' + (rec ? (rec.box / 5) * 100 : 0) + '%"></i></div>' +
          '<div class="small muted mt-1">' + (rec ? '下次复习：' + C.fmtDate(rec.due, 'short') + ' · 答对 ' + rec.correct + ' / 错 ' + rec.wrong : '完成一次复习后开始记录') + '</div>' +
          (w.listeningRank ? '<div class="divider-dashed"></div><div class="small muted">真题听力语料</div><div class="metric-row"><span>出现次数</span><b>' + (w.listeningCount || 0) + '</b></div><div class="metric-row"><span>覆盖套数</span><b>' + (w.listeningDf || 0) + ' / 39</b></div><div class="small faint mt-1">按 39 套 2016–2025 听力原文统计；不是官方词频。</div>' : '') +
          '<div class="divider-dashed"></div>' +
          '<div class="small muted">标签</div><div class="cluster mt-1">' + (w.tags || []).map(function (t) { return '<span class="tag">' + C.esc(t) + '</span>'; }).join('') + '</div>' +
          '<div class="divider-dashed"></div>' +
          '<button class="btn btn-sm btn-block" data-speak-example>朗读例句</button>' +
        '</div>' +
        '<div class="notice mt-2">' + C.icon('info', 14) + '<span>记忆盒越往后，复习间隔越长；标记“已掌握”只建议在能主动造句时使用。</span></div>' +
      '</aside></div>';

    const modal = C.openModal({
      title: w.word, sub: w.phonetic + ' · ' + w.pos + ' · ' + TIER_LABEL[w.tier], size: 'wide', body: html,
      actions: [
        { label: '发音', onClick: function () { speakWord(w.word); return false; } },
        { label: '标记已掌握', variant: 'btn-jade', onClick: function () {
            S.markKnown(id); C.toast('已标记为掌握：' + w.word); setTimeout(function () { C.views.vocab.render(view, ctx); }, 180);
          } },
        { label: '重置记忆', variant: 'btn-ghost', onClick: function () {
            C.confirmDialog({ title: '重置这个词的记忆？', message: '将删除“' + w.word + '”的复习记录，重新作为新词出现。', confirmText: '重置', danger: true }).then(function (ok) {
              if (ok) { S.resetWord(id); C.toast('已重置 ' + w.word, 'info'); setTimeout(function () { C.views.vocab.render(view, ctx); }, 180); }
            });
            return false;
          } },
        { label: '关闭' }
      ],
      onMount: function (modalEl) {
        modalEl.querySelectorAll('[data-speak]').forEach(function (btn) {
          btn.addEventListener('click', function () { speakWord(w.word); });
        });
        const egBtn = modalEl.querySelector('[data-speak-example]');
        if (egBtn) egBtn.addEventListener('click', function () { if (w.example) C.speech.speak(w.example.en); });
      }
    });
    return modal;
  }

  /* ---------- Review session ---------- */
  function makeSession(mode, focus) {
    const queue = S.reviewQueue(focus).slice(0, 20);
    if (!queue.length) return null;
    return {
      mode: mode, focus: focus || '', queue: queue, idx: 0, answered: 0, correct: 0, wrong: [], answeredThis: false,
      elapsed: 0, startXp: S.state.xp, started: Date.now(), logged: false, finished: false, lastOk: null
    };
  }

  function meaningChoices(word) {
    const others = C.shuffle(C.data.vocab.filter(function (v) {
      return v.id !== word.id && v.senses && v.senses[0] && v.senses[0].zh !== word.senses[0].zh;
    }));
    const list = [{ text: word.senses[0].zh, correct: true }];
    const seen = new Set([word.senses[0].zh]);
    for (let i = 0; i < others.length && list.length < 4; i++) {
      const zh = others[i].senses[0].zh;
      if (!seen.has(zh)) { seen.add(zh); list.push({ text: zh, correct: false }); }
    }
    return C.shuffle(list);
  }

  function wordChoices(word) {
    const samePos = C.data.vocab.filter(function (v) { return v.id !== word.id && v.pos.split(' ')[0] === word.pos.split(' ')[0]; });
    const pool = C.shuffle(samePos.length >= 5 ? samePos : C.data.vocab.filter(function (v) { return v.id !== word.id; }));
    const list = [{ text: word.word, correct: true }];
    pool.slice(0, 3).forEach(function (v) { list.push({ text: v.word, correct: false }); });
    return C.shuffle(list);
  }

  function renderSetup(host, state) {
    const focus = state.focus || '';
    const vs = S.vocabStats();
    const queue = S.reviewQueue(focus);
    const due = queue.filter(function (w) { return !!S.wordRecord(w.id); }).length;
    const title = focus === 'listening-core' ? '听力高频核心' : focus === 'listening' ? '六级听力进阶词' : '今天的一组词';
    const groupTotal = focus === 'listening-core' ? ((C.data.listeningWordsMeta || {}).coreCount || 0) : focus === 'listening' ? ((C.data.listeningWordsMeta || {}).cet6Only || 0) : 0;
    const sub = focus ? '只从听力高频词中抽词 · 本轮 ' + queue.length + ' 个 · 本组共 ' + groupTotal + ' 个，按每日新词额度分批出现' : '到期 ' + due + ' 个 · 新词目标 ' + Math.max(0, S.newTarget() - S.newIntroducedToday()) + ' 个 · 本轮最多 20 个';
    const modes = [
      { id: 'listen', icon: 'headphones', title: '听音辨义', desc: '听发音，选出正确释义', disabled: !C.speech.supported },
      { id: 'spell', icon: 'type', title: '拼写测试', desc: '根据释义与音标拼写', disabled: false },
      { id: 'cloze', icon: 'scan', title: '看句填空', desc: '在例句语境中选词', disabled: false }
    ];
    host.innerHTML = '<div class="study-stage">' +
      '<div class="card">' +
        '<div class="card-head"><div><div class="card-title">' + C.esc(title) + '</div><div class="card-sub">' + C.esc(sub) + '</div></div>' +
        '<span class="chip chip-accent">' + queue.length + ' 个待学</span></div>' +
        (focus ? '<div class="notice mb-2">' + C.icon('volume', 14) + '<span>这一组只包含按 39 套真题听力语料统计出的六级进阶词；先听音辨义，再拼写。' + (focus === 'listening-core' ? ' 当前为“出现 ≥3 套”的核心组，共 ' + groupTotal + ' 词；本轮先取 ' + queue.length + ' 个，其余会在后续复习中分批出现。' : '') + '</span></div>' : '') +
        '<div class="mode-grid">' + modes.map(function (m) {
          return '<button class="mode-card' + (state.mode === m.id ? ' active' : '') + (m.disabled ? ' dim' : '') + '" data-mode="' + m.id + '"' + (m.disabled ? ' disabled' : '') + '>' +
            '<b>' + C.icon(m.icon, 14) + C.esc(m.title) + '</b><span>' + C.esc(m.disabled ? '当前浏览器不支持语音合成' : m.desc) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="row-between" style="flex-wrap:wrap;gap:10px">' +
          '<div class="small muted">复习优先于新词；答对升入下一记忆盒，答错回到第一盒。</div>' +
          '<button class="btn btn-accent" data-start-session>' + C.icon('play', 14) + '开始这一组</button>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-3 mt-2">' +
        '<div class="card card--soft"><div class="card-kicker">TO REVIEW</div><div class="stat-value" style="font-size:30px">' + due + '</div><div class="stat-sub">到期需复习</div></div>' +
        '<div class="card card--soft"><div class="card-kicker">MASTERED</div><div class="stat-value" style="font-size:30px">' + vs.mastered + '</div><div class="stat-sub">已掌握 / ' + vs.total + '</div></div>' +
        '<div class="card card--soft"><div class="card-kicker">ACCURACY</div><div class="stat-value" style="font-size:30px">' + vs.accuracy + '<small>%</small></div><div class="stat-sub">累计答题正确率</div></div>' +
      '</div>' +
      '<div class="notice mt-2">' + C.icon('lightbulb', 14) + '<span>建议先做 10–15 个就停。短而稳定的复习，比一次性刷完更符合记忆曲线。</span></div>' +
      '</div>';
  }

  function renderQuestion(view, ctx) {
    const state = view._vocabSession;
    if (!state) return;
    if (state.idx >= state.queue.length) {
      renderSummary(view, ctx);
      return;
    }
    const word = state.queue[state.idx];
    const pct = Math.round((state.idx / state.queue.length) * 100);
    let prompt = '';
    let choicesHtml = '';
    let extra = '';

    if (state.mode === 'listen') {
      prompt = '<div class="study-kicker"><span class="chip chip-accent">' + C.esc(MODE_LABEL[state.mode]) + '</span><span class="small muted">听发音，选释义</span></div>' +
        '<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">' +
          '<button class="play-btn" data-replay aria-label="播放发音">' + C.icon('volume', 18) + '</button>' +
          '<div><div class="study-question">这个单词的意思是？</div><div class="small muted mt-1">可重复播放 · 按空格重播</div></div>' +
        '</div>';
      choicesHtml = meaningChoices(word).map(function (c, i) {
        return '<button class="choice" data-choice="' + i + '" data-correct="' + c.correct + '"><span class="key">' + (i + 1) + '</span><span>' + C.esc(c.text) + '</span></button>';
      }).join('');
      extra = '<div hidden data-word-answer><div class="study-prompt" style="font-size:32px">' + C.esc(word.word) + '</div><div class="study-phonetic">' + C.esc(word.phonetic) + '</div></div>';
    } else if (state.mode === 'spell') {
      prompt = '<div class="study-kicker"><span class="chip chip-accent">' + C.esc(MODE_LABEL[state.mode]) + '</span><span class="small muted">根据释义拼写</span></div>' +
        '<div class="study-question" style="margin-top:0">' + C.esc(word.senses[0].zh) + '</div>' +
        '<div class="study-phonetic">' + C.esc(word.phonetic) + ' · ' + C.esc(word.pos) + '</div>' +
        '<div class="spell-wrap"><input class="spell-input" data-spell-input autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="输入英文单词" aria-label="拼写答案"></div>';
      extra = '<div class="row mt-2" style="gap:8px"><button class="btn" data-check-spell>检查拼写</button><button class="btn btn-ghost" data-reveal>看答案</button></div><div class="small faint mt-1">回车检查；再按回车进入下一题</div>';
    } else {
      const blank = blankExample(word);
      const sentence = blank.ok
        ? C.esc(blank.before) + '<span class="blank">______</span>' + C.esc(blank.after)
        : (C.esc(blank.sentence) + ' <span class="blank">______</span>');
      prompt = '<div class="study-kicker"><span class="chip chip-accent">' + C.esc(MODE_LABEL[state.mode]) + '</span><span class="small muted">根据语境与搭配</span></div>' +
        '<div class="study-context">' + sentence + '</div>' +
        '<div class="study-question" style="margin-top:12px">选出最恰当的词</div>' +
        (blank.ok ? '' : '<div class="small faint">例句未能定位目标词，先根据词义选择。</div>');
      choicesHtml = wordChoices(word).map(function (c, i) {
        return '<button class="choice" data-choice="' + i + '" data-correct="' + c.correct + '"><span class="key">' + (i + 1) + '</span><span>' + C.esc(c.text) + '</span></button>';
      }).join('');
      extra = '<div hidden data-word-answer><div class="study-prompt" style="font-size:30px">' + C.esc(word.word) + '</div><div class="study-phonetic">' + C.esc(word.phonetic) + '</div></div>';
    }

    view.querySelector('#study-host').innerHTML = '<div class="study-stage">' +
      '<div class="study-top"><div class="study-progress"><div class="row-between"><span>第 ' + (state.idx + 1) + ' / ' + state.queue.length + ' 个</span><span>' + pct + '%</span></div><div class="progress progress-accent"><i style="width:' + pct + '%"></i></div></div>' +
        '<button class="btn btn-sm btn-ghost" data-exit-session>退出</button></div>' +
      '<div class="study-card' + (state.answeredThis ? ' answered' : '') + '">' +
        prompt +
        (choicesHtml ? '<div class="choices">' + choicesHtml + '</div>' : '') +
        extra +
        '<div id="study-feedback"></div>' +
        '<div class="study-actions"><span class="study-hint">' + (state.mode === 'listen' ? '1–4 选择 · 空格重播 · Enter 下一题' : state.mode === 'spell' ? 'Enter 检查 / 下一题' : '1–4 选择 · Enter 下一题') + '</span>' +
        '<button class="btn btn-primary" data-next disabled>下一个 ' + C.icon('arrow-right', 14) + '</button></div>' +
      '</div></div>';

    state.answeredThis = false;
    state.currentChoices = [];
    if (choicesHtml) {
      const buttons = Array.from(view.querySelectorAll('#study-host [data-choice]'));
      state.currentChoices = buttons;
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () { chooseAnswer(view, ctx, btn); });
      });
    }
    if (state.mode === 'listen') {
      setTimeout(function () { if (view._vocabSession === state && !state.answeredThis) speakWord(word.word); }, 220);
      const replay = view.querySelector('[data-replay]');
      if (replay) replay.addEventListener('click', function () { speakWord(word.word); });
    }
    if (state.mode === 'spell') {
      const input = view.querySelector('[data-spell-input]');
      if (input) setTimeout(function () { input.focus(); }, 80);
      const check = view.querySelector('[data-check-spell]');
      if (check) check.addEventListener('click', function () { submitSpell(view, ctx); });
      const reveal = view.querySelector('[data-reveal]');
      if (reveal) reveal.addEventListener('click', function () { submitSpell(view, ctx, true); });
    }
    view.querySelector('[data-next]').addEventListener('click', function () { nextQuestion(view, ctx); });
    view.querySelector('[data-exit-session]').addEventListener('click', function () { exitSession(view, ctx); });
  }

  function chooseAnswer(view, ctx, button) {
    const state = view._vocabSession;
    if (!state || state.answeredThis) return;
    const word = state.queue[state.idx];
    const correct = button.dataset.correct === 'true';
    state.answeredThis = true;
    state.answered++;
    state.lastOk = correct;
    if (correct) state.correct++; else state.wrong.push(word);
    S.reviewWord(word.id, correct);
    Array.from(view.querySelectorAll('#study-host [data-choice]')).forEach(function (b) {
      b.disabled = true;
      if (b.dataset.correct === 'true') b.classList.add('correct');
      else if (b === button) b.classList.add('wrong');
    });
    const answerEl = view.querySelector('[data-word-answer]');
    if (answerEl) answerEl.hidden = false;
    const feedback = view.querySelector('#study-feedback');
    feedback.innerHTML = '<div class="study-feedback"><div class="verdict ' + (correct ? 'good' : 'bad') + '">' + C.icon(correct ? 'check-circle' : 'x-circle', 15) + (correct ? '答对了' : '正确答案：' + C.esc(word.senses[0].zh)) + '</div>' +
      '<div class="row-between" style="align-items:flex-start;gap:10px"><div><b style="font-family:var(--serif);font-size:15px">' + C.esc(word.word) + '</b> <span class="small muted">' + C.esc(word.phonetic) + ' · ' + C.esc(word.pos) + '</span>' +
      (word.example ? '<div class="small muted mt-1">' + C.esc(word.example.en) + '</div>' : '') + '</div>' +
      '<button class="icon-mini" data-replay style="flex:0 0 26px" aria-label="发音">' + C.icon('volume', 14) + '</button></div></div>';
    const replay = feedback.querySelector('[data-replay]');
    if (replay) replay.addEventListener('click', function () { speakWord(word.word); });
    const next = view.querySelector('[data-next]');
    next.disabled = false;
    next.focus();
  }

  function submitSpell(view, ctx, reveal) {
    const state = view._vocabSession;
    if (!state || state.answeredThis) return;
    const word = state.queue[state.idx];
    const input = view.querySelector('[data-spell-input]');
    const typed = input ? input.value.trim() : '';
    if (!typed && !reveal) { C.toast('先写下你的拼写，或点“看答案”', 'info', 1800); return; }
    const correct = !reveal && typed.toLowerCase() === word.word.toLowerCase();
    state.answeredThis = true;
    state.answered++;
    state.lastOk = correct;
    if (correct) state.correct++; else state.wrong.push(word);
    S.reviewWord(word.id, correct);
    if (input) { input.disabled = true; input.classList.add(correct ? 'ok' : 'bad'); }
    const check = view.querySelector('[data-check-spell]');
    if (check) check.disabled = true;
    const revealBtn = view.querySelector('[data-reveal]');
    if (revealBtn) revealBtn.disabled = true;
    const diff = charFeedback(word.word, typed);
    const feedback = view.querySelector('#study-feedback');
    feedback.innerHTML = '<div class="study-feedback"><div class="verdict ' + (correct ? 'good' : 'bad') + '">' + C.icon(correct ? 'check-circle' : 'x-circle', 15) + (correct ? '拼写正确' : '再记一次这个拼写') + '</div>' +
      '<div class="small">正确拼写：<b style="font-family:var(--serif);font-size:16px">' + C.esc(word.word) + '</b> <span class="muted">' + C.esc(word.phonetic) + '</span></div>' +
      (typed && !correct ? '<div class="spell-diff">你的输入：' + diff.typedHtml + '<br>目标词形：' + diff.targetHtml + '</div>' : '') +
      (word.example ? '<div class="small muted mt-1">' + C.esc(word.example.en) + '</div>' : '') +
      '<div class="small muted mt-1">搭配：' + C.esc((word.collocations || []).join(' · ')) + '</div></div>';
    const next = view.querySelector('[data-next]');
    next.disabled = false;
    next.focus();
  }

  function nextQuestion(view, ctx) {
    const state = view._vocabSession;
    if (!state || !state.answeredThis) return;
    state.idx++;
    if (state.idx >= state.queue.length) renderSummary(view, ctx);
    else renderQuestion(view, ctx);
  }

  function finishLog(state) {
    if (state.logged) return;
    state.logged = true;
    const minutes = Math.max(1, Math.round((Date.now() - state.started) / 60000));
    if (state.answered > 0) S.logStudy('vocab', minutes, state.answered, 0);
  }

  function renderSummary(view, ctx) {
    const state = view._vocabSession;
    if (state) {
      state.finished = true;
      finishLog(state);
    }
    const accuracy = state && state.answered ? Math.round((state.correct / state.answered) * 100) : 0;
    const xp = S.state.xp - (state ? state.startXp : S.state.xp);
    const wrong = state ? state.wrong : [];
    view.querySelector('#study-host').innerHTML = '<div class="study-stage"><div class="card study-card" style="min-height:0">' +
      '<div class="session-summary">' +
        '<div class="eyebrow no-rule" style="justify-content:center">SESSION COMPLETE</div>' +
        '<div class="session-score num">' + accuracy + '<small>%</small></div>' +
        '<div class="small muted">本轮正确率 · 获得 ' + xp + ' XP</div>' +
        '<div class="summary-grid"><div class="summary-cell"><b>' + (state ? state.answered : 0) + '</b><span>作答词数</span></div>' +
        '<div class="summary-cell"><b>' + (state ? state.correct : 0) + '</b><span>答对</span></div>' +
        '<div class="summary-cell"><b>' + wrong.length + '</b><span>需再复习</span></div></div>' +
        (wrong.length ? '<div class="mb-2"><div class="field-label" style="text-align:left">需要再看一眼</div>' + wrong.map(function (w) {
          return '<div class="plan-item" style="padding:8px 0"><div class="plan-body"><div class="plan-title">' + C.esc(w.word) + ' <span class="muted small">' + C.esc(w.phonetic) + '</span></div><div class="plan-meta">' + C.esc(w.senses[0].zh) + '</div></div><button class="icon-mini" data-speak="' + C.esc(w.word) + '">' + C.icon('volume', 13) + '</button></div>';
        }).join('') + '</div>' : '<div class="notice accent mb-2">' + C.icon('sparkles', 14) + '<span>这一组全对。记忆盒已为你安排下一次复习。</span></div>') +
        '<div class="row" style="justify-content:center;flex-wrap:wrap">' +
          '<button class="btn btn-primary" data-again>' + C.icon('repeat', 14) + '再来一轮</button>' +
          '<button class="btn" data-change-mode>换一种模式</button>' +
          '<a class="btn btn-ghost" href="#/vocab">回到词库</a>' +
        '</div>' +
        '<div class="small faint mt-2">复习时间已记入今天的研习记录。</div>' +
      '</div></div></div>';
    view.querySelectorAll('#study-host [data-speak]').forEach(function (btn) {
      btn.addEventListener('click', function () { speakWord(btn.dataset.speak); });
    });
    const again = view.querySelector('[data-again]');
    if (again) again.addEventListener('click', function () {
      const mode = view._vocabSession ? view._vocabSession.mode : 'listen';
      startSession(view, ctx, mode);
    });
    const change = view.querySelector('[data-change-mode]');
    if (change) change.addEventListener('click', function () {
      view._vocabSession = null;
      renderSetup(view.querySelector('#study-host'), { mode: 'listen', focus: view._vocabFocus });
      bindSetup(view, ctx);
    });
  }

  function exitSession(view, ctx) {
    if (view._vocabSession) finishLog(view._vocabSession);
    view._vocabSession = null;
    renderSetup(view.querySelector('#study-host'), { mode: 'listen', focus: view._vocabFocus });
    bindSetup(view, ctx);
  }

  function startSession(view, ctx, mode) {
    const focus = view._vocabFocus || '';
    const session = makeSession(mode, focus);
    if (!session) { C.toast('目前没有可复习的词', 'info'); return; }
    view._vocabSession = session;
    renderQuestion(view, ctx);
  }

  function bindSetup(view, ctx) {
    let selected = 'listen';
    const host = view.querySelector('#study-host');
    const modeButtons = host.querySelectorAll('[data-mode]');
    if (!C.speech.supported) selected = 'spell';
    modeButtons.forEach(function (b) { b.classList.remove('active'); });
    modeButtons.forEach(function (btn) {
      if (btn.dataset.mode === selected && !btn.disabled) btn.classList.add('active');
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        selected = btn.dataset.mode;
        modeButtons.forEach(function (b) { b.classList.toggle('active', b === btn); });
      });
    });
    const start = host.querySelector('[data-start-session]');
    if (start) start.addEventListener('click', function () { startSession(view, ctx, selected); });
  }

  /* ---------- Confusable mini quiz ---------- */
  function openPairQuiz(pair) {
    let answered = 0, score = 0;
    function blankIn(sentence, word) {
      const forms = [word];
      if (IRREGULAR[word]) forms.push(IRREGULAR[word]);
      const re = new RegExp('\\b(' + forms.map(C.escapeRegExp).join('|') + ')(?:s|es|ed|ing|d)?\\b', 'i');
      const m = sentence.match(re);
      if (!m) return null;
      return sentence.slice(0, m.index) + '______' + sentence.slice(m.index + m[0].length);
    }
    const qa = blankIn(pair.exA, pair.a.word);
    const qb = blankIn(pair.exB, pair.b.word);
    const body = '<div class="stack-sm">' +
      '<div class="notice">先判断句子的语境，再选择更合适的词。两题都作答后会显示解析。</div>' +
      '<div class="q-card" data-quiz="a"><div class="q-text">' + (qa ? C.esc(qa) : '哪一个词表示「' + C.esc(pair.a.zh) + '」？') + '</div>' +
        '<div class="row mt-2" style="gap:8px">' + [pair.a.word, pair.b.word].map(function (w) {
          return '<button class="option" data-pick="' + C.esc(w) + '"><span class="k">·</span>' + C.esc(w) + '</button>';
        }).join('') + '</div><div data-qres></div></div>' +
      '<div class="q-card" data-quiz="b"><div class="q-text">' + (qb ? C.esc(qb) : '哪一个词表示「' + C.esc(pair.b.zh) + '」？') + '</div>' +
        '<div class="row mt-2" style="gap:8px">' + [pair.a.word, pair.b.word].map(function (w) {
          return '<button class="option" data-pick="' + C.esc(w) + '"><span class="k">·</span>' + C.esc(w) + '</button>';
        }).join('') + '</div><div data-qres></div></div>' +
      '<div class="reading-result" data-quiz-score hidden></div>' +
      '</div>';
    C.openModal({
      title: '辨析小测 · ' + pair.a.word + ' / ' + pair.b.word,
      sub: '两题 · 选出更符合句意的词',
      body: body,
      actions: [{ label: '关闭' }],
      onMount: function (modalEl) {
        modalEl.querySelectorAll('[data-quiz]').forEach(function (q) {
          const answerWord = q.dataset.quiz === 'a' ? pair.a.word : pair.b.word;
          q.querySelectorAll('[data-pick]').forEach(function (btn) {
            btn.addEventListener('click', function () {
              if (q.dataset.done) return;
              q.dataset.done = '1';
              answered++;
              const ok = btn.dataset.pick === answerWord;
              if (ok) score++;
              q.querySelectorAll('[data-pick]').forEach(function (b) {
                b.disabled = true;
                if (b.dataset.pick === answerWord) b.classList.add('correct');
                else if (b === btn) b.classList.add('wrong');
              });
              q.querySelector('[data-qres]').innerHTML = '<div class="explain">' + (ok ? '正确。' : '应选 <b>' + C.esc(answerWord) + '</b>。') + ' ' + C.esc(pair.note) + '</div>';
              if (answered === 2) {
                const res = modalEl.querySelector('[data-quiz-score]');
                res.hidden = false;
                res.innerHTML = '<div class="rs-score">' + score + ' / 2</div><div class="small muted">' + (score === 2 ? '辨析掌握得不错，可以去词库标记掌握。' : '回到辨析卡片再读一遍差异，然后重做。') + '</div>';
              }
            });
          });
        });
      }
    });
  }

  /* ---------- Views ---------- */
  function renderConfuse(view) {
    const pairs = C.data.confusablePairs || [];
    return '<div class="pair-grid">' + pairs.map(function (p) {
      return '<div class="pair-card"><div class="pair-head"><span class="w">' + C.esc(p.a.word) + '</span><span class="small muted">' + C.esc(p.a.pos + ' ' + p.a.zh) + '</span><span class="dot-sep"></span><span class="w">' + C.esc(p.b.word) + '</span><span class="small muted">' + C.esc(p.b.pos + ' ' + p.b.zh) + '</span></div>' +
        '<div class="pair-note">' + C.esc(p.note) + '</div>' +
        '<div class="pair-eg">' + C.esc(p.exA) + '<br>' + C.esc(p.exB) + '</div>' +
        '<div class="row mt-2"><span class="tag">' + C.esc(p.tag) + '</span><button class="btn btn-sm" data-quiz-pair="' + p.id + '">测一测 ' + C.icon('arrow-right', 12) + '</button></div></div>';
    }).join('') + '</div>';
  }

  function renderColloc(view) {
    const words = (C.data.vocab || []).filter(function (w) { return (w.collocations || []).length >= 2; });
    const selected = view._collocWord && words.find(function (w) { return w.word === view._collocWord; }) || words[0];
    const nodeItems = [];
    (selected.collocations || []).slice(0, 5).forEach(function (c) { nodeItems.push({ label: c, type: 'colloc' }); });
    (selected.synonyms || []).slice(0, 3).forEach(function (s) { nodeItems.push({ label: s, type: 'syn' }); });
    const W = 800, H = 440, cx = 400, cy = 220, r = 148;
    const nodes = nodeItems.slice(0, 9).map(function (n, i) {
      const angle = (-90 + (360 / Math.max(9, nodeItems.length)) * i) * Math.PI / 180;
      return Object.assign({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }, n);
    });
    const svg = '<svg viewBox="0 0 800 440" role="img" aria-label="' + C.esc(selected.word) + ' 搭配网络">' +
      nodes.map(function (n) {
        return '<line x1="' + cx + '" y1="' + cy + '" x2="' + n.x.toFixed(1) + '" y2="' + n.y.toFixed(1) + '" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="2 4"/>';
      }).join('') +
      '<circle cx="' + cx + '" cy="' + cy + '" r="58" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.5"/>' +
      '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-family="var(--serif)" font-size="23" font-weight="600" fill="var(--ink)">' + C.esc(selected.word) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="var(--muted)">' + C.esc(selected.pos) + '</text>' +
      nodes.map(function (n) {
        const w = Math.min(210, Math.max(66, n.label.length * 6.4 + 20));
        const color = n.type === 'colloc' ? 'var(--jade)' : 'var(--gold)';
        return '<g class="net-node" data-speak="' + C.esc(n.label) + '" style="cursor:pointer">' +
          '<rect x="' + (n.x - w / 2).toFixed(1) + '" y="' + (n.y - 14).toFixed(1) + '" width="' + w.toFixed(1) + '" height="28" rx="14" fill="var(--surface)" stroke="' + color + '" stroke-width="1"/>' +
          '<text x="' + n.x.toFixed(1) + '" y="' + (n.y + 4).toFixed(1) + '" text-anchor="middle" font-family="var(--sans)" font-size="10" fill="var(--ink-soft)">' + C.esc(n.label) + '</text></g>';
      }).join('') + '</svg>';

    const collocCards = (C.data.collocations || []).map(function (c) {
      return '<div class="colloc-group"><h4>' + C.esc(c.phrase) + '</h4><div class="gloss">' + C.esc(c.zh) + '</div><div class="pair-eg">' + C.esc(c.ex) + '</div><div class="row mt-1"><span class="tag">' + C.esc(c.tag) + '</span><button class="icon-mini" data-speak="' + C.esc(c.phrase) + '">' + C.icon('volume', 13) + '</button></div></div>';
    }).join('');

    return '<div class="card mb-2"><div class="card-head"><div><div class="card-title">搭配星图</div><div class="card-sub">点选一个词，看看它常与谁一起出现；点击节点可朗读</div></div>' +
      '<span class="badge badge-jade">' + (selected.collocations || []).length + ' 个搭配</span></div>' +
      '<div class="cluster mb-2">' + words.slice(0, 14).map(function (w) {
        return '<button class="chip' + (w.word === selected.word ? ' active' : '') + '" data-colloc-word="' + C.esc(w.word) + '">' + C.esc(w.word) + '</button>';
      }).join('') + '</div>' +
      '<div class="net-wrap">' + svg + '</div>' +
      '<div class="legend"><span><i style="background:var(--jade)"></i>搭配</span><span><i style="background:var(--gold)"></i>近义词</span><span class="muted">点击节点听发音</span></div></div>' +
      C.ui.sectionHead('高频搭配 24', '阅读与写作中反复出现的短语骨架', '') +
      '<div class="colloc-groups">' + collocCards + '</div>';
  }

  function bindFullVocab(view, ctx) {
    const all = (C.data.fullVocab || []).slice();
    let state = { q: '', level: 'all', sort: 'alpha', limit: 60 };
    const body = view.querySelector('#full-body');
    const more = view.querySelector('#full-more');
    if (!body) return;

    function list() {
      let arr = all;
      if (state.level === 'base') arr = arr.filter(function (w) { return w.base; });
      if (state.level === 'cet6') arr = arr.filter(function (w) { return !w.base; });
      const q = state.q.trim().toLowerCase();
      if (q) arr = arr.filter(function (w) { return (w.word + ' ' + w.zh + ' ' + (w.pos || '')).toLowerCase().indexOf(q) !== -1; });
      arr = arr.slice();
      if (state.sort === 'listening') arr.sort(function (a, b) { return (b.listeningDf || 0) - (a.listeningDf || 0) || a.word.localeCompare(b.word); });
      else arr.sort(function (a, b) { return a.word.localeCompare(b.word); });
      return arr;
    }

    function openFullWord(word) {
      const main = (C.data.vocab || []).find(function (w) { return w.word.toLowerCase() === word.toLowerCase(); });
      if (main) { openDetail(view, ctx, main.id); return; }
      const w = all.find(function (x) { return x.word.toLowerCase() === word.toLowerCase(); });
      if (!w) return;
      const dialog = C.openModal({
        title: w.word, sub: (w.phonetic || '') + ' · ' + (w.pos || ''), size: 'narrow',
        body: '<p style="font-size:15px">' + C.esc(w.zh) + '</p>' +
          '<div class="row mt-2" style="flex-wrap:wrap"><span class="badge ' + (w.base ? '' : 'badge-core') + '">' + (w.base ? '基础词' : '六级进阶') + '</span>' + (w.listeningDf ? '<span class="badge badge-jade">真题听力覆盖 ' + w.listeningDf + ' / 39 套 · ' + (w.listeningCount || 0) + ' 次</span>' : '') + '</div>' +
          '<div class="notice mt-2">' + C.icon('info', 14) + '<span>这个词目前只在“大纲全表”中查阅，不在记忆盒里。想背听力高频词，请从“听力高频词”页进入；想背精讲词，请使用词库中的核心词条。</span></div>',
        actions: [{ label: '发音', onClick: function () { C.speech.speak(w.word); return false; } }, { label: '关闭' }]
      });
    }

    function render() {
      const arr = list();
      const shown = arr.slice(0, state.limit);
      body.innerHTML = shown.length ? shown.map(function (w) {
        return '<tr style="cursor:pointer" data-fword="' + C.esc(w.word) + '"><td><b style="font-family:var(--serif);font-size:14.5px">' + C.esc(w.word) + '</b></td><td class="mono note">' + C.esc(w.phonetic || '—') + '</td><td class="note mono">' + C.esc(w.pos || '') + '</td><td class="note">' + C.esc(w.zh) + '</td>' +
          '<td>' + (w.base ? '<span class="badge">基础</span>' : '<span class="badge badge-core">六级</span>') + '</td>' +
          '<td>' + (w.listeningDf ? '<span class="badge badge-jade">' + w.listeningDf + ' 套</span>' : '<span class="faint small">—</span>') + '</td>' +
          '<td><button class="icon-mini" data-fspeak="' + C.esc(w.word) + '" aria-label="发音">' + C.icon('volume', 13) + '</button></td></tr>';
      }).join('') : '<tr><td colspan="7">' + C.emptyState('没有匹配的词', '换一个关键词或筛选条件。', 'search') + '</td></tr>';
      more.innerHTML = arr.length > shown.length ? '<button class="btn btn-sm" data-fmore>加载更多</button>' : '<span class="small faint">当前 ' + arr.length + ' 个词 · 显示 ' + shown.length + '</span>';
      const btn = more.querySelector('[data-fmore]');
      if (btn) btn.addEventListener('click', function () { state.limit += 60; render(); });
    }

    body.addEventListener('click', function (e) {
      const sp = e.target.closest('[data-fspeak]');
      if (sp) { e.stopPropagation(); C.speech.speak(sp.dataset.fspeak); return; }
      const row = e.target.closest('[data-fword]');
      if (row) openFullWord(row.dataset.fword);
    });
    view.querySelector('#full-search').addEventListener('input', C.debounce(function (e) { state.q = e.target.value; state.limit = 60; render(); }, 130));
    view.querySelectorAll('[data-flevel]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.level = b.dataset.flevel;
        view.querySelectorAll('[data-flevel]').forEach(function (x) { x.classList.toggle('active', x === b); });
        state.limit = 60; render();
      });
    });
    view.querySelector('#full-sort').addEventListener('change', function (e) { state.sort = e.target.value; render(); });
    render();
  }

  function render(view, ctx) {
    const tab = ctx.params.get('tab') || 'browse';
    const wordId = ctx.params.get('word');
    const focusParam = ctx.params.get('focus') || '';
    view._vocabFocus = focusParam;
    const vs = S.vocabStats();
    const words = C.data.vocab;
    const tags = Array.from(new Set(words.reduce(function (arr, w) { return arr.concat(w.tags || []); }, []))).sort();

    let html = C.ui.pageHead({
      eyebrow: 'VOCABULARY & COLLOCATIONS',
      title: '词汇与短语',
      sub: words.length + ' 个分级词条 · 已接触 ' + vs.seen + ' · 已掌握 ' + vs.mastered + ' · 今日到期 ' + vs.due,
      actions: '<a class="btn btn-primary" href="#/vocab?tab=review">' + C.icon('play', 14) + '开始复习</a>' +
        '<a class="btn" href="#/vocab?tab=confuse">' + C.icon('layers', 14) + '词义辨析</a>'
    });

    html += '<div class="tabs mb-3">' +
      '<a class="tab' + (tab === 'browse' ? ' active' : '') + '" href="#/vocab">词库 <span class="count">' + words.length + '</span></a>' +
      '<a class="tab' + (tab === 'review' ? ' active' : '') + '" href="#/vocab?tab=review' + (focusParam ? '&focus=' + encodeURIComponent(focusParam) : '') + '">今日复习 <span class="count">' + vs.due + '</span></a>' +
      '<a class="tab' + (tab === 'confuse' ? ' active' : '') + '" href="#/vocab?tab=confuse">词义辨析 <span class="count">' + (C.data.confusablePairs || []).length + '</span></a>' +
      '<a class="tab' + (tab === 'colloc' ? ' active' : '') + '" href="#/vocab?tab=colloc">高频搭配 <span class="count">' + (C.data.collocations || []).length + '</span></a>' +
      '<a class="tab' + (tab === 'full' ? ' active' : '') + '" href="#/vocab?tab=full">大纲词表 <span class="count">' + ((C.data.fullVocab || []).length) + '</span></a>' +
      '</div>';

    if (tab === 'confuse') {
      html += renderConfuse(view);
    } else if (tab === 'colloc') {
      html += renderColloc(view);
    } else if (tab === 'full') {
      html += '<div class="card"><div class="card-head"><div><div class="card-title">六级大纲全词</div><div class="card-sub">' + ((C.data.fullVocab || []).length) + ' 个词条 · 词形、音标与核心释义来自开源词表；用于查阅与定位，不等于全部需要背完。</div></div><span class="badge badge-jade">全表</span></div>' +
        '<div class="row-between mb-2" style="flex-wrap:wrap;gap:8px"><div class="row" style="gap:7px"><div class="input-group" style="width:220px">' + C.icon('search', 15) + '<input class="input search-input" id="full-search" placeholder="搜单词或中文释义…" style="height:34px;font-size:12px"></div>' +
          '<div class="seg" id="full-level"><button data-flevel="all" class="active">全部</button><button data-flevel="cet6">六级进阶</button><button data-flevel="base">基础词</button></div></div>' +
          '<select class="select input-inline" id="full-sort" style="width:auto;height:34px;font-size:11.5px"><option value="alpha">按字母</option><option value="listening">按听力覆盖</option></select></div>' +
        '<div class="table-wrap" style="overflow-x:auto"><table class="replace-table"><thead><tr><th>单词</th><th>音标</th><th>词性</th><th>核心释义</th><th>层级</th><th>听力覆盖</th><th></th></tr></thead><tbody id="full-body"></tbody></table></div>' +
        '<div class="center mt-2" id="full-more"></div></div>' +
        '<div class="source-note mt-2">词表与释义：KyleBing/english-vocabulary（BSD-3-Clause）；听力覆盖来自 39 套 2016–2025 真题听力语料统计。全表用于查阅，精讲与听力高频词才进入记忆盒。</div>';
    } else if (tab === 'review') {
      html += '<div id="study-host"></div>';
    } else {
      html += '<div class="vocab-toolbar">' +
        '<div class="input-group search"><span class="sr-only">搜索词条</span>' + C.icon('search', 15) + '<input class="input search-input" id="vocab-search" placeholder="搜索单词、释义或标签…" autocomplete="off"></div>' +
        '<div class="cluster" id="tier-chips"><button class="chip active" data-tier="all">全部</button>' +
          C.data.vocabTiers.map(function (t) {
            const n = t.id === 'listening' ? words.filter(function (w) { return !!w.listeningRank; }).length : words.filter(function (w) { return w.tier === t.id; }).length;
            return '<button class="chip" data-tier="' + t.id + '">' + C.esc(t.short) + ' <span class="tiny faint">' + n + '</span></button>';
          }).join('') + '</div>' +
        '<select class="select input-inline" id="tag-filter" aria-label="按标签筛选" style="width:auto;min-width:112px"><option value="">全部标签</option>' + tags.map(function (t) { return '<option value="' + C.esc(t) + '">' + C.esc(t) + '</option>'; }).join('') + '</select>' +
        '<span class="small muted" id="word-count" style="margin-left:auto"></span>' +
        '</div>' +
        '<div class="word-grid" id="word-grid"></div>' +
        '<div class="center mt-3" id="word-more"></div>';
    }

    view.innerHTML = html;
    if (tab === 'full') bindFullVocab(view, ctx);

    let state = { tier: 'all', q: '', tag: '', limit: 36 };

    function filtered() {
      const q = state.q.trim().toLowerCase();
      return words.filter(function (w) {
        if (state.tier !== 'all' && (state.tier === 'listening' ? !w.listeningRank : w.tier !== state.tier)) return false;
        if (state.tag && (w.tags || []).indexOf(state.tag) === -1) return false;
        if (q) {
          const hay = (w.word + ' ' + (w.senses || []).map(function (s) { return s.zh + ' ' + (s.en || ''); }).join(' ') + ' ' + (w.tags || []).join(' ') + ' ' + (w.collocations || []).join(' ')).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function renderGrid() {
      const grid = view.querySelector('#word-grid');
      if (!grid) return;
      const list = filtered();
      const shown = list.slice(0, state.limit);
      grid.innerHTML = shown.length ? shown.map(renderWordCard).join('') : '<div class="word-empty" style="grid-column:1/-1">' + C.emptyState('没有匹配的词条', '换一个关键词，或清除筛选条件。', 'search') + '</div>';
      const count = view.querySelector('#word-count');
      if (count) count.textContent = list.length + ' 个词条' + (list.length > shown.length ? ' · 展示 ' + shown.length : '');
      const more = view.querySelector('#word-more');
      if (more) {
        if (list.length > shown.length) {
          more.innerHTML = '<button class="btn" data-more>加载更多 ' + C.icon('chevron-down', 13) + '</button>';
          more.querySelector('[data-more]').addEventListener('click', function () { state.limit += 36; renderGrid(); });
        } else more.innerHTML = '';
      }
    }

    function bindBrowse() {
      const search = view.querySelector('#vocab-search');
      if (search) {
        search.addEventListener('input', C.debounce(function () { state.q = search.value; state.limit = 36; renderGrid(); }, 140));
      }
      view.querySelectorAll('[data-tier]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.tier = btn.dataset.tier;
          view.querySelectorAll('[data-tier]').forEach(function (b) { b.classList.toggle('active', b === btn); });
          state.limit = 36; renderGrid();
        });
      });
      const tag = view.querySelector('#tag-filter');
      if (tag) tag.addEventListener('change', function () { state.tag = tag.value; state.limit = 36; renderGrid(); });
      const grid = view.querySelector('#word-grid');
      if (grid) {
        grid.addEventListener('click', function (e) {
          const speakBtn = e.target.closest('[data-speak]');
          if (speakBtn) { e.stopPropagation(); speakWord(speakBtn.dataset.speak); return; }
          const openBtn = e.target.closest('[data-open]');
          const card = e.target.closest('[data-word-id]');
          if (openBtn) { e.stopPropagation(); openDetail(view, ctx, openBtn.dataset.open); return; }
          if (card) openDetail(view, ctx, card.dataset.wordId);
        });
        grid.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            const card = e.target.closest('[data-word-id]');
            if (card) { e.preventDefault(); openDetail(view, ctx, card.dataset.wordId); }
          }
        });
      }
      renderGrid();
    }

    if (tab === 'browse') bindBrowse();
    if (tab === 'confuse') {
      view.querySelectorAll('[data-quiz-pair]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const pair = (C.data.confusablePairs || []).find(function (p) { return p.id === btn.dataset.quizPair; });
          if (pair) openPairQuiz(pair);
        });
      });
    }
    if (tab === 'colloc') {
      view.querySelectorAll('[data-colloc-word]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          view._collocWord = btn.dataset.collocWord;
          C.views.vocab.render(view, ctx);
        });
      });
      view.querySelectorAll('.net-node[data-speak]').forEach(function (node) {
        node.addEventListener('click', function () { speakWord(node.dataset.speak); });
      });
      view.querySelectorAll('[data-speak]').forEach(function (btn) {
        if (btn.classList.contains('net-node')) return;
        btn.addEventListener('click', function () { speakWord(btn.dataset.speak); });
      });
    }
    if (tab === 'review') {
      const host = view.querySelector('#study-host');
      view._vocabSession = null;
      view._vocabFocus = ctx.params.get('focus') || '';
      renderSetup(host, { mode: 'listen', focus: view._vocabFocus });
      bindSetup(view, ctx);
      const onKey = function (e) {
        if (document.querySelector('.modal-scrim')) return;
        const session = view._vocabSession;
        if (!session || session.finished) return;
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea') {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (!session.answeredThis) submitSpell(view, ctx);
            else nextQuestion(view, ctx);
          }
          return;
        }
        if (e.key === ' ' && session.mode === 'listen') {
          e.preventDefault();
          const word = session.queue[session.idx];
          if (word) speakWord(word.word);
          return;
        }
        if (/^[1-4]$/.test(e.key) && !session.answeredThis && session.currentChoices && session.currentChoices.length) {
          e.preventDefault();
          chooseAnswer(view, ctx, session.currentChoices[Number(e.key) - 1]);
          return;
        }
        if (e.key === 'Enter' && session.answeredThis) {
          e.preventDefault();
          nextQuestion(view, ctx);
        }
      };
      document.addEventListener('keydown', onKey);
      if (wordId) setTimeout(function () { openDetail(view, ctx, wordId); }, 60);
      return function () {
        document.removeEventListener('keydown', onKey);
        if (view._vocabSession) finishLog(view._vocabSession);
        C.speech.stop();
      };
    }

    if (wordId && tab !== 'review') setTimeout(function () { openDetail(view, ctx, wordId); }, 60);
    return function () { C.speech.stop(); };
  }

  C.views.vocab = { render: render };
})();
