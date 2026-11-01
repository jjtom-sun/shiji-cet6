/* App shell, hash router, command palette */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  C.views = C.views || {};

  const ROUTES = [
    { id: 'dashboard', label: '驾驶舱', icon: 'dashboard', group: '今天', title: '驾驶舱' },
    { id: 'vocab', label: '词汇', icon: 'book', group: '训练', title: '词汇与短语' },
    { id: 'listening', label: '听力', icon: 'headphones', group: '训练', title: '听力实验室' },
    { id: 'reading', label: '阅读', icon: 'scan', group: '训练', title: '阅读与长难句' },
    { id: 'writing', label: '写作与翻译', icon: 'pen', group: '训练', title: '写作与翻译工坊' },
    { id: 'mock', label: '全真模考', icon: 'timer', group: '训练', title: '全真模考' },
    { id: 'errors', label: '错题本', icon: 'clipboard', group: '复盘', title: '错题本' },
    { id: 'analytics', label: '能力诊断', icon: 'chart', group: '复盘', title: '能力诊断' },
    { id: 'tutor', label: '学伴', icon: 'sparkles', group: '工具', title: 'AI 学伴' },
    { id: 'settings', label: '设置', icon: 'settings', group: '工具', title: '设置' }
  ];
  const ROUTE_MAP = {};
  ROUTES.forEach(function (r) { ROUTE_MAP[r.id] = r; });

  let currentRoute = 'dashboard';
  let currentParams = new URLSearchParams();
  let cleanup = null;
  let paletteOpen = false;

  const S = function () { return C.store; };
  const today = function () { return C.todayISO(); };

  function daysLeft() {
    const exam = S().state.profile.examDate;
    return Math.max(0, C.diffDays(today(), exam));
  }

  function activeTheme() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function applyTheme() {
    const setting = S().state.settings.theme || 'auto';
    let theme = setting;
    if (setting === 'auto') {
      theme = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#13120f' : '#f7f4ec');
  }

  function navigate(path) {
    if (!path) return;
    if (path.charAt(0) === '#') path = path.slice(1);
    if (location.hash === '#' + path) {
      renderRoute();
    } else {
      location.hash = '#' + path;
    }
  }

  function parseHash() {
    let h = (location.hash || '').replace(/^#\/?/, '');
    if (!h) h = 'dashboard';
    const parts = h.split('?');
    const id = parts[0].split('/')[0] || 'dashboard';
    const params = new URLSearchParams(parts[1] || '');
    return { id: ROUTE_MAP[id] ? id : 'dashboard', params: params };
  }

  function refreshShell() {
    renderSidebar();
    renderTopbar();
    bindShellEvents();
  }

  function navBadge(id) {
    if (id === 'vocab') {
      const st = S().vocabStats();
      return st.due > 0 ? '<span class="nav-badge">' + st.due + '</span>' : '';
    }
    if (id === 'errors') {
      const es = S().errorStats();
      return es.open > 0 ? '<span class="nav-badge neutral">' + es.open + '</span>' : '';
    }
    return '';
  }

  function renderSidebar() {
    const host = document.getElementById('sidebar');
    if (!host) return;
    const groups = [];
    ROUTES.forEach(function (r) {
      if (!groups.find(function (g) { return g.name === r.group; })) groups.push({ name: r.group, items: [] });
      groups.find(function (g) { return g.name === r.group; }).items.push(r);
    });
    const left = daysLeft();
    const target = S().state.profile.target || 550;
    const examIso = S().state.profile.examDate;
    host.innerHTML =
      '<a class="brand" href="#/dashboard" aria-label="拾级首页">' +
        '<span class="brand-mark"><img src="assets/img/logo.svg" alt=""></span>' +
        '<span class="brand-text"><span class="brand-name">拾级</span><span class="brand-sub">CET-6 ATELIER</span></span>' +
      '</a>' +
      groups.map(function (g) {
        return '<div class="nav-group"><div class="nav-label">' + C.esc(g.name) + '</div>' +
          g.items.map(function (r) {
            return '<a class="nav-item" href="#/' + r.id + '" data-route="' + r.id + '">' +
              '<span class="nav-icon">' + C.icon(r.icon, 18) + '</span>' +
              '<span class="nav-text">' + C.esc(r.label) + '</span>' + navBadge(r.id) + '</a>';
          }).join('') + '</div>';
      }).join('') +
      '<div class="side-spacer"></div>' +
      '<a class="side-card" href="#/settings" aria-label="考试倒计时，前往设置">' +
        '<div class="eyebrow no-rule">EXAM COUNTDOWN</div>' +
        '<div class="side-count"><strong>' + left + '</strong><span>天</span></div>' +
        '<div class="side-date">' + C.esc(C.fmtDate(examIso, 'full')) + '</div>' +
        '<div class="bar"><i style="width:' + C.clamp((left / 90) * 100, 2, 100) + '%"></i></div>' +
        '<div class="row-between" style="margin-top:9px"><span class="tiny muted">目标 ' + target + ' / 710</span><span class="tiny" style="color:var(--accent)">调整 →</span></div>' +
      '</a>' +
      '<div class="side-foot"><span><i class="dot"></i>' + (S().storageOk ? '本地保存' : '存储受限') + '</span><span>v1.2</span></div>';
    setActiveNav();
  }

  function renderTopbar() {
    const host = document.getElementById('topbar');
    if (!host) return;
    const route = ROUTE_MAP[currentRoute];
    const streak = S().computeStreak();
    const name = (S().state.profile.name || '').trim();
    const initial = name ? name.charAt(0) : '拾';
    const d = new Date();
    const ctrl = /Mac/i.test(navigator.platform) ? '⌘K' : 'Ctrl K';
    host.innerHTML =
      '<button class="icon-btn menu-btn" data-menu aria-label="打开导航">' + C.icon('menu', 18) + '</button>' +
      '<div class="crumb"><span class="crumb-label">拾级</span><span class="sep">/</span><b>' + C.esc(route ? route.title : '驾驶舱') + '</b>' +
        '<span class="crumb-date">' + C.fmtDate(today(), 'short') + ' · ' + C.fmtDate(today(), 'weekday') + ' · ' + (d.getHours() < 12 ? 'AM' : 'PM') + '</span></div>' +
      '<div class="top-actions">' +
        '<button class="search-trigger" data-cmd aria-label="打开命令面板">' + C.icon('search', 15) + '<span>搜索词条、题型或功能</span><kbd>' + ctrl + '</kbd></button>' +
        '<button class="icon-btn" data-theme-toggle aria-label="切换日间/夜读模式" title="切换主题">' + C.icon(activeTheme() === 'dark' ? 'sun' : 'moon', 17) + '</button>' +
        '<span class="streak-pill" title="连续学习天数">' + C.icon('flame', 15) + streak.current + ' 天</span>' +
        '<button class="avatar" data-nav="#/settings" aria-label="打开设置" title="' + C.esc(name || '同学') + '">' + C.esc(initial) + '</button>' +
      '</div>';
  }

  function setActiveNav() {
    document.querySelectorAll('[data-route]').forEach(function (el) {
      el.classList.toggle('active', el.dataset.route === currentRoute);
    });
  }

  function bindShellEvents() {
    // Handled by document delegation; kept for symmetry.
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    const scrim = document.getElementById('nav-scrim');
    if (scrim) scrim.hidden = true;
  }

  function openNav() {
    document.body.classList.add('nav-open');
    const scrim = document.getElementById('nav-scrim');
    if (scrim) scrim.hidden = false;
  }

  function setRouteChrome() {
    setActiveNav();
    renderTopbar();
    document.title = (ROUTE_MAP[currentRoute] ? ROUTE_MAP[currentRoute].title : '拾级') + ' · 拾级 CET-6';
  }

  function renderRoute() {
    const parsed = parseHash();
    currentRoute = parsed.id;
    currentParams = parsed.params;
    closeNav();
    if (C.speech) C.speech.stop();
    if (typeof cleanup === 'function') {
      try { cleanup(); } catch (e) { console.warn(e); }
      cleanup = null;
    }
    setRouteChrome();
    const view = document.getElementById('view');
    if (!view) return;
    view.innerHTML = '';
    const page = C.views[currentRoute];
    if (!page || typeof page.render !== 'function') {
      view.innerHTML = '<div class="card">' + C.emptyState('页面还没有准备好', '请从左侧导航选择其他模块。', 'inbox') + '</div>';
      return;
    }
    try {
      const result = page.render(view, { params: currentParams, navigate: navigate, route: currentRoute });
      if (typeof result === 'function') cleanup = result;
      view.classList.remove('view-enter');
      void view.offsetWidth;
      view.classList.add('view-enter');
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (err) {
      console.error(err);
      view.innerHTML = '<div class="card"><div class="card-title">页面渲染时出现错误</div><p class="page-sub">' + C.esc(err.message) + '</p><button class="btn mt-2" data-nav="#/dashboard">返回驾驶舱</button></div>';
      if (C.toast) C.toast('页面渲染失败：' + err.message, 'bad', 4000);
    }
  }

  /* ---------- Command palette ---------- */
  const BASE_COMMANDS = [
    { group: '前往', label: '驾驶舱', icon: 'dashboard', route: '#/dashboard' },
    { group: '前往', label: '词汇与短语', icon: 'book', route: '#/vocab' },
    { group: '前往', label: '听力实验室', icon: 'headphones', route: '#/listening' },
    { group: '前往', label: '阅读与长难句', icon: 'scan', route: '#/reading' },
    { group: '前往', label: '写作与翻译工坊', icon: 'pen', route: '#/writing' },
    { group: '前往', label: '全真模考', icon: 'timer', route: '#/mock' },
    { group: '前往', label: '错题本', icon: 'clipboard', route: '#/errors' },
    { group: '前往', label: '能力诊断', icon: 'chart', route: '#/analytics' },
    { group: '前往', label: 'AI 学伴', icon: 'sparkles', route: '#/tutor' },
    { group: '开始', label: '今日词汇复习', icon: 'book', route: '#/vocab?tab=review' },
    { group: '开始', label: '听力逐句听写', icon: 'headphones', route: '#/listening?set=L1&mode=dictation' },
    { group: '开始', label: '拆一个长难句', icon: 'scan', route: '#/reading?tab=sentences&id=S1' },
    { group: '开始', label: '词义辨析速查', icon: 'layers', route: '#/vocab?tab=confuse' },
    { group: '开始', label: '写一篇限时作文', icon: 'pen', route: '#/writing?tab=write' },
    { group: '开始', label: '备考倒计时与设置', icon: 'settings', route: '#/settings' }
  ];

  function paletteResults(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return BASE_COMMANDS.slice(0, 12);
    const results = BASE_COMMANDS.filter(function (c) { return c.label.toLowerCase().indexOf(q) !== -1; });
    const vocab = ((C.data && C.data.vocab) || []).filter(function (v) {
      return v.word.toLowerCase().indexOf(q) !== -1 || (v.senses && v.senses[0] && v.senses[0].zh.indexOf(q) !== -1);
    }).slice(0, 5);
    vocab.forEach(function (v) {
      results.push({ group: '词条', label: v.word + ' · ' + (v.senses[0] ? v.senses[0].zh : ''), hint: v.pos, icon: 'book', route: '#/vocab?word=' + v.id });
    });
    const sents = ((C.data && C.data.longSentences) || []).filter(function (s) {
      return s.sentence.toLowerCase().indexOf(q) !== -1 || s.id.toLowerCase().indexOf(q) !== -1 || s.translation.indexOf(q) !== -1;
    }).slice(0, 3);
    sents.forEach(function (s) {
      results.push({ group: '长难句', label: s.id + ' · ' + C.truncate(s.sentence, 54), hint: '拆解', icon: 'scan', route: '#/reading?tab=sentences&id=' + s.id });
    });
    const errs = (S().state.errors || []).filter(function (e) {
      return !e.resolved && (e.title.toLowerCase().indexOf(q) !== -1 || (e.prompt || '').toLowerCase().indexOf(q) !== -1);
    }).slice(0, 3);
    errs.forEach(function (e) {
      results.push({ group: '错题', label: e.title, hint: e.cause, icon: 'clipboard', route: '#/errors' });
    });
    return results.slice(0, 16);
  }

  function openPalette() {
    if (paletteOpen) return;
    paletteOpen = true;
    const scrim = document.createElement('div');
    scrim.className = 'modal-scrim';
    scrim.innerHTML = '<div class="cmdk" role="dialog" aria-modal="true" aria-label="命令面板">' +
      '<div class="cmdk-input">' + C.icon('search', 17) + '<input type="text" placeholder="搜索功能、词条或长难句…" autocomplete="off" aria-label="搜索"><kbd>Esc</kbd></div>' +
      '<div class="cmdk-results"></div></div>';
    document.body.appendChild(scrim);
    const input = scrim.querySelector('input');
    const resultsEl = scrim.querySelector('.cmdk-results');
    let shown = [];
    let active = 0;

    function render() {
      const list = paletteResults(input.value);
      shown = list;
      if (active >= shown.length) active = Math.max(0, shown.length - 1);
      if (!list.length) {
        resultsEl.innerHTML = '<div class="cmdk-empty">没有匹配结果。试试 “vocab”、 “长难句” 或 “模考”。</div>';
        return;
      }
      let html = '';
      let lastGroup = '';
      list.forEach(function (item, i) {
        if (item.group !== lastGroup) {
          html += '<div class="cmdk-group">' + C.esc(item.group) + '</div>';
          lastGroup = item.group;
        }
        html += '<button class="cmdk-item' + (i === active ? ' active' : '') + '" data-idx="' + i + '">' +
          C.icon(item.icon || 'arrow-right', 15) + '<span>' + C.esc(item.label) + '</span>' +
          (item.hint ? '<span class="cmdk-hint">' + C.esc(item.hint) + '</span>' : '') + '</button>';
      });
      resultsEl.innerHTML = html;
      const activeEl = resultsEl.querySelector('.cmdk-item.active');
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
    }

    function close() {
      paletteOpen = false;
      document.removeEventListener('keydown', onKey, true);
      scrim.remove();
    }

    function run(item) {
      if (!item) return;
      close();
      if (item.route) navigate(item.route);
      if (item.run) item.run();
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(shown.length - 1, active + 1); render(); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); render(); return; }
      if (e.key === 'Enter') { e.preventDefault(); run(shown[active]); }
    }

    input.addEventListener('input', function () { active = 0; render(); });
    resultsEl.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-idx]');
      if (btn) run(shown[Number(btn.dataset.idx)]);
    });
    scrim.addEventListener('mousedown', function (e) { if (e.target === scrim) close(); });
    document.addEventListener('keydown', onKey, true);
    render();
    setTimeout(function () { input.focus(); }, 30);
  }

  /* ---------- Global events ---------- */
  function bindGlobal() {
    document.addEventListener('click', function (e) {
      const nav = e.target.closest('[data-nav]');
      if (nav) {
        e.preventDefault();
        closeNav();
        navigate(nav.dataset.nav.replace(/^#/, ''));
        return;
      }
      if (e.target.closest('[data-menu]')) { openNav(); return; }
      if (e.target.closest('[data-cmd]')) { openPalette(); return; }
      if (e.target.closest('[data-theme-toggle]')) {
        const next = activeTheme() === 'dark' ? 'light' : 'dark';
        S().setSettings({ theme: next });
        applyTheme();
        renderTopbar();
        if (C.toast) C.toast(next === 'dark' ? '已切换到夜读模式' : '已切换到日间模式', 'info', 1600);
      }
    });
    document.getElementById('nav-scrim').addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPalette();
      } else if (e.key === 'Escape') {
        closeNav();
      }
    });
    window.addEventListener('hashchange', renderRoute);
    if (window.matchMedia) {
      const mq = matchMedia('(prefers-color-scheme: dark)');
      const onChange = function () {
        if (S().state.settings.theme === 'auto') { applyTheme(); renderTopbar(); }
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  function renderFooter() {
    const host = document.getElementById('site-foot');
    if (!host) return;
    host.innerHTML = '<span class="foot-motto">Small steps, taken daily.</span>' +
      '<span>拾级 · 本地优先 · 原始材料为原创仿真内容 · <a href="#/settings" class="underline">内容与数据说明</a></span>';
  }

  function init() {
    S().load();
    applyTheme();
    renderSidebar();
    renderTopbar();
    renderFooter();
    bindGlobal();
    if (!location.hash) history.replaceState(null, '', '#/dashboard');
    renderRoute();
    S().subscribe(function () {
      renderSidebar();
      renderTopbar();
    });
    if (!S().storageOk) {
      setTimeout(function () { C.toast('浏览器本地存储不可用，刷新后进度可能丢失', 'bad', 4800); }, 700);
    }
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function () { /* offline cache is optional */ });
      });
    }
  }

  C.ui = {
    pageHead: function (opts) {
      return '<div class="page-head"><div class="head-main">' +
        (opts.eyebrow ? '<div class="eyebrow">' + C.esc(opts.eyebrow) + '</div>' : '') +
        '<h1 class="page-title">' + (opts.titleHtml || C.esc(opts.title || '')) + '</h1>' +
        (opts.sub ? '<p class="page-sub">' + (opts.subHtml || C.esc(opts.sub)) + '</p>' : '') +
        '</div>' + (opts.actions ? '<div class="head-actions">' + opts.actions + '</div>' : '') + '</div>';
    },
    sectionHead: function (title, sub, action) {
      return '<div class="section-head"><div><div class="section-title">' + C.esc(title) + '</div>' +
        (sub ? '<div class="section-sub">' + C.esc(sub) + '</div>' : '') + '</div>' + (action || '') + '</div>';
    },
    stat: function (label, value, sub, unit) {
      return '<div class="stat"><div class="stat-label">' + C.esc(label) + '</div>' +
        '<div class="stat-value num">' + C.esc(String(value)) + (unit ? '<small>' + C.esc(unit) + '</small>' : '') + '</div>' +
        (sub ? '<div class="stat-sub">' + sub + '</div>' : '') + '</div>';
    },
    moduleBadge: function (type) {
      const map = { vocab: '词汇', listening: '听力', reading: '阅读', writing: '写作', translation: '翻译', mock: '模考' };
      return '<span class="tag">' + C.esc(map[type] || type) + '</span>';
    }
  };

  C.app = { navigate: navigate, openPalette: openPalette, refreshShell: refreshShell, applyTheme: applyTheme, routes: ROUTES, currentRoute: function () { return currentRoute; } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
