import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { ROUTES, useRoute } from './router'
import AnalyzePage from './pages/AnalyzePage'
import RulesPage from './pages/RulesPage'
import HistoryPage from './pages/HistoryPage'
import ComparePage from './pages/ComparePage'
import BatchPage from './pages/BatchPage'
import ExamplesPage from './pages/ExamplesPage'
import StatsPage from './pages/StatsPage'
import GuidePage from './pages/GuidePage'
import AboutPage from './pages/AboutPage'
import SettingsPage from './pages/SettingsPage'

const PAGES: Record<string, () => ReactElement> = {
  analyze: AnalyzePage,
  rules: RulesPage,
  history: HistoryPage,
  compare: ComparePage,
  batch: BatchPage,
  examples: ExamplesPage,
  stats: StatsPage,
  guide: GuidePage,
  about: AboutPage,
  settings: SettingsPage,
}

export default function App() {
  const route = useRoute()
  const current = ROUTES.find((r) => r.path === route) ?? ROUTES[0]

  useEffect(() => {
    // 默认进入工作台，兼容直接打开根路径的情况
    if (!window.location.hash) window.location.hash = '#/analyze'
  }, [])

  useEffect(() => {
    // 页面切换后滚回顶部
    window.scrollTo(0, 0)
  }, [route])

  const Page = PAGES[route] ?? AnalyzePage

  return (
    <div className="app-shell">
      <div className="bg-glow glow-a" />
      <div className="bg-glow glow-b" />

      <header className="topbar">
        <div className="brand-row">
          <span className="logo-mark">✦</span>
          <span className="brand">SlopCheck</span>
          <span className="version">v1.0</span>
        </div>
        <nav className="nav" aria-label="主导航">
          {ROUTES.map((r) => (
            <a
              key={r.path}
              href={`#/${r.path}`}
              className={`nav-link ${route === r.path ? 'active' : ''}`}
              aria-current={route === r.path ? 'page' : undefined}
              title={r.label}
            >
              <span className="nav-icon">{r.icon}</span>
              <span className="nav-label">{r.label}</span>
            </a>
          ))}
        </nav>
      </header>

      <div className="page-crumb">
        当前页面 <strong>{current.label}</strong>
        <span className="crumb-hint">所有数据仅保存在本地浏览器</span>
      </div>

      <Page key={route} />

      <footer className="footer">
        规则全部在浏览器本地运行，文本不会离开你的设备 · 命中词表在 <code>src/rules.ts</code>，欢迎提 PR
      </footer>
    </div>
  )
}
