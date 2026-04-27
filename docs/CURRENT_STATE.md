# CURRENT_STATE

## 2026-04-27 Life Vitality Tree 主视觉方向

- 新主视觉方向已切到 Life Vitality Tree / 人生生长树，建议模块名为 Life Vitality Tree Canvas。
- Obsidian Graph V1 已退出产品主线，后续不再对标 Obsidian 关系图谱；旧图谱只作为历史实验与 hover / highlight / detail 交互参考保留。
- 当前阶段是产品定义和指导书整理，不进入 3D 开发，不改数据库、IPC、Zustand 或功能代码。
- Life Vitality Tree 的主规划、保留池、决策方法和未来扩展风险记录在 `docs/LIFE_VITALITY_TREE.md`。

## 当前主线

当前主线 = 基础功能闭环优先。

本轮不继续追 Obsidian 高保真图谱。当前最稳的推进方向是把已有 `Desktop + Local-first` 成长树工作区的基础功能闭环补清楚：复盘录入、结构更新、节点详情、搜索/回看/筛选、图谱展示之间的真实状态要稳定、可验收、可接续。

## 当前项目真实状态

- 桌面工作区入口在 `app/renderer/src/pages/MainWorkspacePage.tsx`，当前已经有 `成长树 / 图谱 V1 / 提醒 / 周回看` 视图分支。
- 工作区状态由 `app/renderer/src/app/store.ts` 协调，已覆盖启动加载、复盘详情、节点选择、节点跳转、提醒完成、节点已回看、周回看刷新。
- IPC 能力边界在 `app/main/ipc.ts`，已暴露复盘、节点、树快照、结构更新、提醒、周回看和数据根目录。
- 真实数据逻辑集中在 `app/main/db.ts`，SQLite 表覆盖 `reviews / nodes / edges / node_evidence / reminders / app_settings`。
- 首启 seed 状态样本见 `data/seeds/seed-overview.json`：6 条主线、2 篇 seed 复盘、示例节点、证据和可触发提醒/回看的时间数据。

## 已完成内容

- 复盘可创建，并通过主进程写入 Markdown 与 SQLite，见 `db.ts` 的 `createReview`。
- 复盘保存后可进入结构更新抽屉，结构更新最多取 3 条，见 `store.ts` 的 `createReview` 和 `submitExtraction`。
- 结构更新可新建节点或绑定已有节点，并写入证据、边和节点状态，见 `db.ts` 的 `applyExtraction`、`createNode`、`touchNode`。
- 成长树主图使用真实 `TreeSnapshot`，入口是 `TreeCanvas`，由 `store.ts` 启动和提交更新后刷新。
- 节点详情可从 SQLite 读取最近证据、状态、提醒摘要，见 `db.ts` 的 `getNodeDetail`。
- 提醒与周回看已有真实后端规则，见 `db.ts` 的 `syncReminders`、`listAllReminders`、`completeReminder`、`getWeeklyReview`。
- `pnpm smoke` 已可通过，包含 typecheck 与 build。

## 进行中内容

- 搜索/回看/筛选仍需要收口。主画布当前使用 `TreeCanvas` 内的前端过滤；`nodes.search` IPC 和 `db.searchNodes` 已存在，但主工作区搜索框没有直接走数据库搜索结果。
- 图谱展示有两条线：真实成长树主图在 `features/tree/TreeCanvas.tsx`；Obsidian 图谱 V1 在 `features/obsidian-graph`，但后者仍是 mock/prototype。
- README 的能力边界偏早，仍更像 P0.1 基础闭环说明；实际代码已经包含 P0.2/P0.3 的提醒、周回看和图谱入口。

## 暂停支线

- Obsidian 高保真图谱优化：暂停。
- 暂停原因：当前 `ObsidianGraphView.tsx` 明确读取 `mockGraphData.ts`，尚未接入真实成长树数据链；继续追交互/视觉还原会偏离基础功能闭环。
- 暂停前状态：已有图谱控制区、力导向画布、右侧面板、筛选、局部/全局模式、节点拖拽位置状态，但数据仍为 mock。
- 详细暂停记录见 `docs/PAUSED_BRANCHES.md`。

