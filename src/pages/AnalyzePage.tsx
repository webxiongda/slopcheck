import { useEffect, useMemo, useState } from 'react'
import { analyze, buildShareCard } from '../analyzer'
import { CATEGORIES, LEVELS } from '../rules'
import { SAMPLES } from '../samples'
import type { AnalysisResult, CategoryId } from '../types'
import { CopyButton, Gauge, HighlightedText, HitItem, StatChip, withAlpha } from '../components'
import { addFavorite, addHistory, getFavorites, getHistory, getSettings, makeId, removeFavorite } from '../storage'
import { clearPendingText, readPendingText } from '../router'
import { categoryCountsFrom, truncate } from '../utils'

export default function AnalyzePage() {
  const [text, setText] = useState(() => {
    const draft = readPendingText()
    return draft ?? SAMPLES[0].text
  })
  const [settings, setSettings] = useState(getSettings)
  const [result, setResult] = useState<AnalysisResult>(() => analyze(readPendingText() ?? SAMPLES[0].text, getSettings().strictMode))
  const [analyzing, setAnalyzing] = useState(false)
  const [activeSample, setActiveSample] = useState(() => (readPendingText() ? -1 : 0))
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const [favoriteTexts, setFavoriteTexts] = useState<string[]>(() => getFavorites().map((f) => f.text))

  // 进入页面后消费一次跨页面草稿，避免重复回填
  useEffect(() => {
    clearPendingText()
    setSettings(getSettings())
  }, [])

  // 输入变化后做一次短延迟检测，留出可见的加载反馈
  useEffect(() => {
    setAnalyzing(true)
    const id = window.setTimeout(() => {
      const next = analyze(text, settings.strictMode)
      setResult(next)
      setAnalyzing(false)
      // 自动保存只在文本非空且与最近一条不同时写入，避免逐字刷屏
      const latest = getHistory()[0]
      if (getSettings().autoSave && text.trim() && latest?.text !== text) {
        addHistory({
          id: makeId(),
          text,
          score: next.score,
          level: next.level,
          hits: next.matches.length,
          categories: categoryCountsFrom(next.matches),
          createdAt: Date.now(),
        })
      }
    }, 260)
    return () => window.clearTimeout(id)
  }, [text, settings.strictMode])

  const shareText = useMemo(() => buildShareCard(result), [result])
  const meta = LEVELS[result.level]
  const counts = useMemo(() => categoryCountsFrom(result.matches), [result])
  const visibleMatches =
    filter === 'all' ? result.matches : result.matches.filter((m) => m.category === filter)
  const favorited = favoriteTexts.includes(text)

  function toggleFavorite() {
    if (!text.trim()) return
    if (favorited) {
      const fav = getFavorites().find((f) => f.text === text)
      if (fav) removeFavorite(fav.id)
    } else {
      addFavorite({
        id: makeId(),
        name: truncate(text, 16) || '未命名示例',
        desc: '从检测工作台收藏',
        text,
        createdAt: Date.now(),
      })
    }
    setFavoriteTexts(getFavorites().map((f) => f.text))
  }

  return (
    <>
      <header className="hero">
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
              <button className="ghost-btn" type="button" onClick={toggleFavorite}>
                {favorited ? '★ 已收藏' : '☆ 收藏'}
              </button>
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
          {settings.strictMode && (
            <div className="mode-note">严格模式已开启：单次连接词也会计入命中，分数系数更高。</div>
          )}
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
            <span>{settings.showHighlight ? '按类别着色' : '已在设置里关闭'}</span>
          </div>
          <div className={`preview ${analyzing ? 'is-loading' : ''}`}>
            {text ? (
              settings.showHighlight ? (
                <HighlightedText text={text} matches={result.matches} />
              ) : (
                text
              )
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
    </>
  )
}
