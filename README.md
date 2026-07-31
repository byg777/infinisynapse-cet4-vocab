# CET-4 Vocab Lab 四级单词学习舱

面向 InfiniSynapse Vibe Coding 大赛的英语四级单词学习产品。应用包含完整 React 前端、Express 后端、本地学习记录和 InfiniSynapse Server API 适配层，用于单词释义生成、例句创作和学习路径推荐。

## 功能

- 四级核心词库浏览、搜索、标签筛选
- 单词卡片学习：音标、释义、例句、词族
- 快速自测：四选一 + 熟悉度标记
- 本地学习诊断：练习次数、正确率、薄弱词、今日推荐
- InfiniSynapse AI 单词释义卡任务
- InfiniSynapse AI 场景例句任务
- InfiniSynapse AI 7 天学习路径推荐任务
- 平台失败或网络不可用时提供本地回退，保证演示不断流

## 技术栈

- 前端：React + Vite + lucide-react
- 后端：Node.js + Express
- 存储：本地 JSON 文件 `data/progress.json`
- AI 平台：InfiniSynapse Server API

## 项目结构

```text
infinisynapse-cet4-vocab/
  PRD.md                 # 产品规划、竞赛分析、API 设计
  README.md              # 启动说明
  package.json           # 一键启动脚本
  .env.example           # 环境变量示例
  server/
    index.js             # Express API 和本地学习记录
    infini.js            # InfiniSynapse Server API 适配层
    words.js             # 四级核心词演示词库
  src/
    main.jsx             # React 应用
    styles.css           # 页面样式
  index.html             # Vite 入口
```

## 环境要求

- Node.js 18+，推荐 20+
- npm 9+
- 可访问 `https://app.infinisynapse.cn`

当前开发机验证环境：Node `v24.17.0`，npm `11.13.0`。

## API Key 配置

复制环境变量文件：

```bash
cp .env.example .env
```

`.env` 内容：

```bash
VITE_API_BASE=http://localhost:5174
INFINISYNAPSE_API_KEY=sk-xxxx
INFINISYNAPSE_SERVER_URL=https://app.infinisynapse.cn
PORT=5174
```

注意：`INFINISYNAPSE_API_KEY` 只在服务端读取，不会写入前端代码。参赛提交公开仓库时不要提交真实 `.env`。

## 安装与一键启动

```bash
npm install
npm run dev
```

启动后访问：

- 前端：`http://localhost:5173`
- 后端健康检查：`http://localhost:5174/api/health`

生产构建：

```bash
npm run build
npm start
```

## InfiniSynapse 集成说明

后端 `server/infini.js` 封装了 InfiniSynapse Server API：

- `POST /api/ai/message` 创建 `newTask`
- `POST /api/ai/message` 发送 `askResponse` 多轮追问
- `GET /api/ai_task/getTaskInfo/:id` 读取任务信息
- `GET /api/ai_task/getUiMessageById?id=` 恢复任务消息

本应用在以下核心功能中调用 InfiniSynapse：

- `POST /api/ai/definition`：生成单词释义、记忆钩子、搭配、例句、易错点、测验
- `POST /api/ai/examples`：按场景生成四级例句
- `POST /api/ai/path`：根据学习记录和薄弱词生成 7 天学习路径

每次调用会在服务端创建 InfiniSynapse 任务并返回 `connId` 及平台响应，调用日志可在 InfiniSynapse 后台核验。当前版本为了保证半天开发可落地，前端展示任务创建状态和本地回退内容；后续可扩展为完整 SSE 流式展示与 workspace 报告预览。

## 本地数据

首次启动会自动创建：

```text
data/progress.json
```

其中保存：

- `reviews`：单词自测记录
- `generated`：AI 生成任务记录
- `paths`：学习路径生成记录

清空学习记录可删除 `data/progress.json` 后重启服务。

## 参赛提交建议

提交材料可直接引用：

- 应用名称：CET-4 Vocab Lab 四级单词学习舱
- 使用场景：四级备考生在考前 30 天内进行词汇诊断、弱词复习和个性化学习路径规划
- API 集成说明：后端通过 InfiniSynapse Server API 创建 AI 任务，生成单词释义、例句和 7 天学习路径；API Key 保存在服务端 `.env`；任务可在平台后台核验
- 代码仓库：本项目目录