## 当前最大卡点

当前最大卡点不是图谱视觉，而是项目主线和验收口径需要统一：应先围绕基础功能闭环明确哪些是真数据、哪些仍是 mock，随后按 `docs/BASIC_FUNCTION_BACKLOG.md` 逐条补齐基础链路。

## 2026-04-25 Git 同步卫生修复

- 本轮只处理 GitHub push 被大文件拒绝后的同步卫生问题，不改业务逻辑、不改 UI、不重构。
- `node_modules/` 已从 Git 追踪中移除并加入 `.gitignore`，本地目录不删除。
- 构建产物、环境文件、本地数据库、运行时数据和 TypeScript 构建缓存已加入忽略规则，避免 Windows / Mac 双设备同步时提交本地私有或平台相关文件。

## 2026-04-25 Wealth Dashboard / 双设备协同基线

- 本轮将最高优先级切到 Windows / GitHub / MacBook 协同和 Wealth Dashboard V1，不出 APK，不处理 Android 构建。
- Wealth V1 先落在 renderer/shared 层：共享算法在 `app/shared/wealth.ts`，页面入口在 `app/renderer/src/features/wealth/WealthDashboard.tsx`。
- Wealth 页面已经接入主导航，作为 `财富` 视图展示今日财富状态、账户变化、额度燃烧、未来钱判断、投资池、持续流血、睡后收入和双轨标准。
- 当前 Wealth V1 使用本地示例数据，不接支付宝、微信、银行卡、BTC、股票或外部实时价格 API。
- 协同底座补齐 `.env.example`、README 的 Windows/macOS 启动说明，以及 `docs/handoff/MACBOOK_SETUP.md` MacBook 接力卡。

## 2026-04-25 Wealth 语义记录流

- Wealth 已从静态展示推进到可语义化记录：支持现实收入、睡后收入、系统收入、稳定理财、真实支出、持续出血、体验出血、资产变化 8 类记录。
- 记录保存位置为 renderer `localStorage`，key 为 `growth-tree-os:wealth-records:v1`，本轮不新增 SQLite/IPC。
- Wealth Dashboard 会从 records 汇总 Income / Expenses / Assets / Evaluation，并复用 `calculateDailyWealthSnapshot()` 计算今日状态、未来钱、可投资结余、自由度净变化和评分。
- 支持新增记录、最近记录回看、删除记录、刷新后保留；后续可把 `localStorage` 存储迁移到主进程 SQLite。

## 2026-04-25 Time Debt 桌面端 V1

- Time Debt 已作为 `时间负债` 入口接入顶部导航，页面入口为 `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`。
- 共享数据结构与计算层在 `app/shared/timeDebt.ts`，覆盖 TimeDebtLog、WorkTimeStandard、ProjectCategory、TimeDebtParams、DailyTimeDebtStats、TimeDebtDiagnosis。
- 本轮保存位置为 renderer `localStorage`：`growth-tree-os:time-debt-logs:v1`、`growth-tree-os:time-debt-standards:v1`、`growth-tree-os:time-debt-params:v1`。
- Time Debt V1 支持新增时间日志、删除日志、日度统计、负债参数配置、工作时间标准配置和仪表盘诊断；暂不接 SQLite/IPC、移动端或 AI 解释链。

## 2026-04-26 M11 Time Debt 验收与 Mac 接力

- Windows 端已执行 `git pull --ff-only`，远程 main 已是最新。
- 已执行 `pnpm install`，lockfile 已是最新，依赖可用。
- 已执行 `pnpm typecheck` 和 `pnpm build`，均通过。
- 已执行 `pnpm dev` smoke test，Electron dev server 可启动，renderer 地址为 `http://localhost:5173/`。
- 已用浏览器 renderer smoke 验证 `时间负债` 可进入，固定测试日志可保存，刷新后保留，Overview / Daily Stats / Dashboard 会随日志显示 70 min、0.24 min / 个、状态加权 490、AI 化加权 0。
- 已新增 `docs/handoff/MAC_NEXT_ACTION.md`，MacBook 可按该卡拉取、安装、启动并验收 Time Debt。
