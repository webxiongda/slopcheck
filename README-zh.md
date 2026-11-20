<div align="center">

[English](README.md) | [中文](README-zh.md)

🧹

# SlopCheck

**在你的浏览器里实时揪出文字的 AI 味 —— 一个字符都不会被发送出去。**

[![Stars](https://img.shields.io/github/stars/webxiongda/slopcheck?style=flat&color=ff9f43)](https://github.com/webxiongda/slopcheck)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ed573.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-2ed573.svg)](https://github.com/webxiongda/slopcheck/pulls)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)

</div>

<div align="center">
  <img src="assets/screenshot.png" alt="SlopCheck 检测工作台：AI 味指数、按类别着色的命中高亮与改写预览" width="800" />
</div>

## 为什么选择 SlopCheck？

AI 辅助写作有一种能听出来的腔调。它偏爱 *delve into*、*seamless*、*it's worth noting* 和 *not just X, but Y*；换成中文就是「赋能 / 抓手 / 闭环」。这些词单独看都没错，但堆在一起，文字就会显得像机器生成的 —— 光滑、通用、少了点人味。工具层面的反应也很明显：impeccable（+15.2k/月）、unslop（+15.1k/月）、hallmark（+14.1k/月）等反 AI 味项目在同一时期快速增长，说明大家确实需要一个快速发现并清理这些套路的工具。

现有的检测器要么把你正不放心的文本上传到云端，要么只给一个说不清由来的黑箱分数。SlopCheck 走的是相反的路：一个完全本地、零依赖的规则引擎，明确指出哪个短语命中了、为什么它显得模板化，以及更朴素的替代表达是什么。

目标是帮你改稿，不是给你判分。0–100 的分数只是粗略信号，不是结论；证据就在原文里高亮标出；最终决定权始终在你手里。不需要账号、不需要 API key、不需要联网 —— 只有你的文本和一套可以阅读、可以扩展的规则。

## 特性

| 特性 | 说明 |
| --- | --- |
| 本地与隐私 | 一切都在浏览器内完成。没有模型调用、没有后端、没有遥测 —— 文本不会离开你的设备。 |
| 0–100 AI 味指数 | 基于加权密度的评分，分四档（clean / mild / medium / severe），配有 SVG 仪表盘。 |
| 五类命中 | 英文陈词、句式套路、中文黑话、Emoji 滥用、填充冗余 —— 在原文中按类别着色。 |
| 零依赖规则 | 66 条纯 TypeScript 正则 + 词表规则；除 React 与 React DOM 外无运行时依赖。 |
| 可落地的建议 | 每条命中都说明原因并给出更朴素的替换说法，大多数可以一键应用。 |
| 一键去味 | 自动替换陈词与冗余表达，在句首正确大写，并复制改写结果。 |
| 严格模式 | 取消连接词的出现次数门槛，并提高密度系数，适合检查正式文稿。 |
| 批量检测 | 一次粘贴多段文字，按分数 / 命中数 / 可读性排序，导出 CSV。 |
| 改写对照与分享卡 | 并排查看原文与去味结果，或复制包含分数和 Top 3 命中的纯文本卡片。 |
| 中英双语覆盖 | 既抓英文填充词（"delve into"、"in order to"），也抓中文黑话（赋能、底层逻辑、颗粒度）。 |

## 快速开始

```bash
git clone https://github.com/webxiongda/slopcheck.git
cd slopcheck
npm install && npm run dev
```

打开 `http://localhost:5173`，把文本粘贴到工作台即可 —— 输入时就会自动分析。需要静态构建时，依次运行 `npm run build` 和 `npm run preview`。测试运行 `npm test`。

## 页面

应用采用 hash 路由，因此每个页面都可以直接链接，嵌在 iframe 里也能正常使用。

| Hash | 页面 | 作用 |
| --- | --- | --- |
| `#/analyze` | 检测工作台 | 粘贴文本，查看实时分数，按类别筛选命中，一键改写并复制分享卡。 |
| `#/rules` | 规则库 | 按模式、原因或改法搜索与筛选全部 66 条规则。 |
| `#/history` | 检测历史 | 查看本地记录，点任意一条回填到工作台继续修改。 |
| `#/compare` | 改写对照 | 并排查看原文与去味结果，显示分数变化。 |
| `#/batch` | 批量检测 | 用 `---` 分隔多段输入，结果表格可排序、可导出 CSV。 |
| `#/examples` | 示例库 | 试用三个内置示例，或收藏保存在本地的自定义文本。 |
| `#/stats` | 数据统计 | 基于检测历史的 SVG 仪表盘、柱状图、饼图与折线图。 |
| `#/guide` | 使用指南 | 四步上手流程、五类规则与分数档位说明。 |
| `#/about` | 关于与热点 | 为什么需要去 AI 味、相关热点证据与项目链接。 |
| `#/settings` | 设置 | 开关自动保存、高亮与严格模式，管理本地数据。 |

## 工作原理

[`src/rules.ts`](src/rules.ts) 中的每条规则都声明一个 `source` 正则、`flags`、`category`，以及用大白话写成的 `reason` / `suggestion`（可选的 `replacement` 和 `minCount`）。analyzer 为每条规则新建 `RegExp`，避免复用导致的 `lastIndex` 状态问题，然后做 overlap dedup，保证同一段文字不被重复计分 —— 起点相同时保留更长的命中。分数是加权密度：各类别权重（pattern 6、emoji 4、cliché/chinese 3、filler 2）之和除以词数（下限 24），再乘以 132（严格模式为 168），最后截断到 0–100，分档阈值为 15、40、70。去味时从后往前应用替换，保证前面的下标不失效，并在句首正确大写。图表是手写 SVG；状态保存在 `localStorage`，并带有 `JSON.parse` 降级处理，脏数据不会让应用白屏。

## 技术栈

React 18 + TypeScript strict 模式，使用 Vite 构建。规则引擎**没有额外的运行时依赖** —— 只有正则表达式和词表。路由是一个轻量 hash 路由，图表是手写 SVG，持久化用 `localStorage`。运行时依赖只有 React 和 React DOM。

## 文档

- [English README](README.md) — 本指南的完整英文版。
- [CONTRIBUTING.md](CONTRIBUTING.md) — 如何本地运行并提交 PR。
- [LICENSE](LICENSE) — MIT。

## 贡献

欢迎提交 PR，尤其是扩充规则表。所有规则集中在一个文件里，因此很好的首次贡献是：新增一条英文陈词、一个带自然替换的中文黑话，或为已有命中写更清楚的建议。其他有价值的方向：overlap dedup 的边界情况、更易读的 SVG 图表、文档改进。请保持改动小而专注；较大的重构请先开 issue。约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 路线图

- [ ] 扩充词表，覆盖更多文体（学术、营销、产品文案）。
- [ ] 在设置中增加按类别调节灵敏度。
- [ ] 支持以 JSON 导入 / 导出规则与收藏。
- [ ] 改进可读性算法，不再只依赖平均句长。
- [ ] 为 analyzer 的边界情况补一套测试。

## 许可证

[MIT](LICENSE) © SlopCheck contributors。
