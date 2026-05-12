# AGENTS｜growth-tree-os 开工说明

## 1. 项目定位

- 项目名称：growth-tree-os
- 项目定位：本地优先的个人成长操作系统。
- 当前阶段：Integration｜Time Debt + Wealth 双模块集成验证。

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

## 4. Skill 策略

每次任务先判断 skill，再决定是否执行。

- 先搜索本机已有 skill，优先复用已有流程。
- 如果已有 skill 能覆盖 70% 以上需求，优先复用，再做最小补充。
- 不要一上来新建 skill；只有重复出现、流程稳定、输入输出清楚、未来大概率复用时，才考虑沉淀新 skill。
- 如果流程还不稳定，只记录为候选 skill、mini 模板或 SOP 草案。
- 每轮输出中说明是否搜索 skill、命中了哪个 skill、未命中时采用什么基础工作流，以及是否值得沉淀。

## 5. 默认分工

- Codex：Time Debt / 时间负债、数据记录链路、项目地图状态接续、日志压缩索引、开发协同文档。
- Claude：Wealth / 财富模块、财富规则配置、DashboardPreview 真实数据接入、展示优化。

## 6. Parallel Development Startup Gate｜并行开发开工门禁

每次开始任务前，必须先判断当前属于哪种开发模式：

1. `module-dev`：单模块开发。
2. `parallel-dev`：双端并行开发。
3. `multi-agent-dev`：多端并行开发。
4. `integration`：集成开发。
5. `smoke`：只读验收 / smoke。
6. `docs-sync`：文档归档 / 协议更新。

在任何修改前，必须先执行并输出：

- 当前 branch。
- 当前 commit。
- 工作区是否 clean。
- 当前任务类型。
- 当前任务模块。
- 当前设备 / 代理角色。
- 当前远程 HEAD。
- 允许修改范围。
- 禁止修改范围。
- 是否需要 `fetch origin`。
- 是否需要确认远程 HEAD。
- 是否可能与其他端冲突。
- 是否允许修改 `docs/project-state/**` / `docs/project-map/MAP_STATUS.md`。
- 是否需要 commit / push。
- 本轮唯一目标。

默认规则：

- 业务分支不得随意修改 `docs/project-state/**`、`docs/project-map/MAP_STATUS.md`、`AGENTS.md`、`docs/dev-protocol/**`。
- 只有任务明确属于 `integration`、`workflow hardening`、地图归档或协议更新时，才允许修改共享状态文件或协议文件。
- Time Debt 任务默认只改 `app/renderer/src/features/time-debt/**` 和对应 handoff。
- Wealth 任务默认只改 `app/renderer/src/features/wealth/**` 和对应 handoff。
- Integration 任务必须先 `git fetch origin`，并以远程分支 HEAD 为准。
- Integration 完成后必须用 `git merge-base --is-ancestor` 检查是否包含双方最新 HEAD。
- 参考 commit 只用于识别上下文，最终判断以 `git fetch origin` 后的 `origin/<branch>` HEAD 为准。

## 7. 并行开发与集成边界

- 不要同时修改 `app/renderer/src/features/time-debt/**` 和 `app/renderer/src/features/wealth/**`。
- 不要两端同时改 `app/main/db.ts`、`app/main/ipc.ts`、`app/renderer/src/app/store.ts`、`app/renderer/src/pages/MainWorkspacePage.tsx`。
- 不要同时覆盖 `docs/project-state/**` 或 `docs/project-map/MAP_STATUS.md`。
- 集成分支中可以同时带入 Time Debt 与 Wealth 成果，但共享文件冲突必须手工合并。
- Wealth 图表路线依赖 `echarts` 与 `echarts-for-react`，集成时必须保留。
- Wealth Records Insight 相关能力包括记录搜索、日期/类型/分类分组、支出类型占比饼图与分类 chip，集成后需要 smoke。
- 不要 merge、rebase、reset 或 push，除非用户明确要求。

## 8. GitHub Sync Gate

除非用户明确要求只读、不修改、不提交或不推送，否则每轮完成并验证后进入 GitHub 保存流程。

推送前必须检查：

```bash
git status
git branch --show-current
git remote -v
```

必须注意：

- 不提交 `.env`、密钥、token、账号密码、代理配置。
- 不提交无关缓存、构建产物、临时大文件。
- 不提交 `node_modules`、`dist`、`out` 等无必要目录。
- 不强推，不删除分支，不自动覆盖用户未提交改动。
- 如果发现敏感文件进入暂存区，必须移除并说明。

## 9. Mac 下一步操作卡

GitHub 推送完成后，必须生成或更新：

```text
docs/handoff/MAC_NEXT_ACTION.md
```

操作卡至少包含项目名、GitHub 仓库、当前分支、最新 commit、本轮完成内容、修改文件、验证结果、clone / pull 命令、依赖安装命令、启动命令、验收方式、下一轮任务和失败时需要返回的信息。

如果另一台设备已有未提交改动，不要直接 pull；先执行 `git status`，再判断 stash、commit 还是保留等待处理。

## 10. 每轮结束必须输出

- 当前 branch / commit / working tree。
- 本轮读取了哪些入口文件。
- 修改文件列表。
- 验证命令与结果。
- `git diff --stat`。
- GitHub push 结果；如果失败，说明失败原因和本地状态。
- Mac 下一步操作卡摘要。
- 下一轮唯一入口。
- 是否修改业务代码、Time Debt、Wealth、是否 push。

## 11. 当前地图入口

- 总地图：`docs/project-map/PROJECT_MAP.md`
- 当前地图位置：`docs/project-map/MAP_STATUS.md`
