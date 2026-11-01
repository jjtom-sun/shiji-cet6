/* Derived progress, forecasts and score estimates */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};

  function readingStats() {
    const entries = Object.keys(C.store.state.reading).map(function (k) {
      return Object.assign({ id: k }, C.store.state.reading[k]);
    });
    return {
      attempts: entries.reduce(function (s, e) { return s + (e.attempts || 0); }, 0),
      count: entries.length,
      avgBest: entries.length ? Math.round(entries.reduce(function (s, e) { return s + (e.best || 0); }, 0) / entries.length) : 0,
      entries: entries
    };
  }

  function listeningStats() {
    const entries = Object.keys(C.store.state.listening).map(function (k) {
      return Object.assign({ id: k }, C.store.state.listening[k]);
    });
    const withDict = entries.filter(function (e) { return e.dictationBest; });
    const attempts = entries.reduce(function (s, e) { return s + (e.attempts || 0); }, 0);
    return {
      attempts: attempts,
      count: entries.length,
      avgBest: entries.length ? Math.round(entries.reduce(function (s, e) { return s + (e.best || 0); }, 0) / entries.length) : 0,
      dictationAvg: withDict.length ? Math.round(withDict.reduce(function (s, e) { return s + e.dictationBest; }, 0) / withDict.length) : 0,
      best: entries.length ? Math.max.apply(null, entries.map(function (e) { return e.best || 0; })) : 0,
      entries: entries
    };
  }

  function writingStats() {
    const subs = C.store.state.submissions || [];
    const w = subs.filter(function (s) { return s.type === 'writing'; });
    const t = subs.filter(function (s) { return s.type === 'translation'; });
    function avgBand(list) {
      if (!list.length) return 0;
      const recent = list.slice(0, 3);
      return Math.round((recent.reduce(function (a, b) { return a + (b.band || 0); }, 0) / recent.length) * 10) / 10;
    }
    return {
      writingCount: w.length, translationCount: t.length,
      latestWriting: w[0] || null, latestTranslation: t[0] || null,
      writingBand: w.length ? w[0].band : 0,
      translationBand: t.length ? t[0].band : 0,
      writingAvg: avgBand(w), translationAvg: avgBand(t)
    };
  }

  function mastery() {
    const vs = C.store.vocabStats();
    const ls = listeningStats();
    const rs = readingStats();
    const ws = writingStats();

    const learned = vs.seen;
    let vocabRaw = 0;
    if (vs.total) {
      const base = ((vs.mastered + vs.learning * 0.45) / vs.total) * 100;
      const accFactor = learned ? 0.7 + 0.3 * (vs.accuracy / 100) : 0.7;
      vocabRaw = Math.round(C.clamp(base * accFactor, 0, 100));
    }

    const listeningRaw = ls.attempts > 0 || ls.dictationAvg > 0
      ? Math.round(ls.avgBest * 0.75 + (ls.dictationAvg || ls.avgBest) * 0.25)
      : 0;
    const readingRaw = rs.attempts > 0 ? rs.avgBest : 0;
    const writingRaw = ws.writingBand ? Math.round((ws.writingBand / 15) * 100) : 0;
    const translationRaw = ws.translationBand ? Math.round((ws.translationBand / 15) * 100) : 0;

    const evidence = {
      vocab: learned,
      listening: ls.attempts + (ls.dictationAvg ? 1 : 0),
      reading: rs.attempts,
      writing: ws.writingCount,
      translation: ws.translationCount
    };
    const evidenceCount = ['listening', 'reading', 'writing', 'translation'].filter(function (k) { return evidence[k] > 0; }).length;

    const mock = C.store.bestMock();
    const neutral = 52;
    function shrink(raw, n) {
      if (!n) return neutral;
      return (raw * n + neutral * 1.6) / (n + 1.6);
    }
    const L = shrink(listeningRaw, evidence.listening);
    const R = shrink(readingRaw, evidence.reading);
    const W = shrink(writingRaw, evidence.writing);
    const T = shrink(translationRaw, evidence.translation);
    const estimate = 248.5 * (L / 100) + 248.5 * (R / 100) + 106.5 * (W / 100) + 106.5 * (T / 100);
    let predicted = null;
    let range = null;
    let confidence = 'none';
    if (mock || evidenceCount >= 2) {
      predicted = Math.round(mock ? mock.total * 0.65 + estimate * 0.35 : estimate);
      predicted = C.clamp(predicted, 0, 710);
      confidence = 'low';
      range = 30;
      if (evidenceCount >= 3) { confidence = 'medium'; range = 24; }
      if (evidenceCount >= 4) { confidence = 'high'; range = 18; }
      if (mock && evidenceCount >= 3) { confidence = 'high'; range = 16; }
      if (mock && evidenceCount < 3) { confidence = 'medium'; range = 22; }
    }

    const scores = {
      listening: Math.round((248.5 * listeningRaw) / 100),
      reading: Math.round((248.5 * readingRaw) / 100),
      writing: Math.round((106.5 * writingRaw) / 100),
      translation: Math.round((106.5 * translationRaw) / 100)
    };

    return {
      vocab: vocabRaw,
      listening: listeningRaw,
      reading: readingRaw,
      writing: writingRaw,
      translation: translationRaw,
      labels: ['词汇', '听力', '阅读', '写作', '翻译'],
      values: [vocabRaw, listeningRaw, readingRaw, writingRaw, translationRaw],
      evidence: evidence,
      evidenceCount: evidenceCount,
      predicted: predicted,
      range: range,
      confidence: confidence,
      scores: scores,
      stats: { vocab: vs, listening: ls, reading: rs, writing: ws },
      mock: mock
    };
  }

  function reviewForecast(days) {
    days = days || 7;
    const counts = {};
    const labels = [];
    const today = C.todayISO();
    for (let i = 0; i < days; i++) {
      const d = C.addDays(today, i);
      counts[d] = 0;
      labels.push(d);
    }
    const bank = (C.data && C.data.vocab) || [];
    bank.forEach(function (w) {
      const r = C.store.state.vocab[w.id];
      if (!r || r.box >= 5) return;
      let due = r.due || today;
      if (due < today) due = today;
      if (due <= C.addDays(today, days - 1)) counts[due] = (counts[due] || 0) + 1;
    });
    const total = labels.reduce(function (s, d) { return s + counts[d]; }, 0);
    return { labels: labels, counts: labels.map(function (d) { return counts[d]; }), total: total };
  }

  function heatmap(weeks) {
    weeks = weeks || 12;
    const today = C.todayISO();
    const dow = (C.parseISO(today).getDay() + 6) % 7; // Monday = 0
    const start = C.addDays(today, -(weeks * 7 - 1 - (6 - dow)));
    const cells = [];
    for (let i = 0; i < weeks * 7; i++) {
      const date = C.addDays(start, i);
      const isFuture = date > today;
      const minutes = isFuture ? 0 : C.store.activityFor(date).minutes;
      const level = minutes <= 0 ? 0 : minutes < 15 ? 1 : minutes < 30 ? 2 : minutes < 60 ? 3 : 4;
      cells.push({ date: date, minutes: Math.round(minutes), level: level, future: isFuture });
    }
    const months = [];
    for (let w = 0; w < weeks; w++) {
      const d = C.parseISO(cells[w * 7].date);
      const label = (d.getMonth() + 1) + '月';
      if (!months.length || months[months.length - 1].label !== label) months.push({ label: label, index: w });
    }
    return { cells: cells, months: months, weeks: weeks, start: start };
  }

  function weekSeries(days) {
    days = days || 7;
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = C.addDays(C.todayISO(), -i);
      out.push({ date: d, minutes: Math.round(C.store.activityFor(d).minutes), label: C.fmtDate(d, 'weekday') });
    }
    return out;
  }

  function weakAreas(limit) {
    const out = [];
    const es = C.store.errorStats();
    const causes = Object.keys(es.byCause).sort(function (a, b) { return es.byCause[b] - es.byCause[a]; });
    causes.slice(0, 2).forEach(function (cause) {
      out.push({ label: cause, detail: '错题本中有 ' + es.byCause[cause] + ' 题', route: '#/errors', tag: '错因', severity: 'high' });
    });
    const m = mastery();
    const modules = [
      { key: 'listening', name: '听力', route: '#/listening' },
      { key: 'reading', name: '阅读', route: '#/reading' },
      { key: 'writing', name: '写作', route: '#/writing?tab=write' },
      { key: 'translation', name: '翻译', route: '#/writing?tab=translate' }
    ].filter(function (x) { return m.evidence[x.key] > 0 && m[x.key] < 70; }).sort(function (a, b) { return m[a.key] - m[b.key]; });
    modules.slice(0, 2).forEach(function (mod) {
      out.push({ label: mod.name + '掌握度 ' + m[mod.key] + '%', detail: '当前最需要补的模块', route: mod.route, tag: '模块', severity: 'mid' });
    });
    const vs = C.store.vocabStats();
    if (vs.due > 0 && out.length < 3) out.push({ label: '到期词 ' + vs.due + ' 个', detail: '先清空复习，再学新词', route: '#/vocab?tab=review', tag: '词汇', severity: 'mid' });
    if (!out.length) {
      if (m.evidenceCount > 0) {
        out.push({ label: '五项掌握度都在 70% 以上', detail: '保持节奏，下一次模考用来校准', route: '#/mock', tag: '保持', severity: 'low' });
      } else {
        out.push({ label: '还没有足够的诊断数据', detail: '完成一次词汇复习或听力训练即可开始定位', route: '#/vocab?tab=review', tag: '开始', severity: 'low' });
      }
    }
    return out.slice(0, limit || 4);
  }

  function moduleRows() {
    const m = mastery();
    const vs = m.stats.vocab, ls = m.stats.listening, rs = m.stats.reading, ws = m.stats.writing;
    return [
      { key: 'vocab', name: '词汇', icon: 'book', value: m.vocab, detail: '已接触 ' + vs.seen + ' / ' + vs.total + ' · 掌握 ' + vs.mastered, route: '#/vocab' },
      { key: 'listening', name: '听力', icon: 'headphones', value: m.listening, detail: '已练 ' + ls.count + ' 套 · 听写均分 ' + (ls.dictationAvg || 0), route: '#/listening' },
      { key: 'reading', name: '阅读', icon: 'scan', value: m.reading, detail: '已完成 ' + rs.count + ' 项 · 平均 ' + rs.avgBest + '%', route: '#/reading' },
      { key: 'writing', name: '写作', icon: 'pen', value: m.writing, detail: ws.writingCount ? '最近档位 ' + ws.writingBand + '/15' : '尚未提交', route: '#/writing?tab=write' },
      { key: 'translation', name: '翻译', icon: 'languages', value: m.translation, detail: ws.translationCount ? '最近档位 ' + ws.translationBand + '/15' : '尚未提交', route: '#/writing?tab=translate' }
    ];
  }

  C.progress = {
    mastery: mastery,
    listeningStats: listeningStats,
    readingStats: readingStats,
    writingStats: writingStats,
    reviewForecast: reviewForecast,
    heatmap: heatmap,
    weekSeries: weekSeries,
    weakAreas: weakAreas,
    moduleRows: moduleRows
  };
})();
