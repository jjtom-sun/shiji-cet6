/* Writing & translation studio — prompts, corpus, patterns, templates */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  C.data = C.data || {};

  C.data.writingPrompts = [
    {
      id: 'W1', title: 'Failure as a Teacher', topic: '成长 · 教育', time: 30,
      promptZh: '有人认为失败比成功更能教会我们东西。请写一篇短文说明你的看法，并结合例子论证。',
      task: 'Directions: For this part, you are allowed 30 minutes to write an essay on whether failure can be a better teacher than success. You should state your view and support it with examples. You should write at least 150 words but no more than 200 words.',
      wordTarget: [150, 200],
      keyPoints: ['明确立场：失败是否更具教育价值', '给出至少一个具体例证（科研、学习或工作）', '指出失败产生价值的前提（反思与分析）', '结尾回扣：未经反思的失败才会重复'],
      expectedTerms: [
        { zh: '失败', en: ['failure', 'fail'] }, { zh: '成功', en: ['success', 'succeed'] },
        { zh: '学习/教会', en: ['learn', 'teach'] }, { zh: '反思', en: ['reflect', 'reflection'] },
        { zh: '例子', en: ['example', 'case', 'instance', 'experiment', 'for example', 'such as'] }, { zh: '改进', en: ['improve', 'improvement'] }
      ],
      starters: ['It is often said that ...', 'While success confirms ..., failure reveals ...', 'A case in point is ...', 'What ultimately matters is not ... but ...'],
      pitfalls: ['只罗列名言，缺少具体例子', '把“失败是好事”绝对化，忽略反思前提', '全篇使用第一人称叙事，缺少论证层次'],
      model: `Failure is often described as the opposite of success, yet it is better understood as part of the process that makes success possible. [[While success confirms what we already know, failure reveals what we still need to learn.]] A failed experiment, a rejected proposal or a lost competition forces us to examine our assumptions more honestly than praise ever could.

Consider the way scientists work. [[Far from being a sign of incompetence, a failed trial provides information that narrows the search for a workable solution.]] The same is true in everyday life. Students who treat a low grade as feedback, rather than as a verdict on their ability, are more likely to adjust their methods and improve.

That does not mean failure is automatically valuable. [[It becomes a teacher only when it is reflected upon.]] Without analysis, mistakes are simply repeated. Schools and workplaces therefore need to create room for candid review, where people can discuss what went wrong without fear of humiliation.

[[In short, failure is not the enemy of achievement; unexamined failure is.]] Those who learn to read it carefully gain something that success alone rarely supplies: a clearer understanding of how to improve.`
    },
    {
      id: 'W2', title: 'Should Community Service Be Required?', topic: '教育 · 社会', time: 30,
      promptZh: '有人主张大学生必须完成社区服务，也有人认为应完全自愿。请讨论双方观点并给出你的看法。',
      task: 'Directions: For this part, you are allowed 30 minutes to write an essay on whether university students should be required to complete community service. You should discuss both views and give your own opinion. You should write at least 150 words but no more than 200 words.',
      wordTarget: [150, 200],
      keyPoints: ['概述争议：必修 vs 自愿', '支持方理由：覆盖面、社会认知、同理心', '反对方理由：强制削弱志愿精神、组织成本', '给出折中方案：适度学时 + 自主选择 + 反思环节'],
      expectedTerms: [
        { zh: '社区服务', en: ['community service'] }, { zh: '志愿/自愿', en: ['volunteer', 'voluntary'] },
        { zh: '要求/强制', en: ['require', 'requirement', 'compulsory', 'mandatory'] },
        { zh: '益处', en: ['benefit', 'advantage'] }, { zh: '学生', en: ['student'] },
        { zh: '社区', en: ['community'] }
      ],
      starters: ['The proposal has considerable merit, though ...', 'Supporters point out that ...', 'Critics, however, warn that ...', 'A sensible compromise is to ...'],
      pitfalls: ['只写一方观点，未回应另一方', '把 community service 与 internship 混为一谈', '结尾重复开头，没有提出可操作方案'],
      model: `Universities are increasingly expected to produce not only skilled graduates but also responsible citizens. Some argue that community service should therefore be a graduation requirement. [[The proposal has considerable merit, though it should be implemented with care.]]

Supporters point out that voluntary service is often confined to students who are already motivated. [[A requirement would expose everyone to social realities that a classroom cannot replicate]]: the pressures faced by low-income families, the challenges of running a charity, or the needs of an ageing neighbourhood. Such experience can strengthen empathy and practical judgment, both of which employers value.

Critics, however, warn that compulsion may undermine the very spirit of service. [[If students participate only to satisfy a requirement, the result may be resentment rather than commitment.]] There is also a risk that poorly organized placements waste both students' time and community organizations' resources.

[[A sensible compromise is to require a modest number of hours while offering genuine choice]] over the type of work. Universities should also provide preparation and reflection sessions, so that service becomes a learning experience rather than a box to tick. [[When designed well, the requirement can serve students and communities alike.]]`
    },
    {
      id: 'W3', title: 'Short Videos and Young People', topic: '媒体 · 青少年', time: 30,
      promptZh: '短视频深刻影响青少年的注意力与生活方式。请分析其吸引力、影响，并提出你的建议。',
      task: 'Directions: For this part, you are allowed 30 minutes to write an essay on the effects of short-form video on young people. You should discuss both benefits and risks, and offer your view on how to use the medium wisely. You should write at least 150 words but no more than 200 words.',
      wordTarget: [150, 200],
      keyPoints: ['解释短视频为何吸引人（即时反馈、算法推荐）', '分析双重影响：知识传播 vs 注意力碎片化、睡眠', '提出可操作建议：家庭规则、媒介素养、平台工具', '立场：不是禁止，而是有意识地使用'],
      expectedTerms: [
        { zh: '短视频', en: ['short video', 'short-form video'] }, { zh: '注意力', en: ['attention'] },
        { zh: '算法', en: ['algorithm'] }, { zh: '睡眠', en: ['sleep'] },
        { zh: '年轻人', en: ['young people', 'youngster', 'teenager'] },
        { zh: '数字素养', en: ['digital literacy', 'media literacy'] }
      ],
      starters: ['The phenomenon is not simply ...', 'Several factors explain ...', 'The consequences are mixed.', 'The solution is not to ban ... but to ...'],
      pitfalls: ['全篇批判，忽略知识传播等积极面', '建议空泛（“应该少看手机”）', '缺少因果关系，只堆砌现象'],
      model: `Short videos have become the default entertainment for many young people. [[The phenomenon is not simply a matter of idle time; it reflects a broader shift in how attention is trained.]]

Several factors explain its appeal. [[The format delivers instant stimulation, requiring no prior knowledge and offering a reward within seconds.]] Algorithms amplify this effect by learning what holds each user's gaze and serving more of the same. For young people facing academic pressure, the phone offers an easily accessible escape.

The consequences are mixed. [[Short videos can spread practical knowledge and give small creators a platform.]] Yet constant switching may weaken the ability to concentrate on complex tasks. Sleep, too, is often sacrificed: one more clip easily becomes an hour.

[[The solution is not to ban the technology but to teach deliberate use.]] Families can establish screen-free periods, schools can discuss how recommendation systems work, and platforms should offer tools that make limits easier to keep. [[Digital literacy, rather than abstinence, is the more realistic goal.]]`
    }
  ];

  C.data.bandDescriptors = [
    { min: 13, max: 15, label: '优秀', desc: '切题，论证充分，结构清晰；语言准确、句式多样，仅有个别小错。' },
    { min: 10, max: 12, label: '良好', desc: '切题，论点明确，有例证；语言基本准确，存在少量不影响理解的错误。' },
    { min: 7, max: 9, label: '及格', desc: '基本切题，结构尚可；语言错误较多，但主要意思仍可理解。' },
    { min: 4, max: 6, label: '较差', desc: '部分偏题，论证薄弱；语言错误频繁，影响理解。' },
    { min: 0, max: 3, label: '差', desc: '跑题或内容过少；语言错误密集，难以理解。' }
  ];

  C.data.writingTips = [
    { title: '先立论，再展开', text: '第一段用两句话完成“背景 + 立场”，不要复述题目超过一句。立场必须明确，避免“both are important”式模糊。' },
    { title: '一段一个功能', text: '建议三段：立场段、论证段（例证/因果）、让步或建议段。每段首句承担主题句功能。' },
    { title: '例证要具体', text: '用“某类人/某场景”替代空泛的大道理。例如 scientist、student、small business，而不是笼统的 people。' },
    { title: '句式做“长短交替”', text: '全文若都是简单句会显得幼稚；若都是长从句会难以阅读。每段至少一个复杂句，并穿插短句强调。' },
    { title: '替换要克制', text: '高级词只有在语义、搭配都准确时才加分。不确定搭配时，宁可使用熟悉的准确表达。' },
    { title: '留两分钟检查', text: '重点查：主谓一致、冠词、可数/不可数、拼写、标点。规则引擎能查出大部分，但最终要自己读一遍。' }
  ];

  C.data.translationTips = [
    { title: '先拆句，再定主谓', text: '把中文长句拆成若干意群，为每个意群确定主语和谓语。中文常省略主语，英文需要补出或改用被动。' },
    { title: '无主句的处理', text: '“应加强……”可译为 We should strengthen / It is necessary to strengthen / Greater attention should be paid to...，根据语域选择。' },
    { title: '四字格不逐字译', text: '“源远流长”可译为 have a long history / date back to ancient times；“安居乐业”可译为 live and work in peace and contentment。' },
    { title: '逻辑显化', text: '中文靠意合，英文靠形合。适当补出 because, while, therefore, which 等连接词，使逻辑关系清晰。' },
    { title: '名词化与被动', text: '正式语篇中可把动词转化为名词（the promotion of..., the construction of...），但不要通篇堆砌。' },
    { title: '术语保持一致', text: '同一术语在全文中保持统一译法；固定表达（如 intangible cultural heritage）不要随意改写。' }
  ];

  C.data.translations = [
    {
      id: 'T1', theme: '历史', title: 'The Silk Road', difficulty: '进阶', time: 30,
      zh: '丝绸之路是古代连接东西方的重要商路。它不仅促进了丝绸、香料等商品的交换，也推动了思想、艺术与技术的传播。如今，共建“一带一路”倡议延续了这一精神，强调基础设施互联互通与人文交流。对许多沿线城市而言，如何在发展中保护历史遗产，仍是一项重要挑战。',
      reference: 'The Silk Road was a vital trade route linking East and West in ancient times. It facilitated not only the exchange of goods such as silk and spices, but also the spread of ideas, art and technology. Today, the Belt and Road Initiative carries forward this spirit, emphasizing infrastructure connectivity and people-to-people exchanges. For many cities along the routes, how to protect their historical heritage while pursuing development remains a major challenge.',
      terms: [
        { zh: '丝绸之路', en: ['the Silk Road'] },
        { zh: '香料', en: ['spices', 'spice'] },
        { zh: '传播', en: ['spread', 'dissemination'] },
        { zh: '共建“一带一路”倡议', en: ['the Belt and Road Initiative'] },
        { zh: '互联互通', en: ['connectivity'] },
        { zh: '人文交流', en: ['people-to-people exchanges', 'cultural exchanges'] },
        { zh: '沿线城市', en: ['cities along the routes', 'cities along the Silk Road'] },
        { zh: '历史遗产', en: ['historical heritage', 'cultural heritage'] }
      ],
      chunks: [
        { zh: '是古代连接东西方的重要商路', en: 'was a vital trade route linking East and West in ancient times' },
        { zh: '不仅促进了……也推动了……', en: 'facilitated not only ... but also ...' },
        { zh: '延续了这一精神', en: 'carries forward this spirit' },
        { zh: '如何在发展中保护历史遗产', en: 'how to protect historical heritage while pursuing development' },
        { zh: '仍是一项重要挑战', en: 'remains a major challenge' }
      ],
      note: '“丝绸之路”是专有名词，需大写；not only ... but also ... 连接两个名词短语时保持结构对称。'
    },
    {
      id: 'T2', theme: '文化', title: 'The Spring Festival', difficulty: '进阶', time: 30,
      zh: '春节是中国最重要的传统节日。人们通常提前打扫房屋、张贴春联，并准备丰盛的年夜饭。除夕之夜，家人无论相隔多远，都尽量团聚在一起。近年来，越来越多年轻人通过短视频记录家乡的习俗，使传统文化获得新的表达方式。有人认为，年味变淡了；也有人认为，形式的变化恰恰说明传统具有生命力。',
      reference: "The Spring Festival is the most important traditional festival in China. People usually clean their homes in advance, put up couplets and prepare a lavish New Year's Eve dinner. On New Year's Eve, family members try to gather together no matter how far apart they live. In recent years, more and more young people have recorded local customs through short videos, giving traditional culture new forms of expression. Some believe that the festive atmosphere has faded; others argue that changes in form are precisely evidence of the vitality of tradition.",
      terms: [
        { zh: '春节', en: ['the Spring Festival', 'Chinese New Year'] },
        { zh: '春联', en: ['Spring Festival couplets', 'couplets'] },
        { zh: '年夜饭', en: ["New Year's Eve dinner", 'family reunion dinner'] },
        { zh: '除夕', en: ["New Year's Eve"] },
        { zh: '团聚', en: ['reunite', 'gather together', 'family reunion'] },
        { zh: '短视频', en: ['short videos', 'short-form videos'] },
        { zh: '习俗', en: ['customs', 'traditions'] },
        { zh: '年味', en: ['festive atmosphere', 'the flavour of the festival'] },
        { zh: '生命力', en: ['vitality', 'vital force'] }
      ],
      chunks: [
        { zh: '提前打扫房屋、张贴春联', en: 'clean their homes in advance and put up couplets' },
        { zh: '无论相隔多远', en: 'no matter how far apart they live' },
        { zh: '使传统文化获得新的表达方式', en: 'giving traditional culture new forms of expression' },
        { zh: '有人认为……也有人认为……', en: 'Some believe that ...; others argue that ...' },
        { zh: '恰恰说明传统具有生命力', en: 'are precisely evidence of the vitality of tradition' }
      ],
      note: '“年味”不宜直译为 the taste of the year，可意译为 festive atmosphere；“无论相隔多远”用 no matter how far 引导让步状语。'
    },
    {
      id: 'T3', theme: '经济', title: 'New Energy Vehicles', difficulty: '进阶', time: 30,
      zh: '近年来，中国新能源汽车产业快速发展。政府通过补贴和充电基础设施建设，推动了电动汽车的普及。与此同时，本土企业在电池技术和智能驾驶领域投入大量研发资源，部分产品已进入国际市场。然而，行业也面临产能过剩、价格竞争激烈等挑战。如何在保持创新活力的同时，建立更加可持续的产业生态，是未来发展的关键。',
      reference: "In recent years, China's new energy vehicle industry has developed rapidly. Government subsidies and the construction of charging infrastructure have promoted the adoption of electric vehicles. Meanwhile, domestic companies have invested heavily in research and development in battery technology and smart driving, and some products have entered international markets. However, the industry also faces challenges such as overcapacity and intense price competition. How to build a more sustainable industrial ecosystem while maintaining innovative vitality is key to future development.",
      terms: [
        { zh: '新能源汽车', en: ['new energy vehicles', 'NEVs'] },
        { zh: '补贴', en: ['subsidies', 'subsidies and incentives'] },
        { zh: '充电基础设施', en: ['charging infrastructure'] },
        { zh: '普及', en: ['adoption', 'popularization'] },
        { zh: '本土企业', en: ['domestic companies', 'domestic firms'] },
        { zh: '研发', en: ['research and development', 'R&D'] },
        { zh: '智能驾驶', en: ['smart driving', 'intelligent driving'] },
        { zh: '产能过剩', en: ['overcapacity'] },
        { zh: '产业生态', en: ['industrial ecosystem'] }
      ],
      chunks: [
        { zh: '近年来……快速发展', en: 'In recent years, ... has developed rapidly' },
        { zh: '通过补贴和……建设', en: 'through subsidies and the construction of ...' },
        { zh: '投入大量研发资源', en: 'invest heavily in research and development' },
        { zh: '部分产品已进入国际市场', en: 'some products have entered international markets' },
        { zh: '如何在……的同时……', en: 'how to ... while maintaining ...' }
      ],
      note: '“普及”在产业语境中常用 adoption，比 popularity 更正式；“产能过剩”是固定经济术语 overcapacity。'
    },
    {
      id: 'T4', theme: '社会', title: 'Ageing and Community Care', difficulty: '进阶', time: 30,
      zh: '随着人口老龄化程度不断加深，如何为老年人提供有尊严的照护成为社会关注的焦点。传统家庭养老模式正面临压力，越来越多的家庭开始寻求社区服务。一些城市尝试建立社区食堂、日间照料中心和上门护理服务，使老年人能够在熟悉的环境中生活。专家指出，这些服务若要持续发展，既需要政府的支持，也离不开专业人才的培养。',
      reference: 'As the population ages, how to provide dignified care for older people has become a focus of public concern. The traditional model of family-based care is under pressure, and more and more families are turning to community services. Some cities have experimented with community canteens, day care centres and home nursing services, enabling older people to live in familiar surroundings. Experts point out that the sustainable development of these services requires both government support and the training of professional staff.',
      terms: [
        { zh: '人口老龄化', en: ['population ageing', 'an ageing population'] },
        { zh: '有尊严的照护', en: ['dignified care'] },
        { zh: '家庭养老', en: ['family-based care', 'family care'] },
        { zh: '社区服务', en: ['community services'] },
        { zh: '社区食堂', en: ['community canteens'] },
        { zh: '日间照料中心', en: ['day care centres'] },
        { zh: '上门护理', en: ['home nursing services', 'home care'] },
        { zh: '专业人才', en: ['professional staff', 'trained professionals'] }
      ],
      chunks: [
        { zh: '随着……不断加深', en: 'As ... continues to deepen' },
        { zh: '成为社会关注的焦点', en: 'has become a focus of public concern' },
        { zh: '正面临压力', en: 'is under pressure' },
        { zh: '使老年人能够在熟悉的环境中生活', en: 'enabling older people to live in familiar surroundings' },
        { zh: '既需要……也离不开……', en: 'requires both ... and ...' }
      ],
      note: '“老年人”用 older people 或 older adults，避免 the old 这种略显生硬的表达；“养老”需根据语境译为 care for older people / elderly care。'
    }
  ];

  C.data.topicVocab = [
    /* 历史 */
    { theme: '历史', zh: '源远流长', en: 'have a long history / date back to ancient times', eg: 'Chinese civilization has a long history.' },
    { theme: '历史', zh: '四大发明', en: 'the four great inventions', eg: 'Papermaking, printing, the compass and gunpowder are known as the four great inventions of ancient China.' },
    { theme: '历史', zh: '朝代', en: 'dynasty', eg: 'The Tang dynasty is remembered for its cultural openness.' },
    { theme: '历史', zh: '古迹', en: 'historical sites / historic sites', eg: 'The city is famous for its well-preserved historical sites.' },
    { theme: '历史', zh: '遗址', en: 'archaeological site / ruins', eg: 'The archaeological site dates back more than three thousand years.' },
    { theme: '历史', zh: '文明', en: 'civilization', eg: 'River valleys gave rise to some of the earliest civilizations.' },
    { theme: '历史', zh: '传承', en: 'pass down / preserve and carry forward', eg: 'Traditional skills are passed down from one generation to the next.' },
    { theme: '历史', zh: '发源地', en: 'birthplace / cradle', eg: 'The region is regarded as the birthplace of tea culture.' },
    { theme: '历史', zh: '出土文物', en: 'unearthed cultural relics', eg: 'The museum displays unearthed cultural relics from the Han dynasty.' },
    { theme: '历史', zh: '青铜器', en: 'bronze ware', eg: 'Bronze ware reveals a great deal about ritual life in ancient China.' },
    { theme: '历史', zh: '丝绸之路', en: 'the Silk Road', eg: 'The Silk Road linked China with Central Asia and Europe.' },
    { theme: '历史', zh: '文化交流', en: 'cultural exchange', eg: 'The festival promotes cultural exchange between East and West.' },
    { theme: '历史', zh: '互学互鉴', en: 'mutual learning', eg: 'Civilizations flourish through mutual learning rather than isolation.' },
    { theme: '历史', zh: '世界遗产', en: 'World Heritage site', eg: 'The temple was listed as a World Heritage site in 1994.' },

    /* 文化 */
    { theme: '文化', zh: '传统美德', en: 'traditional virtues', eg: 'Honesty and diligence are regarded as traditional virtues.' },
    { theme: '文化', zh: '儒家思想', en: 'Confucianism', eg: 'Confucianism has shaped Chinese ideas of family and education.' },
    { theme: '文化', zh: '书法', en: 'calligraphy', eg: 'Chinese calligraphy is both a form of writing and an art.' },
    { theme: '文化', zh: '戏曲', en: 'traditional opera', eg: 'Local operas combine singing, acting and acrobatics.' },
    { theme: '文化', zh: '剪纸', en: 'paper-cutting', eg: 'Paper-cutting is often used to decorate windows during festivals.' },
    { theme: '文化', zh: '民俗', en: 'folk customs', eg: 'The village is known for its distinctive folk customs.' },
    { theme: '文化', zh: '二十四节气', en: 'the 24 solar terms', eg: 'The 24 solar terms guided agricultural work for centuries.' },
    { theme: '文化', zh: '团圆', en: 'reunion', eg: 'The festival is above all a celebration of family reunion.' },
    { theme: '文化', zh: '孝道', en: 'filial piety', eg: 'Filial piety remains an important value in many Asian societies.' },
    { theme: '文化', zh: '礼仪', en: 'etiquette', eg: 'Tea drinking involves a good deal of etiquette.' },
    { theme: '文化', zh: '非物质文化遗产', en: 'intangible cultural heritage', eg: 'The craft was added to the list of intangible cultural heritage.' },
    { theme: '文化', zh: '文化自信', en: 'cultural confidence', eg: 'Cultural confidence grows from a clear understanding of one’s own traditions.' },
    { theme: '文化', zh: '匠心', en: 'craftsmanship', eg: 'The furniture is admired for its fine craftsmanship.' },
    { theme: '文化', zh: '雅俗共赏', en: 'appeal to both refined and popular tastes', eg: 'The performance appeals to both refined and popular tastes.' },

    /* 经济 */
    { theme: '经济', zh: '可持续发展', en: 'sustainable development', eg: 'The city treats sustainable development as a long-term priority.' },
    { theme: '经济', zh: '高质量发展', en: 'high-quality development', eg: 'The region is shifting from rapid growth to high-quality development.' },
    { theme: '经济', zh: '数字经济', en: 'digital economy', eg: 'The digital economy now accounts for a large share of employment.' },
    { theme: '经济', zh: '新兴产业', en: 'emerging industries', eg: 'Emerging industries such as clean energy are attracting investment.' },
    { theme: '经济', zh: '消费升级', en: 'consumption upgrading', eg: 'Consumption upgrading has increased demand for quality services.' },
    { theme: '经济', zh: '产业链', en: 'industrial chain', eg: 'The country plays a central role in the global industrial chain.' },
    { theme: '经济', zh: '营商环境', en: 'business environment', eg: 'A stable business environment encourages long-term investment.' },
    { theme: '经济', zh: '城镇化', en: 'urbanization', eg: 'Rapid urbanization has transformed the surrounding countryside.' },
    { theme: '经济', zh: '共同富裕', en: 'common prosperity', eg: 'The policy aims to promote common prosperity rather than mere growth.' },
    { theme: '经济', zh: '绿色转型', en: 'green transition', eg: 'The green transition requires both investment and new skills.' },
    { theme: '经济', zh: '双循环', en: 'dual circulation', eg: 'The dual circulation strategy emphasizes domestic demand and global openness.' },
    { theme: '经济', zh: '跨境电商', en: 'cross-border e-commerce', eg: 'Cross-border e-commerce has lowered the cost of entering foreign markets.' },
    { theme: '经济', zh: '基础设施', en: 'infrastructure', eg: 'Reliable infrastructure is essential for regional development.' },
    { theme: '经济', zh: '创新驱动', en: 'innovation-driven', eg: 'The economy is becoming increasingly innovation-driven.' },

    /* 社会 */
    { theme: '社会', zh: '人口老龄化', en: 'population ageing', eg: 'Population ageing is placing pressure on pension systems.' },
    { theme: '社会', zh: '社会保障', en: 'social security', eg: 'A sound social security system protects the most vulnerable.' },
    { theme: '社会', zh: '医疗保障', en: 'medical security / healthcare', eg: 'Access to affordable healthcare is a basic public expectation.' },
    { theme: '社会', zh: '教育公平', en: 'educational equity', eg: 'Educational equity requires more than equal funding.' },
    { theme: '社会', zh: '城乡差距', en: 'urban-rural gap', eg: 'The urban-rural gap remains visible in access to specialist care.' },
    { theme: '社会', zh: '社区治理', en: 'community governance', eg: 'Community governance works best when residents are involved.' },
    { theme: '社会', zh: '公共服务', en: 'public services', eg: 'Rural areas still lack some basic public services.' },
    { theme: '社会', zh: '就业压力', en: 'employment pressure', eg: 'Graduates face intense employment pressure in a slowing economy.' },
    { theme: '社会', zh: '交通拥堵', en: 'traffic congestion', eg: 'Traffic congestion costs the city both time and productivity.' },
    { theme: '社会', zh: '垃圾分类', en: 'waste sorting', eg: 'Waste sorting becomes effective only when collection systems are reliable.' },
    { theme: '社会', zh: '志愿服务', en: 'volunteer service', eg: 'Volunteer service can build trust between institutions and communities.' },
    { theme: '社会', zh: '心理健康', en: 'mental health', eg: 'Schools are paying more attention to students’ mental health.' },
    { theme: '社会', zh: '数字鸿沟', en: 'digital divide', eg: 'The digital divide excludes some older people from online services.' },
    { theme: '社会', zh: '安居乐业', en: 'live and work in peace and contentment', eg: 'Stable housing and employment help people live and work in peace.' }
  ];

  C.data.replacements = [
    { basic: 'think', better: 'contend / maintain / argue', note: '议论文中表达观点，比 think 更正式、更有立场。', eg: 'I contend that universities should teach digital literacy.' },
    { basic: 'very important', better: 'crucial / of paramount importance / vital', note: '避免 very + 基础形容词，改用更强的单词或正式短语。', eg: 'Early intervention is of paramount importance.' },
    { basic: 'many', better: 'numerous / a considerable number of', note: '书面语中比 many 更有分量；后接可数名词复数。', eg: 'A considerable number of graduates now work remotely.' },
    { basic: 'more and more', better: 'a growing number of / increasingly', note: '前者接可数名词，后者修饰形容词或动词。', eg: 'A growing number of firms offer flexible hours.' },
    { basic: 'good', better: 'beneficial / constructive / positive', note: '根据搭配选择：be beneficial to, a constructive approach。', eg: 'The policy has had a positive effect on rural schools.' },
    { basic: 'bad', better: 'harmful / detrimental / adverse', note: '正式语域；detrimental to 后接名词。', eg: 'Excessive screen time is detrimental to sleep.' },
    { basic: 'get', better: 'obtain / acquire / secure', note: 'get 过于口语；学术语境常用 obtain/acquire。', eg: 'Students acquire skills through practice.' },
    { basic: 'help', better: 'facilitate / assist / contribute to', note: 'facilitate 表示“使便利”，assist 后接人，contribute to 表示“有助于”。', eg: 'Clear rules facilitate cooperation.' },
    { basic: 'show', better: 'demonstrate / reveal / illustrate', note: '数据或研究常用 demonstrate/reveal。', eg: 'The data reveal a consistent pattern.' },
    { basic: 'make', better: 'generate / produce / foster', note: '根据宾语搭配：generate revenue, foster creativity。', eg: 'The programme fosters a sense of responsibility.' },
    { basic: 'because', better: 'owing to / due to / in that', note: 'owing to/due to 后接名词；in that 引导从句，较正式。', eg: 'The project was delayed owing to a lack of funding.' },
    { basic: 'but', better: 'nevertheless / whereas / yet', note: 'nevertheless 作副词；whereas 连接对比从句。', eg: 'The benefits are clear; nevertheless, the costs remain high.' },
    { basic: 'so', better: 'therefore / consequently / accordingly', note: 'therefore 最常用；consequently 强调结果。', eg: 'Demand rose; consequently, prices increased.' },
    { basic: 'in my opinion', better: 'from my perspective / I would argue that', note: '避免全文重复 in my opinion，可变化表达。', eg: 'From my perspective, the benefits outweigh the risks.' },
    { basic: 'I think', better: 'I contend that / It is my contention that', note: '正式议论文可用，但不宜每段都用。', eg: 'It is my contention that failure teaches more than success.' },
    { basic: 'people', better: 'individuals / the public / citizens', note: '按语境选择：individuals 泛指，the public 指公众，citizens 强调公民身份。', eg: 'Individuals should take responsibility for their data.' },
    { basic: 'old people', better: 'older adults / senior citizens', note: 'older adults 更中性、尊重。', eg: 'Older adults often need support with digital services.' },
    { basic: 'a lot of', better: 'considerable / extensive / substantial', note: '后接不可数名词时尤其适用。', eg: 'The project required considerable investment.' },
    { basic: 'big', better: 'substantial / significant / considerable', note: '修饰影响、增长、差异等抽象名词。', eg: 'There is a significant difference between the two groups.' },
    { basic: 'increase', better: 'rise / grow / surge', note: 'surge 强调急剧上升；rise 可作名词。', eg: 'Demand for electric vehicles has surged.' },
    { basic: 'decrease', better: 'decline / diminish / fall', note: 'decline 可用于数量、质量或健康。', eg: 'Air quality has declined in recent years.' },
    { basic: 'problem', better: 'challenge / issue / obstacle', note: 'challenge 更适合公共议题；obstacle 强调阻碍。', eg: 'Funding remains a major obstacle.' },
    { basic: 'solve', better: 'address / tackle / resolve', note: 'address/tackle a problem 最常用；resolve a conflict 强调化解。', eg: 'The government must tackle youth unemployment.' },
    { basic: 'use', better: 'employ / utilize / harness', note: 'utilize 偏技术；harness 常与 energy/potential 搭配。', eg: 'The region aims to harness solar energy.' },
    { basic: 'need', better: 'require / necessitate', note: 'require 最通用；necessitate 更正式。', eg: 'The reform will necessitate additional training.' },
    { basic: 'find', better: 'identify / discover', note: 'identify 强调识别出；discover 强调首次发现。', eg: 'Researchers identified three key factors.' },
    { basic: 'change', better: 'transform / alter / shift', note: 'transform 强调彻底改变；shift 常指方向或重点转移。', eg: 'Remote work has transformed the office.' },
    { basic: 'keep', better: 'maintain / preserve / sustain', note: 'preserve 强调保护不受破坏；sustain 强调持续。', eg: 'It is difficult to sustain such rapid growth.' },
    { basic: 'start', better: 'initiate / launch / commence', note: 'launch 常与 campaign/programme 搭配。', eg: 'The city launched a recycling campaign.' },
    { basic: 'all over the world', better: 'globally / worldwide', note: '更简洁，适合书面语。', eg: 'The platform is used worldwide.' },
    { basic: 'nowadays', better: 'in contemporary society / at present', note: '避免开头千篇一律用 Nowadays。', eg: 'In contemporary society, digital skills are essential.' },
    { basic: 'in a word', better: 'in short / to sum up', note: 'in a word 也正确，但略显陈词；可轮换使用。', eg: 'In short, the policy needs both funding and patience.' },
    { basic: 'firstly', better: 'to begin with / first and foremost', note: 'first and foremost 强调首要性；to begin with 更自然。', eg: 'To begin with, the cost is prohibitive.' },
    { basic: 'secondly', better: 'furthermore / moreover', note: '递进关系比单纯排序更有逻辑感。', eg: 'Moreover, the benefits are long-lasting.' },
    { basic: 'lastly', better: 'finally / ultimately', note: 'ultimately 强调最终结论。', eg: 'Ultimately, the decision rests with consumers.' },
    { basic: 'as we all know', better: 'it is widely acknowledged that', note: '避免空洞的“众所周知”，用更正式的被动结构。', eg: 'It is widely acknowledged that education shapes opportunity.' },
    { basic: 'play an important role', better: 'play a pivotal / crucial role', note: '替换 important，但不要滥用 pivotal。', eg: 'Parents play a crucial role in shaping habits.' },
    { basic: 'have a great influence on', better: 'exert a profound influence on', note: 'exert ... influence on 是正式搭配。', eg: 'Social media exerts a profound influence on public opinion.' },
    { basic: 'be good for', better: 'be conducive to / benefit', note: 'be conducive to 后接名词或动名词。', eg: 'Regular exercise is conducive to mental health.' },
    { basic: 'be bad for', better: 'be detrimental to / undermine', note: 'undermine 后直接接宾语。', eg: 'Constant criticism undermines confidence.' },
    { basic: 'deal with', better: 'address / cope with / tackle', note: 'address 强调着手处理；cope with 强调应对压力。', eg: 'Cities must address the housing shortage.' },
    { basic: 'get rid of', better: 'eliminate / remove / eradicate', note: 'eradicate 多用于疾病、贫困等长期问题。', eg: 'The campaign aims to eradicate plastic waste.' }
  ];

  C.data.patterns = [
    { cat: '开篇', pattern: 'It is widely acknowledged that ..., yet ...', use: '先承认共识，再用 yet 引出争议，适合议论文开头。', eg: 'It is widely acknowledged that technology improves efficiency, yet its effect on attention is far from settled.' },
    { cat: '开篇', pattern: 'The past decade has witnessed ...', use: '描述趋势变化，后接名词短语。', eg: 'The past decade has witnessed a dramatic rise in online learning.' },
    { cat: '观点', pattern: 'I would argue that ..., not least because ...', use: '明确立场并给出首要理由。', eg: 'I would argue that community service should be encouraged, not least because it builds empathy.' },
    { cat: '观点', pattern: 'While ... has considerable merit, ...', use: '先让步后转折，使立场更稳健。', eg: 'While the proposal has considerable merit, its costs cannot be ignored.' },
    { cat: '论证', pattern: 'A case in point is ..., which ...', use: '引出具体例证并用定语从句说明其意义。', eg: 'A case in point is the four-day week, which improved retention in several trials.' },
    { cat: '论证', pattern: 'This is not merely a matter of ..., but of ...', use: '把讨论从表层提升到更深层。', eg: 'This is not merely a matter of cost, but of fairness.' },
    { cat: '论证', pattern: 'The same logic applies to ...', use: '把论证从一个领域推广到另一个领域。', eg: 'The same logic applies to the way schools assess students.' },
    { cat: '因果', pattern: '..., which in turn ...', use: '表达连锁因果，避免简单罗列。', eg: 'Better transport reduces commuting time, which in turn improves productivity.' },
    { cat: '因果', pattern: '... stems largely from ...', use: '指出根源，比 because 更正式。', eg: 'Public distrust stems largely from a lack of transparency.' },
    { cat: '让步', pattern: 'Admittedly, ...; nevertheless, ...', use: '先承认反方合理之处，再坚持己方观点。', eg: 'Admittedly, regulation can slow innovation; nevertheless, it protects consumers.' },
    { cat: '让步', pattern: 'However compelling ..., it does not follow that ...', use: '承认证据有力，但指出不能推出某个结论。', eg: 'However compelling the data, it does not follow that the policy will work everywhere.' },
    { cat: '建议', pattern: 'A more practical approach is to ...', use: '提出可操作方案，替代空泛呼吁。', eg: 'A more practical approach is to offer short, optional training sessions.' },
    { cat: '建议', pattern: 'It is essential that ... (should) ...', use: '虚拟语气表达必要性，适合正式建议。', eg: 'It is essential that employers should review workload as well as hours.' },
    { cat: '建议', pattern: 'Only when ... will ...', use: 'only + 状语置首倒装，强调条件。', eg: 'Only when cities measure green space in health terms will investment be taken seriously.' },
    { cat: '对比', pattern: 'Whereas ..., ...', use: '连接两个对比分句，正式且紧凑。', eg: 'Whereas print encourages linear reading, screens invite scanning.' },
    { cat: '对比', pattern: 'The more ..., the less ...', use: '表达相关变化趋势。', eg: 'The more frequently people encounter opposing views, the less likely they are to dismiss them.' },
    { cat: '结尾', pattern: 'In short, ... is not ... but ...', use: '结尾重申立场，形成对照。', eg: 'In short, failure is not the enemy of achievement; unexamined failure is.' },
    { cat: '结尾', pattern: 'What ultimately matters is not ... but ...', use: '把结论提升到价值判断层面。', eg: 'What ultimately matters is not the number of hours but the quality of attention.' },
    { cat: '图表', pattern: 'The figures reveal a marked contrast between ... and ...', use: '图表作文描述对比。', eg: 'The figures reveal a marked contrast between urban and rural access.' },
    { cat: '图表', pattern: '..., registering an increase of ... percent', use: '用分词结构补充数据，避免重复主谓。', eg: 'Electric vehicle sales reached 8 million, registering an increase of 35 percent.' }
  ];

  C.data.templates = [
    { id: 'TP1', title: '现象解释型', scene: '社会现象 / 趋势分析',
      opening: 'In recent years, ______ has become increasingly common among ______. This trend has attracted attention from both the public and researchers.',
      body: 'Several factors account for this phenomenon. To begin with, ______. Moreover, ______. These conditions have made ______ more accessible and acceptable than before.',
      closing: 'Whether the trend will continue remains to be seen. What matters is that ______, rather than simply accepting or rejecting it.',
      tip: '结构：现象—原因—评价。原因至少两条，评价要有条件，避免绝对化。' },
    { id: 'TP2', title: '观点论证型', scene: '同意 / 不同意',
      opening: 'It is often argued that ______. While this view has considerable merit, I would contend that ______.',
      body: 'The primary reason is that ______. A case in point is ______, which shows how ______. Admittedly, ______; nevertheless, ______.',
      closing: 'In short, ______. The key is not to ______ but to ______.',
      tip: '结构：引入争议—立场—理由+例证—让步—结论。让步段能显著提升逻辑分。' },
    { id: 'TP3', title: '利弊分析型', scene: '科技 / 政策影响',
      opening: '______ has brought both opportunities and challenges. Its effects are neither uniformly positive nor entirely negative.',
      body: 'On the positive side, ______. For instance, ______. On the other hand, ______. This is particularly true when ______.',
      closing: 'A balanced approach would be to ______. Only in this way can the benefits be realized without ignoring the costs.',
      tip: '利弊要对称：各写两点，避免“利三段、弊一句”。最后给出条件式建议。' },
    { id: 'TP4', title: '问题解决型', scene: '公共议题 / 社会问题',
      opening: '______ has become a pressing issue in many ______. If left unaddressed, it may ______.',
      body: 'The causes are complex. On the one hand, ______. On the other, ______. Therefore, any solution must address both ______ and ______.',
      closing: 'Governments, institutions and individuals all have a role. Specifically, ______. Progress will depend on ______ as much as on ______.',
      tip: '原因与对策要一一对应：每个原因配一个可操作对策，避免“万能建议”。' },
    { id: 'TP5', title: '图表描述型', scene: '数据变化 / 对比',
      opening: 'The chart illustrates changes in ______ between ______ and ______. Overall, ______.',
      body: 'Specifically, ______ rose from ______ to ______, while ______ declined from ______ to ______. The most striking feature is ______.',
      closing: 'These figures suggest that ______. Possible explanations include ______, although further evidence is needed.',
      tip: '先总体趋势，再关键数据，最后简要解释；不要逐条翻译所有数字。' },
    { id: 'TP6', title: '书信 / 通知型', scene: '校园 / 职场应用文',
      opening: 'Dear ______, I am writing to ______ regarding ______.',
      body: 'The purpose of this letter is to ______. Specifically, ______. I would be grateful if you could ______ by ______.',
      closing: 'Thank you for your time and consideration. I look forward to your reply.',
      tip: '开头说明身份与目的，中段给具体信息，结尾礼貌收束；正式书信避免缩写与口语。' }
  ];

  C.data.writingNote = '写作与翻译题库为原创六级仿真材料，范文与参考译文由编者撰写，用于练习与对照，不代表官方答案。';
})();
