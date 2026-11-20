import { useState } from 'react'
import { clearHistory, DEFAULT_SETTINGS, getHistory, getSettings, saveSettings } from '../storage'
import type { Settings } from '../storage'
import { navigate } from '../router'

function Toggle({
  checked,
  onChange,
  title,
  desc,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  title: string
  desc: string
}) {
  return (
    <div className="setting-row">
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className={`switch ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(getSettings)
  const [historyCount, setHistoryCount] = useState(() => getHistory().length)

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
  }

  return (
    <>
      <header className="page-head">
        <h1>设置</h1>
        <p>所有开关立即生效并持久化到 localStorage，仅保存在你的浏览器中。</p>
      </header>

      <main className="page-body">
        <section className="panel">
          <div className="panel-head"><h2>检测偏好</h2><span className="muted">自动保存</span></div>
          <Toggle
            checked={settings.autoSave}
            onChange={(v) => update('autoSave', v)}
            title="自动保存到历史"
            desc="每次检测完成后，把文本、分数与命中情况写入历史。内容为空或与最近一条相同时不会重复保存。"
          />
          <Toggle
            checked={settings.showHighlight}
            onChange={(v) => update('showHighlight', v)}
            title="显示高亮"
            desc="在检测工作台与改写对照页用类别颜色标出命中片段；关闭后只显示纯文本。"
          />
          <Toggle
            checked={settings.strictMode}
            onChange={(v) => update('strictMode', v)}
            title="严格模式"
            desc="忽略连接词的出现次数门槛，单次出现也计入命中，并提高分数系数。适合检查正式文稿。"
          />
        </section>

        <section className="panel">
          <div className="panel-head"><h2>本地数据</h2><span className="muted">{historyCount} 条历史</span></div>
          <div className="data-actions">
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                if (window.confirm('确定清空全部检测历史？')) {
                  clearHistory()
                  setHistoryCount(0)
                }
              }}
            >
              清空检测历史
            </button>
            <button
              className="ghost-btn"
              type="button"
              onClick={() => {
                setSettings({ ...DEFAULT_SETTINGS })
                saveSettings(DEFAULT_SETTINGS)
                navigate('analyze')
              }}
            >
              恢复默认设置
            </button>
          </div>
          <p className="about-text">
            收藏的示例保存在「示例库」页面；历史记录可在「检测历史」中逐条删除。数据不会上传到任何服务器。
          </p>
        </section>
      </main>
    </>
  )
}
