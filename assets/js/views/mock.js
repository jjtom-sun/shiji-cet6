/* Full mock exam — 130-minute four-section runner and report */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;
  const EXAM = () => C.data.examInfo;

  function paperPrompts(paper) {
    return {
      writing: C.data.writingPrompts.find(function (p) { return p.id === paper.writing; }) || C.data.writingPrompts[0],
      translation: C.data.translations.find(function (p) { return p.id === paper.translation; }) || C.data.translations[0]
    };
  }

  function landing(view) {
    const strictDefault = S.state.settings.strictMock !== false;
    const mocks = S.state.mocks || [];
    const best = mocks.length ? Math.max.apply(null, mocks.map(function (m) { return m.total || 0; })) : null;
    const latest = mocks[0] || null;
    const info = EXAM();

    view.innerHTML = C.ui.pageHead({
      eyebrow: 'FULL MOCK EXAM',
      title: '全真模考',
      sub: '130 分钟 · 写作 → 听力 → 阅读 → 翻译。严格模式按顺序作答，听力只播放一次。',
      actions: '<button class="btn" data-mock-guide>' + C.icon('info', 14) + '考试说明</button>' +
        '<a class="btn" href="#/analytics">' + C.icon('chart', 14) + '查看诊断</a>'
    }) +
    '<div class="stat-row mb-3">' +
      C.ui.stat('ATTEMPTS', mocks.length, '已完成模考', '次') +
      C.ui.stat('BEST', best == null ? '—' : best, '最佳总分', '') +
      C.ui.stat('LATEST', latest ? latest.total : '—', latest ? C.fmtDate(latest.date, 'short') : '尚未模考', '') +
      C.ui.stat('MODE', strictDefault ? '严格' : '练习', '可在下方切换', '') +
    '</div>' +
    '<div class="exam-landing">' +
      '<div class="stack">' +
        '<div class="card"><div class="card-head"><div><div class="card-title">选择组合卷</div><div class="card-sub">两套原创仿真题，结构相同、题目不同。</div></div>' +
          '<label class="toggle"><input type="checkbox" id="strict-toggle"' + (strictDefault ? ' checked' : '') + '><span class="track"></span><span>严格模式</span></label></div>' +
          '<div class="grid grid-2">' + C.data.mockPapers.map(function (p, idx) {
            const pr = paperPrompts(p);
            return '<div class="card card--soft" style="background:var(--surface)"><div class="row-between"><span class="badge badge-jade">' + C.esc(p.id) + '</span><span class="tiny mono muted">130 MIN</span></div>' +
              '<div class="card-title" style="margin-top:7px">' + C.esc(p.title) + '</div><div class="small muted">' + C.esc(p.subtitle) + '</div>' +
              '<div class="divider-dashed"></div><div class="small"><b>写作</b> · ' + C.esc(pr.writing.title) + '</div><div class="small mt-1"><b>翻译</b> · ' + C.esc(pr.translation.title) + '</div>' +
              '<div class="small mt-1"><b>听力</b> 25 题 · <b>阅读</b> 30 题</div>' +
              '<button class="btn btn-primary btn-block mt-2" data-start-paper="' + p.id + '">' + C.icon('play', 14) + '开始这一套</button></div>';
          }).join('') + '</div>' +
          (C.speech.supported ? '' : '<div class="notice mt-2">' + C.icon('alert', 14) + '<span>当前浏览器不支持语音合成，听力部分无法播放音频。建议使用 Chrome 或 Edge。</span></div>') +
        '</div>' +
        '<div class="card"><div class="card-head"><div><div class="card-title">考试结构</div><div class="card-sub">与六级一致的顺序与时长</div></div><span class="badge">总计 130 分钟</span></div>' +
          '<div class="timeline">' + info.sections.map(function (s, i) {
            return '<div class="tl-item"><span class="tl-dot">' + (i + 1) + '</span><div class="tl-body"><b>' + C.esc(s.zh) + ' · ' + C.esc(s.en) + '</b><span>' + C.esc(s.note) + '</span></div><span class="tl-time">' + s.minutes + ' MIN</span></div>';
          }).join('') + '</div></div>' +
      '</div>' +
      '<aside class="stack">' +
        '<div class="card"><div class="card-head"><div><div class="card-title">考场规则</div><div class="card-sub">严格模式下会强制执行</div></div></div>' +
          '<div class="exam-rules">' + info.rules.map(function (r) {
            return '<div class="rule">' + C.icon('check-circle', 14) + '<span>' + C.esc(r) + '</span></div>';
          }).join('') + '</div>' +
          '<div class="notice mt-2">' + C.icon('info', 14) + '<span>' + C.esc(C.data.scoreNote) + '</span></div></div>' +
        '<div class="card"><div class="card-head"><div><div class="card-title">最近模考</div><div class="card-sub">交卷后自动保存</div></div></div>' +
          (mocks.length ? '<div class="history-list">' + mocks.slice(0, 5).map(function (m) {
            return '<div class="history-item"><span class="h-date">' + C.fmtDate(m.date, 'short') + '</span><span class="h-title">' + C.esc(m.paperTitle || '组合卷') + ' · ' + (m.strict ? '严格' : '练习') + '</span><span class="h-score">' + m.total + '</span></div>';
          }).join('') + '</div>' : '<div class="small muted">还没有记录。第一套的意义不是分数，而是暴露短板。</div>') +
        '</div>' +
        '<div class="card card--wash"><div class="quote-box">“A mock exam is a mirror, not a verdict.”</div><footer>模考是镜子，不是判决 · 拾级手记</footer></div>' +
      '</aside>' +
    '</div>';

    let strict = strictDefault;
    view.querySelector('#strict-toggle').addEventListener('change', function (e) {
      strict = e.target.checked;
      S.setSettings({ strictMock: strict });
      C.toast(strict ? '已选择严格模式' : '已选择练习模式', 'info', 1600);
    });
    view.querySelectorAll('[data-start-paper]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const paper = C.data.mockPapers.find(function (p) { return p.id === btn.dataset.startPaper; });
        if (!paper) return;
        C.confirmDialog({
          title: '开始 ' + paper.title + '？',
          message: strict ? '严格模式：四个部分按顺序进行，听力只播放一次，进入下一部分后不可返回，倒计时结束会自动推进。' : '练习模式：可以自由切换部分并重复播放听力，但计时仍然保留。',
          confirmText: '开始考试',
          sub: '总时长 130 分钟'
        }).then(function (ok) { if (ok) startExam(paper, strict); });
      });
    });
    view.querySelector('[data-mock-guide]').addEventListener('click', function () {
      C.openModal({ title: '全真模考说明', sub: '与正式考试的结构、时长和边界', body: '<div class="exam-rules">' + EXAM().rules.map(function (r) { return '<div class="rule">' + C.icon('check-circle', 14) + '<span>' + C.esc(r) + '</span></div>'; }).join('') + '</div><div class="notice mt-2">' + C.icon('alert', 14) + '<span>听力音频由浏览器语音合成朗读，与官方录音音色不同；分数为练习估算。</span></div>', actions: [{ label: '知道了' }] });
    });
    return function () { C.speech.stop(); };
  }

  /* ================= Runner ================= */
  function startExam(paper, strict) {
    const prompts = paperPrompts(paper);
    const listeningSets = paper.listening.map(function (id) { return C.data.listening.find(function (s) { return s.id === id; }); }).filter(Boolean);
    const cloze = C.data.cloze.find(function (c) { return c.id === paper.reading.cloze; });
    const matching = C.data.matching.find(function (m) { return m.id === paper.reading.matching; });
    const careful = paper.reading.careful.map(function (id) { return C.data.careful.find(function (r) { return r.id === id; }); }).filter(Boolean);
    const sectionDefs = EXAM().sections;
    const totalQ = sectionDefs.reduce(function (sum, s) { return sum + (s.id === 'listening' ? 25 : s.id === 'reading' ? 30 : 1); }, 0);

    const answers = { writing: '', listening: {}, reading: { cloze: {}, matching: {}, careful: {} }, translation: '' };
    const remaining = sectionDefs.map(function (s) { return s.minutes * 60; });
    const expired = sectionDefs.map(function () { return false; });
    const startedAt = Date.now();
    const audio = { started: false, playing: false, token: 0 };
    let current = 0;
    let submitted = false;
    let submitting = false;
    let clock = null;
    let resultScreen = false;

    const overlay = document.createElement('div');
    overlay.className = 'exam-runner';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '全真模考');
    overlay.innerHTML = '<div class="exam-head" id="exam-head"></div><div class="exam-body" id="exam-body"></div><div class="exam-nav" id="exam-nav"></div>';
    document.body.appendChild(overlay);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onBeforeUnload = function (e) {
      if (submitted) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    const head = overlay.querySelector('#exam-head');
    const body = overlay.querySelector('#exam-body');
    const nav = overlay.querySelector('#exam-nav');

    function section() { return sectionDefs[current]; }

    function counts() {
      if (current === 0) {
        const words = C.countWords(answers.writing);
        return { answered: words > 0 ? 1 : 0, total: 1, label: words + ' 词' };
      }
      if (current === 1) {
        const n = Object.keys(answers.listening).length;
        return { answered: n, total: 25, label: n + ' / 25' };
      }
      if (current === 2) {
        const n = Object.keys(answers.reading.cloze).length + Object.keys(answers.reading.matching).length + Object.keys(answers.reading.careful).length;
        return { answered: n, total: 30, label: n + ' / 30' };
      }
      const words = C.countWords(answers.translation);
      return { answered: words > 0 ? 1 : 0, total: 1, label: words + ' 词' };
    }

    function renderShell() {
      const c = counts();
      head.innerHTML = '<div class="exam-brand"><span class="mini"><img src="assets/img/logo.svg" alt=""></span><div><b>拾级 · 全真模考</b><span>' + C.esc(paper.title) + ' · ' + (strict ? 'STRICT' : 'PRACTICE') + '</span></div></div>' +
        (strict ? '' : '<div class="seg" id="exam-tabs" style="flex:0 0 auto">' + sectionDefs.map(function (s, i) {
          return '<button data-jump="' + i + '" class="' + (i === current ? 'active' : '') + '">' + C.esc(s.zh) + '</button>';
        }).join('') + '</div>') +
        '<div class="exam-progress"><div class="row-between"><span id="exam-part-label">PART ' + (current + 1) + ' / 4 · ' + C.esc(section().zh) + '</span><span id="exam-progress-text">' + c.label + '</span></div>' +
          '<div class="progress progress-accent"><i id="exam-progress-bar" style="width:' + Math.round((c.answered / c.total) * 100) + '%"></i></div></div>' +
        '<div class="exam-timer" id="exam-timer"><span id="exam-time">' + C.fmtDuration(remaining[current]) + '</span><span class="exam-timer-label">' + C.esc(section().en.toUpperCase()) + '</span></div>' +
        '<button class="btn btn-sm" data-exam-exit>' + C.icon('x', 13) + '退出</button>';
      const prevDisabled = strict || current === 0;
      const nextLabel = current === sectionDefs.length - 1 ? '交卷' : '完成本节';
      nav.innerHTML = '<button class="btn btn-sm" data-nav-prev' + (prevDisabled ? ' disabled' : '') + '>' + C.icon('arrow-left', 13) + '上一部分</button>' +
        '<div class="center small muted">第 ' + (current + 1) + ' / ' + sectionDefs.length + ' 部分 · ' + C.esc(section().zh) + ' · ' + C.esc(strict ? '严格模式' : '练习模式') + '</div>' +
        '<button class="btn btn-sm ' + (current === sectionDefs.length - 1 ? 'btn-accent' : 'btn-primary') + '" data-nav-next>' + C.esc(nextLabel) + ' ' + C.icon('arrow-right', 13) + '</button>';
      updateTimerUI();
    }

    function updateTimerUI() {
      const el = document.getElementById('exam-time');
      const timer = document.getElementById('exam-timer');
      if (!el || !timer) return;
      el.textContent = C.fmtDuration(remaining[current]);
      timer.classList.toggle('warn', remaining[current] <= 300 && remaining[current] > 60);
      timer.classList.toggle('danger', remaining[current] <= 60);
    }

    function updateProgress() {
      const c = counts();
      const label = document.getElementById('exam-progress-text');
      const bar = document.getElementById('exam-progress-bar');
      if (label) label.textContent = c.label;
      if (bar) bar.style.width = Math.round((c.answered / c.total) * 100) + '%';
    }

    /* ---------- Section bodies ---------- */
    function writingBody() {
      return '<div class="exam-section"><div class="exam-section-head"><div><h2>Writing</h2><p>' + section().minutes + ' 分钟 · 150–200 词 · 建议三段</p></div><span class="badge badge-violet">PART 1</span></div>' +
        '<div class="exam-writing-grid"><div class="prompt-card"><div class="card-kicker">DIRECTIONS</div><div class="prompt-title">' + C.esc(prompts.writing.title) + '</div>' +
          '<div class="prompt-body">' + C.esc(prompts.writing.task) + '</div>' +
          '<div class="prompt-points">' + prompts.writing.keyPoints.map(function (k) { return '<li>' + C.esc(k) + '</li>'; }).join('') + '</div></div>' +
        '<div class="editor-card"><div class="editor-toolbar"><span class="small muted">答题卡 · 只保留在当前考试中</span><span class="live-stats">词数 <b id="exam-wc">' + C.countWords(answers.writing) + '</b></span></div>' +
        '<textarea class="editor-area" id="exam-writing" placeholder="Write your essay here…">' + C.esc(answers.writing) + '</textarea></div></div></div>';
    }

    function audioHTML() {
      return '<div class="audio-once"><span class="pulse-dot" style="' + (audio.playing ? '' : 'animation:none;background:var(--faint)') + '"></span>' +
        '<div style="flex:1"><b class="small">' + (audio.playing ? '录音播放中' : audio.started ? '录音已开始' : '听力录音尚未播放') + '</b>' +
        '<div class="small muted" id="exam-audio-status">' + (strict ? '严格模式：开始后只能播放一次，不能暂停或重播。' : '练习模式：可以停止并重播全部录音。') + '</div></div>' +
        '<button class="btn btn-sm btn-primary" data-start-audio' + (!C.speech.supported || (strict && audio.started) ? ' disabled' : '') + '>' + C.icon('play', 12) + (strict && audio.started ? '不可重播' : audio.playing ? '播放中' : audio.started ? '重播' : '开始播放') + '</button></div>';
    }

    function listeningBody() {
      let idx = 0;
      return '<div class="exam-section"><div class="exam-section-head"><div><h2>Listening</h2><p>' + section().minutes + ' 分钟 · 25 题 · ' + (strict ? '录音仅播放一次' : '录音可重播') + '</p></div><span class="badge badge-blue">PART 2</span></div>' +
        audioHTML() +
        (!C.speech.supported ? '<div class="notice mb-2">' + C.icon('alert', 14) + '<span>浏览器不支持语音合成，本次无法播放听力。可先完成其他部分。</span></div>' : '') +
        '<div class="grid grid-2">' + listeningSets.map(function (set) {
          return '<div class="card"><div class="card-head" style="margin-bottom:8px"><div><div class="card-title" style="font-size:16px">' + C.esc(set.title) + '</div><div class="card-sub">' + C.esc(set.scene) + ' · ' + set.questions.length + ' 题</div></div><span class="badge">' + C.esc(set.id) + '</span></div>' +
            set.questions.map(function (q) {
              idx++;
              const picked = answers.listening[q.id];
              return '<div class="q-card" style="margin-top:8px;padding:12px" data-lqid="' + q.id + '"><div class="q-head"><span class="q-no">' + idx + '</span><div class="q-text">' + C.esc(q.q) + '</div></div>' +
                '<div class="option-list" style="margin-top:8px">' + q.options.map(function (o, oi) {
                  return '<button class="option' + (picked === oi ? ' selected' : '') + '" data-listen-opt="' + oi + '" data-qid="' + q.id + '"><span class="k">' + ['A', 'B', 'C', 'D'][oi] + '</span><span>' + C.esc(o) + '</span></button>';
                }).join('') + '</div></div>';
            }).join('') + '</div>';
        }).join('') + '</div></div>';
    }

    function clozePassageHTML() {
      const options = '<option value="">—</option>' + cloze.bank.map(function (b) { return '<option value="' + C.esc(b.word) + '">' + C.esc(b.word) + '</option>'; }).join('');
      return cloze.passage.split(/\n\n/).map(function (para) {
        return '<p>' + C.esc(para).replace(/\{\{(\d+)\}\}/g, function (_, n) {
          const selected = answers.reading.cloze[n] || '';
          return '<select class="select exam-blank-select" data-cloze-n="' + n + '" aria-label="第 ' + n + ' 空">' + options.replace('value="' + C.esc(selected) + '"', 'value="' + C.esc(selected) + '" selected') + '</select>';
        }) + '</p>';
      }).join('');
    }

    function readingBody() {
      let ci = 0, mi = 0;
      let carefulStart = 0;
      return '<div class="exam-section"><div class="exam-section-head"><div><h2>Reading</h2><p>' + section().minutes + ' 分钟 · 选词 10 + 匹配 10 + 仔细 10</p></div><span class="badge badge-jade">PART 3</span></div>' +
        '<div class="card mb-2"><div class="card-head"><div><div class="card-title">Section A · ' + C.esc(cloze.title) + '</div><div class="card-sub">选词填空 · 从 15 个词中为 10 个空选择</div></div><span class="badge">10 × 1</span></div>' +
          '<div class="word-bank mb-2">' + cloze.bank.map(function (b) { return '<span class="bank-word" style="pointer-events:none">' + C.esc(b.word) + '<small>' + C.esc(b.pos) + '</small></span>'; }).join('') + '</div>' +
          '<div class="passage">' + clozePassageHTML() + '</div></div>' +
        '<div class="card mb-2"><div class="card-head"><div><div class="card-title">Section B · ' + C.esc(matching.title) + '</div><div class="card-sub">长篇匹配 · 为每个陈述选择段落 A–H</div></div><span class="badge">10 × 1</span></div>' +
          '<div class="matching-layout"><div class="reader-passage match-passage">' + matching.paragraphs.map(function (p) {
            return '<div class="match-para"><span class="para-label">' + p.id + '</span>' + C.esc(p.text) + '</div>';
          }).join('') + '</div>' +
          '<div class="statement-list">' + matching.statements.map(function (s) {
            const sel = answers.reading.matching[s.id] || '';
            return '<div class="statement" style="cursor:default"><span class="s-no">' + C.pad2(++mi) + '</span><span class="s-text">' + C.esc(s.text) + '</span>' +
              '<select class="select exam-para-select" data-match-sid="' + s.id + '" aria-label="选择段落">' + '<option value="">—</option>' + matching.paragraphs.map(function (p) {
                return '<option value="' + p.id + '"' + (sel === p.id ? ' selected' : '') + '>' + p.id + '</option>';
              }).join('') + '</select></div>';
          }).join('') + '</div></div></div>' +
        careful.map(function (r, ri) {
          return '<div class="card mb-2"><div class="card-head"><div><div class="card-title">Section C · Passage ' + (ri + 1) + ' · ' + C.esc(r.title) + '</div><div class="card-sub">' + C.esc(r.topic) + ' · 5 题</div></div><span class="badge">5 × 2</span></div>' +
            '<div class="reader-two"><div class="reader-passage careful-passage">' + r.paragraphs.map(function (p) {
              return '<p>' + p.sentences.map(function (s) { return C.esc(s.en); }).join(' ') + '</p>';
            }).join('') + '</div>' +
            '<div class="reader-questions">' + r.questions.map(function (q) {
              const picked = answers.reading.careful[q.id];
              carefulStart++;
              return '<div class="q-card" data-rqid="' + q.id + '"><div class="q-head"><span class="q-no">' + (carefulStart) + '</span><div class="q-text">' + C.esc(q.q) + '</div><span class="q-type ' + C.esc(q.type) + '">' + C.esc({ detail: '细节', main: '主旨', infer: '推断', vocab: '词义', attitude: '态度' }[q.type] || q.type) + '</span></div>' +
                '<div class="option-list">' + q.options.map(function (o, oi) {
                  return '<button class="option' + (picked === oi ? ' selected' : '') + '" data-careful-opt="' + oi + '" data-qid="' + q.id + '"><span class="k">' + ['A', 'B', 'C', 'D'][oi] + '</span><span>' + C.esc(o) + '</span></button>';
                }).join('') + '</div></div>';
            }).join('') + '</div></div></div>';
        }).join('') + '</div>';
    }

    function translationBody() {
      return '<div class="exam-section"><div class="exam-section-head"><div><h2>Translation</h2><p>' + section().minutes + ' 分钟 · 汉译英 · 保持术语一致</p></div><span class="badge badge-gold">PART 4</span></div>' +
        '<div class="exam-writing-grid"><div class="prompt-card"><div class="card-kicker">TRANSLATE INTO ENGLISH</div><div class="prompt-title">' + C.esc(prompts.translation.title) + '</div>' +
          '<div class="prompt-body" style="font-family:var(--serif);font-size:15px;line-height:1.95">' + C.esc(prompts.translation.zh) + '</div>' +
          '<div class="notice mt-2">' + C.icon('info', 14) + '<span>考试中不提供术语表。先保证主谓完整与逻辑清楚，再追求高级表达。</span></div></div>' +
        '<div class="editor-card"><div class="editor-toolbar"><span class="small muted">答题卡</span><span class="live-stats">词数 <b id="exam-tw">' + C.countWords(answers.translation) + '</b></span></div>' +
        '<textarea class="editor-area" id="exam-translation" placeholder="Write your translation here…">' + C.esc(answers.translation) + '</textarea></div></div></div>';
    }

    function renderBody() {
      body.innerHTML = current === 0 ? writingBody() : current === 1 ? listeningBody() : current === 2 ? readingBody() : translationBody();
      body.scrollTop = 0;
    }

    function renderAll() {
      renderShell();
      renderBody();
      updateTimerUI();
    }

    function goSection(i) {
      if (submitted || i < 0 || i >= sectionDefs.length) return;
      if (strict && i !== current + 1) {
        if (i !== current) return;
      }
      stopAudio();
      current = i;
      renderAll();
    }

    /* ---------- Audio ---------- */
    function audioSeq() {
      const list = [];
      listeningSets.forEach(function (set) {
        set.script.forEach(function (line) {
          list.push({ title: set.title, text: line.en });
        });
      });
      return list;
    }

    function stopAudio() {
      audio.token++;
      audio.playing = false;
      C.speech.stop();
      updateAudioUI('');
    }

    function updateAudioUI(status) {
      if (resultScreen) return;
      const statusEl = overlay.querySelector('#exam-audio-status');
      const btn = overlay.querySelector('[data-start-audio]');
      if (statusEl && status) statusEl.textContent = status;
      if (!btn) return;
      if (!C.speech.supported) { btn.disabled = true; return; }
      if (strict && audio.started) {
        btn.disabled = true;
        btn.innerHTML = C.icon('volume-x', 12) + '不可重播';
        return;
      }
      btn.disabled = false;
      btn.innerHTML = C.icon(audio.playing ? 'pause' : 'play', 12) + (audio.playing ? '播放中' : audio.started ? '重播' : '开始播放');
    }

    function playAudio() {
      if (!C.speech.supported) { C.toast('当前浏览器不支持语音合成', 'bad'); return; }
      if (strict && audio.started) return;
      if (audio.playing) { stopAudio(); return; }
      audio.started = true;
      audio.playing = true;
      const token = ++audio.token;
      const seq = audioSeq();
      let i = 0;
      updateAudioUI('严格模式：录音只播放一次，请边听边作答。');
      function next() {
        if (token !== audio.token || submitted) return;
        if (i >= seq.length) {
          audio.playing = false;
          updateAudioUI('录音播放结束。');
          return;
        }
        const item = seq[i++];
        const statusEl = overlay.querySelector('#exam-audio-status');
        if (statusEl) statusEl.textContent = '正在播放：' + item.title + ' · ' + i + ' / ' + seq.length;
        C.speech.speak(item.text, { rate: 1 }).then(function () {
          if (token !== audio.token || submitted) return;
          setTimeout(next, 360);
        });
      }
      next();
    }

    /* ---------- Timer ---------- */
    function tick() {
      if (submitted || submitting) return;
      if (remaining[current] > 0) {
        remaining[current]--;
        updateTimerUI();
        if (remaining[current] === 0) onTimeUp();
      }
    }

    function onTimeUp() {
      const s = section();
      expired[current] = true;
      updateTimerUI();
      if (strict) {
        C.toast(s.zh + '部分时间到，自动进入下一部分', 'bad', 3200);
        if (current < sectionDefs.length - 1) setTimeout(function () { if (!submitted) goSection(current + 1); }, 700);
        else setTimeout(function () { if (!submitted) doSubmit(); }, 700);
      } else {
        C.toast(s.zh + '部分时间到，仍可继续作答；建议尽快交卷', 'info', 3600);
      }
    }

    /* ---------- Grading ---------- */
    function addWrong(module, sourceId, title, prompt, your, correct, cause, explain, link) {
      S.addError({ module: module, sourceId: sourceId, title: title, prompt: prompt, your: your, correct: correct, cause: cause, explain: explain, link: link });
    }

    function computeResult() {
      let listeningCorrect = 0;
      listeningSets.forEach(function (set) {
        let setCorrect = 0;
        set.questions.forEach(function (q) {
          if (answers.listening[q.id] === q.answer) setCorrect++;
          else {
            const picked = answers.listening[q.id];
            addWrong('listening', q.id, set.title, q.q, picked === undefined ? '未作答' : q.options[picked], q.options[q.answer], q.cause, q.explain + ' 依据：' + set.script[q.evidence].en, '#/listening?set=' + set.id);
          }
        });
        listeningCorrect += setCorrect;
        S.recordListening(set.id, setCorrect, set.questions.length);
      });

      let clozeCorrect = 0;
      cloze.answers.forEach(function (a, i) {
        if (answers.reading.cloze[i + 1] === a) clozeCorrect++;
        else {
          const picked = answers.reading.cloze[i + 1];
          const ex = cloze.explanations[i];
          const cause = ex.type === '语法' ? '语法理解偏差' : ex.type === '逻辑' ? '信息遗漏' : '词汇不认识';
          addWrong('reading', cloze.id + '-b' + (i + 1), cloze.title + ' · 第 ' + (i + 1) + ' 空', '选词填空', picked || '未作答', a, cause, ex.why, '#/reading?tab=cloze&id=' + cloze.id);
        }
      });
      S.recordReading(cloze.id, clozeCorrect, 10, 0);

      let matchingCorrect = 0;
      matching.statements.forEach(function (s) {
        if (answers.reading.matching[s.id] === s.answer) matchingCorrect++;
        else {
          addWrong('reading', s.id, matching.title, s.text, answers.reading.matching[s.id] ? '段落 ' + answers.reading.matching[s.id] : '未作答', '段落 ' + s.answer, '定位错误', s.explain + ' 依据：' + s.evidence, '#/reading?tab=matching&id=' + matching.id);
        }
      });
      S.recordReading(matching.id, matchingCorrect, 10, 0);

      let carefulCorrect = 0;
      careful.forEach(function (r) {
        let c = 0;
        r.questions.forEach(function (q) {
          const picked = answers.reading.careful[q.id];
          if (picked === q.answer) c++;
          else {
            addWrong('reading', q.id, r.title, q.q, picked === undefined ? '未作答' : q.options[picked], q.options[q.answer], q.cause, q.explain + ' 正确依据：' + r.paragraphs[q.evidence.p].sentences[q.evidence.s].en, '#/reading?tab=careful&id=' + r.id);
          }
        });
        carefulCorrect += c;
        S.recordReading(r.id, c, r.questions.length, 0);
      });

      const writingText = answers.writing.trim();
      const writingResult = C.countWords(writingText) >= 30 ? C.engine.analyze(writingText, { type: 'writing', prompt: prompts.writing }) : null;
      const writingBand = writingResult ? writingResult.scores.band : 0;
      const translationText = answers.translation.trim();
      const translationResult = C.countWords(translationText) >= 15 ? C.engine.analyze(translationText, { type: 'translation', prompt: prompts.translation }) : null;
      const translationBand = translationResult ? translationResult.scores.band : 0;

      if (writingResult) S.addSubmission('writing', prompts.writing.id, '模考 · ' + prompts.writing.title, writingText, writingBand);
      if (translationResult) S.addSubmission('translation', prompts.translation.id, '模考 · ' + prompts.translation.title, translationText, translationBand);

      const lPoints = Math.round(248.5 * (listeningCorrect / 25) * 10) / 10;
      const rPoints = Math.round(248.5 * ((clozeCorrect + matchingCorrect + carefulCorrect) / 30) * 10) / 10;
      const wPoints = Math.round(106.5 * (writingBand / 15) * 10) / 10;
      const tPoints = Math.round(106.5 * (translationBand / 15) * 10) / 10;
      const total = Math.round(lPoints + rPoints + wPoints + tPoints);
      const readingCorrect = clozeCorrect + matchingCorrect + carefulCorrect;
      const minutes = Math.max(1, Math.min(130, Math.round((Date.now() - startedAt) / 60000)));

      S.addMock({
        paperId: paper.id, paperTitle: paper.title, strict: strict,
        total: total,
        scores: { listening: lPoints, reading: rPoints, writing: wPoints, translation: tPoints, total: total },
        breakdown: {
          listening: { correct: listeningCorrect, total: 25 },
          reading: { correct: readingCorrect, total: 30, cloze: clozeCorrect, matching: matchingCorrect, careful: carefulCorrect },
          writing: { band: writingBand, words: C.countWords(writingText) },
          translation: { band: translationBand, words: C.countWords(translationText) }
        },
        durationSeconds: Math.round((Date.now() - startedAt) / 1000)
      });
      S.logStudy('mock', minutes, 1, 60);

      const wrong = [];
      listeningSets.forEach(function (set) {
        set.questions.forEach(function (q) { if (answers.listening[q.id] !== q.answer) wrong.push({ label: set.title, q: q.q, your: answers.listening[q.id] === undefined ? '未作答' : q.options[answers.listening[q.id]], correct: q.options[q.answer] }); });
      });
      cloze.answers.forEach(function (a, i) {
        if (answers.reading.cloze[i + 1] !== a) wrong.push({ label: cloze.title, q: '选词填空 · 第 ' + (i + 1) + ' 空', your: answers.reading.cloze[i + 1] || '未作答', correct: a });
      });
      matching.statements.forEach(function (s) {
        if (answers.reading.matching[s.id] !== s.answer) wrong.push({ label: matching.title, q: s.text, your: answers.reading.matching[s.id] ? '段落 ' + answers.reading.matching[s.id] : '未作答', correct: '段落 ' + s.answer });
      });
      careful.forEach(function (r) {
        r.questions.forEach(function (q) { if (answers.reading.careful[q.id] !== q.answer) wrong.push({ label: r.title, q: q.q, your: answers.reading.careful[q.id] === undefined ? '未作答' : q.options[answers.reading.careful[q.id]], correct: q.options[q.answer] }); });
      });

      return {
        listeningCorrect, readingCorrect, clozeCorrect, matchingCorrect, carefulCorrect,
        writingBand, translationBand, writingResult, translationResult,
        lPoints, rPoints, wPoints, tPoints, total, wrong, minutes
      };
    }

    function scoreLevel(total) {
      if (total >= 550) return '基础扎实，可以冲高分';
      if (total >= 500) return '已越过常见及格线，继续补短板';
      if (total >= 425) return '接近常见及格线，优先补听力与阅读';
      return '先把高频词与基础定位练稳';
    }

    function showResult(res) {
      resultScreen = true;
      document.body.style.overflow = prevOverflow;
      overlay.innerHTML = '<div class="result-screen"><div class="exam-result">' +
        '<div class="result-hero"><div class="eyebrow" style="justify-content:center">MOCK COMPLETE · ' + C.esc(paper.title) + '</div>' +
          '<div class="score-big num">' + res.total + '<small> / 710</small></div>' +
          '<div class="result-sub">' + C.esc(scoreLevel(res.total)) + ' · ' + (strict ? '严格模式' : '练习模式') + ' · 用时 ' + res.minutes + ' 分钟</div>' +
          '<div class="section-scores">' +
            '<div class="ss-cell"><div class="ss-label">LISTENING</div><div class="ss-val">' + res.lPoints + '<small> / 248.5</small></div><div class="progress"><i style="width:' + (res.listeningCorrect / 25) * 100 + '%"></i></div><div class="tiny muted mt-1">' + res.listeningCorrect + ' / 25 题</div></div>' +
            '<div class="ss-cell"><div class="ss-label">READING</div><div class="ss-val">' + res.rPoints + '<small> / 248.5</small></div><div class="progress"><i style="width:' + (res.readingCorrect / 30) * 100 + '%"></i></div><div class="tiny muted mt-1">' + res.readingCorrect + ' / 30 题</div></div>' +
            '<div class="ss-cell"><div class="ss-label">WRITING</div><div class="ss-val">' + res.wPoints + '<small> / 106.5</small></div><div class="progress"><i style="width:' + (res.writingBand / 15) * 100 + '%"></i></div><div class="tiny muted mt-1">档位 ' + res.writingBand + ' / 15</div></div>' +
            '<div class="ss-cell"><div class="ss-label">TRANSLATION</div><div class="ss-val">' + res.tPoints + '<small> / 106.5</small></div><div class="progress"><i style="width:' + (res.translationBand / 15) * 100 + '%"></i></div><div class="tiny muted mt-1">档位 ' + res.translationBand + ' / 15</div></div>' +
          '</div></div>' +
        '<div class="result-grid">' +
          '<div class="card"><div class="card-title" style="font-size:17px">客观题拆解</div><div class="metric-row"><span>听力</span><b>' + res.listeningCorrect + ' / 25</b></div>' +
            '<div class="metric-row"><span>选词填空</span><b>' + res.clozeCorrect + ' / 10</b></div><div class="metric-row"><span>长篇匹配</span><b>' + res.matchingCorrect + ' / 10</b></div><div class="metric-row"><span>仔细阅读</span><b>' + res.carefulCorrect + ' / 10</b></div>' +
            '<div class="notice mt-2">' + C.icon('info', 14) + '<span>客观题按线性折算，写作与翻译按本地规则引擎档位折算，仅作练习反馈。</span></div></div>' +
          '<div class="card"><div class="card-title" style="font-size:17px">主观题反馈</div>' +
            '<div class="metric-row"><span>写作</span><b>' + (res.writingResult ? res.writingBand + ' / 15 · ' + C.esc(res.writingResult.scores.bandLabel) : '未完成') + '</b></div>' +
            (res.writingResult ? '<div class="small muted mt-1">' + C.esc(res.writingResult.advice[0].title + '：' + res.writingResult.advice[0].text) + '</div>' : '') +
            '<div class="metric-row mt-1"><span>翻译</span><b>' + (res.translationResult ? res.translationBand + ' / 15 · ' + C.esc(res.translationResult.scores.bandLabel) : '未完成') + '</b></div>' +
            (res.translationResult ? '<div class="small muted mt-1">' + C.esc(res.translationResult.advice[0].title + '：' + res.translationResult.advice[0].text) + '</div>' : '') +
            '<div class="row mt-2" style="flex-wrap:wrap"><a class="btn btn-sm" href="#/writing?tab=write&prompt=' + prompts.writing.id + '" data-result-nav>写作工坊</a><a class="btn btn-sm" href="#/writing?tab=translate&prompt=' + prompts.translation.id + '" data-result-nav>翻译工坊</a></div></div>' +
        '</div>' +
        '<div class="card mt-2"><div class="row-between"><div class="card-title" style="font-size:17px">错题摘要</div><span class="badge">' + res.wrong.length + ' 题</span></div>' +
          (res.wrong.length ? res.wrong.slice(0, 8).map(function (w) {
            return '<div class="recent-item"><span class="recent-time">' + C.esc(C.truncate(w.label, 12)) + '</span><span class="recent-text">' + C.esc(C.truncate(w.q, 84)) + '<br><span class="small muted">你的：' + C.esc(w.your) + ' · 正确：' + C.esc(w.correct) + '</span></span></div>';
          }).join('') + (res.wrong.length > 8 ? '<div class="small faint mt-1">还有 ' + (res.wrong.length - 8) + ' 题已存入错题本。</div>' : '') : '<div class="notice">' + C.icon('check-circle', 14) + '<span>客观题没有错题。下一步可以对照作文与译文反馈，挑一处具体改进。</span></div>') +
          '<div class="row mt-2"><a class="btn btn-primary" href="#/errors" data-result-nav>打开错题本</a><a class="btn" href="#/analytics" data-result-nav>查看能力诊断</a><span class="spacer"></span><a class="btn btn-ghost" href="#/mock" data-result-nav>再做一套</a><a class="btn btn-ghost" href="#/dashboard" data-result-nav>回到驾驶舱</a></div></div>' +
        '<div class="source-note center mt-3">已保存到本机 · 模考分数为练习估算，不等同于官方成绩</div>' +
        '</div></div>';
      C.app.refreshShell();
      setTimeout(function () { const el = overlay.querySelector('.result-screen'); if (el) el.scrollTop = 0; }, 30);
      overlay.querySelectorAll('[data-result-nav]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          const href = a.getAttribute('href');
          closeRunner();
          C.app.navigate(href);
        });
      });
    }

    function doSubmit() {
      if (submitted) return;
      submitted = true;
      clearInterval(clock);
      stopAudio();
      const res = computeResult();
      showResult(res);
    }

    function requestSubmit() {
      if (submitted || submitting) return;
      submitting = true;
      C.confirmDialog({
        title: '确认交卷？',
        message: '交卷后不能再修改答案；客观题自动判分，写作与翻译使用本地规则引擎估算。',
        confirmText: '交卷',
        danger: false
      }).then(function (ok) {
        submitting = false;
        if (ok) doSubmit();
      });
    }

    function attemptExit() {
      if (submitted) { closeRunner(); return; }
      C.confirmDialog({
        title: '退出本次模考？',
        message: '当前作答不会保存，也不会生成成绩。',
        confirmText: '退出考试',
        danger: true
      }).then(function (ok) { if (ok) closeRunner(); });
    }

    function closeRunner() {
      clearInterval(clock);
      audio.token++;
      C.speech.stop();
      document.removeEventListener('keydown', escForExam);
      window.removeEventListener('beforeunload', onBeforeUnload);
      overlay.remove();
      document.body.style.overflow = prevOverflow;
    }

    /* ---------- Delegated events ---------- */
    overlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-exam-exit]')) { attemptExit(); return; }
      const jump = e.target.closest('[data-jump]');
      if (jump && !strict) { goSection(Number(jump.dataset.jump)); return; }
      const prev = e.target.closest('[data-nav-prev]');
      if (prev && !strict && current > 0) { goSection(current - 1); return; }
      const next = e.target.closest('[data-nav-next]');
      if (next) {
        if (current < sectionDefs.length - 1) goSection(current + 1);
        else requestSubmit();
        return;
      }
      const audioBtn = e.target.closest('[data-start-audio]');
      if (audioBtn) { playAudio(); return; }
      const lopt = e.target.closest('[data-listen-opt]');
      if (lopt) {
        const qid = lopt.dataset.qid;
        const idx = Number(lopt.dataset.listenOpt);
        answers.listening[qid] = idx;
        const card = lopt.closest('[data-lqid]');
        if (card) card.querySelectorAll('[data-listen-opt]').forEach(function (b) { b.classList.toggle('selected', b === lopt); });
        updateProgress();
        return;
      }
      const ropt = e.target.closest('[data-careful-opt]');
      if (ropt) {
        const qid = ropt.dataset.qid;
        const idx = Number(ropt.dataset.carefulOpt);
        answers.reading.careful[qid] = idx;
        const card = ropt.closest('[data-rqid]');
        if (card) card.querySelectorAll('[data-careful-opt]').forEach(function (b) { b.classList.toggle('selected', b === ropt); });
        updateProgress();
      }
    });

    overlay.addEventListener('change', function (e) {
      const clozeSel = e.target.closest('[data-cloze-n]');
      if (clozeSel) {
        answers.reading.cloze[clozeSel.dataset.clozeN] = clozeSel.value;
        updateProgress();
        return;
      }
      const matchSel = e.target.closest('[data-match-sid]');
      if (matchSel) {
        answers.reading.matching[matchSel.dataset.matchSid] = matchSel.value;
        updateProgress();
      }
    });

    overlay.addEventListener('input', function (e) {
      if (e.target.id === 'exam-writing') {
        answers.writing = e.target.value;
        const wc = overlay.querySelector('#exam-wc');
        if (wc) wc.textContent = C.countWords(answers.writing);
        updateProgress();
      } else if (e.target.id === 'exam-translation') {
        answers.translation = e.target.value;
        const wc = overlay.querySelector('#exam-tw');
        if (wc) wc.textContent = C.countWords(answers.translation);
        updateProgress();
      }
    });

    document.addEventListener('keydown', escForExam);
    function escForExam(e) {
      if (e.key === 'Escape' && !document.querySelector('.modal-scrim')) attemptExit();
    }

    // Fit the runner scroll on small screens
    renderAll();
    clock = setInterval(tick, 1000);
    setTimeout(function () {
      const ta = overlay.querySelector('textarea');
      if (ta) ta.focus();
    }, 80);
  }

  function render(view, ctx) {
    return landing(view);
  }

  C.views.mock = { render: render };
})();
