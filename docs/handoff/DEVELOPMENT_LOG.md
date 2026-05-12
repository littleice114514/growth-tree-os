# Development Log｜growth-tree-os

## 记录规则

每次开发完成后追加一条记录。

## 日志格式

### YYYY-MM-DD｜阶段 / 模块名称

- 设备：
- 分支：
- commit：
- 本轮目标：
- 修改文件：
- 完成内容：
- 验收结果：
- 当前问题：
- 下一步：

### 2026-05-12｜SystemX MVP / 系统感知模块

- 设备：MacBook / Codex
- 分支：feature/integration-time-debt-wealth
- commit：本轮最终 hash 见最终汇报
- 本轮目标：在 Time Debt + Wealth 集成分支上新增 SystemX MVP，完成页面入口、手动输入、mock 分析、localStorage 保存、历史回看。
- 修改文件：
  - `app/renderer/src/features/systemx/**`
  - `app/renderer/src/components/Toolbar.tsx`
  - `app/renderer/src/pages/MainWorkspacePage.tsx`
  - `app/renderer/src/types/ui.ts`
  - `docs/project-map/SYSTEMX_ROUTE_MAP.md`
  - `docs/project-state/**`
  - `docs/handoff/MAC_NEXT_ACTION.md`
- 完成内容：
  - 新增 SystemX 输入类型、系统标签、记录、原则候选、行动候选和分析类型。
  - 新增 mock sense engine，不调用真实 AI。
  - 新增 localStorage 存储工具，key 为 `growth-tree-os:systemx-records:v1`，最多保留 100 条。
  - 新增 SystemX 页面，支持输入、分析、结果展示、历史记录和清空历史确认。
  - 主导航新增 `SystemX`，不改变默认启动页。
- 验收结果：
  - `pnpm typecheck` 通过。
  - `pnpm build` 通过。
  - 本地 `node_modules` 未物化 ECharts 依赖导致首次 typecheck 失败，已通过 pnpm 安装流程补齐本地依赖；`package.json` / `pnpm-lock.yaml` 已包含对应依赖。
- 当前问题：
  - SystemX 仍是 MVP，不接真实 AI，不读写 Time Debt / Wealth。
  - 真实 Electron UI 点击 smoke 待 Mac 端补验。
- 下一步：
  - 在 Mac 端验收 SystemX 输入 / 分析 / 历史回看，并确认 Time Debt / Wealth 入口仍可访问。

### 2026-04-28｜Dashboard 可读性优化 / InteractiveStackedBar V0.1

- 设备：MacBook / Codex
- 分支：main
- commit：已提交，最终 hash 见本轮汇报
- 本轮目标：为 TimeDebt / Wealth Dashboard Preview 新增可复用交互式堆叠条，提升多颜色分段条的可读性和 hover 说明能力。
- 修改文件：
  - `app/renderer/src/components/charts/InteractiveStackedBar.tsx`
  - `app/renderer/src/features/dashboard-preview/TimeDebtDashboardPreview.tsx`
  - `app/renderer/src/features/dashboard-preview/WealthDashboardPreview.tsx`
- 完成内容：
  - 新增 `InteractiveStackedBar`，支持 segment hover、高亮 / 弱化、tooltip、图例联动、空状态、最小 hover 宽度、`title` 和 `aria-label`。
  - TimeDebt Preview 已接入“时间结构”和“时间负债对抗”。
  - Wealth Preview 已接入“现金流质量”。
  - 未新增依赖，未改数据库、IPC、全局状态或导航。
- 验收结果：
  - 等效 `typecheck` 通过：`./node_modules/.bin/tsc --noEmit -p tsconfig.node.json && ./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json`。
  - 等效 `build` 通过：`PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/electron-vite build`。
  - `pnpm` 当前不在 PATH，`pnpm lint` 未执行；`package.json` 当前无 `lint` 脚本。
  - dev server 已在运行，`http://localhost:5173/` 返回 HTTP 200。
  - 用户已确认 TimeDebt / Wealth hover 高亮、tooltip 和图例联动效果成功。
- 当前问题：
  - in-app browser 直接访问 `localhost:5173` 时缺少 Electron preload 的 `window.growthTree`，不适合作为完整桌面交互验收环境；完整桌面体验以 Electron 窗口为准。
- 下一步：
  - TimeDebt / Wealth Overview 真实数据融合：把 Preview 从 mock 数据逐步接入真实 localStorage 数据。

### 2026-04-28｜TimeDebt Overview 真实数据融合 V0.1

