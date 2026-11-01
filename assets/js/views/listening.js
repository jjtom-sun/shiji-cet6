/* Listening lab — TTS player, questions, dictation, signal words */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;

  const TYPE = {
    conversation: { label: '长对话', chip: 'chip-blue', icon: 'headphones' },
    passage: { label: '听力篇章', chip: 'chip-jade', icon: 'book-open' },
    lecture: { label: '讲座', chip: 'chip-violet', icon: 'graduation' }
  };
  const RATES = [0.8, 1, 1.25, 1.5];

  function setById(id) { return (C.data.listening || []).find(function (s) { return s.id === id; }); }

  function highlightSignals(sentence, enabled) {
    let html = C.esc(sentence.en);
    if (!enabled || !sentence.signals) return html;
    sentence.signals.forEach(function (sig) {
      const word = C.esc(sig.word);
      const re = new RegExp('\\b' + C.escapeRegExp(word) + '\\b', 'gi');
      html = html.replace(re, '<span class="signal-mark ' + C.esc(sig.type || '') + '">' + word + '</span>');
    });
    return html;
  }

  function ttsNoteHTML() {
    if (!C.speech.supported) return '<div class="notice mb-2">' + C.icon('alert', 14) + '<span>当前浏览器不支持语音合成，听力音频无法播放。</span></div>';
    if (!C.speech.hasEnglishVoice()) return '<div class="notice mb-2">' + C.icon('alert', 14) + '<span>系统未检测到英语语音包：浏览器会用默认音色朗读英文。建议在 Windows 设置 → 时间和语言 → 语音 中安装英语（美国）语音，或使用 Edge 浏览器。</span></div>';
    return '';
  }

  function setListHtml() {
    const st = S.state.listening;
    const total = (C.data.listening || []).length;
    const done = Object.keys(st).length;
    const bestArr = Object.keys(st).map(function (k) { return st[k].best || 0; });
    const avg = bestArr.length ? Math.round(bestArr.reduce(function (a, b) { return a + b; }, 0) / bestArr.length) : 0;
    const dictArr = Object.keys(st).map(function (k) { return st[k].dictationBest || 0; }).filter(Boolean);
    const dictAvg = dictArr.length ? Math.round(dictArr.reduce(function (a, b) { return a + b; }, 0) / dictArr.length) : 0;
    return '<div class="stat-row mb-3">' +
      C.ui.stat('SETS', done + ' / ' + total, '已练套数', '') +
      C.ui.stat('AVG SCORE', avg + (avg ? '%' : ''), '各套最佳平均', '') +
      C.ui.stat('DICTATION', dictAvg + (dictAvg ? '%' : ''), '听写最佳平均', '') +
      C.ui.stat('SIGNALS', '6', '类考点信号词', '类') +
      '</div>' +
      '<div class="listen-grid">' + (C.data.listening || []).map(function (s) {
        const p = st[s.id] || {};
        const type = TYPE[s.type] || { label: s.type, chip: 'chip-muted', icon: 'headphones' };
        return '<a class="set-card" href="#/listening?set=' + s.id + '">' +
          '<div class="set-type"><span class="chip chip-sm ' + type.chip + '">' + C.icon(type.icon, 11) + C.esc(type.label) + '</span>' +
          (p.best ? '<span class="badge badge-jade">最佳 ' + p.best + '%</span>' : '<span class="badge">未作答</span>') + '</div>' +
          '<div class="set-title">' + C.esc(s.title) + '</div>' +
          '<div class="set-desc">' + C.esc(s.intro) + '</div>' +
          '<div class="set-meta"><span>' + C.esc(s.scene) + '</span><span>' + s.script.length + ' 句</span><span>' + s.questions.length + ' 题</span>' +
          (p.dictationBest ? '<span>听写 ' + p.dictationBest + '%</span>' : '') + '</div></a>';
      }).join('') + '</div>' +
      '<div class="card mt-2">' +
        '<div class="card-head"><div><div class="card-title">怎么用精听</div><div class="card-sub">三种工序，不要一次做完</div></div><a class="section-link" href="#/listening?tab=signals">信号词速查 ' + C.icon('arrow-right', 13) + '</a></div>' +
        '<div class="grid grid-3">' +
          '<div><div class="eyebrow no-rule">01 · 盲听</div><p class="small mt-1">先关字幕听一遍，只抓场景、说话人和大致态度。听不懂的句子先记下位置。</p></div>' +
          '<div><div class="eyebrow no-rule">02 · 听写</div><p class="small mt-1">以 0.8 倍速逐句听写，对照差异。错在词、连读还是信号词，要分开记。</p></div>' +
          '<div><div class="eyebrow no-rule">03 · 跟读</div><p class="small mt-1">用原速跟读，重点模仿转折与因果处的重音和停顿，再回答题目。</p></div>' +
        '</div>' +
      '</div>';
  }

  function topTabs(active) {
    return '<div class="tabs mb-3">' +
      '<a class="tab' + (active === 'real' ? ' active' : '') + '" href="#/listening">真题精听</a>' +
      '<a class="tab' + (active === 'original' ? ' active' : '') + '" href="#/listening?tab=original">原创训练</a>' +
      '<a class="tab' + (active === 'words' ? ' active' : '') + '" href="#/listening?tab=words">听力高频词</a>' +
      '<a class="tab' + (active === 'signals' ? ' active' : '') + '" href="#/listening?tab=signals">信号词</a>' +
      '</div>';
  }

  function renderSignalLibrary(view) {
    const cats = C.data.signalWords || [];
    view.innerHTML = C.ui.pageHead({
      eyebrow: 'SIGNAL WORDS', title: '听力信号词',
      sub: '六级听力不考“听懂每个词”，更常考你能否抓住转折、因果与强调。点击任意信号词可听发音。',
      actions: '<a class="btn" href="#/listening">' + C.icon('arrow-left', 14) + '返回真题精听</a>'
    }) +
    topTabs('signals') +
    '<div class="signal-grid">' + cats.map(function (c) {
      return '<div class="signal-card"><h4><span class="signal-mark ' + C.esc(c.type) + '">' + C.esc(c.label) + '</span></h4>' +
        '<div class="sw">' + c.words.map(function (w) { return '<button class="signal-word" data-speak="' + C.esc(w) + '">' + C.esc(w) + '</button>'; }).join('') + '</div>' +
        '<p>' + C.esc(c.tip) + '</p></div>';
    }).join('') + '</div>' +
    '<div class="notice mt-2">' + C.icon('lightbulb', 14) + '<span>听到转折词后，先别急着选；真正答案往往在转折后的半句。因果词则要分清“谁导致谁”。</span></div>';
    view.querySelectorAll('[data-speak]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!C.speech.supported) { C.toast('当前浏览器不支持语音合成', 'bad'); return; }
        C.speech.speak(btn.dataset.speak);
      });
    });
    return function () { C.speech.stop(); };
  }

  function renderSetList(view) {
    view.innerHTML = C.ui.pageHead({
      eyebrow: 'LISTENING LAB · ORIGINAL', title: '原创听力训练',
      sub: '六套原创仿真材料：两段长对话、两篇听力篇章、两场讲座。可精听、逐句听写、标记考点信号词。',
      actions: '<a class="btn" href="#/listening">' + C.icon('headphones', 14) + '真题精听</a>' +
        '<a class="btn" href="#/listening?tab=words">' + C.icon('volume', 14) + '听力高频词</a>'
    }) + topTabs('original') + ttsNoteHTML() + setListHtml();
    return function () { C.speech.stop(); };
  }

  function playerHTML(set, state) {
    const best = (S.state.listening[set.id] || {}).best || 0;
    const type = TYPE[set.type] || { label: set.type, chip: 'chip-muted' };
    const bars = Array.from({ length: 28 }).map(function (_, i) {
      return '<i style="height:' + (8 + ((i * 7) % 34)) + 'px"></i>';
    }).join('');
    return '<div class="audio-panel" id="audio-panel">' +
      '<div class="audio-head"><div><div class="row" style="gap:6px"><span class="chip chip-sm ' + type.chip + '">' + C.esc(type.label) + '</span>' +
      '<span class="source-note">TTS AUDIO</span></div><div class="card-title" style="margin-top:7px;font-size:17px">' + C.esc(set.title) + '</div>' +
      '<div class="small muted">' + C.esc(set.scene) + ' · 共 ' + set.script.length + ' 句</div></div>' +
      '<div class="center"><span class="badge ' + (best ? 'badge-jade' : '') + '">' + (best ? '最佳 ' + best + '%' : '尚未作答') + '</span></div></div>' +
      '<div class="audio-body">' +
        '<div class="disc-wrap"><div class="disc-bars">' + bars + '</div></div>' +
        '<div class="sentence-view" id="sentence-view"></div>' +
        '<div class="ctrl-row"><div class="row">' +
          '<button class="icon-btn" data-act="prev" aria-label="上一句">' + C.icon('back', 15) + '</button>' +
          '<button class="play-btn" id="play-btn" data-act="play" aria-label="播放">' + C.icon('play', 18) + '</button>' +
          '<button class="icon-btn" data-act="next" aria-label="下一句">' + C.icon('forward', 15) + '</button>' +
          '<button class="icon-btn" data-act="shadow" title="跟读评测（使用麦克风）" aria-label="跟读评测"' + (C.speech.recognitionSupported ? '' : ' disabled') + '>' + C.icon('mic', 15) + '</button>' +
          '<span class="tiny mono muted" id="sentence-pos">' + '01 / ' + set.script.length + '</span>' +
        '</div><div class="seg seg-sm speed-seg" id="speed-seg">' + RATES.map(function (r) {
          return '<button data-rate="' + r + '" class="' + (r === state.rate ? 'active' : '') + '">' + r + 'x</button>';
        }).join('') + '</div></div>' +
        '<div class="toggles">' +
          '<label class="toggle"><input type="checkbox" data-opt="continuous"><span class="track"></span><span>连播</span></label>' +
          '<label class="toggle"><input type="checkbox" data-opt="zh"' + (state.showZh ? ' checked' : '') + '><span class="track"></span><span>中文</span></label>' +
          '<label class="toggle"><input type="checkbox" data-opt="signals"' + (state.showSignals ? ' checked' : '') + '><span class="track"></span><span>考点标记</span></label>' +
          '<button class="btn btn-sm btn-ghost" data-act="transcript" id="transcript-btn">显示原文</button>' +
        '</div>' +
        '<div class="transcript" id="transcript" hidden></div>' +
        (!C.speech.supported ? '<div class="notice mt-2">' + C.icon('alert', 14) + '<span>当前浏览器不支持语音合成，无法播放音频；仍可阅读原文后答题（不推荐作为听力训练）。</span></div>' : '') +
      '</div></div>';
  }

  function renderQuestionsMode(view, ctx, set) {
    const state = {
      idx: 0, rate: 1, showZh: S.state.settings.showZh !== false, showSignals: true,
      continuous: false, playing: false, playToken: 0, showTranscript: false,
      answers: {}, finished: false, logged: false, startTime: Date.now()
    };

    view.innerHTML = detailHead(set, 'questions') +
      ttsNoteHTML() +
      '<div class="listen-layout">' +
        '<div>' + playerHTML(set, state) + '</div>' +
        '<div class="stack">' +
          '<div class="card" id="question-card">' +
            '<div class="card-head"><div><div class="card-title">听力题</div><div class="card-sub">边听边答 · 点击选项后显示解析</div></div>' +
            '<span class="badge">' + set.questions.length + ' 题</span></div>' +
            '<div id="listen-score"></div>' +
            '<div class="question-list" id="question-list"></div>' +
          '</div>' +
          '<div class="notice">' + C.icon('info', 14) + '<span>本材料为原创仿真内容，音频由浏览器语音合成朗读，语速可调。真实考试中音频只播放一次。</span></div>' +
        '</div>' +
      '</div>';

    const panel = view.querySelector('#audio-panel');
    const transcript = view.querySelector('#transcript');
    const sentenceHost = view.querySelector('#sentence-view');
    const playBtn = view.querySelector('#play-btn');
    const posEl = view.querySelector('#sentence-pos');
    const list = view.querySelector('#question-list');
    const scoreHost = view.querySelector('#listen-score');

    function current() { return set.script[state.idx]; }

    function updateSentence() {
      const s = current();
      sentenceHost.innerHTML = '<div class="row-between"><div class="sentence-no">SENTENCE ' + C.pad2(state.idx + 1) + ' · SPEAKER ' + C.esc(s.spk || 'N') + '</div>' +
        '<span class="tiny mono muted">' + C.esc((set.script[state.idx] && set.script[state.idx].signals && state.showSignals) ? set.script[state.idx].signals.map(function (x) { return x.type; }).join(' · ') : '') + '</span></div>' +
        '<div class="sentence-en">' + highlightSignals(s, state.showSignals) + '</div>' +
        (state.showZh ? '<div class="sentence-zh">' + C.esc(s.zh) + '</div>' : '');
      posEl.textContent = C.pad2(state.idx + 1) + ' / ' + set.script.length;
      playBtn.innerHTML = C.icon(state.playing ? 'pause' : 'play', 18);
      view.querySelector('#audio-panel').classList.toggle('playing', state.playing);
      transcript.querySelectorAll('.transcript-line').forEach(function (line, i) {
        line.classList.toggle('active', i === state.idx);
      });
    }

    function renderTranscript() {
      transcript.innerHTML = set.script.map(function (s, i) {
        return '<div class="transcript-line' + (i === state.idx ? ' active' : '') + '" data-sentence="' + i + '"><span class="n">' + C.pad2(i + 1) + '</span><span>' + highlightSignals(s, state.showSignals) + (state.showZh ? '<span class="zh">' + C.esc(s.zh) + '</span>' : '') + '</span></div>';
      }).join('');
    }

    function stopSpeech() {
      state.playToken++;
      state.playing = false;
      C.speech.stop();
      playBtn.innerHTML = C.icon('play', 18);
      panel.classList.remove('playing');
    }

    function playCurrent(continuous) {
      if (!C.speech.supported) { C.toast('当前浏览器不支持语音合成', 'bad'); return; }
      const token = ++state.playToken;
      state.playing = true;
      updateSentence();
      C.speech.speak(current().en, { rate: state.rate }).then(function () {
        if (token !== state.playToken) return;
        state.playing = false;
        updateSentence();
        if (continuous && state.continuous && state.idx < set.script.length - 1) {
          state.idx++;
          updateSentence();
          setTimeout(function () {
            if (state.playing === false && token === state.playToken) playCurrent(true);
          }, 420);
        }
      });
    }

    function togglePlay() {
      if (state.playing) { stopSpeech(); return; }
      playCurrent(state.continuous);
    }

    function goTo(idx, autoPlay) {
      const wasPlaying = state.playing;
      stopSpeech();
      state.idx = C.clamp(idx, 0, set.script.length - 1);
      updateSentence();
      if (autoPlay) playCurrent(state.continuous);
      else if (wasPlaying) playCurrent(state.continuous);
    }

    function startShadow() {
      if (!C.speech.recognitionSupported) { C.toast('当前浏览器不支持语音识别，请使用 Chrome 或 Edge', 'bad', 3200); return; }
      stopSpeech();
      const target = current().en;
      C.toast('请朗读当前句，正在聆听…', 'info', 2200);
      C.speech.recognize({ timeout: 15000 }).then(function (heard) {
        if (!view.isConnected) return;
        const review = C.speech.pronunciationReview(target, heard);
        const body = '<div class="row" style="gap:18px;align-items:center;flex-wrap:wrap"><div class="session-score num">' + review.score + '<small>%</small></div>' +
          '<div class="small muted">词级匹配参考 · 不是专业发音评分</div></div>' +
          '<div class="divider-dashed"></div>' +
          '<div class="small muted">识别到的内容</div><p style="font-family:var(--serif);font-size:15px">' + (heard ? C.esc(heard) : '（没有识别到内容）') + '</p>' +
          '<div class="small muted">目标句</div><p style="font-family:var(--serif);font-size:15px">' + C.esc(target) + '</p>' +
          '<div class="dict-diff">' + C.speech.diffHTML(C.speech.diffWords(target, heard)) + '</div>' +
          '<div class="notice mt-2">' + C.icon('info', 14) + '<span>跟读评测依赖浏览器语音识别，会受麦克风、口音与网络影响。请把它当作“我是否读全了”的检查，而不是发音分数。</span></div>';
        C.openModal({
          title: '跟读评测', sub: '当前句 · 词级识别参考', body: body,
          actions: [
            { label: '再读一次', onClick: function () { setTimeout(startShadow, 220); }, close: true },
            { label: '关闭' }
          ]
        });
      }).catch(function (err) {
        if (view.isConnected) C.toast(err.message, 'bad', 3800);
      });
    }

    updateSentence();
    renderTranscript();

    panel.addEventListener('click', function (e) {
      const act = e.target.closest('[data-act]');
      if (act) {
        const a = act.dataset.act;
        if (a === 'play') togglePlay();
        else if (a === 'prev') goTo(state.idx - 1, false);
        else if (a === 'next') goTo(state.idx + 1, false);
        else if (a === 'shadow') startShadow();
        else if (a === 'transcript') {
          state.showTranscript = !state.showTranscript;
          transcript.hidden = !state.showTranscript;
          view.querySelector('#transcript-btn').textContent = state.showTranscript ? '隐藏原文' : '显示原文';
          if (state.showTranscript) renderTranscript();
        }
        return;
      }
      const rateBtn = e.target.closest('[data-rate]');
      if (rateBtn) {
        state.rate = Number(rateBtn.dataset.rate);
        view.querySelectorAll('#speed-seg [data-rate]').forEach(function (b) { b.classList.toggle('active', b === rateBtn); });
        if (state.playing) playCurrent(state.continuous);
        return;
      }
      const line = e.target.closest('[data-sentence]');
      if (line) {
        goTo(Number(line.dataset.sentence), true);
      }
    });

    panel.addEventListener('change', function (e) {
      const input = e.target.closest('[data-opt]');
      if (!input) return;
      const key = input.dataset.opt;
      if (key === 'continuous') state.continuous = input.checked;
      if (key === 'zh') { state.showZh = input.checked; updateSentence(); renderTranscript(); }
      if (key === 'signals') { state.showSignals = input.checked; updateSentence(); renderTranscript(); }
    });

    /* Questions */
    function optionLetters(i) { return ['A', 'B', 'C', 'D'][i] || String(i + 1); }

    function questionCard(q, i) {
      const picked = state.answers[q.id];
      const answered = picked !== undefined;
      return '<div class="q-card" data-qid="' + q.id + '">' +
        '<div class="q-head"><span class="q-no">Q' + (i + 1) + '</span><div class="q-text">' + C.esc(q.q) + '</div><span class="q-type">' + C.esc(q.type) + '</span></div>' +
        '<div class="option-list">' + q.options.map(function (opt, oi) {
          let cls = 'option';
          if (answered && oi === q.answer) cls += ' correct';
          else if (answered && oi === picked) cls += ' wrong';
          return '<button class="' + cls + '" data-opt="' + oi + '"' + (answered ? ' disabled' : '') + '><span class="k">' + optionLetters(oi) + '</span><span>' + C.esc(opt) + '</span></button>';
        }).join('') + '</div>' +
        (answered ? '<div class="q-result ' + (picked === q.answer ? 'good' : 'bad') + '">' + C.icon(picked === q.answer ? 'check-circle' : 'x-circle', 12) + (picked === q.answer ? '正确' : '正确答案：' + optionLetters(q.answer)) + '</div>' +
          '<div class="explain">' + C.esc(q.explain) + '<span class="evidence">依据：第 ' + (q.evidence + 1) + ' 句 · ' + C.esc(set.script[q.evidence] ? set.script[q.evidence].en : '') + '</span></div>' : '') +
        '</div>';
    }

    function renderQuestions() {
      list.innerHTML = set.questions.map(questionCard).join('');
      const answeredCount = Object.keys(state.answers).length;
      const correct = set.questions.filter(function (q) { return state.answers[q.id] !== undefined && state.answers[q.id] === q.answer; }).length;
      const best = (S.state.listening[set.id] || {}).best || 0;
      if (state.finished) {
        scoreHost.innerHTML = '<div class="score-bar"><div><div class="big">' + correct + ' / ' + set.questions.length + '</div><div class="small muted">本轮正确率 ' + Math.round((correct / set.questions.length) * 100) + '% · 历史最佳 ' + best + '%</div></div>' +
          '<div class="spacer"></div><button class="btn btn-sm" data-retry>重做本套</button></div>';
      } else {
        scoreHost.innerHTML = '<div class="row-between" style="padding:0 2px 10px"><span class="small muted">已答 ' + answeredCount + ' / ' + set.questions.length + '</span><span class="small faint">点击选项即可判分</span></div>';
      }
      const retry = scoreHost.querySelector('[data-retry]');
      if (retry) retry.addEventListener('click', function () {
        state.answers = {}; state.finished = false; state.logged = false; state.startTime = Date.now();
        renderQuestions();
      });
    }

    list.addEventListener('click', function (e) {
      const opt = e.target.closest('[data-opt]');
      if (!opt) return;
      const card = opt.closest('[data-qid]');
      if (!card) return;
      const q = set.questions.find(function (x) { return x.id === card.dataset.qid; });
      if (!q || state.answers[q.id] !== undefined) return;
      const picked = Number(opt.dataset.opt);
      state.answers[q.id] = picked;
      if (picked !== q.answer) {
        S.addError({
          module: 'listening', sourceId: q.id, title: set.title, prompt: q.q,
          your: q.options[picked], correct: q.options[q.answer], cause: q.cause,
          explain: q.explain, link: '#/listening?set=' + set.id
        });
      }
      const answeredAll = set.questions.every(function (x) { return state.answers[x.id] !== undefined; });
      if (answeredAll && !state.finished) {
        state.finished = true;
        const correct = set.questions.filter(function (x) { return state.answers[x.id] === x.answer; }).length;
        S.recordListening(set.id, correct, set.questions.length);
        const minutes = Math.max(1, Math.round((Date.now() - state.startTime) / 60000));
        S.logStudy('listening', minutes, 1, 14);
        state.logged = true;
        C.toast('本套完成：' + correct + ' / ' + set.questions.length + ' 正确', correct >= set.questions.length * 0.6 ? 'good' : 'info');
        C.app.refreshShell();
      }
      renderQuestions();
    });

    renderQuestions();

    return function () {
      stopSpeech();
      if (!state.logged && Object.keys(state.answers).length > 0) {
        const minutes = Math.max(1, Math.round((Date.now() - state.startTime) / 60000));
        S.logStudy('listening', minutes, 1, 0);
      }
    };
  }

  function detailHead(set, mode) {
    const type = TYPE[set.type] || { label: set.type, chip: 'chip-muted' };
    return C.ui.pageHead({
      eyebrow: 'LISTENING · ' + type.label.toUpperCase(),
      title: set.title,
      sub: set.intro,
      actions: '<a class="btn btn-sm" href="#/listening?tab=original">' + C.icon('arrow-left', 14) + '原创题库</a>' +
        '<a class="btn btn-sm" href="#/listening?set=' + set.id + '&mode=questions">听力题</a>' +
        '<a class="btn btn-sm" href="#/listening?set=' + set.id + '&mode=dictation">逐句听写</a>' +
        '<a class="btn btn-sm" href="#/listening">真题精听</a>'
    }) + topTabs('original') + '<div class="tabs mb-3">' +
      '<a class="tab' + (mode === 'questions' ? ' active' : '') + '" href="#/listening?set=' + set.id + '&mode=questions">听力题</a>' +
      '<a class="tab' + (mode === 'dictation' ? ' active' : '') + '" href="#/listening?set=' + set.id + '&mode=dictation">逐句听写</a>' +
      '</div>';
  }

  /* ---------- Dictation ---------- */
  function renderDictation(view, ctx, set) {
    const best = (S.state.listening[set.id] || {}).dictationBest || 0;
    const state = {
      idx: 0, rate: 1, showZh: false, playing: false, checked: false, results: [],
      started: Date.now(), logged: false, lastDiff: null, playToken: 0
    };

    view.innerHTML = detailHead(set, 'dictation') +
      ttsNoteHTML() +
      '<div class="dictation-card">' +
        '<div class="dict-toolbar">' +
          '<div class="row"><button class="play-btn" id="dict-play" aria-label="播放本句">' + C.icon('play', 18) + '</button>' +
          '<div><div style="font-weight:600;font-size:13px">听写第 <span id="dict-idx">1</span> / ' + set.script.length + ' 句</div><div class="small muted">先听，再写；对照差异后进入下一句</div></div></div>' +
          '<div class="row"><label class="toggle"><input type="checkbox" id="dict-zh"><span class="track"></span><span>中文提示</span></label>' +
          '<div class="seg seg-sm speed-seg" id="dict-speed">' + RATES.map(function (r) {
            return '<button data-rate="' + r + '" class="' + (r === state.rate ? 'active' : '') + '">' + r + 'x</button>';
          }).join('') + '</div></div>' +
        '</div>' +
        '<div class="progress progress-accent mb-2"><i id="dict-progress" style="width:0%"></i></div>' +
        '<div id="dict-host"></div>' +
        '<div class="row-between mt-2" style="flex-wrap:wrap"><span class="small muted">历史最佳 ' + (best ? best + '%' : '—') + ' · 音频由浏览器朗读</span>' +
        '<span class="small faint">Ctrl / ⌘ + Enter 检查</span></div>' +
      '</div>' +
      '<div id="dict-summary"></div>';

    const host = view.querySelector('#dict-host');
    const playBtn = view.querySelector('#dict-play');
    const zhToggle = view.querySelector('#dict-zh');

    function current() { return set.script[state.idx]; }

    function stopSpeech() {
      state.playToken++;
      state.playing = false;
      C.speech.stop();
      playBtn.innerHTML = C.icon('play', 18);
      playBtn.classList.remove('playing');
    }

    function speakCurrent() {
      if (!C.speech.supported) { C.toast('当前浏览器不支持语音合成', 'bad'); return; }
      stopSpeech();
      const token = ++state.playToken;
      state.playing = true;
      playBtn.innerHTML = C.icon('pause', 18);
      playBtn.classList.add('playing');
      C.speech.speak(current().en, { rate: state.rate }).then(function () {
        if (token !== state.playToken) return;
        state.playing = false;
        playBtn.innerHTML = C.icon('play', 18);
        playBtn.classList.remove('playing');
      });
    }

    function renderDict() {
      const s = current();
      view.querySelector('#dict-idx').textContent = state.idx + 1;
      view.querySelector('#dict-progress').style.width = Math.round((state.idx / set.script.length) * 100) + '%';
      host.innerHTML = '<div class="field"><label>听到的句子</label><textarea class="dict-input" id="dict-input" placeholder="在这里写下你听到的完整句子…" spellcheck="false"></textarea></div>' +
        (state.showZh ? '<div class="sentence-zh">' + C.esc(s.zh) + '</div>' : '') +
        '<div class="row mt-2" style="flex-wrap:wrap"><button class="btn btn-primary" id="dict-check">检查</button>' +
        '<button class="btn" id="dict-reveal">看答案</button>' +
        '<button class="btn btn-ghost" id="dict-next" disabled>下一句 ' + C.icon('arrow-right', 13) + '</button>' +
        '<span class="small faint" style="margin-left:auto">句 ' + (state.idx + 1) + ' · ' + C.esc(s.spk || 'N') + '</span></div>' +
        '<div id="dict-feedback"></div>';
      state.checked = false;
      state.lastDiff = null;
      const input = host.querySelector('#dict-input');
      if (input) setTimeout(function () { input.focus(); }, 80);
      host.querySelector('#dict-check').addEventListener('click', function () { checkDict(false); });
      host.querySelector('#dict-reveal').addEventListener('click', function () { checkDict(true); });
      host.querySelector('#dict-next').addEventListener('click', function () { nextDict(); });
      if (zhToggle.checked !== state.showZh) zhToggle.checked = state.showZh;
    }

    function checkDict(reveal) {
      if (state.checked) return;
      const s = current();
      const input = host.querySelector('#dict-input');
      const typed = input ? input.value.trim() : '';
      if (!typed && !reveal) { C.toast('先写下你听到的内容，或点“看答案”', 'info'); return; }
      state.checked = true;
      const diff = C.speech.diffWords(s.en, typed);
      state.lastDiff = diff;
      state.results.push({ idx: state.idx, accuracy: reveal && !typed ? 0 : diff.accuracy, typed: typed, target: s.en });
      if (input) { input.disabled = true; input.classList.add(diff.accuracy >= 80 ? 'ok' : 'bad'); }
      const fb = host.querySelector('#dict-feedback');
      fb.innerHTML = '<div class="divider-dashed"></div><div class="row-between" style="align-items:flex-start"><div><div class="small muted">你的准确率</div><div class="dict-accuracy">' + diff.accuracy + '<small style="font-size:13px;color:var(--muted)">%</small></div></div>' +
        '<div class="small muted" style="text-align:right">漏 ' + diff.missing + ' 词 · 多 ' + diff.extra + ' 词</div></div>' +
        '<div class="dict-diff">' + C.speech.diffHTML(diff) + '</div>' +
        '<div class="sentence-zh">' + C.esc(s.zh) + '</div>' +
        '<div class="small muted mt-1">原句：<span class="serif" style="font-size:13px">' + C.esc(s.en) + '</span></div>';
      const next = host.querySelector('#dict-next');
      next.disabled = false;
      next.focus();
    }

    function nextDict() {
      if (!state.checked) return;
      if (state.idx >= set.script.length - 1) { finishDict(); return; }
      state.idx++;
      renderDict();
    }

    function finishDict() {
      const results = state.results;
      const avg = results.length ? Math.round(results.reduce(function (a, b) { return a + b.accuracy; }, 0) / results.length) : 0;
      S.recordDictation(set.id, avg);
      const minutes = Math.max(1, Math.round((Date.now() - state.started) / 60000));
      S.logStudy('listening', minutes, results.length, 10);
      state.logged = true;
      host.innerHTML = '';
      view.querySelector('#dict-progress').style.width = '100%';
      const summary = view.querySelector('#dict-summary');
      summary.innerHTML = '<div class="card mt-2"><div class="session-summary"><div class="eyebrow no-rule" style="justify-content:center">DICTATION COMPLETE</div>' +
        '<div class="session-score num">' + avg + '<small>%</small></div><div class="small muted">本套听写平均准确率 · 历史最佳 ' + ((S.state.listening[set.id] || {}).dictationBest || 0) + '%</div>' +
        '<div class="summary-grid"><div class="summary-cell"><b>' + results.length + '</b><span>完成句数</span></div>' +
        '<div class="summary-cell"><b>' + results.filter(function (r) { return r.accuracy >= 80; }).length + '</b><span>准确率 ≥80%</span></div>' +
        '<div class="summary-cell"><b>' + results.filter(function (r) { return r.accuracy < 50; }).length + '</b><span>需要重听</span></div></div>' +
        '<div style="max-width:540px;margin:0 auto 16px;text-align:left">' + results.map(function (r) {
          return '<div class="row-between" style="padding:6px 0;border-bottom:1px dashed var(--line);font-size:11.5px"><span class="mono muted">#' + (r.idx + 1) + '</span><span style="flex:1;padding:0 10px">' + C.esc(C.truncate(r.target, 62)) + '</span><span class="mono">' + r.accuracy + '%</span></div>';
        }).join('') + '</div>' +
        '<div class="row" style="justify-content:center;flex-wrap:wrap"><button class="btn btn-primary" data-dict-again>再听一遍</button>' +
        '<a class="btn" href="#/listening?set=' + set.id + '&mode=questions">去做听力题</a><a class="btn btn-ghost" href="#/listening">回到题库</a></div>' +
        '</div></div>';
      summary.querySelector('[data-dict-again]').addEventListener('click', function () {
        state.idx = 0; state.checked = false; state.results = []; state.logged = false; state.started = Date.now();
        view.querySelector('#dict-summary').innerHTML = '';
        renderDict();
      });
      C.toast('听写完成，平均准确率 ' + avg + '%', avg >= 80 ? 'good' : 'info');
    }

    playBtn.addEventListener('click', function () {
      if (state.playing) stopSpeech(); else speakCurrent();
    });
    zhToggle.addEventListener('change', function () {
      state.showZh = zhToggle.checked;
      if (!state.checked) {
        const input = host.querySelector('#dict-input');
        const typed = input ? input.value : '';
        renderDict();
        const restored = host.querySelector('#dict-input');
        if (restored) { restored.value = typed; restored.focus(); }
      }
    });
    view.querySelectorAll('#dict-speed [data-rate]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.rate = Number(btn.dataset.rate);
        view.querySelectorAll('#dict-speed [data-rate]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        if (state.playing) speakCurrent();
      });
    });
    view.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        checkDict(false);
      }
    });
    renderDict();

    return function () {
      stopSpeech();
      if (!state.logged && state.results.length > 0) {
        const minutes = Math.max(1, Math.round((Date.now() - state.started) / 60000));
        S.logStudy('listening', minutes, state.results.length, 0);
      }
    };
  }

  function render(view, ctx) {
    const realId = ctx.params.get('real');
    if (realId && C.realListening) return C.realListening.renderSet(view, ctx, realId);
    const tab = ctx.params.get('tab');
    if (tab === 'words' && C.realListening) return C.realListening.renderWords(view, ctx);
    if (tab === 'signals') return renderSignalLibrary(view);
    const setId = ctx.params.get('set');
    if (setId) {
      const set = setById(setId);
      if (!set) return renderSetList(view);
      const mode = ctx.params.get('mode') === 'dictation' ? 'dictation' : 'questions';
      if (mode === 'dictation') return renderDictation(view, ctx, set);
      return renderQuestionsMode(view, ctx, set);
    }
    if (tab === 'original') return renderSetList(view);
    if (C.realListening) return C.realListening.renderHub(view, ctx);
    return renderSetList(view);
  }

  C.listeningUI = { tabs: topTabs, ttsNote: ttsNoteHTML };
  C.views.listening = { render: render };
})();
