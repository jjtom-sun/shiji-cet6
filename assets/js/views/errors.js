/* Error book — triage by cause, resolve and revisit */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;
  const MODULE = { vocab: '词汇', listening: '听力', reading: '阅读', writing: '写作', translation: '翻译', mock: '模考' };

  function render(view, ctx) {
    const state = { status: 'open', module: '', cause: '', q: '' };
    const stats = S.errorStats();
    const causes = S.CAUSES;
    const weekAgo = Date.now() - 7 * 86400000;
    const weekNew = S.state.errors.filter(function (e) { return e.createdAt >= weekAgo; }).length;
    const resolved = S.state.errors.filter(function (e) { return e.resolved; }).length;
    const topCause = Object.keys(stats.byCause).sort(function (a, b) { return stats.byCause[b] - stats.byCause[a]; })[0] || '—';

    view.innerHTML = C.ui.pageHead({
      eyebrow: 'ERROR BOOK',
      title: '错题本',
      sub: '按题型与错因自动归档。先重做，再看解析；同一错因出现三次，就去做专项训练。',
      actions: '<a class="btn" href="#/vocab?tab=review">' + C.icon('book', 14) + '词汇复习</a>' +
        '<a class="btn" href="#/reading?tab=careful">' + C.icon('crosshair', 14) + '定位训练</a>'
    }) +
    '<div class="stat-row mb-3">' +
      C.ui.stat('OPEN', stats.open, '待复盘', '题') +
      C.ui.stat('THIS WEEK', weekNew, '最近 7 天新增', '题') +
      C.ui.stat('TOP CAUSE', C.truncate(topCause, 8), '最常见错因', '') +
      C.ui.stat('RESOLVED', resolved, '已标记解决', '题') +
    '</div>' +
    '<div class="grid" style="grid-template-columns:minmax(0,1.45fr) minmax(280px,.55fr);align-items:start">' +
      '<div class="stack">' +
        '<div class="card">' +
          '<div class="row-between mb-2" style="flex-wrap:wrap;gap:8px"><div class="seg" id="err-status">' +
            '<button data-status="open" class="active">待复盘 ' + stats.open + '</button>' +
            '<button data-status="resolved">已解决 ' + resolved + '</button>' +
            '<button data-status="all">全部 ' + S.state.errors.length + '</button>' +
          '</div><div class="row" style="gap:6px;flex-wrap:wrap">' +
            '<select class="select input-inline" id="err-module" style="width:auto;height:32px;font-size:11.5px"><option value="">全部模块</option>' + Object.keys(MODULE).map(function (k) {
              return '<option value="' + k + '">' + MODULE[k] + '</option>';
            }).join('') + '</select>' +
            '<select class="select input-inline" id="err-cause" style="width:auto;height:32px;font-size:11.5px"><option value="">全部错因</option>' + causes.map(function (c) { return '<option value="' + C.esc(c) + '">' + C.esc(c) + '</option>'; }).join('') + '</select>' +
            '<div class="input-group" style="width:170px">' + C.icon('search', 14) + '<input class="input search-input" id="err-search" placeholder="搜索题目…" style="height:32px;font-size:11.5px"></div>' +
          '</div></div>' +
          '<div id="err-list"></div>' +
        '</div>' +
      '</div>' +
      '<aside class="stack">' +
        '<div class="side-panel"><div class="card-kicker">CAUSE PROFILE</div><div class="card-title" style="font-size:16px;margin-top:4px">错因分布</div>' +
          '<div class="mt-2" id="cause-bars">' + (causes.filter(function (c) { return stats.byCause[c]; }).sort(function (a, b) { return stats.byCause[b] - stats.byCause[a]; }).slice(0, 6).map(function (c) {
            const max = Math.max.apply(null, Object.values(stats.byCause).concat([1]));
            return '<div class="mastery-row" style="grid-template-columns:110px 1fr 24px"><span class="muted">' + C.esc(c) + '</span><span class="bar"><i style="width:' + Math.round((stats.byCause[c] / max) * 100) + '%;background:var(--accent)"></i></span><b>' + stats.byCause[c] + '</b></div>';
          }).join('') || '<div class="small muted">还没有错题。</div>') + '</div>' +
          '<div class="small faint mt-2">错因来自题目解析，也可看作“下一轮复习的路线图”。</div>' +
        '</div>' +
        '<div class="side-panel"><div class="card-kicker">REVIEW RITUAL</div><div class="card-title" style="font-size:16px;margin-top:4px">三步复盘</div>' +
          '<div class="guide-steps mt-1"><div class="guide-step"><div><b>重做</b><span>先不看答案，回到原题再做一次</span></div></div><div class="guide-step"><div><b>说因</b><span>用一句话解释为什么错，而不是“马虎”</span></div></div><div class="guide-step"><div><b>迁移</b><span>找一道同源题，确认不是记住答案</span></div></div></div>' +
        '</div>' +
        '<div class="notice">' + C.icon('info', 14) + '<span>“已解决”只表示你复盘过，不代表永远不忘。重要错题可以保留，隔一周再做一次。</span></div>' +
      '</aside>' +
    '</div>';

    const listHost = view.querySelector('#err-list');

    function filtered() {
      return S.state.errors.filter(function (e) {
        if (state.status === 'open' && e.resolved) return false;
        if (state.status === 'resolved' && !e.resolved) return false;
        if (state.module && e.module !== state.module) return false;
        if (state.cause && e.cause !== state.cause) return false;
        if (state.q && (e.title + ' ' + e.prompt + ' ' + e.cause + ' ' + (e.explain || '')).toLowerCase().indexOf(state.q.toLowerCase()) === -1) return false;
        return true;
      }).sort(function (a, b) {
        if (!!a.resolved !== !!b.resolved) return a.resolved ? 1 : -1;
        return b.last - a.last;
      });
    }

    function renderList() {
      const list = filtered();
      if (!list.length) {
        listHost.innerHTML = C.emptyState(state.status === 'open' ? '没有待复盘的错题' : '没有符合条件的记录', '做一次听力、阅读或模考，错误会自动归档到这里。', 'clipboard');
        return;
      }
      listHost.innerHTML = list.map(function (e) {
        return '<div class="card errorbook-item" data-id="' + e.id + '" style="margin-top:10px">' +
          '<div class="row-between" style="align-items:flex-start;gap:10px;flex-wrap:wrap"><div><span class="badge badge-blue">' + C.esc(MODULE[e.module] || e.module) + '</span> ' +
          '<b>' + C.esc(e.title) + '</b></div><div class="row" style="gap:6px"><span class="chip chip-sm chip-accent">' + C.esc(e.cause) + '</span>' + (e.times > 1 ? '<span class="chip chip-sm">错 ' + e.times + ' 次</span>' : '') + (e.resolved ? '<span class="badge badge-jade">已解决</span>' : '<span class="badge badge-gold">待复盘</span>') + '</div></div>' +
          '<div class="small mt-1" style="line-height:1.6">' + C.esc(e.prompt || '') + '</div>' +
          (e.your || e.correct ? '<div class="grid grid-2 mt-1" style="gap:8px"><div class="error-answer bad"><span class="tiny">你的答案</span>' + C.esc(e.your || '未作答') + '</div><div class="error-answer good"><span class="tiny">正确答案</span>' + C.esc(e.correct || '—') + '</div></div>' : '') +
          (e.explain ? '<div class="explain mt-1">' + C.esc(e.explain) + '</div>' : '') +
          '<div class="row-between mt-2" style="flex-wrap:wrap;gap:8px"><span class="tiny faint mono">' + C.fmtDateTime(e.createdAt) + ' · 最近 ' + C.fmtDateTime(e.last) + '</span>' +
          '<div class="row" style="gap:5px">' + (e.link ? '<a class="btn btn-sm" href="' + C.esc(e.link) + '">回到题目</a>' : '') +
          '<button class="btn btn-sm ' + (e.resolved ? '' : 'btn-jade') + '" data-resolve="' + e.id + '">' + (e.resolved ? '重新标记待复盘' : '标记已解决') + '</button>' +
          '<button class="icon-mini" data-delete="' + e.id + '" title="删除" aria-label="删除">' + C.icon('trash', 13) + '</button></div></div>' +
          '</div>';
      }).join('');
    }

    function bindFilters() {
      view.querySelectorAll('[data-status]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          state.status = btn.dataset.status;
          view.querySelectorAll('[data-status]').forEach(function (b) { b.classList.toggle('active', b === btn); });
          renderList();
        });
      });
      view.querySelector('#err-module').addEventListener('change', function (e) { state.module = e.target.value; renderList(); });
      view.querySelector('#err-cause').addEventListener('change', function (e) { state.cause = e.target.value; renderList(); });
      view.querySelector('#err-search').addEventListener('input', C.debounce(function (e) { state.q = e.target.value; renderList(); }, 120));
    }

    listHost.addEventListener('click', function (e) {
      const resolve = e.target.closest('[data-resolve]');
      if (resolve) {
        const item = S.state.errors.find(function (x) { return x.id === resolve.dataset.resolve; });
        if (item) {
          S.resolveError(item.id, !item.resolved);
          C.toast(item.resolved ? '已移回待复盘' : '已标记解决', 'good', 1600);
          C.views.errors.render(view, ctx);
        }
        return;
      }
      const del = e.target.closest('[data-delete]');
      if (del) {
        const item = S.state.errors.find(function (x) { return x.id === del.dataset.delete; });
        if (!item) return;
        C.confirmDialog({ title: '删除这条错题？', message: '删除后无法恢复；它不会影响已经记录的训练数据。', confirmText: '删除', danger: true }).then(function (ok) {
          if (ok) { S.deleteError(item.id); C.views.errors.render(view, ctx); C.toast('已删除', 'info', 1600); }
        });
      }
    });

    bindFilters();
    renderList();
    return function () { };
  }

  C.views.errors = { render: render };
})();
