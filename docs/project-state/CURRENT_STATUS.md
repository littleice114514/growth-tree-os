# CURRENT_STATUS｜当前项目状态摘要

更新时间：2026-05-10  
来源：`docs/project-map/MAP_STATUS.md`

## 1. 当前项目阶段

Demo 可运行层基本成立，项目正在从功能堆叠转向“本地产品层 + 开发协同工作流层”的收口阶段。

## 2. 当前主线

当前主线是补齐省 token 开工底座，并让后续 Codex / Claude 通过 project-state + project-map 快速定位项目状态。

业务开发主线暂不切换：Codex 默认接 Time Debt / 数据记录 / 地图状态，Claude 默认接 Wealth / 财富规则 / 展示优化。

## 3. 当前已完成模块

- Demo 可运行：`pnpm typecheck`、`pnpm build` 可作为最小验证。
- 成长树基础闭环：复盘、结构更新、节点/证据/边、树快照、节点详情、提醒、周回看已有 SQLite / IPC / store 主链路。
- Time Debt：今日台、计划、计时、提醒联动、日/周/月/自定义日历、拖拽/调整、详情面板和账户命名空间已有日志证据。
- Wealth：本地记录流、汇总计算、baseConfig 持久化和配置面板已有交接卡证据。
- Life Vitality Tree / Life Curve：半真实映射、生命力检查、2D 树形骨架、六条人生曲线模型已存在。
- Account Foundation：SQLite 核心表 `user_id` 和 `local_user` 轻预留已有 smoke 记录。
- 开发协同：`docs/dev-protocol/**`、`docs/handoff/**`、`docs/project-map/**` 已形成协同入口。

## 4. 当前半完成模块

- 数据库层：核心成长树数据已进 SQLite；Time Debt / Wealth 多数仍在 renderer localStorage。
- 用户系统层：`local_user` 和 `user_id` 已预留；没有真实登录、注册、云账号或多用户切换。
- 可视化层：真实成长树与 Life Vitality Tree 可用；Obsidian Graph 仍是 mock 归档支线。
- 知识库层：复盘 Markdown、日志、handoff、project-map 可用；没有全文检索或 RAG。
- 运维维护层：本地验证命令可用；没有 CI、lint/test 脚本和自动发布。

## 5. 当前明确不做的模块

- 不做 AI 自动抽取、RAG、Agent。
- 不做云同步或真实多端数据合并。
- 不做商业化功能。
- 不做真实登录、注册、第三方登录。
- 不推进 Obsidian mock 图谱主线。
- 不启动 3D、Three.js、React Three Fiber 或重资源开发。

## 6. 当前地图位置摘要

- 主层级：本地产品层 + 开发协同工作流层。
- 副层级：Time Debt / Wealth 双模块并行，数据库和用户系统轻预留，可视化层 Life Vitality Tree 已进入半真实 2D 骨架。
- 阶段判断：不是 AI/RAG、云同步、商业化或 3D 主攻阶段。

## 7. 当前可用验证命令

```bash
pnpm typecheck
pnpm build
pnpm smoke
```

`pnpm smoke` 等价串联 typecheck + build。

## 8. 当前最大风险

- 项目状态曾分散在旧底座和 handoff 中，容易导致新聊天框误读阶段；现在应优先读 `docs/project-state/**` 和 `docs/project-map/MAP_STATUS.md`。
- Time Debt / Wealth 分支边界必须保持清楚，避免两端同时修改同一批业务文件。
- README、`docs/CURRENT_TASK.md` 与当前分支状态存在阶段错位，不能作为唯一状态来源。
