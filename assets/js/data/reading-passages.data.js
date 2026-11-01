/* Reading lab — paragraph matching + careful reading */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  C.data = C.data || {};

  C.data.matching = [
    {
      id: 'M1', title: 'The Four-Day Week', topic: '职场 · 社会', difficulty: '进阶',
      intro: '阅读以下文章，将 10 个陈述与段落 A–H 匹配。每个段落可使用多次。',
      paragraphs: [
        { id: 'A', text: "A four-day working week is often described as a radical idea, but its supporters present it as a simple correction. In most trials, employees work four days instead of five while receiving the same pay. The aim is not to compress forty hours into four longer days, but to reduce total working time and test whether output can be maintained. Early advocates argued that shorter hours would force organizations to cut unnecessary meetings and focus on the work that matters." },
        { id: 'B', text: "The most widely cited trials took place in New Zealand and Japan. In one New Zealand firm, staff reported lower stress and fewer sick days, while managers said productivity had held steady or improved. Meetings were shortened, email traffic fell, and employees had more control over when they worked. Similar results appeared in Japan, where a subsidiary of a large company introduced a four-day week for a small group of workers. However, the numbers involved were modest, and most trials lasted less than a year." },
        { id: 'C', text: "Skeptics raise several objections. The firms that join such trials are often self-selected: they are already interested in flexible work and may have cultures that make success more likely. The samples are small, and few studies compare participating firms with similar organizations that did not change their hours. Service industries, where demand must be met continuously, are under-represented. It is therefore difficult to know whether the results would hold across the economy." },
        { id: 'D', text: "Continuous-service sectors face particular difficulties. A hospital cannot close on Fridays, and a restaurant cannot serve four days of customers in three. Scheduling becomes a complex puzzle involving shift patterns, handovers and cover for absence. Some organizations have responded with staggered rotas, so that not everyone is off on the same day. Others have hired additional staff, which can offset the savings from shorter hours. The four-day week may therefore look very different in a care home than in a software company." },
        { id: 'E', text: "Supporters often emphasize wellbeing, and the evidence here is mixed but encouraging. Employees in several trials reported better sleep, less burnout and more time for family life. Yet shorter hours can also intensify work: if the same tasks must be completed in less time, employees may skip breaks or work faster. Some workers reported that the boundary between work and rest became blurred, because they checked messages on their day off. The benefits depend heavily on how workloads are adjusted." },
        { id: 'F', text: "Gender equality is another consideration. Shorter hours could redistribute unpaid care work, which still falls disproportionately on women. If a couple both work four days, the burden may be shared more evenly. But if flexibility is negotiated individually, women may be more likely to reduce their hours and less likely to be considered for promotion. Collective agreements, rather than individual deals, may be needed to prevent flexible work from becoming a source of disadvantage." },
        { id: 'G', text: "Governments have a role, but it is smaller than some campaigners suggest. Few countries are prepared to mandate a four-day week for all employers. More common are public-sector pilots, tax incentives for firms that experiment, and legal rights to request flexible working. These measures encourage experimentation without imposing a single model on every industry. The results of such pilots can also provide evidence that private firms would not generate on their own." },
        { id: 'H', text: "Looking ahead, hybrid work and automation may change the terms of the debate. If routine tasks are increasingly performed by machines, the question may become how to share the remaining work rather than how to fit it into five days. Some researchers argue that the focus on the number of days is misplaced. What matters, they suggest, is control over working time: the ability to choose when and where work happens, and to disconnect without penalty. That question is likely to remain relevant whatever the length of the working week." }
      ],
      statements: [
        { id: 'M1S1', text: 'The trials tried to cut working hours without cutting pay.', keywords: ['cut working hours', 'without cutting pay'], answer: 'A', evidence: 'In most trials, employees work four days instead of five while receiving the same pay.', explain: 'A 段明确说明：多数试验中员工工作四天但领取相同薪酬。' },
        { id: 'M1S2', text: 'Some firms reported fewer sick days and shorter meetings.', keywords: ['fewer sick days', 'shorter meetings'], answer: 'B', evidence: 'Staff reported lower stress and fewer sick days ... Meetings were shortened.', explain: 'B 段列举了新西兰试验的结果：病假减少、会议缩短、邮件量下降。' },
        { id: 'M1S3', text: 'Critics argue that participating firms are not representative.', keywords: ['participating firms', 'not representative'], answer: 'C', evidence: 'The firms that join such trials are often self-selected ... The samples are small.', explain: 'C 段指出参与企业自我选择、样本小，因此代表性不足。' },
        { id: 'M1S4', text: 'Continuous-service industries face complicated scheduling.', keywords: ['Continuous-service industries', 'complicated scheduling'], answer: 'D', evidence: 'Scheduling becomes a complex puzzle involving shift patterns, handovers and cover for absence.', explain: 'D 段以医院和餐厅为例，说明连续服务行业排班复杂。' },
        { id: 'M1S5', text: 'Shorter hours may improve sleep but can make work more intense.', keywords: ['improve sleep', 'more intense'], answer: 'E', evidence: 'Employees ... reported better sleep ... Yet shorter hours can also intensify work.', explain: 'E 段指出睡眠改善，但同时工作强度可能上升。' },
        { id: 'M1S6', text: 'Individual flexibility deals may disadvantage women.', keywords: ['Individual flexibility', 'disadvantage women'], answer: 'F', evidence: 'If flexibility is negotiated individually, women may be more likely to reduce their hours and less likely to be considered for promotion.', explain: 'F 段警告：若弹性工作由个人协商，女性可能承担更多照护并失去晋升机会。' },
        { id: 'M1S7', text: 'Governments tend to encourage pilots rather than impose a universal rule.', keywords: ['encourage pilots', 'universal rule'], answer: 'G', evidence: 'More common are public-sector pilots, tax incentives ... without imposing a single model on every industry.', explain: 'G 段说明政府更多采用试点与激励，而非强制统一模式。' },
        { id: 'M1S8', text: 'The debate should focus on control over time, not only the number of days.', keywords: ['control over time', 'number of days'], answer: 'H', evidence: 'What matters, they suggest, is control over working time.', explain: 'H 段提出关键不在工作天数，而在对工作时间的掌控。' },
        { id: 'M1S9', text: 'Most trials involved organizations that chose to participate.', keywords: ['chose to participate'], answer: 'C', evidence: 'The firms that join such trials are often self-selected.', explain: 'C 段再次指出参与企业是自我选择的，这是对试验代表性的质疑。' },
        { id: 'M1S10', text: 'Sharing unpaid care work more evenly is one possible benefit.', keywords: ['care work', 'more evenly'], answer: 'F', evidence: 'Shorter hours could redistribute unpaid care work ... the burden may be shared more evenly.', explain: 'F 段指出缩短工时可能让无偿照护更平均地分配。' }
      ]
    },
    {
      id: 'M2', title: 'The Right to Repair', topic: '消费 · 环境', difficulty: '进阶',
      intro: '阅读以下文章，将 10 个陈述与段落 A–H 匹配。每个段落可使用多次。',
      paragraphs: [
        { id: 'A', text: "The right to repair is a simple idea with broad implications. If you buy a product, you should be able to fix it, or pay someone else to fix it, without being blocked by the manufacturer. Laws based on this principle require companies to provide spare parts, tools and repair manuals for a set number of years. Supporters say the rules reduce electronic waste and give consumers more control over the products they own." },
        { id: 'B', text: "Product design is at the heart of the problem. Many devices are held together with glue rather than screws, and batteries are sealed inside cases that cannot be opened without special equipment. Some components are paired electronically with the original device, so replacing them requires software authorization. Manufacturers argue that these choices protect safety and performance. Critics reply that they also make repair unnecessarily expensive or impossible." },
        { id: 'C', text: "The economic case for repair is often framed in terms of jobs. Repair shops are labor-intensive and rooted in local communities, so money spent on repair tends to stay in the area. A study of one American state estimated that a repair-friendly law could create thousands of jobs. Manufacturers counter that longer product lives and repairable designs may reduce sales, and that innovation depends on revenue from new products. The dispute is partly about how costs and benefits are counted." },
        { id: 'D', text: "Consumer behavior is another obstacle. Even when repair is possible, many people replace products because it is quicker, simpler or not much more expensive. Repair cafés and libraries of things have emerged to change these habits, offering tools, advice and social contact. Their growth suggests that convenience is not the only value people care about. Yet they remain small-scale compared with the volume of products discarded every year." },
        { id: 'E', text: "Environmental arguments are more complicated than they first appear. Extending the life of a product usually reduces the energy and materials needed to make a new one. But repair itself requires parts, transport and labor, and an old appliance may be less efficient than a new one. The net benefit depends on what is repaired, how often it is used and where the replacement would have come from. Simple slogans about waste can obscure these trade-offs." },
        { id: 'F', text: "The movement has spread beyond consumer electronics. Farmers want the right to repair tractors and access diagnostic software, while hospitals have raised concerns about manufacturers restricting repairs of medical equipment. Industry groups warn that unauthorized repairs could compromise safety or security, especially for devices connected to the internet. Legislators have therefore debated exemptions for certain products, balancing consumer rights against other risks." },
        { id: 'G', text: "Policy approaches differ widely. The European Union has introduced rules covering several categories of products, while in the United States, action has mostly occurred at the state level. This patchwork creates compliance costs for companies that sell across borders. It also creates opportunities for jurisdictions to experiment. Some analysts expect national rules to emerge eventually, but the timing and scope remain uncertain." },
        { id: 'H', text: "Skills are an overlooked part of the picture. A right to repair is of little use if there are not enough people able to do the work. Vocational programs for repair technicians have declined in some countries, even as demand for their services grows. Community colleges and apprenticeship schemes are beginning to respond, but training takes time. The repair economy, in other words, depends on more than a legal right; it depends on people with the skills to exercise it." }
      ],
      statements: [
        { id: 'M2S1', text: 'The laws aim to give buyers access to spare parts, tools and manuals.', keywords: ['spare parts', 'tools', 'manuals'], answer: 'A', evidence: 'Laws ... require companies to provide spare parts, tools and repair manuals.', explain: 'A 段直接列出法律要求厂商提供的配件、工具和维修手册。' },
        { id: 'M2S2', text: 'Design choices such as glued cases can make repair difficult.', keywords: ['glue', 'sealed inside'], answer: 'B', evidence: 'Many devices are held together with glue rather than screws, and batteries are sealed inside cases.', explain: 'B 段说明胶水粘合、电池封死等设计使维修困难。' },
        { id: 'M2S3', text: 'Repair work can keep money within the local economy.', keywords: ['local communities', 'stay in the area'], answer: 'C', evidence: 'Repair shops are labor-intensive and rooted in local communities, so money spent on repair tends to stay in the area.', explain: 'C 段强调维修店扎根社区，维修支出更容易留在本地。' },
        { id: 'M2S4', text: 'Many consumers replace products because it is quicker and easier.', keywords: ['quicker, simpler'], answer: 'D', evidence: 'Many people replace products because it is quicker, simpler or not much more expensive.', explain: 'D 段指出便利与价格是消费者选择更换而非维修的原因。' },
        { id: 'M2S5', text: 'Community repair initiatives offer tools, advice and social contact.', keywords: ['Repair cafés', 'tools, advice and social contact'], answer: 'D', evidence: 'Repair cafés and libraries of things ... offering tools, advice and social contact.', explain: 'D 段介绍维修咖啡馆与“物品图书馆”提供工具、建议和社交机会。' },
        { id: 'M2S6', text: 'The environmental benefit of repair depends on how a product is used.', keywords: ['how often it is used'], answer: 'E', evidence: 'The net benefit depends on what is repaired, how often it is used and where the replacement would have come from.', explain: 'E 段说明净收益取决于维修对象、使用频率及替代品来源。' },
        { id: 'M2S7', text: 'Some industries cite safety and security to justify repair restrictions.', keywords: ['safety or security'], answer: 'F', evidence: 'Industry groups warn that unauthorized repairs could compromise safety or security.', explain: 'F 段指出行业团体以安全与网络安全为由反对不受限制的维修。' },
        { id: 'M2S8', text: 'Different regional rules create costs for companies selling across borders.', keywords: ['patchwork', 'compliance costs', 'across borders'], answer: 'G', evidence: 'This patchwork creates compliance costs for companies that sell across borders.', explain: 'G 段指出各地规则不一，跨国销售企业面临合规成本。' },
        { id: 'M2S9', text: 'A shortage of trained technicians can limit the impact of repair rights.', keywords: ['shortage', 'technicians'], answer: 'H', evidence: 'A right to repair is of little use if there are not enough people able to do the work ... Vocational programs ... have declined.', explain: 'H 段强调若缺少合格技师，维修权的作用有限。' },
        { id: 'M2S10', text: 'Manufacturers argue that repairable products may reduce sales.', keywords: ['reduce sales', 'Manufacturers counter'], answer: 'C', evidence: 'Manufacturers counter that longer product lives and repairable designs may reduce sales.', explain: 'C 段给出制造商的反驳：产品寿命延长可能减少销量。' }
      ]
    }
  ];

  C.data.careful = [
    {
      id: 'R1', title: 'Reading on Screens, Thinking in Fragments', topic: '教育 · 媒体', difficulty: '进阶',
      wordCount: 410,
      intro: '数字阅读已成为默认方式，但“深读”能力正面临什么？',
      paragraphs: [
        { id: 'P1', sentences: [
          { id: 'r1p1s1', en: "Digital reading has become the default for many students, but the convenience it offers may carry a hidden cost." },
          { id: 'r1p1s2', en: "Studies that compare screen and paper reading often find a small advantage for paper when comprehension is tested." },
          { id: 'r1p1s3', en: "The difference is not about the medium itself, but about the habits the medium encourages." },
          { id: 'r1p1s4', en: "On a screen, readers tend to skim, jump between tabs, and check notifications; with print, they are more likely to follow an argument from beginning to end." }
        ] },
        { id: 'P2', sentences: [
          { id: 'r1p2s1', en: "This matters because deep reading is not simply slow reading." },
          { id: 'r1p2s2', en: "It involves holding a complex argument in mind, connecting it with prior knowledge, and noticing when an author's evidence does not support a claim." },
          { id: 'r1p2s3', en: "These are precisely the skills that academic work and informed citizenship require." },
          { id: 'r1p2s4', en: "If students practice only rapid scanning, they may become efficient at finding information but poor at evaluating it." }
        ] },
        { id: 'P3', sentences: [
          { id: 'r1p3s1', en: "Some researchers argue that the problem lies not in screens but in how reading is taught." },
          { id: 'r1p3s2', en: "When students are given clear purposes and asked to annotate, summarize or discuss what they read, the medium makes little difference." },
          { id: 'r1p3s3', en: "In one experiment, students who read a difficult text on a tablet and wrote a short summary performed as well as those who read it on paper." },
          { id: 'r1p3s4', en: "The act of processing, rather than the surface, seemed to drive comprehension." }
        ] },
        { id: 'P4', sentences: [
          { id: 'r1p4s1', en: "Yet the wider environment remains hostile to sustained attention." },
          { id: 'r1p4s2', en: "Platforms are designed to interrupt, and reading apps compete with messages and short videos for the same device." },
          { id: 'r1p4s3', en: "Even motivated readers must repeatedly resist the pull of notifications." },
          { id: 'r1p4s4', en: "That effort is invisible but real, and it may leave less mental energy for the text itself." }
        ] },
        { id: 'P5', sentences: [
          { id: 'r1p5s1', en: "The solution is unlikely to be a nostalgic return to print." },
          { id: 'r1p5s2', en: "A more practical approach is to design reading environments that protect attention: dedicated apps without feeds, assigned periods of silence, and assignments that reward reflection rather than speed." },
          { id: 'r1p5s3', en: "The goal is not to reject digital tools but to ensure that they serve the kind of reading we value." }
        ] }
      ],
      questions: [
        { id: 'R1Q1', q: 'According to Paragraph 1, the difference between screen and paper reading mainly comes from', options: ['the quality of digital screens', 'the reading habits each medium encourages', 'the cost of printed materials', 'the availability of reading devices'], answer: 1, type: 'detail', evidence: { p: 0, s: 2 }, explain: '原文明确说差异“不在于媒介本身，而在于媒介所鼓励的习惯”。', cause: '定位错误' },
        { id: 'R1Q2', q: 'What is the author’s central argument?', options: ['Printed books should replace digital reading.', 'Deep reading needs protected attention and deliberate teaching.', 'Students read too slowly on paper.', 'Digital reading is always inferior to print.'], answer: 1, type: 'main', evidence: { p: 4, s: 2 }, explain: '全文既不否定数字工具，也强调深读需要注意力保护与教学策略；结尾点明目标。', cause: '过度推断' },
        { id: 'R1Q3', q: 'The tablet experiment in Paragraph 3 suggests that', options: ['paper is always better for difficult texts', 'writing summaries can replace careful reading', 'processing strategies matter more than the medium', 'students prefer tablets to printed books'], answer: 2, type: 'infer', evidence: { p: 2, s: 3 }, explain: '实验显示写摘要的平板阅读者与纸质阅读者表现相当，说明“加工过程”比载体更重要。', cause: '同义替换未识别' },
        { id: 'R1Q4', q: 'The word “hostile” in Paragraph 4 is closest in meaning to', options: ['unfamiliar', 'unfriendly', 'expensive', 'changeable'], answer: 1, type: 'vocab', evidence: { p: 3, s: 0 }, explain: 'hostile 在此表示环境“不友好、充满干扰”，并非“敌对的战争含义”。', cause: '词汇不认识' },
        { id: 'R1Q5', q: 'What is the author’s attitude towards digital reading tools?', options: ['Complete opposition', 'Selective and cautiously optimistic', 'Indifference', 'Uncritical enthusiasm'], answer: 1, type: 'attitude', evidence: { p: 4, s: 2 }, explain: '作者主张设计合适的数字阅读环境，而非拒绝工具，因此是“有选择地审慎乐观”。', cause: '过度推断' }
      ]
    },
    {
      id: 'R2', title: 'In Praise of Messy Parks', topic: '环境 · 城市', difficulty: '进阶',
      wordCount: 395,
      intro: '修剪整齐的公园一定更好吗？生态学家与景观设计师正在重新审视“杂乱”。',
      paragraphs: [
        { id: 'P1', sentences: [
          { id: 'r2p1s1', en: "For decades, urban parks were designed to look tidy: short grass, trimmed hedges and clear sightlines." },
          { id: 'r2p1s2', en: "Recently, some landscape architects have begun to argue that this aesthetic may be ecologically expensive." },
          { id: 'r2p1s3', en: "A lawn that is mowed every week supports few insects and absorbs little rainwater." },
          { id: 'r2p1s4', en: "A patch of tall grass and native flowers, by contrast, can support pollinators and hold water during storms." }
        ] },
        { id: 'P2', sentences: [
          { id: 'r2p2s1', en: "The idea is sometimes called rewilding, although the term covers a wide range of practices." },
          { id: 'r2p2s2', en: "In cities, it rarely means reintroducing large animals." },
          { id: 'r2p2s3', en: "More often, it involves allowing parts of parks to grow freely, planting native species, and reducing the use of pesticides." },
          { id: 'r2p2s4', en: "The approach can be cheap, because it requires less maintenance than a formal garden." },
          { id: 'r2p2s5', en: "However, it can also provoke resistance from residents who associate tall grass with neglect." }
        ] },
        { id: 'P3', sentences: [
          { id: 'r2p3s1', en: "That resistance is not merely aesthetic." },
          { id: 'r2p3s2', en: "People value parks for many reasons: sports, picnics, meetings with friends, and a sense of safety." },
          { id: 'r2p3s3', en: "Dense vegetation can make some paths feel less secure, especially after dark." },
          { id: 'r2p3s4', en: "Planners who ignore these concerns may find that a project wins ecological praise but loses public support." },
          { id: 'r2p3s5', en: "Successful schemes often combine wild areas with clearly maintained paths and visible signs explaining the purpose of the planting." }
        ] },
        { id: 'P4', sentences: [
          { id: 'r2p4s1', en: "Evidence on the ecological benefits is promising but uneven." },
          { id: 'r2p4s2', en: "Studies have found more pollinators and greater water retention in wilder plots, yet the effects depend on location, soil and the surrounding landscape." },
          { id: 'r2p4s3', en: "A small patch surrounded by concrete may not sustain a population of bees." },
          { id: 'r2p4s4', en: "Connections between habitats matter, which means that isolated projects are unlikely to deliver large benefits on their own." }
        ] },
        { id: 'P5', sentences: [
          { id: 'r2p5s1', en: "The broader lesson is that urban nature is not a decoration to be added after planning is complete." },
          { id: 'r2p5s2', en: "It is infrastructure that must be connected, maintained and understood by the people who live beside it." },
          { id: 'r2p5s3', en: "That requires ecologists, designers and residents to work together, and it requires patience: a meadow takes time to establish, and public attitudes take even longer." }
        ] }
      ],
      questions: [
        { id: 'R2Q1', q: 'Traditional urban parks were mainly designed to', options: ['maximize biodiversity', 'look tidy and provide clear sightlines', 'reduce maintenance costs', 'collect rainwater'], answer: 1, type: 'detail', evidence: { p: 0, s: 0 }, explain: '首段首句列出传统公园的审美标准：短草、修剪的树篱、清晰的视线。', cause: '定位错误' },
        { id: 'R2Q2', q: 'Why can rewilding be relatively cheap?', options: ['It attracts more visitors.', 'It requires less maintenance than a formal garden.', 'It uses fewer native plants.', 'It receives more public funding.'], answer: 1, type: 'detail', evidence: { p: 1, s: 3 }, explain: '第二段明确：这种做法比正式花园需要的维护更少，因此成本较低。', cause: '信息遗漏' },
        { id: 'R2Q3', q: 'What does the author suggest about residents’ resistance?', options: ['It is irrational and should be ignored.', 'It is understandable and should shape design and communication.', 'It is limited to wealthy neighbourhoods.', 'It disappears once wildflowers bloom.'], answer: 1, type: 'infer', evidence: { p: 2, s: 4 }, explain: '作者认为抵抗不只是审美问题，还涉及安全与使用；成功方案会把野性区域与清晰步道、说明标识结合。', cause: '过度推断' },
        { id: 'R2Q4', q: 'The word “uneven” in Paragraph 4 most nearly means', options: ['flat', 'inconsistent', 'declining', 'convincing'], answer: 1, type: 'vocab', evidence: { p: 3, s: 0 }, explain: '后文说效果取决于地点、土壤与周边景观，说明证据“不一致、参差不齐”。', cause: '词汇不认识' },
        { id: 'R2Q5', q: 'What is the main message of the passage?', options: ['Cities should replace all lawns with wild meadows.', 'Urban nature should be treated as connected infrastructure planned with residents.', 'Ecological benefits are too uncertain to justify rewilding.', 'Tall grass always makes parks safer.'], answer: 1, type: 'main', evidence: { p: 4, s: 1 }, explain: '结尾把城市自然定义为需要连接、维护并被居民理解的基础设施，强调协作与耐心。', cause: '过度推断' }
      ]
    },
    {
      id: 'R3', title: 'The Skills Premium Reconsidered', topic: '教育 · 经济', difficulty: '进阶',
      wordCount: 405,
      intro: '大学学位仍然是最稳妥的路吗？文章重新审视“技能溢价”与职业教育。',
      paragraphs: [
        { id: 'P1', sentences: [
          { id: 'r3p1s1', en: "For much of the past two decades, policymakers have told young people that a university degree is the safest route to a good job." },
          { id: 'r3p1s2', en: "The advice was supported by a persistent earnings gap: graduates, on average, earn more than non-graduates." },
          { id: 'r3p1s3', en: "But averages can hide as much as they reveal." },
          { id: 'r3p1s4', en: "The gap varies enormously by subject, institution and region, and it has narrowed in some occupations." }
        ] },
        { id: 'P2', sentences: [
          { id: 'r3p2s1', en: "At the same time, demand for skilled trades has grown." },
          { id: 'r3p2s2', en: "Electricians, plumbers and technicians are aging out of the workforce in many countries, while the energy transition creates new jobs that require technical training." },
          { id: 'r3p2s3', en: "Some employers now report that they cannot fill vacancies even when graduates are available, because the graduates lack practical skills." },
          { id: 'r3p2s4', en: "This is not an argument against university education; it is an argument against treating it as the only respectable path." }
        ] },
        { id: 'P3', sentences: [
          { id: 'r3p3s1', en: "Vocational systems in countries such as Germany and Switzerland are often held up as models." },
          { id: 'r3p3s2', en: "They combine classroom learning with paid apprenticeships, and they involve employers in designing curricula." },
          { id: 'r3p3s3', en: "Their success, however, depends on more than institutional design." },
          { id: 'r3p3s4', en: "It depends on the status that society attaches to technical work, and on the willingness of employers to invest in young people over many years." }
        ] },
        { id: 'P4', sentences: [
          { id: 'r3p4s1', en: "Critics of the skills premium point to another issue: the cost of a degree." },
          { id: 'r3p4s2', en: "In countries where tuition is high, students may take on debt that shapes their career choices for decades." },
          { id: 'r3p4s3', en: "They may avoid lower-paid public-interest work, delay buying homes, or accept jobs for which they are overqualified." },
          { id: 'r3p4s4', en: "These effects are difficult to measure, but they are real." }
        ] },
        { id: 'P5', sentences: [
          { id: 'r3p5s1', en: "The policy implication is not that everyone should attend vocational school, or that universities should be defunded." },
          { id: 'r3p5s2', en: "It is that the choice between academic and technical education should be informed, reversible and supported at both ends." },
          { id: 'r3p5s3', en: "Young people need better information about earnings and working conditions, and adults need opportunities to retrain." },
          { id: 'r3p5s4', en: "A system that treats a degree as a one-way ticket is poorly designed for an economy that keeps changing." }
        ] }
      ],
      questions: [
        { id: 'R3Q1', q: 'Why does the author say “averages can hide as much as they reveal”?', options: ['Because graduates no longer earn more than non-graduates.', 'Because the earnings gap differs by subject, institution and region.', 'Because most graduates are unemployed.', 'Because salaries are rarely reported accurately.'], answer: 1, type: 'detail', evidence: { p: 0, s: 3 }, explain: '紧接的下一句给出解释：收入差距因专业、院校与地区而差异巨大。', cause: '定位错误' },
        { id: 'R3Q2', q: 'Why can some employers fail to fill vacancies?', options: ['Too few people have degrees.', 'Graduates lack practical skills.', 'Wages in skilled trades are falling.', 'Apprenticeships are too expensive.'], answer: 1, type: 'detail', evidence: { p: 1, s: 2 }, explain: '原文指出雇主招不到人，是因为毕业生缺乏实践技能。', cause: '信息遗漏' },
        { id: 'R3Q3', q: 'The success of German and Swiss vocational systems depends on', options: ['strict national examinations', 'the social status of technical work and employer investment', 'the absence of universities', 'high tuition fees'], answer: 1, type: 'infer', evidence: { p: 2, s: 3 }, explain: '第三段末指出，成功不仅靠制度设计，还取决于技术工作的社会地位与雇主长期投入。', cause: '同义替换未识别' },
        { id: 'R3Q4', q: 'The word “overqualified” in Paragraph 4 means', options: ['having more education than a job requires', 'being too old for a position', 'lacking the required certificates', 'refusing to accept promotion'], answer: 0, type: 'vocab', evidence: { p: 3, s: 2 }, explain: 'overqualified 指学历或资历高于岗位要求；语境是毕业生接受低于自身资历的工作。', cause: '词汇不认识' },
        { id: 'R3Q5', q: 'What does the author advocate?', options: ['Defunding universities to support vocational schools', 'Making academic and technical pathways informed, reversible and supported', 'Requiring all students to attend vocational school', 'Removing earnings information from career advice'], answer: 1, type: 'main', evidence: { p: 4, s: 1 }, explain: '作者主张两条路径都应有充分信息、可逆且得到支持，而非二选一。', cause: '过度推断' }
      ]
    }
  ];

  C.data.readingMeta = {
    longSentenceCount: 12,
    clozeCount: 2,
    matchingCount: 2,
    carefulCount: 3,
    note: '所有阅读篇目与长难句均为原创六级仿真材料，题目与解析由编者设计。'
  };
})();
