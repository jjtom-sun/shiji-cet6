/* Shared helpers for 拾级 · CET-6 Studio */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  C.views = C.views || {};
  C.data = C.data || {};

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function todayISO(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function parseISO(iso) {
    if (!iso) return null;
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
  }

  function addDays(iso, n) {
    const d = parseISO(iso) || new Date();
    d.setDate(d.getDate() + n);
    return todayISO(d);
  }

  function diffDays(fromISO, toISO_) {
    const a = parseISO(fromISO), b = parseISO(toISO_);
    if (!a || !b) return 0;
    return Math.round((b - a) / 86400000);
  }

  const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  function fmtDate(iso, style) {
    const d = parseISO(iso) || new Date();
    if (style === 'short') return (d.getMonth() + 1) + '月' + d.getDate() + '日';
    if (style === 'weekday') return WEEK[d.getDay()];
    if (style === 'full') return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · ' + WEEK[d.getDay()];
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + WEEK[d.getDay()];
  }

  function fmtDateTime(ts) {
    const d = new Date(ts);
    if (isNaN(d)) return '';
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function fmtDuration(sec) {
    sec = Math.max(0, Math.round(Number(sec) || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0 ? h + ':' + pad2(m) + ':' + pad2(s) : pad2(m) + ':' + pad2(s);
  }

  function fmtMinutes(min) {
    const m = Math.round(Number(min) || 0);
    if (m < 60) return m + ' 分钟';
    const h = Math.floor(m / 60), r = m % 60;
    return h + ' 小时' + (r ? ' ' + r + ' 分' : '');
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, Number(n) || 0)); }

  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function sample(list, n) { return shuffle(list).slice(0, n); }

  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait || 200);
    };
  }

  function escapeRegExp(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function normalizeSpace(str) { return String(str || '').replace(/\s+/g, ' ').trim(); }

  function wordTokens(text) {
    return (String(text || '').toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*/g) || []);
  }

  function englishWords(text) {
    return (String(text || '').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []);
  }

  function countWords(text) {
    const cleaned = String(text || '').replace(/[—–]/g, ' ');
    return (cleaned.match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || []).length;
  }

  function splitSentences(text) {
    const src = String(text || '').replace(/\s+/g, ' ').trim();
    if (!src) return [];
    const protectedSrc = src
      .replace(/\b(Mr|Mrs|Ms|Dr|Prof|St|vs|e\.g|i\.e|etc)\./gi, function (m) { return m.replace('.', '§'); })
      .replace(/(\d)\.(\d)/g, '$1§$2');
    return (protectedSrc.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [])
      .map(function (s) { return s.replace(/§/g, '.').trim(); })
      .filter(Boolean);
  }

  function truncate(str, n) {
    const s = String(str || '');
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  function titleOf(text, n) { return truncate(normalizeSpace(text), n || 48); }

  function levenshtein(a, b) {
    a = String(a || ''); b = String(b || '');
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = new Array(b.length + 1);
    let curr = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) prev[j] = j;
    for (let i = 1; i <= a.length; i++) {
      curr[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      const t = prev; prev = curr; curr = t;
    }
    return prev[b.length];
  }

  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }

  function deepClone(obj) {
    if (typeof structuredClone === 'function') {
      try { return structuredClone(obj); } catch (e) { /* fall through */ }
    }
    return JSON.parse(JSON.stringify(obj));
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  function downloadFile(filename, content, mime) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime || 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ---------- Toast ---------- */
  function toast(message, type, ms) {
    const root = $('#toast-root');
    if (!root) return;
    type = type || 'good';
    const ico = type === 'bad' ? 'x-circle' : type === 'info' ? 'info' : 'check-circle';
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = (C.icon ? C.icon(ico, 15) : '') + '<span>' + esc(message) + '</span>';
    root.appendChild(el);
    while (root.children.length > 4) root.removeChild(root.firstElementChild);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 220);
    }, ms || 2600);
  }

  /* ---------- Modal ---------- */
  let activeModal = null;

  function openModal(opts) {
    opts = opts || {};
    const root = $('#modal-root');
    if (!root) return null;
    if (activeModal) activeModal.close();

    const scrim = document.createElement('div');
    scrim.className = 'modal-scrim';
    const modal = document.createElement('div');
    modal.className = 'modal ' + (opts.size || '');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    const actions = (opts.actions || []).slice();
    const footHtml = actions.length
      ? '<div class="modal-foot">' + actions.map(function (a, i) {
          return '<button class="btn ' + (a.variant || '') + '" data-mact="' + i + '">' + esc(a.label) + '</button>';
        }).join('') + '</div>'
      : '';

    modal.innerHTML =
      '<div class="modal-head"><div><div class="modal-title" id="modal-title">' + esc(opts.title || '') + '</div>' +
      (opts.sub ? '<div class="modal-sub">' + esc(opts.sub) + '</div>' : '') +
      '</div><button class="modal-close" data-mclose aria-label="关闭">' + (C.icon ? C.icon('x', 16) : '×') + '</button></div>' +
      '<div class="modal-body"></div>' + footHtml;

    const body = $('.modal-body', modal);
    if (opts.body instanceof Node) body.appendChild(opts.body);
    else body.innerHTML = opts.body || '';

    scrim.appendChild(modal);
    root.appendChild(scrim);

    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      scrim.style.opacity = '0';
      document.removeEventListener('keydown', onKey);
      setTimeout(function () { scrim.remove(); }, 120);
      if (activeModal && activeModal.scrim === scrim) activeModal = null;
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    $('[data-mclose]', modal).addEventListener('click', close);
    scrim.addEventListener('mousedown', function (e) {
      if (e.target === scrim && !opts.static) close();
    });
    $$('[data-mact]', modal).forEach(function (btn) {
      btn.addEventListener('click', function () {
        const a = actions[Number(btn.dataset.mact)];
        if (a && a.onClick) {
          const ret = a.onClick({ close: close, modal: modal, body: body });
          if (ret === false) return;
        }
        if (!a || a.close !== false) close();
      });
    });

    activeModal = { close: close, scrim: scrim, modal: modal };
    if (opts.onMount) opts.onMount(modal, close);
    setTimeout(function () {
      const focusEl = modal.querySelector('[autofocus], input, textarea, button.btn-primary, button');
      if (focusEl) focusEl.focus();
    }, 30);
    return activeModal;
  }

  function confirmDialog(opts) {
    return new Promise(function (resolve) {
      let decided = false;
      const m = openModal({
        title: opts.title || '确认操作',
        sub: opts.sub || '',
        size: 'narrow',
        body: '<p class="page-sub" style="margin:0">' + esc(opts.message || '') + '</p>',
        actions: [
          { label: opts.cancelText || '取消', onClick: function () { decided = true; resolve(false); } },
          { label: opts.confirmText || '确认', variant: opts.danger ? 'btn-danger' : 'btn-primary', onClick: function () { decided = true; resolve(true); } }
        ],
        onClose: function () { if (!decided) resolve(false); }
      });
      if (!m) resolve(false);
    });
  }

  function emptyState(title, desc, iconName) {
    return '<div class="empty">' + (C.icon ? C.icon(iconName || 'inbox', 30) : '') +
      '<b>' + esc(title) + '</b><p>' + esc(desc || '') + '</p></div>';
  }

  C.$ = $;
  C.$$ = $$;
  C.esc = esc;
  C.pad2 = pad2;
  C.todayISO = todayISO;
  C.parseISO = parseISO;
  C.addDays = addDays;
  C.diffDays = diffDays;
  C.fmtDate = fmtDate;
  C.fmtDateTime = fmtDateTime;
  C.fmtDuration = fmtDuration;
  C.fmtMinutes = fmtMinutes;
  C.clamp = clamp;
  C.uid = uid;
  C.shuffle = shuffle;
  C.sample = sample;
  C.debounce = debounce;
  C.escapeRegExp = escapeRegExp;
  C.sleep = sleep;
  C.normalizeSpace = normalizeSpace;
  C.wordTokens = wordTokens;
  C.englishWords = englishWords;
  C.countWords = countWords;
  C.splitSentences = splitSentences;
  C.truncate = truncate;
  C.titleOf = titleOf;
  C.levenshtein = levenshtein;
  C.pct = pct;
  C.deepClone = deepClone;
  C.copyText = copyText;
  C.downloadFile = downloadFile;
  C.toast = toast;
  C.openModal = openModal;
  C.confirmDialog = confirmDialog;
  C.emptyState = emptyState;
})();
