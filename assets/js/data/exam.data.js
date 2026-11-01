/* Mock exam configuration */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  C.data = C.data || {};

  C.data.mockPapers = [
    {
      id: 'MOCK-A', title: '全真组合卷 01', subtitle: '写作 · 听力 · 阅读 · 翻译',
      writing: 'W1',
      listening: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'],
      reading: { cloze: 'C1', matching: 'M1', careful: ['R1', 'R2'] },
      translation: 'T1'
    },
    {
      id: 'MOCK-B', title: '全真组合卷 02', subtitle: '换题重练 · 同一考试结构',
      writing: 'W2',
      listening: ['L3', 'L4', 'L5', 'L6', 'L1', 'L2'],
      reading: { cloze: 'C2', matching: 'M2', careful: ['R2', 'R3'] },
      translation: 'T4'
    }
  ];

  C.data.examInfo = {
    totalScore: 710,
    totalMinutes: 130,
    sections: [
      { id: 'writing', zh: '写作', en: 'Writing', minutes: 30, score: 106.5, note: '1 篇短文，150–200 词' },
      { id: 'listening', zh: '听力', en: 'Listening', minutes: 30, score: 248.5, note: '长对话、篇章与讲座，共 25 题' },
      { id: 'reading', zh: '阅读', en: 'Reading', minutes: 40, score: 248.5, note: '选词 10 + 匹配 10 + 仔细阅读 10' },
      { id: 'translation', zh: '翻译', en: 'Translation', minutes: 30, score: 106.5, note: '汉译英段落 1 篇' }
    ],
    rules: [
      '严格模式：四个部分按顺序进行，进入下一部分后不可返回。',
      '每个部分有独立倒计时；时间结束会自动进入下一部分。',
      '听力音频在严格模式下一次播放，不可拖动或重播。',
      '交卷后客观题自动判分；写作与翻译由本地规则引擎给出估算档位。',
      '模考分数为练习估算，不等同于官方成绩。'
    ]
  };

  C.data.scoreNote = '六级总分为 710 分，其中听力与阅读各占 35%（248.5 分），写作与翻译各占 15%（106.5 分）。本站按各模块正确率与作文档位线性折算，仅用于练习反馈，官方计分采用常模转换。';

  C.data.mockNote = '组合卷由站内原创仿真题库拼合，听力音频由浏览器语音合成朗读。';
})();
