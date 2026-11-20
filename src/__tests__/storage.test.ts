import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getHistory,
  addHistory,
  removeHistory,
  clearHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
  getSettings,
  saveSettings,
  makeId,
  DEFAULT_SETTINGS,
  type HistoryEntry,
} from '../storage'

// 轻量内存版 localStorage，避免依赖浏览器环境
function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => void map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size
    },
  }
}

const makeEntry = (id: string): HistoryEntry => ({
  id,
  text: 'sample',
  score: 42,
  level: 'medium',
  hits: 3,
  categories: { cliche: 1, pattern: 1, chinese: 0, emoji: 1, filler: 0 },
  createdAt: Date.now(),
})

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage())
})

describe('历史记录', () => {
  it('初始为空数组', () => {
    expect(getHistory()).toEqual([])
  })

  it('addHistory 后能读回同一条记录', () => {
    addHistory(makeEntry('a'))
    const list = getHistory()
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('a')
  })

  it('新记录排在最前', () => {
    addHistory(makeEntry('a'))
    addHistory(makeEntry('b'))
    expect(getHistory().map((e) => e.id)).toEqual(['b', 'a'])
  })

  it('历史最多保留 200 条', () => {
    for (let i = 0; i < 205; i++) addHistory(makeEntry(`id-${i}`))
    expect(getHistory()).toHaveLength(200)
  })

  it('removeHistory 只删除指定 id', () => {
    addHistory(makeEntry('a'))
    addHistory(makeEntry('b'))
    removeHistory('a')
    expect(getHistory().map((e) => e.id)).toEqual(['b'])
  })

  it('clearHistory 清空全部', () => {
    addHistory(makeEntry('a'))
    clearHistory()
    expect(getHistory()).toEqual([])
  })

  it('脏数据（非 JSON）降级为空数组而不抛错', () => {
    localStorage.setItem('slopcheck:history', 'not-json{{')
    expect(getHistory()).toEqual([])
  })

  it('类型不符（对象而非数组）降级为空数组', () => {
    localStorage.setItem('slopcheck:history', JSON.stringify({ oops: true }))
    expect(getHistory()).toEqual([])
  })
})

describe('收藏', () => {
  it('添加与移除收藏', () => {
    addFavorite({ id: 'f1', name: 'n', desc: 'd', text: 't', createdAt: 1 })
    expect(getFavorites()).toHaveLength(1)
    removeFavorite('f1')
    expect(getFavorites()).toEqual([])
  })
})

describe('设置', () => {
  it('无存储时返回默认设置', () => {
    expect(getSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('保存后能读回自定义设置', () => {
    saveSettings({ ...DEFAULT_SETTINGS, strictMode: true })
    expect(getSettings().strictMode).toBe(true)
  })
})

describe('makeId', () => {
  it('连续生成不重复', () => {
    const ids = new Set(Array.from({ length: 100 }, () => makeId()))
    expect(ids.size).toBe(100)
  })
})
