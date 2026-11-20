import type { CategoryId, CategoryMeta, LevelId } from './types'

// 类别展示信息：颜色用于高亮与图例
export const CATEGORIES: CategoryMeta[] = [
  { id: 'cliche', label: '英文陈词', color: '#ff5b6e', hint: '空洞的高级词汇，换成日常表达更有力量' },
  { id: 'pattern', label: '句式套路', color: '#ff9f45', hint: '模板化句式，读起来像模型在凑字数' },
  { id: 'chinese', label: '中文黑话', color: '#e970ff', hint: '互联网黑话堆砌，说人话更好' },
  { id: 'emoji', label: 'Emoji 滥用', color: '#ffd45e', hint: '连续 emoji 是典型的营销号 / AI 风格' },
  { id: 'filler', label: '填充冗余', color: '#8b8cff', hint: '可以删掉或缩短的啰嗦表达' },
]

// 等级信息：分数越高 AI 味越重
export const LEVELS: Record<LevelId, { label: string; color: string; desc: string }> = {
  severe: { label: '严重', color: '#ff4757', desc: '满满的 AI 味，建议大幅重写' },
  medium: { label: '中等', color: '#ff9f43', desc: '有明显模板痕迹，再打磨一下' },
  mild: { label: '轻微', color: '#ffd32a', desc: '略有痕迹，整体已经不错' },
  clean: { label: '清爽', color: '#2ed573', desc: '很自然，几乎没有 AI 味' },
}

// 不同类别对总分的贡献权重
export const CATEGORY_WEIGHT: Record<CategoryId, number> = {
  cliche: 3,
  pattern: 6,
  chinese: 3,
  emoji: 4,
  filler: 2,
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id
}

export function categoryColor(id: CategoryId): string {
  return CATEGORIES.find((c) => c.id === id)?.color ?? '#ffffff'
}

// 一条纯正则表达式规则，零依赖、可独立扩展
export interface Rule {
  category: CategoryId
  source: string
  flags: string
  reason: string
  suggestion: string
  replacement?: string
  // 达到该数量才生效（用于「连接词堆叠」这类需要多次出现的规则）
  minCount?: number
}

