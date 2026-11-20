import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { analyze, buildShareCard } from './analyzer'
import { CATEGORIES, LEVELS, categoryColor, categoryLabel } from './rules'
import { SAMPLES } from './samples'
import type { AnalysisResult, CategoryId, Match } from './types'

// 把 #rrggbb 转成带透明度的 rgba，用于高亮底色
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// SVG 环形仪表盘：渐变随分数推进，从绿到红
function Gauge({ score, color }: { score: number; color: string }) {
  const radius = 68
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)

  return (
    <div className="gauge">
      <svg viewBox="0 0 180 180" role="img" aria-label={`AI 味指数 ${score} 分`}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2ed573" />
            <stop offset="50%" stopColor="#ffa502" />
            <stop offset="100%" stopColor="#ff4757" />
          </linearGradient>
          <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="14" />
        <circle
          className="gauge-arc"
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          filter="url(#gaugeGlow)"
        />
      </svg>
      <div className="gauge-center">
        <span className="gauge-num" style={{ color }}>{score}</span>
        <span className="gauge-unit">/ 100</span>
        <span className="gauge-cap">AI 味指数</span>
      </div>
    </div>
  )
}

function CopyButton({ text, children = '复制' }: { text: string; children?: ReactNode }) {
  const [done, setDone] = useState(false)

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // 非安全上下文下的兜底方案
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      }
      setDone(true)
      window.setTimeout(() => setDone(false), 1600)
    } catch {
      // 浏览器拒绝复制时保持按钮原样
    }
  }

  return (
    <button className={`copy-btn ${done ? 'done' : ''}`} onClick={handleCopy} type="button">
      {done ? '✓ 已复制' : children}
    </button>
  )
}

function StatChip({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="stat-chip">
      <span className="stat-label">{label}</span>
      <strong style={color ? { color } : undefined}>{value}</strong>
    </div>
  )
}

