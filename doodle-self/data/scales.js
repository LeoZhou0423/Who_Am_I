const SHARED_OPTIONS = [
  { label: '完全不符合', score: 1 },
  { label: '比较不符合', score: 2 },
  { label: '不确定', score: 3 },
  { label: '比较符合', score: 4 },
  { label: '完全符合', score: 5 }
];

const SCALES = [
  {
    id: 'sccs',
    name: '自我概念清晰度',
    sub: 'Self-Concept Clarity',
    desc: '你对自己的认识是稳定的，还是经常变化？',
    icon: '🪞',
    questions: [
      { text: '我经常花很多时间思考我到底是怎样的人。', reverse: true },
      { text: '我对自己的信念似乎经常改变。', reverse: true },
      { text: '我对自己是什么样的人很少有清晰的想法。', reverse: true },
      { text: '如果让我描述自己，不同日子我的描述可能不太一样。', reverse: true },
      { text: '我很少为了「我是谁」而感到困扰。', reverse: false },
      { text: '有时候我觉得自己的各个方面互相矛盾。', reverse: true },
      { text: '我经常觉得自己内心很稳定、很一致。', reverse: false },
      { text: '我对自己的了解经常发生变化。', reverse: true },
      { text: '如果处境不同，我可能会变成一个很不同的人。', reverse: true },
      { text: '我很少质疑自己的价值或立场。', reverse: false },
      { text: '我对自己的人生方向感到确定。', reverse: false },
      { text: '我很难讲清楚自己真正在意什么。', reverse: true }
    ],
    options: SHARED_OPTIONS,
    scoring: {
      interpret(total) {
        if (total <= 24) return { level: '低', color: '#ff6b6b', text: '自我形象较为模糊，容易受外界影响，试着多用日记或书写练习整理自己。' };
        if (total <= 36) return { level: '中', color: '#ffe66d', text: '自我认知中等，某些情境下会感到矛盾，核心自我正在成形。' };
        return { level: '高', color: '#4ecdc4', text: '自我概念清晰稳定，有明确的内在标准，能较好应对外界评价。' };
      }
    }
  },
  {
    id: 'rses',
    name: '自尊量表',
    sub: 'Rosenberg Self-Esteem',
    desc: '你整体上有多喜欢自己？',
    icon: '❤️',
    questions: [
      { text: '我认为自己是个有价值的人，至少与别人不相上下。', reverse: false },
      { text: '我觉得我有许多优点。', reverse: false },
      { text: '总的来说，我倾向于认为自己是个失败者。', reverse: true },
      { text: '我能够像大多数人一样把事情做好。', reverse: false },
      { text: '我觉得自己没有什么值得骄傲的地方。', reverse: true },
      { text: '我对自己持有一种积极的态度。', reverse: false },
      { text: '整体而言，我对自己感到满意。', reverse: false },
      { text: '我希望我能为自己赢得更多尊重。', reverse: true },
      { text: '我确实时常感到自己毫无用处。', reverse: true },
      { text: '我时常认为自己一无是处。', reverse: true }
    ],
    options: SHARED_OPTIONS,
    scoring: {
      interpret(total) {
        if (total <= 15) return { level: '较低', color: '#ff6b6b', text: '整体自我价值感偏低，容易自我批评。建议从记录「小成就」开始积累。' };
        if (total <= 25) return { level: '中等', color: '#ffe66d', text: '自尊水平中等，既有自我肯定，也会受挫折影响。' };
        if (total <= 35) return { level: '较高', color: '#4ecdc4', text: '你比较接纳自己，能在失败中保持基本自我价值感。' };
        return { level: '高', color: '#4ecdc4', text: '自尊水平高，对自己有稳定而积极的评价。' };
      }
    }
  },
  {
    id: 'bigfive',
    name: '大五人格',
    sub: 'Big Five Personality',
    desc: '你的性格底色是什么？',
    icon: '🎨',
    dimensions: [
      { key: 'O', name: '开放性', color: '#ff6b6b' },
      { key: 'C', name: '尽责性', color: '#4ecdc4' },
      { key: 'E', name: '外向性', color: '#ffe66d' },
      { key: 'A', name: '宜人性', color: '#96ceb4' },
      { key: 'N', name: '神经质', color: '#9b59b6' }
    ],
    questions: [
      { text: '我对新事物充满好奇，喜欢想象和探索。', dim: 'O', reverse: false },
      { text: '我做事认真、有条理，能坚持到底。', dim: 'C', reverse: false },
      { text: '我在人群中感到自在，喜欢社交。', dim: 'E', reverse: false },
      { text: '我愿意信任他人，并设身处地为别人着想。', dim: 'A', reverse: false },
      { text: '我容易感到焦虑、紧张或情绪波动。', dim: 'N', reverse: false },
      { text: '我更喜欢按部就班，而不是尝试新奇事物。', dim: 'O', reverse: true },
      { text: '我有时会粗心大意，做事缺乏计划。', dim: 'C', reverse: true },
      { text: '我性格偏内向，不喜欢成为焦点。', dim: 'E', reverse: true },
      { text: '我比较容易挑剔或与人发生争执。', dim: 'A', reverse: true },
      { text: '我通常情绪稳定，不容易被压力击垮。', dim: 'N', reverse: true }
    ],
    options: SHARED_OPTIONS,
    scoring: {
      interpret(result) {
        const desc = [];
        if (result.O >= 7) desc.push('富有好奇心与创造力');
        else if (result.O <= 4) desc.push('偏好具体与现实');

        if (result.C >= 7) desc.push('自律且有条理');
        else if (result.C <= 4) desc.push('随性而灵活');

        if (result.E >= 7) desc.push('外向热情');
        else if (result.E <= 4) desc.push('内向安静');

        if (result.A >= 7) desc.push('善解人意、合作');
        else if (result.A <= 4) desc.push('直率、有主见');

        if (result.N >= 7) desc.push('情绪敏感度高');
        else if (result.N <= 4) desc.push('情绪较稳定');

        return {
          level: '雷达图',
          color: '#4ecdc4',
          text: desc.length ? '你的性格侧写：' + desc.join('，') + '。' : '你的各项得分较为均衡。'
        };
      }
    }
  },
  {
    id: 'mlq',
    name: '生命意义感',
    sub: 'Meaning in Life Questionnaire',
    desc: '你觉得人生有目的吗？',
    icon: '🧭',
    dimensions: [
      { key: 'presence', name: '拥有意义', color: '#4ecdc4' },
      { key: 'search', name: '寻求意义', color: '#ff6b6b' }
    ],
    questions: [
      { text: '我的人生有一个清晰的方向。', dim: 'presence', reverse: false },
      { text: '我正在寻找让我的人生有意义的东西。', dim: 'search', reverse: false },
      { text: '我的人生有意义。', dim: 'presence', reverse: false },
      { text: '我正在寻找我人生的使命或目标。', dim: 'search', reverse: false },
      { text: '我明白什么让我的人生有意义。', dim: 'presence', reverse: false },
      { text: '我总是在寻找能让我的人生变得更有意义的东西。', dim: 'search', reverse: false },
      { text: '我对我人生的意义有深刻的理解。', dim: 'presence', reverse: false },
      { text: '我经常思考如何才能让人生变得更有意义。', dim: 'search', reverse: false },
      { text: '我正在过一种有意义的人生。', dim: 'presence', reverse: false },
      { text: '我一直在寻找人生的「为什么」。', dim: 'search', reverse: false }
    ],
    options: SHARED_OPTIONS,
    scoring: {
      interpret(result) {
        const { presence, search } = result;
        let level, color, text;
        if (presence >= 20 && search <= 15) {
          level = '拥有型';
          color = '#4ecdc4';
          text = '你已经感受到人生的意义，且不太需要向外寻找。这是相对稳定的状态。';
        } else if (presence >= 20 && search >= 20) {
          level = '成长型';
          color = '#96ceb4';
          text = '你既拥有意义，也在积极寻求更深的意义。这是充满动力的状态。';
        } else if (presence <= 15 && search >= 20) {
          level = '寻找型';
          color = '#ffe66d';
          text = '你正在积极寻找意义，但尚未感到确定。这是一个探索期，允许自己慢慢来。';
        } else {
          level = '低迷型';
          color = '#ff6b6b';
          text = '当下你可能既未感受到意义，也缺乏寻找的动力。试着从书写练习或小目标开始。';
        }
        return { level, color, text };
      }
    }
  }
];
