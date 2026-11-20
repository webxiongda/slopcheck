import { useEffect, useState } from 'react'
import { readDraft, clearDraft } from './storage'

export interface RouteDef {
  path: string
  label: string
  icon: string
}

export const ROUTES: RouteDef[] = [
  { path: 'analyze', label: '检测工作台', icon: '✦' },
  { path: 'rules', label: '规则库', icon: '▤' },
  { path: 'history', label: '检测历史', icon: '◷' },
  { path: 'compare', label: '改写对照', icon: '⇄' },
  { path: 'batch', label: '批量检测', icon: '▦' },
  { path: 'examples', label: '示例库', icon: '❖' },
  { path: 'stats', label: '数据统计', icon: '◫' },
  { path: 'guide', label: '使用指南', icon: '?' },
  { path: 'about', label: '关于与热点', icon: 'ⓘ' },
  { path: 'settings', label: '设置', icon: '⚙' },
]

// hash 路由：未知路径统一回落到工作台，嵌在 iframe 里也能用相对路径
export function readRoute(): string {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  return ROUTES.some((r) => r.path === raw) ? raw : 'analyze'
}

export function navigate(path: string): void {
  const target = `#/${path}`
  if (window.location.hash === target) {
    window.dispatchEvent(new Event('hashchange'))
  } else {
    window.location.hash = target
  }
}

let pendingText: string | null = null

// 跨页面把文本回填到工作台：模块内变量 + localStorage 双通道，刷新也不丢
export function goToAnalyze(text?: string): void {
  if (text !== undefined && text.trim()) {
    pendingText = text
    try {
      // Technical: persist the cross-page draft when available
      localStorage.setItem('slopcheck:draft', text)
    } catch {
      /* localStorage unavailable */
    }
  }
  navigate('analyze')
}

export function readPendingText(): string | null {
  return pendingText ?? readDraft()
}

export function clearPendingText(): void {
  pendingText = null
  clearDraft()
}

export function useRoute(): string {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const onChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
