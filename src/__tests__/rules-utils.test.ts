import { describe, it, expect } from 'vitest'
import { RULES, CATEGORIES, CATEGORY_WEIGHT, LEVELS, categoryLabel, categoryColor } from '../rules'
import {
  emptyCategoryCounts,
  categoryCountsFrom,
  truncate,
  prettyPattern,
  levelColor,
  formatTime,
} from '../utils'
import type { Match } from '../types'

const VALID_CATEGORIES: Record<string, true> = {
  cliche: true,
  pattern: true,
  chinese: true,
  emoji: true,
  filler: true,
}

describe('RULES 规则库', () => {
  it('每条规则的字段完整且类别合法', () => {
    expect(RULES.length).toBeGreaterThan(20)
    for (const rule of RULES) {
      expect(VALID_CATEGORIES[rule.category]).toBe(true)
      expect(rule.source.length).toBeGreaterThan(0)
      expect(rule.reason.length).toBeGreaterThan(0)
      expect(rule.suggestion.length).toBeGreaterThan(0)
    }
  })

  it('规则正则都能被成功编译且无重复源码', () => {
    const seen = new Set<string>()
    for (const rule of RULES) {
      // 编译失败会抛异常，这就是失败信号
      expect(() => new RegExp(rule.source, rule.flags)).not.toThrow()
      expect(seen.has(rule.source)).toBe(false)
      seen.add(rule.source)
    }
  })

  it('覆盖全部五种类别', () => {
    const covered = new Set(RULES.map((r) => r.category))
    for (const c of Object.keys(VALID_CATEGORIES)) expect(covered.has(c as never)).toBe(true)
  })
})

describe('类别与权重映射', () => {
  it('CATEGORIES 恰好五类且 id 唯一', () => {
    expect(CATEGORIES).toHaveLength(5)
    const ids = new Set(CATEGORIES.map((c) => c.id))
    expect(ids.size).toBe(5)
  })

  it('每类都有正权重', () => {
    for (const c of CATEGORIES) {
      expect(CATEGORY_WEIGHT[c.id]).toBeGreaterThan(0)
    }
  })

  it('categoryLabel / categoryColor 返回具体展示值', () => {
    expect(categoryLabel('cliche')).toBe('英文陈词')
    expect(categoryColor('cliche')).toBe('#ff5b6e')
  })

  it('LEVELS 四个等级齐全且带描述', () => {
    for (const id of ['severe', 'medium', 'mild', 'clean'] as const) {
      expect(LEVELS[id].label.length).toBeGreaterThan(0)
      expect(LEVELS[id].desc.length).toBeGreaterThan(0)
    }
  })
})

describe('utils 统计与格式化', () => {
  it('emptyCategoryCounts 五类全为 0', () => {
    const counts = emptyCategoryCounts()
    expect(Object.keys(counts)).toHaveLength(5)
    for (const v of Object.values(counts)) expect(v).toBe(0)
  })

  it('categoryCountsFrom 按类别累加命中', () => {
    const mk = (category: Match['category']): Match => ({
      id: Math.random().toString(36),
      category,
      text: 'x',
      start: 0,
      end: 1,
      reason: '',
      suggestion: '',
      weight: 1,
    })
    const counts = categoryCountsFrom([mk('cliche'), mk('cliche'), mk('chinese')])
    expect(counts.cliche).toBe(2)
    expect(counts.chinese).toBe(1)
    expect(counts.pattern).toBe(0)
  })

  it('truncate 压缩空白并在超长时加省略号', () => {
    expect(truncate('a   b\n\tc', 100)).toBe('a b c')
    expect(truncate('abcdef', 3)).toBe('abc…')
    expect(truncate('abc', 10)).toBe('abc')
  })

  it('prettyPattern 把正则源码转成可读词', () => {
    expect(prettyPattern('\\bdelve\\s+into\\b')).toBe('delve into')
  })

  it('levelColor 为每个等级返回颜色', () => {
    expect(levelColor('severe')).toMatch(/^#/)
    expect(levelColor('clean')).toMatch(/^#/)
  })

  it('formatTime 输出 YYYY-MM-DD HH:mm', () => {
    const ts = new Date(2026, 0, 5, 9, 7).getTime()
    expect(formatTime(ts)).toBe('2026-01-05 09:07')
  })
})
