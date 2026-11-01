/* Dashboard — today's desk */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;

  const QUOTES = [
    { en: 'Small steps, taken daily, become the distance.', zh: '日拱一卒，功不唐捐。' },
    { en: 'Attention is the rarest form of generosity.', zh: '注意力，是这个时代稀缺的慷慨。' },
    { en: 'Read slowly enough to hear the argument.', zh: '慢到能听见论证本身，才算真正读过。' },
    { en: 'A language is a habit before it is a skill.', zh: '语言先是习惯，然后才是技能。' },
    { en: 'What you revisit, you keep.', zh: '被你反复拾起的，才会真正留下。' },
    { en: 'Clarity is kindness to the reader.', zh: '表达清晰，是对读者最基本的善意。' }
  ];

  function greeting() {
    const h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 12) return '早上好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  function nextListening() {
    const sets = C.data.listening || [];
    const st = S.state.listening;
    return sets.find(function (s) { return !st[s.id]; }) ||
      sets.slice().sort(function (a, b) { return ((st[a.id] && st[a.id].best) || 0) - ((st[b.id] && st[b.id].best) || 0); })[0];
  }

  function readingPool() {
    const D = C.data;
    const pool = [];
    (D.cloze || []).forEach(function (c) { pool.push({ id: c.id, tab: 'cloze', title: c.title, route: '#/reading?tab=cloze&id=' + c.id, label: '选词填空' }); });
    (D.matching || []).forEach(function (m) { pool.push({ id: m.id, tab: 'matching', title: m.title, route: '#/reading?tab=matching&id=' + m.id, label: '长篇匹配' }); });
    (D.careful || []).forEach(function (r) { pool.push({ id: r.id, tab: 'careful', title: r.title, route: '#/reading?tab=careful&id=' + r.id, label: '仔细阅读' }); });
    return pool;
  }

  function nextReading() {
    const pool = readingPool();
    return pool.find(function (p) { return !S.state.reading[p.id]; }) || pool[new Date().getDate() % pool.length];
  }

  function nextWriting() {
    const day = Math.floor(Date.now() / 86400000);
    if (day % 2 === 0) {
      const p = C.data.writingPrompts[day % C.data.writingPrompts.length];
      return { label: '写作', title: p.title, route: '#/writing?tab=write&prompt=' + p.id, module: 'writing' };
    }
    const t = C.data.translations[day % C.data.translations.length];
    return { label: '翻译', title: t.title, route: '#/writing?tab=translate&prompt=' + t.id, module: 'translation' };
  }

  function planItems() {
    const today = S.todaySummary();
    const due = S.vocabStats().due;
    const newTarget = S.newTarget();
    const vocabMin = Math.max(8, Math.min(18, Math.round(5 + (due + (due ? 0 : newTarget)) * 0.35)));
    const listen = nextListening();
    const read = nextReading();
    const write = nextWriting();
    return [
      { module: 'vocab', icon: 'book', cls: 'vocab', title: due ? '清空今日到期词' : '学习一组新词',
        meta: due ? (due + ' 个词到期 · 之后学 ' + newTarget + ' 个新词') : (newTarget + ' 个新词 · 听音辨义 / 拼写'),
        minutes: vocabMin, route: '#/vocab?tab=review', done: today.done('vocab') },
      { module: 'listening', icon: 'headphones', cls: 'listen', title: '精听 · ' + (listen ? listen.title : '听力训练'),
        meta: listen ? (listen.scene + ' · ' + listen.questions.length + ' 题') : '长对话与讲座',
        minutes: 12, route: listen ? '#/listening?set=' + listen.id : '#/listening', done: today.done('listening') },
      { module: 'reading', icon: 'scan', cls: 'read', title: read.label + ' · ' + read.title,
        meta: '限时阅读 · 证据定位', minutes: 12, route: read.route, done: today.done('reading') },
      { module: write.module, icon: 'pen', cls: 'write', title: write.label + ' · ' + write.title,
        meta: '限时 30 分钟 · 本地批改', minutes: 20, route: write.route, done: today.done(write.module) }
    ];
  }

  function recentActivity() {
    const acts = S.state.activity;
    const days = Object.keys(acts).filter(function (d) { return acts[d].minutes > 0; }).sort().reverse().slice(0, 4);
    if (!days.length) return '';
    const labels = { vocab: '词汇', listening: '听力', reading: '阅读', writing: '写作', translation: '翻译', mock: '模考' };
    return days.map(function (d) {
      const mods = acts[d].modules || {};
      const parts = Object.keys(mods).map(function (k) {
        return (labels[k] || k) + ' ' + Math.round(mods[k].minutes) + ' 分钟';
      });
      return '<div class="recent-item"><span class="recent-time">' + C.esc(d === C.todayISO() ? '今天' : C.fmtDate(d, 'short')) + '</span>' +
        '<span class="recent-text"><b>' + parts.join(' · ') + '</b><br><span class="muted small">累计 ' + Math.round(acts[d].minutes) + ' 分钟 · ' + (acts[d].items || 0) + ' 项练习</span></span></div>';
    }).join('');
  }

  function onbardingSteps() {
    return '<div class="stack-sm">' +
      '<a class="quick-link" href="#/vocab">' + C.icon('book', 14) + '先做 10 个词的记忆盒</a>' +
      '<a class="quick-link" href="#/listening?mode=dictation">' + C.icon('headphones', 14) + '用一段对话试听写</a>' +
      '<a class="quick-link" href="#/reading?tab=sentences">' + C.icon('scan', 14) + '拆一个长难句看看</a>' +
      '</div>';
  }

  function render(view, ctx) {
    const m = C.progress.mastery();
    const streak = S.computeStreak();
    const today = S.todaySummary();
    const vs = S.vocabStats();
    const es = S.errorStats();
    const left = Math.max(0, C.diffDays(C.todayISO(), S.state.profile.examDate));
    const examIso = S.state.profile.examDate;
    const target = S.state.profile.target || 550;
    const name = (S.state.profile.name || '').trim() || '同学';
    const plan = planItems();
    plan.forEach(function (p) { if (p.done) p.meta += ' · 今日已完成，可继续'; });
    const nextTask = plan.find(function (p) { return !p.done; }) || plan[0];
    const totalMin = plan.reduce(function (s, p) { return s + p.minutes; }, 0);
    const daily = S.state.profile.dailyMinutes || 45;
    const ringPct = C.clamp((left / 90) * 100, left === 0 ? 100 : 3, 100);
    const circ = 2 * Math.PI * 68;
    const quote = QUOTES[new Date().getDate() % QUOTES.length];
    const forecast = C.progress.reviewForecast(7);
    const maxForecast = Math.max.apply(null, forecast.counts.concat([1]));
    const weak = C.progress.weakAreas(3);
    const predictions = m.predicted;
    const testDateLabel = C.fmtDate(examIso, 'full');

    const heroDesc = vs.due > 0
      ? '有 ' + vs.due + ' 个词在等你复习。先把它们清掉，再打开新的一组。'
      : today.minutes > 0
        ? '今天已经学了 ' + today.minutes + ' 分钟。继续完成剩下的一两项，就够了。'
        : '桌已经铺好。从最小的一步开始：十个词，或一段六分钟的听力。';

    let html = '';
    html += '<section class="hero">' +
      '<div class="hero-copy">' +
        '<div class="eyebrow">' + C.esc(C.fmtDate(C.todayISO(), 'full')) + (left > 0 ? ' · 距离考试 ' + left + ' 天' : ' · 考试日') + '</div>' +
        '<h1>' + greeting() + '，<em>' + C.esc(name) + '</em>。</h1>' +
        '<p class="hero-desc">' + C.esc(heroDesc) + '</p>' +
        '<div class="hero-actions">' +
          '<button class="btn btn-primary btn-lg" data-nav="' + nextTask.route + '">' + C.icon('play', 15) + '开始今日研习</button>' +
          '<a class="btn btn-lg" href="#/analytics">' + C.icon('chart', 15) + '查看能力诊断</a>' +
        '</div>' +
        '<div class="hero-meta">' +
          '<div><b>' + streak.current + '</b><span>连续学习 / 天</span></div>' +
          '<div><b>' + today.minutes + '</b><span>今日已学 / 分钟</span></div>' +
          '<div><b>' + (predictions == null ? '—' : predictions) + '</b><span>练习估算 / 710</span></div>' +
          '<div><b>' + es.open + '</b><span>待复盘错题</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="hero-side">' +
        '<div class="count-ring"><svg viewBox="0 0 152 152" aria-label="距离考试 ' + left + ' 天">' +
          '<circle class="ring-bg" cx="76" cy="76" r="68"/>' +
          '<circle class="ring-fg" cx="76" cy="76" r="68" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + (circ * (1 - ringPct / 100)).toFixed(1) + '"/>' +
        '</svg><div class="ring-inner"><div class="days num">' + left + '</div><div class="days-label">DAYS LEFT</div></div></div>' +
        '<div class="exam-date"><b>' + C.esc(testDateLabel) + '</b>' + (left > 0 ? '还有 ' + left + ' 天 · 目标 ' + target + ' 分' : '请到设置中更新下一次考试日期') + '</div>' +
        '<div class="target-line"><div class="row-between"><span>目标进度</span><span>' + (predictions == null ? '待诊断' : Math.round((predictions / 710) * 100) + '%') + '</span></div>' +
          '<div class="progress progress-accent"><i style="width:' + (predictions == null ? 0 : C.clamp((predictions / 710) * 100, 0, 100)) + '%"></i></div></div>' +
      '</div>' +
    '</section>';

    html += '<div class="stat-row mt-2">' +
      C.ui.stat('STREAK', streak.current, '最佳连续 <b>' + streak.best + '</b> 天', '天') +
      C.ui.stat('TODAY', today.minutes, '今日目标 <b>' + daily + '</b> 分钟', '分钟') +
      C.ui.stat('REVIEW', vs.due, '已掌握 <b>' + vs.mastered + '</b> / ' + vs.total, '词') +
      C.ui.stat('FORECAST', predictions == null ? '—' : predictions, predictions == null ? '完成两项训练后生成' : '±' + m.range + ' · ' + ({ high: '较高置信', medium: '中等置信', low: '低置信' }[m.confidence] || '练习估算'), '')
    + '</div>';

    html += '<div class="dash-grid mt-3">' +
      '<div class="stack">' +
        '<div class="card">' +
          '<div class="card-head"><div><div class="card-title">今日研习</div><div class="card-sub">预计 ' + totalMin + ' 分钟' + (totalMin > daily ? ' · 可拆成两次' : '') + '</div></div>' +
          '<span class="badge badge-jade">' + plan.filter(function (p) { return p.done; }).length + ' / 4 完成</span></div>' +
          '<div class="plan-list">' + plan.map(function (p) {
            return '<a class="plan-item" href="' + p.route + '">' +
              '<span class="plan-icon ' + p.cls + '">' + C.icon(p.icon, 16) + '</span>' +
              '<span class="plan-body"><span class="plan-title">' + C.esc(p.title) + '</span><span class="plan-meta">' + C.esc(p.meta) + '</span></span>' +
              '<span class="plan-time">' + p.minutes + ' MIN</span>' +
              '<span class="plan-check' + (p.done ? ' done' : '') + '">' + C.icon('check', 12) + '</span></a>';
          }).join('') + '</div>' +
          '<div class="notice mt-2">' + C.icon('info', 14) + '<span>任务量按每日 ' + daily + ' 分钟估算；如果今天状态一般，只做词汇与听力也算完成最小闭环。</span></div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head"><div><div class="card-title">复习负荷</div><div class="card-sub">未来 7 天到期词量</div></div>' +
          '<a class="section-link" href="#/vocab?tab=review">去复习 ' + C.icon('arrow-right', 13) + '</a></div>' +
          (forecast.total ? '<div class="mini-bars">' + forecast.labels.map(function (d, i) {
            const v = forecast.counts[i];
            return '<div class="mini-bar' + (i === 0 ? ' today' : '') + '" title="' + C.fmtDate(d, 'short') + ' · ' + v + ' 个"><i style="height:' + Math.max(3, Math.round((v / maxForecast) * 100)) + '%"></i><span>' + C.fmtDate(d, 'weekday').replace('周', '') + '</span></div>';
          }).join('') + '</div><div class="row-between mt-1"><span class="small muted">共 ' + forecast.total + ' 个待复习</span><span class="small muted">今天 ' + forecast.counts[0] + ' 个</span></div>'
            : '<div class="empty" style="padding:22px 6px">' + C.icon('check-circle', 26) + '<b>未来 7 天暂无到期词</b><p>去学一组新词，记忆盒会替你安排下一次复习。</p><a class="btn btn-sm mt-2" href="#/vocab?tab=review">学习新词</a></div>') +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head"><div><div class="card-title">最近在学</div><div class="card-sub">你的学习足迹</div></div>' +
          '<a class="section-link" href="#/analytics">完整诊断 ' + C.icon('arrow-right', 13) + '</a></div>' +
          (recentActivity() || '<div class="notice">' + C.icon('compass', 14) + '<span>还没有学习记录。从下面任意一步开始，驾驶舱会记住你的进度。</span></div><div class="mt-2">' + onbardingSteps() + '</div>') +
        '</div>' +
      '</div>' +
      '<div class="stack">' +
        '<div class="card">' +
          '<div class="card-head"><div><div class="card-title">能力速览</div><div class="card-sub">五维掌握度</div></div>' +
          '<a class="section-link" href="#/analytics">详情 ' + C.icon('arrow-right', 13) + '</a></div>' +
          (m.evidenceCount || m.evidence.vocab
            ? '<div class="radar-wrap" style="min-height:250px">' + C.charts.radar({ labels: m.labels, values: [] , series: [{ values: m.values, color: 'var(--accent)' }], size: 300 }) + '</div>' +
              '<div class="mastery-list mt-1">' + [
                { n: '词汇', v: m.vocab }, { n: '听力', v: m.listening }, { n: '阅读', v: m.reading }, { n: '写作', v: m.writing }, { n: '翻译', v: m.translation }
              ].map(function (x) {
                const color = x.n === '词汇' ? 'var(--accent)' : x.n === '听力' ? 'var(--blue)' : x.n === '阅读' ? 'var(--jade)' : x.n === '写作' ? 'var(--violet)' : 'var(--gold)';
                return '<div class="mastery-row"><span class="muted">' + x.n + '</span><span class="bar"><i style="width:' + x.v + '%;background:' + color + '"></i></span><b>' + x.v + '</b></div>';
              }).join('') + '</div>'
            : C.emptyState('还没有能力数据', '完成一次词汇复习或听力训练，雷达就会开始生长。', 'target')) +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head"><div><div class="card-title">当前最该补的</div><div class="card-sub">来自错因与模块掌握度</div></div></div>' +
          '<div>' + weak.map(function (w) {
            return '<a class="weak-item" href="' + w.route + '"><span class="weak-tag">' + C.esc(w.tag) + '</span><span class="weak-title">' + C.esc(w.label) + '</span><span class="small muted">' + C.esc(w.detail) + '</span></a>';
          }).join('') + '</div>' +
          '<a class="btn btn-sm mt-2" href="#/errors">' + C.icon('clipboard', 13) + '打开错题本</a>' +
        '</div>' +
        '<div class="card card--wash">' +
          '<div class="quote-box" id="daily-quote">“' + C.esc(quote.en) + '”</div>' +
          '<footer>' + C.esc(quote.zh) + ' · 拾级手记 <button class="btn-ghost btn-sm" data-quote-next style="margin-left:auto;float:right">换一句</button></footer>' +
        '</div>' +
      '</div>' +
    '</div>';

    view.innerHTML = html;

    const quoteEl = view.querySelector('#daily-quote');
    const quoteFooter = quoteEl ? quoteEl.nextElementSibling : null;
    let quoteIdx = new Date().getDate() % QUOTES.length;
    const nextBtn = view.querySelector('[data-quote-next]');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        quoteIdx = (quoteIdx + 1) % QUOTES.length;
        quoteEl.textContent = '“' + QUOTES[quoteIdx].en + '”';
        if (quoteFooter) quoteFooter.textContent = QUOTES[quoteIdx].zh + ' · 拾级手记 ';
        if (quoteFooter) quoteFooter.appendChild(nextBtn);
      });
    }
  }

  C.views.dashboard = { render: render };
})();
