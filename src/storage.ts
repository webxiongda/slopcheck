import type { CategoryId, LevelId } from './types'

export interface HistoryEntry {
  id: string
  text: string
  score: number
  level: LevelId
  hits: number
  categories: Record<CategoryId, number>
  createdAt: number
}

export interface Favorite {
  id: string
  name: string
  desc: string
  text: string
  createdAt: number
}

export interface Settings {
  autoSave: boolean
  showHighlight: boolean
  strictMode: boolean
}

const KEYS = {
  history: 'slopcheck:history',
  favorites: 'slopcheck:favorites',
  settings: 'slopcheck:settings',
  draft: 'slopcheck:draft',
} as const

export const DEFAULT_SETTINGS: Settings = {
  autoSave: true,
  showHighlight: true,
  strictMode: false,
}

// JSON.parse 失败时降级为默认值，避免脏数据让整个应用白屏
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null || typeof parsed !== typeof fallback) return fallback
    return parsed as T
  } catch {
    return fallback
  }
}

// 隐私模式或配额用尽时写入会抛错，静默降级不影响主流程
function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* localStorage unavailable */
  }
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function getHistory(): HistoryEntry[] {
  const data = readJSON<HistoryEntry[]>(KEYS.history, [])
  return Array.isArray(data) ? data : []
}

export function addHistory(entry: HistoryEntry): void {
  // 上限 200 条，防止长期积累把 localStorage 撑满
  writeJSON(KEYS.history, [entry, ...getHistory()].slice(0, 200))
}

export function removeHistory(id: string): void {
  writeJSON(KEYS.history, getHistory().filter((e) => e.id !== id))
}

export function clearHistory(): void {
  writeJSON(KEYS.history, [])
}

export function getFavorites(): Favorite[] {
  const data = readJSON<Favorite[]>(KEYS.favorites, [])
  return Array.isArray(data) ? data : []
}

export function addFavorite(fav: Favorite): void {
  writeJSON(KEYS.favorites, [fav, ...getFavorites()].slice(0, 200))
}

export function removeFavorite(id: string): void {
  writeJSON(KEYS.favorites, getFavorites().filter((f) => f.id !== id))
}

export function getSettings(): Settings {
  const s = readJSON<Settings>(KEYS.settings, DEFAULT_SETTINGS)
  return {
    autoSave: typeof s.autoSave === 'boolean' ? s.autoSave : DEFAULT_SETTINGS.autoSave,
    showHighlight: typeof s.showHighlight === 'boolean' ? s.showHighlight : DEFAULT_SETTINGS.showHighlight,
    strictMode: typeof s.strictMode === 'boolean' ? s.strictMode : DEFAULT_SETTINGS.strictMode,
  }
}

export function saveSettings(settings: Settings): void {
  writeJSON(KEYS.settings, settings)
}

export function writeDraft(text: string): void {
  writeJSON(KEYS.draft, text)
}

export function readDraft(): string | null {
  try {
    return localStorage.getItem(KEYS.draft)
  } catch {
    return null
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEYS.draft)
  } catch {
    /* localStorage unavailable */
  }
}
