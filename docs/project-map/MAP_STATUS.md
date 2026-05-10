# MAP_STATUS｜当前项目地图位置

更新时间：2026-05-10  
定位来源：当前 Git 状态、现有项目文档、`docs/dev-log/**` 压缩索引、文件结构、`package.json` scripts、本轮 typecheck/build 结果。  
注意：`AGENTS.md` 与 `docs/project-state/CURRENT_STATUS.md`、`NEXT_ACTION.md`、`LOG_INDEX.md` 已在 2026-05-10 建立；后续新聊天框优先读取这些新底座入口，再按需读取旧底座文件。

## 1. 当前地图位置

- 主层级：本地产品层 + 开发协同工作流层
- 副层级：Time Debt / Wealth 双模块并行，数据库和用户系统轻预留，可视化层 Life Vitality Tree 已进入半真实 2D 骨架
- 当前阶段判断：Demo 可运行层基本成立，本地产品层处于“多模块本地闭环收口 + 验收口径统一”阶段；不是 AI/RAG、云同步、商业化或 3D 主攻阶段。

## 2. 已完成路径

- Demo 可运行：`package.json` 提供 `typecheck`、`build`、`smoke`；本轮 `pnpm typecheck` 和 `pnpm build` 通过。
- 基础成长树闭环：复盘写入、结构更新、节点/证据/边、树快照、节点详情、提醒、周回看已有 SQLite / IPC / store 主链路。
- Time Debt：今日台、计划、计时、提醒联动、日/周/月/自定义日历、拖拽/调整、详情面板和账户命名空间已有日志证据。
- Wealth：本地记录流、汇总计算、baseConfig 持久化和配置面板已有 Claude 交接卡证据。
- Life Vitality Tree / Life Curve：半真实映射、生命力检查、2D 树形骨架、六条人生曲线模型已记录在 `CURRENT_STATE` 与 `FILE_MAP`。
- Account Foundation：SQLite 核心表 `user_id` 和 `local_user` 轻预留已有 smoke 记录；真实登录未做。
- 双设备协同：`docs/dev-protocol/**`、`docs/handoff/**` 已定义分支、文件边界、日志和接续卡。

## 3. 正在施工路径

- Time Debt 后续仍需围绕时间负债、数据记录、地图状态接续继续收口，尤其避免和 Wealth 分支交叉改文件。
- Wealth 当前分支聚焦 `app/renderer/src/features/wealth/**`，下一步建议从 DashboardPreview 接真实 localStorage 数据开始。
- 项目地图与 project-state 新底座已建立，后续每轮开发后优先更新 `MAP_STATUS.md` 和必要的 `docs/project-state/**`。
- 搜索 / 回看 / 筛选闭环仍是基础功能层的进行中项，需要确认“树内过滤”还是“数据库搜索结果跳转”。

## 4. 半完成路径

- 数据库层：核心成长树数据已进 SQLite；Time Debt / Wealth 多数仍在 renderer localStorage。
- 用户系统层：`local_user` 和 `user_id` 已预留，但没有真实登录、注册、云账号或多用户切换。
- 可视化层：真实成长树与 Life Vitality Tree 可用；Obsidian Graph 仍是 mock 归档支线。
- 知识库层：复盘 Markdown、日志和 handoff 可用，但没有全文检索/RAG。
- 运维维护层：本地验证命令可用；没有 CI、lint/test 脚本和自动发布。

## 5. 缺失路径

- 旧状态仍分散在 `docs/CURRENT_STATE.md`、`docs/CURRENT_TASK.md`、`docs/handoff/**`，但新开工入口已收敛到 `AGENTS.md` 和 `docs/project-state/**`。
- AI / RAG / Agent 未进入实现；当前只保留人工确认和前端规则层。
- 云同步和真实多端数据合并未实现；GitHub 只用于开发协同。
- 商业化功能未实现；Wealth 只是个人财富状态模块。

## 6. 疑似错位 / 重复路径

- `README.md` 仍偏早期 P0.1 口径，实际代码和日志已经包含 Time Debt、Wealth、Life Vitality Tree、Account Foundation。
- `docs/CURRENT_TASK.md` 仍指向 Life Vitality Tree V0.6，但当前分支和 handoff 更偏 Wealth baseConfig 持久化。
- 旧 Obsidian Graph / GraphPrototype 仍在代码中，当前不是主线，避免继续堆 mock 图谱。
- Time Debt 分支、Wealth 分支、Mac/Claude 接续卡之间存在不同阶段锚点；下一轮必须先确认 branch/commit 再开工。

## 7. 当前轻预留状态

- 数据库：核心 SQLite 已有；Account Foundation 的 `local_user/user_id` 已预留；Time Debt / Wealth 尚未统一迁移 SQLite。
- 知识库：Markdown 复盘、dev-log、handoff、project-map 已形成轻量知识库；无全文检索。
- AI/RAG/Agent：仅保留规划和 Life Curve 的 AI 协作子线；无模型调用、无 RAG。
- 云同步：未实现；GitHub 仅承担开发同步。
- 用户系统：`local_user` 本地身份预留；无真实登录。
- 商业化：未实现；Wealth 是个人财务/自由度语义层。
- 运维维护：本地 typecheck/build/smoke 可用；无 CI、lint/test。

