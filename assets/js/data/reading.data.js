/* Reading lab — annotated long sentences + banked cloze */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  C.data = C.data || {};

  C.data.longSentences = [
    {
      id: 'S1', difficulty: 4, source: '原创仿真句 · 科技',
      sentence: 'What is particularly striking about the debate over artificial intelligence is not so much the speed at which the technology is advancing as the extent to which its consequences remain poorly understood.',
      translation: '关于人工智能的争论中，特别引人注目的与其说是技术发展的速度，不如说是其后果在多大程度上仍未被充分理解。',
      segments: [
        { text: 'What is particularly striking about the debate over artificial intelligence', role: 'subject', label: '主语从句', note: 'what 引导主语从句，整体作主句主语。' },
        { text: ' is ', role: 'verb', label: '系动词' },
        { text: 'not so much ', role: 'conjunction', label: '关联词', note: 'not so much A as B 的前半部分。' },
        { text: 'the speed ', role: 'complement', label: '表语 A' },
        { text: 'at which the technology is advancing', role: 'attributive', label: '定语从句', note: 'at which 修饰 speed。' },
        { text: ' as ', role: 'conjunction', label: '关联词' },
        { text: 'the extent ', role: 'complement', label: '表语 B', note: '语义重心落在 as 之后的 B。' },
        { text: 'to which its consequences remain poorly understood.', role: 'attributive', label: '定语从句', note: 'to which 修饰 extent。' }
      ],
      tree: {
        label: '主句', text: 'What ... is not so much A as B', note: '主系表结构；主语为 what 从句，表语为比较关联结构',
        children: [
          { label: '主语从句', text: 'What is particularly striking about the debate over artificial intelligence', children: [
            { label: '主语', text: 'What' }, { label: '谓语', text: 'is' }, { label: '表语', text: 'particularly striking' }, { label: '状语', text: 'about the debate over artificial intelligence' }
          ] },
          { label: '系动词', text: 'is' },
          { label: '表语（比较结构）', text: 'not so much A as B', note: '“与其说 A，不如说 B”', children: [
            { label: 'A', text: 'the speed [at which the technology is advancing]', note: '介词 at + which 引导定语从句' },
            { label: 'B', text: 'the extent [to which its consequences remain poorly understood]', note: '介词 to + which 引导定语从句' }
          ] }
        ]
      },
      points: [
        { title: 'what 引导主语从句', text: 'what 在从句中充当主语，整个从句作主句主语；主句谓语用单数 is。' },
        { title: 'not so much A as B', text: '意为“与其说 A，不如说 B”，语义重心在 B。阅读中常用来表达作者真正的判断。' },
        { title: '介词 + which', text: 'at which 修饰 speed（以何种速度），to which 修饰 extent（在何种程度上）；介词由先行词与从句的搭配决定。' }
      ]
    },
    {
      id: 'S2', difficulty: 4, source: '原创仿真句 · 媒体',
      sentence: 'It is not the absence of information that makes decisions difficult, but the sheer volume of conflicting evidence with which we are confronted every day.',
      translation: '使决策困难的不是信息缺失，而是我们每天面对的庞杂且相互冲突的证据。',
      segments: [
        { text: 'It ', role: 'subject', label: '形式主语', note: '强调句的结构词。' },
        { text: 'is ', role: 'verb', label: '系动词' },
        { text: 'not the absence of information ', role: 'complement', label: '被强调部分 A' },
        { text: 'that makes decisions difficult', role: 'attributive', label: '强调句 that', note: 'that 引导强调句的剩余部分。' },
        { text: ', ', role: 'conjunction', label: '标点' },
        { text: 'but ', role: 'conjunction', label: '转折连词' },
        { text: 'the sheer volume of conflicting evidence ', role: 'complement', label: '被强调部分 B' },
        { text: 'with which we are confronted every day.', role: 'attributive', label: '定语从句', note: 'be confronted with 的介词 with 前置。' }
      ],
      tree: {
        label: '强调结构', text: 'It is not A that ..., but B', note: 'not A but B 的对比被嵌入强调句',
        children: [
          { label: '被强调 A', text: 'the absence of information', note: '否定项' },
          { label: '强调句其余部分', text: 'that makes decisions difficult', note: 'that 后的谓语与 A 保持一致' },
          { label: '被强调 B', text: 'the sheer volume of conflicting evidence', note: '真正的语义重心' },
          { label: '定语从句', text: 'with which we are confronted every day', note: '介词 with 前置，回指 evidence' }
        ]
      },
      points: [
        { title: '强调句 It is ... that ...', text: '去掉 It is 与 that 后，句子仍完整：Not the absence of information makes decisions difficult, but the volume... 强调对比项。' },
        { title: 'not A but B', text: '否定 A、肯定 B；B 才是作者要强调的原因。' },
        { title: '介词 + which', text: 'be confronted with evidence 变为 evidence with which we are confronted，介词不可省略。' }
      ]
    },
    {
      id: 'S3', difficulty: 4, source: '原创仿真句 · 经济',
      sentence: 'The assumption that economic growth will automatically translate into better public services has been challenged by evidence from countries where incomes have risen while access to healthcare has stagnated.',
      translation: '经济增长会自动转化为更好的公共服务这一假设，已受到一些国家证据的挑战；在这些国家，收入上升了，而医疗服务的可及性却停滞不前。',
      segments: [
        { text: 'The assumption ', role: 'subject', label: '主语' },
        { text: 'that economic growth will automatically translate into better public services ', role: 'appositive', label: '同位语从句', note: '解释 assumption 的具体内容。' },
        { text: 'has been challenged ', role: 'verb', label: '谓语（被动）' },
        { text: 'by evidence ', role: 'adverbial', label: '状语（施动者）' },
        { text: 'from countries ', role: 'attributive', label: '定语' },
        { text: 'where incomes have risen ', role: 'attributive', label: '定语从句' },
        { text: 'while access to healthcare has stagnated.', role: 'adverbial', label: '对比状语从句', note: 'while 表示“而、然而”。' }
      ],
      tree: {
        label: '主句', text: 'The assumption ... has been challenged by evidence', note: '被动句；主语带同位语从句',
        children: [
          { label: '主语', text: 'The assumption', children: [
            { label: '同位语从句', text: 'that economic growth will automatically translate into better public services', note: 'that 在从句中不作成分，只起连接作用' }
          ] },
          { label: '谓语', text: 'has been challenged', note: '现在完成被动；主语为单数 assumption' },
          { label: '状语', text: 'by evidence from countries', children: [
            { label: '定语从句', text: 'where incomes have risen while access to healthcare has stagnated', note: 'where = in which；内部含 while 对比' }
          ] }
        ]
      },
      points: [
        { title: '同位语从句 vs 定语从句', text: 'that 从句说明 assumption 的内容，且 that 不作成分，因此是同位语从句；若 that 在从句中作主语/宾语，则为定语从句。' },
        { title: '主谓一致', text: '主语中心词是 assumption（单数），因此用 has been challenged，而不是 have。' },
        { title: 'while 的对比用法', text: 'while 除“当……时”外，还可表示“然而”，用于对照两个相反趋势。' }
      ]
    },
    {
      id: 'S4', difficulty: 4, source: '原创仿真句 · 政策',
      sentence: 'Only when cities begin to measure the benefits of green space in terms of public health, rather than merely appearance, will investment in parks be taken seriously.',
      translation: '只有当城市开始从公共健康而非仅仅外观的角度衡量绿地的效益时，公园投资才会被认真对待。',
      segments: [
        { text: 'Only when cities begin to measure the benefits of green space ', role: 'adverbial', label: '状语从句', note: 'only + 状语从句置于句首。' },
        { text: 'in terms of public health, ', role: 'adverbial', label: '状语' },
        { text: 'rather than merely appearance, ', role: 'adverbial', label: '对比状语' },
        { text: 'will investment in parks ', role: 'subject', label: '主语（倒装后）' },
        { text: 'be taken ', role: 'verb', label: '谓语（被动）' },
        { text: 'seriously.', role: 'adverbial', label: '状语' }
      ],
      tree: {
        label: '主句（倒装）', text: 'Only when ..., will investment ... be taken seriously', note: 'only + 状语置首引起部分倒装',
        children: [
          { label: '状语从句', text: 'Only when cities begin to measure the benefits of green space in terms of public health, rather than merely appearance' },
          { label: '倒装谓语', text: 'will ... be taken', note: '助动词 will 提到主语前' },
          { label: '主语', text: 'investment in parks' },
          { label: '状语', text: 'seriously' }
        ]
      },
      points: [
        { title: 'only + 状语置首倒装', text: 'only 修饰状语（从句/短语）并置于句首时，主句部分倒装：will investment ... be taken。' },
        { title: 'in terms of', text: '“从……角度；就……而言”，常用于衡量标准。' },
        { title: 'rather than', text: '连接两个平行成分，表示取舍；此处对比 public health 与 appearance。' }
      ]
    },
    {
      id: 'S5', difficulty: 3, source: '原创仿真句 · 教育',
      sentence: 'What makes the study unusual is that its authors followed the same group of children for more than two decades, recording not only their academic results but also their relationships and health.',
      translation: '这项研究的特别之处在于，作者们对同一组儿童追踪了二十多年，不仅记录他们的学业成绩，还记录他们的人际关系与健康状况。',
      segments: [
        { text: 'What makes the study unusual', role: 'subject', label: '主语从句' },
        { text: ' is ', role: 'verb', label: '系动词' },
        { text: 'that its authors followed the same group of children for more than two decades, ', role: 'complement', label: '表语从句' },
        { text: 'recording ', role: 'adverbial', label: '伴随状语', note: '现在分词作伴随状语，逻辑主语为 authors。' },
        { text: 'not only their academic results ', role: 'object', label: '宾语 A' },
        { text: 'but also their relationships and health.', role: 'object', label: '宾语 B' }
      ],
      tree: {
        label: '主句', text: 'What ... is that ...', note: '主系表；what 从句作主语，that 从句作表语',
        children: [
          { label: '主语从句', text: 'What makes the study unusual' },
          { label: '系动词', text: 'is' },
          { label: '表语从句', text: 'that its authors followed ... for more than two decades', children: [
            { label: '伴随状语', text: 'recording not only ... but also ...', note: '现在分词短语，补充说明作者做了什么' }
          ] }
        ]
      },
      points: [
        { title: 'what 主语从句 + that 表语从句', text: '一个句子中可以同时出现 what 主语从句和 that 表语从句；注意两个连接词各司其职。' },
        { title: '现在分词作伴随状语', text: 'recording 的逻辑主语是 its authors，表示与主句谓语同时发生的动作。' },
        { title: 'not only ... but also ...', text: '连接两个平行宾语；also 可以省略，但 not only 置于句首时需倒装。' }
      ]
    },
    {
      id: 'S6', difficulty: 4, source: '原创仿真句 · 科技',
      sentence: 'Given that the technology is still in its infancy, it would be premature to conclude that its long-term effects on employment are either wholly positive or entirely destructive.',
      translation: '鉴于这项技术仍处于起步阶段，断言其对就业的长期影响要么完全积极、要么彻底破坏性，还为时过早。',
      segments: [
        { text: 'Given that the technology is still in its infancy, ', role: 'adverbial', label: '原因状语', note: 'given that = 考虑到、鉴于。' },
        { text: 'it ', role: 'subject', label: '形式主语' },
        { text: 'would be ', role: 'verb', label: '系动词' },
        { text: 'premature ', role: 'complement', label: '表语' },
        { text: 'to conclude ', role: 'subject', label: '真正主语' },
        { text: 'that its long-term effects on employment are either wholly positive or entirely destructive.', role: 'object', label: '宾语从句', note: '作 conclude 的宾语。' }
      ],
      tree: {
        label: '主句', text: 'Given that ..., it would be premature to conclude that ...', note: 'it 为形式主语，真正主语是 to conclude ...',
        children: [
          { label: '原因状语', text: 'Given that the technology is still in its infancy' },
          { label: '形式主语', text: 'it' },
          { label: '系表', text: 'would be premature' },
          { label: '真正主语', text: 'to conclude that ...', children: [
            { label: '宾语从句', text: 'that its long-term effects ... are either wholly positive or entirely destructive' }
          ] }
        ]
      },
      points: [
        { title: 'Given that', text: '引导原因状语从句，相当于“考虑到/鉴于”，比 because 更正式。' },
        { title: 'it is + adj. + to do', text: 'it 是形式主语，真正的主语是不定式短语 to conclude...。' },
        { title: 'either ... or ...', text: '表示二选一；与 wholly / entirely 搭配，强调两个极端。' }
      ]
    },
    {
      id: 'S7', difficulty: 3, source: '原创仿真句 · 社会',
      sentence: 'The more frequently people are exposed to opposing views, the less likely they are to dismiss those who hold them as simply ignorant or dishonest.',
      translation: '人们越频繁地接触对立观点，就越不可能把持这些观点的人简单地斥为无知或不诚实。',
      segments: [
        { text: 'The more frequently people are exposed to opposing views, ', role: 'adverbial', label: '比较状语从句', note: 'the more + 副词，引导前半比较。' },
        { text: 'the less likely ', role: 'complement', label: '表语（比较结构）' },
        { text: 'they ', role: 'subject', label: '主语' },
        { text: 'are ', role: 'verb', label: '系动词' },
        { text: 'to dismiss those who hold them as simply ignorant or dishonest.', role: 'complement', label: '不定式补足语', note: 'be likely to do；dismiss A as B。' }
      ],
      tree: {
        label: '比较主句', text: 'The more ..., the less likely they are to ...', note: '“越……，就越不……”',
        children: [
          { label: '比较状语从句', text: 'The more frequently people are exposed to opposing views' },
          { label: '主句', text: 'the less likely they are to dismiss those ...', children: [
            { label: '定语从句', text: 'who hold them', note: '修饰 those' },
            { label: '宾补', text: 'as simply ignorant or dishonest', note: 'dismiss A as B 结构' }
          ] }
        ]
      },
      points: [
        { title: 'the more ..., the less ...', text: '两个比较结构前后呼应；前半为从句，后半为主句，主句常倒装或省略。' },
        { title: 'be likely to do', text: '表示“可能做某事”；less likely 表示可能性更低。' },
        { title: 'dismiss A as B', text: '“把 A 斥为/认为是不重要的 B”；as 后接名词或形容词。' }
      ]
    },
    {
      id: 'S8', difficulty: 3, source: '原创仿真句 · 健康',
      sentence: 'It was not until researchers controlled for family income that the connection between screen time and poor sleep became apparent.',
      translation: '直到研究人员控制了家庭收入这一变量，屏幕使用时间与睡眠不佳之间的联系才变得明显。',
      segments: [
        { text: 'It ', role: 'subject', label: '形式主语' },
        { text: 'was ', role: 'verb', label: '系动词' },
        { text: 'not until researchers controlled for family income ', role: 'adverbial', label: '被强调的时间状语' },
        { text: 'that the connection between screen time and poor sleep became apparent.', role: 'attributive', label: '强调句 that', note: 'that 后为句子剩余部分。' }
      ],
      tree: {
        label: '强调结构', text: 'It was not until ... that ...', note: 'not until 的强调句式',
        children: [
          { label: '被强调状语', text: 'not until researchers controlled for family income', note: 'control for = 控制变量' },
          { label: '剩余部分', text: 'the connection between screen time and poor sleep became apparent', note: '主句使用陈述语序' }
        ]
      },
      points: [
        { title: 'not until 强调句', text: '正常语序：The connection ... did not become apparent until researchers controlled for family income. 强调后变为 It was not until ... that ...。' },
        { title: 'control for', text: '研究语境中表示“控制（变量）”，不是“控制某人”。' },
        { title: 'connection between A and B', text: '表示两者之间的联系；注意 between 后接并列成分。' }
      ]
    },
    {
      id: 'S9', difficulty: 4, source: '原创仿真句 · 公共政策',
      sentence: 'A policy that appears effective in one city may fail elsewhere, not because its design is flawed, but because the social conditions on which it depends are absent.',
      translation: '一项在某座城市看似有效的政策，在别处可能失效；原因不是设计有缺陷，而是它所依赖的社会条件并不存在。',
      segments: [
        { text: 'A policy ', role: 'subject', label: '主语' },
        { text: 'that appears effective in one city ', role: 'attributive', label: '定语从句' },
        { text: 'may fail ', role: 'verb', label: '谓语' },
        { text: 'elsewhere, ', role: 'adverbial', label: '状语' },
        { text: 'not because its design is flawed, ', role: 'adverbial', label: '原因状语 A', note: 'not because 表示否定原因。' },
        { text: 'but because the social conditions on which it depends are absent.', role: 'adverbial', label: '原因状语 B', note: '真正原因；on which 定语从句。' }
      ],
      tree: {
        label: '主句', text: 'A policy ... may fail elsewhere', note: '主谓结构，后接原因状语',
        children: [
          { label: '定语从句', text: 'that appears effective in one city' },
          { label: '原因状语', text: 'not because ..., but because ...', children: [
            { label: '否定原因', text: 'its design is flawed' },
            { label: '肯定原因', text: 'the social conditions on which it depends are absent', note: 'on which = on the conditions' }
          ] }
        ]
      },
      points: [
        { title: 'not because ... but because ...', text: '否定前者、肯定后者；阅读中要抓住 but because 后的真正原因。' },
        { title: '介词 + which', text: 'depend on the conditions → the conditions on which it depends。' },
        { title: '定语从句中的主谓一致', text: 'on which it depends 的主语是 it（policy），而 are absent 的主语是 conditions。' }
      ]
    },
    {
      id: 'S10', difficulty: 4, source: '原创仿真句 · 环境政策',
      sentence: 'Although the report acknowledges the uncertainty inherent in long-term forecasts, it nonetheless recommends that governments act now to reduce emissions.',
      translation: '尽管报告承认长期预测本身存在不确定性，它仍建议各国政府立即采取行动减排。',
      segments: [
        { text: 'Although the report acknowledges the uncertainty inherent in long-term forecasts, ', role: 'adverbial', label: '让步状语从句' },
        { text: 'it ', role: 'subject', label: '主语' },
        { text: 'nonetheless recommends ', role: 'verb', label: '谓语' },
        { text: 'that governments act now to reduce emissions.', role: 'object', label: '宾语从句（虚拟）', note: 'recommend that + (should) do。' }
      ],
      tree: {
        label: '主句', text: 'Although ..., it nonetheless recommends that ...', note: '让步 + 主句，不再加 but',
        children: [
          { label: '让步状语从句', text: 'Although the report acknowledges the uncertainty inherent in long-term forecasts', note: 'inherent in 作后置定语' },
          { label: '主句', text: 'it nonetheless recommends', note: 'nonetheless = 尽管如此' },
          { label: '宾语从句', text: 'that governments act now to reduce emissions', note: '虚拟语气，act 为原形' }
        ]
      },
      points: [
        { title: 'although 与 but 不连用', text: '英语中 although/though 引导让步从句后，主句不再加 but；中文的“虽然……但是……”不能直译。' },
        { title: 'recommend that + 虚拟', text: 'recommend, suggest, demand 等后的 that 从句常用 (should) + 动词原形，故用 act 而非 acts。' },
        { title: 'inherent in', text: '“内在于……的”，此处作 uncertainty 的后置定语。' }
      ]
    },
    {
      id: 'S11', difficulty: 4, source: '原创仿真句 · 科技与社会',
      sentence: 'The question is not whether automation will eliminate jobs, but whether the jobs it creates will offer the security and dignity that displaced workers need.',
      translation: '问题不在于自动化是否会消灭工作岗位，而在于它创造的岗位能否为被取代的工人提供所需的安全感与尊严。',
      segments: [
        { text: 'The question ', role: 'subject', label: '主语' },
        { text: ' is ', role: 'verb', label: '系动词' },
        { text: 'not whether automation will eliminate jobs, ', role: 'complement', label: '表语从句 A' },
        { text: 'but whether the jobs ', role: 'complement', label: '表语从句 B' },
        { text: 'it creates ', role: 'attributive', label: '定语从句', note: '省略了关系代词 that/which。' },
        { text: 'will offer the security and dignity ', role: 'verb', label: '谓语' },
        { text: 'that displaced workers need.', role: 'attributive', label: '定语从句' }
      ],
      tree: {
        label: '主句', text: 'The question is not whether ..., but whether ...', note: '两个 whether 从句作表语',
        children: [
          { label: '表语从句 A', text: 'whether automation will eliminate jobs' },
          { label: '表语从句 B', text: 'whether the jobs [it creates] will offer the security and dignity [that displaced workers need]', children: [
            { label: '省略关系词的定语从句', text: 'it creates', note: '修饰 jobs' },
            { label: '定语从句', text: 'that displaced workers need', note: '修饰 security and dignity' }
          ] }
        ]
      },
      points: [
        { title: 'not whether ... but whether ...', text: '把争论从“是否”转向“何种”，是议论文常见的推进方式。' },
        { title: '省略关系代词', text: 'the jobs (that) it creates：关系代词在定语从句中作宾语时可省略。' },
        { title: '嵌套定语从句', text: 'jobs 后有一个定语从句，security and dignity 后又有另一个，需要分层理解。' }
      ]
    },
    {
      id: 'S12', difficulty: 5, source: '原创仿真句 · 学术',
      sentence: 'Seldom has a scientific finding attracted so much public attention while generating so little agreement among the researchers who produced it.',
      translation: '很少有一项科学发现能引起如此广泛的公众关注，却在产出它的研究者之间引发如此少的共识。',
      segments: [
        { text: 'Seldom ', role: 'adverbial', label: '否定副词', note: '置于句首引起部分倒装。' },
        { text: 'has ', role: 'verb', label: '助动词（倒装）' },
        { text: 'a scientific finding ', role: 'subject', label: '主语' },
        { text: 'attracted ', role: 'verb', label: '谓语' },
        { text: 'so much public attention ', role: 'object', label: '宾语' },
        { text: 'while generating so little agreement among the researchers ', role: 'adverbial', label: '伴随状语', note: 'while + 现在分词。' },
        { text: 'who produced it.', role: 'attributive', label: '定语从句' }
      ],
      tree: {
        label: '倒装主句', text: 'Seldom has a scientific finding attracted ... while generating ...', note: '否定副词置首，助动词 has 提前',
        children: [
          { label: '主语', text: 'a scientific finding' },
          { label: '谓语', text: 'has attracted' },
          { label: '宾语', text: 'so much public attention' },
          { label: '伴随状语', text: 'while generating so little agreement among the researchers [who produced it]', note: 'while 表示对比/同时' }
        ]
      },
      points: [
        { title: '否定副词置首倒装', text: 'seldom, rarely, hardly, never 等置于句首时，助动词提前：Seldom has ... attracted。' },
        { title: 'while + 分词', text: 'while generating 的逻辑主语是 a scientific finding，表示与主句同时发生的伴随情况。' },
        { title: 'so much ... so little ...', text: '对比“公众关注多”与“学界共识少”，是作者的核心讽刺。' }
      ]
    }
  ];

  C.data.cloze = [
    {
      id: 'C1', title: 'The Limits of Willpower', topic: '心理 · 自我控制', difficulty: '进阶',
      intro: '关于自控力的常见看法可能具有误导性。读全文，从 15 个词中为 10 个空选出最恰当的一项。',
      passage: `Most people believe that self-control is a matter of willpower: if we simply try harder, we can resist temptation. Yet a growing body of research suggests that this view is {{1}}.

In a series of experiments, psychologists found that people who appear to have extraordinary self-control are not better at resisting temptation; they are better at avoiding it in the first place. They arrange their environments so that {{2}} choices become easier to make. Someone who wants to exercise more, for instance, may leave running shoes by the door and cancel a subscription to a streaming service.

This strategy may sound {{3}}, but its effects are substantial. Participants who relied on such routines were more likely to {{4}} their goals over a year. The researchers also note that willpower is {{5}}: it can be depleted by stress, lack of sleep, and constant decision-making.

This helps explain why people often {{6}} to temptation late in the day. The implication is not that discipline is {{7}}, but that it should be supported by smart design. Instead of {{8}} ourselves for every failure, we might ask what in our environment made the desired behaviour difficult.

In other words, the most effective form of self-control may be the kind that {{9}} us from needing to use self-control at all. That conclusion is {{10}}, but it is supported by a growing number of studies.`,
      bank: [
        { word: 'misleading', pos: 'adj.' }, { word: 'desirable', pos: 'adj.' }, { word: 'trivial', pos: 'adj.' },
        { word: 'achieve', pos: 'v.' }, { word: 'limited', pos: 'adj./v-ed' }, { word: 'give in', pos: 'phr. v.' },
        { word: 'worthless', pos: 'adj.' }, { word: 'blaming', pos: 'v-ing' }, { word: 'prevents', pos: 'v.' },
        { word: 'counterintuitive', pos: 'adj.' }, { word: 'relying', pos: 'v-ing' }, { word: 'essential', pos: 'adj.' },
        { word: 'obvious', pos: 'adj.' }, { word: 'maintain', pos: 'v.' }, { word: 'resist', pos: 'v.' }
      ],
      answers: ['misleading', 'desirable', 'trivial', 'achieve', 'limited', 'give in', 'worthless', 'blaming', 'prevents', 'counterintuitive'],
      explanations: [
        { type: '逻辑', why: '前文说人们相信“努力就能抵抗诱惑”，后文用 Yet 转折并给出反证，因此这一观点是“误导性的”：misleading。' },
        { type: '词义', why: '布置环境是为了让“值得要的、理想的”选择更容易做出：desirable choices。desirable 表示“令人向往的”。' },
        { type: '逻辑', why: 'sound 后接形容词，与 but 后的 substantial 形成对比：听起来“微不足道”，效果却显著：trivial。' },
        { type: '搭配', why: 'achieve one’s goals 是固定搭配，表示“实现目标”；be more likely to 后接动词原形。' },
        { type: '逻辑', why: '冒号后说明意志力会被压力、睡眠不足消耗，故它是“有限的”：limited。' },
        { type: '搭配', why: 'give in to temptation 表示“屈服于诱惑”，与 late in the day 的语境一致。' },
        { type: '逻辑', why: 'not ... but ... 对比：纪律并非“毫无价值”，而是需要被设计支持：worthless。' },
        { type: '语法', why: 'Instead of 后接动名词，且与 ourselves 搭配：blaming ourselves for... 表示“因……而责怪自己”。' },
        { type: '语法', why: 'the kind that ... 引导定语从句，先行词为单数 the kind，谓语用 prevents；prevent sb from doing 为固定搭配。' },
        { type: '逻辑', why: '结论与常识相反，并由 but 引出“越来越多研究支持”，故为 counterintuitive（反直觉的）。' }
      ],
      note: '改编自心理学中关于自我控制与情境设计的讨论，原文为教学目的原创。'
    },
    {
      id: 'C2', title: 'Tiny Forests, Big Claims', topic: '环境 · 城市', difficulty: '进阶',
      intro: '城市微型森林被寄予厚望，但它能否替代大型绿地？从词库中为 10 个空选择最佳答案。',
      passage: `Urban planners across Europe are experimenting with a method known as the mini forest. The idea is to plant dense patches of native trees in spaces as small as a tennis court. Supporters argue that these patches can {{1}} some of the benefits of a large woodland: they cool the air, absorb rainwater and provide habitats for insects.

Because the trees compete for light, they grow quickly, and the forest becomes {{2}} within a decade. The method is also relatively cheap, which makes it {{3}} to schools and community groups. However, critics warn that mini forests are not a {{4}} for large parks. Small patches cannot support the same range of species, and they may be {{5}} to drought or disease.

The designers {{6}} that the aim is not to replace existing green space but to make better use of neglected land. They also {{7}} that residents should be involved in planting and maintenance, since a forest that people feel {{8}} to is more likely to be protected. Early results are {{9}}: in one district, temperatures in a mini forest were four degrees lower than in a nearby car park. Whether such projects can {{10}} up remains an open question.`,
      bank: [
        { word: 'deliver', pos: 'v.' }, { word: 'established', pos: 'adj./v-ed' }, { word: 'accessible', pos: 'adj.' },
        { word: 'substitute', pos: 'n.' }, { word: 'vulnerable', pos: 'adj.' }, { word: 'acknowledge', pos: 'v.' },
        { word: 'insist', pos: 'v.' }, { word: 'attached', pos: 'adj./v-ed' }, { word: 'encouraging', pos: 'adj.' },
        { word: 'scale', pos: 'v.' }, { word: 'resemble', pos: 'v.' }, { word: 'resistant', pos: 'adj.' },
        { word: 'available', pos: 'adj.' }, { word: 'expand', pos: 'v.' }, { word: 'convince', pos: 'v.' }
      ],
      answers: ['deliver', 'established', 'accessible', 'substitute', 'vulnerable', 'acknowledge', 'insist', 'attached', 'encouraging', 'scale'],
      explanations: [
        { type: '搭配', why: 'deliver benefits 表示“带来/提供益处”，与后文列举的降温、蓄水、栖息地相呼应。' },
        { type: '语法', why: 'become 后接形容词或过去分词作表语；森林“建立起来、站稳脚跟”用 established。' },
        { type: '搭配', why: 'accessible to schools and community groups 表示“对学校和社区团体而言负担得起、易于获得”。' },
        { type: '搭配', why: 'a substitute for sth 表示“……的替代品”；后文明确说不能替代大型公园。' },
        { type: '搭配', why: 'be vulnerable to 表示“易受……影响/伤害”，与 drought or disease 搭配。' },
        { type: '逻辑', why: '设计者承认（acknowledge）目标不是取代现有绿地；that 从句说明承认的内容。' },
        { type: '逻辑', why: '后文提出居民应参与，语气比 acknowledge 更强，表示“坚持主张”：insist that ... (should) ...。' },
        { type: '搭配', why: 'feel attached to 表示“对……有感情、有归属感”，因此更可能保护它。' },
        { type: '词义', why: '冒号后给出具体降温数据，说明早期结果是“令人鼓舞的”：encouraging。' },
        { type: '搭配', why: 'scale up 是固定短语，表示“扩大规模”；此处指项目能否在更大范围推广。' }
      ],
      note: '围绕城市微型森林的争议编写，例句与数据均为教学目的原创。'
    }
  ];

  C.data.readingNote = '阅读材料均为原创六级仿真文本，长难句标注与题目解析由编者手工完成；不代表官方真题。';
})();
