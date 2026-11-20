import { describe, it, expect } from 'vitest'
import { analyze, levelOf, buildShareCard } from '../analyzer'

describe('levelOf', () => {
  it('分数到等级映射覆盖所有边界', () => {
    expect(levelOf(100)).toBe('severe')
    expect(levelOf(70)).toBe('severe')
    expect(levelOf(69)).toBe('medium')
    expect(levelOf(40)).toBe('medium')
    expect(levelOf(39)).toBe('mild')
    expect(levelOf(15)).toBe('mild')
    expect(levelOf(14)).toBe('clean')
    expect(levelOf(0)).toBe('clean')
  })

  it('负数与超范围分数也能稳定降级/封顶', () => {
    expect(levelOf(-10)).toBe('clean')
    expect(levelOf(150)).toBe('severe')
  })
})

describe('analyze', () => {
  it('空字符串返回清爽的零结果', () => {
    const r = analyze('')
    expect(r.score).toBe(0)
    expect(r.level).toBe('clean')
    expect(r.matches).toEqual([])
    expect(r.wordCount).toBe(0)
    expect(r.readability).toBe(100)
    expect(r.rewritten).toBe('')
  })

  it('中性文本不应被误判为 AI 味', () => {
    const r = analyze('The cat sat on the mat.')
    expect(r.matches).toHaveLength(0)
    expect(r.score).toBe(0)
    expect(r.level).toBe('clean')
  })

  it('命中 AI 陈词时得分与命中数都上升', () => {
    const r = analyze('We delve into the landscape and leverage robust seamless solutions.')
    expect(r.matches.length).toBeGreaterThan(0)
    expect(r.score).toBeGreaterThan(0)
    expect(r.score).toBeLessThanOrEqual(100)
  })

  it('重叠命中会被去重：delve into 只保留更长的一条', () => {
    const r = analyze('delve into')
    const hits = r.matches.filter((m) => m.text.toLowerCase().startsWith('delve'))
    expect(hits).toHaveLength(1)
    expect(hits[0].text.toLowerCase()).toBe('delve into')
  })

  it('严格模式分数不低于普通模式', () => {
    const text = 'We use a simple tool.'
    const normal = analyze(text, false)
    const strict = analyze(text, true)
    expect(strict.score).toBeGreaterThanOrEqual(normal.score)
  })

  it('分数始终落在 0-100 区间', () => {
    const samples = ['', 'a', 'delve'.repeat(200), 'The quick brown fox jumps over the lazy dog.']
    for (const s of samples) {
      const r = analyze(s)
      expect(r.score).toBeGreaterThanOrEqual(0)
      expect(r.score).toBeLessThanOrEqual(100)
    }
  })

  it('一键去味会把陈词替换为更朴素的表达', () => {
    const r = analyze('We delve into it.')
    expect(r.rewritten).toContain('explore')
    expect(r.rewritten.toLowerCase()).not.toContain('delve')
  })

  it('可读性：短句高分，超长句低分', () => {
    const short = analyze('Short sentence.')
    const long = analyze(
      'This is an intentionally very long sentence that keeps going well past the point where any reader would naturally expect it to stop, piling clause upon clause without a single break or breather.',
    )
    expect(short.readability).toBeGreaterThan(long.readability)
    expect(short.readability).toBeLessThanOrEqual(100)
    expect(long.readability).toBeGreaterThanOrEqual(0)
  })

  it('每个命中的 start/end 下标与文本一致', () => {
    const text = 'We leverage robust solutions.'
    const r = analyze(text)
    for (const m of r.matches) {
      expect(text.slice(m.start, m.end)).toBe(m.text)
    }
  })
})

describe('buildShareCard', () => {
  it('包含分数、命中与生成标识', () => {
    const r = analyze('We delve into the robust landscape.')
    const card = buildShareCard(r)
    expect(card).toContain('SlopCheck')
    expect(card).toContain(String(r.score))
    expect(card).toContain('Top 3')
  })

  it('清爽结果给出正向文案而非空列表', () => {
    const card = buildShareCard(analyze('The cat sat on the mat.'))
    expect(card).toContain('非常清爽')
  })
})
