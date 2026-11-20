import { useState } from 'react'
import type { ReactNode } from 'react'
import { categoryColor, categoryLabel } from './rules'
import type { Match } from './types'

// 把 #rrggbb 转成带透明度的 rgba，用于高亮底色
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// SVG 环形仪表盘：渐变随分数推进，从绿到红
export function Gauge({ score, color }: { score: number; color: string }) {
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

export function CopyButton({ text, children = '复制' }: { text: string; children?: ReactNode }) {
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

export function StatChip({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="stat-chip">
      <span className="stat-label">{label}</span>
      <strong style={color ? { color } : undefined}>{value}</strong>
    </div>
  )
}

// 在原文里用 <mark> 标出命中片段
export function HighlightedText({ text, matches }: { text: string; matches: Match[] }) {
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

export function HitItem({ match, index }: { match: Match; index: number }) {
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
