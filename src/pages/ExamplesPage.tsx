import { useMemo, useState } from 'react'
import { analyze } from '../analyzer'
import { SAMPLES } from '../samples'
import type { Sample } from '../samples'
import { CopyButton } from '../components'
import { goToAnalyze } from '../router'
import { addFavorite, getFavorites, makeId, removeFavorite } from '../storage'
import type { Favorite } from '../storage'
import { levelColor, truncate } from '../utils'

export default function ExamplesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>(getFavorites)
  const [draftName, setDraftName] = useState('')
  const [draftText, setDraftText] = useState('')

  function refresh() {
    setFavorites(getFavorites())
  }

  function toggleSample(sample: Sample) {
    const existing = favorites.find((f) => f.text === sample.text)
    if (existing) {
      removeFavorite(existing.id)
    } else {
      addFavorite({
        id: makeId(),
        name: sample.name,
        desc: sample.desc,
        text: sample.text,
        createdAt: Date.now(),
      })
    }
    refresh()
  }

  function addCustom() {
    if (!draftText.trim()) return
    addFavorite({
      id: makeId(),
      name: draftName.trim() || truncate(draftText, 16) || '自定义示例',
      desc: '我收藏的片段',
      text: draftText,
      createdAt: Date.now(),
    })
    setDraftName('')
    setDraftText('')
    refresh()
  }

  const all = useMemo(() => [...SAMPLES.map((s, i) => ({ ...s, key: `builtin-${i}`, score: analyze(s.text).score }))], [])
  const favItems = useMemo(
    () => favorites.map((f) => ({ ...f, score: analyze(f.text).score })),
    [favorites],
  )

  return (
    <>
      <header className="page-head">
        <h1>示例库</h1>
        <p>内置示例覆盖重度 AI 味、技术文案和正常表达。收藏的示例保存在本地，点「去检测」直达工作台。</p>
      </header>

      <main className="page-body">
        <section className="panel">
          <div className="panel-head"><h2>内置示例</h2><span className="muted">{all.length} 个</span></div>
          <div className="example-grid">
            {all.map((s) => {
              const faved = favorites.some((f) => f.text === s.text)
              const color = levelColor(analyze(s.text).level)
              return (
                <article key={s.key} className="example-card">
                  <div className="example-head">
                    <h3>{s.name}</h3>
                    <span className="score-pill" style={{ color, background: `${color}18` }}>{s.score} 分</span>
                  </div>
                  <p className="example-desc">{s.desc}</p>
                  <pre className="example-preview">{truncate(s.text, 150)}</pre>
                  <div className="example-actions">
                    <button className="ghost-btn" type="button" onClick={() => goToAnalyze(s.text)}>去检测 →</button>
                    <button className="ghost-btn" type="button" onClick={() => toggleSample(s)}>
                      {faved ? '★ 取消收藏' : '☆ 收藏'}
                    </button>
                    <CopyButton text={s.text}>复制</CopyButton>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>我的收藏</h2><span className="muted">{favItems.length} 个</span></div>
          {favItems.length ? (
            <div className="example-grid">
              {favItems.map((f) => {
                const color = levelColor(analyze(f.text).level)
                return (
                  <article key={f.id} className="example-card">
                    <div className="example-head">
                      <h3>{f.name}</h3>
                      <span className="score-pill" style={{ color, background: `${color}18` }}>{f.score} 分</span>
                    </div>
                    <p className="example-desc">{f.desc}</p>
                    <pre className="example-preview">{truncate(f.text, 150)}</pre>
                    <div className="example-actions">
                      <button className="ghost-btn" type="button" onClick={() => goToAnalyze(f.text)}>去检测 →</button>
                      <button className="ghost-btn" type="button" onClick={() => { removeFavorite(f.id); refresh() }}>删除</button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">还没有收藏。点击内置示例的「收藏」，或在下方添加自己的片段。</div>
          )}

          <div className="add-favorite">
            <input
              className="search-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="名称（可留空）"
              aria-label="收藏名称"
            />
            <textarea
              className="mini-editor"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="粘贴你想收藏的文字片段…"
              aria-label="收藏文本"
            />
            <button className="ghost-btn" type="button" onClick={addCustom} disabled={!draftText.trim()}>
              添加到收藏
            </button>
          </div>
        </section>
      </main>
    </>
  )
}
