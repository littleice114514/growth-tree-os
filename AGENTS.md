# AGENTS｜growth-tree-os 开工说明

## 1. 项目定位

- 项目名称：growth-tree-os
- 项目定位：本地优先的个人成长操作系统。
- 当前阶段：Demo 可运行层基本成立，正在收口本地产品层和开发协同工作流层。

## 2. 开工必读文件

每轮先读：

1. `docs/project-state/CURRENT_STATUS.md`
2. `docs/project-state/NEXT_ACTION.md`
3. `docs/project-state/LOG_INDEX.md`
4. `docs/project-map/MAP_STATUS.md`

需要全局路线时再读：

- `docs/project-map/PROJECT_MAP.md`
- `docs/FILE_MAP.md`

按任务模块补读：

- Time Debt：`docs/handoff/TIME_DEBT_MODULE_INDEX.md`
- Wealth：`docs/handoff/CLAUDE_WEALTH_NEXT_ACTION.md`
- 协同规则：`docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md`

## 3. 禁止默认读取

- 不要默认全量读取 `docs/dev-log/**`，先看 `docs/project-state/LOG_INDEX.md`。
- 不要读取 `public/assets`、3D 模型或重资源，除非任务明确需要。
- 不要在未确认任务范围前批量读取业务代码。

## 4. 默认分工

- Codex：Time Debt / 时间负债、数据记录链路、项目地图状态接续、日志压缩索引、开发协同文档。
- Claude：Wealth / 财富模块、财富规则配置、DashboardPreview 真实数据接入、展示优化。

## 5. 并行开发禁止事项

- 不要同时修改 `app/renderer/src/features/time-debt/**` 和 `app/renderer/src/features/wealth/**`。
- 不要两端同时改 `app/main/db.ts`、`app/main/ipc.ts`、`app/renderer/src/app/store.ts`、`app/renderer/src/pages/MainWorkspacePage.tsx`。
- 不要同时覆盖 `docs/project-state/**` 或 `docs/project-map/MAP_STATUS.md`。
- 不要 merge、rebase、reset 或 push，除非用户明确要求。

## 6. 每轮结束必须输出

- 当前 branch / commit / working tree。
- 本轮读取了哪些入口文件。
- 修改文件列表。
- 验证命令与结果。
- `git diff --stat`。
- 下一轮唯一入口。
- 是否修改业务代码、Time Debt、Wealth、是否 push。

## 7. 当前地图入口

- 总地图：`docs/project-map/PROJECT_MAP.md`
- 当前地图位置：`docs/project-map/MAP_STATUS.md`