## 8. 当前 smoke / 验收状态

- typecheck：本轮通过，命令 `pnpm typecheck`。
- build：本轮通过，命令 `pnpm build`。
- smoke：未单独运行 `pnpm smoke`，因为它等价串联 typecheck + build，本轮两个子命令已分别通过。
- 其他验证：未启动 Electron 真实点击 smoke；本轮目标是地图定位，不修 bug、不做新功能。

## 9. 后续并行开发边界

- Codex 默认负责：Time Debt / 时间负债、数据记录链路、项目地图状态接续、日志压缩索引、开发协同文档。
- Claude 默认负责：Wealth / 财富模块、财富规则配置、DashboardPreview 真实数据接入、展示优化。
- 禁止同时修改：`app/renderer/src/features/wealth/**`；`app/renderer/src/features/time-debt/**`；`app/main/db.ts`；`app/main/ipc.ts`；`app/renderer/src/app/store.ts`；`app/renderer/src/pages/MainWorkspacePage.tsx`；`docs/project-map/MAP_STATUS.md`；项目状态/交接文件。
- 需要交接的文件：`docs/project-map/MAP_STATUS.md`、`docs/project-map/PROJECT_MAP.md`、`docs/handoff/TIME_DEBT_MODULE_INDEX.md`、`docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`、`docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md`。

## 10. 下一轮唯一入口

- Codex 下一轮入口：先读 `docs/project-map/MAP_STATUS.md` + `docs/handoff/TIME_DEBT_MODULE_INDEX.md`，确认分支后只推进 Time Debt / 地图状态接续，不碰 Wealth 文件。
- Claude 下一轮入口：先读 `docs/project-map/MAP_STATUS.md` + `docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`，在 `app/renderer/src/features/wealth/**` 内完成 WealthDashboardPreview 接真实 localStorage 数据。

## 11. 受控业务开发第一轮验证结果

- 当前地图位置：本地产品层；Time Debt / Wealth 双模块并行；多模块本地闭环收口；并行边界固定。
- 已验证：Codex Time Debt 路线可被地图约束；Claude Wealth 路线可被地图约束；用户真实 UI 反馈可被地图收敛成小任务。
- 当前未完成：Time Debt 真实 Electron UI 最终 smoke；时区选择仅为 UI-only MVP，真实时间换算未做。
- 下一步系统优先级：1. 完成 Time Debt Mac UI smoke；2. 封板 M13；3. 再决定 Wealth P1 或 develop 集成。

## 全量日志压缩索引

| 日期 | 设备/代理 | 模块 | 已完成事项 | 验收结果 | 当前遗留问题 | 是否影响地图状态 |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-04-29 | Mac | 协议 | 读取协议、确认弹性分工和跨边界规则 | 协议齐全 | HEAD 记录有差异需确认 | 是，支撑协同边界 |
| 2026-04-29 | Windows | 协议 | 新增/确认 flexible ownership rules | `git diff --check` 通过 | 未做业务运行验证 | 是，支撑协同边界 |
| 2026-04-29 | Mac | Time Debt | 今日台 UI、计划流、重叠时间块、字段系统、周视图、提醒联动、计时稳定性 | 多轮 tsc 通过，部分 build 通过 | 部分真实点击 smoke 受环境阻塞 | 是，Time Debt 进入主施工 |
| 2026-04-30 | Mac | Time Debt Calendar | 日/周/月/自定义天数视图、时间轴、重叠布局、拖拽预留、交互稳定性、UI 密度 | typecheck/build 或 dev/browser smoke 多轮通过 | 部分轮次受 Rollup native 签名影响 | 是，Time Debt 日历基本成型 |
| 2026-05-06 | Mac | Account Foundation | `local_user`、核心表 `user_id`、迁移幂等、查询过滤 | TypeScript 和 SQLite smoke 通过；build/dev 曾受环境阻塞 | 无真实登录/云同步 | 是，用户系统轻预留 |
| 2026-05-06 | Mac | 环境 | 恢复 pnpm、重装依赖、定位 Rollup 签名问题 | `pnpm install`、`pnpm typecheck` 通过 | Codex App Node 加载 native 包仍可能失败 | 是，影响验收方式 |
| 2026-05-06 | Mac | Time Debt / Wealth | localStorage 账户命名空间补齐 | `pnpm typecheck`、`pnpm smoke` 通过 | 仍未迁移 SQLite | 是，数据层轻预留 |
| 当前分支 | Claude | Wealth | baseConfig 持久化、配置面板、保存/恢复默认 | handoff 记录 typecheck/build 通过 | DashboardPreview 仍未接真实数据 | 是，Claude 并行边界明确 |
