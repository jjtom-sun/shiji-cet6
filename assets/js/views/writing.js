/* Writing & translation studio */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;

  const TYPE_LABEL = { grammar: '语法', spelling: '拼写', collocation: '搭配', punctuation: '标点', style: '风格' };
  const THEMES = ['历史', '文化', '经济', '社会'];

  function tabs(active) {
    return '<div class="tabs mb-3">' +
      '<a class="tab' + (active === 'write' ? ' active' : '') + '" href="#/writing?tab=write">写作工坊</a>' +
      '<a class="tab' + (active === 'translate' ? ' active' : '') + '" href="#/writing?tab=translate">翻译工坊</a>' +
      '<a class="tab' + (active === 'corpus' ? ' active' : '') + '" href="#/writing?tab=corpus">主题语料</a>' +
      '<a class="tab' + (active === 'replace' ? ' active' : '') + '" href="#/writing?tab=replace">替换词典</a>' +
      '<a class="tab' + (active === 'patterns' ? ' active' : '') + '" href="#/writing?tab=patterns">句式模板</a>' +
      '</div>';
  }

  function pageHead(active) {
    return C.ui.pageHead({
      eyebrow: 'WRITING & TRANSLATION',
      title: '写作与翻译工坊',
      sub: '限时写作、主题语料、术语覆盖检查与本地规则批改；不联网也能得到可操作的修改建议。',
      actions: '<button class="btn" data-score-guide>' + C.icon('info', 14) + '评分说明</button>' +
        '<a class="btn" href="#/writing?tab=corpus">' + C.icon('book-open', 14) + '主题语料</a>'
    }) + tabs(active);
  }

  function draftKey(type, id) { return 'draft_' + type + '_' + id; }
  function readDraft(type, id) {
    const d = S.state.flags[draftKey(type, id)];
    return d && typeof d.text === 'string' ? d.text : '';
  }
  function writeDraft(type, id, text) {
    S.state.flags[draftKey(type, id)] = { text: text, updated: Date.now() };
    S.save();
  }
  function clearDraft(type, id) {
    delete S.state.flags[draftKey(type, id)];
    S.save();
  }

  function createTimer(limitMinutes, onTick) {
    let elapsed = 0;
    let running = false;
    let interval = null;
    let expired = false;
    let started = false;
    const limit = limitMinutes * 60;
    function tick() {
      if (!running) return;
      elapsed++;
      if (elapsed >= limit) {
        elapsed = limit;
        running = false;
        expired = true;
        clearInterval(interval);
        interval = null;
        if (onTick) onTick(remaining(), elapsed, true);
        return;
      }
      if (onTick) onTick(remaining(), elapsed, false);
    }
    function start() {
      if (running || expired) return;
      if (!started) started = true;
      running = true;
      if (!interval) interval = setInterval(tick, 1000);
      if (onTick) onTick(remaining(), elapsed, false);
    }
    function pause() {
      running = false;
      if (interval) { clearInterval(interval); interval = null; }
      if (onTick) onTick(remaining(), elapsed, false);
    }
    function stop() { running = false; if (interval) { clearInterval(interval); interval = null; } }
    function remaining() { return Math.max(0, limit - elapsed); }
    return {
      start: start, pause: pause, stop: stop, remaining: remaining, elapsed: function () { return elapsed; },
      running: function () { return running; }, started: function () { return started; }, expired: function () { return expired; }
    };
  }

  function timerChip(id) {
    return '<span class="timer-chip" id="' + id + '">' + C.icon('clock', 12) + '<span>30:00</span></span>' +
      '<button class="btn btn-sm btn-ghost" data-timer-toggle>计时</button>';
  }

  function fmtTimer(sec) { return C.fmtDuration(sec); }

  function bandDial(band) {
    const pct = (band / 15) * 100;
    return '<div class="band-dial">' + C.charts.ring(pct, 118, { stroke: 6 }) +
      '<div><div class="band-num">' + band + '</div><div class="band-den">/ 15</div></div></div>';
  }

  function issueSeverity(sev) { return sev === 'high' ? 'high' : sev === 'low' ? 'low' : ''; }

  function feedbackHTML(result, opts) {
    opts = opts || {};
    const prompt = opts.prompt;
    const type = opts.type;
    const scaled = Math.round((result.scores.band / 15) * 106.5 * 10) / 10;
    let html = '<div class="card feedback-card">' +
      '<div class="card-head"><div><div class="card-title">' + (type === 'translation' ? '翻译批改' : '写作批改') + '</div><div class="card-sub">本地规则引擎估算 · 不是官方评分</div></div>' +
      '<span class="badge ' + (result.scores.band >= 10 ? 'badge-jade' : result.scores.band >= 7 ? 'badge-gold' : 'badge-danger') + '">' + C.esc(result.scores.bandLabel) + '</span></div>' +
      '<div class="band-row">' + bandDial(result.scores.band) +
        '<div class="band-verdict">' + C.esc(result.scores.bandLabel) + '<div class="band-note">' + C.esc(result.scores.bandDesc) + '<br>折算六级分 ≈ ' + scaled + ' / 106.5</div></div>' +
        '<div class="dim-list">' + result.dimensions.map(function (d) {
          return '<div class="dim-row"><span class="muted">' + C.esc(d.name) + '</span><span class="bar" style="height:5px;background:var(--surface-3);border-radius:99px;overflow:hidden"><i style="display:block;height:100%;width:' + d.value + '%;background:' + d.color + ';border-radius:99px"></i></span><b>' + d.value + '</b></div>';
        }).join('') + '</div>' +
      '</div>';

    html += '<div class="feedback-section"><div class="feedback-heading">' + C.icon('compass', 15) + '下一步改什么</div>' +
      '<div class="stack-sm">' + result.advice.map(function (a) {
        return '<div class="notice accent">' + C.icon('lightbulb', 14) + '<span><b>' + C.esc(a.title) + '：</b>' + C.esc(a.text) + '</span></div>';
      }).join('') + '</div></div>';

    if (result.coverage && result.coverage.total) {
      html += '<div class="feedback-section"><div class="feedback-heading">' + C.icon('target', 15) + (type === 'translation' ? '术语覆盖' : '内容要点') + '<span class="count-pill">' + result.coverage.hit + ' / ' + result.coverage.total + '</span></div>' +
        '<div class="term-checklist">' + result.coverage.items.map(function (t) {
          return '<div class="term-check' + (t.hit ? ' hit' : '') + '"><span class="b">' + C.icon('check', 8) + '</span><span>' + C.esc(t.zh) + '</span>' +
            '<span class="en">' + (t.hit ? '✓ ' + C.esc(t.matched || '') : (type === 'translation' ? '未出现' : '未覆盖')) + '</span></div>';
        }).join('') + '</div></div>';
    }

    const issues = result.issues.filter(function (i) { return i.type !== 'style'; });
    html += '<div class="feedback-section"><div class="feedback-heading">' + C.icon('pen', 15) + '逐句标记<span class="count-pill">' + issues.length + ' 处</span></div>' +
      '<div class="essay-preview">' + C.engine.renderMarked(opts.text || '', issues) + '</div></div>';

    if (opts.text && issues.length) {
      html += '<div class="feedback-section"><div class="feedback-heading">' + C.icon('list', 15) + '问题清单</div><div class="error-list">' +
        issues.slice(0, 14).map(function (i) {
          return '<div class="error-item"><span class="sev ' + issueSeverity(i.severity) + '"></span><div class="e-body"><b>' + C.esc(i.message) + '</b>' +
            (i.suggestion ? '<br><span class="small muted">建议：<span class="fix">' + C.esc(i.suggestion) + '</span></span>' : '') +
            '<br><span class="small faint">「' + C.esc(C.truncate(i.text, 80)) + '」</span></div><span class="e-type">' + C.esc(TYPE_LABEL[i.type] || i.type) + '</span></div>';
        }).join('') + '</div>' + (issues.length > 14 ? '<div class="small faint mt-1">仅显示前 14 处，完整标记见上方。</div>' : '') + '</div>';
    } else if (opts.text) {
      html += '<div class="feedback-section"><div class="notice">' + C.icon('check-circle', 14) + '<span>规则引擎没有发现明显的高频错误。仍建议自己朗读一遍，检查逻辑与语气。</span></div></div>';
    }

    if (result.upgrades.length) {
      html += '<div class="feedback-section"><div class="feedback-heading">' + C.icon('sparkles', 15) + '可升级表达<span class="count-pill">' + result.upgrades.length + '</span></div>' +
        '<div class="upgrade-list">' + result.upgrades.map(function (u, i) {
          return '<div class="upgrade-item"><span class="from">' + C.esc(u.from) + '</span><span class="arrow">→</span><span class="to">' + C.esc(u.to) + '</span><span class="why">' + C.esc(u.note) + '</span><button class="btn btn-sm btn-ghost" data-up="' + i + '">应用</button></div>';
        }).join('') + '</div>' +
        '<div class="row mt-2"><span class="small faint">逐条应用，替换后会自动重新批改；请检查搭配是否符合语境。</span></div></div>';
    }

    if (opts.referenceHtml) {
      html += '<div class="feedback-section"><div class="feedback-heading">' + C.icon('book-open', 15) + '参考译文与语块</div>' + opts.referenceHtml + '</div>';
    }
    if (opts.modelHtml) {
      html += '<div class="feedback-section"><div class="feedback-heading">' + C.icon('bookmark', 15) + '参考范文<span class="count-pill">' + (prompt && prompt.model ? C.countWords(prompt.model.replace(/\[\[|\]\]/g, '')) + ' 词' : '') + '</span></div>' +
        '<details class="gp" open><summary>' + C.icon('chevron-right', 13) + '展开对照，注意高亮表达</summary><p><div class="model-essay">' + opts.modelHtml + '</div></p></details></div>';
    }

    html += '<div class="feedback-section"><div class="row-between" style="flex-wrap:wrap;gap:8px"><div><div class="feedback-heading" style="margin-bottom:2px">' + C.icon('sparkles', 15) + 'AI 深度批改<span class="count-pill">可选</span></div><span class="small muted">调用你在设置中配置的接口，做一次独立于本地规则的二次批改。</span></div>' +
      ((C.store.state.settings.llm && C.store.state.settings.llm.enabled && C.store.state.settings.llm.apiKey) ? '<button class="btn btn-sm" data-llm-review>' + C.icon('sparkles', 12) + '开始 AI 批改</button>' : '<a class="btn btn-sm" href="#/settings">' + C.icon('settings', 12) + '去接入</a>') + '</div></div>';

    html += '<div class="feedback-section"><div class="row-between"><span class="source-note">规则引擎 · 仅作练习参考</span><button class="btn btn-sm" data-feedback-top>' + C.icon('arrow-up', 13) + '回到编辑</button></div></div>';
    html += '</div>';
    return html;
  }

  function modelHtml(text) {
    let html = C.esc(text || '');
    html = html.replace(/\[\[([\s\S]*?)\]\]/g, '<span class="hl">$1</span>');
    return html;
  }

  function referenceHtml(prompt) {
    if (!prompt) return '';
    return '<div class="notice mb-2">' + C.icon('info', 14) + '<span>参考译文用于对照，不是唯一答案。先比较语块，再回看自己的句子结构。</span></div>' +
      '<div class="model-essay">' + C.esc(prompt.reference) + '</div>' +
      '<div class="chunk-table mt-2">' + (prompt.chunks || []).map(function (c) {
        return '<div class="chunk-row"><span class="cz">' + C.esc(c.zh) + '</span><span class="ce">' + C.esc(c.en) + '</span></div>';
      }).join('') + '</div>';
  }

  function historyFor(type, promptId) {
    return (S.state.submissions || []).filter(function (s) { return s.type === type && (!promptId || s.promptId === promptId); }).slice(0, 5);
  }

  function historyHTML(type, promptId) {
    const list = historyFor(type, promptId);
    if (!list.length) return '<div class="small muted">还没有提交记录。完成一次批改后会保存在本机。</div>';
    return '<div class="history-list">' + list.map(function (s) {
      return '<div class="history-item"><span class="h-date">' + C.fmtDateTime(s.created) + '</span><span class="h-title">' + C.esc(s.promptTitle) + '</span>' +
        '<span class="h-score">' + s.band + '/15</span><button class="btn btn-sm btn-ghost" data-load-sub="' + s.id + '">载入</button></div>';
    }).join('') + '</div>';
  }

  function sideTips(type) {
    if (type === 'translation') {
      return C.data.translationTips.slice(0, 3).map(function (t) {
        return '<div class="plan-item"><div class="plan-body"><div class="plan-title">' + C.esc(t.title) + '</div><div class="plan-meta" style="line-height:1.55">' + C.esc(t.text) + '</div></div></div>';
      }).join('');
    }
    return C.data.writingTips.slice(0, 3).map(function (t) {
      return '<div class="plan-item"><div class="plan-body"><div class="plan-title">' + C.esc(t.title) + '</div><div class="plan-meta" style="line-height:1.55">' + C.esc(t.text) + '</div></div></div>';
    }).join('');
  }

  function openScoreGuide() {
    const bands = C.data.bandDescriptors.map(function (b) {
      return '<div class="row-between" style="padding:7px 0;border-bottom:1px dashed var(--line)"><span><b>' + b.label + '</b> <span class="mono small muted">' + b.min + '–' + b.max + '</span></span><span class="small muted" style="max-width:70%;text-align:right">' + C.esc(b.desc) + '</span></div>';
    }).join('');
    C.openModal({
      title: '批改与评分说明',
      sub: '15 分制 · 规则引擎 + 可解释维度',
      body: '<p class="page-sub" style="margin-top:0">' + C.esc(C.data.scoreNote) + '</p><div class="mt-2">' + bands + '</div>' +
        '<div class="notice mt-2">' + C.icon('alert', 14) + '<span>本地引擎擅长发现拼写、主谓一致、搭配与标点问题；它无法可靠判断论证深度、语气微妙差异与语义连贯。请把它当作第一遍筛错，而不是最终判分。</span></div>',
      actions: [{ label: '知道了' }]
    });
  }

  function openLLMReview(opts) {
    const llm = C.store.state.settings.llm || {};
    if (!llm.enabled || !llm.apiKey) { C.toast('请先在设置中启用 AI 增强', 'info'); return; }
    const dialog = C.openModal({
      title: 'AI 深度批改',
      sub: '会把当前文本与题目发送到你配置的接口',
      body: '<div class="msg-typing">正在请求二次批改…</div><div class="small faint mt-2">本地规则批改已经完成；这一层是独立的模型批改，可能更细，也可能出错。</div>',
      actions: [{ label: '关闭' }]
    });
    const body = dialog.modal.querySelector('.modal-body');
    C.engine.llmReview(opts).then(function (text) {
      if (!dialog.modal.isConnected) return;
      body.innerHTML = '<div class="notice mb-2">' + C.icon('alert', 14) + '<span>模型批改仅供参考，请以题目要求与教师反馈为准。</span></div>' +
        '<div class="essay-preview" style="font-family:var(--sans);font-size:13px;white-space:normal;line-height:1.75">' + C.esc(text).replace(/\n/g, '<br>') + '</div>' +
        '<div class="row mt-2"><button class="btn btn-sm" data-copy-ai>复制批改</button></div>';
      const copy = body.querySelector('[data-copy-ai]');
      if (copy) copy.addEventListener('click', function () { C.copyText(text); C.toast('已复制', 'good', 1400); });
    }).catch(function (err) {
      if (!dialog.modal.isConnected) return;
      body.innerHTML = '<div class="notice">' + C.icon('alert', 14) + '<span>接口请求失败：' + C.esc(err.message) + '。本地规则批改仍然有效；可在设置中检查地址、模型与 CORS。</span></div>';
    });
  }

  /* ================= Writing ================= */
  function renderWriting(view, ctx) {
    const prompts = C.data.writingPrompts;
    const promptId = ctx.params.get('prompt') || prompts[0].id;
    const prompt = prompts.find(function (p) { return p.id === promptId; }) || prompts[0];
    const draft = readDraft('writing', prompt.id);
    const state = { prompt: prompt, result: null, timer: null, lastText: draft };

    view.innerHTML = pageHead('write') +
      '<div class="writing-layout">' +
        '<div class="stack">' +
          '<div class="card prompt-card">' +
            '<div class="row-between" style="align-items:flex-start;flex-wrap:wrap;gap:8px"><div><div class="card-kicker">WRITING TASK · 30 MIN</div><div class="prompt-title">' + C.esc(prompt.title) + '</div></div>' +
            '<div class="cluster">' + prompts.map(function (p) {
              return '<a class="chip' + (p.id === prompt.id ? ' active' : '') + '" href="#/writing?tab=write&prompt=' + p.id + '">' + C.esc(p.title) + '</a>';
            }).join('') + '</div></div>' +
            '<div class="prompt-body">' + C.esc(prompt.task) + '</div>' +
            '<div class="prompt-points">' + prompt.keyPoints.map(function (k) { return '<li>' + C.esc(k) + '</li>'; }).join('') + '</div>' +
            '<div class="row mt-2" style="gap:14px;flex-wrap:wrap"><details class="gp" style="flex:1"><summary>' + C.icon('chevron-right', 13) + '可用的开头句式</summary><p>' + prompt.starters.map(function (s) { return '· ' + C.esc(s); }).join('<br>') + '</p></details>' +
            '<details class="gp" style="flex:1"><summary>' + C.icon('chevron-right', 13) + '常见失分点</summary><p>' + prompt.pitfalls.map(function (s) { return '· ' + C.esc(s); }).join('<br>') + '</p></details></div>' +
          '</div>' +
          '<div class="editor-card">' +
            '<div class="editor-toolbar"><div class="row">' + timerChip('write-timer') + '</div>' +
              '<div class="live-stats"><span>字数 <b id="w-count">0</b> / ' + prompt.wordTarget[0] + '–' + prompt.wordTarget[1] + '</span><span>句 <b id="w-sent">0</b></span><span>段 <b id="w-para">0</b></span></div></div>' +
            '<textarea class="editor-area" id="write-editor" placeholder="Start writing here…&#10;&#10;建议分三段：立场段、论证段、让步或建议段。">' + C.esc(draft) + '</textarea>' +
            '<div class="editor-foot"><span class="small muted">自动保存在本机 · 不要刷新页面以保留计时</span><div class="row"><button class="btn btn-sm" data-clear-write>清空</button><button class="btn btn-primary" data-submit-write>' + C.icon('check', 13) + '提交批改</button></div></div>' +
          '</div>' +
          '<div id="writing-feedback"></div>' +
        '</div>' +
        '<aside class="stack">' +
          '<div class="side-panel">' +
            '<div class="card-kicker">LIVE</div><div class="row-between mt-1"><span class="small muted">目标字数</span><b id="w-target-progress">0%</b></div>' +
            '<div class="progress progress-accent mt-1"><i id="w-target-bar" style="width:0%"></i></div>' +
            '<div class="metric-row mt-2"><span>平均句长</span><b id="w-avg">0</b></div>' +
            '<div class="metric-row"><span>词汇多样性</span><b id="w-ttr">0</b></div>' +
            '<div class="metric-row"><span>从句密度</span><b id="w-clause">0</b></div>' +
            '<div class="metric-row"><span>衔接词</span><b id="w-trans">0</b></div>' +
            '<div class="small faint mt-2">提交后生成任务完成、语言准确、词汇、句式、衔接五项评分。</div>' +
          '</div>' +
          '<div class="side-panel"><div class="card-kicker">STRUCTURE</div><div class="card-title" style="font-size:16px;margin-top:4px">三段式检查</div>' +
            '<div class="small muted mt-1" style="line-height:1.7">1. 第一段两句话内亮明立场<br>2. 主体段：观点 + 具体例证 + 解释<br>3. 结尾：让步或可操作建议，不重复开头</div>' +
            '<div class="divider-dashed"></div>' + sideTips('writing') + '</div>' +
          '<div class="side-panel"><div class="row-between"><div class="card-kicker">HISTORY</div><span class="small faint">最近 5 次</span></div><div class="mt-1" id="writing-history">' + historyHTML('writing', prompt.id) + '</div></div>' +
          '<div class="notice">' + C.icon('info', 14) + '<span>范文与题目为原创六级仿真材料；参考范文只在提交后显示，避免先看后写。</span></div>' +
        '</aside>' +
      '</div>' +
      '<div class="source-note mt-3">' + C.esc(C.data.writingNote) + '</div>';

    const editor = view.querySelector('#write-editor');
    const feedbackHost = view.querySelector('#writing-feedback');
    const timerEl = view.querySelector('#write-timer');
    const timerBtn = view.querySelector('[data-timer-toggle]');
    let analyzedResult = null;

    function updateTimerDisplay(remaining, elapsed, expired) {
      const span = timerEl.querySelector('span');
      if (span) span.textContent = fmtTimer(remaining);
      timerEl.style.color = remaining <= 300 ? 'var(--danger)' : '';
      if (timerBtn) timerBtn.textContent = state.timer && state.timer.running() ? '暂停' : state.timer && state.timer.started() ? '继续' : '计时';
      if (expired) C.toast('30 分钟已到。建议停止写作并提交批改。', 'bad', 3600);
    }

    state.timer = createTimer(prompt.time, updateTimerDisplay);

    function liveMetrics() {
      const text = editor.value;
      const m = C.engine.metrics(text);
      view.querySelector('#w-count').textContent = m.wordCount;
      view.querySelector('#w-sent').textContent = m.sentenceCount;
      view.querySelector('#w-para').textContent = m.paragraphCount;
      view.querySelector('#w-avg').textContent = m.avgSentenceLength;
      view.querySelector('#w-ttr').textContent = m.ttr;
      view.querySelector('#w-clause').textContent = m.clauseDensity;
      view.querySelector('#w-trans').textContent = m.transitions;
      const pct = C.clamp(Math.round((m.wordCount / prompt.wordTarget[0]) * 100), 0, 100);
      view.querySelector('#w-target-progress').textContent = pct + '%';
      view.querySelector('#w-target-bar').style.width = pct + '%';
      return m;
    }

    function feedbackOpts() {
      return {
        prompt: prompt, type: 'writing', text: editor.value,
        modelHtml: prompt.model ? modelHtml(prompt.model) : ''
      };
    }

    function attachFeedback() {
      feedbackHost.querySelectorAll('[data-up]').forEach(function (btn) {
        btn.addEventListener('click', function () { applyUpgrades(Number(btn.dataset.up)); });
      });
      const llmBtn = feedbackHost.querySelector('[data-llm-review]');
      if (llmBtn) llmBtn.addEventListener('click', function () {
        openLLMReview({ type: 'writing', prompt: prompt, text: editor.value.trim(), band: analyzedResult ? analyzedResult.scores.band : null });
      });
      const top = feedbackHost.querySelector('[data-feedback-top]');
      if (top) top.addEventListener('click', function () { editor.focus(); editor.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    }

    function analyzeAndRender() {
      const text = editor.value.trim();
      if (text.length < 20) { C.toast('至少写几句再提交批改', 'info', 2200); return; }
      analyzedResult = C.engine.analyze(text, { type: 'writing', prompt: prompt });
      feedbackHost.innerHTML = feedbackHTML(analyzedResult, feedbackOpts());
      attachFeedback();
      updateTimerDisplay(state.timer.remaining(), state.timer.elapsed(), false);
    }

    function applyUpgrades(index) {
      if (!analyzedResult) return;
      const list = index == null ? analyzedResult.upgrades : [analyzedResult.upgrades[index]];
      if (!list || !list.length) return;
      const applied = C.engine.applyUpgrades(editor.value, list);
      editor.value = applied.text;
      writeDraft('writing', prompt.id, editor.value);
      liveMetrics();
      analyzeAndRender();
      C.toast(index == null ? '已应用 ' + applied.applied + ' 处升级' : '已替换为 ' + list[0].to, 'good', 2000);
    }

    let liveTimer = null;
    editor.addEventListener('input', function () {
      if (!state.timer.running() && !state.timer.expired()) state.timer.start();
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () { liveMetrics(); writeDraft('writing', prompt.id, editor.value); }, 180);
    });
    timerBtn.addEventListener('click', function () {
      if (!state.timer.started()) state.timer.start();
      else if (state.timer.running()) state.timer.pause();
      else state.timer.start();
      updateTimerDisplay(state.timer.remaining(), state.timer.elapsed(), false);
    });

    view.querySelector('[data-submit-write]').addEventListener('click', function () {
      const text = editor.value.trim();
      if (C.countWords(text) < 30) { C.toast('内容太短，至少写到 30 个词再提交', 'info', 2400); return; }
      state.timer.stop();
      analyzeAndRender();
      if (!analyzedResult) return;
      const item = S.addSubmission('writing', prompt.id, prompt.title, text, analyzedResult.scores.band);
      const minutes = Math.max(1, Math.round(state.timer.elapsed() / 60));
      S.logStudy('writing', minutes, 1, 16);
      clearDraft('writing', prompt.id);
      view.querySelector('#writing-history').innerHTML = historyHTML('writing', prompt.id);
      bindHistory(view, editor, analyzeAndRender, liveMetrics);
      C.toast('已保存到本机记录 · 档位 ' + analyzedResult.scores.band + '/15', 'good', 2600);
      feedbackHost.scrollIntoView({ behavior: 'smooth', block: 'start' });
      C.app.refreshShell();
    });

    view.querySelector('[data-clear-write]').addEventListener('click', function () {
      C.confirmDialog({ title: '清空当前作文？', message: '只清空编辑区，不删除历史提交。', confirmText: '清空', danger: true }).then(function (ok) {
        if (ok) { editor.value = ''; clearDraft('writing', prompt.id); feedbackHost.innerHTML = ''; liveMetrics(); state.timer.stop(); state.timer = createTimer(prompt.time, updateTimerDisplay); updateTimerDisplay(prompt.time * 60, 0, false); }
      });
    });

    function bindHistory(host, editorEl, analyzeFn, liveFn) {
      host.querySelectorAll('[data-load-sub]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const sub = S.state.submissions.find(function (x) { return x.id === btn.dataset.loadSub; });
          if (!sub) return;
          editorEl.value = sub.text;
          liveFn();
          analyzeFn();
          C.toast('已载入历史作文并重新批改', 'info', 2000);
          editorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      });
    }

    liveMetrics();
    bindHistory(view, editor, analyzeAndRender, liveMetrics);
    if (draft) updateTimerDisplay(prompt.time * 60, 0, false);
    if (draft) setTimeout(function () { liveMetrics(); }, 30);

    return function () {
      if (liveTimer) clearTimeout(liveTimer);
      if (state.timer) state.timer.stop();
      C.speech.stop();
    };
  }

  /* ================= Translation ================= */
  function renderTranslation(view, ctx) {
    const prompts = C.data.translations;
    const promptId = ctx.params.get('prompt') || prompts[0].id;
    const prompt = prompts.find(function (p) { return p.id === promptId; }) || prompts[0];
    const draft = readDraft('translation', prompt.id);
    const state = { prompt: prompt, result: null, revealTerms: false, timer: null };

    view.innerHTML = pageHead('translate') +
      '<div class="writing-layout">' +
        '<div class="stack">' +
          '<div class="card prompt-card">' +
            '<div class="row-between" style="align-items:flex-start;flex-wrap:wrap;gap:8px"><div><div class="card-kicker">TRANSLATION · 30 MIN</div><div class="prompt-title">' + C.esc(prompt.title) + '</div></div>' +
            '<div class="cluster">' + prompts.map(function (p) {
              return '<a class="chip' + (p.id === prompt.id ? ' active' : '') + '" href="#/writing?tab=translate&prompt=' + p.id + '">' + C.esc(p.theme) + ' · ' + C.esc(p.title) + '</a>';
            }).join('') + '</div></div>' +
            '<div class="prompt-body" style="font-family:var(--serif);font-size:15px;line-height:1.9">' + C.esc(prompt.zh) + '</div>' +
            '<div class="divider-dashed"></div>' +
            '<div class="row-between"><div class="field-label">必译术语</div><button class="btn btn-sm btn-ghost" data-reveal-terms>' + (state.revealTerms ? '隐藏英文' : '显示英文') + '</button></div>' +
            '<div class="term-checklist mt-1" id="term-list">' + prompt.terms.map(function (t, i) {
              return '<div class="term-check"><span class="b">' + C.icon('check', 8) + '</span><span>' + C.esc(t.zh) + '</span><span class="en">' + (state.revealTerms ? C.esc(t.en[0]) : '•••') + '</span></div>';
            }).join('') + '</div>' +
          '</div>' +
          '<div class="editor-card">' +
            '<div class="editor-toolbar"><div class="row">' + timerChip('tr-timer') + '</div><div class="live-stats"><span>词数 <b id="t-count">0</b></span><span>术语覆盖 <b id="t-terms">0 / ' + prompt.terms.length + '</b></span></div></div>' +
            '<textarea class="editor-area" id="tr-editor" placeholder="Translate the passage into English…&#10;&#10;先拆句、定主谓，再选术语，最后润色逻辑与语气。">' + C.esc(draft) + '</textarea>' +
            '<div class="editor-foot"><span class="small muted">自动保存在本机 · 术语拼写保持一致</span><div class="row"><button class="btn btn-sm" data-clear-tr>清空</button><button class="btn btn-primary" data-submit-tr>' + C.icon('check', 13) + '提交批改</button></div></div>' +
          '</div>' +
          '<div id="tr-feedback"></div>' +
        '</div>' +
        '<aside class="stack">' +
          '<div class="side-panel"><div class="card-kicker">TERM COVERAGE</div><div class="row-between mt-1"><span class="small muted">实时检索</span><b id="t-cover-pct">0%</b></div>' +
          '<div class="progress progress-jade mt-1"><i id="t-cover-bar" style="width:0%"></i></div>' +
          '<div id="live-terms" class="term-checklist mt-2"></div>' +
          '<div class="small faint mt-2">覆盖检查只判断术语是否出现（允许常见词形变化），不判断整句质量。</div></div>' +
          '<div class="side-panel"><div class="card-kicker">FOUR STEPS</div><div class="card-title" style="font-size:16px;margin-top:4px">翻译四步</div>' +
            '<div class="guide-steps mt-1"><div class="guide-step"><div><b>拆句</b><span>按意群切分中文长句</span></div></div><div class="guide-step"><div><b>定主谓</b><span>补出主语，确定谓语与时态</span></div></div><div class="guide-step"><div><b>选词</b><span>锁定术语与固定搭配</span></div></div><div class="guide-step"><div><b>润色</b><span>加连接词，调整语域</span></div></div></div>' +
            '<div class="divider-dashed"></div>' + sideTips('translation') + '</div>' +
          '<div class="side-panel"><div class="row-between"><div class="card-kicker">HISTORY</div><span class="small faint">最近 5 次</span></div><div class="mt-1" id="tr-history">' + historyHTML('translation', prompt.id) + '</div></div>' +
          '<div class="notice">' + C.icon('info', 14) + '<span>参考译文在提交后显示；术语表可先显示英文，避免卡在个别词上。</span></div>' +
        '</aside>' +
      '</div>' +
      '<div class="source-note mt-3">' + C.esc(C.data.writingNote) + '</div>';

    const editor = view.querySelector('#tr-editor');
    const feedbackHost = view.querySelector('#tr-feedback');
    const timerEl = view.querySelector('#tr-timer');
    const timerBtn = view.querySelector('[data-timer-toggle]');
    let result = null;

    function updateTimerDisplay(remaining, elapsed, expired) {
      const span = timerEl.querySelector('span');
      if (span) span.textContent = fmtTimer(remaining);
      timerEl.style.color = remaining <= 300 ? 'var(--danger)' : '';
      if (timerBtn) timerBtn.textContent = state.timer && state.timer.running() ? '暂停' : state.timer && state.timer.started() ? '继续' : '计时';
      if (expired) C.toast('30 分钟已到。建议停止并提交。', 'bad', 3600);
    }
    state.timer = createTimer(prompt.time, updateTimerDisplay);

    function coverageNow() {
      return C.engine.coverage(editor.value, prompt.terms);
    }

    function updateLive() {
      const m = C.engine.metrics(editor.value);
      const cov = coverageNow();
      view.querySelector('#t-count').textContent = m.wordCount;
      view.querySelector('#t-terms').textContent = cov.hit + ' / ' + cov.total;
      view.querySelector('#t-cover-pct').textContent = cov.total ? Math.round((cov.hit / cov.total) * 100) + '%' : '0%';
      view.querySelector('#t-cover-bar').style.width = cov.total ? (cov.hit / cov.total) * 100 + '%' : '0%';
      view.querySelector('#live-terms').innerHTML = cov.items.map(function (t) {
        return '<div class="term-check' + (t.hit ? ' hit' : '') + '"><span class="b">' + C.icon('check', 8) + '</span><span>' + C.esc(t.zh) + '</span><span class="en">' + (t.hit ? '已覆盖' : '待翻译') + '</span></div>';
      }).join('');
      const list = view.querySelector('#term-list');
      list.querySelectorAll('.term-check').forEach(function (row, i) {
        row.classList.toggle('hit', cov.items[i] && cov.items[i].hit);
      });
    }

    function opts() {
      return { prompt: prompt, type: 'translation', text: editor.value, referenceHtml: referenceHtml(prompt) };
    }

    function attachFeedback() {
      feedbackHost.querySelectorAll('[data-up]').forEach(function (btn) {
        btn.addEventListener('click', function () { applyUpgrades(Number(btn.dataset.up)); });
      });
      const llmBtn = feedbackHost.querySelector('[data-llm-review]');
      if (llmBtn) llmBtn.addEventListener('click', function () {
        openLLMReview({ type: 'translation', prompt: prompt, text: editor.value.trim(), band: result ? result.scores.band : null });
      });
      const top = feedbackHost.querySelector('[data-feedback-top]');
      if (top) top.addEventListener('click', function () { editor.focus(); editor.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    }

    function analyzeAndRender() {
      const text = editor.value.trim();
      if (!text) { C.toast('先写下译文再提交', 'info'); return; }
      result = C.engine.analyze(text, { type: 'translation', prompt: prompt });
      feedbackHost.innerHTML = feedbackHTML(result, opts());
      attachFeedback();
      updateTimerDisplay(state.timer.remaining(), state.timer.elapsed(), false);
    }

    function applyUpgrades(index) {
      if (!result) return;
      const list = index == null ? result.upgrades : [result.upgrades[index]];
      if (!list || !list.length) return;
      const applied = C.engine.applyUpgrades(editor.value, list);
      editor.value = applied.text;
      writeDraft('translation', prompt.id, editor.value);
      updateLive();
      analyzeAndRender();
      C.toast('已应用 ' + applied.applied + ' 处替换', 'good', 1800);
    }

    let liveTimer = null;
    editor.addEventListener('input', function () {
      if (!state.timer.running() && !state.timer.expired()) state.timer.start();
      clearTimeout(liveTimer);
      liveTimer = setTimeout(function () { updateLive(); writeDraft('translation', prompt.id, editor.value); }, 180);
    });
    timerBtn.addEventListener('click', function () {
      if (!state.timer.started()) state.timer.start();
      else if (state.timer.running()) state.timer.pause();
      else state.timer.start();
      updateTimerDisplay(state.timer.remaining(), state.timer.elapsed(), false);
    });

    view.querySelector('[data-reveal-terms]').addEventListener('click', function (e) {
      state.revealTerms = !state.revealTerms;
      e.currentTarget.textContent = state.revealTerms ? '隐藏英文' : '显示英文';
      view.querySelector('#term-list').querySelectorAll('.term-check').forEach(function (row, i) {
        const en = row.querySelector('.en');
        if (en) en.textContent = state.revealTerms ? prompt.terms[i].en[0] : '•••';
      });
    });

    view.querySelector('[data-submit-tr]').addEventListener('click', function () {
      if (C.countWords(editor.value) < 20) { C.toast('译文太短，至少写出 20 个词', 'info', 2400); return; }
      state.timer.stop();
      analyzeAndRender();
      if (!result) return;
      S.addSubmission('translation', prompt.id, prompt.title, editor.value.trim(), result.scores.band);
      S.logStudy('translation', Math.max(1, Math.round(state.timer.elapsed() / 60)), 1, 16);
      clearDraft('translation', prompt.id);
      view.querySelector('#tr-history').innerHTML = historyHTML('translation', prompt.id);
      bindHistory(view, editor, analyzeAndRender, updateLive, 'translation');
      C.toast('已保存译文 · 档位 ' + result.scores.band + '/15', 'good', 2600);
      feedbackHost.scrollIntoView({ behavior: 'smooth', block: 'start' });
      C.app.refreshShell();
    });

    view.querySelector('[data-clear-tr]').addEventListener('click', function () {
      C.confirmDialog({ title: '清空当前译文？', message: '只清空编辑区，不删除历史提交。', confirmText: '清空', danger: true }).then(function (ok) {
        if (ok) { editor.value = ''; clearDraft('translation', prompt.id); feedbackHost.innerHTML = ''; updateLive(); state.timer.stop(); state.timer = createTimer(prompt.time, updateTimerDisplay); updateTimerDisplay(prompt.time * 60, 0, false); }
      });
    });

    function bindHistory(host, editorEl, analyzeFn, liveFn, type) {
      host.querySelectorAll('[data-load-sub]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const sub = S.state.submissions.find(function (x) { return x.id === btn.dataset.loadSub; });
          if (!sub) return;
          editorEl.value = sub.text;
          liveFn();
          analyzeFn();
          C.toast('已载入历史译文并重新批改', 'info', 2000);
          editorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      });
    }

    updateLive();
    bindHistory(view, editor, analyzeAndRender, updateLive, 'translation');
    return function () {
      if (liveTimer) clearTimeout(liveTimer);
      if (state.timer) state.timer.stop();
      C.speech.stop();
    };
  }

  /* ================= Corpus ================= */
  function renderCorpus(view, ctx) {
    const words = C.data.topicVocab || [];
    let theme = ctx.params.get('theme') || THEMES[0];
    if (THEMES.indexOf(theme) === -1) theme = THEMES[0];
    let query = '';

    view.innerHTML = pageHead('corpus') +
      '<div class="card">' +
        '<div class="card-head"><div><div class="card-title">翻译主题语料</div><div class="card-sub">按中国历史、文化、经济、社会四大主题整理；点发音可听读。</div></div>' +
        '<div class="input-group" style="max-width:260px">' + C.icon('search', 15) + '<input class="input search-input" id="corpus-search" placeholder="搜索中文或英文…" autocomplete="off"></div></div>' +
        '<div class="corpus-theme">' + THEMES.map(function (t) {
          return '<button class="chip' + (t === theme ? ' active' : '') + '" data-theme="' + C.esc(t) + '">' + C.esc(t) + ' <span class="tiny faint">' + words.filter(function (w) { return w.theme === t; }).length + '</span></button>';
        }).join('') + '</div>' +
        '<div class="term-grid" id="corpus-grid"></div>' +
      '</div>' +
      '<div class="grid grid-2 mt-2"><div class="card card--soft"><div class="card-kicker">TRANSLATION HABIT</div><div class="card-title" style="font-size:17px;margin-top:4px">术语只是骨架</div><p class="small muted mt-1">不要为了塞进术语而牺牲句子结构。先保证主谓清楚，再让术语自然落位；一个术语的全篇译法应保持一致。</p></div>' +
      '<div class="card card--soft"><div class="card-kicker">SELF CHECK</div><div class="card-title" style="font-size:17px;margin-top:4px">提交前四问</div><p class="small muted mt-1">主语补出来了吗？时态统一吗？逻辑连接显性吗？术语拼写前后一致吗？</p></div></div>';

    const grid = view.querySelector('#corpus-grid');

    function renderGrid() {
      const q = query.trim().toLowerCase();
      const list = words.filter(function (w) {
        if (w.theme !== theme) return false;
        if (q && (w.zh + ' ' + w.en + ' ' + w.eg).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      grid.innerHTML = list.length ? list.map(function (w) {
        return '<div class="term-card"><div class="row-between"><span class="zh">' + C.esc(w.zh) + '</span><button class="icon-mini" data-speak="' + C.esc(w.en) + '" aria-label="发音">' + C.icon('volume', 13) + '</button></div>' +
          '<div class="en">' + C.esc(w.en) + '</div><div class="eg">' + C.esc(w.eg) + '</div></div>';
      }).join('') : '<div class="empty" style="grid-column:1/-1">' + C.emptyState('没有匹配术语', '换一个关键词，或切换主题。', 'search') + '</div>';
      grid.querySelectorAll('[data-speak]').forEach(function (btn) {
        btn.addEventListener('click', function () { if (C.speech.supported) C.speech.speak(btn.dataset.speak); else C.toast('浏览器不支持语音合成', 'bad'); });
      });
    }

    view.querySelectorAll('[data-theme]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        theme = btn.dataset.theme;
        view.querySelectorAll('[data-theme]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        renderGrid();
      });
    });
    view.querySelector('#corpus-search').addEventListener('input', C.debounce(function (e) {
      query = e.target.value; renderGrid();
    }, 150));
    renderGrid();
    return function () { C.speech.stop(); };
  }

  /* ================= Replacements ================= */
  function renderReplace(view, ctx) {
    const reps = C.data.replacements || [];
    view.innerHTML = pageHead('replace') +
      '<div class="card">' +
        '<div class="card-head"><div><div class="card-title">写作替换词典</div><div class="card-sub">替换的前提是搭配正确；不确定时保留熟悉的准确表达。</div></div>' +
          '<div class="input-group" style="max-width:260px">' + C.icon('search', 15) + '<input class="input search-input" id="rep-search" placeholder="搜索表达…" autocomplete="off"></div></div>' +
        '<div class="table-wrap" style="overflow-x:auto"><table class="replace-table"><thead><tr><th style="width:18%">基础表达</th><th style="width:30%">可升级为</th><th>语域 / 搭配提示</th><th style="width:24%">例句</th></tr></thead><tbody id="rep-body"></tbody></table></div>' +
      '</div>' +
      '<div class="card mt-2"><div class="card-head"><div><div class="card-title">快速扫描</div><div class="card-sub">粘贴一段自己的句子，找出可替换项</div></div><span class="badge">本地</span></div>' +
        '<textarea class="textarea" id="rep-input" placeholder="Paste a sentence or paragraph…" style="min-height:96px"></textarea>' +
        '<div class="row mt-2"><button class="btn btn-sm btn-primary" id="rep-scan">扫描可升级表达</button><span class="small faint">只给建议，不会自动改写</span></div>' +
        '<div id="rep-result" class="mt-2"></div></div>' +
      '<div class="source-note mt-3">替换词库为编者整理，语域提示基于学术写作的一般惯例。</div>';

    const body = view.querySelector('#rep-body');
    function renderRows(q) {
      const query = (q || '').trim().toLowerCase();
      const list = reps.filter(function (r) { return !query || (r.basic + ' ' + r.better + ' ' + r.note + ' ' + r.eg).toLowerCase().indexOf(query) !== -1; });
      body.innerHTML = list.length ? list.map(function (r) {
        return '<tr><td class="basic">' + C.esc(r.basic) + '</td><td class="better">' + C.esc(r.better) + '</td><td class="note">' + C.esc(r.note) + '</td><td class="note">' + C.esc(r.eg) + '</td></tr>';
      }).join('') : '<tr><td colspan="4"><div class="empty">' + C.emptyState('没有匹配表达', '', 'search') + '</div></td></tr>';
    }
    renderRows('');
    view.querySelector('#rep-search').addEventListener('input', C.debounce(function (e) { renderRows(e.target.value); }, 120));
    view.querySelector('#rep-scan').addEventListener('click', function () {
      const text = view.querySelector('#rep-input').value;
      if (!text.trim()) { C.toast('先粘贴一段英文', 'info'); return; }
      const ups = C.engine.buildUpgrades(text);
      view.querySelector('#rep-result').innerHTML = ups.length ? '<div class="upgrade-list">' + ups.map(function (u) {
        return '<div class="upgrade-item"><span class="from">' + C.esc(u.from) + '</span><span class="arrow">→</span><span class="to">' + C.esc(u.to) + '</span><span class="why">' + C.esc(u.note) + '</span><button class="btn btn-sm btn-ghost" data-copy="' + C.esc(u.to) + '">复制</button></div>';
      }).join('') + '</div>' : '<div class="notice">' + C.icon('check-circle', 14) + '<span>没有扫描到词库中的基础表达。可以到上方表格按关键词查找。</span></div>';
      view.querySelectorAll('[data-copy]').forEach(function (btn) {
        btn.addEventListener('click', function () { C.copyText(btn.dataset.copy); C.toast('已复制', 'good', 1400); });
      });
    });
    return function () { C.speech.stop(); };
  }

  /* ================= Patterns & templates ================= */
  function renderPatterns(view, ctx) {
    const patterns = C.data.patterns || [];
    const templates = C.data.templates || [];
    const cats = ['全部'].concat(Array.from(new Set(patterns.map(function (p) { return p.cat; }))));
    view.innerHTML = pageHead('patterns') +
      '<div class="card">' +
        '<div class="card-head"><div><div class="card-title">高分句式骨架</div><div class="card-sub">先有逻辑，再套句式；不要为了句式牺牲准确性。</div></div><span class="badge badge-jade">' + patterns.length + ' 个</span></div>' +
        '<div class="cluster mb-2" id="pat-cats">' + cats.map(function (c, i) {
          return '<button class="chip' + (i === 0 ? ' active' : '') + '" data-cat="' + C.esc(c) + '">' + C.esc(c) + '</button>';
        }).join('') + '</div>' +
        '<div class="pattern-grid" id="pattern-grid"></div>' +
      '</div>' +
      '<div class="section-head mt-3"><div><div class="section-title">整篇结构模板</div><div class="section-sub">把句式放进段落功能里</div></div></div>' +
      '<div class="grid grid-2">' + templates.map(function (t) {
        return '<div class="card"><div class="row-between"><div class="card-title" style="font-size:17px">' + C.esc(t.title) + '</div><span class="tag">' + C.esc(t.scene) + '</span></div>' +
          '<div class="small muted mt-1">' + C.esc(t.tip) + '</div>' +
          '<div class="divider-dashed"></div>' +
          '<div class="small"><b>开头</b> · ' + C.esc(t.opening) + '</div>' +
          '<div class="small mt-1"><b>主体</b> · ' + C.esc(t.body) + '</div>' +
          '<div class="small mt-1"><b>结尾</b> · ' + C.esc(t.closing) + '</div>' +
          '<div class="row mt-2"><button class="btn btn-sm" data-copy-template="' + t.id + '">' + C.icon('copy', 12) + '复制模板</button></div></div>';
      }).join('') + '</div>' +
      '<div class="source-note mt-3">模板为写作脚手架，考试中请根据题目改写，不要整段照搬。</div>';

    const grid = view.querySelector('#pattern-grid');
    let cat = '全部';
    function renderPatternsGrid() {
      const list = patterns.filter(function (p) { return cat === '全部' || p.cat === cat; });
      grid.innerHTML = list.map(function (p) {
        return '<div class="pattern-card"><div class="row-between"><span class="pc-tag">' + C.esc(p.cat) + '</span><button class="icon-mini" data-copy-pattern="' + C.esc(p.pattern) + '" aria-label="复制句式">' + C.icon('copy', 12) + '</button></div>' +
          '<div class="pc-pattern">' + C.esc(p.pattern) + '</div><div class="pc-use">' + C.esc(p.use) + '</div><div class="pc-eg">' + C.esc(p.eg) + '</div></div>';
      }).join('');
      grid.querySelectorAll('[data-copy-pattern]').forEach(function (btn) {
        btn.addEventListener('click', function () { C.copyText(btn.dataset.copyPattern); C.toast('已复制句式', 'good', 1400); });
      });
    }
    view.querySelectorAll('[data-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cat = btn.dataset.cat;
        view.querySelectorAll('[data-cat]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        renderPatternsGrid();
      });
    });
    view.querySelectorAll('[data-copy-template]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const t = templates.find(function (x) { return x.id === btn.dataset.copyTemplate; });
        if (!t) return;
        C.copyText(t.opening + '\n\n' + t.body + '\n\n' + t.closing);
        C.toast('模板已复制', 'good', 1400);
      });
    });
    renderPatternsGrid();
    return function () { C.speech.stop(); };
  }

  function render(view, ctx) {
    const tab = ctx.params.get('tab') || 'write';
    const back = (function () {
      if (tab === 'translate') return renderTranslation(view, ctx);
      if (tab === 'corpus') return renderCorpus(view, ctx);
      if (tab === 'replace') return renderReplace(view, ctx);
      if (tab === 'patterns') return renderPatterns(view, ctx);
      return renderWriting(view, ctx);
    })();
    view.querySelectorAll('[data-score-guide]').forEach(function (b) { b.addEventListener('click', openScoreGuide); });
    return back;
  }

  C.views.writing = { render: render };
})();