// 在原文里用 <mark> 标出命中片段
function HighlightedText({ text, matches }: { text: string; matches: Match[] }) {
  if (!matches.length) return <>{text}</>
  const nodes: ReactNode[] = []
  let cursor = 0

  for (const m of matches) {
    if (m.start > cursor) nodes.push(text.slice(cursor, m.start))
    const color = categoryColor(m.category)
    nodes.push(
      <mark
        key={m.id}
        className="hit-mark"
        title={m.reason}
        style={{
          color,
          background: withAlpha(color, 0.16),
          boxShadow: `inset 0 -2px 0 ${color}`,
        }}
      >
        {m.text}
      </mark>,
    )
    cursor = m.end
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return <>{nodes}</>
}

function HitItem({ match, index }: { match: Match; index: number }) {
  const color = categoryColor(match.category)
  return (
    <article
      className="hit-item"
      style={{ borderLeftColor: color, animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      <div className="hit-top">
        <span className="hit-cat" style={{ color, background: withAlpha(color, 0.14) }}>
          {categoryLabel(match.category)}
        </span>
        <span className="hit-pos">位置 {match.start}</span>
      </div>
      <div className="hit-text">“{match.text}”</div>
      <div className="hit-reason">{match.reason}</div>
      <div className="hit-fix">
        <span>建议</span>
        {match.suggestion}
      </div>
    </article>
  )
}

export default function App() {
  const [text, setText] = useState(SAMPLES[0].text)
  const [result, setResult] = useState<AnalysisResult>(() => analyze(SAMPLES[0].text))
  const [analyzing, setAnalyzing] = useState(false)
  const [activeSample, setActiveSample] = useState(0)
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')

  // 输入变化后做一次短延迟检测，留出可见的加载反馈
  useEffect(() => {
    setAnalyzing(true)
    const id = window.setTimeout(() => {
      setResult(analyze(text))
      setAnalyzing(false)
    }, 260)
    return () => window.clearTimeout(id)
  }, [text])

  const shareText = useMemo(() => buildShareCard(result), [result])
  const meta = LEVELS[result.level]
  const counts = useMemo(() => {
    const map = {} as Record<CategoryId, number>
    for (const c of CATEGORIES) map[c.id] = 0
    for (const m of result.matches) map[m.category] += 1
    return map
  }, [result])
  const visibleMatches =
    filter === 'all' ? result.matches : result.matches.filter((m) => m.category === filter)

  return (
    <div className="app-shell">
      <div className="bg-glow glow-a" />
      <div className="bg-glow glow-b" />

      <header className="hero">
        <div className="brand-row">
          <span className="logo-mark">✦</span>
          <span className="brand">SlopCheck</span>
          <span className="version">v1.0</span>
        </div>
        <h1>
          你的文字，<span className="grad">有 AI 味吗？</span>
        </h1>
        <p className="subtitle">
          粘贴文案或代码，实时揪出陈词滥调、模板句式与黑话堆砌，并给出能直接用的朴素改法。
        </p>
        <div className="hero-tags">
          <span>零依赖规则引擎</span>
          <span>中英双语</span>
          <span>一键去味</span>
          <span>本地运行 · 不上传</span>
        </div>
      </header>

      <main className="workspace">
        <section className="panel input-panel">
          <div className="panel-head">
            <h2>输入文本</h2>
            <div className="head-actions">
              <span className={`live ${analyzing ? 'busy' : ''}`}>
                <i />
                {analyzing ? '检测中…' : '实时检测'}
              </span>
              <button
                className="ghost-btn"
                type="button"
                onClick={() => {
                  setText('')
                  setActiveSample(-1)
                }}
              >
                清空
              </button>
            </div>
          </div>

          <div className="samples">
            {SAMPLES.map((sample, i) => (
              <button
                key={sample.name}
                type="button"
                title={sample.desc}
                className={`sample-chip ${activeSample === i ? 'active' : ''}`}
                onClick={() => {
                  setText(sample.text)
                  setActiveSample(i)
                  setFilter('all')
                }}
              >
                {sample.name}
              </button>
            ))}
          </div>

          <textarea
            className="editor"
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setActiveSample(-1)
            }}
            placeholder="在这里粘贴你想检测的文案或代码…"
            spellCheck={false}
          />
          <div className="editor-foot">
            <span>{text.length} 字符</span>
            <span>支持 中文 / English / 代码</span>
          </div>

          <div className="stats-bar">
            <StatChip label="检测词数" value={result.wordCount} />
            <StatChip label="命中数" value={result.matches.length} color="#ff9f45" />
            <StatChip label="可读性" value={result.readability} color="#2ed573" />
            <StatChip label="等级" value={meta.label} color={meta.color} />
          </div>
        </section>

        <section className="panel result-panel">
          <div className="panel-head">
            <h2>检测结果</h2>
            <span
              className="level-badge"
              style={{ color: meta.color, background: withAlpha(meta.color, 0.14), borderColor: withAlpha(meta.color, 0.4) }}
            >
              {meta.label}
            </span>
          </div>

          <div className={`gauge-row ${analyzing ? 'is-loading' : ''}`}>
            <Gauge score={result.score} color={meta.color} />
            <div className="gauge-copy">
              <div className="score-caption">
                <span style={{ color: meta.color }}>{meta.desc}</span>
              </div>
              <div className="legend">
                {CATEGORIES.map((c) => (
                  <span key={c.id} className="legend-item" title={c.hint}>
                    <i style={{ background: c.color }} />
                    {c.label}
                    <b>{counts[c.id]}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="section-title">
            <h3>命中明细</h3>
            <span>{result.matches.length} 条</span>
          </div>

          <div className="filters">
            <button
              type="button"
              className={`filter ${filter === 'all' ? 'on' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部 <b>{result.matches.length}</b>
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`filter ${filter === c.id ? 'on' : ''}`}
                style={
                  filter === c.id
                    ? { color: c.color, borderColor: withAlpha(c.color, 0.5), background: withAlpha(c.color, 0.12) }
                    : undefined
                }
                onClick={() => setFilter(c.id)}
              >
                {c.label} <b>{counts[c.id]}</b>
              </button>
            ))}
          </div>

          <div className="hits">
            {visibleMatches.length ? (
              visibleMatches.map((m, i) => <HitItem key={m.id} match={m} index={i} />)
            ) : (
              <div className="empty-state">
                <span>✓</span>
                {result.matches.length ? '这个类别没有命中' : '没有命中，文字很干净'}
              </div>
            )}
          </div>

          <div className="section-title">
            <h3>原文高亮</h3>
            <span>按类别着色</span>
          </div>
          <div className={`preview ${analyzing ? 'is-loading' : ''}`}>
            {text ? (
              <HighlightedText text={text} matches={result.matches} />
            ) : (
              <span className="muted">输入内容后，这里会标出命中位置…</span>
            )}
          </div>

          <div className="section-title">
            <h3>一键去味</h3>
            <CopyButton text={result.rewritten}>复制改写</CopyButton>
          </div>
          <div className={`rewrite-box ${analyzing ? 'is-loading' : ''}`}>
            {result.rewritten ? result.rewritten : <span className="muted">改写结果会显示在这里…</span>}
          </div>

          <div className="section-title">
            <h3>分享卡</h3>
            <CopyButton text={shareText}>复制卡片</CopyButton>
          </div>
          <textarea className="share-card" value={shareText} readOnly aria-label="分享卡文本" />
        </section>
      </main>

      <footer className="footer">
        规则全部在浏览器本地运行，文本不会离开你的设备 · 命中词表在 <code>src/rules.ts</code>，欢迎提 PR
      </footer>
    </div>
  )
}
