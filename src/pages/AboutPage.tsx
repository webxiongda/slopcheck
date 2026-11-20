import { LICENSE_URL } from '../constants'

const EVIDENCE = [
  { word: 'impeccable', heat: '+15.2k', desc: '社区讨论中被反复点名的 AI 高频形容词，热度最高' },
  { word: 'delve into', heat: '高频', desc: '英文陈词里最典型的开场动词，几乎成了模型签名' },
  { word: 'seamless', heat: '高频', desc: '商务与技术文案中被用滥的「无缝」修辞' },
  { word: '赋能 / 抓手 / 闭环', heat: '典型', desc: '中文互联网黑话三件套，汇报体重灾区' },
]

export default function AboutPage() {
  return (
    <>
      <header className="page-head">
        <h1>关于与热点</h1>
        <p>SlopCheck 是一个纯本地、零运行时依赖的 AI 味检测器。下面记录它要解决的问题与项目信息。</p>
      </header>

      <main className="page-body">
        <section className="panel">
          <div className="panel-head"><h2>热点证据</h2><span className="muted">为什么需要去 AI 味</span></div>
          <div className="evidence-grid">
            {EVIDENCE.map((e) => (
              <article key={e.word} className="evidence-card">
                <div className="evidence-top">
                  <code>{e.word}</code>
                  <span className="evidence-heat">{e.heat}</span>
                </div>
                <p>{e.desc}</p>
              </article>
            ))}
          </div>
          <p className="guide-note">
            热点词只是信号，不是定罪：SlopCheck 只提示模板化表达并给出更朴素的改法，最终判断权始终在你手里。
          </p>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>技术栈</h2></div>
          <div className="tag-cloud">
            <span>React 18</span>
            <span>TypeScript strict</span>
            <span>Vite</span>
            <span>零运行时依赖规则引擎</span>
            <span>正则 + 词表</span>
            <span>SVG 手绘图表</span>
            <span>hash 路由</span>
            <span>localStorage</span>
          </div>
          <p className="about-text">
            检测逻辑集中在 <code>src/analyzer.ts</code>，规则表在 <code>src/rules.ts</code>。没有模型调用、没有后端接口，文本不会离开你的设备。
          </p>
        </section>

        <section className="panel">
          <div className="panel-head"><h2>项目信息</h2></div>
          <div className="about-links">
            <a href="https://github.com/slopcheck/slopcheck" target="_blank" rel="noreferrer">GitHub 仓库 ↗</a>
            <a href={LICENSE_URL} target="_blank" rel="noreferrer">MIT License ↗</a>
            <a href="https://react.dev/" target="_blank" rel="noreferrer">React ↗</a>
            <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">TypeScript ↗</a>
            <a href="https://vite.dev/" target="_blank" rel="noreferrer">Vite ↗</a>
          </div>
          <p className="about-text">MIT © SlopCheck contributors. 欢迎提 PR 扩充词表与规则。</p>
        </section>
      </main>
    </>
  )
}
