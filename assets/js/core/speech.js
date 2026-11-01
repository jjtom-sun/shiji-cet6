/* Text-to-speech, speech recognition and word-level comparison */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  const supported = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined';
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  let voices = [];
  let voicesResolved = false;
  let pendingResolve = null;
  let token = 0;

  function refreshVoices() {
    if (!supported) return [];
    const all = window.speechSynthesis.getVoices() || [];
    voices = all.filter(function (v) { return /^en/i.test(v.lang); });
    if (!voices.length) voices = all;
    voicesResolved = voices.length > 0;
    if (voicesResolved) window.dispatchEvent(new CustomEvent('cet6:voices'));
    return voices;
  }

  if (supported) {
    refreshVoices();
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);
    } else {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
    setTimeout(refreshVoices, 350);
    setTimeout(refreshVoices, 1200);
  }

  function voicesReady(timeout) {
    if (voicesResolved) return Promise.resolve(voices);
    return new Promise(function (resolve) {
      let done = false;
      const finish = function () {
        if (done) return;
        done = true;
        refreshVoices();
        resolve(voices);
      };
      window.addEventListener('cet6:voices', finish, { once: true });
      setTimeout(finish, timeout || 1100);
    });
  }

  function pickVoice(voiceURI) {
    if (!voices.length) refreshVoices();
    if (voiceURI) {
      const exact = voices.find(function (v) { return v.voiceURI === voiceURI; });
      if (exact) return exact;
    }
    const prefs = [
      /Sonia/i, /Libby/i, /Hazel/i, /Susan/i, /Google UK English Female/i,
      /Google US English/i, /Aria/i, /Jenny/i, /Samantha/i, /Microsoft.*English/i, /^en-GB/i, /^en-US/i
    ];
    for (let i = 0; i < prefs.length; i++) {
      const found = voices.find(function (v) { return prefs[i].test(v.name) || prefs[i].test(v.lang); });
      if (found) return found;
    }
    return voices[0] || null;
  }

  function stop() {
    token++;
    if (pendingResolve) {
      const r = pendingResolve;
      pendingResolve = null;
      r();
    }
    if (supported) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* noop */ }
    }
  }

  function speak(text, opts) {
    opts = opts || {};
    const clean = C.normalizeSpace(String(text || '').replace(/[*_#]/g, ' '));
    if (!supported || !clean) return Promise.resolve();
    return new Promise(function (resolve) {
      stop();
      const myToken = ++token;
      const u = new SpeechSynthesisUtterance(clean);
      const settings = (C.store && C.store.state.settings) || {};
      const voice = pickVoice(opts.voiceURI || settings.voiceURI);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = 'en-US';
      }
      u.rate = C.clamp(opts.rate || settings.ttsRate || 1, 0.5, 2);
      u.pitch = opts.pitch || 1;
      u.volume = opts.volume == null ? 1 : opts.volume;
      if (opts.onBoundary) u.onboundary = opts.onBoundary;
      let settled = false;
      const finish = function () {
        if (settled) return;
        settled = true;
        if (myToken === token) pendingResolve = null;
        resolve();
      };
      pendingResolve = finish;
      u.onend = finish;
      u.onerror = function (e) {
        if (e && e.error && e.error !== 'canceled' && e.error !== 'interrupted' && opts.onError) opts.onError(e.error);
        finish();
      };
      // Safety net for browsers that occasionally drop the end event.
      const est = Math.max(2500, clean.length * 90 / (u.rate || 1));
      setTimeout(function () { if (myToken === token) finish(); }, Math.min(est, 60000));
      try {
        window.speechSynthesis.speak(u);
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      } catch (e) {
        finish();
      }
    });
  }

  function diffWords(target, typed) {
    const a = String(target || '').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || [];
    const b = String(typed || '').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g) || [];
    const al = a.map(function (w) { return w.toLowerCase().replace(/[’]/g, "'"); });
    const bl = b.map(function (w) { return w.toLowerCase().replace(/[’]/g, "'"); });
    const m = al.length, n = bl.length;
    const dp = [];
    for (let i = 0; i <= m; i++) { dp[i] = new Array(n + 1).fill(0); }
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = al[i - 1] === bl[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    const ops = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && al[i - 1] === bl[j - 1]) {
        ops.push({ type: 'ok', word: a[i - 1] }); i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        ops.push({ type: 'extra', word: b[j - 1] }); j--;
      } else {
        ops.push({ type: 'miss', word: a[i - 1] }); i--;
      }
    }
    ops.reverse();
    const ok = ops.filter(function (o) { return o.type === 'ok'; }).length;
    return {
      ops: ops,
      targetCount: a.length,
      typedCount: b.length,
      matched: ok,
      missing: ops.filter(function (o) { return o.type === 'miss'; }).length,
      extra: ops.filter(function (o) { return o.type === 'extra'; }).length,
      accuracy: a.length ? Math.round((ok / a.length) * 100) : 0
    };
  }

  function diffHTML(diff) {
    return diff.ops.map(function (op) {
      const w = C.esc(op.word);
      if (op.type === 'ok') return '<span class="dw ok">' + w + '</span>';
      if (op.type === 'miss') return '<span class="dw miss" title="漏写">' + w + '</span>';
      return '<span class="dw extra" title="多写">' + w + '</span>';
    }).join(' ');
  }

  function recognize(opts) {
    opts = opts || {};
    return new Promise(function (resolve, reject) {
      if (!Recognition) {
        reject(new Error('当前浏览器不支持语音识别，请使用 Chrome 或 Edge。'));
        return;
      }
      let rec;
      try {
        rec = new Recognition();
      } catch (e) {
        reject(new Error('语音识别初始化失败。'));
        return;
      }
      rec.lang = opts.lang || 'en-US';
      rec.interimResults = false;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      let settled = false;
      const timer = setTimeout(function () {
        if (!settled) {
          settled = true;
          try { rec.stop(); } catch (e) { /* noop */ }
          reject(new Error('没有听到清晰的朗读，请再试一次。'));
        }
      }, opts.timeout || 14000);
      rec.onresult = function (evt) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const text = evt.results && evt.results[0] && evt.results[0][0] ? evt.results[0][0].transcript : '';
        resolve(text);
      };
      rec.onerror = function (evt) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const code = evt && evt.error;
        const map = {
          'not-allowed': '需要麦克风权限，请在浏览器地址栏允许后重试。',
          'service-not-allowed': '麦克风或语音服务被浏览器阻止。',
          'no-speech': '没有识别到语音，请靠近麦克风再读一次。',
          'audio-capture': '没有找到可用的麦克风。',
          network: '语音识别需要联网，请检查网络。',
          aborted: '识别已取消。'
        };
        reject(new Error(map[code] || '语音识别失败：' + (code || '未知错误')));
      };
      rec.onend = function () {
        clearTimeout(timer);
        if (!settled) {
          settled = true;
          reject(new Error('没有识别到语音，请再试一次。'));
        }
      };
      try { rec.start(); } catch (e) { reject(new Error('无法启动语音识别，请稍后重试。')); }
    });
  }

  function pronunciationReview(target, heard) {
    const diff = diffWords(target, heard);
    const denom = Math.max(diff.targetCount, diff.typedCount, 1);
    const score = Math.round(((diff.matched - diff.extra * 0.5) / denom) * 100);
    return Object.assign({}, diff, { score: C.clamp(score, 0, 100) });
  }

  C.speech = {
    supported: supported,
    recognitionSupported: !!Recognition,
    voices: function () { return voices.length ? voices : refreshVoices(); },
    hasEnglishVoice: function () { return (voices.length ? voices : refreshVoices()).some(function (v) { return /^en/i.test(v.lang); }); },
    voicesReady: voicesReady,
    pickVoice: pickVoice,
    speak: speak,
    stop: stop,
    recognize: recognize,
    diffWords: diffWords,
    diffHTML: diffHTML,
    pronunciationReview: pronunciationReview
  };
})();
