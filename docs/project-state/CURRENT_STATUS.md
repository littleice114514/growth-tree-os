# CURRENT_STATUS｜当前项目状态摘要

更新时间：2026-05-12
来源：`feature/integration-time-debt-wealth` 集成现场

## 1. 当前项目阶段

Integration｜Time Debt + Wealth 双模块集成验证阶段。

本文件记录 integration 分支当前状态，不代表 `main` 已完成集成。

## 2. 当前主线

当前唯一主线是把 Time Debt 最新成果与 Wealth 最新成果整合到同一个预览版本中，验证两个模块能否共存运行。

- `develop` 已从 `origin/main @ 4df9ada` 创建并推送。
- 当前集成分支：`feature/integration-time-debt-wealth`。
- Time Debt 分支：`origin/feature/mac-time-debt-plan-flow-overlap-ui @ 3a74cf0`，正在合入。
- Wealth 分支：`origin/feature/claude-wealth-baseconfig-persistence-latest @ edd4a1a`，待 Time Debt merge 完成后合入。

## 3. 当前已完成模块

- Demo 可运行：`pnpm typecheck`、`pnpm build` 可作为最小验证。
- 成长树基础闭环：复盘、结构更新、节点/证据/边、树快照、节点详情、提醒、周回看已有 SQLite / IPC / store 主链路。
- Time Debt：今日台、计划、计时、提醒联动、日/周/月/自定义日历、拖拽/调整、详情面板和账户命名空间已有日志证据。
- Wealth：本地记录流、汇总计算、baseConfig 持久化和配置面板已有交接卡证据。
- Life Vitality Tree / Life Curve：半真实映射、生命力检查、2D 树形骨架、六条人生曲线模型已存在。
- Account Foundation：SQLite 核心表 `user_id` 和 `local_user` 轻预留已有 smoke 记录。
- 开发协同：`docs/dev-protocol/**`、`docs/handoff/**`、`docs/project-map/**` 已形成协同入口。

## 4. 当前集成状态

- Time Debt merge 已开始，但遇到项目底座文档冲突，正在按 integration 策略解决。
- Wealth merge 尚未开始。
- 本轮不开发新功能，不做 Wealth 新需求，不做 Time Debt 新需求，不做 UI 大改。
- 当前目标不是封板 develop，而是得到可验证的统一预览分支。

## 5. 当前半完成模块

- 数据库层：核心成长树数据已进 SQLite；Time Debt / Wealth 多数仍在 renderer localStorage。
- 用户系统层：`local_user` 和 `user_id` 已预留；没有真实登录、注册、云账号或多用户切换。
- 可视化层：真实成长树与 Life Vitality Tree 可用；Obsidian Graph 仍是 mock 归档支线。
- 知识库层：复盘 Markdown、日志、handoff、project-map 可用；没有全文检索或 RAG。
- 运维维护层：本地验证命令可用；没有 CI、lint/test 脚本和自动发布。

## 6. 当前明确不做的模块

- 不做 AI 自动抽取、RAG、Agent。
- 不做云同步或真实多端数据合并。
- 不做商业化功能。
- 不做真实登录、注册、第三方登录。
- 不推进 Obsidian mock 图谱主线。
- 不启动 3D、Three.js、React Three Fiber 或重资源开发。

## 7. 当前地图位置摘要

- 主层级：本地产品层 + 开发协同工作流层。
- 副层级：Time Debt / Wealth 双模块并行，数据库和用户系统轻预留，可视化层 Life Vitality Tree 已进入半真实 2D 骨架。
- 阶段判断：不是 AI/RAG、云同步、商业化或 3D 主攻阶段。

## 8. 当前可用验证命令

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm smoke
```

`pnpm smoke` 等价串联 typecheck + build。

## 9. 当前最大风险

- 项目状态曾分散在旧底座和 handoff 中，容易导致新聊天框误读阶段；现在应优先读 `docs/project-state/**` 和 `docs/project-map/MAP_STATUS.md`。
- Time Debt / Wealth 分支边界必须保持清楚，避免两端同时修改同一批业务文件。
- project-state 三件套是新对话开工入口，集成冲突中不得被 main 或 Time Debt 任一侧直接覆盖。
- README、`docs/CURRENT_TASK.md` 与当前分支状态存在阶段错位，不能作为唯一状态来源。
