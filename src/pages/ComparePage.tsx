import { useMemo, useState } from 'react'
import { analyze } from '../analyzer'
import { LEVELS } from '../rules'
import { SAMPLES } from '../samples'
import { CopyButton, HighlightedText, StatChip, withAlpha } from '../components'
import { getSettings } from '../storage'
import { levelColor } from '../utils'

export default function ComparePage() {
  const [text, setText] = useState(SAMPLES[0].text)
  const [showHighlight, setShowHighlight] = useState(() => getSettings().showHighlight)

  const before = useMemo(() => analyze(text), [text])
  const after = useMemo(() => analyze(before.rewritten), [before.rewritten])
  const beforeMeta = LEVELS[before.level]
  const afterMeta = LEVELS[after.level]
  const beforeColor = levelColor(before.level)
  const afterColor = levelColor(after.level)
  const removed = before.matches.length - after.matches.length
  const delta = before.score - after.score

  return (
    <>
      <header className="page-head">
        <h1>改写对照</h1>
        <p>左边是原文命中，右边是一键去味后的结果。同一段文字改前改后并排看，问题与残留一目了然。</p>
      </header>

      <main className="page-body">
        <section className="panel">
          <div className="panel-head">
            <h2>原文输入</h2>
            <div className="head-actions">
              <button className="ghost-btn" type="button" onClick={() => setText(SAMPLES[0].text)}>
                载入示例
              </button>
              <button
                className="ghost-btn"
                type="button"
                onClick={() => setShowHighlight((v) => !v)}
              >
                {showHighlight ? '关闭高亮' : '开启高亮'}
              </button>
            </div>
          </div>
          <textarea
            className="editor compact-editor"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴需要对照的原文…"
            spellCheck={false}
          />
          <div className="editor-foot">
            <span>{text.length} 字符</span>
            <span>高亮颜色对应五类命中规则</span>
          </div>

          <div className="stats-bar compare-stats">
            <StatChip label="原分数" value={before.score} color={beforeColor} />
            <StatChip label="去味后" value={after.score} color={afterColor} />
            <StatChip label="分数下降" value={delta > 0 ? `-${delta}` : '0'} color="#2ed573" />
            <StatChip label="消除命中" value={removed > 0 ? removed : 0} color="#2ed573" />
          </div>

          <div className="compare-grid">
            <div className="compare-col">
              <div className="compare-col-head">
                <span className="compare-tag before">原文</span>
                <span className="level-badge" style={{ color: beforeColor, background: withAlpha(beforeColor, 0.14), borderColor: withAlpha(beforeColor, 0.4) }}>
                  {beforeMeta.label} · {before.score} 分
                </span>
              </div>
              <div className="preview compare-preview">
                {text ? (
                  showHighlight ? <HighlightedText text={text} matches={before.matches} /> : text
                ) : (
                  <span className="muted">等待输入…</span>
                )}
              </div>
              <div className="compare-foot">{before.matches.length} 处命中</div>
            </div>
            <div className="compare-col">
              <div className="compare-col-head">
                <span className="compare-tag after">去味后</span>
                <span className="level-badge" style={{ color: afterColor, background: withAlpha(afterColor, 0.14), borderColor: withAlpha(afterColor, 0.4) }}>
                  {afterMeta.label} · {after.score} 分
                </span>
              </div>
              <div className="preview compare-preview">
                {before.rewritten ? (
                  showHighlight ? <HighlightedText text={before.rewritten} matches={after.matches} /> : before.rewritten
                ) : (
                  <span className="muted">改写结果会显示在这里…</span>
                )}
              </div>
              <div className="compare-foot">
                {after.matches.length ? `仍有 ${after.matches.length} 处残留` : '没有残留命中'}
                <CopyButton text={before.rewritten}>复制结果</CopyButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
