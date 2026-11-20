import { useMemo, useState } from 'react'
import { CATEGORIES } from '../rules'
import { RULES } from '../rules'
import type { CategoryId } from '../types'
import { prettyPattern } from '../utils'

export default function RulesPage() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<CategoryId | 'all'>('all')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CATEGORIES.map((c) => ({
      meta: c,
      rules: RULES.filter((r) => {
        if (r.category !== c.id) return false
        if (!q) return true
        return [r.source, r.reason, r.suggestion, r.replacement ?? '', prettyPattern(r.source)]
          .some((field) => field.toLowerCase().includes(q))
      }),
    }))
  }, [query])

  const visible = active === 'all' ? groups : groups.filter((g) => g.meta.id === active)
  const visibleCount = visible.reduce((sum, g) => sum + g.rules.length, 0)

  return (
    <>
      <header className="page-head">
        <h1>规则库浏览器</h1>
        <p>全部 {RULES.length} 条检测规则，按五类分组。每条都标明命中模式、原因与可落地的改法。</p>
      </header>

      <main className="page-body">
        <section className="panel">
          <div className="tool-row">
            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索词、原因或改法，例如 leverage / 闭环 / 连接词"
              aria-label="搜索规则"
            />
            <span className="result-count">{visibleCount} 条结果</span>
          </div>

          <div className="filters">
            <button type="button" className={`filter ${active === 'all' ? 'on' : ''}`} onClick={() => setActive('all')}>
              全部 <b>{RULES.length}</b>
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`filter ${active === c.id ? 'on' : ''}`}
                style={active === c.id ? { color: c.color, borderColor: c.color, background: `${c.color}18` } : undefined}
                onClick={() => setActive(c.id)}
              >
                {c.label} <b>{RULES.filter((r) => r.category === c.id).length}</b>
              </button>
            ))}
          </div>

          {visible.map((g) => (
            <div key={g.meta.id} className="rule-group">
              <div className="rule-group-head">
                <span className="dot" style={{ background: g.meta.color }} />
                <h2>{g.meta.label}</h2>
                <span className="rule-group-hint">{g.meta.hint}</span>
                <span className="rule-group-count">{g.rules.length} 条</span>
              </div>
              {g.rules.length ? (
                <div className="rule-grid">
                  {g.rules.map((rule) => (
                    <article key={`${rule.category}-${rule.source}`} className="rule-item" style={{ borderLeftColor: g.meta.color }}>
                      <div className="rule-term">{prettyPattern(rule.source)}</div>
                      <code className="rule-regex">/{rule.source}/{rule.flags}</code>
                      <div className="rule-reason">{rule.reason}</div>
                      <div className="rule-fix"><b>改法</b> {rule.suggestion}</div>
                      {rule.replacement !== undefined && (
                        <div className="rule-rep">
                          自动替换为 <code>{rule.replacement === '' ? '（直接删除）' : rule.replacement}</code>
                        </div>
                      )}
                      {rule.minCount ? <div className="rule-min">需出现 ≥ {rule.minCount} 次才命中</div> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">这个类别下没有匹配「{query}」的规则</div>
              )}
            </div>
          ))}
        </section>
      </main>
    </>
  )
}
