# CET-4 Vocab Lab PRD

## 1. 大赛理解

### 平台核心 AI 能力

- 通过 Server API 发起 AI Agent 长任务：`GET /api/ai/events?connId=<uuid>` 建立 SSE，再 `POST /api/ai/message` 创建 `newTask`。
- Agent 可执行多步骤研究、生成报告、图表和文件，结果沉淀在任务 workspace，可通过任务文件接口预览和下载。
- 可管理数据源、RAG 知识库和 Skill，提升任务对业务语义和资料的理解。
- API Key 必须保存在服务端，前端只访问自己的后端适配层。

### 大赛准入与评分维度

前置准入：必须是可运行应用；必须部署或可访问；必须通过后端 Server API 集成 InfiniSynapse，后台可核验调用日志。

评分维度可拆解为：

- 创新性：是否把 InfiniSynapse 用到核心流程，而不是贴一个聊天入口。
- 实用性：是否解决明确场景，有真实用户、真实任务、真实结果。
- 技术完成度：前后端完整、可一键启动、API Key 服务端托管、异常回退、数据持久化。
- 用户体验：流程顺、信息密度合适、状态可见、移动端可用。
- 平台融合度：是否体现 SSE/newTask/任务产物/可核验 taskId 等平台特征。

### 作品长廊启发

高赞作品共同点：场景具体、风险或收益明确、报告可追溯、结果结构化、强调 taskId 可后台核验。教育类仍有空间，但需要避免“普通背单词工具”，应突出 AI 个性化诊断和路径生成。

## 2. 三个半天可落地方案

### 方案 A：CET-4 Vocab Lab 四级单词学习舱

- 目标用户：30 天内备考四级的大学生，尤其是阅读/听力因词汇卡住的用户。
- 核心功能：四级核心词库、快速自测、弱词诊断、AI 单词释义卡、AI 场景例句、7 天学习路径推荐、本地学习记录。
- 差异化：从“背单词”升级为“诊断-练习-路径”闭环，AI 输出围绕个人弱词而非泛泛生成。
- 技术架构：React/Vite 前端；Express 后端；JSON 文件持久化；InfiniSynapse 适配层创建 AI 任务。
- 时间分解：需求与文档 45m；后端 60m；前端 120m；README 与验证 45m。

### 方案 B：四级阅读长难句词汇拆解器

- 目标用户：阅读理解薄弱、看不懂段落的考生。
- 核心功能：粘贴英文段落，AI 标注四级重点词、同义替换、句法结构、翻译与练习题。
- 差异化：词汇和阅读结合，适合真实阅读题训练。
- 技术架构：React 输入页 + Express 任务代理 + 本地历史。
- 时间分解：需求 30m；段落分析 API 60m；前端 100m；导出与验证 60m。

### 方案 C：四级写作高频词替换助手

- 目标用户：写作表达贫乏、句式重复的考生。
- 核心功能：输入中文观点或英文作文，AI 推荐四级词替换、搭配、例句、风险提示、作文润色。
- 差异化：直接服务作文提分，但覆盖面小于词汇学习舱。
- 技术架构：React 编辑器 + Express AI 代理 + 本地版本记录。
- 时间分解：需求 30m；后端 45m；编辑器 UI 90m；AI 结果视图 60m；验证 45m。

### 最优选择

选择方案 A。原因：半天内最容易交付完整闭环，用户使用路径明确，AI 能力覆盖释义生成、例句创作和学习路径推荐三个核心点，满足题目约束。

## 3. 产品定义

### 产品定位

CET-4 Vocab Lab 是一款面向四级备考生的 AI 单词学习工作台，帮助用户用 10 分钟完成词汇诊断，再获得动态弱词推荐和 7 天复习路径。

### 功能优先级

P0：词库浏览、搜索、标签筛选、词卡学习、自测、学习记录、弱词推荐、AI 释义卡、AI 学习路径、README、一键启动。

P1：AI 场景例句、任务状态恢复、历史记录查看、移动端响应式。

P2：导出 PDF、完整 SSE 前端流式展示、用户账号、多套词库。

### 页面结构

- 左侧导航：产品状态、InfiniSynapse 配置状态、背词/诊断/路径锚点。
- 顶部 Hero：产品名、价值说明、生成当前词 AI 卡入口。
- 诊断指标区：词库规模、练习次数、正确率、薄弱词数量。
- 工具栏：搜索框、标签筛选。
- 主学习区：单词卡、自测选项、熟悉度按钮、AI 释义结果状态。
- 推荐区：今日推荐词，优先显示弱词和未学词。
- 学习路径区：考试时间、每日时长、目标输入，生成 7 天路径。

### 交互流程

1. 用户打开应用，看到词库和当前推荐词。
2. 点击显示释义，完成四选一自测，标记“不熟/模糊/掌握”。
3. 后端保存学习记录并重新计算弱词推荐。
4. 用户点击 AI 生成释义卡，后端用 InfiniSynapse 创建任务，前端展示 connId 和本地回退卡片。
5. 用户填写备考信息并生成学习路径，后端把画像、统计和弱词交给 InfiniSynapse。

### 数据流设计

```text
React UI -> Express API -> 本地 progress.json
                  -> InfiniSynapse adapter -> /api/ai/message
                  -> InfiniSynapse task workspace / 后台任务日志
```

### API 调用规划

本应用后端 API：

- `GET /api/health`
  - 响应：`{ ok, infinisynapseConfigured, wordCount }`
- `GET /api/words?q=&tag=`
  - 响应：`{ words, tags }`
- `GET /api/progress`
  - 响应：`{ stats, reviews, recommendations }`
- `POST /api/review`
  - 请求：`{ word, correct, rating, mode }`
  - 响应：`{ ok, stats, recommendations }`
- `POST /api/ai/definition`
  - 请求：`{ word }`
  - 响应：`{ mode, task, fallback }`
- `POST /api/ai/examples`
  - 请求：`{ word, scene, difficulty }`
  - 响应：`{ mode, task }`
- `POST /api/ai/path`
  - 请求：`{ profile: { examDate, dailyMinutes, target } }`
  - 响应：`{ mode, task, weakWords, stats }` 或本地回退 plan
- `GET /api/ai/task/:taskId`
  - 读取平台任务信息和 UI 消息。

InfiniSynapse Server API：

- `POST https://app.infinisynapse.cn/api/ai/message`
  - Header：`Authorization: Bearer <API_KEY>`，`Content-Type: application/json`，`x-lang: zh_CN`
  - 新建任务请求：`{ type: 'newTask', text, connId, taskName, chatSettings: { mode: 'act' }, autoApprovalSettings: {...} }`
  - 多轮追问请求：`{ type: 'askResponse', taskId, askResponse: 'messageResponse', text }`
- `GET /api/ai_task/getTaskInfo/:id`
- `GET /api/ai_task/getUiMessageById?id=<taskId>`

### 本地存储方案

- `server/words.js`：内置四级核心词演示词库。
- `data/progress.json`：本地 JSON 数据库，保存 reviews、generated、paths。
- 不在前端保存 API Key；`.env` 只由 Express 服务端读取。