- 设备：MacBook / Codex
- 分支：main
- commit：未提交，本地工作区变更
- 本轮目标：TimeDebt Overview 接入真实 renderer localStorage 聚合数据，让今日日志新增后 Overview / Preview 指标、时间结构和诊断文案可随真实数据变化。
- 修改文件：
  - `app/shared/timeDebt.ts`
  - `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
  - `app/renderer/src/features/dashboard-preview/TimeDebtDashboardPreview.tsx`
- 完成内容：
  - 新增 `buildTimeDebtOverview()` 和 `TimeDebtOverview` 类型，基于真实 `logs / standards / params` 生成今日总时长、实际工时、标准工时、工时差额、净时间价值、状态、诊断、下一步动作、时间结构 segments 和负债 / 滋养 segments。
  - TimeDebt Preview 不再读取今日 mock 数据，改为接收真实 overview；保留 `InteractiveStackedBar` hover / tooltip / 图例联动。
  - TimeDebt Overview 面板与 Preview 使用同一份 overview，避免上方 Preview 和下方 Overview 指标不一致。
  - `最近 7 天趋势` 和 `效率与 AI 杠杆` 暂保留为占位说明，不继续使用 mock 数据；后续需要独立 7 日聚合和 top task selector。
- 计算规则：
  - `工作` → 工作；`学习` → 学习；`生活 / 恢复 / 睡眠 / 休息 / 日常` → 生活；`运动 / sport / exercise` → 运动；`空转 / idle / 刷信息 / 无效 / 失控` → 空转；其他 → 其他。
  - `actualWorkMinutes = 工作 + 学习`。
  - 标准工时优先使用当日标准工时，没有则 fallback 480 min。
  - `debtMinutes = max(0, actualWorkMinutes - standardWorkMinutes) + idleMinutes`。
  - `nourishMinutes = exerciseMinutes`。
  - 状态按 `empty / healthy / warning / debt` 四档输出诊断和下一步动作。
- 空状态逻辑：
  - 今日无日志时显示“今日暂无时间日志”，时间结构和负债对抗条显示空状态，不展示 mock 数字。
  - Overview 提供“去新增时间日志”入口。
- 验收结果：
  - `pnpm typecheck` / `pnpm lint` 因当前 Mac PATH 无 `pnpm` 未直接执行。
  - 等效 typecheck 通过：`./node_modules/.bin/tsc --noEmit -p tsconfig.node.json && ./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json`。
  - 等效 build 通过：`PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/electron-vite build`。
  - dev server 已启动并返回 HTTP 200。
  - in-app browser 已确认空状态显示真实空状态；共享聚合函数用工作 120 / 学习 60 / 运动 30 / 空转 45 样本验证为总时长 255、实际工时 180、负债 45、滋养 30。
- 当前问题：
  - in-app browser 直开 `localhost:5173` 仍缺少 Electron preload；完整桌面验收以 Electron 窗口为准。
  - 7 日趋势和 top tasks 仍未接真实 selector，本轮只接今日 Overview。
- 下一步：
  - Wealth Overview 真实数据融合：把 Wealth Preview 从 mock 数据逐步接入真实 localStorage records。

### 2026-04-28｜Dashboard Preview V0.1

- 设备：Windows
- 分支：main
- commit：本轮最终 commit 以 `git rev-parse --short HEAD` 和最终汇报为准
- 本轮目标：确认并补齐 Time Debt Dashboard Preview、Wealth Dashboard Preview、Life Dashboard Preview 的可见入口、验收记录和双设备同步文档。
- 修改文件：
  - `docs/handoff/DEVELOPMENT_LOG.md`
  - `docs/handoff/SYNC_LOG.md`
  - `docs/handoff/MACBOOK_SETUP.md`
  - `docs/product/DASHBOARD_FUTURE_BACKLOG.md`
- 完成内容：
  - 确认 `app/renderer/src/features/dashboard-preview/*` 已存在并提供统一 Preview 组件、mock 数据和三类仪表盘页面。
  - 确认 `人生总览` 入口展示 Life Dashboard Preview。
  - 确认 `财富` Overview 内展示 Wealth Dashboard Preview，并保留原有财富记录和统计功能。
  - 确认 `时间负债` Overview 内展示 Time Debt Dashboard Preview，并保留原有时间日志、日度统计和诊断功能。
  - 更新 MacBook 接力说明和 Dashboard backlog，明确本轮属于 Preview V0.1 快速出效果版。
- 验收结果：
  - `pnpm install`：通过，lockfile 已是最新。
  - `pnpm typecheck`：通过。
  - `pnpm build`：通过。
  - `pnpm dev`：已有 dev 进程运行，renderer 地址 `http://localhost:5173/` 返回 HTTP 200。
- 当前问题：
  - 本轮仍使用 mock 数据，不接真实 records/store 汇总、不接 LLM、不接外部 API。
  - 工作区存在本地运行残留 `codex-live-dev.pid`，不纳入提交。
- 下一步：
  - MacBook 拉取本轮 commit 后验收 `人生总览`、`财富`、`时间负债` 三个入口的 Preview 是否可见，并确认 `成长树` 仍可正常进入。

### 2026-04-28｜AI Workflow Assets 跨设备同步

- 设备：Windows / Codex
- 分支：main
- commit：本轮最终 commit 以 `git rev-parse --short HEAD` 和最终汇报为准
- 本轮目标：把 Win 端已沉淀的 Codex / AI workflow / skills / handoff 资产整理成可版本管理目录，并推送到 GitHub 供 Mac 拉取复用。
- 修改文件：
  - `.ai-workflow/README.md`
  - `.ai-workflow/skills/*/SKILL.md`
  - `.ai-workflow/commands/README.md`
  - `.ai-workflow/docs/README.md`
  - `.ai-workflow/handoff/README.md`
  - `docs/handoff/MAC_NEXT_ACTION.md`
  - `docs/handoff/SYNC_LOG.md`
  - `docs/handoff/DEVELOPMENT_LOG.md`
- 完成内容：
  - 解决中断前遗留 rebase 冲突，保留 Mac / Win 两段开发日志。
  - 建立 `.ai-workflow/` 统一入口。
  - 同步 `concise-dev`、`frontend-skill`、`handoff-card`、`repo-map` 四个可复用 skill。
  - 建立 commands / docs / handoff 索引，明确当前未发现 repo 内 command 文件。
  - 更新 Mac 下一步操作卡，补齐拉取、安装 skill、验收和失败回传命令。
- 验收结果：
  - `git rebase --continue` 已完成。
  - `.ai-workflow/README.md` 可读并包含 skills / commands / docs / handoff 索引。
  - 已执行敏感关键词扫描；未发现需要纳入提交的真实密钥。
- 当前问题：
  - Mac 端尚未 pull 验收。
  - `codex-live-dev.pid` 为本地运行残留，继续不提交。
- 下一步：
  - MacBook 拉取最新 main 后确认 `.ai-workflow/README.md` 和 `.ai-workflow/skills/*/SKILL.md` 存在，并按需安装到 `$HOME/.codex/skills`。

### 2026-04-28｜TimeDebt 时间日志输入体验优化 V0.2

- 设备：MacBook / Codex
- 分支：main
- commit：未提交，本地工作区变更
- 本轮目标：优化 TimeDebt “新增时间日志”入口，降低真实时间数据的日常录入成本。
- 修改文件：
  - `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
  - `app/renderer/src/features/time-debt/SmartOptionInput.tsx`
  - `app/renderer/src/features/time-debt/timeDebtOptionsStorage.ts`
  - `docs/handoff/DEVELOPMENT_LOG.md`
- 完成内容：
  - 开始时间 / 结束时间输入框在字段为空且获得焦点时，自动填入当前电脑本地时间。
  - 新增单个轻量计时器，支持“开始计时 → 结束计时并生成记录”，并复用现有 TimeDebt logs 保存逻辑。
  - 一级分类、二级项目、工作量单位改为候选输入，可选择旧选项，也可直接输入新选项。
  - 新增本地选项池 `growth-tree-os:time-debt-options:v1`，保存日志时自动把新分类 / 项目 / 单位加入候选池。
  - 保留原表单保存逻辑和分类字典入口，不改日志 schema、数据库、IPC、导航或 Wealth。
- 验收结果：
  - 等效 typecheck 通过：`./node_modules/.bin/tsc --noEmit -p tsconfig.node.json && ./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json`。
  - dev server 已启动，`http://localhost:5173/` 返回 HTTP 200；随后已停止。
  - 待 Electron 窗口手动目测：时间字段自动填充、计时器生成日志、候选项保存后复用。
- 当前问题：
  - 计时器运行态暂存在 React state，刷新页面会丢失正在进行的计时；本轮先不新增 running timer 持久化。
  - `pnpm` 当前不在 PATH，`package.json` 当前无 `lint` 脚本。
- 下一步：
  - TimeDebt Overview 根据新日志继续做更细的 7 日趋势 / top tasks selector。
  - Wealth Overview 真实数据融合。
