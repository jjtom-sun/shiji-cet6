/* Study companion chat — local retrieval first, optional LLM */
(function () {
  'use strict';
  const C = window.CET6;
  const S = C.store;

  const QUICK = [
    'abundant 怎么用',
    'adapt 和 adopt 的区别',
    '长难句怎么拆',
    '写作怎么替换 important',
    '听力有哪些信号词',
    '六级怎么算分'
  ];

  function escapeLLM(text) {
    return C.esc(text).replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
  }

  function render(view, ctx) {
    let destroyed = false;
    const docs = C.tutor.buildDocs();
    const llm = S.state.settings.llm || {};
    const llmReady = !!(llm.enabled && llm.apiKey);
    const history = [];

    view.innerHTML = C.ui.pageHead({
      eyebrow: 'STUDY COMPANION',
      title: 'AI 学伴',
      sub: '先用站内知识库回答；也可以在设置中接入 OpenAI 兼容接口，获得更强的讲解。',
      actions: '<a class="btn" href="#/settings">' + C.icon('settings', 14) + '接口设置</a>' +
        '<button class="btn btn-sm btn-ghost" data-clear-chat>' + C.icon('refresh', 13) + '清空对话</button>'
    }) +
    '<div class="tutor-shell">' +
      '<div class="chat-panel">' +
        '<div class="chat-head"><div class="chat-id"><span class="chat-avatar">拾</span><div><b>拾级 · 学伴</b><span>' + (llmReady ? 'LLM 增强 · ' + C.esc(llm.model || '默认模型') : '本地知识库 · 不联网') + '</span></div></div>' +
          '<span class="chip chip-sm ' + (llmReady ? 'chip-accent' : 'chip-jade') + '">' + (llmReady ? '增强模式' : '本地模式') + '</span></div>' +
        '<div class="chat-log" id="chat-log" aria-live="polite"></div>' +
        '<div class="chat-input-area">' +
          '<div class="quick-chips mb-2" id="quick-chips">' + QUICK.map(function (q) { return '<button class="quick-chip">' + C.esc(q) + '</button>'; }).join('') + '</div>' +
          '<div class="chat-input-row"><textarea class="chat-input" id="chat-input" rows="1" placeholder="问一个具体的问题，例如：however 在听力里怎么考？"></textarea>' +
          '<button class="send-btn" id="chat-send" aria-label="发送">' + C.icon('send', 16) + '</button></div>' +
          '<div class="chat-meta"><span>Enter 发送 · Shift + Enter 换行</span><span>对话不会写入学习记录</span></div>' +
        '</div>' +
      '</div>' +
      '<aside class="tutor-side">' +
        '<div class="side-panel"><div class="card-kicker">MODE</div><div class="row-between mt-1"><b class="small">' + (llmReady ? 'LLM 增强' : '本地检索') + '</b><span class="status-dot" style="background:' + (llmReady ? 'var(--accent)' : 'var(--success)') + '"></span></div>' +
          '<p class="tutor-note mt-1">' + (llmReady ? '问题会连同站内检索到的资料一起发送到你配置的接口。不要把敏感信息写进对话。' : '答案来自站内原创词库、阅读材料与写作语料；不联网，也不会编造真题。') + '</p>' +
          '<a class="btn btn-sm btn-block mt-2" href="#/settings">' + C.icon('settings', 12) + '调整模式</a></div>' +
        '<div class="side-panel"><div class="card-kicker">CAN ASK</div><div class="card-title" style="font-size:16px;margin-top:4px">可以问什么</div>' +
          '<div class="small muted mt-1" style="line-height:1.9">· 某个词的搭配与熟词生义<br>· 两个易混词的区别<br>· 一个长难句的主干<br>· 某类题的常见错因<br>· 写作/翻译的替换与结构</div>' +
          '<div class="divider-dashed"></div><div class="small muted">知识库：' + docs.filter(function (d) { return d.type === 'vocab'; }).length + ' 个词条 · ' + docs.filter(function (d) { return d.type === 'reading' || d.type === 'sentence'; }).length + ' 条阅读资料 · ' + docs.filter(function (d) { return d.type === 'pattern' || d.type === 'template' || d.type === 'replacement'; }).length + ' 条写作语料</div></div>' +
        '<div class="side-panel"><div class="card-kicker">HOW TO USE</div><div class="card-title" style="font-size:16px;margin-top:4px">先猜，再问</div>' +
          '<div class="socratic mt-1">遇到生词时，先根据上下文猜一次，再向学伴要确认。直接索取答案会削弱记忆痕迹。</div>' +
          '<div class="small muted mt-2">学伴不代写整篇作文，但可以给你提纲、指出搭配问题或解释为什么某个表达不自然。</div></div>' +
        '<div class="notice">' + C.icon('shield', 14) + '<span>如果接入第三方接口，发送内容会离开本机；Key 仅保存在当前浏览器。</span></div>' +
      '</aside>' +
    '</div>';

    const log = view.querySelector('#chat-log');
    const input = view.querySelector('#chat-input');
    const sendBtn = view.querySelector('#chat-send');
    let waiting = false;

    function scrollBottom() {
      log.scrollTop = log.scrollHeight;
    }

    function message(role, html) {
      const el = document.createElement('div');
      el.className = 'msg msg-' + role;
      el.innerHTML = '<span class="msg-avatar">' + (role === 'user' ? '你' : '拾') + '</span><div class="msg-bubble">' + html + '</div>';
      log.appendChild(el);
      scrollBottom();
      return el;
    }

    function sourceLine(sources) {
      if (!sources || !sources.length) return '';
      const seen = new Set();
      const links = [];
      sources.forEach(function (s) {
        if (!s || !s.route || seen.has(s.route)) return;
        seen.add(s.route);
        links.push('<a class="link" href="' + s.route + '">' + C.esc(s.title) + '</a>');
      });
      if (!links.length) return '';
      return '<div class="hint-line">站内来源：' + links.slice(0, 3).join(' · ') + '</div>';
    }

    function greet() {
      log.innerHTML = '';
      message('bot', '你好，我是拾级的学伴。默认在站内知识库里检索，不联网。<br>可以问我单词用法、近义辨析、长难句结构、听力信号词或写作替换。' +
        '<div class="socratic" style="margin-top:8px">建议把问题问具体一些：与其问“怎么提高阅读”，不如问“however 在推断题里怎么用”。</div>');
    }

    function send(text) {
      const q = String(text || '').trim();
      if (!q || waiting) return;
      waiting = true;
      sendBtn.disabled = true;
      message('user', C.esc(q).replace(/\n/g, '<br>'));
      input.value = '';
      input.style.height = 'auto';
      history.push({ role: 'user', text: q });

      let local;
      try { local = C.tutor.ask(q); }
      catch (e) { local = { html: '<p>本地检索出错：' + C.esc(e.message) + '</p>', sources: [], mode: 'local' }; }

      if (!llmReady) {
        message('bot', local.html + sourceLine(local.sources) + '<div class="hint-line">本地知识库 · 无需联网</div>');
        waiting = false; sendBtn.disabled = false; input.focus();
        return;
      }

      const typing = message('bot', '<span class="msg-typing">正在检索站内资料并请求增强模型…</span>');
      C.tutor.askLLM(q, S.state.settings.llm).then(function (answer) {
        if (destroyed) return;
        typing.querySelector('.msg-bubble').innerHTML = '<p>' + escapeLLM(answer) + '</p>' + sourceLine(local.sources) + '<div class="hint-line">LLM 增强回答 · 请核对事实与术语</div>';
        scrollBottom();
      }).catch(function (err) {
        if (destroyed) return;
        typing.querySelector('.msg-bubble').innerHTML = '<p>' + escapeLLM('增强接口暂时不可用（' + err.message + '）。以下是站内知识库的回答：') + '</p>' + local.html + sourceLine(local.sources) + '<div class="hint-line">已回退到本地知识库</div>';
        scrollBottom();
      }).finally(function () {
        if (destroyed) return;
        waiting = false; sendBtn.disabled = false; input.focus();
      });
    }

    sendBtn.addEventListener('click', function () { send(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send(input.value);
      }
    });
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(120, input.scrollHeight) + 'px';
    });
    view.querySelector('#quick-chips').addEventListener('click', function (e) {
      const chip = e.target.closest('.quick-chip');
      if (chip) send(chip.textContent);
    });
    view.querySelector('[data-clear-chat]').addEventListener('click', function () { greet(); input.focus(); });

    greet();
    setTimeout(function () { input.focus(); }, 80);
    return function () { destroyed = true; C.speech.stop(); };
  }

  C.views.tutor = { render: render };
})();
