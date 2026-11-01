/* Six original CET-6 style listening sets — 25 questions total */
(function () {
  'use strict';
  const C = window.CET6 = window.CET6 || {};
  C.data = C.data || {};

  C.data.listening = [
    {
      id: 'L1', type: 'conversation', title: 'The Newsroom Placement', scene: '校园 · 求职',
      level: '基础—进阶', intro: '一名新闻专业学生向职业顾问询问暑期实习的申请进展。',
      script: [
        { spk: 'W', en: 'Good morning, Mr. Hall. I am here about the summer internship programme.', zh: '早上好，霍尔先生。我来咨询暑期实习项目的事。' },
        { spk: 'M', en: 'Of course. You must be Laura, from the journalism school.', zh: '当然，你一定是新闻学院的劳拉吧。' },
        { spk: 'W', en: 'Yes. I applied for the newsroom placement, but I have not heard anything yet.', zh: '是的。我申请了新闻编辑室的实习岗位，但还没有收到任何消息。' },
        { spk: 'M', en: 'The selection process took longer than expected because we received nearly four hundred applications.', zh: '遴选过程比预期更久，因为我们收到了近四百份申请。', signals: [{ word: 'because', type: 'cause' }] },
        { spk: 'W', en: 'That is a lot. Does that mean the chances are slim?', zh: '这么多。那是不是意味着希望渺茫？' },
        { spk: 'M', en: 'Not necessarily. What matters most is not your grades but whether you can show evidence of original reporting.', zh: '不一定。最重要的不是成绩，而是你能否拿出原创报道的证据。', signals: [{ word: 'but', type: 'contrast' }, { word: 'What matters most', type: 'emphasis' }] },
        { spk: 'W', en: 'I have written for the student newspaper for two years, mostly profiles of local businesses.', zh: '我为校报写了两年稿，主要是本地商户的人物报道。' },
        { spk: 'M', en: 'That is relevant, but newsrooms want stories that reveal something new. Do you have an example?', zh: '这相关，但新闻编辑室想要能揭示新事物的报道。你有例子吗？', signals: [{ word: 'but', type: 'contrast' }] },
        { spk: 'W', en: 'I did a piece on how a local market adapted to online shopping. It took three weeks of interviews.', zh: '我写过一篇关于本地市场如何适应网络购物的报道，花了三周做采访。' },
        { spk: 'M', en: 'That is exactly the kind of persistence we look for. Send it to me before Friday, and I will pass it on to the editors.', zh: '这正是我们要找的那种坚持。周五之前把它发给我，我会转给编辑。', signals: [{ word: 'exactly', type: 'emphasis' }] },
        { spk: 'W', en: 'Thank you. Should I also include a reference from my editor?', zh: '谢谢。我还需要附上编辑的推荐信吗？' },
        { spk: 'M', en: 'It will not hurt, but the story itself matters more.', zh: '附上也无妨，但报道本身更重要。', signals: [{ word: 'but', type: 'contrast' }] }
      ],
      questions: [
        { id: 'L1Q1', q: 'Why has Laura not heard from the programme yet?', options: ['The applications are still being reviewed.', 'She missed the application deadline.', 'The programme has been cancelled.', 'Her grades were considered too low.'], answer: 0, type: '细节', evidence: 3, explain: '男士说收到近四百份申请，遴选过程比预期更久，因此结果尚未公布。', cause: '信息遗漏' },
        { id: 'L1Q2', q: 'According to Mr. Hall, what matters most in the application?', options: ['Academic grades', 'Evidence of original reporting', 'A reference from an editor', 'Previous internship experience'], answer: 1, type: '细节', evidence: 5, explain: '“What matters most is not your grades but whether you can show evidence of original reporting.” 关键在 but 后的内容。', cause: '信号词未捕捉' },
        { id: 'L1Q3', q: 'What does Laura’s story about the local market demonstrate?', options: ['Her ability to meet tight deadlines', 'Her willingness to do sustained reporting', 'Her knowledge of online business', 'Her talent for photography'], answer: 1, type: '推断', evidence: 9, explain: '报道花了三周采访，男士称这正是“persistence”，可推知她愿意做持续的报道工作。', cause: '过度推断' },
        { id: 'L1Q4', q: 'What should Laura do before Friday?', options: ['Send her story to Mr. Hall', 'Contact the editors directly', 'Rewrite her editor’s reference', 'Apply for a different placement'], answer: 0, type: '细节', evidence: 9, explain: '男士明确要求她周五前把报道发给他，由他转交编辑。', cause: '信息遗漏' }
      ]
    },
    {
      id: 'L2', type: 'conversation', title: 'A Rent Increase', scene: '生活 · 租房',
      level: '进阶', intro: '两位朋友讨论房东涨租与房屋维修问题。',
      script: [
        { spk: 'M', en: 'Hi Nina, did you see the email about the rent increase?', zh: '嗨，妮娜，你看到涨租的邮件了吗？' },
        { spk: 'W', en: 'Yes, eight percent from next month. That is steep, considering the heating has been broken since January.', zh: '看到了，下个月起涨百分之八。考虑到暖气从一月就坏了，这涨幅太高了。', signals: [{ word: 'considering', type: 'cause' }] },
        { spk: 'M', en: 'Have you talked to the landlord?', zh: '你跟房东谈过了吗？' },
        { spk: 'W', en: 'I tried. He says the increase is necessary because of rising maintenance costs.', zh: '试过了。他说由于维修成本上升，涨租是必要的。', signals: [{ word: 'because', type: 'cause' }] },
        { spk: 'M', en: 'But he has not fixed anything. The lease says repairs should be completed within two weeks.', zh: '但他什么都没修。租约写明维修应在两周内完成。', signals: [{ word: 'But', type: 'contrast' }] },
        { spk: 'W', en: 'I know. I am thinking of contacting the tenants’ union. A friend got her deposit back that way.', zh: '我知道。我在考虑联系租客工会。有个朋友就是那样拿回押金的。' },
        { spk: 'M', en: 'That might work, but it could take months. Have you considered negotiating instead?', zh: '那也许有用，但可能要花好几个月。你有没有考虑过直接协商？', signals: [{ word: 'but', type: 'contrast' }] },
        { spk: 'W', en: 'What do you mean?', zh: '你是什么意思？' },
        { spk: 'M', en: 'Offer to accept a smaller increase if he fixes the heating and renews the lease for two years.', zh: '提出如果他把暖气修好并续签两年租约，你愿意接受较小的涨幅。' },
        { spk: 'W', en: 'That gives him an incentive to act. But do I have to accept whatever he offers?', zh: '这确实给了他行动的动力。但我就必须接受他提出的任何条件吗？', signals: [{ word: 'But', type: 'contrast' }] },
        { spk: 'M', en: 'No. You can propose the terms in writing and ask for a reply within a week.', zh: '不必。你可以书面提出条件，并要求一周内答复。' },
        { spk: 'W', en: 'All right. I will draft an email tonight and send you a copy.', zh: '好。我今晚起草邮件，发一份给你。' },
        { spk: 'M', en: 'Good. Keep the tone polite but firm. A written record helps if it goes to a dispute.', zh: '好。语气要礼貌而坚定。如果闹到纠纷，书面记录会有帮助。', signals: [{ word: 'but', type: 'contrast' }] }
      ],
      questions: [
        { id: 'L2Q1', q: 'What is the woman’s main complaint?', options: ['The landlord has raised the rent without fixing the heating.', 'The lease does not allow any rent increase.', 'The tenants’ union has ignored her request.', 'Her deposit was returned too late.'], answer: 0, type: '细节', evidence: 1, explain: '女士把涨租与“暖气从一月就坏了”并列，核心不满是涨租却不维修。', cause: '信息遗漏' },
        { id: 'L2Q2', q: 'What does the man suggest the woman do?', options: ['Move out before the end of the month', 'Negotiate a smaller increase in exchange for repairs', 'Refuse to pay any rent until the heating is fixed', 'Report the landlord to the tenants’ union'], answer: 1, type: '细节', evidence: 8, explain: '男士建议：接受较小涨幅，换取维修与两年续租。', cause: '同义替换未识别' },
        { id: 'L2Q3', q: 'Why does the woman mention the tenants’ union?', options: ['It helped a friend recover a deposit.', 'It has already agreed to represent her.', 'It charges lower membership fees.', 'It manages the building’s repairs.'], answer: 0, type: '细节', evidence: 5, explain: '女士说朋友通过租客工会拿回了押金，因此她在考虑联系工会。', cause: '信息遗漏' },
        { id: 'L2Q4', q: 'What does the man advise about the email?', options: ['Send it to the union rather than the landlord', 'Keep it short and informal', 'Use a polite but firm tone and keep a record', 'Threaten legal action immediately'], answer: 2, type: '细节', evidence: 12, explain: '男士强调礼貌而坚定，并保留书面记录以备纠纷。', cause: '信号词未捕捉' }
      ]
    },
    {
      id: 'L3', type: 'passage', title: 'The Cooling Power of Urban Trees', scene: '科学 · 城市',
      level: '进阶', intro: '一项研究测量城市树木的降温效果，并给出规划建议。',
      script: [
        { spk: 'N', en: 'Trees are often described as the lungs of a city, but their role in cooling urban streets is now attracting attention from engineers as well as ecologists.', zh: '树木常被称为城市之肺，但它们在降低城市街道温度方面的作用正吸引工程师和生态学家的关注。', signals: [{ word: 'but', type: 'contrast' }] },
        { spk: 'N', en: 'A recent study measured temperatures in twelve neighbourhoods during a summer heatwave.', zh: '最近一项研究在夏季热浪期间测量了十二个街区的温度。' },
        { spk: 'N', en: 'Streets lined with mature trees were on average three degrees cooler than bare streets nearby.', zh: '两旁种有成熟树木的街道，平均比附近没有树木的街道低三度。' },
        { spk: 'N', en: 'The difference was greatest in the afternoon, when shade prevented asphalt from storing heat.', zh: '差异在下午最大，因为树荫阻止沥青储存热量。' },
        { spk: 'N', en: 'However, the researchers found that newly planted trees provided almost no cooling during their first five years.', zh: '然而，研究者发现新栽树木在最初五年几乎不提供降温效果。', signals: [{ word: 'However', type: 'contrast' }] },
        { spk: 'N', en: 'This is because young trees have small canopies and shallow roots.', zh: '这是因为幼树树冠小、根系浅。', signals: [{ word: 'because', type: 'cause' }] },
        { spk: 'N', en: 'The team therefore argues that cities should protect existing trees rather than simply count how many new ones are planted.', zh: '因此，团队主张城市应保护现有树木，而不是只统计新栽了多少棵。', signals: [{ word: 'therefore', type: 'cause' }, { word: 'rather than', type: 'contrast' }] },
        { spk: 'N', en: 'They also suggest planting species that tolerate drought, since water shortages are likely to become more common.', zh: '他们还建议种植耐旱树种，因为水资源短缺可能会更常见。', signals: [{ word: 'since', type: 'cause' }] },
        { spk: 'N', en: 'Critics point out that trees alone cannot replace investment in public transport and building design.', zh: '批评者指出，仅靠树木无法替代对公共交通和建筑设计的投资。' },
        { spk: 'N', en: 'Still, the study offers a practical reason to treat urban trees as infrastructure rather than decoration.', zh: '尽管如此，这项研究为把城市树木视为基础设施而非装饰提供了现实理由。', signals: [{ word: 'Still', type: 'contrast' }] }
      ],
      questions: [
        { id: 'L3Q1', q: 'What is the main finding of the study?', options: ['Mature trees cool streets much more effectively than newly planted ones.', 'Trees have no measurable effect on urban temperatures.', 'Newly planted trees cool streets faster than mature ones.', 'Shade increases the amount of heat stored in asphalt.'], answer: 0, type: '主旨', evidence: 2, explain: '研究核心发现：成熟树木显著降低街道温度，而新栽树木前五年几乎没有效果。', cause: '信息遗漏' },
        { id: 'L3Q2', q: 'Why do young trees provide little cooling?', options: ['They absorb too much water from the soil.', 'They have small canopies and shallow roots.', 'They are usually planted in winter.', 'They release heat through their leaves.'], answer: 1, type: '细节', evidence: 5, explain: '原文明确：幼树树冠小、根系浅，因此降温效果有限。', cause: '信号词未捕捉' },
        { id: 'L3Q3', q: 'What do the researchers recommend?', options: ['Replacing all mature trees with drought-resistant species', 'Counting newly planted trees more accurately', 'Protecting existing trees and choosing drought-tolerant species', 'Removing trees to make room for public transport'], answer: 2, type: '细节', evidence: 6, explain: '团队建议保护现有树木，并种植耐旱树种；这两点在 6、7 两句中。', cause: '同义替换未识别' },
        { id: 'L3Q4', q: 'What is the critics’ point?', options: ['Trees are more important than public transport.', 'Trees alone cannot substitute for other urban investments.', 'The study exaggerated the cooling effect of shade.', 'Drought-resistant species are too expensive.'], answer: 1, type: '观点', evidence: 8, explain: '批评者认为树木不能替代对公共交通和建筑设计的投资。', cause: '过度推断' }
      ]
    },
    {
      id: 'L4', type: 'passage', title: 'Slow Looking in Museums', scene: '文化 · 博物馆',
      level: '进阶', intro: '一些博物馆开始鼓励观众“慢看”，减少讲解带来的干扰。',
      script: [
        { spk: 'N', en: 'Museums have long relied on audio guides to explain exhibits, but some curators now worry that constant commentary prevents visitors from looking closely.', zh: '博物馆长期依赖语音导览讲解展品，但一些策展人现在担心持续的讲解会让观众无法仔细观察。', signals: [{ word: 'but', type: 'contrast' }] },
        { spk: 'N', en: 'A growing number of galleries are experimenting with what they call slow looking: visitors are invited to spend ten minutes with a single work, without any information about the artist.', zh: '越来越多的美术馆在尝试所谓的“慢看”：邀请观众用十分钟专注一件作品，不提供艺术家的任何信息。' },
        { spk: 'N', en: 'The approach began as an experiment at a university art museum and has since spread to institutions in Europe and Asia.', zh: '这种做法始于一所大学美术馆的实验，此后传播到欧洲和亚洲的机构。', signals: [{ word: 'since', type: 'sequence' }] },
        { spk: 'N', en: 'In one study, visitors who spent ten minutes in silence remembered more details than those who listened to a guide for the same length of time.', zh: '在一项研究中，静默观看十分钟的观众比同样时长听导览的观众记住了更多细节。' },
        { spk: 'N', en: 'Yet the researchers caution that the result does not mean labels and guides are useless.', zh: '然而研究者提醒，这一结果并不意味着标签和导览毫无用处。', signals: [{ word: 'Yet', type: 'contrast' }] },
        { spk: 'N', en: 'For many people, context is essential to enjoyment, especially when the subject matter is unfamiliar.', zh: '对许多人来说，背景信息是欣赏的关键，尤其是当主题陌生时。', signals: [{ word: 'especially', type: 'emphasis' }] },
        { spk: 'N', en: 'The real lesson may be simpler: museums should offer visitors a choice between information and quiet attention, rather than assuming that more explanation is always better.', zh: '真正的启示也许更简单：博物馆应让观众在信息和安静凝视之间做选择，而不是假定解释越多越好。', signals: [{ word: 'rather than', type: 'contrast' }, { word: 'The real lesson', type: 'emphasis' }] }
      ],
      questions: [
        { id: 'L4Q1', q: 'What is “slow looking”?', options: ['Spending extended time with one work without background information', 'Listening to a guide at a slower speed', 'Visiting a museum in a small group', 'Reading detailed labels before viewing an artwork'], answer: 0, type: '细节', evidence: 1, explain: '“慢看”指用十分钟专注一件作品，且不提供艺术家信息。', cause: '同义替换未识别' },
        { id: 'L4Q2', q: 'What did the study find?', options: ['Visitors preferred audio guides to labels.', 'Silent viewers remembered more details than guide listeners.', 'Groups remembered more than individual visitors.', 'Slow looking reduced visitors’ enjoyment.'], answer: 1, type: '细节', evidence: 3, explain: '研究显示静默观看者记住了更多细节，这是支持慢看的直接证据。', cause: '信息遗漏' },
        { id: 'L4Q3', q: 'What do the researchers caution?', options: ['Slow looking should replace all audio guides.', 'Labels are more useful than human guides.', 'Context still matters, so guides are not useless.', 'Museums should remove information about artists.'], answer: 2, type: '观点', evidence: 4, explain: '研究者提醒并非否定导览；后文也强调背景信息对许多人仍很重要。', cause: '过度推断' }
      ]
    },
    {
      id: 'L5', type: 'lecture', title: 'The Paradox of Choice', scene: '讲座 · 心理学',
      level: '高阶', intro: '从果酱实验出发，讨论选择过多何时会损害决策。',
      script: [
        { spk: 'L', en: 'Today I want to discuss an idea that has become popular in both psychology and economics: the paradox of choice.', zh: '今天我想讨论一个在心理学和经济学中都很流行的观点：选择悖论。' },
        { spk: 'L', en: 'The basic claim is simple.', zh: '基本主张很简单。' },
        { spk: 'L', en: 'Although choice is generally good, having too many options can make people less satisfied and even less likely to decide.', zh: '尽管选择通常是好事，但选项过多会让人更不满意，甚至更难以做出决定。', signals: [{ word: 'Although', type: 'contrast' }] },
        { spk: 'L', en: 'In one well-known experiment, shoppers were offered samples of jam.', zh: '在一项著名实验中，购物者可以品尝果酱样品。' },
        { spk: 'L', en: 'One display contained twenty-four varieties; another contained six.', zh: '一个展台有二十四种口味，另一个只有六种。' },
        { spk: 'L', en: 'More shoppers stopped at the larger display, but only three percent bought something, compared with thirty percent at the smaller one.', zh: '更多人停在大展台前，但只有百分之三购买，而小展台为百分之三十。', signals: [{ word: 'but', type: 'contrast' }] },
        { spk: 'L', en: 'Why does this happen?', zh: '为什么会这样？' },
        { spk: 'L', en: 'One explanation is that evaluating many options consumes attention.', zh: '一种解释是，评估大量选项会消耗注意力。' },
        { spk: 'L', en: 'Another is that a large choice set raises the chance that we will later regret our decision.', zh: '另一种解释是，大量选择会增加我们日后后悔决定的可能。' },
        { spk: 'L', en: 'However, later research has complicated the picture.', zh: '然而，后续研究让情况变得更复杂。', signals: [{ word: 'However', type: 'contrast' }] },
        { spk: 'L', en: 'The effect is strongest when people have no clear preference and when the decision is difficult to reverse.', zh: '当人们没有明确偏好、且决定难以撤回时，这种效应最强。' },
        { spk: 'L', en: 'When choices are easy to compare, or when people already know what they want, more options can be helpful.', zh: '当选项容易比较，或人们已经清楚自己想要什么时，更多选择反而有帮助。' },
        { spk: 'L', en: 'So the practical lesson is not that we should always reduce choice.', zh: '因此，实际的启示并不是我们应该总是减少选择。', signals: [{ word: 'So', type: 'cause' }] },
        { spk: 'L', en: 'It is that designers should think carefully about how options are presented, and when a smaller set might serve users better.', zh: '而是设计者应认真思考选项如何呈现，以及何时较小的选项集更有利于用户。', signals: [{ word: 'It is that', type: 'emphasis' }] }
      ],
      questions: [
        { id: 'L5Q1', q: 'What is the paradox of choice?', options: ['People always prefer the largest number of options.', 'Too much choice can reduce satisfaction and delay decisions.', 'Choice is irrelevant to consumer behaviour.', 'People regret decisions only when options are limited.'], answer: 1, type: '主旨', evidence: 2, explain: '选择悖论：选项过多反而降低满意度与决策意愿。', cause: '信息遗漏' },
        { id: 'L5Q2', q: 'What happened in the jam experiment?', options: ['The larger display attracted more buyers overall.', 'The smaller display attracted more shoppers but fewer buyers.', 'More shoppers stopped at the larger display, but far fewer bought.', 'Both displays produced the same sales.'], answer: 2, type: '细节', evidence: 5, explain: '大展台吸引更多人驻足，但购买率仅 3%，小展台为 30%。', cause: '信号词未捕捉' },
        { id: 'L5Q3', q: 'Which explanation for the effect is mentioned?', options: ['Shoppers distrust free samples.', 'Evaluating many options uses up attention.', 'Jam is considered an unhealthy product.', 'Larger displays attract older shoppers.'], answer: 1, type: '细节', evidence: 7, explain: '讲座给出两种解释：评估大量选项消耗注意力，以及预期后悔。', cause: '信息遗漏' },
        { id: 'L5Q4', q: 'What does later research suggest?', options: ['The effect depends on preference clarity and reversibility.', 'The effect disappears when products are inexpensive.', 'More options are always harmful.', 'People never regret reversible decisions.'], answer: 0, type: '推断', evidence: 10, explain: '后续研究指出，效应在无明确偏好、决定难以撤回时最强。', cause: '同义替换未识别' },
        { id: 'L5Q5', q: 'What is the speaker’s practical conclusion?', options: ['Retailers should offer only one product.', 'Choice should be eliminated in important decisions.', 'How options are presented matters more than simply reducing them.', 'Consumers should avoid comparing products.'], answer: 2, type: '主旨', evidence: 13, explain: '结论是设计者要思考呈现方式与场景，并非一味减少选项。', cause: '过度推断' }
      ]
    },
    {
      id: 'L6', type: 'lecture', title: 'The Rebound Effect', scene: '讲座 · 环境经济',
      level: '高阶', intro: '节能一定等于减排吗？讲座讨论“反弹效应”及其政策启示。',
      script: [
        { spk: 'L', en: 'Energy efficiency is usually presented as a straightforward win.', zh: '能源效率通常被视为稳赚不赔的好事。' },
        { spk: 'L', en: 'Replace an old machine with a more efficient one, and you use less electricity.', zh: '用更高效的机器替换旧机器，就能少用电。' },
        { spk: 'L', en: 'But the story is more complicated.', zh: '但事情没那么简单。', signals: [{ word: 'But', type: 'contrast' }] },
        { spk: 'L', en: 'When a device becomes cheaper to run, people may use it more often.', zh: '当设备运行成本降低时，人们可能会更频繁地使用它。', signals: [{ word: 'When', type: 'cause' }] },
        { spk: 'L', en: 'They may also spend the money they save on other goods and services, which require energy to produce.', zh: '他们也可能把省下的钱花在其他商品和服务上，而这些商品和服务同样需要能源来生产。' },
        { spk: 'L', en: 'Economists call this the rebound effect.', zh: '经济学家称之为反弹效应。' },
        { spk: 'L', en: 'A classic example is home heating.', zh: '一个经典例子是家庭供暖。' },
        { spk: 'L', en: 'Better insulation reduces the energy needed to keep a house warm, yet some households respond by heating more rooms or wearing lighter clothes indoors.', zh: '更好的保温层减少房屋保暖所需能源，但一些家庭会因此给更多房间供暖，或在室内穿得更少。', signals: [{ word: 'yet', type: 'contrast' }] },
        { spk: 'L', en: 'The result is that the actual saving is smaller than the engineering estimate.', zh: '结果，实际节省的能源少于工程估算。' },
        { spk: 'L', en: 'Does this mean efficiency policies are pointless? Not at all.', zh: '这是否意味着节能政策毫无意义？完全不是。', signals: [{ word: 'Not at all', type: 'emphasis' }] },
        { spk: 'L', en: 'Rebound effects rarely cancel out the entire gain, and they are smaller when prices reflect environmental costs.', zh: '反弹效应很少会抵消全部收益；当价格反映环境成本时，反弹效应也更小。' },
        { spk: 'L', en: 'The lesson for policy is to combine efficiency standards with carbon pricing or other measures that prevent savings from being spent on carbon-intensive activities.', zh: '政策启示是：把能效标准与碳定价或其他措施结合起来，防止节省下来的钱被用于高碳活动。' },
        { spk: 'L', en: 'In short, efficiency is necessary but not sufficient. We should measure results in the real world, not just on the label.', zh: '总之，效率是必要的，但并不充分。我们应在现实世界中衡量结果，而不只看标签。', signals: [{ word: 'In short', type: 'emphasis' }, { word: 'but', type: 'contrast' }] }
      ],
      questions: [
        { id: 'L6Q1', q: 'What is the rebound effect?', options: ['Efficient devices break down more often.', 'Energy savings are partly offset because people use more of the cheaper service.', 'Governments raise energy prices to reduce demand.', 'Consumers refuse to buy efficient products.'], answer: 1, type: '主旨', evidence: 3, explain: '反弹效应指使用成本降低后用量增加，部分抵消节能收益。', cause: '同义替换未识别' },
        { id: 'L6Q2', q: 'What does the home heating example illustrate?', options: ['Insulation usually fails to reduce energy use.', 'Households may heat more rooms or dress more lightly indoors.', 'Older houses cannot be properly insulated.', 'Heating bills have risen faster than incomes.'], answer: 1, type: '细节', evidence: 7, explain: '保温改善后，一些家庭会扩大供暖范围或减少室内衣着，从而部分抵消节能。', cause: '信息遗漏' },
        { id: 'L6Q3', q: 'What is the speaker’s view of efficiency policies?', options: ['They are pointless because rebound effects cancel all gains.', 'They are useful but should be combined with other measures.', 'They should be replaced by carbon pricing entirely.', 'They only work in rich countries.'], answer: 1, type: '观点', evidence: 10, explain: '讲座明确“Not at all”，并指出反弹很少抵消全部收益，政策应组合使用。', cause: '过度推断' },
        { id: 'L6Q4', q: 'When are rebound effects smaller?', options: ['When energy is cheap', 'When prices reflect environmental costs', 'When devices are brand new', 'When households have higher incomes'], answer: 1, type: '细节', evidence: 10, explain: '原文：当价格反映环境成本时，反弹效应更小。', cause: '信号词未捕捉' },
        { id: 'L6Q5', q: 'What is the main message of the lecture?', options: ['Efficiency alone is not enough; pair it with pricing and measure real outcomes.', 'Energy efficiency should be abandoned.', 'Carbon pricing is the only effective policy.', 'Households should stop heating extra rooms.'], answer: 0, type: '主旨', evidence: 11, explain: '结尾强调能效必要但不充分，应配合碳定价并在现实中衡量结果。', cause: '信息遗漏' }
      ]
    }
  ];

  C.data.signalWords = [
    { type: 'contrast', label: '转折 / 对比', words: ['but', 'however', 'yet', 'nevertheless', 'on the contrary', 'in contrast', 'whereas', 'although', 'while', 'instead', 'rather than'], tip: '转折后常出现说话人的真实态度或答案；听到 but / however 要立刻提高警觉。' },
    { type: 'cause', label: '因果', words: ['because', 'since', 'therefore', 'thus', 'consequently', 'as a result', 'due to', 'lead to', 'result in', 'stem from'], tip: '原因与结果是细节题和推断题的高频落点，注意区分“谁导致谁”。' },
    { type: 'example', label: '举例', words: ['for example', 'for instance', 'such as', 'including', 'a case in point', 'take ... as an example'], tip: '例子本身常不是答案，例子支持的论点才是。' },
    { type: 'emphasis', label: '强调 / 观点', words: ['what matters most', 'in fact', 'actually', 'indeed', 'above all', 'the key point', 'in short', 'ultimately', 'the real lesson'], tip: '强调句往往直接对应主旨题或态度题。' },
    { type: 'sequence', label: '时间 / 顺序', words: ['first', 'then', 'later', 'meanwhile', 'finally', 'since', 'before', 'after'], tip: '顺序词帮助定位事件发展，尤其适用于长对话与讲座。' },
    { type: 'condition', label: '条件 / 让步', words: ['if', 'unless', 'provided that', 'as long as', 'otherwise', 'even if', 'despite'], tip: '条件句常设置“如果……会怎样”的推断题，注意条件是否成立。' }
  ];

  C.data.listeningNote = '听力材料为原创六级仿真内容，使用浏览器语音合成朗读，用于精听、听写与考点信号训练；并非官方真题音频。';
})();
