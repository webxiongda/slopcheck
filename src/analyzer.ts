import { CATEGORY_WEIGHT, LEVELS, RULES, categoryLabel } from './rules'
import type { Rule } from './rules'
import type { AnalysisResult, LevelId, Match } from './types'

// 用规则在当前文本上收集命中，每条规则都新建正则以避免复用 lastIndex
function collect(rule: Rule, text: string): Match[] {
  const flags = rule.flags.includes('g') ? rule.flags : `${rule.flags}g`
  const re = new RegExp(rule.source, flags)
  const out: Match[] = []
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    // 跳过零宽匹配，防止死循环
    if (m[0].length === 0) {
      re.lastIndex += 1
      continue
    }
    out.push({
      id: `${rule.category}-${m.index}-${m[0].length}`,
      category: rule.category,
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
      reason: rule.reason,
      suggestion: rule.suggestion,
      replacement: rule.replacement,
      weight: CATEGORY_WEIGHT[rule.category],
    })
  }
  return out
}

// 去掉重叠命中：同一起点保留更长的片段，避免一处文字被重复计分
function dedupe(matches: Match[]): Match[] {
  const sorted = [...matches].sort(
    (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start),
  )
  const kept: Match[] = []
  let lastEnd = -1
  for (const m of sorted) {
    if (m.start >= lastEnd) {
      kept.push(m)
      lastEnd = m.end
    }
  }
  return kept
}

// 统计中英文词数：英文按单词、中文按汉字计
function countTokens(text: string): number {
  const english = (text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? []).length
  // 中文按约 1.8 字折算一个词，避免逐字计数导致可读性偏低
  const chinese = Math.round((text.match(/\p{Script=Han}/gu) ?? []).length / 1.8)
  return english + chinese
}

// 可读性 heuristic：句子越长越难读，满分 100
function calcReadability(text: string): number {
  const sentences = text
    .split(/[.!?。！？\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const tokens = countTokens(text)
  if (!sentences.length || !tokens) return 100
  const avg = tokens / sentences.length
  const score = 100 - avg * 1.6
  return Math.max(0, Math.min(100, Math.round(score)))
}

// 结合命中权重和密度算 0-100 分，短文本设下限防止密度爆炸
// 严格模式提高密度系数，让轻度模板痕迹也反映到分数上
function calcScore(matches: Match[], tokens: number, strict = false): number {
  const weighted = matches.reduce((sum, m) => sum + m.weight, 0)
  const density = weighted / Math.max(tokens, 24)
  let score = Math.round(density * (strict ? 168 : 132))
  if (matches.length > 0) score = Math.max(score, 14)
  return Math.max(0, Math.min(100, score))
}

export function levelOf(score: number): LevelId {
  if (score >= 70) return 'severe'
  if (score >= 40) return 'medium'
  if (score >= 15) return 'mild'
  return 'clean'
}

// 从后往前替换，避免前面的下标因长度变化而失效
function rewrite(text: string, matches: Match[]): string {
  const replacements = matches
    .filter((m): m is Match & { replacement: string } => m.replacement !== undefined)
    .sort((a, b) => b.start - a.start)

  let out = text
  for (const m of replacements) {
    const before = out.slice(0, m.start)
    const atStart = before.trim().length === 0 || /[.!?。！？\n]\s*$/.test(before)
    const rep = atStart && /^[a-z]/.test(m.replacement)
      ? m.replacement[0].toUpperCase() + m.replacement.slice(1)
      : m.replacement
    out = before + rep + out.slice(m.end)
  }
  return out
}

export function analyze(text: string, strict = false): AnalysisResult {
  const candidates: Match[] = []
  for (const rule of RULES) {
    const found = collect(rule, text)
    // 严格模式下忽略 minCount 门槛，单次出现的连接词也计入
    if (!strict && rule.minCount && found.length < rule.minCount) continue
    candidates.push(...found)
  }

  const matches = dedupe(candidates)
  const wordCount = countTokens(text)
  const score = calcScore(matches, wordCount, strict)

  return {
    score,
    level: levelOf(score),
    matches,
    wordCount,
    readability: calcReadability(text),
    rewritten: rewrite(text, matches),
  }
}

// 生成纯文本分享卡，方便直接复制到群聊或 issue
export function buildShareCard(result: AnalysisResult): string {
  const meta = LEVELS[result.level]
  const top = result.matches.slice(0, 3)
  const lines = [
    '🚨 SlopCheck · AI 味检测报告',
    '',
    `AI 味指数：${result.score} / 100  （${meta.label}）`,
    `检测词数：${result.wordCount}   命中：${result.matches.length}   可读性：${result.readability}`,
    '',
    'Top 3 命中：',
    ...(top.length
      ? top.map(
          (m, i) =>
            `${i + 1}. [${categoryLabel(m.category)}] “${m.text}” → ${m.suggestion}`,
        )
      : ['（没有命中，非常清爽 ✨）']),
    '',
    meta.desc,
    '—— 由 SlopCheck 生成',
  ]
  return lines.join('\n')
}
