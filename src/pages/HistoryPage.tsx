import { useState } from 'react'
import { LEVELS } from '../rules'
import { clearHistory, getHistory, removeHistory } from '../storage'
import { goToAnalyze, navigate } from '../router'
import { formatTime, levelColor, truncate } from '../utils'

export default function HistoryPage() {
  const [entries, setEntries] = useState(getHistory)

  function refresh() {
    setEntries(getHistory())
  }

  function handleClear() {
    if (window.confirm('确定清空全部检测历史？此操作不可撤销。')) {
      clearHistory()
      refresh()
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>检测历史</h1>
        <p>每次检测的文本、分数与命中情况都保存在本地浏览器。点任意一条即可回填到工作台继续修改。</p>
      </header>

      <main className="page-body">
        <section className="panel">
          <div className="panel-head">
            <h2>全部记录</h2>
            <div className="head-actions">
              <span className="muted">{entries.length} 条</span>
              <button className="ghost-btn" type="button" disabled={!entries.length} onClick={handleClear}>
                清空历史
              </button>
            </div>
          </div>

          {entries.length ? (
            <div className="history-list">
              {entries.map((entry) => {
                const meta = LEVELS[entry.level]
                const color = levelColor(entry.level)
                return (
                  <article key={entry.id} className="history-item" onClick={() => goToAnalyze(entry.text)}>
                    <div className="history-score" style={{ color, borderColor: color }}>
                      <strong>{entry.score}</strong>
                      <small>AI 味</small>
                    </div>
                    <div className="history-main">
                      <div className="history-top">
                        <span className="level-badge" style={{ color, background: `${color}18`, borderColor: `${color}55` }}>
                          {meta.label}
                        </span>
                        <span className="history-time">{formatTime(entry.createdAt)}</span>
                        <span className="history-hits">命中 {entry.hits}</span>
                      </div>
                      <p className="history-text">{truncate(entry.text, 180)}</p>
                    </div>
                    <button
                      className="icon-btn"
                      type="button"
                      title="删除这条"
                      aria-label="删除这条记录"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeHistory(entry.id)
                        refresh()
                      }}
                    >
                      ✕
                    </button>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span>◷</span>
              还没有历史记录。去工作台检测一段文字，或开启「自动保存到历史」后开始积累。
              <div className="empty-action">
                <button className="ghost-btn" type="button" onClick={() => navigate('analyze')}>
                  前往检测工作台
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
