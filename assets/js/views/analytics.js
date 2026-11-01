/* Analytics — radar, score estimate, heatmap, trends, achievements */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;

  const CONF = { high: '较高置信', medium: '中等置信', low: '低置信' };

  function sectionCards(m) {
    const cards = [
      { key: 'listening', label: '听力', icon: 'headphones', max: 248.5, color: 'var(--blue)', detail: m.stats.listening.count + ' 套 · 平均正确率 ' + m.stats.listening.avgBest + '%' },
      { key: 'reading', label: '阅读', icon: 'scan', max: 248.5, color: 'var(--jade)', detail: m.stats.reading.count + ' 项 · 平均正确率 ' + m.stats.reading.avgBest + '%' },
      { key: 'writing', label: '写作', icon: 'pen', max: 106.5, color: 'var(--violet)', detail: m.stats.writing.writingCount ? '最近档位 ' + m.stats.writing.writingBand + '/15' : '尚未提交' },
      { key: 'translation', label: '翻译', icon: 'languages', max: 106.5, color: 'var(--gold)', detail: m.stats.writing.translationCount ? '最近档位 ' + m.stats.writing.translationBand + '/15' : '尚未提交' }
    ];
    return cards.map(function (c) {
      const pts = m.scores[c.key];
      const has = m.evidence[c.key] > 0;
      return '<div class="card"><div class="row-between"><span class="row" style="gap:7px"><span style="color:' + c.color + '">' + C.icon(c.icon, 15) + '</span><b class="small">' + c.label + '</b></span><span class="tiny mono muted">/ ' + c.max + '</span></div>' +
        '<div class="stat-value" style="font-size:29px;margin-top:8px">' + (has ? pts : '—') + '</div>' +
        '<div class="small muted" style="min-height:17px">' + C.esc(c.detail) + '</div>' +
        '<div class="progress mt-1" style="height:4px"><i style="width:' + (has ? (pts / c.max) * 100 : 0) + '%;background:' + c.color + '"></i></div></div>';
    }).join('');
  }

  function trendCard(mocks) {
    if (!mocks.length) {
      return '<div class="card"><div class="card-head"><div><div class="card-title">模考趋势</div><div class="card-sub">完整模考总分</div></div></div>' +
        C.emptyState('还没有模考记录', '完成一套全真组合卷，这里会显示分数轨迹与薄弱模块。', 'timer') +
        '<div class="center mt-1"><a class="btn btn-sm" href="#/mock">开始一套模考</a></div></div>';
    }
    const sorted = mocks.slice().sort(function (a, b) { return a.created - b.created; });
    const labels = sorted.map(function (m) { return C.fmtDate(m.date, 'short'); });
    const values = sorted.map(function (m) { return m.total; });
    const best = Math.max.apply(null, values);
    const latest = values[values.length - 1];
    return '<div class="card"><div class="card-head"><div><div class="card-title">模考趋势</div><div class="card-sub">共 ' + mocks.length + ' 次 · 最佳 ' + best + ' / 710</div></div>' +
      '<span class="badge ' + (latest >= 500 ? 'badge-jade' : 'badge-gold') + '">最近 ' + latest + '</span></div>' +
      C.charts.line({ labels: labels, series: [{ values: values, color: 'var(--accent)' }], height: 230, min: 400, max: 710, suggestMax: 710 }) +
      '<div class="row-between mt-2"><span class="small muted">按交卷日期排列</span><a class="section-link" href="#/mock">再练一套 ' + C.icon('arrow-right', 12) + '</a></div></div>';
  }

  function errorDonut(stats) {
    const causes = Object.keys(stats.byCause).sort(function (a, b) { return stats.byCause[b] - stats.byCause[a]; }).slice(0, 5);
    if (!causes.length) {
      return '<div class="card"><div class="card-head"><div><div class="card-title">错因分布</div><div class="card-sub">来自待复盘错题</div></div></div>' +
        C.emptyState('还没有错题', '做一次带解析的练习，错因会自动归档。', 'clipboard') + '<div class="center mt-1"><a class="btn btn-sm" href="#/listening">去做听力</a></div></div>';
    }
    const colors = ['var(--accent)', 'var(--gold)', 'var(--blue)', 'var(--violet)', 'var(--jade)'];
    const items = causes.map(function (c, i) { return { label: c, value: stats.byCause[c], color: colors[i % colors.length] }; });
    return '<div class="card"><div class="card-head"><div><div class="card-title">错因分布</div><div class="card-sub">待复盘错题共 ' + stats.open + ' 题</div></div><a class="section-link" href="#/errors">打开错题本 ' + C.icon('arrow-right', 12) + '</a></div>' +
      '<div class="donut-wrap">' + C.charts.donut(items, { size: 148, stroke: 15, center: stats.open, centerLabel: 'OPEN' }) +
      '<div class="donut-legend">' + items.map(function (it) {
        return '<div class="donut-leg"><i style="background:' + it.color + '"></i><span>' + C.esc(it.label) + '</span><b>' + it.value + '</b></div>';
      }).join('') + '</div></div></div>';
  }

  function heatmapCard() {
    const hm = C.progress.heatmap(12);
    const monthByIndex = {};
    hm.months.forEach(function (m) { monthByIndex[m.index] = m.label; });
    const monthsHtml = Array.from({ length: hm.weeks }).map(function (_, w) {
      return '<span>' + (monthByIndex[w] || '') + '</span>';
    }).join('');
    return '<div class="card"><div class="card-head"><div><div class="card-title">学习热力</div><div class="card-sub">最近 12 周 · 每个格子是一天</div></div><span class="badge">' + S.totalMinutes() + ' 分钟累计</span></div>' +
      '<div class="heatmap-wrap"><div class="heat-months" style="display:grid;grid-template-columns:repeat(' + hm.weeks + ', 11px);gap:3px;width:max-content">' + monthsHtml + '</div>' +
      '<div class="heat-grid">' + hm.cells.map(function (cell) {
        return '<div class="heat-cell' + (cell.future ? ' future' : '') + '" data-level="' + cell.level + '" title="' + C.fmtDate(cell.date, 'short') + ' · ' + cell.minutes + ' 分钟"></div>';
      }).join('') + '</div></div>' +
      '<div class="heat-legend"><span>少</span><i data-level="0"></i><i data-level="1"></i><i data-level="2"></i><i data-level="3"></i><i data-level="4"></i><span>多</span><span class="muted" style="margin-left:auto">按每日学习分钟数着色</span></div></div>';
  }

  function loadCard() {
    const f = C.progress.reviewForecast(7);
    const max = Math.max.apply(null, f.counts.concat([1]));
    return '<div class="card"><div class="card-head"><div><div class="card-title">复习负荷</div><div class="card-sub">未来 7 天到期词量</div></div><a class="section-link" href="#/vocab?tab=review">去复习 ' + C.icon('arrow-right', 12) + '</a></div>' +
      '<div class="load-bars">' + f.labels.map(function (d, i) {
        return '<div class="load-bar' + (f.counts[i] === max && max > 0 ? ' peak' : '') + '"><b>' + (f.counts[i] || '') + '</b><i style="height:' + Math.max(3, Math.round((f.counts[i] / max) * 100)) + '%"></i><span>' + C.fmtDate(d, 'weekday').replace('周', '') + '</span></div>';
      }).join('') + '</div>' +
      '<div class="row-between mt-1"><span class="small muted">共 ' + f.total + ' 个待复习</span><span class="small muted">今天 ' + f.counts[0] + ' 个</span></div></div>';
  }

  function achievementsCard() {
    const list = S.achievementStatus();
    const unlocked = list.filter(function (a) { return a.unlocked; }).length;
    return '<div class="card"><div class="card-head"><div><div class="card-title">成就</div><div class="card-sub">已解锁 ' + unlocked + ' / ' + list.length + '</div></div></div>' +
      '<div class="achievement-grid">' + list.map(function (a) {
        return '<div class="ach ' + (a.unlocked ? 'unlocked' : 'locked') + '" title="' + C.esc(a.desc) + '"><span class="medal">' + C.icon(a.icon, 13) + '</span><div><b>' + C.esc(a.name) + '</b><span>' + C.esc(a.desc) + '</span></div></div>';
      }).join('') + '</div></div>';
  }

  function mockHistory(mocks) {
    if (!mocks.length) return '';
    return '<div class="card"><div class="card-head"><div><div class="card-title">模考记录</div><div class="card-sub">最近 ' + Math.min(5, mocks.length) + ' 次</div></div></div>' +
      '<div class="history-list">' + mocks.slice(0, 5).map(function (m) {
        return '<div class="history-item"><span class="h-date">' + C.fmtDate(m.date, 'short') + '</span><span class="h-title">' + C.esc(m.paperTitle || '全真组合卷') + ' · ' + (m.strict ? '严格' : '练习') + '模式</span><span class="h-score">' + m.total + '</span></div>';
      }).join('') + '</div></div>';
  }

  function render(view) {
    const m = C.progress.mastery();
    const target = S.state.profile.target || 550;
    const mocks = (S.state.mocks || []).slice();
    const es = S.errorStats();
    const hasPred = m.predicted != null;
    const targetPos = C.clamp((target / 710) * 100, 0, 100);
    const predPos = hasPred ? C.clamp((m.predicted / 710) * 100, 0, 100) : 0;
    const bandLeft = hasPred ? C.clamp(((m.predicted - m.range) / 710) * 100, 0, 100) : 0;
    const bandWidth = hasPred ? C.clamp(((m.range * 2) / 710) * 100, 1, 100 - bandLeft) : 0;
    const name = (S.state.profile.name || '').trim() || '同学';

    view.innerHTML = '<div class="print-title">拾级 · 学习诊断报告<span>' + C.esc(name) + ' · ' + C.esc(C.fmtDate(C.todayISO(), 'full')) + ' · 目标 ' + target + ' / 710</span></div>' +
      C.ui.pageHead({
        eyebrow: 'DIAGNOSTICS', title: '能力诊断',
        sub: '把训练记录折算成可解释的五维掌握度与分数区间。所有数字都是练习估算，不是官方成绩。',
        actions: '<button class="btn" data-print-report>' + C.icon('file-text', 14) + '打印报告</button>' +
          '<a class="btn btn-primary no-print" href="#/mock">' + C.icon('timer', 14) + '去模考校准</a>'
      }) +
      '<div class="analytics-hero">' +
        '<div class="card score-hero">' +
          '<div class="eyebrow">ESTIMATED SCORE</div>' +
          '<div class="row" style="align-items:baseline;gap:8px"><div class="pred-score num' + (hasPred ? '' : ' pending') + '">' + (hasPred ? m.predicted : '待测') + '</div><small class="muted">' + (hasPred ? '/ 710' : '') + '</small></div>' +
          '<div class="pred-range">' + (hasPred ? '区间 ' + (m.predicted - m.range) + '–' + (m.predicted + m.range) + ' · ' + (CONF[m.confidence] || '练习估算') + ' · 目标 ' + target : '完成至少两个模块（或一套模考）后生成预测') + '</div>' +
          '<div class="score-scale"><div class="rail"></div><div class="band" style="left:' + bandLeft + '%;width:' + bandWidth + '%"></div>' +
            '<div class="target-mark" style="left:' + targetPos + '%"><span>目标 ' + target + '</span></div>' +
            '<div class="scale-labels"><span>0</span><span>425</span><span>550</span><span>710</span></div></div>' +
          '<div class="row mt-3" style="flex-wrap:wrap;gap:8px">' +
            (hasPred ? (m.predicted >= target
              ? '<span class="chip chip-jade">' + C.icon('check-circle', 12) + '高于目标 ' + (m.predicted - target) + ' 分</span>'
              : '<span class="chip chip-gold">' + C.icon('target', 12) + '距目标还差 ' + (target - m.predicted) + ' 分</span>') : '<span class="chip chip-muted">样本不足</span>') +
            '<span class="chip chip-muted">优势：' + (function () {
              const pairs = [['词汇', m.vocab], ['听力', m.listening], ['阅读', m.reading], ['写作', m.writing], ['翻译', m.translation]].filter(function (x) { return x[1] > 0; });
              if (!pairs.length) return '尚无';
              pairs.sort(function (a, b) { return b[1] - a[1]; });
              return pairs[0][0] + ' ' + pairs[0][1] + '%';
            })() + '</span>' +
          '</div>' +
          '<div class="small faint mt-2">算法：可用模块按完成量向中性值收缩；若已有模考，则按模考 65% + 模块训练 35% 加权。未练模块会拉低置信度。</div>' +
          (m.mock ? '<div class="small muted mt-1">当前锚定：' + C.esc(m.mock.paperTitle || '模考') + ' · ' + m.mock.total + ' 分</div>' : '') +
        '</div>' +
        '<div class="card">' +
          '<div class="card-head"><div><div class="card-title">五维能力雷达</div><div class="card-sub">词汇 / 听力 / 阅读 / 写作 / 翻译</div></div><span class="badge badge-jade">已练 ' + m.evidenceCount + ' / 4 模块</span></div>' +
          (m.evidenceCount || m.evidence.vocab
            ? '<div class="radar-wrap">' + C.charts.radar({ labels: m.labels, series: [{ values: m.values }], size: 340 }) + '</div>' +
              '<div class="cluster mt-1">' + m.labels.map(function (l, i) {
                return '<span class="chip chip-sm">' + C.esc(l) + ' ' + m.values[i] + '</span>';
              }).join('') + '</div>'
            : C.emptyState('雷达还在起点', '完成词汇、听力与阅读各一次，图形就会开始有形状。', 'target')) +
          '<div class="small faint mt-2">掌握度按实际训练计算，未练模块显示 0；词汇以记忆盒状态折算。</div>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-4 mt-2">' + sectionCards(m) + '</div>' +
      '<div class="grid grid-2 mt-3">' + trendCard(mocks) + errorDonut(es) + '</div>' +
      '<div class="grid mt-2" style="grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr)">' + heatmapCard() + loadCard() + '</div>' +
      '<div class="grid grid-2 mt-2">' +
        '<div class="card"><div class="card-head"><div><div class="card-title">最该补的</div><div class="card-sub">按错因与模块掌握度排序</div></div></div>' +
          C.progress.weakAreas(4).map(function (w) {
            return '<a class="weak-item" href="' + w.route + '"><span class="weak-tag">' + C.esc(w.tag) + '</span><span class="weak-title">' + C.esc(w.label) + '</span><span class="small muted">' + C.esc(w.detail) + '</span></a>';
          }).join('') +
          '<a class="btn btn-sm mt-2" href="#/errors">整理错题 ' + C.icon('arrow-right', 12) + '</a></div>' +
        achievementsCard() +
      '</div>' +
      mockHistory(mocks) +
      '<div class="card mt-2"><div class="card-head"><div><div class="card-title">分数怎么算</div><div class="card-sub">透明说明，避免把估算当官方分</div></div></div>' +
        '<div class="grid grid-3"><div><div class="eyebrow no-rule">权重</div><p class="small mt-1">听力 35%（248.5）、阅读 35%（248.5）、写作 15%（106.5）、翻译 15%（106.5）。</p></div>' +
        '<div><div class="eyebrow no-rule">训练</div><p class="small mt-1">客观题按正确率折算；写作翻译按 15 分档位折算。未练模块使用中性值，并降低置信度。</p></div>' +
        '<div><div class="eyebrow no-rule">模考</div><p class="small mt-1">有模考时，以最佳模考为锚，再与日常训练加权；区间随证据量收窄。</p></div></div>' +
        '<div class="notice mt-2">' + C.icon('alert', 14) + '<span>' + C.esc(C.data.scoreNote) + '</span></div></div>';

    const printBtn = view.querySelector('[data-print-report]');
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
    return function () { C.speech.stop(); };
  }

  C.views.analytics = { render: render };
})();
