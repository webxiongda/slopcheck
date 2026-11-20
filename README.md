# SlopCheck · AI 味检测器

[![License: MIT](https://img.shields.io/badge/License-MIT-ff4757.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/slopcheck/slopcheck?style=flat&color=ff9f43)](https://github.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-2ed573.svg)](https://github.com/)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)

> 把「赋能、抓手、闭环、delve into、not just … but …」揪出来，给你的文字测一测 AI 味指数。

粘贴一段文案或代码，SlopCheck 会在浏览器本地用纯正则与词表检测陈词滥调、模板句式、中文黑话、Emoji 滥用和填充冗余，给出 **0–100 的 AI 味指数**、逐条命中与朴素改法，并支持一键去味和生成分享卡。**文本不会离开你的设备。**

## ✨ 特性

- **实时检测**：输入即分析，环形仪表盘显示 AI 味指数（严重 / 中等 / 轻微 / 清爽）。
- **规则库零依赖**：全部是 TypeScript 正则与词表，不调用任何模型或接口。
- **中英双语**：覆盖 `delve into`、`seamless landing`、`it's worth noting`，以及「赋能 / 抓手 / 闭环 / 底层逻辑 / 生态位」等中文黑话。
- **五种命中类别**：英文陈词、句式套路、中文黑话、Emoji 滥用、填充冗余，按类别着色高亮原文。
- **可落地的建议**：每条命中都附带原因与更朴素的替代表达。
- **一键去味**：自动把陈词与冗余短语替换成日常说法，右侧直接预览、一键复制。
- **分享卡**：分数 + Top3 命中生成纯文本卡片，方便发到群聊或 issue。
- **统计条**：检测词数、命中数、可读性评分一目了然。
- **精致 UI**：深色玻璃拟态、渐变霓虹强调色、微动效、响应式布局。

## 🚀 快速开始

```bash
npm install
npm run dev
```

打开终端提示的地址（默认 `http://localhost:5173`）即可使用。生产构建：

```bash
npm run build
npm run preview
```

## 🎮 核心玩法

1. 点击顶部三个示例按钮之一，或直接粘贴自己的文案 / 代码。
2. 右侧仪表盘给出 AI 味指数，红橙配色越高越「AI」。
3. 在「命中明细」里按类别筛选，查看命中文本、原因和建议改法。
4. 「原文高亮」里颜色对应的片段就是问题所在，鼠标悬停可看原因。
5. 点「复制改写」拿走一键去味后的朴素版本。
6. 点「复制卡片」把分数与 Top3 命中分享出去。

想扩展词表？直接编辑 [`src/rules.ts`](src/rules.ts)：每条规则声明 `category / source / flags / reason / suggestion / replacement`，可选 `minCount` 用于「连接词堆叠」这类需要多次出现才生效的规则。

## 📸 截图占位区

> 后续在此放置主界面截图（`docs/screenshot-main.png`）与命中高亮特写（`docs/screenshot-hits.png`）。

## 📄 License

[MIT](LICENSE) © SlopCheck contributors
