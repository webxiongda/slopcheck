import { useMemo, useState } from 'react'
import { analyze, levelOf } from '../analyzer'
import { CATEGORIES, LEVELS } from '../rules'
import { SAMPLES } from '../samples'
import { getHistory } from '../storage'
import type { HistoryEntry } from '../storage'
import type { CategoryId } from '../types'
import { categoryCountsFrom, emptyCategoryCounts, levelColor, truncate } from '../utils'

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number): string {
  const a = polar(cx, cy, r, start)
  const b = polar(cx, cy, r, Math.min(end, start + 359.99))
  const large = end - start > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y} Z`
}

// 无历史时用内置示例构造一组可解释的演示数据
function demoHistory(): HistoryEntry[] {
  const scores = [88, 64, 6]
  const builtin = SAMPLES.map((s, i) => {
    const a = analyze(s.text)
    return {
      id: `demo-${i}`,
      text: s.text,
      score: scores[i],
      level: levelOf(scores[i]),
      hits: a.matches.length,
      categories: categoryCountsFrom(a.matches),
      createdAt: Date.now() - (2 - i) * 3600_000,
    }
  })
  const extras: { score: number; ago: number; cats: Partial<Record<CategoryId, number>> }[] = [
    { score: 72, ago: 9 * 3600_000, cats: { cliche: 5, pattern: 3, emoji: 1 } },
    { score: 51, ago: 26 * 3600_000, cats: { cliche: 2, chinese: 3, filler: 2 } },
    { score: 33, ago: 50 * 3600_000, cats: { pattern: 1, filler: 3 } },
    { score: 19, ago: 74 * 3600_000, cats: { cliche: 1, emoji: 1 } },
    { score: 95, ago: 98 * 3600_000, cats: { cliche: 6, pattern: 4, chinese: 2, emoji: 1 } },
  ]
  return [
    ...builtin,
    ...extras.map((e, i) => {
      const cats = { ...emptyCategoryCounts(), ...e.cats }
      return {
        id: `demo-extra-${i}`,
        text: '演示记录：一段带有模板痕迹的示例文本。',
        score: e.score,
        level: levelOf(e.score),
        hits: Object.values(cats).reduce((s, n) => s + n, 0),
        categories: cats,
        createdAt: Date.now() - e.ago,
      }
    }),
  ]
}

export default function StatsPage() {
  const [useDemo, setUseDemo] = useState(() => getHistory().length === 0)
  const entries = useMemo(() => (useDemo ? demoHistory() : getHistory()), [useDemo])
  const isDemo = useDemo || getHistory().length === 0

  const avg = entries.length ? Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length) : 0
  const best = entries.length ? Math.min(...entries.map((e) => e.score)) : 0
  const worst = entries.length ? Math.max(...entries.map((e) => e.score)) : 0

  const levelCounts = useMemo(
    () => ({
      clean: entries.filter((e) => e.level === 'clean').length,
      mild: entries.filter((e) => e.level === 'mild').length,
      medium: entries.filter((e) => e.level === 'medium').length,
      severe: entries.filter((e) => e.level === 'severe').length,
    }),
    [entries],
  )
  const maxLevelCount = Math.max(1, ...Object.values(levelCounts))

  const categoryTotals = useMemo(() => {
    const totals = emptyCategoryCounts()
    for (const e of entries) {
      for (const c of CATEGORIES) totals[c.id] += e.categories?.[c.id] ?? 0
    }
    return totals
  }, [entries])
  const totalHits = Object.values(categoryTotals).reduce((s, n) => s + n, 0)
  const topCategory = CATEGORIES.reduce((bestCat, c) =>
    categoryTotals[c.id] > categoryTotals[bestCat.id] ? c : bestCat, CATEGORIES[0])

  const timeline = useMemo(
    () => [...entries].sort((a, b) => a.createdAt - b.createdAt).slice(-10),
    [entries],
  )
  const chartW = 560
  const chartH = 200
  const pointAt = (i: number, score: number) => ({
    x: timeline.length === 1 ? chartW / 2 : 34 + (i * (chartW - 68)) / (timeline.length - 1),
    y: 14 + ((100 - score) / 100) * (chartH - 40),
  })

  let pieAngle = 0
  const slices = CATEGORIES.filter((c) => categoryTotals[c.id] > 0).map((c) => {
    const start = pieAngle
    const sweep = (categoryTotals[c.id] / totalHits) * 360
    pieAngle += sweep
    return { meta: c, start, end: start + sweep }
  })

  return (
    <>
      <header className="page-head">
        <h1>数据统计</h1>
        <p>基于本地检测历史生成分数分布、命中类别占比与检测趋势。图表直接用 SVG 绘制，不依赖图表库。</p>
      </header>

      <main className="page-body">
        {isDemo && (
          <div className="demo-banner">
            当前没有历史记录，正在展示示例数据。
            {!useDemo && <button className="ghost-btn" type="button" onClick={() => setUseDemo(true)}>查看示例数据</button>}
            {useDemo && getHistory().length > 0 && (
              <button className="ghost-btn" type="button" onClick={() => setUseDemo(false)}>切换回我的历史</button>
            )}
          </div>
        )}

        <div className="summary-grid">
          <div className="summary-card"><span>检测次数</span><strong>{entries.length}</strong></div>
          <div className="summary-card"><span>平均 AI 味</span><strong>{avg}</strong></div>
          <div className="summary-card"><span>最低分</span><strong style={{ color: '#2ed573' }}>{best}</strong></div>
          <div className="summary-card"><span>最高分</span><strong style={{ color: '#ff4757' }}>{worst}</strong></div>
          <div className="summary-card"><span>最常见命中</span><strong style={{ color: topCategory.color }}>{topCategory.label}</strong></div>
        </div>

        <section className="panel chart-panel">
          <div className="panel-head"><h2>分数分布</h2><span className="muted">按等级分桶</span></div>
          <svg className="chart" viewBox={`0 0 ${chartW} ${chartH}`} role="img" aria-label="分数分布柱状图">
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1="36" x2={chartW - 12} y1={chartH - 30 - g * (chartH - 60)} y2={chartH - 30 - g * (chartH - 60)} stroke="rgba(255,255,255,.07)" />
            ))}
            {(['clean', 'mild', 'medium', 'severe'] as const).map((id, i) => {
              const meta = LEVELS[id]
              const count = levelCounts[id]
              const h = (count / maxLevelCount) * (chartH - 66)
              const x = 60 + i * 128
              return (
                <g key={id}>
                  <rect x={x} y={chartH - 30 - h} width="66" height={Math.max(h, 2)} rx="7" fill={meta.color} opacity="0.85" />
                  <text x={x + 33} y={chartH - 36 - h} fill="#e9ebf7" fontSize="13" textAnchor="middle">{count}</text>
                  <text x={x + 33} y={chartH - 10} fill="#8a90ae" fontSize="11" textAnchor="middle">{meta.label}</text>
                </g>
              )
            })}
          </svg>
        </section>

        <div className="chart-row">
          <section className="panel chart-panel">
            <div className="panel-head"><h2>命中类别占比</h2><span className="muted">共 {totalHits} 处</span></div>
            {totalHits ? (
              <div className="pie-layout">
                <svg className="pie-chart" viewBox="0 0 230 230" role="img" aria-label="命中类别占比饼图">
                  {slices.map((s) => (
                    <path key={s.meta.id} d={slicePath(115, 115, 88, s.start, s.end)} fill={s.meta.color} opacity="0.88" />
                  ))}
                  <circle cx="115" cy="115" r="50" fill="#111425" />
                  <text x="115" y="110" fill="#e9ebf7" fontSize="24" fontWeight="700" textAnchor="middle">{totalHits}</text>
                  <text x="115" y="132" fill="#8a90ae" fontSize="11" textAnchor="middle">总命中</text>
                </svg>
                <div className="pie-legend">
                  {CATEGORIES.map((c) => (
                    <div key={c.id} className="pie-legend-item">
                      <i style={{ background: c.color }} />
                      <span>{c.label}</span>
                      <b>{categoryTotals[c.id]}</b>
                      <small>{totalHits ? Math.round((categoryTotals[c.id] / totalHits) * 100) : 0}%</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">暂无命中数据</div>
            )}
          </section>

          <section className="panel chart-panel">
            <div className="panel-head"><h2>检测趋势</h2><span className="muted">最近 {timeline.length} 次</span></div>
            <svg className="chart" viewBox={`0 0 ${chartW} ${chartH}`} role="img" aria-label="检测趋势折线图">
              {[0, 25, 50, 75, 100].map((v) => {
                const y = 14 + ((100 - v) / 100) * (chartH - 40)
                return (
                  <g key={v}>
                    <line x1="34" x2={chartW - 12} y1={y} y2={y} stroke="rgba(255,255,255,.07)" />
                    <text x="8" y={y + 4} fill="#5d6382" fontSize="10">{v}</text>
                  </g>
                )
              })}
              {timeline.length > 1 && (
                <polyline
                  points={timeline.map((e, i) => {
                    const p = pointAt(i, e.score)
                    return `${p.x},${p.y}`
                  }).join(' ')}
                  fill="none"
                  stroke="#ff9f45"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              )}
              {timeline.map((e, i) => {
                const p = pointAt(i, e.score)
                return (
                  <circle key={e.id} cx={p.x} cy={p.y} r="4.5" fill={levelColor(e.level)}>
                    <title>{`${truncate(e.text, 24)} · ${e.score} 分`}</title>
                  </circle>
                )
              })}
            </svg>
          </section>
        </div>
      </main>
    </>
  )
}