export const RULES: Rule[] = [
  // ---- 英文陈词滥调 ----
  { category: 'cliche', source: "\\bdelve\\s+into\\b", flags: 'gi', reason: '“delve into”是 AI 最爱用的开场动词', suggestion: 'explore', replacement: 'explore' },
  { category: 'cliche', source: "\\bdelving\\s+into\\b", flags: 'gi', reason: '“delving into”是 “delve into” 的变体', suggestion: 'exploring', replacement: 'exploring' },
  { category: 'cliche', source: "\\bdelve\\b", flags: 'gi', reason: 'delve 单独出现也是 AI 高频动词', suggestion: 'explore / look into', replacement: 'explore' },
  { category: 'cliche', source: "\\blandscape\\b", flags: 'gi', reason: 'landscape 在这里只是 field 的花哨说法', suggestion: 'field / area', replacement: 'field' },
  { category: 'cliche', source: "\\btapestry\\b", flags: 'gi', reason: 'tapestry 属于典型的文学化空词', suggestion: 'mix', replacement: 'mix' },
  { category: 'cliche', source: "\\btestament\\s+to\\b", flags: 'gi', reason: 'testament to 是模板化的赞美句式', suggestion: 'proof of', replacement: 'proof of' },
  { category: 'cliche', source: "\\bseamlessly\\b", flags: 'gi', reason: 'seamlessly 几乎成了 AI 文案的口头禅', suggestion: 'easily', replacement: 'easily' },
  { category: 'cliche', source: "\\bseamless\\b", flags: 'gi', reason: 'seamless 几乎成了 AI 文案的口头禅', suggestion: 'smooth', replacement: 'smooth' },
  { category: 'cliche', source: "\\brobust\\b", flags: 'gi', reason: 'robust 被滥用后已经失去信息量', suggestion: 'strong', replacement: 'strong' },
  { category: 'cliche', source: "\\bleverage\\b", flags: 'gi', reason: 'leverage 是商务 AI 味的重灾区', suggestion: 'use', replacement: 'use' },
  { category: 'cliche', source: "\\bleveraging\\b", flags: 'gi', reason: 'leveraging 可以换成更直接的 using', suggestion: 'using', replacement: 'using' },
  { category: 'cliche', source: "\\butiliz(?:e|es|ing|ed)\\b", flags: 'gi', reason: 'utilize 完全可以用 use 代替', suggestion: 'use', replacement: 'use' },
  { category: 'cliche', source: "\\bparamount\\b", flags: 'gi', reason: 'paramount 听起来正式但很空', suggestion: 'most important', replacement: 'most important' },
  { category: 'cliche', source: "\\bmultifaceted\\b", flags: 'gi', reason: 'multifaceted 是凑字数的高级词', suggestion: 'complex', replacement: 'complex' },
  { category: 'cliche', source: "\\bpivotal\\b", flags: 'gi', reason: 'pivotal 用 key 就能表达清楚', suggestion: 'key', replacement: 'key' },
  { category: 'cliche', source: "\\brealm\\b", flags: 'gi', reason: 'realm 在这里只是 field 的花哨说法', suggestion: 'field', replacement: 'field' },
  { category: 'cliche', source: "\\bembark(?:ing)?\\s+on\\b", flags: 'gi', reason: 'embark on 是典型的 AI 过渡词', suggestion: 'start', replacement: 'start' },
  { category: 'cliche', source: "\\bfoster(?:s|ing|ed)?\\b", flags: 'gi', reason: 'foster 换 encourage 更自然', suggestion: 'encourage', replacement: 'encourage' },
  { category: 'cliche', source: "\\bnavigat(?:e|es|ing|ed)\\b", flags: 'gi', reason: 'navigate 在这里等于 handle', suggestion: 'handle', replacement: 'handle' },
  { category: 'cliche', source: "\\bin\\s+today'?s\\s+fast[-\\s]?paced\\s+world\\b", flags: 'gi', reason: '这句开场白几乎是 AI 文案的身份证', suggestion: 'Today', replacement: 'Today' },
  { category: 'cliche', source: "\\bit'?s\\s+worth\\s+noting(?:\\s+that)?\\b", flags: 'gi', reason: '“it’s worth noting”是万能填充开场', suggestion: 'note that', replacement: 'note that' },
  { category: 'cliche', source: "\\ba\\s+myriad\\s+of\\b", flags: 'gi', reason: 'a myriad of 直接说 many 即可', suggestion: 'many', replacement: 'many' },
  { category: 'cliche', source: "\\bplethora\\s+of\\b", flags: 'gi', reason: 'plethora of 属于堆砌式表达', suggestion: 'many', replacement: 'many' },
  { category: 'cliche', source: "\\bcutting[-\\s]edge\\b", flags: 'gi', reason: 'cutting-edge 已被用滥', suggestion: 'advanced', replacement: 'advanced' },
  { category: 'cliche', source: "\\bgame[-\\s]changer\\b", flags: 'gi', reason: 'game-changer 是营销 AI 味高频词', suggestion: 'major change', replacement: 'major change' },
  { category: 'cliche', source: "\\bdeep\\s+dive\\b", flags: 'gi', reason: 'deep dive 可以换成 closer look', suggestion: 'closer look', replacement: 'closer look' },
  { category: 'cliche', source: "\\bempower(?:s|ing|ed)?\\b", flags: 'gi', reason: 'empower 换成 help 更实在', suggestion: 'help', replacement: 'help' },
  { category: 'cliche', source: "\\bholistic\\b", flags: 'gi', reason: 'holistic 常常只是 overall 的伪装', suggestion: 'overall', replacement: 'overall' },
  { category: 'cliche', source: "\\bparadigm\\s+shift\\b", flags: 'gi', reason: 'paradigm shift 是烂大街的比喻', suggestion: 'major change', replacement: 'major change' },

  // ---- 中文黑话 ----
  { category: 'chinese', source: '赋能', flags: 'g', reason: '“赋能”是互联网黑话代表词', suggestion: '帮助 / 提升', replacement: '帮助' },
  { category: 'chinese', source: '抓手', flags: 'g', reason: '“抓手”不如直接说方法', suggestion: '切入点 / 方法', replacement: '方法' },
  { category: 'chinese', source: '闭环', flags: 'g', reason: '“闭环”可以描述成具体流程', suggestion: '完整流程', replacement: '完整流程' },
  { category: 'chinese', source: '沉淀', flags: 'g', reason: '“沉淀”换成积累更朴素', suggestion: '积累', replacement: '积累' },
  { category: 'chinese', source: '底层逻辑', flags: 'g', reason: '“底层逻辑”说原理就够了', suggestion: '基本原理', replacement: '原理' },
  { category: 'chinese', source: '生态位', flags: 'g', reason: '“生态位”其实是定位', suggestion: '定位 / 角色', replacement: '定位' },
  { category: 'chinese', source: '拉通', flags: 'g', reason: '“拉通”换成协调更清楚', suggestion: '协调 / 沟通', replacement: '协调' },
  { category: 'chinese', source: '对齐', flags: 'g', reason: '“对齐”换成统一或一致', suggestion: '统一 / 一致', replacement: '统一' },
  { category: 'chinese', source: '复盘', flags: 'g', reason: '“复盘”换成回顾更易懂', suggestion: '回顾 / 总结', replacement: '回顾' },
  { category: 'chinese', source: '颗粒度', flags: 'g', reason: '“颗粒度”其实就是细节程度', suggestion: '细节程度', replacement: '细节' },
  { category: 'chinese', source: '打法', flags: 'g', reason: '“打法”换成方法更直接', suggestion: '方法', replacement: '方法' },
  { category: 'chinese', source: '组合拳', flags: 'g', reason: '“组合拳”是典型的汇报体', suggestion: '一系列措施', replacement: '一系列措施' },
  { category: 'chinese', source: '护城河', flags: 'g', reason: '“护城河”换成竞争优势', suggestion: '竞争优势', replacement: '优势' },
  { category: 'chinese', source: '天花板', flags: 'g', reason: '“天花板”换成上限更准确', suggestion: '上限', replacement: '上限' },
  { category: 'chinese', source: '赛道', flags: 'g', reason: '“赛道”换成领域更实在', suggestion: '领域', replacement: '领域' },
  { category: 'chinese', source: '痛点', flags: 'g', reason: '“痛点”换成具体问题', suggestion: '问题', replacement: '问题' },
  { category: 'chinese', source: '深度绑定', flags: 'g', reason: '“深度绑定”换成紧密合作', suggestion: '紧密合作', replacement: '紧密合作' },
  { category: 'chinese', source: '全链路', flags: 'g', reason: '“全链路”换成全流程', suggestion: '全流程', replacement: '全流程' },

  // ---- 句式套路 ----
  { category: 'pattern', source: "\\bnot\\s+just\\b[^.!?\\n]{1,80}\\bbut\\b", flags: 'gi', reason: '“not just … but …”是经典的 AI 对仗句式', suggestion: '改成平实的并列句，例如 “X and Y”' },
  { category: 'pattern', source: "\\bit'?s\\s+not\\s+just\\b[^.!?\\n]{1,80}\\bit'?s\\b", flags: 'gi', reason: '“it’s not just X, it’s Y”是模型最爱用的强调模板', suggestion: '直接说结论，去掉对仗结构' },
  { category: 'pattern', source: "\\b\\w{2,},\\s*\\w{2,},\\s*(?:and\\s+)?\\w{2,}\\b", flags: 'g', reason: '三段式排比是 AI 营造气势的惯用手法', suggestion: '精简为两项，或直接描述' },
  { category: 'pattern', source: "\\u2014{2,}", flags: 'g', reason: '连续破折号读起来像在硬凑停顿', suggestion: '改用逗号或句号', replacement: '，' },
  { category: 'pattern', source: "-{4,}", flags: 'g', reason: '连续短横线属于过度分隔', suggestion: '改用逗号或句号', replacement: ' ' },
  { category: 'pattern', source: "\\b(?:furthermore|moreover|additionally|in conclusion|in summary|therefore|thus)\\b", flags: 'gi', reason: '连接词堆叠会让文章显得机械', suggestion: '删掉多余连接词，直接写下一句', minCount: 2 },

  // ---- Emoji 滥用 ----
  { category: 'emoji', source: '(?:\\p{Extended_Pictographic}\\uFE0F?[\\u{1F3FB}-\\u{1F3FF}]?){3,}', flags: 'gu', reason: '连续三个以上 emoji 是典型 AI / 营销号风格', suggestion: '正文里删掉 emoji，最多保留一个', replacement: '' },

  // ---- 填充冗余 ----
  { category: 'filler', source: "\\bin\\s+order\\s+to\\b", flags: 'gi', reason: 'in order to 直接用 to 就够了', suggestion: 'to', replacement: 'to' },
  { category: 'filler', source: "\\bdue\\s+to\\s+the\\s+fact\\s+that\\b", flags: 'gi', reason: 'due to the fact that 是冗余表达', suggestion: 'because', replacement: 'because' },
  { category: 'filler', source: "\\bin\\s+spite\\s+of\\s+the\\s+fact\\s+that\\b", flags: 'gi', reason: 'in spite of the fact that 可以精简', suggestion: 'although', replacement: 'although' },
  { category: 'filler', source: "\\bat\\s+this\\s+point\\s+in\\s+time\\b", flags: 'gi', reason: 'at this point in time 就是 now', suggestion: 'now', replacement: 'now' },
  { category: 'filler', source: "\\bin\\s+the\\s+event\\s+that\\b", flags: 'gi', reason: 'in the event that 用 if 即可', suggestion: 'if', replacement: 'if' },
  { category: 'filler', source: "\\bhas\\s+the\\s+ability\\s+to\\b", flags: 'gi', reason: 'has the ability to 等于 can', suggestion: 'can', replacement: 'can' },
  { category: 'filler', source: "\\bmake\\s+a\\s+decision\\b", flags: 'gi', reason: 'make a decision 用 decide 更利落', suggestion: 'decide', replacement: 'decide' },
  { category: 'filler', source: "\\bfor\\s+the\\s+purpose\\s+of\\b", flags: 'gi', reason: 'for the purpose of 用 for 就够了', suggestion: 'for', replacement: 'for' },
  { category: 'filler', source: "\\ba\\s+large\\s+number\\s+of\\b", flags: 'gi', reason: 'a large number of 换成 many', suggestion: 'many', replacement: 'many' },
  { category: 'filler', source: "\\bprior\\s+to\\b", flags: 'gi', reason: 'prior to 换成 before 更自然', suggestion: 'before', replacement: 'before' },
  { category: 'filler', source: "\\bsubsequent\\s+to\\b", flags: 'gi', reason: 'subsequent to 换成 after', suggestion: 'after', replacement: 'after' },
  { category: 'filler', source: "\\bwith\\s+regard\\s+to\\b", flags: 'gi', reason: 'with regard to 换成 about', suggestion: 'about', replacement: 'about' },
]
