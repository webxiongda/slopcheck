import { useMemo, useState } from 'react'
import { analyze } from '../analyzer'
import { LEVELS } from '../rules'
import { goToAnalyze } from '../router'
import { getSettings } from '../storage'
import { levelColor } from '../utils'

type SortKey = 'index' | 'score' | 'hits' | 'readability'
interface Row {
  index: number
  text: string
  score: number
  hits: number
  level: keyof typeof LEVELS
  readability: number
}

function csvCell(value: string | number): string {
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export default function BatchPage() {
  const [raw, setRaw] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'index', dir: 'asc' })
  const strict = useMemo(() => getSettings().strictMode, [])

  const rows = useMemo<Row[]>(() => {
    return raw
      .split(/^\s*-{3,}\s*$/m)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part, index) => {
        const a = analyze(part, strict)
        return {
          index: index + 1,
          text: part,
          score: a.score,
          hits: a.matches.length,
          level: a.level,
          readability: a.readability,
        }
      })
  }, [raw, strict])

  const sorted = useMemo(() => {
    const copy = [...rows]
    const factor = sort.dir === 'asc' ? 1 : -1
    return copy.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * factor
    })
  }, [rows, sort])

  const avg = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0
  const worst = rows.length ? Math.max(...rows.map((r) => r.score)) : 0

  function toggleSort(key: SortKey) {
    setSort((prev) => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
  }

  function exportCsv() {
    const header = ['序号', 'AI味分数', '等级', '命中数', '可读性', '文本']
    const lines = [header, ...sorted.map((r) => [r.index, r.score, LEVELS[r.level].label, r.hits, r.readability, r.text])]
      .map((line) => line.map(csvCell).join(','))
      .join('\n')
    const blob = new Blob([`\uFEFF${lines}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'slopcheck-batch.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '')

  return (
    <>
      <header className="page-head">
        <h1>批量检测</h1>
        <p>一次粘贴多段文字，用独立的一行 <code>---</code> 分隔。表格可排序，结果可导出 CSV。</p>
      </header>

      <main className="page-body">
        <section className="panel">
          <div className="panel-head">
            <h2>粘贴多段文本</h2>
            <div className="head-actions">
              <button className="ghost-btn" type="button" disabled={!rows.length} onClick={exportCsv}>
                导出 CSV
              </button>
            </div>
          </div>
          <textarea
            className="editor compact-editor"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={'第一段文字…\n---\n第二段文字…\n---\n第三段文字…'}
            spellCheck={false}
          />
          <div className="editor-foot">
            <span>已识别 {rows.length} 段</span>
            <span>以单独一行 --- 分隔</span>
          </div>

          <div className="stats-bar">
            <div className="stat-chip"><span className="stat-label">段落数</span><strong>{rows.length}</strong></div>
            <div className="stat-chip"><span className="stat-label">平均分</span><strong>{avg}</strong></div>
            <div className="stat-chip"><span className="stat-label">最高分</span><strong style={{ color: '#ff4757' }}>{worst}</strong></div>
            <div className="stat-chip"><span className="stat-label">总命中</span><strong style={{ color: '#ff9f43' }}>{rows.reduce((s, r) => s + r.hits, 0)}</strong></div>
          </div>

          {rows.length ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('index')}>#{arrow('index')}</th>
                    <th>文本预览</th>
                    <th onClick={() => toggleSort('score')}>分数{arrow('score')}</th>
                    <th>等级</th>
                    <th onClick={() => toggleSort('hits')}>命中{arrow('hits')}</th>
                    <th onClick={() => toggleSort('readability')}>可读性{arrow('readability')}</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => {
                    const color = levelColor(r.level)
                    return (
                      <tr key={`${r.index}-${r.score}`}>
                        <td>{r.index}</td>
                        <td className="table-text">{r.text.replace(/\s+/g, ' ').slice(0, 80)}</td>
                        <td><strong style={{ color }}>{r.score}</strong></td>
                        <td><span className="level-badge" style={{ color, background: `${color}18`, borderColor: `${color}55` }}>{LEVELS[r.level].label}</span></td>
                        <td>{r.hits}</td>
                        <td>{r.readability}</td>
                        <td><button className="ghost-btn" type="button" onClick={() => goToAnalyze(r.text)}>送检</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <span>▦</span>
              粘贴至少一段文字后，这里会出现逐段分数、命中数与等级。
            </div>
          )}
        </section>
      </main>
    </>
  )
}
