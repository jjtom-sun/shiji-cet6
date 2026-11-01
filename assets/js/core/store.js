/* Local-first state, spaced repetition and progress bookkeeping */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  const KEY = 'cet6studio.v1';
  const SCHEMA = 1;
  const BOX_DAYS = [0, 1, 2, 4, 7, 15];

  function defaultExamDate() {
    const now = new Date();
    let year = now.getFullYear();
    const decFirst = new Date(year, 11, 1, 12);
    const firstSat = 1 + ((6 - decFirst.getDay() + 7) % 7);
    let exam = new Date(year, 11, firstSat + 7, 12);
    if (now > new Date(year, 11, 20, 23, 59)) {
      year += 1;
      const d = new Date(year, 11, 1, 12);
      const fs = 1 + ((6 - d.getDay() + 7) % 7);
      exam = new Date(year, 11, fs + 7, 12);
    }
    return C.todayISO(exam);
  }

  function defaults() {
    return {
      version: SCHEMA,
      createdAt: Date.now(),
      profile: {
        name: '',
        examDate: defaultExamDate(),
        target: 550,
        dailyMinutes: 45
      },
      settings: {
        theme: 'auto',
        voiceURI: '',
        ttsRate: 1,
        showZh: true,
        strictMock: true,
        llm: { enabled: false, baseUrl: 'https://api.openai.com/v1', model: '', apiKey: '' }
      },
      vocab: {},
      listening: {},
      reading: {},
      errors: [],
      mocks: [],
      submissions: [],
      activity: {},
      flags: {},
      achievements: {},
      xp: 0
    };
  }

  function mergeDefaults(target, source) {
    if (!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(function (k) {
      const v = source[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k])) {
        mergeDefaults(target[k], v);
      } else if (v !== undefined) {
        target[k] = v;
      }
    });
    return target;
  }

  let storageOk = true;
  let state = defaults();
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === SCHEMA) {
          state = mergeDefaults(defaults(), parsed);
        } else if (parsed) {
          state = mergeDefaults(defaults(), parsed);
          state.version = SCHEMA;
        }
      }
    } catch (e) {
      storageOk = false;
      console.warn('[拾级] 无法读取本地数据', e);
    }
    return state;
  }

  function save() {
    if (!storageOk) return false;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      storageOk = false;
      console.warn('[拾级] 本地存储写入失败', e);
      if (C.toast) C.toast('浏览器本地存储不可用，进度只能保留在当前页面', 'bad', 4200);
      return false;
    }
  }

  function emit(reason) {
    listeners.forEach(function (fn) {
      try { fn(state, reason); } catch (e) { console.error(e); }
    });
  }

  function commit(reason) {
    save();
    emit(reason);
    checkAchievements();
  }

  function subscribe(fn) {
    listeners.push(fn);
    return function () {
      const i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  function today() { return C.todayISO(); }

  /* ---------- Vocabulary / Ebbinghaus ---------- */
  function newVocabRecord() {
    return { box: 0, due: today(), seen: 0, correct: 0, wrong: 0, first: today(), last: null, history: [] };
  }

  function wordRecord(id) { return state.vocab[id] || null; }

  function reviewWord(id, ok) {
    let rec = state.vocab[id];
    if (!rec) rec = state.vocab[id] = newVocabRecord();
    rec.seen += 1;
    if (ok) {
      rec.correct += 1;
      rec.box = Math.min(5, (rec.box || 0) + 1);
      rec.due = C.addDays(today(), BOX_DAYS[rec.box]);
    } else {
      rec.wrong += 1;
      rec.box = 0;
      rec.due = today();
    }
    rec.last = today();
    rec.history.push({ d: today(), ok: !!ok });
    if (rec.history.length > 24) rec.history = rec.history.slice(-24);
    state.xp += ok ? 3 : 1;
    commit('vocab');
    return rec;
  }

  function markKnown(id) {
    let rec = state.vocab[id];
    if (!rec) rec = state.vocab[id] = newVocabRecord();
    rec.box = 5;
    rec.due = C.addDays(today(), BOX_DAYS[5]);
    rec.last = today();
    rec.seen += 1;
    commit('vocab');
    return rec;
  }

  function resetWord(id) {
    delete state.vocab[id];
    commit('vocab');
  }

  function vocabStats() {
    const bank = (C.data && C.data.vocab) || [];
    let seen = 0, mastered = 0, due = 0, correct = 0, wrong = 0, learning = 0;
    const t = today();
    bank.forEach(function (w) {
      const r = state.vocab[w.id];
      if (!r) return;
      seen++;
      correct += r.correct;
      wrong += r.wrong;
      if (r.box >= 5) mastered++;
      else {
        learning++;
        if (r.due <= t) due++;
      }
    });
    return {
      total: bank.length,
      seen: seen,
      mastered: mastered,
      learning: learning,
      newCount: Math.max(0, bank.length - seen),
      due: due,
      accuracy: correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0
    };
  }

  function newTarget() {
    return state.profile.dailyMinutes >= 60 ? 15 : state.profile.dailyMinutes >= 30 ? 10 : 6;
  }

  function newIntroducedToday() {
    const t = today();
    return Object.keys(state.vocab).filter(function (id) { return state.vocab[id].first === t; }).length;
  }

  function reviewQueue(focus) {
    let bank = (C.data && C.data.vocab) || [];
    if (focus === 'listening') bank = bank.filter(function (w) { return !!w.listeningRank; });
    else if (focus === 'listening-core') {
      const n = (C.data && C.data.listeningWordsMeta && C.data.listeningWordsMeta.coreCount) || 0;
      bank = bank.filter(function (w) { return w.listeningRank && w.listeningRank <= n; });
    }
    const t = today();
    const due = bank.filter(function (w) {
      const r = state.vocab[w.id];
      return r && r.box < 5 && r.due <= t;
    });
    const remainingNew = Math.max(0, newTarget() - newIntroducedToday());
    const fresh = C.shuffle(bank.filter(function (w) { return !state.vocab[w.id]; })).slice(0, remainingNew);
    const dueSorted = due.sort(function (a, b) {
      const ra = state.vocab[a.id], rb = state.vocab[b.id];
      return String(ra.due).localeCompare(String(rb.due)) || ra.box - rb.box;
    });
    let queue = dueSorted.concat(fresh);
    if (!queue.length) queue = C.shuffle(bank.filter(function (w) { return !state.vocab[w.id] || state.vocab[w.id].box < 5; })).slice(0, 10);
    return queue;
  }

  function wordStatus(id) {
    const r = state.vocab[id];
    if (!r) return 'new';
    if (r.box >= 5) return 'mastered';
    if (r.due <= today()) return 'due';
    return 'learning';
  }

  /* ---------- Study activity ---------- */
  function logStudy(module, minutes, items, xp) {
    const t = today();
    if (!state.activity[t]) state.activity[t] = { minutes: 0, items: 0, modules: {}, xp: 0 };
    const day = state.activity[t];
    day.minutes = Math.round((day.minutes + (Number(minutes) || 0)) * 10) / 10;
    day.items += Number(items) || 0;
    day.xp += Number(xp) || 0;
    if (!day.modules[module]) day.modules[module] = { minutes: 0, items: 0 };
    day.modules[module].minutes = Math.round((day.modules[module].minutes + (Number(minutes) || 0)) * 10) / 10;
    day.modules[module].items += Number(items) || 0;
    state.xp += Number(xp) || 0;
    state.flags.lastStudy = Date.now();
    state.flags.lastModule = module;
    commit('activity');
  }

  function activityFor(iso) {
    return state.activity[iso] || { minutes: 0, items: 0, modules: {}, xp: 0 };
  }

  function computeStreak() {
    let current = 0;
    let cursor = today();
    if (!state.activity[cursor] || !state.activity[cursor].minutes) cursor = C.addDays(cursor, -1);
    while (state.activity[cursor] && state.activity[cursor].minutes > 0) {
      current++;
      cursor = C.addDays(cursor, -1);
    }
    const dates = Object.keys(state.activity).filter(function (d) { return state.activity[d].minutes > 0; }).sort();
    let best = 0, run = 0, prev = null;
    dates.forEach(function (d) {
      if (prev && C.diffDays(prev, d) === 1) run++;
      else run = 1;
      if (run > best) best = run;
      prev = d;
    });
    return { current: current, best: Math.max(best, current), last: dates[dates.length - 1] || null };
  }

  function weekMinutes(offsetWeeks) {
    let total = 0;
    const start = C.addDays(today(), -6 + (offsetWeeks || 0) * 7);
    for (let i = 0; i < 7; i++) {
      const d = C.addDays(start, i);
      total += (state.activity[d] && state.activity[d].minutes) || 0;
    }
    return Math.round(total);
  }

  function totalMinutes() {
    return Math.round(Object.keys(state.activity).reduce(function (s, d) { return s + (state.activity[d].minutes || 0); }, 0));
  }

  function todaySummary() {
    const a = activityFor(today());
    return {
      minutes: Math.round(a.minutes),
      items: a.items,
      modules: a.modules || {},
      done: function (mod) { return !!(a.modules && a.modules[mod] && a.modules[mod].items > 0); }
    };
  }

  /* ---------- Listening / reading progress ---------- */
  function recordListening(setId, correct, total) {
    const prev = state.listening[setId] || { attempts: 0, best: 0, last: 0, dictationBest: 0 };
    prev.attempts += 1;
    prev.last = total ? Math.round((correct / total) * 100) : 0;
    prev.best = Math.max(prev.best || 0, prev.last);
    prev.updated = Date.now();
    state.listening[setId] = prev;
    commit('listening');
  }

  function recordDictation(setId, accuracy) {
    const prev = state.listening[setId] || { attempts: 0, best: 0, last: 0, dictationBest: 0 };
    prev.dictationBest = Math.max(prev.dictationBest || 0, Math.round(accuracy));
    state.listening[setId] = prev;
    commit('listening');
  }

  function recordReading(itemId, score, total, seconds) {
    const prev = state.reading[itemId] || { attempts: 0, best: 0, last: 0, bestSeconds: null };
    prev.attempts += 1;
    prev.last = total ? Math.round((score / total) * 100) : 0;
    prev.best = Math.max(prev.best || 0, prev.last);
    if (seconds) prev.bestSeconds = prev.bestSeconds ? Math.min(prev.bestSeconds, Math.round(seconds)) : Math.round(seconds);
    prev.updated = Date.now();
    state.reading[itemId] = prev;
    commit('reading');
  }

  /* ---------- Error book ---------- */
  const CAUSES = ['词汇不认识', '语法理解偏差', '定位错误', '同义替换未识别', '信号词未捕捉', '信息遗漏', '过度推断', '时间不足', '粗心', '未分类'];

  function addError(payload) {
    const key = [payload.module, payload.sourceId, payload.cause || '未分类'].join('|');
    let item = state.errors.find(function (e) { return e.key === key; });
    if (item) {
      item.times += 1;
      item.last = Date.now();
      item.resolved = false;
      item.your = payload.your || item.your;
    } else {
      item = {
        id: C.uid('err'),
        key: key,
        module: payload.module || 'other',
        sourceId: payload.sourceId || '',
        title: payload.title || '未命名题目',
        prompt: payload.prompt || '',
        your: payload.your || '',
        correct: payload.correct || '',
        cause: payload.cause || '未分类',
        explain: payload.explain || '',
        link: payload.link || '',
        times: 1,
        createdAt: Date.now(),
        last: Date.now(),
        resolved: false
      };
      state.errors.unshift(item);
      if (state.errors.length > 300) state.errors.length = 300;
    }
    commit('error');
    return item;
  }

  function resolveError(id, resolved) {
    const e = state.errors.find(function (x) { return x.id === id; });
    if (!e) return;
    e.resolved = resolved !== false;
    e.resolvedAt = e.resolved ? Date.now() : null;
    commit('error');
  }

  function deleteError(id) {
    state.errors = state.errors.filter(function (e) { return e.id !== id; });
    commit('error');
  }

  function errorStats() {
    const open = state.errors.filter(function (e) { return !e.resolved; });
    const byCause = {};
    const byModule = {};
    open.forEach(function (e) {
      byCause[e.cause] = (byCause[e.cause] || 0) + 1;
      byModule[e.module] = (byModule[e.module] || 0) + 1;
    });
    return { open: open.length, total: state.errors.length, byCause: byCause, byModule: byModule };
  }

  /* ---------- Writing / translation / mock ---------- */
  function addSubmission(type, promptId, promptTitle, text, band) {
    const item = {
      id: C.uid('sub'), type: type, promptId: promptId, promptTitle: promptTitle,
      text: text, band: band, created: Date.now()
    };
    state.submissions.unshift(item);
    if (state.submissions.length > 40) state.submissions.length = 40;
    commit('writing');
    return item;
  }

  function addMock(result) {
    const item = Object.assign({ id: C.uid('mock'), date: today(), created: Date.now() }, result);
    state.mocks.unshift(item);
    if (state.mocks.length > 30) state.mocks.length = 30;
    commit('mock');
    return item;
  }

  function latestSubmission(type) {
    return state.submissions.find(function (s) { return !type || s.type === type; }) || null;
  }

  function bestMock() {
    if (!state.mocks.length) return null;
    return state.mocks.slice().sort(function (a, b) { return (b.total || 0) - (a.total || 0); })[0];
  }

  /* ---------- Achievements ---------- */
  const ACHIEVEMENTS = [
    { id: 'first-step', name: '第一步', desc: '完成任意一次练习', icon: 'compass' },
    { id: 'vocab-50', name: '词海初渡', desc: '接触 50 个词条', icon: 'book' },
    { id: 'vocab-master-30', name: '三十而立', desc: '掌握 30 个词条', icon: 'layers' },
    { id: 'listen-1', name: '耳熟能详', desc: '完成一次听力训练', icon: 'headphones' },
    { id: 'read-1', name: '抽丝剥茧', desc: '完成一篇阅读训练', icon: 'scan' },
    { id: 'write-1', name: '落笔有神', desc: '提交一次写作或翻译', icon: 'pen' },
    { id: 'mock-1', name: '沙场点兵', desc: '完成一套全真模考', icon: 'timer' },
    { id: 'mock-500', name: '越过山丘', desc: '模考总分达到 500', icon: 'trophy' },
    { id: 'streak-7', name: '七日之约', desc: '连续学习 7 天', icon: 'flame' },
    { id: 'streak-30', name: '月度拾级', desc: '连续学习 30 天', icon: 'star' },
    { id: 'errors-20', name: '错题猎人', desc: '整理 20 条错题', icon: 'clipboard' },
    { id: 'all-modules', name: '六边形战士', desc: '五项能力全部开始训练', icon: 'sparkles' }
  ];

  function achievementStatus() {
    const vs = vocabStats();
    const streak = computeStreak();
    const modules = new Set();
    Object.keys(state.activity).forEach(function (d) {
      Object.keys(state.activity[d].modules || {}).forEach(function (m) { modules.add(m); });
    });
    const tests = {
      'first-step': function () { return Object.keys(state.activity).length > 0; },
      'vocab-50': function () { return vs.seen >= 50; },
      'vocab-master-30': function () { return vs.mastered >= 30; },
      'listen-1': function () { return Object.keys(state.listening).length > 0; },
      'read-1': function () { return Object.keys(state.reading).length > 0; },
      'write-1': function () { return state.submissions.length > 0; },
      'mock-1': function () { return state.mocks.length > 0; },
      'mock-500': function () { return state.mocks.some(function (m) { return m.total >= 500; }); },
      'streak-7': function () { return streak.best >= 7; },
      'streak-30': function () { return streak.best >= 30; },
      'errors-20': function () { return state.errors.length >= 20; },
      'all-modules': function () { return ['vocab', 'listening', 'reading', 'writing'].every(function (m) { return modules.has(m); }); }
    };
    return ACHIEVEMENTS.map(function (a) {
      return Object.assign({}, a, {
        unlocked: !!state.achievements[a.id],
        at: state.achievements[a.id] || null,
        eligible: tests[a.id] ? tests[a.id]() : false
      });
    });
  }

  function checkAchievements() {
    const statuses = achievementStatus();
    ACHIEVEMENTS.forEach(function (a) {
      if (state.achievements[a.id]) return;
      const status = statuses.find(function (x) { return x.id === a.id; });
      if (status && status.eligible) {
        state.achievements[a.id] = Date.now();
        state.xp += 20;
        save();
        if (C.toast) C.toast('成就解锁 · ' + a.name, 'good', 3000);
      }
    });
  }

  function levelInfo() {
    const level = Math.floor(Math.sqrt(state.xp / 60)) + 1;
    const nextAt = Math.pow(level, 2) * 60;
    const prevAt = Math.pow(level - 1, 2) * 60;
    return {
      level: level,
      xp: state.xp,
      progress: nextAt > prevAt ? Math.round(((state.xp - prevAt) / (nextAt - prevAt)) * 100) : 0,
      nextAt: nextAt
    };
  }

  /* ---------- Data in/out ---------- */
  function exportPayload() {
    return {
      app: 'cet6-studio',
      version: SCHEMA,
      exportedAt: new Date().toISOString(),
      state: state
    };
  }

  function importPayload(payload) {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
      if (!data || data.app !== 'cet6-studio' || !data.state || typeof data.state !== 'object') {
        return { ok: false, error: '文件格式不正确：缺少拾级学习数据标识。' };
      }
      if (!data.state.profile || !data.state.settings) {
        return { ok: false, error: '文件内容不完整：缺少个人设置。' };
      }
      state = mergeDefaults(defaults(), data.state);
      state.version = SCHEMA;
      commit('import');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: '无法解析该文件，请确认导入的是拾级导出的 JSON。' };
    }
  }

  function resetAll() {
    state = defaults();
    try { localStorage.removeItem(KEY); } catch (e) { /* noop */ }
    save();
    emit('reset');
  }

  function setProfile(patch) {
    Object.assign(state.profile, patch);
    commit('profile');
  }

  function setSettings(patch) {
    Object.assign(state.settings, patch);
    commit('settings');
  }

  load();

  C.store = {
    KEY: KEY,
    SCHEMA: SCHEMA,
    CAUSES: CAUSES,
    ACHIEVEMENTS: ACHIEVEMENTS,
    get state() { return state; },
    get storageOk() { return storageOk; },
    load: load,
    save: save,
    subscribe: subscribe,
    commit: commit,
    wordRecord: wordRecord,
    reviewWord: reviewWord,
    markKnown: markKnown,
    resetWord: resetWord,
    vocabStats: vocabStats,
    reviewQueue: reviewQueue,
    wordStatus: wordStatus,
    newTarget: newTarget,
    newIntroducedToday: newIntroducedToday,
    logStudy: logStudy,
    activityFor: activityFor,
    computeStreak: computeStreak,
    weekMinutes: weekMinutes,
    totalMinutes: totalMinutes,
    todaySummary: todaySummary,
    recordListening: recordListening,
    recordDictation: recordDictation,
    recordReading: recordReading,
    addError: addError,
    resolveError: resolveError,
    deleteError: deleteError,
    errorStats: errorStats,
    addSubmission: addSubmission,
    latestSubmission: latestSubmission,
    addMock: addMock,
    bestMock: bestMock,
    achievementStatus: achievementStatus,
    levelInfo: levelInfo,
    setProfile: setProfile,
    setSettings: setSettings,
    exportPayload: exportPayload,
    importPayload: importPayload,
    resetAll: resetAll,
    defaultExamDate: defaultExamDate
  };
})();
