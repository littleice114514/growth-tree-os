# PROJECT_MAP｜growth-tree-os 项目总地图

本文件用于把当前项目推进状态固定到“活点地图”坐标系中。地图可以完整，施工必须分阶段；当前默认策略是先保住本地可运行产品闭环，再逐层扩展。

## 1. Demo 可运行层

- 当前必须实现：Electron + React 桌面应用可启动；`pnpm typecheck`、`pnpm build` 可作为最小验收；核心入口 `成长树 / 人生生长树 / 人生曲线 / 财富 / 时间负债 / 提醒 / 周回看` 不白屏。
- 当前轻预留：`pnpm smoke` 聚合 typecheck + build；README 保留 Windows / macOS 启动说明。
- 后续再实现：正式安装包、自动化端到端截图验收、跨平台发布流水线。
- 当前证据：`package.json` scripts；`README.md`；`docs/SMOKE_TEST.md`；多篇 dev-log 记录 typecheck/build/dev smoke。
- 验收信号：`pnpm typecheck` 通过；`pnpm build` 通过；`pnpm dev` 可打开 Electron 或 renderer；核心导航可切换。
- 过度施工风险：在基础闭环仍需验收时提前做打包、发布、自动更新或复杂测试平台。

## 2. 本地产品层

- 当前必须实现：每日复盘、结构更新、成长树刷新、节点详情、提醒、周回看、Time Debt、Wealth 的本地可用闭环。
- 当前轻预留：Life Vitality Tree / Life Curve 作为半真实映射和前端规则层；Wealth / Time Debt 使用 localStorage 存储部分新模块数据。
- 后续再实现：统一属性系统、跨模块真实搜索体验、历史快照、记录编辑、趋势图。
- 当前证据：`docs/CURRENT_STATE.md`；`docs/BASIC_FUNCTION_BACKLOG.md`；`app/renderer/src/pages/MainWorkspacePage.tsx`；`app/renderer/src/features/time-debt/**`；`app/renderer/src/features/wealth/**`。
- 验收信号：复盘可写入；结构更新可生成或绑定节点；Time Debt 日历/计划/计时可操作；Wealth 配置刷新后保留。
- 过度施工风险：在真实业务数据链路未统一前继续堆视觉 mock 或新模块入口。

## 3. 数据库层

- 当前必须实现：SQLite 保存 reviews、nodes、edges、node_evidence、reminders、app_settings；主进程统一管理 schema、seed、CRUD 与派生状态。
- 当前轻预留：Account Foundation 已预留 `users/local_user` 和核心表 `user_id`；查询写入默认过滤 `local_user`。
- 后续再实现：正式 migration 框架、多用户切换、Time Debt / Wealth 从 localStorage 迁移到 SQLite。
- 当前证据：`app/main/db.ts`；`app/main/ipc.ts`；`docs/dev-log/2026-05/2026-05-06/mac-account-foundation*.md`。
- 验收信号：SQLite smoke 通过；旧 schema 可幂等迁移；新增复盘/节点/证据/提醒默认写入 `local_user`。
- 过度施工风险：过早引入复杂后端、账号体系或 migration 框架，造成当前本地闭环失稳。

## 4. 知识库层

- 当前必须实现：复盘 Markdown 落盘；节点证据和周回看可回看；项目文档能解释当前状态和下一步。
- 当前轻预留：dev-log、handoff、protocol、project-map 形成可检索的项目知识库。
- 后续再实现：全文检索、双向链接、导入 Obsidian/Markdown vault、知识条目版本化。
- 当前证据：`docs/dev-log/**`；`docs/handoff/**`；`docs/dev-protocol/**`；`persistMarkdownReview` 相关数据链。
- 验收信号：新复盘生成 Markdown；日志能压缩定位模块进度；下一轮代理可只读少量索引接续。
- 过度施工风险：把文档系统先做成复杂知识库产品，反而拖慢当前核心模块验收。

## 5. AI / RAG / Agent 层

- 当前必须实现：暂不实做 AI 自动抽取；结构更新仍由用户手动确认 1-3 条。
- 当前轻预留：产品文档与日志中保留 AI 协作、RAG、Agent 未来方向；Life Curve 有 AI 协作子线评分。
- 后续再实现：AI 自动抽取候选、RAG 检索复盘/节点/日志、Agent 式周回看建议、多代理任务分配。
- 当前证据：`README.md` 明确不做 AI 自动抽取；`docs/CURRENT_STATE.md` 与 Life Curve 规则记录 AI 协作维度。
- 验收信号：当前无 AI 依赖也可完整运行；未来接入前有明确输入、输出和人工确认边界。
- 过度施工风险：在数据闭环未稳前接入模型 API，导致不可验收、成本和隐私风险上升。

## 6. 可视化层

