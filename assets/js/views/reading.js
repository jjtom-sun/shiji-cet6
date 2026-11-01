/* Reading lab — annotated sentences, banked cloze, matching, careful reading with evidence pinpointing */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;

  const ROLE = {
    subject: { name: '主语', color: 'var(--jade)' },
    verb: { name: '谓语', color: 'var(--accent)' },
    object: { name: '宾语', color: 'var(--blue)' },
    complement: { name: '表语 / 补语', color: 'var(--violet)' },
    adverbial: { name: '状语', color: 'var(--gold)' },
    attributive: { name: '定语 / 从句', color: 'var(--jade)' },
    appositive: { name: '同位语', color: 'var(--muted)' },
    conjunction: { name: '连接 / 关联', color: 'var(--faint)' },
    insert: { name: '插入语', color: 'var(--gold)' }
  };
  const TYPE_LABEL = { detail: '细节', main: '主旨', infer: '推断', vocab: '词义', attitude: '态度' };

  function tabs(active) {
    return '<div class="tabs mb-3">' +
      '<a class="tab' + (active === 'sentences' ? ' active' : '') + '" href="#/reading?tab=sentences">长难句</a>' +
      '<a class="tab' + (active === 'cloze' ? ' active' : '') + '" href="#/reading?tab=cloze">选词填空</a>' +
      '<a class="tab' + (active === 'matching' ? ' active' : '') + '" href="#/reading?tab=matching">长篇匹配</a>' +
      '<a class="tab' + (active === 'careful' ? ' active' : '') + '" href="#/reading?tab=careful">仔细阅读</a>' +
      '</div>';
  }

  function pageHead(active) {
    return C.ui.pageHead({
      eyebrow: 'READING & SYNTAX',
      title: '阅读与长难句',
      sub: '12 个逐段标注的长难句、2 篇选词填空、2 篇长篇匹配、3 篇带“依据句定位”的仔细阅读。',
      actions: '<a class="btn" href="#/reading?tab=sentences">' + C.icon('scan', 14) + '拆长难句</a>' +
        '<a class="btn" href="#/reading?tab=careful">' + C.icon('timer', 14) + '限时精读</a>'
    }) + tabs(active);
  }

  function timerHTML() {
    return '<span class="timer-chip" id="reading-timer">' + C.icon('clock', 12) + '<span>00:00</span></span>';
  }

  function startClock(view) {
    const start = Date.now();
    const el = view.querySelector('#reading-timer');
    const tick = function () {
      if (!el) return;
      const span = el.querySelector('span');
      if (span) span.textContent = C.fmtDuration((Date.now() - start) / 1000);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return { stop: function () { clearInterval(timer); }, elapsed: function () { return Math.max(1, Math.round((Date.now() - start) / 1000)); } };
  }

  /* ================= Long sentences ================= */
  function treeHTML(node) {
    if (!node) return '';
    const note = node.note ? '<span class="tree-note">' + C.esc(node.note) + '</span>' : '';
    return '<li><span class="tree-node"><span class="tree-label">' + C.esc(node.label) + '</span><span class="tree-text">' + C.esc(node.text) + '</span>' + note + '</span>' +
      (node.children && node.children.length ? '<ul>' + node.children.map(treeHTML).join('') + '</ul>' : '') + '</li>';
  }

  function renderSentences(view, ctx) {
    const list = C.data.longSentences || [];
    const id = ctx.params.get('id') || (list[0] && list[0].id);
    const s = list.find(function (x) { return x.id === id; }) || list[0];
    if (!s) { view.innerHTML = C.emptyState('暂无长难句', '请稍后再试。', 'scan'); return; }
    view.innerHTML = pageHead('sentences') +
      '<div class="reading-shell">' +
        '<nav class="sentence-list" aria-label="长难句列表">' + list.map(function (x) {
          return '<a class="sentence-item' + (x.id === s.id ? ' active' : '') + '" href="#/reading?tab=sentences&id=' + x.id + '"><span class="sn">SENTENCE ' + x.id.replace('S', '') + ' · 难度 ' + x.difficulty + '/5</span><span class="txt">' + C.esc(x.sentence) + '</span></a>';
        }).join('') + '</nav>' +
        '<div class="sent-panel">' +
          '<div class="sent-meta"><div class="row" style="gap:6px"><span class="badge badge-jade">' + C.esc(s.source) + '</span><span class="badge">难度 ' + s.difficulty + '/5</span></div>' +
            '<div class="row" style="gap:6px"><button class="btn btn-sm btn-ghost" data-sent-speak>' + C.icon('volume', 13) + '朗读原句</button>' +
            '<button class="btn btn-sm" data-toggle="skeleton">只看骨架</button><button class="btn btn-sm" data-toggle="labels">成分标签</button>' +
            '<button class="btn btn-sm" data-toggle="translation">译文</button></div></div>' +
          '<div class="annotated hide-labels" id="annotated">' + s.segments.map(function (g) {
            const role = ROLE[g.role] || ROLE.insert;
            return '<span class="chunk role-' + C.esc(g.role) + '" title="' + C.esc(g.label + (g.note ? '：' + g.note : '')) + '"><sup>' + C.esc(g.label) + '</sup>' + C.esc(g.text) + '</span>';
          }).join('') + '</div>' +
          '<div class="legend">' + Object.keys(ROLE).map(function (k) {
            return '<span><i style="background:' + ROLE[k].color + '"></i>' + C.esc(ROLE[k].name) + '</span>';
          }).join('') + '</div>' +
          '<div class="sent-zh" id="sent-translation" hidden>' + C.esc(s.translation) + '</div>' +
          '<div class="tree-wrap" id="tree-wrap"><div class="row-between mb-1"><div class="eyebrow no-rule">SYNTAX TREE</div><span class="small faint">悬停片段查看说明</span></div><ul class="tree">' + treeHTML(s.tree) + '</ul></div>' +
          '<div class="grammar-points">' + (s.points || []).map(function (p) {
            return '<details class="gp"' + (p === s.points[0] ? ' open' : '') + '><summary>' + C.icon('chevron-right', 13) + C.esc(p.title) + '</summary><p>' + C.esc(p.text) + '</p></details>';
          }).join('') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="analyzer">' +
        '<div class="card-head"><div><div class="card-title">自定义拆句</div><div class="card-sub">粘贴一个长句，先看结构密度，再找主谓</div></div><span class="badge">本地分析</span></div>' +
        '<textarea class="textarea" id="custom-sentence" placeholder="Paste a sentence here…"></textarea>' +
        '<div class="row mt-2"><button class="btn btn-primary btn-sm" id="analyze-sentence">' + C.icon('scan', 13) + '分析结构</button><span class="small faint">不会联网，也不会保存原文</span></div>' +
        '<div id="analyze-result"></div>' +
      '</div>' +
      '<div class="notice mt-2">' + C.icon('info', 14) + '<span>长难句为原创仿真材料；语法标注用于展示“先骨架、后修饰”的拆解路径，不宣称唯一解析。</span></div>';

    const annotated = view.querySelector('#annotated');
    const translation = view.querySelector('#sent-translation');
    const tree = view.querySelector('#tree-wrap');
    view.querySelectorAll('[data-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const kind = btn.dataset.toggle;
        if (kind === 'skeleton') { annotated.classList.toggle('skeleton-mode'); btn.classList.toggle('active'); btn.textContent = annotated.classList.contains('skeleton-mode') ? '显示完整句' : '只看骨架'; }
        if (kind === 'labels') { annotated.classList.toggle('hide-labels'); btn.classList.toggle('active'); }
        if (kind === 'translation') { translation.hidden = !translation.hidden; btn.classList.toggle('active'); btn.textContent = translation.hidden ? '译文' : '隐藏译文'; }
      });
    });
    view.querySelector('[data-sent-speak]').addEventListener('click', function () {
      if (!C.speech.supported) { C.toast('当前浏览器不支持语音合成', 'bad'); return; }
      C.speech.speak(s.sentence);
    });

    view.querySelector('#analyze-sentence').addEventListener('click', function () {
      const text = view.querySelector('#custom-sentence').value.trim();
      if (!text) { C.toast('先粘贴一个英文句子', 'info'); return; }
      const m = C.engine.metrics(text);
      const connectors = [];
      const patterns = [
        { re: /\balthough\b|\bthough\b|\bwhile\b|\bwhereas\b/gi, label: '让步 / 对比' },
        { re: /\bbecause\b|\bsince\b|\bas a result\b|\btherefore\b|\bthus\b/gi, label: '因果' },
        { re: /\bwhich\b|\bwho\b|\bwhom\b|\bwhose\b|\bthat\b/gi, label: '关系从句' },
        { re: /\bnot only\b|\bbut also\b/gi, label: '递进关联' },
        { re: /\bthe more\b|\bthe less\b/gi, label: '比较结构' },
        { re: /\bnot until\b|\bit is\b.*\bthat\b/gi, label: '强调 / 倒装' },
        { re: /\bif\b|\bunless\b|\bprovided that\b/gi, label: '条件' }
      ];
      patterns.forEach(function (p) {
        if (p.re.test(text)) connectors.push(p.label);
      });
      view.querySelector('#analyze-result').innerHTML = '<div class="analysis-result">' +
        '<div class="analysis-cell"><b>' + m.wordCount + '</b><span>词数</span></div>' +
        '<div class="analysis-cell"><b>' + m.sentenceCount + '</b><span>句数</span></div>' +
        '<div class="analysis-cell"><b>' + m.clauseDensity + '</b><span>从句 / 句</span></div>' +
        '<div class="analysis-cell"><b>' + Math.round(m.avgSentenceLength) + '</b><span>平均句长</span></div></div>' +
        '<div class="detected">' + (connectors.length ? connectors.map(function (c) { return '<span class="chip chip-sm chip-accent">' + C.esc(c) + '</span>'; }).join('') : '<span class="chip chip-sm">未检测到明显连接词</span>') + '</div>' +
        '<div class="notice mt-2">' + C.icon('lightbulb', 14) + '<span>拆句顺序：圈出所有谓语动词 → 找主句主语 → 按连接词切分从句 → 最后安放介词短语与插入语。工具只做启发式统计，不替代人工判断。</span></div>';
    });
  }

  /* ================= Cloze ================= */
  function clozeCause(type) {
    if (type === '语法') return '语法理解偏差';
    if (type === '逻辑') return '信息遗漏';
    return '词汇不认识';
  }

  function renderCloze(view, ctx) {
    const items = C.data.cloze || [];
    const id = ctx.params.get('id') || (items[0] && items[0].id);
    const c = items.find(function (x) { return x.id === id; }) || items[0];
    if (!c) { view.innerHTML = C.emptyState('暂无选词填空', '', 'scan'); return; }

    const state = { fills: {}, selected: null, checked: false, started: Date.now(), timer: null };

    view.innerHTML = pageHead('cloze') +
      '<div class="reader-toolbar"><div class="cluster">' + items.map(function (x) {
        return '<a class="chip' + (x.id === c.id ? ' active' : '') + '" href="#/reading?tab=cloze&id=' + x.id + '">' + C.esc(x.title) + '</a>';
      }).join('') + '<span class="tag">' + C.esc(c.topic) + '</span></div>' + timerHTML() + '</div>' +
      '<div class="card" id="cloze-main"></div>';

    const main = view.querySelector('#cloze-main');
    const clock = startClock(view);

    function isUsed(word) { return Object.keys(state.fills).some(function (k) { return state.fills[k] === word; }); }
    function emptyBlanks() { const arr = []; for (let i = 1; i <= c.answers.length; i++) if (!state.fills[i]) arr.push(i); return arr; }
    function nextEmpty(after) {
      for (let i = after + 1; i <= c.answers.length; i++) if (!state.fills[i]) return i;
      for (let i = 1; i < after; i++) if (!state.fills[i]) return i;
      return null;
    }

    function passageHTML() {
      return c.passage.split(/\n\n/).map(function (para) {
        return '<p>' + C.esc(para).replace(/\{\{(\d+)\}\}/g, function (_, n) {
          const num = Number(n);
          const fill = state.fills[num];
          let cls = 'blank';
          if (state.selected === num) cls += ' active';
          if (fill) cls += ' filled';
          if (state.checked) cls += (fill === c.answers[num - 1] ? ' correct' : ' wrong');
          return '<button class="' + cls + '" data-blank="' + num + '"' + (state.checked ? ' disabled' : '') + ' aria-label="第 ' + num + ' 空">' + (fill ? C.esc(fill) : String(num)) + '</button>';
        }) + '</p>';
      }).join('');
    }

    function refresh() {
      const correctCount = c.answers.filter(function (a, i) { return state.fills[i + 1] === a; }).length;
      const used = Object.keys(state.fills).length;
      main.innerHTML =
        '<div class="card-head"><div><div class="card-title">' + C.esc(c.title) + '</div><div class="card-sub">' + C.esc(c.intro) + '</div></div>' +
          '<div class="row">' + (state.checked ? '<span class="badge badge-jade">' + correctCount + ' / 10</span>' : '<span class="badge">' + used + ' / 10 已填</span>') + '</div></div>' +
        '<div class="cloze-toolbar"><div class="small muted">先点一个空，再点下方词库；再点已填的空可清除。</div>' +
          '<div class="row"><button class="btn btn-sm btn-primary" data-check-cloze' + (state.checked ? ' disabled' : '') + '>检查答案</button><button class="btn btn-sm" data-reset-cloze>重做</button></div></div>' +
        '<div class="word-bank">' + c.bank.map(function (b) {
          const usedWord = isUsed(b.word);
          let cls = 'bank-word';
          if (usedWord) cls += ' used';
          if (state.checked) cls += ' used';
          return '<button class="' + cls + '" data-cloze-word="' + C.esc(b.word) + '"' + (state.checked ? ' disabled' : '') + '>' + C.esc(b.word) + '<small>' + C.esc(b.pos) + '</small></button>';
        }).join('') + '</div>' +
        '<div class="passage mt-3">' + passageHTML() + '</div>' +
        (state.checked ? '<div class="cloze-explain">' + c.explanations.map(function (e, i) {
          const ok = state.fills[i + 1] === c.answers[i];
          return '<div class="cloze-row' + (ok ? '' : ' bad') + '"><b>' + (i + 1) + '</b><div><b>' + C.esc(c.answers[i]) + '</b> · ' + C.esc(e.type) + '：' + C.esc(e.why) + '</div></div>';
        }).join('') + '</div>' : '') +
        (state.checked ? '<div class="reading-result"><div class="rs-score">' + correctCount + ' / 10</div><div class="small muted">用时 ' + C.fmtDuration((Date.now() - state.started) / 1000) + ' · 最佳 ' + ((S.state.reading[c.id] || {}).best || 0) + '%</div><div class="spacer"></div><button class="btn btn-sm" data-retry-cloze>再做一次</button></div>' : '');
      if (state.checked) clock.stop();
    }

    main.addEventListener('click', function (e) {
      if (e.target.closest('[data-check-cloze]') && !state.checked) {
        const unanswered = emptyBlanks();
        if (unanswered.length) { C.toast('还有 ' + unanswered.length + ' 个空未填，先补全再检查', 'info', 2200); return; }
        state.checked = true;
        const correct = c.answers.filter(function (a, i) { return state.fills[i + 1] === a; }).length;
        S.recordReading(c.id, correct, 10, Math.round((Date.now() - state.started) / 1000));
        S.logStudy('reading', Math.max(1, Math.round((Date.now() - state.started) / 60000)), 1, 12);
        c.answers.forEach(function (a, i) {
          if (state.fills[i + 1] !== a) {
            S.addError({ module: 'reading', sourceId: c.id + '-b' + (i + 1), title: c.title + ' · 第 ' + (i + 1) + ' 空', prompt: '选择 ' + (i + 1) + ' 号空的正确词', your: state.fills[i + 1] || '未作答', correct: a, cause: clozeCause(c.explanations[i].type), explain: c.explanations[i].why, link: '#/reading?tab=cloze&id=' + c.id });
          }
        });
        clock.stop();
        refresh();
        C.toast('完成：' + correct + ' / 10', correct >= 6 ? 'good' : 'info');
        C.app.refreshShell();
        return;
      }
      if (e.target.closest('[data-reset-cloze]') || e.target.closest('[data-retry-cloze]')) {
        state.fills = {}; state.selected = null; state.checked = false; state.started = Date.now();
        if (state.timer) clearInterval(state.timer);
        clock.stop();
        // restart clock by reloading the view
        C.app.navigate('#/reading?tab=cloze&id=' + c.id);
        return;
      }
      const blank = e.target.closest('[data-blank]');
      if (blank && !state.checked) {
        const num = Number(blank.dataset.blank);
        if (state.fills[num]) { delete state.fills[num]; state.selected = num; }
        else state.selected = state.selected === num ? null : num;
        refresh();
        return;
      }
      const wordBtn = e.target.closest('[data-cloze-word]');
      if (wordBtn && !state.checked) {
        const word = wordBtn.dataset.clozeWord;
        if (isUsed(word)) return;
        let target = state.selected;
        if (!target) target = emptyBlanks()[0] || null;
        if (!target) { C.toast('所有空都已填满', 'info'); return; }
        state.fills[target] = word;
        state.selected = nextEmpty(target);
        refresh();
      }
    });

    refresh();

    return function () { clock.stop(); };
  }

  /* ================= Matching ================= */
  function highlightKeywords(text, keywords) {
    let html = C.esc(text);
    (keywords || []).forEach(function (k) {
      const re = new RegExp(C.escapeRegExp(C.esc(k)), 'gi');
      html = html.replace(re, '<span class="s-key">' + C.esc(k) + '</span>');
    });
    return html;
  }

  function renderMatching(view, ctx) {
    const items = C.data.matching || [];
    const id = ctx.params.get('id') || (items[0] && items[0].id);
    const m = items.find(function (x) { return x.id === id; }) || items[0];
    if (!m) { view.innerHTML = C.emptyState('暂无匹配题', '', 'scan'); return; }
    const state = { answers: {}, active: null, checked: false, hideKeys: false, started: Date.now() };

    view.innerHTML = pageHead('matching') +
      '<div class="reader-toolbar"><div class="cluster">' + items.map(function (x) {
        return '<a class="chip' + (x.id === m.id ? ' active' : '') + '" href="#/reading?tab=matching&id=' + x.id + '">' + C.esc(x.title) + '</a>';
      }).join('') + '<span class="tag">' + C.esc(m.topic) + '</span></div>' + timerHTML() + '</div>' +
      '<div class="notice mb-2">' + C.icon('compass', 14) + '<span>先点右侧一个陈述，再点左侧对应段落。陈述中的高亮词是定位线索，熟练后可隐藏关键词再练。</span></div>' +
      '<div class="matching-layout">' +
        '<div class="reader-passage match-passage" id="match-passage">' + m.paragraphs.map(function (p) {
          return '<div class="match-para" data-para="' + p.id + '"><span class="para-label">' + p.id + '</span>' + C.esc(p.text) + '</div>';
        }).join('') + '</div>' +
        '<div class="stack"><div class="card" id="match-panel">' +
          '<div class="card-head"><div><div class="card-title">陈述匹配</div><div class="card-sub">共 ' + m.statements.length + ' 题 · 每个段落可使用多次</div></div><span class="badge" id="match-count">0 / 10</span></div>' +
          '<div class="row-between mb-2"><button class="btn btn-sm btn-ghost" id="toggle-keys">隐藏关键词</button><span class="small faint">点击陈述 → 点击段落</span></div>' +
          '<div class="statement-list" id="statement-list"></div>' +
          '<div class="row mt-2"><button class="btn btn-primary btn-sm" id="check-matching">检查答案</button><button class="btn btn-sm" id="reset-matching">重做</button></div>' +
          '<div id="match-result"></div>' +
        '</div></div>' +
      '</div>';

    const clock = startClock(view);
    const passage = view.querySelector('#match-passage');
    const list = view.querySelector('#statement-list');
    const count = view.querySelector('#match-count');
    const result = view.querySelector('#match-result');

    function renderStatements() {
      list.innerHTML = m.statements.map(function (s, i) {
        const assigned = state.answers[s.id];
        let cls = 'statement';
        if (state.active === s.id) cls += ' active';
        if (state.checked) cls += assigned === s.answer ? ' correct' : ' wrong';
        return '<div class="' + cls + '" data-statement="' + s.id + '"><span class="s-no">' + C.pad2(i + 1) + '</span><span class="s-text">' + (state.hideKeys ? C.esc(s.text) : highlightKeywords(s.text, s.keywords)) +
          (state.checked && assigned !== s.answer ? '<span class="small muted" style="display:block;margin-top:3px">依据：段落 ' + C.esc(s.answer) + '</span>' : '') + '</span>' +
          '<span class="s-ans ' + (state.checked ? (assigned === s.answer ? 'ok' : 'bad') : '') + '">' + (assigned || '—') + '</span></div>';
      }).join('');
      count.textContent = Object.keys(state.answers).length + ' / ' + m.statements.length;
    }

    function renderResult() {
      if (!state.checked) { result.innerHTML = ''; return; }
      const correct = m.statements.filter(function (s) { return state.answers[s.id] === s.answer; }).length;
      result.innerHTML = '<div class="reading-result"><div class="rs-score">' + correct + ' / 10</div><div class="small muted">用时 ' + C.fmtDuration((Date.now() - state.started) / 1000) + ' · 最佳 ' + ((S.state.reading[m.id] || {}).best || 0) + '%</div><div class="spacer"></div><span class="tag">点击陈述查看依据</span></div>';
    }

    list.addEventListener('click', function (e) {
      const st = e.target.closest('[data-statement]');
      if (!st) return;
      state.active = st.dataset.statement;
      if (state.checked) {
        const s = m.statements.find(function (x) { return x.id === st.dataset.statement; });
        C.toast('依据：段落 ' + s.answer + ' — ' + s.evidence, 'info', 4000);
      }
      renderStatements();
    });

    passage.addEventListener('click', function (e) {
      const para = e.target.closest('[data-para]');
      if (!para) return;
      if (state.checked) return;
      if (!state.active) { C.toast('先在右侧选择一个陈述', 'info', 1800); return; }
      state.answers[state.active] = para.dataset.para;
      const remaining = m.statements.find(function (s) { return !state.answers[s.id]; });
      state.active = remaining ? remaining.id : null;
      renderStatements();
    });

    view.querySelector('#toggle-keys').addEventListener('click', function (e) {
      state.hideKeys = !state.hideKeys;
      e.currentTarget.textContent = state.hideKeys ? '显示关键词' : '隐藏关键词';
      renderStatements();
    });

    view.querySelector('#check-matching').addEventListener('click', function () {
      if (state.checked) return;
      state.checked = true;
      const correct = m.statements.filter(function (s) { return state.answers[s.id] === s.answer; }).length;
      S.recordReading(m.id, correct, 10, Math.round((Date.now() - state.started) / 1000));
      S.logStudy('reading', Math.max(1, Math.round((Date.now() - state.started) / 60000)), 1, 12);
      m.statements.forEach(function (s) {
        if (state.answers[s.id] !== s.answer) {
          S.addError({ module: 'reading', sourceId: s.id, title: m.title, prompt: s.text, your: state.answers[s.id] ? '段落 ' + state.answers[s.id] : '未作答', correct: '段落 ' + s.answer, cause: '定位错误', explain: s.explain + ' 依据：' + s.evidence, link: '#/reading?tab=matching&id=' + m.id });
        }
      });
      clock.stop();
      state.active = null;
      renderStatements(); renderResult();
      C.toast('完成：' + correct + ' / 10', correct >= 6 ? 'good' : 'info');
      C.app.refreshShell();
    });

    view.querySelector('#reset-matching').addEventListener('click', function () {
      C.app.navigate('#/reading?tab=matching&id=' + m.id);
    });

    renderStatements();
    return function () { clock.stop(); };
  }

  /* ================= Careful reading ================= */
  function renderCareful(view, ctx) {
    const items = C.data.careful || [];
    const id = ctx.params.get('id') || (items[0] && items[0].id);
    const r = items.find(function (x) { return x.id === id; }) || items[0];
    if (!r) { view.innerHTML = C.emptyState('暂无仔细阅读', '', 'scan'); return; }
    const state = { answers: {}, evidence: {}, active: r.questions[0].id, checked: false, started: Date.now() };

    view.innerHTML = pageHead('careful') +
      '<div class="reader-toolbar"><div class="cluster">' + items.map(function (x) {
        return '<a class="chip' + (x.id === r.id ? ' active' : '') + '" href="#/reading?tab=careful&id=' + x.id + '">' + C.esc(x.title) + '</a>';
      }).join('') + '<span class="tag">' + C.esc(r.topic) + '</span></div>' + timerHTML() + '</div>' +
      '<div class="notice mb-2">' + C.icon('crosshair', 14) + '<span>做题时先点选左侧原文的“依据句”，再选择答案。批改后会同时告诉你答案是否正确、定位是否准确。</span></div>' +
      '<div class="reader-two">' +
        '<div class="reader-passage careful-passage marking" id="careful-passage">' +
          r.paragraphs.map(function (p) {
            return '<p>' + p.sentences.map(function (s) {
              return '<span class="sentence" data-p="' + p.id + '" data-s="' + s.id + '">' + C.esc(s.en) + '</span> ';
            }).join('') + '</p>';
          }).join('') +
        '</div>' +
        '<div class="reader-questions" id="careful-questions"></div>' +
      '</div>' +
      '<div id="careful-result"></div>';

    const clock = startClock(view);
    const passage = view.querySelector('#careful-passage');
    const qhost = view.querySelector('#careful-questions');
    const resultHost = view.querySelector('#careful-result');

    function evidenceOf(qid) { return state.evidence[qid] || null; }
    function isCorrectEvidence(q, ev) { return ev && ev.p === r.paragraphs[q.evidence.p].id && ev.s === r.paragraphs[q.evidence.p].sentences[q.evidence.s].id; }

    function renderPassage() {
      const q = r.questions.find(function (x) { return x.id === state.active; });
      passage.querySelectorAll('.sentence').forEach(function (el) {
        el.classList.remove('evidence', 'evidence-correct', 'evidence-wrong');
        if (!q) return;
        const ev = evidenceOf(q.id);
        const answered = state.answers[q.id] !== undefined;
        if (ev && ev.p === el.dataset.p && ev.s === el.dataset.s) el.classList.add(answered ? (isCorrectEvidence(q, ev) ? 'evidence-correct' : 'evidence-wrong') : 'evidence');
        if (answered) {
          const cp = r.paragraphs[q.evidence.p];
          const cs = cp.sentences[q.evidence.s];
          if (el.dataset.p === cp.id && el.dataset.s === cs.id) el.classList.add('evidence-correct');
        }
      });
    }

    function renderQuestions() {
      qhost.innerHTML = r.questions.map(function (q, qi) {
        const answered = state.answers[q.id] !== undefined;
        const picked = state.answers[q.id];
        const ev = evidenceOf(q.id);
        const evOk = isCorrectEvidence(q, ev);
        return '<div class="q-card' + (state.active === q.id ? ' active' : '') + '" data-cqid="' + q.id + '">' +
          '<div class="q-head" data-activate="' + q.id + '"><span class="q-no">Q' + (qi + 1) + '</span><div class="q-text">' + C.esc(q.q) + '</div><span class="q-type ' + C.esc(q.type) + '">' + C.esc(TYPE_LABEL[q.type] || q.type) + '</span></div>' +
          '<div class="option-list">' + q.options.map(function (opt, oi) {
            let cls = 'option';
            if (answered && oi === q.answer) cls += ' correct';
            else if (answered && oi === picked) cls += ' wrong';
            return '<button class="' + cls + '" data-copt="' + oi + '"' + (answered ? ' disabled' : '') + '><span class="k">' + ['A', 'B', 'C', 'D'][oi] + '</span><span>' + C.esc(opt) + '</span></button>';
          }).join('') + '</div>' +
          '<div class="evidence-hint">' + (ev ? '已标记依据：' + C.esc(ev.p) + ' · ' + C.esc(ev.s) : '尚未标记依据句') + (state.active === q.id && !answered ? ' · 现在点击左侧句子' : '') + '</div>' +
          (answered ? '<div class="q-result ' + (picked === q.answer ? 'good' : 'bad') + '">' + C.icon(picked === q.answer ? 'check-circle' : 'x-circle', 12) + (picked === q.answer ? '答案正确' : '正确答案：' + ['A', 'B', 'C', 'D'][q.answer]) + ' · 依据定位' + (evOk ? '正确' : '偏离') + '</div>' +
            '<div class="explain">' + C.esc(q.explain) + '<span class="evidence">正确依据：' + C.esc(r.paragraphs[q.evidence.p].id) + ' · ' + C.esc(r.paragraphs[q.evidence.p].sentences[q.evidence.s].en) + '</span></div>' : '') +
          '</div>';
      }).join('');
    }

    function finishIfDone() {
      if (state.checked) return;
      const all = r.questions.every(function (q) { return state.answers[q.id] !== undefined; });
      if (!all) return;
      state.checked = true;
      clock.stop();
      const correct = r.questions.filter(function (q) { return state.answers[q.id] === q.answer; }).length;
      const evCorrect = r.questions.filter(function (q) { return isCorrectEvidence(q, evidenceOf(q.id)); }).length;
      const seconds = Math.round((Date.now() - state.started) / 1000);
      S.recordReading(r.id, correct, r.questions.length, seconds);
      S.logStudy('reading', Math.max(1, Math.round(seconds / 60)), 1, 14);
      C.toast('完成：' + correct + ' / ' + r.questions.length + '，依据定位 ' + evCorrect + ' / ' + r.questions.length, correct >= 3 ? 'good' : 'info');
      C.app.refreshShell();
    }

    passage.addEventListener('click', function (e) {
      const sen = e.target.closest('.sentence');
      if (!sen) return;
      const q = r.questions.find(function (x) { return x.id === state.active; });
      if (!q) { C.toast('先选择一道题', 'info'); return; }
      if (state.answers[q.id] !== undefined) { C.toast('这道题已作答，可点击其他题干切换', 'info', 1800); return; }
      state.evidence[q.id] = { p: sen.dataset.p, s: sen.dataset.s };
      renderPassage(); renderQuestions();
    });

    qhost.addEventListener('click', function (e) {
      const activate = e.target.closest('[data-activate]');
      if (activate) {
        state.active = activate.dataset.activate;
        renderPassage(); renderQuestions();
        return;
      }
      const opt = e.target.closest('[data-copt]');
      if (!opt) return;
      const card = opt.closest('[data-cqid]');
      if (!card) return;
      const q = r.questions.find(function (x) { return x.id === card.dataset.cqid; });
      if (!q || state.answers[q.id] !== undefined) return;
      state.active = q.id;
      state.answers[q.id] = Number(opt.dataset.copt);
      const ev = evidenceOf(q.id);
      const evOk = isCorrectEvidence(q, ev);
      if (state.answers[q.id] !== q.answer) {
        S.addError({ module: 'reading', sourceId: q.id, title: r.title, prompt: q.q, your: q.options[state.answers[q.id]], correct: q.options[q.answer], cause: q.cause, explain: q.explain + ' 正确依据：' + r.paragraphs[q.evidence.p].id + ' · ' + r.paragraphs[q.evidence.p].sentences[q.evidence.s].en, link: '#/reading?tab=careful&id=' + r.id });
      } else if (ev && !evOk) {
        S.addError({ module: 'reading', sourceId: q.id + '-ev', title: r.title + ' · 依据定位', prompt: q.q, your: ev ? ev.p + ' · ' + ev.s : '未标记', correct: r.paragraphs[q.evidence.p].id + ' · ' + r.paragraphs[q.evidence.p].sentences[q.evidence.s].id, cause: '定位错误', explain: '答案选对了，但依据句定位偏离。正确依据：' + r.paragraphs[q.evidence.p].sentences[q.evidence.s].en, link: '#/reading?tab=careful&id=' + r.id });
      }
      renderQuestions(); renderPassage();
      finishIfDone();
      if (state.checked) renderResult();
    });

    function renderResult() {
      if (!state.checked) { resultHost.innerHTML = ''; return; }
      const correct = r.questions.filter(function (q) { return state.answers[q.id] === q.answer; }).length;
      const evCorrect = r.questions.filter(function (q) { return isCorrectEvidence(q, evidenceOf(q.id)); }).length;
      resultHost.innerHTML = '<div class="card mt-2"><div class="row-between" style="flex-wrap:wrap;gap:12px"><div><div class="card-title">本组结果</div><div class="card-sub">答案与定位分开计分，才能看清是“没读懂”还是“找错句”。</div></div>' +
        '<div class="row"><div class="center"><div class="rs-score">' + correct + ' / ' + r.questions.length + '</div><div class="tiny muted">答案</div></div><div class="divider-vert"></div><div class="center"><div class="rs-score">' + evCorrect + ' / ' + r.questions.length + '</div><div class="tiny muted">依据定位</div></div>' +
        '<button class="btn btn-sm ml-2" data-reset-careful style="margin-left:12px">重做</button></div></div></div>';
      resultHost.querySelector('[data-reset-careful]').addEventListener('click', function () { C.app.navigate('#/reading?tab=careful&id=' + r.id); });
    }

    renderPassage(); renderQuestions();
    return function () { clock.stop(); };
  }

  function render(view, ctx) {
    const tab = ctx.params.get('tab') || 'sentences';
    if (tab === 'cloze') return renderCloze(view, ctx);
    if (tab === 'matching') return renderMatching(view, ctx);
    if (tab === 'careful') return renderCareful(view, ctx);
    return renderSentences(view, ctx);
  }

  C.views.reading = { render: render };
})();
