import { CATEGORIES } from './rules'
import type { CategoryId, LevelId, Match } from './types'

export function emptyCategoryCounts(): Record<CategoryId, number> {
  const map = {} as Record<CategoryId, number>
  for (const c of CATEGORIES) map[c.id] = 0
  return map
}

export function categoryCountsFrom(matches: Match[]): Record<CategoryId, number> {
  const map = emptyCategoryCounts()
  for (const m of matches) map[m.category] += 1
  return map
}

export function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function truncate(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max)}…` : flat
}

export function levelColor(level: LevelId): string {
  const colors: Record<LevelId, string> = {
    severe: '#ff4757',
    medium: '#ff9f43',
    mild: '#ffd32a',
    clean: '#2ed573',
  }
  return colors[level]
}

// 把正则源码整理成可读的「词」，规则库里同时保留原始正则供核对
export function prettyPattern(source: string): string {
  return source
    .replace(/\\u2014\{2,\}/g, '——')
    .replace(/\\b/g, '')
    .replace(/\\s\+/g, ' ')
    .replace(/\\s\*/g, '')
    .replace(/\[-\\s\]\?/g, '-')
    .replace(/\[\^.!?\\n\]\{1,80\}/g, ' … ')
    .replace(/\(\?:([^)]*)\)\?/g, '$1')
    .replace(/\(\?:([^)]*)\)/g, '$1')
    .replace(/\\p\{Extended_Pictographic\}/g, 'emoji')
    .replace(/\{2,\}/g, '')
    .replace(/\\/g, '')
    .trim()
}