- 当前必须实现：真实成长树主图可用；Life Vitality Tree 2D/2.5D 半真实映射；Life Curve 六曲线模型；Obsidian Graph 旧支线归档。
- 当前轻预留：Life Vitality Tree v0.6 视觉骨架、树对象语义、生命力检查前端 state。
- 后续再实现：3D Life Tree playground、真实图谱数据映射、高保真动效。
- 当前证据：`docs/FILE_MAP.md`；`docs/LIFE_VITALITY_TREE.md`；`app/renderer/src/features/tree/TreeCanvas.tsx`；`app/renderer/src/features/life-vitality-tree/**`；`app/renderer/src/features/life-curve/**`。
- 验收信号：成长树从 `TreeSnapshot` 渲染；人生生长树无真实数据时 fallback 不白屏；Life Curve 可从最近复盘派生趋势。
- 过度施工风险：恢复 Obsidian mock 图谱或提前 3D 化，偏离基础功能闭环。

## 7. 多端同步层

- 当前必须实现：GitHub 作为 Windows / Mac / Claude / Codex 协同中枢；feature 分支边界清楚；handoff 文件能接续。
- 当前轻预留：`docs/dev-protocol/**` 定义双设备分工、分支、日志和交接规则。
- 后续再实现：云数据同步、设备间数据合并、冲突解决 UI。
- 当前证据：`docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md`；`docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md`；`docs/handoff/MAC_NEXT_ACTION.md`；`docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`。
- 验收信号：开始前能确认 branch/commit/status；收工有日志、验证、commit/push 状态；另一端可按操作卡继续。
- 过度施工风险：把 GitHub 协同误当成产品云同步，提前开发远端数据合并。

## 8. 用户系统层

- 当前必须实现：本地 `local_user` 身份预留；核心 SQLite 表带 `user_id`；不做真实登录。
- 当前轻预留：设置区展示本地账户信息；localStorage 数据逐步补账户命名空间。
- 后续再实现：注册、登录、密码、第三方登录、真实用户切换、权限边界。
- 当前证据：`docs/dev-log/2026-05/2026-05-06/mac-account-foundation*.md`；`docs/dev-log/2026-05/2026-05-06/mac-time-debt-wealth-localstorage-account-namespace.md`。
- 验收信号：旧数据保留并回填 `local_user`；新增核心数据默认归属 `local_user`；Time Debt / Wealth localStorage key 有账户命名空间。
- 过度施工风险：把用户系统扩展为真实认证后端，打断本地优先产品验证。

## 9. 商业化层

- 当前必须实现：不做商业化功能；仅在 Wealth 模块表达财富安全、未来钱、投资池、睡后收入等个人规则。
- 当前轻预留：Wealth baseConfig、记录类型、财富仪表盘作为未来商业/订阅/个人财务洞察的前置语义。
- 后续再实现：订阅、支付、价格页、导出报告、商业指标分析。
- 当前证据：`app/renderer/src/features/wealth/**`；`app/shared/wealth.ts`；`docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`。
- 验收信号：Wealth 配置可保存；记录可汇总；页面展示不依赖外部金融 API。
- 过度施工风险：过早接入支付、行情 API、真实账户授权或商业包装。

## 10. 运维维护层

- 当前必须实现：`.gitignore` 保护 node_modules、构建产物、数据库、本地运行数据；项目可通过 typecheck/build 做最低健康检查。
- 当前轻预留：dev-log、handoff、map status、file map 支撑维护；README 保留启动和 smoke 命令。
- 后续再实现：CI、lint/test 套件、自动 release、错误上报。
- 当前证据：`docs/CURRENT_STATE.md` 的 Git 同步卫生修复；`package.json` scripts；`docs/handoff/LOG_AUDIT_REPORT.md`。
- 验收信号：无敏感/本地产物进入 Git；验证命令结果记录清楚；失败时能定位到首个关键错误。
- 过度施工风险：在产品行为仍频繁变化时引入重 CI 或发布工程。

## 11. 开发协同工作流层

- 当前必须实现：每轮先确认仓库、分支、状态、边界；日志压缩后定位当前地图；Codex / Claude 不同时修改同一批业务文件。
- 当前轻预留：`docs/project-map/PROJECT_MAP.md` 和 `docs/project-map/MAP_STATUS.md` 作为活点地图入口。
- 后续再实现：`ROUTE_OPTIONS.md`、`MAP_DECISIONS.md`、`MAP_UPDATES.md`，仅当路线分叉和决策频繁后再增加。
- 当前证据：`docs/dev-protocol/**`；`docs/handoff/TIME_DEBT_MODULE_INDEX.md`；`docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`；本文件。
- 验收信号：下一轮只读地图状态 + 模块索引即可开工；并行边界可执行；不需要重读全量日志。
- 过度施工风险：一次性创建过多流程文档，导致维护负担超过收益。
