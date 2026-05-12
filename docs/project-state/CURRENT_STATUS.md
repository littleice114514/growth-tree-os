# CURRENT_STATUS｜当前项目状态摘要

更新时间：2026-05-12
来源：`feature/integration-time-debt-wealth` 集成现场

## 1. 当前项目阶段

Integration｜Time Debt + Wealth 双模块集成验证阶段。

本文件记录 integration 分支当前状态，不代表 `main` 或 `develop` 已完成集成。

## 2. 当前主线

当前唯一主线是把 Time Debt 最新成果与 Wealth 最新成果整合到同一个预览版本中，验证两个模块能否共存运行。

- `develop` 已从 `origin/main @ 4df9ada` 创建并推送。
- 当前集成分支：`feature/integration-time-debt-wealth`。
- Time Debt：已合入，来源 `origin/feature/mac-time-debt-plan-flow-overlap-ui @ 3a74cf0`，merge commit `eb2cdef`。
- Wealth：正在合入，来源 `origin/feature/claude-wealth-baseconfig-persistence-latest @ edd4a1a`；当前处理共享文档冲突，完成后进入命令与 UI 验证。

## 3. 当前已完成模块

- Demo 可运行：`pnpm typecheck`、`pnpm build`、`pnpm smoke` 可作为最小验证。
- 成长树基础闭环：复盘、结构更新、节点/证据/边、树快照、节点详情、提醒、周回看已有 SQLite / IPC / store 主链路。
- Time Debt：今日台、计划、计时、提醒联动、日/周/月/自定义日历、拖拽/调整、详情面板和账户命名空间已有日志证据；本集成分支已合入最新 Time Debt 分支。
- Wealth：本地记录流、汇总计算、baseConfig 持久化、现金流 ECharts 图表、记录搜索 / 分组、支出类型占比饼图等成果已进入 Wealth 分支；本集成分支正在合入并待验证。
- Account Foundation：SQLite 核心表 `user_id` 和 `local_user` 轻预留已有 smoke 记录。
- 开发协同：`docs/dev-protocol/**`、`docs/handoff/**`、`docs/project-map/**` 已形成协同入口。

## 4. 当前集成状态

- Time Debt merge 已完成。
- Wealth merge 已开始，业务文件、`package.json`、`pnpm-lock.yaml` 已带入工作区。
- 当前只剩共享文档冲突需要解决：`AGENTS.md`、`docs/project-map/MAP_STATUS.md`、`docs/project-state/**`。
- 本轮目标不是封板 `develop`，而是得到可验证的统一预览分支。

## 5. 当前半完成模块

- 数据库层：核心成长树数据已进 SQLite；Time Debt / Wealth 多数仍在 renderer localStorage。
- 用户系统层：`local_user` 和 `user_id` 已预留；没有真实登录、注册、云账号或多用户切换。
- 可视化层：真实成长树与 Life Vitality Tree 可用；Obsidian Graph 仍是 mock 归档支线。
- 知识库层：复盘 Markdown、日志、handoff、project-map 可用；没有全文检索或 RAG。
- 运维维护层：本地验证命令可用；没有 CI、lint/test 脚本和自动发布。

## 6. 当前明确不做

- 不开发新功能。
- 不做 AI 自动抽取、RAG、Agent。
- 不做云同步或真实多端数据合并。
- 不做商业化功能。
- 不做真实登录、注册、第三方登录。
- 不推进 Obsidian mock 图谱主线。
- 不启动 3D、Three.js、React Three Fiber 或重资源开发。
- 不 push `main`，不把 integration 合回 `develop`，不 rebase，不强推。

## 7. 当前可用验证命令

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm smoke
pnpm dev
```

## 8. 当前最大风险

- 项目状态曾分散在旧底座和 handoff 中，容易导致新聊天框误读阶段；现在应优先读 `docs/project-state/**` 和 `docs/project-map/MAP_STATUS.md`。
- Time Debt / Wealth 分支边界必须保持清楚，避免两端同时修改同一批业务文件。
- project-state 三件套是新对话开工入口，集成冲突中不得被任一单分支状态直接覆盖。
- Wealth 图表依赖 `echarts` 与 `echarts-for-react`，集成完成前必须确认依赖仍保留。
