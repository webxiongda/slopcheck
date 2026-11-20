import { CATEGORIES, LEVELS, RULES } from '../rules'
import { navigate } from '../router'
import { prettyPattern } from '../utils'

const STEPS = [
  { n: '01', title: '粘贴文字', desc: '在检测工作台输入文案、邮件或代码，也可以直接点内置示例。输入即分析，无需点击按钮。' },
  { n: '02', title: '读分数与高亮', desc: '环形仪表盘给出 0–100 的 AI 味指数，原文按类别着色，悬停高亮可看命中的具体原因。' },
  { n: '03', title: '按类别查改法', desc: '命中明细支持按五类筛选，每条都附原因和更朴素的替代表达，可直接照着改。' },
  { n: '04', title: '去味、对比与分享', desc: '一键去味后复制改写结果；在改写对照页并排看前后变化；把分享卡发到群聊或 issue。' },
]

const RANGES: Record<string, string> = {
  severe: '70 – 100',
  medium: '40 – 69',
  mild: '15 – 39',
  clean: '0 – 14',
}

export default function GuidePage() {
  return (
    <>
      <header className="page-head">
        <h1>使用指南</h1>
        <p>四步上手 SlopCheck，并了解五类规则与 AI 味判断标准。所有检测都在浏览器本地完成。</p>
      </header>

      <main className="page-body">
        <section className="panel">
          <div className="panel-head">
            <h2>四步玩法</h2>
            <button className="ghost-btn" type="button" onClick={() => navigate('analyze')}>开始检测 →</button>
          </div>
          <div className="step-grid">
            {STEPS.map((s) => (
              <article key={s.n} className="step-card">
                <span className="step-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>五类规则说明</h2><span className="muted">词表全部可查</span></div>
          <div className="guide-categories">
            {CATEGORIES.map((c) => {
              const example = RULES.find((r) => r.category === c.id)
              return (
                <article key={c.id} className="guide-category" style={{ borderLeftColor: c.color }}>
                  <h3><span className="dot" style={{ background: c.color }} />{c.label}</h3>
                  <p>{c.hint}</p>
                  <div className="guide-example">
                    代表模式：<code>{example ? prettyPattern(example.source) : '—'}</code>
                  </div>
                  <button className="ghost-btn" type="button" onClick={() => navigate('rules')}>
                    查看该类全部规则
                  </button>
                </article>
              )
            })}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>AI 味判断标准</h2><span className="muted">分数越高，模板痕迹越重</span></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>等级</th><th>分区间</th><th>说明</th></tr></thead>
              <tbody>
                {(Object.keys(LEVELS) as (keyof typeof LEVELS)[]).map((id) => (
                  <tr key={id}>
                    <td><span className="level-badge" style={{ color: LEVELS[id].color, background: `${LEVELS[id].color}18`, borderColor: `${LEVELS[id].color}55` }}>{LEVELS[id].label}</span></td>
                    <td><strong>{RANGES[id]}</strong></td>
                    <td>{LEVELS[id].desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="guide-note">
            分数由命中规则的类别权重与文本密度共同决定；可读性按平均句长估算。开启「严格模式」后，单次出现的连接词也会计入并提高分数系数。
          </p>
        </section>
      </main>
    </>
  )
}
