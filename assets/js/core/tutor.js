/* Local knowledge retrieval for the study companion */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};

  let docsCache = null;

  function stripMarks(s) { return String(s || '').replace(/\[\[|\]\]/g, ''); }

  function buildDocs() {
    if (docsCache) return docsCache;
    const docs = [];
    const D = C.data || {};

    (D.vocab || []).forEach(function (v) {
      const senses = (v.senses || []).map(function (s) { return s.zh + ' ' + (s.en || ''); }).join('；');
      const body = [
        v.word, v.phonetic, v.pos, v.tier, senses,
        v.example ? v.example.en + ' ' + v.example.zh : '',
        (v.collocations || []).join('；'),
        (v.synonyms || []).join('；'),
        v.shiftNote || '', v.root || '',
        (v.confusables || []).map(function (c) { return c.word + ' ' + c.note; }).join('；'),
        (v.tags || []).join(' ')
      ].join(' ');
      docs.push({ id: 'v-' + v.id, type: 'vocab', title: v.word, subtitle: v.pos + ' ' + (v.senses && v.senses[0] ? v.senses[0].zh : ''), body: body, route: '#/vocab?word=' + v.id });
    });

    (D.longSentences || []).forEach(function (s) {
      const points = (s.points || []).map(function (p) { return p.title + ' ' + p.text; }).join(' ');
      docs.push({
        id: 's-' + s.id, type: 'sentence', title: '长难句 ' + s.id,
        subtitle: C.truncate(s.sentence, 52),
        body: [s.sentence, s.translation, points, (s.segments || []).map(function (g) { return g.label + ' ' + g.text + ' ' + (g.note || ''); }).join(' ')].join(' '),
        route: '#/reading?tab=sentences&id=' + s.id
      });
    });

    (D.careful || []).forEach(function (r) {
      docs.push({ id: 'rc-' + r.id, type: 'reading', title: r.title, subtitle: r.topic, body: (r.paragraphs || []).map(function (p) { return (p.sentences || []).map(function (s) { return s.en; }).join(' '); }).join(' ') + ' ' + (r.questions || []).map(function (q) { return q.q + ' ' + q.explain; }).join(' '), route: '#/reading?tab=careful&id=' + r.id });
      (r.questions || []).forEach(function (q) {
        docs.push({ id: 'rq-' + q.id, type: 'reading', title: '阅读题 ' + q.id, subtitle: q.q, body: q.q + ' ' + (q.options || []).join(' ') + ' ' + q.explain, route: '#/reading?tab=careful&id=' + r.id + '&q=' + q.id });
      });
    });

    (D.matching || []).forEach(function (m) {
      docs.push({ id: 'rm-' + m.id, type: 'reading', title: '长篇匹配 · ' + m.title, subtitle: m.topic, body: (m.paragraphs || []).map(function (p) { return p.text; }).join(' ') + ' ' + (m.statements || []).map(function (s) { return s.text + ' ' + s.explain; }).join(' '), route: '#/reading?tab=matching&id=' + m.id });
    });

    (D.cloze || []).forEach(function (c) {
      docs.push({ id: 'cl-' + c.id, type: 'reading', title: '选词填空 · ' + c.title, subtitle: c.topic, body: c.passage + ' ' + (c.bank || []).map(function (b) { return b.word; }).join(' ') + ' ' + (c.explanations || []).map(function (e) { return e.why; }).join(' '), route: '#/reading?tab=cloze&id=' + c.id });
    });

    (D.listening || []).forEach(function (s) {
      docs.push({ id: 'l-' + s.id, type: 'listening', title: s.title, subtitle: s.scene, body: (s.script || []).map(function (l) { return l.en + ' ' + l.zh; }).join(' ') + ' ' + (s.questions || []).map(function (q) { return q.q + ' ' + (q.options || []).join(' ') + ' ' + q.explain; }).join(' '), route: '#/listening?set=' + s.id });
    });

    (D.signalWords || []).forEach(function (s) {
      docs.push({ id: 'sig-' + s.type, type: 'signal', title: '听力信号词 · ' + s.label, subtitle: s.words.slice(0, 5).join(' / '), body: s.words.join(' ') + ' ' + s.tip, route: '#/listening?tab=signals' });
    });

    (D.replacements || []).forEach(function (r) {
      docs.push({ id: 'rep-' + r.basic.replace(/\s+/g, '-'), type: 'replacement', title: r.basic + ' → ' + r.better.split('/')[0].trim(), subtitle: '写作替换', body: r.basic + ' ' + r.better + ' ' + r.note + ' ' + r.eg, route: '#/writing?tab=replace' });
    });

    (D.patterns || []).forEach(function (p, i) {
      docs.push({ id: 'pat-' + i, type: 'pattern', title: '句式 · ' + p.cat, subtitle: p.pattern, body: p.pattern + ' ' + p.use + ' ' + p.eg, route: '#/writing?tab=patterns' });
    });

    (D.templates || []).forEach(function (t) {
      docs.push({ id: 'tpl-' + t.id, type: 'template', title: '模板 · ' + t.title, subtitle: t.scene, body: [t.opening, t.body, t.closing, t.tip].join(' '), route: '#/writing?tab=templates' });
    });

    (D.topicVocab || []).forEach(function (t, i) {
      docs.push({ id: 'term-' + i, type: 'term', title: t.zh + ' · ' + t.en, subtitle: '翻译主题词汇 · ' + t.theme, body: t.zh + ' ' + t.en + ' ' + t.eg, route: '#/writing?tab=corpus' });
    });

    const guides = [
      { id: 'g-review', title: '如何安排每天的词汇复习', body: '词汇复习 艾宾浩斯 记忆盒 间隔重复 due 今日待复习 新词 每天 10 到 15 个 复习优先 新词其次 答对升盒 答错回到第一盒 建议每天先清空到期复习，再学新词。', route: '#/vocab?tab=review' },
      { id: 'g-score', title: '六级分数结构与预测方式', body: '六级 710 听力 248.5 阅读 248.5 写作 106.5 翻译 106.5 百分比 35 35 15 15 预测 估算 基于训练正确率与作文档位 不是官方成绩', route: '#/analytics' },
      { id: 'g-errors', title: '错题本应该怎么用', body: '错题 错因 词汇不认识 定位错误 同义替换未识别 信号词未捕捉 过度推断 粗心 每周复盘 重做 标记已解决', route: '#/errors' },
      { id: 'g-writing', title: '写作批改报告怎么看', body: '批改 15 分制 任务完成 语言准确 词汇丰富 句式语法 衔接结构 升级替换 错误标记 范文 先改高严重度错误 再选择性替换词汇', route: '#/writing?tab=write' },
      { id: 'g-translation', title: '翻译四步法', body: '翻译 四步 拆句 定主谓 选词 润色 无主句 被动 名词化 逻辑显化 术语一致 参考译文 语块', route: '#/writing?tab=translate' },
      { id: 'g-listening', title: '精听与听写怎么做', body: '听力 精听 听写 逐句 0.8 倍速 1.5 倍速 信号词 转折 因果 举例 强调 先听大意 再逐句听写 对照差异 跟读', route: '#/listening' },
      { id: 'g-reading', title: '长难句拆解方法', body: '长难句 拆解 找主谓 定语从句 状语从句 插入语 同位语 介词加 which 强调句 倒装 先骨架 后修饰 再看逻辑', route: '#/reading?tab=sentences' },
      { id: 'g-mock', title: '全真模考规则', body: '模考 130 分钟 写作 30 听力 30 阅读 40 翻译 30 严格模式 不可返回 一次播放 交卷后 客观题自动判分 主观题规则引擎估算', route: '#/mock' }
    ];
    guides.forEach(function (g) { docs.push({ id: g.id, type: 'guide', title: g.title, subtitle: '使用指南', body: g.body, route: g.route }); });

    docsCache = docs;
    return docs;
  }

  function tokens(question) {
    const q = String(question || '').toLowerCase();
    const en = Array.from(new Set(q.match(/[a-z][a-z'-]{1,}/g) || []));
    const zhAll = q.match(/[\u4e00-\u9fa5]/g) || [];
    const bi = [];
    for (let i = 0; i < zhAll.length - 1; i++) bi.push(zhAll[i] + zhAll[i + 1]);
    return { en: en, bi: Array.from(new Set(bi)), zh: q };
  }

  function search(question, limit) {
    const docs = buildDocs();
    const t = tokens(question);
    const q = String(question || '').toLowerCase().trim();
    if (!q) return [];
    const scored = [];
    docs.forEach(function (doc) {
      let score = 0;
      const title = doc.title.toLowerCase();
      const body = doc.body.toLowerCase();
      if (title === q) score += 60;
      else if (title.indexOf(q) !== -1 && q.length > 2) score += 28;
      t.en.forEach(function (w) {
        if (title.indexOf(w) !== -1) score += 9;
        if (body.indexOf(w) !== -1) score += 2.2;
      });
      t.bi.forEach(function (b) {
        if (title.indexOf(b) !== -1) score += 5;
        if (body.indexOf(b) !== -1) score += 1.2;
      });
      if (t.zh.length >= 2 && body.indexOf(t.zh) !== -1) score += 6;
      if (doc.type === 'vocab' && t.en.length === 1 && title === t.en[0]) score += 80;
      if (score > 0) scored.push({ doc: doc, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, limit || 6).map(function (s) {
      let snippet = s.doc.subtitle || '';
      const lowerBody = s.doc.body.toLowerCase();
      for (let i = 0; i < t.en.length; i++) {
        const pos = lowerBody.indexOf(t.en[i]);
        if (pos >= 0) {
          snippet = '…' + s.doc.body.slice(Math.max(0, pos - 30), Math.min(s.doc.body.length, pos + 90)) + '…';
          break;
        }
      }
      return { doc: s.doc, score: s.score, snippet: snippet };
    });
  }

  function findVocab(question) {
    const q = ' ' + String(question || '').toLowerCase() + ' ';
    return ((C.data && C.data.vocab) || []).filter(function (v) {
      return new RegExp('\\b' + C.escapeRegExp(v.word.toLowerCase()) + '\\b').test(q);
    });
  }

  function link(route, label) {
    return '<a class="link" href="' + route + '">' + C.esc(label) + '</a>';
  }

  function vocabAnswer(v) {
    const tier = (C.data.vocabTiers || []).find(function (t) { return t.id === v.tier; });
    return '<div class="answer-card">' +
      '<div class="row-between"><b style="font-family:var(--serif);font-size:21px">' + C.esc(v.word) + '</b>' +
      '<span class="badge badge-' + C.esc(v.tier) + '">' + C.esc(tier ? tier.short : '') + '</span></div>' +
      '<p class="small muted mono">' + C.esc(v.phonetic) + ' · ' + C.esc(v.pos) + '</p>' +
      '<p style="margin-top:6px">' + C.esc((v.senses || []).map(function (s) { return s.zh; }).join('；')) + '</p>' +
      (v.example ? '<div class="socratic" style="margin-top:8px">' + C.esc(v.example.en) + '<br><span class="muted small">' + C.esc(v.example.zh) + '</span></div>' : '') +
      (v.collocations && v.collocations.length ? '<p class="small" style="margin-top:8px"><b>高频搭配：</b>' + v.collocations.map(function (c) { return '<span class="inline-code">' + C.esc(c) + '</span>'; }).join(' ') + '</p>' : '') +
      (v.shiftNote ? '<p class="small" style="margin-top:6px;color:var(--accent)">' + C.esc(v.shiftNote) + '</p>' : '') +
      '<p style="margin-top:8px">' + link('#/vocab?word=' + v.id, '打开完整词条与记忆状态 →') + '</p>' +
      '</div>';
  }

  function pairAnswer(a, b) {
    const pairs = (C.data && C.data.confusablePairs) || [];
    const found = pairs.find(function (p) {
      const words = [p.a.word.toLowerCase(), p.b.word.toLowerCase()];
      return words.indexOf(a.word.toLowerCase()) !== -1 && words.indexOf(b.word.toLowerCase()) !== -1;
    });
    if (!found) return vocabAnswer(a) + vocabAnswer(b);
    return '<div class="answer-card">' +
      '<p><b style="font-family:var(--serif);font-size:18px">' + C.esc(found.a.word) + '</b> <span class="muted small">' + C.esc(found.a.pos + ' ' + found.a.zh) + '</span></p>' +
      '<p><b style="font-family:var(--serif);font-size:18px">' + C.esc(found.b.word) + '</b> <span class="muted small">' + C.esc(found.b.pos + ' ' + found.b.zh) + '</span></p>' +
      '<p style="margin-top:6px">' + C.esc(found.note) + '</p>' +
      '<div class="socratic" style="margin-top:8px">' + C.esc(found.exA) + '<br>' + C.esc(found.exB) + '</div>' +
      '<p style="margin-top:8px">' + link('#/vocab?tab=confuse', '查看全部易混辨析 →') + '</p>' +
      '</div>';
  }

  function listAnswer(results, title) {
    if (!results.length) {
      return '<p>没有在本地资料中找到直接对应的内容。可以试试具体一点：</p><ul><li>某个单词的用法，例如 “abundant 怎么用”</li><li>一组易混词，例如 “adapt 和 adopt 的区别”</li><li>一个方法，例如 “长难句怎么拆”</li></ul>' +
        '<p style="margin-top:6px">' + link('#/vocab', '先去词库看看 →') + '</p>';
    }
    return '<p>' + C.esc(title || '找到以下相关资料：') + '</p><ul>' + results.map(function (r) {
      return '<li><a class="link" href="' + r.doc.route + '">' + C.esc(r.doc.title) + '</a><br><span class="small muted">' + C.esc(C.truncate(r.snippet, 110)) + '</span></li>';
    }).join('') + '</ul>';
  }

  function guideAnswer(id) {
    const docs = buildDocs();
    const g = docs.find(function (d) { return d.id === id; });
    const map = {
      'g-review': '<p>词库使用六个记忆盒：答对升一盒，复习间隔依次为 1、2、4、7、15 天；答错回到第一盒。每天优先清空“今日待复习”，再引入新词（默认 10 个，可在设置里调整每日时长）。</p><p>' + link('#/vocab?tab=review', '开始今日复习 →') + '</p>',
      'g-score': '<p>六级总分 710：听力 248.5、阅读 248.5、写作 106.5、翻译 106.5。本站的预测分是把各模块训练正确率与作文档位线性折算后得到的练习估算，不是官方常模分。完成至少两个模块或一套模考后，预测才有参考价值。</p><p>' + link('#/analytics', '查看能力诊断 →') + '</p>',
      'g-errors': '<p>每道错题会按“词汇、定位、同义替换、信号词、过度推断”等错因自动归档。建议每周固定一次复盘：先重做，再决定是否标记已解决；同一错因连续出现三次，就去做对应的专项训练。</p><p>' + link('#/errors', '打开错题本 →') + '</p>',
      'g-writing': '<p>批改报告给出 15 分制档位和五个维度分。先修正红色高严重度错误，再从升级清单里挑 3–4 个替换，最后对照范文检查论点与例证。规则引擎无法替代人工评分，但能稳定发现拼写、搭配、主谓一致与中式表达。</p><p>' + link('#/writing?tab=write', '去写作工坊 →') + '</p>',
      'g-translation': '<p>翻译按“拆句 → 定主谓 → 选词 → 润色”推进：先按意群拆中文，再为每个意群补出主语和谓语，随后锁定术语，最后检查逻辑连接与语域。提交后会显示术语覆盖与参考译文。</p><p>' + link('#/writing?tab=translate', '去翻译工坊 →') + '</p>',
      'g-listening': '<p>精听建议分三步：先无字幕听大意，再逐句听写并对照差异，最后跟读并标记信号词。0.8 倍速适合听写，1.25–1.5 倍速适合考前适应。</p><p>' + link('#/listening', '进入听力实验室 →') + '</p>',
      'g-reading': '<p>拆长难句时先找谓语动词，再确定主语和宾语/表语，最后处理定语、状语、同位语和插入语。站内 12 个长难句提供逐段标注与语法树，可切换“只看骨架”。</p><p>' + link('#/reading?tab=sentences', '开始拆句 →') + '</p>',
      'g-mock': '<p>全真组合卷共 130 分钟：写作 30、听力 30、阅读 40、翻译 30。严格模式下按顺序作答、听力只播放一次；交卷后客观题自动判分，写作与翻译给出估算档位。</p><p>' + link('#/mock', '进入模考 →') + '</p>'
    };
    if (map[id]) return map[id];
    return g ? '<p>' + C.esc(g.body) + '</p>' : '';
  }

  function ask(question) {
    const q = String(question || '').trim();
    const lower = q.toLowerCase();
    const words = findVocab(q);
    const isCompare = /区别|辨析|不同|differ|vs|还是/.test(q);

    if (words.length >= 2 && isCompare) {
      return { html: pairAnswer(words[0], words[1]), sources: [], mode: 'local', intent: 'pair' };
    }
    if (words.length === 1) {
      return { html: vocabAnswer(words[0]), sources: [], mode: 'local', intent: 'vocab' };
    }

    // Signal-word question
    const signals = (C.data && C.data.signalWords) || [];
    for (let i = 0; i < signals.length; i++) {
      const s = signals[i];
      if (s.words.some(function (w) { return new RegExp('\\b' + C.escapeRegExp(w) + '\\b', 'i').test(q); })) {
        return {
          html: '<p><b>' + C.esc(s.label) + '</b></p><p>' + C.esc(s.tip) + '</p><p class="small">常见词：' + s.words.map(function (w) { return '<span class="inline-code">' + C.esc(w) + '</span>'; }).join(' ') + '</p><p>' + link('#/listening?tab=signals', '查看完整信号词表 →') + '</p>',
          sources: [], mode: 'local', intent: 'signal'
        };
      }
    }

    if (/复习|记忆|遗忘|艾宾浩斯|间隔/.test(q)) return { html: guideAnswer('g-review'), sources: [], mode: 'local', intent: 'guide' };
    if (/分数|预测|雷达|估分|多少分|710/.test(q)) return { html: guideAnswer('g-score'), sources: [], mode: 'local', intent: 'guide' };
    if (/错题|错因/.test(q)) return { html: guideAnswer('g-errors'), sources: [], mode: 'local', intent: 'guide' };
    if (/批改|评分|档位|范文/.test(q)) return { html: guideAnswer('g-writing'), sources: [], mode: 'local', intent: 'guide' };
    if (/翻译.*(技巧|方法|怎么)|四步/.test(q)) return { html: guideAnswer('g-translation'), sources: [], mode: 'local', intent: 'guide' };
    if (/听力.*(技巧|方法|信号)|精听|听写/.test(q)) return { html: guideAnswer('g-listening'), sources: [], mode: 'local', intent: 'guide' };
    if (/长难句|拆句|语法树|定语从句|同位语/.test(q)) {
      const res = search('长难句 定语从句 拆解', 4);
      return { html: guideAnswer('g-reading') + listAnswer(res, '也可以直接练这些句子：'), sources: res.map(function (r) { return r.doc; }), mode: 'local', intent: 'reading' };
    }
    if (/替换|高级表达|高级词|同义/.test(q)) {
      const res = search('写作 替换', 4);
      return { html: listAnswer(res, '这些替换可以按语域挑选：'), sources: res.map(function (r) { return r.doc; }), mode: 'local', intent: 'replace' };
    }
    if (/模板|句式|开头|结尾/.test(q)) {
      const res = search('模板 句式', 4);
      return { html: listAnswer(res, '可参考这些句式与模板：'), sources: res.map(function (r) { return r.doc; }), mode: 'local', intent: 'pattern' };
    }
    if (/模考|考试流程|130/.test(q)) return { html: guideAnswer('g-mock'), sources: [], mode: 'local', intent: 'guide' };

    const results = search(q, 6);
    return { html: listAnswer(results), sources: results.map(function (r) { return r.doc; }), mode: 'local', intent: 'search' };
  }

  function buildContext(question, maxChars) {
    const results = search(question, 5);
    let text = '';
    results.forEach(function (r) {
      const chunk = '【' + r.doc.title + '】' + r.doc.body + '\n';
      if (text.length + chunk.length <= (maxChars || 5000)) text += chunk;
    });
    return text;
  }

  function askLLM(question, settings) {
    const cfg = settings || {};
    if (!cfg.apiKey) return Promise.reject(new Error('还没有填写 API Key。'));
    let base = String(cfg.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const endpoint = /\/chat\/completions$/.test(base) ? base : base + '/chat/completions';
    const context = buildContext(question);
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 35000);
    const body = {
      model: cfg.model || 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 900,
      messages: [
        { role: 'system', content: '你是“拾级”六级学习助手。用中文回答，英文例句保留英文。优先依据提供的站内资料；资料不足时明确说明，不要编造真题出处或官方评分。回答要具体、可操作，并在最后给出一个练习建议。不要代写整篇作文或答案，可以讲解、批改与给提纲。' },
        { role: 'user', content: '站内资料：\n' + (context || '（无直接资料）') + '\n\n学生问题：' + question }
      ]
    };
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: JSON.stringify(body),
      signal: controller.signal
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (txt) { throw new Error('接口返回 ' + res.status + '：' + C.truncate(txt, 120)); });
      }
      return res.json();
    }).then(function (data) {
      const content = data && data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
      if (!content) throw new Error('接口没有返回可读内容。');
      return content;
    }).catch(function (err) {
      if (err.name === 'AbortError') throw new Error('请求超时，请检查网络或接口地址。');
      throw err;
    }).finally(function () { clearTimeout(timer); });
  }

  C.tutor = { ask: ask, search: search, buildDocs: buildDocs, askLLM: askLLM, buildContext: buildContext };
})();
