export const fallbackWords = [
  { word: 'abandon', phonetic: '/əˈbændən/', pos: 'v.', meaning: '放弃；抛弃', level: 2, tag: '高频', family: ['abandoned', 'abandonment'], example: 'Students should not abandon a goal just because progress is slow.' },
  { word: 'ability', phonetic: '/əˈbɪləti/', pos: 'n.', meaning: '能力；才能', level: 1, tag: '基础', family: ['able', 'unable'], example: 'Reading every day improves your ability to understand long passages.' },
  { word: 'absorb', phonetic: '/əbˈzɔːrb/', pos: 'v.', meaning: '吸收；理解；使全神贯注', level: 3, tag: '阅读', family: ['absorbed', 'absorption'], example: 'The material can absorb water quickly.' },
  { word: 'academic', phonetic: '/ˌækəˈdemɪk/', pos: 'adj.', meaning: '学术的；学院的', level: 2, tag: '校园', family: ['academy'], example: 'Academic writing requires clear evidence and careful reasoning.' },
  { word: 'access', phonetic: '/ˈækses/', pos: 'n./v.', meaning: '通道；机会；访问', level: 2, tag: '科技', family: ['accessible'], example: 'Students need access to reliable learning resources.' },
  { word: 'accomplish', phonetic: '/əˈkɑːmplɪʃ/', pos: 'v.', meaning: '完成；实现', level: 3, tag: '写作', family: ['accomplishment'], example: 'A weekly plan helps you accomplish more with less stress.' },
  { word: 'accurate', phonetic: '/ˈækjərət/', pos: 'adj.', meaning: '准确的；精确的', level: 2, tag: '写作', family: ['accuracy'], example: 'Accurate notes make revision much easier.' },
  { word: 'achieve', phonetic: '/əˈtʃiːv/', pos: 'v.', meaning: '实现；达到', level: 1, tag: '高频', family: ['achievement'], example: 'You can achieve steady progress by reviewing words regularly.' },
  { word: 'adapt', phonetic: '/əˈdæpt/', pos: 'v.', meaning: '适应；改编', level: 3, tag: '阅读', family: ['adaptation'], example: 'Freshmen need time to adapt to college life.' },
  { word: 'adequate', phonetic: '/ˈædɪkwət/', pos: 'adj.', meaning: '足够的；适当的', level: 4, tag: '阅读', family: ['adequately'], example: 'Adequate preparation reduces exam anxiety.' },
  { word: 'affect', phonetic: '/əˈfekt/', pos: 'v.', meaning: '影响', level: 2, tag: '易混', family: ['effect'], example: 'Sleep can affect memory and concentration.' },
  { word: 'agriculture', phonetic: '/ˈæɡrɪkʌltʃər/', pos: 'n.', meaning: '农业', level: 4, tag: '社会', family: ['agricultural'], example: 'Technology is changing modern agriculture.' },
  { word: 'alternative', phonetic: '/ɔːlˈtɜːrnətɪv/', pos: 'n./adj.', meaning: '替代选择；可替代的', level: 3, tag: '写作', family: ['alternatively'], example: 'Online courses are an alternative to traditional classes.' },
  { word: 'analyze', phonetic: '/ˈænəlaɪz/', pos: 'v.', meaning: '分析', level: 2, tag: '学术', family: ['analysis', 'analytical'], example: 'The report analyzes why students forget new words.' },
  { word: 'annual', phonetic: '/ˈænjuəl/', pos: 'adj.', meaning: '每年的；年度的', level: 2, tag: '商务', family: ['annually'], example: 'The annual survey shows changes in reading habits.' },
  { word: 'approach', phonetic: '/əˈproʊtʃ/', pos: 'n./v.', meaning: '方法；接近；处理', level: 2, tag: '高频', family: ['approachable'], example: 'A better approach is to learn words in context.' },
  { word: 'appropriate', phonetic: '/əˈproʊpriət/', pos: 'adj.', meaning: '合适的；恰当的', level: 3, tag: '写作', family: ['appropriately'], example: 'Choose an appropriate word for each sentence.' },
  { word: 'benefit', phonetic: '/ˈbenɪfɪt/', pos: 'n./v.', meaning: '益处；受益', level: 1, tag: '写作', family: ['beneficial'], example: 'Regular exercise benefits both body and mind.' },
  { word: 'challenge', phonetic: '/ˈtʃælɪndʒ/', pos: 'n./v.', meaning: '挑战；质疑', level: 1, tag: '高频', family: ['challenging'], example: 'Remembering similar words is a common challenge.' },
  { word: 'community', phonetic: '/kəˈmjuːnəti/', pos: 'n.', meaning: '社区；群体', level: 1, tag: '社会', family: ['communal'], example: 'Volunteers make the community more welcoming.' }
];

export const fallbackTags = [...new Set(fallbackWords.map((word) => word.tag))];
