/* Settings — profile, appearance, audio, AI, data */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;

  function voiceOptions(selected) {
    const list = C.speech.voices();
    if (!list.length) return '<option value="">系统默认（尚未加载语音）</option>';
    return '<option value="">自动选择（优先英式/美式女声）</option>' + list.map(function (v) {
      return '<option value="' + C.esc(v.voiceURI) + '"' + (v.voiceURI === selected ? ' selected' : '') + '>' + C.esc(v.name) + ' · ' + C.esc(v.lang) + '</option>';
    }).join('');
  }

  function render(view, ctx) {
    const p = S.state.profile;
    const st = S.state.settings;
    const left = Math.max(0, C.diffDays(C.todayISO(), p.examDate));
    const docs = C.tutor.buildDocs();

    view.innerHTML = C.ui.pageHead({
      eyebrow: 'PREFERENCES', title: '设置',
      sub: '所有进度保存在当前浏览器。换设备时请先导出数据，再在新设备导入。',
      actions: '<button class="btn" data-export>' + C.icon('download', 14) + '导出数据</button>' +
        '<a class="btn" href="#/dashboard">' + C.icon('arrow-left', 14) + '返回驾驶舱</a>'
    }) +
    '<div class="settings-layout">' +
      '<nav class="settings-nav" aria-label="设置分区">' +
        '<a href="#settings-profile" class="active">个人与考试</a><a href="#settings-appearance">外观</a><a href="#settings-audio">语音与朗读</a>' +
        '<a href="#settings-study">学习策略</a><a href="#settings-ai">AI 学伴</a><a href="#settings-data">数据管理</a><a href="#settings-about">说明</a>' +
      '</nav>' +
      '<div>' +
        '<section class="setting-block" id="settings-profile">' +
          '<h3>个人与考试</h3><div class="sb-sub">倒计时与目标分会出现在驾驶舱和侧栏。</div>' +
          '<form id="profile-form"><div class="form-grid">' +
            '<div class="field"><label>称呼</label><input class="input" name="name" maxlength="16" value="' + C.esc(p.name || '') + '" placeholder="例如：小林"></div>' +
            '<div class="field"><label>考试日期</label><input class="input" type="date" name="examDate" value="' + C.esc(p.examDate) + '"><span class="hint">请按报名信息填写；默认值为估算的 12 月考试日。</span></div>' +
            '<div class="field"><label>目标总分</label><input class="input" type="number" min="300" max="710" step="5" name="target" value="' + p.target + '"><span class="hint">425 为常见及格线，550+ 为较高目标。</span></div>' +
            '<div class="field"><label>每日可用时长（分钟）</label><input class="input" type="number" min="15" max="180" step="5" name="dailyMinutes" value="' + p.dailyMinutes + '"><span class="hint">决定每日新词量与任务量；建议 30–60。</span></div>' +
          '</div>' +
          '<div class="row-between mt-2"><span class="small muted">距离考试 <b>' + left + '</b> 天 · 每日新词目标 <b>' + S.newTarget() + '</b> 个</span><button class="btn btn-primary" type="submit">保存设置</button></div>' +
          '</form>' +
        '</section>' +
        '<section class="setting-block" id="settings-appearance">' +
          '<h3>外观</h3><div class="sb-sub">日间是纸与墨，夜读是低亮度的书桌。</div>' +
          '<div class="setting-row"><div class="sr-label"><b>主题</b><span>自动会跟随系统深色模式。</span></div><div class="seg" id="theme-seg">' +
            '<button data-theme-choice="auto" class="' + (st.theme === 'auto' ? 'active' : '') + '">自动</button>' +
            '<button data-theme-choice="light" class="' + (st.theme === 'light' ? 'active' : '') + '">日间</button>' +
            '<button data-theme-choice="dark" class="' + (st.theme === 'dark' ? 'active' : '') + '">夜读</button></div></div>' +
        '</section>' +
        '<section class="setting-block" id="settings-audio">' +
          '<h3>语音与朗读</h3><div class="sb-sub">听力音频由浏览器语音合成生成；音色取决于操作系统已安装的英语语音。</div>' +
          '<div class="form-grid">' +
            '<div class="field span-2"><label>英语语音</label><select class="select" id="voice-select">' + voiceOptions(st.voiceURI) + '</select><span class="hint">如果列表为空，请稍等或在系统设置中安装英语语音包。</span></div>' +
            '<div class="field"><label>默认语速</label><select class="select" id="rate-select">' + [0.8, 1, 1.1, 1.25, 1.5].map(function (r) {
              return '<option value="' + r + '"' + (Number(st.ttsRate) === r ? ' selected' : '') + '>' + r + 'x</option>';
            }).join('') + '</select></div>' +
            '<div class="field"><label>字幕默认</label><label class="toggle" style="height:38px"><input type="checkbox" id="showzh-toggle"' + (st.showZh ? ' checked' : '') + '><span class="track"></span><span>听力默认显示中文</span></label></div>' +
          '</div>' +
          '<div class="row mt-2"><button class="btn" data-voice-test>' + C.icon('volume', 14) + '试听</button><button class="btn btn-primary" data-save-audio>保存音频设置</button></div>' +
          '<div class="small muted mt-1" id="voice-note">' + (C.speech.supported ? (C.speech.hasEnglishVoice() ? '语音合成可用 · 已检测到英语音色' : '未检测到英语语音包，将用默认音色朗读英文；建议在系统语音设置中安装英语（美国）语音。') : '当前浏览器不支持语音合成') + '</div>' +
        '</section>' +
        '<section class="setting-block" id="settings-study">' +
          '<h3>学习策略</h3><div class="sb-sub">这些开关会影响练习时的默认行为。</div>' +
          '<div class="setting-row"><div class="sr-label"><b>模考默认严格模式</b><span>按写作 → 听力 → 阅读 → 翻译顺序，听力只播放一次，进入下一部分后不可返回。</span></div><label class="toggle"><input type="checkbox" id="strict-toggle"' + (st.strictMock ? ' checked' : '') + '><span class="track"></span><span class="sr-only">严格模式</span></label></div>' +
          '<div class="setting-row"><div class="sr-label"><b>每日新词量</b><span>由“每日可用时长”自动决定，当前为 ' + S.newTarget() + ' 个。复习到期词不占用新词额度。</span></div><span class="badge">' + S.newTarget() + ' 个 / 天</span></div>' +
          '<div class="setting-row"><div class="sr-label"><b>本地评分说明</b><span>写作与翻译使用规则引擎估算，不能替代人工评分。建议结合范文与错题复盘使用。</span></div><span class="badge badge-gold">练习估算</span></div>' +
        '</section>' +
        '<section class="setting-block" id="settings-ai">' +
          '<h3>AI 学伴增强（可选）</h3><div class="sb-sub">默认完全本地。接入 OpenAI 兼容接口后，问题与站内检索片段会发送到该接口。</div>' +
          '<div class="setting-row"><div class="sr-label"><b>启用增强</b><span>关闭时仅使用本地知识库，不产生任何网络请求。</span></div><label class="toggle"><input type="checkbox" id="llm-toggle"' + (st.llm.enabled ? ' checked' : '') + '><span class="track"></span><span class="sr-only">启用增强</span></label></div>' +
          '<div class="form-grid mt-2">' +
            '<div class="field span-2"><label>API Base URL</label><input class="input" id="llm-base" value="' + C.esc(st.llm.baseUrl || '') + '" placeholder="https://api.openai.com/v1"><span class="hint">兼容 /chat/completions 的服务地址。</span></div>' +
            '<div class="field"><label>模型</label><input class="input" id="llm-model" value="' + C.esc(st.llm.model || '') + '" placeholder="gpt-4o-mini"></div>' +
            '<div class="field"><label>API Key</label><input class="input" type="password" id="llm-key" value="' + C.esc(st.llm.apiKey || '') + '" placeholder="sk-…" autocomplete="off"><span class="hint">仅保存在本机 localStorage。</span></div>' +
          '</div>' +
          '<div class="row mt-2"><button class="btn btn-primary" data-save-llm>保存接口设置</button><button class="btn" data-test-llm>测试连接</button><span class="small muted" id="llm-note"></span></div>' +
          '<div class="notice mt-2">' + C.icon('shield', 14) + '<span>不要把 API Key 写进公开仓库；公共电脑使用后请清除。接入失败不会影响本地学伴，页面会自动回退。</span></div>' +
        '</section>' +
        '<section class="setting-block" id="settings-data">' +
          '<h3>数据管理</h3><div class="sb-sub">进度保存在浏览器 localStorage，换浏览器或清除缓存会丢失。</div>' +
          '<div class="setting-row"><div class="sr-label"><b>导出学习数据</b><span>包含词库记忆、练习记录、错题、提交与设置，不含任何平台账号信息。</span></div><button class="btn" data-export>' + C.icon('download', 13) + '导出 JSON</button></div>' +
          '<div class="setting-row"><div class="sr-label"><b>导入学习数据</b><span>导入会覆盖当前进度；建议先导出备份。</span></div><button class="btn" data-import>' + C.icon('upload', 13) + '选择文件</button><input type="file" id="import-file" accept="application/json,.json" hidden></div>' +
          '<div class="setting-row"><div class="sr-label"><b>数据体积</b><span>当前浏览器占用约 ' + Math.round(JSON.stringify(S.state).length / 1024) + ' KB（上限因浏览器而异）。</span></div><span class="badge">' + (S.storageOk ? '本地可用' : '存储受限') + '</span></div>' +
          '<div class="setting-row danger-zone"><div class="sr-label"><b>清空全部数据</b><span>删除所有词库记忆、错题、提交与设置，无法撤销。</span></div><button class="btn btn-danger" data-reset>' + C.icon('trash', 13) + '清空并重置</button></div>' +
        '</section>' +
        '<section class="setting-block" id="settings-about">' +
          '<h3>说明</h3><div class="sb-sub">关于内容、评分与技术边界。</div>' +
          '<div class="about-grid">' +
            '<div class="about-cell"><b>内容来源</b>真题听力原文/选项/答案来自第三方 CC BY 4.0 数据集；词表释义来自 KyleBing（BSD-3-Clause）；其余阅读、写作、原创听力与精讲词为本站原创仿真材料。不代表官方真题或官方答案。</div>' +
            '<div class="about-cell"><b>听力词频</b>在 39 套 2016–2025 真题原文上重新统计：624 个六级进阶词、119 个高频核心（≥3 套）。已过滤专名与功能词、归并不规则屈折，例句必须命中原词形；hop、renewable 因只有 hip hop / non-renewable 用例未列入词频表。不是官方词频。</div>' +
            '<div class="about-cell"><b>评分</b>写作/翻译由本地规则引擎给出 15 分制估算；模考分数按线性折算，均不是官方常模分。</div>' +
            '<div class="about-cell"><b>音频</b>真题听力在线流播原音频（需联网，也可载入本地音频）；原创听力与离线精听使用浏览器 Web Speech API 合成，音色与真实录音不同。</div>' +
            '<div class="about-cell"><b>隐私</b>学习数据只在本机。真题音频会请求 GitHub 媒体地址；启用 AI 增强后，问题与检索片段会发送到你配置的接口。</div>' +
            '<div class="about-cell"><b>离线</b>除真题音频流外，页面与文本数据可离线缓存；已做过的真题需联网或用本地音频复习。</div>' +
            '<div class="about-cell"><b>知识库</b>' + docs.length + ' 条本地资料 · 版本 v1.2.3 · 存储键 ' + C.esc(S.KEY) + '</div>' +
          '</div>' +
          '<div class="divider-dashed"></div>' +
          '<div class="card-kicker">DATA SOURCES &amp; LICENCES</div>' +
          '<div class="small muted mt-1" style="line-height:1.75">' +
            '<b>真题听力</b>：CET-6 Listening Resources &amp; Analysis v1.0.0（Leif / Ysoseri1224），资源文件声明 CC BY 4.0；通过 getfine333-ux/cet6-listening-study 镜像流式播放音频。本站做了逐句切分、依据句对齐与界面改造，未内置音频。' +
            '<br><b>词表与释义</b>：KyleBing/english-vocabulary，BSD-3-Clause；完整许可文本见 THIRD_PARTY_NOTICES.md。' +
            '<br><b>统计口径</b>：听力高频词来自 39 套 2016–2025 真题听力原文，按覆盖套数优先排序；专名、功能词、不规则屈折与边界用例的处理见 DATA_SOURCES.md；不是官方词频。' +
          '</div>' +
          '<div class="row mt-2" style="flex-wrap:wrap"><a class="btn btn-sm" href="DATA_SOURCES.md" target="_blank">数据来源与方法</a><a class="btn btn-sm" href="THIRD_PARTY_NOTICES.md" target="_blank">第三方许可</a><a class="btn btn-sm" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></div>' +
          '<div class="divider-dashed"></div>' +
          '<div class="card-kicker">KEYBOARD</div>' +
          '<div class="kbd-row"><span>打开命令面板</span><span><kbd>Ctrl / ⌘</kbd> + <kbd>K</kbd></span></div>' +
          '<div class="kbd-row"><span>关闭弹窗 / 侧栏</span><span><kbd>Esc</kbd></span></div>' +
          '<div class="kbd-row"><span>词汇选择题</span><span><kbd>1</kbd> – <kbd>4</kbd></span></div>' +
          '<div class="kbd-row"><span>听力重播当前句</span><span><kbd>空格</kbd>（词汇听音模式）</span></div>' +
          '<div class="kbd-row"><span>拼写检查 / 下一题</span><span><kbd>Enter</kbd></span></div>' +
          '<div class="source-note mt-3">' + C.esc(C.data.vocabNote) + '</div>' +
        '</section>' +
      '</div>' +
    '</div>';

    /* Deep link, e.g. #/settings?to=about */
    const to = ctx && ctx.params && ctx.params.get('to');
    if (to) {
      const anchor = view.querySelector('#settings-' + to);
      const link = view.querySelector('.settings-nav a[href="#settings-' + to + '"]');
      if (anchor) window.setTimeout(function () { anchor.scrollIntoView({ block: 'start', behavior: 'instant' }); }, 0);
      if (link) {
        view.querySelectorAll('.settings-nav a').forEach(function (b) { b.classList.toggle('active', b === link); });
      }
    }

    /* Nav highlight */
    view.querySelectorAll('.settings-nav a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        const target = view.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        view.querySelectorAll('.settings-nav a').forEach(function (b) { b.classList.toggle('active', b === a); });
      });
    });

    /* Profile */
    view.querySelector('#profile-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const target = C.clamp(Number(fd.get('target')) || 550, 300, 710);
      const daily = C.clamp(Number(fd.get('dailyMinutes')) || 45, 15, 180);
      S.setProfile({
        name: String(fd.get('name') || '').trim().slice(0, 16),
        examDate: String(fd.get('examDate') || p.examDate),
        target: Math.round(target / 5) * 5,
        dailyMinutes: daily
      });
      C.toast('已保存个人设置', 'good');
      C.app.refreshShell();
      C.app.navigate('#/settings');
    });

    /* Theme */
    view.querySelectorAll('[data-theme-choice]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const choice = btn.dataset.themeChoice;
        S.setSettings({ theme: choice });
        C.app.applyTheme();
        view.querySelectorAll('[data-theme-choice]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        C.app.refreshShell();
        C.toast('主题已切换到' + ({ auto: '自动', light: '日间', dark: '夜读' }[choice]), 'info', 1500);
      });
    });

    /* Audio */
    function fillVoices() {
      const sel = view.querySelector('#voice-select');
      if (sel) sel.innerHTML = voiceOptions(S.state.settings.voiceURI);
      const note = view.querySelector('#voice-note');
      if (note && C.speech.supported) {
        note.textContent = C.speech.hasEnglishVoice()
          ? '语音合成可用 · 已检测到英语音色'
          : '未检测到英语语音包，将用默认音色朗读英文；建议在系统语音设置中安装英语（美国）语音。';
      }
    }
    const onVoices = function () { fillVoices(); };
    window.addEventListener('cet6:voices', onVoices);
    C.speech.voicesReady().then(function () { if (view.isConnected) fillVoices(); });

    view.querySelector('[data-voice-test]').addEventListener('click', function () {
      if (!C.speech.supported) { C.toast('当前浏览器不支持语音合成', 'bad'); return; }
      const note = view.querySelector('#voice-note');
      if (note) note.textContent = '正在朗读…';
      C.speech.speak('Small steps, taken daily, become the distance.', {
        voiceURI: view.querySelector('#voice-select').value,
        rate: Number(view.querySelector('#rate-select').value)
      }).then(function () { if (note) note.textContent = '试听结束'; });
    });
    view.querySelector('[data-save-audio]').addEventListener('click', function () {
      S.setSettings({
        voiceURI: view.querySelector('#voice-select').value,
        ttsRate: Number(view.querySelector('#rate-select').value),
        showZh: view.querySelector('#showzh-toggle').checked
      });
      C.toast('音频设置已保存', 'good');
    });

    /* Study */
    view.querySelector('#strict-toggle').addEventListener('change', function (e) {
      S.setSettings({ strictMock: e.target.checked });
      C.toast(e.target.checked ? '模考默认使用严格模式' : '模考默认使用练习模式', 'info', 1600);
    });

    /* LLM */
    function readLLM() {
      return {
        enabled: view.querySelector('#llm-toggle').checked,
        baseUrl: view.querySelector('#llm-base').value.trim() || 'https://api.openai.com/v1',
        model: view.querySelector('#llm-model').value.trim(),
        apiKey: view.querySelector('#llm-key').value.trim()
      };
    }
    view.querySelector('[data-save-llm]').addEventListener('click', function () {
      S.setSettings({ llm: readLLM() });
      view.querySelector('#llm-note').textContent = '已保存 · 学伴将使用增强模式';
      C.toast('AI 接口设置已保存', 'good');
    });
    view.querySelector('[data-test-llm]').addEventListener('click', function () {
      const cfg = readLLM();
      const note = view.querySelector('#llm-note');
      if (!cfg.apiKey) { C.toast('先填写 API Key', 'info'); return; }
      note.textContent = '正在请求接口…';
      C.tutor.askLLM('请只回复四个字：连接成功。', cfg).then(function (text) {
        note.textContent = '连接成功：' + C.truncate(text.replace(/\s+/g, ' '), 40);
        C.toast('接口连接成功', 'good');
      }).catch(function (err) {
        note.textContent = '连接失败：' + C.truncate(err.message, 80);
        C.toast('接口连接失败，请检查地址、模型与 CORS', 'bad', 4000);
      });
    });

    /* Data */
    function doExport() {
      const payload = S.exportPayload();
      C.downloadFile('shiji-cet6-' + C.todayISO() + '.json', JSON.stringify(payload, null, 2));
      C.toast('已导出学习数据', 'good');
    }
    view.querySelectorAll('[data-export]').forEach(function (b) { b.addEventListener('click', doExport); });
    view.querySelector('[data-import]').addEventListener('click', function () { view.querySelector('#import-file').click(); });
    view.querySelector('#import-file').addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function () {
        C.confirmDialog({ title: '导入并覆盖当前进度？', message: '当前浏览器里的词库记忆、错题与提交记录会被文件内容替换。', confirmText: '导入', danger: true }).then(function (ok) {
          if (!ok) return;
          const res = S.importPayload(String(reader.result));
          if (!res.ok) { C.toast(res.error, 'bad', 4500); return; }
          C.toast('导入成功，正在刷新…', 'good');
          setTimeout(function () { location.reload(); }, 700);
        });
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    view.querySelector('[data-reset]').addEventListener('click', function () {
      C.confirmDialog({ title: '清空全部学习数据？', message: '所有词库记忆、练习记录、错题、提交与设置都会被删除，无法撤销。建议先导出备份。', confirmText: '全部清空', danger: true }).then(function (ok) {
        if (!ok) return;
        S.resetAll();
        C.toast('已重置', 'info', 1200);
        setTimeout(function () { location.reload(); }, 600);
      });
    });

    return function () {
      window.removeEventListener('cet6:voices', onVoices);
      C.speech.stop();
    };
  }

  C.views.settings = { render: render };
})();
