# Codex Startup Checklist｜Codex 开工前强制检查清单

每次 Codex 开始任何开发任务前，必须先完成本清单。没有输出开工判断前，不允许修改文件。

## 1. 读取协议文件

必须读取：

- `AGENTS.md`
- `docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md`
- `docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md`
- `docs/dev-protocol/DEV_LOG_RULES.md`
- `docs/dev-protocol/PROJECT_HANDOFF_RULES.md`
- `docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md`

如果文件不存在，停止业务开发，先提示需要建立协议文件。

每次开发前，必须先读取 `docs/dev-protocol/PROJECT_HANDOFF_RULES.md`，确认是否存在新聊天框交接规则、模块切换规则和固定任务指令开头。未完成读取前，不允许直接开始业务开发。

每次开发前，必须先读取 `docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md`，确认当前任务是否属于默认分工范围。如果任务需要跨设备边界，必须先写跨边界声明，再设计执行方案。未完成读取前，不允许直接开始跨边界任务。

## 2. 检查 Git 状态

必须执行：

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
git fetch origin
```

如果 `git status --short` 有未提交内容，先判断是否属于本轮允许范围；不属于本轮范围时停止修改并输出文件列表。

## 3. 判断当前设备角色

必须明确当前是在：

- Windows
- Mac
- 其他代理 / 只读验收环境

如果无法判断，通过路径、系统命令或用户指定判断。

## 4. 判断当前任务类型

必须将任务归入以下之一：

- `module-dev`：单模块开发。
- `parallel-dev`：双端并行开发。
- `multi-agent-dev`：多端并行开发。
- `integration`：集成 / 合并。
- `smoke`：只读验收 / smoke。
- `docs-sync`：文档归档 / 协议更新。

任何修改前必须输出：

- 当前 branch。
- 当前 commit。
- 工作区是否 clean。
- 当前任务类型。
- 当前模块。
- 当前设备 / 代理角色。
- 当前远程 HEAD。
- 允许修改范围。
- 禁止修改范围。
- 是否允许修改 `docs/project-state/**` / `docs/project-map/MAP_STATUS.md`。
- 是否需要 commit / push。
- 本轮唯一目标。

## 5. 判断应使用的分支

禁止直接在 `main` 上开发。

推荐：

- Time Debt：`feature/mac-time-debt-*`
- Wealth：`feature/claude-wealth-*`
- Integration：`feature/integration-time-debt-wealth`
- develop 只用于汇合集成后的稳定候选，不作为随手开发分支。

参考 commit 仅供识别，最终以 `git fetch origin` 后的 `origin/<branch>` HEAD 为准。

## 6. 声明文件边界

开始修改前必须输出：

- 本轮允许修改的文件 / 目录。
- 本轮禁止修改的文件 / 目录。
- 本轮日志或 handoff 文件路径。
- 是否需要按 `docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md` 发起跨边界声明。

业务分支默认不得修改：

- `docs/project-state/**`
- `docs/project-map/MAP_STATUS.md`
- `AGENTS.md`
- `docs/dev-protocol/**`

除非任务明确属于：

- 地图归档。
- 协议更新。
- `integration`。
- `workflow hardening`。

## 7. 并行开发检查

如果本轮是 `parallel-dev` 或 `multi-agent-dev`，必须输出：

- 当前代理负责模块。
- 当前分支是否正确。
- 远程 HEAD 是什么。
- 是否有未 push 提交。
- 是否会修改共享文件。
- 是否需要等待另一端完成。
- 是否可能触碰对方模块或共享入口。

默认边界：

- Time Debt 任务默认只改 `app/renderer/src/features/time-debt/**` 和对应 handoff。
- Wealth 任务默认只改 `app/renderer/src/features/wealth/**` 和对应 handoff。
- 共享文件默认由 integration 或主控代理统一处理。

## 8. Integration 检查

如果本轮是 `integration`，必须先执行：

```bash
git fetch origin
git rev-parse --short origin/feature/mac-time-debt-plan-flow-overlap-ui
git rev-parse --short origin/feature/claude-wealth-baseconfig-persistence-latest
git rev-parse --short origin/develop
```

开始 integration 前必须确认：

- Codex 当前任务已结束并 push。
- Claude 当前任务已结束并 push。
- 双方工作区 clean。
- 双方远程 HEAD 已确认。
- 集成以远程 HEAD 为准，不以聊天记忆中的旧 commit 为准。

集成完成后必须执行：

```bash
git merge-base --is-ancestor origin/feature/mac-time-debt-plan-flow-overlap-ui HEAD
echo "Time Debt latest included: $?"
git merge-base --is-ancestor origin/feature/claude-wealth-baseconfig-persistence-latest HEAD
echo "Wealth latest included: $?"
```

只有两个结果都是 `0`，才允许说 integration 包含双方最新内容。

## 9. 只读验收和文档归档检查

如果本轮是 `smoke`：

- 默认不修改文件。
- 只运行验收命令、页面检查或截图记录。
- 不在业务分支判断另一个模块是否最新；统一预览只看 integration 分支。

如果本轮是 `docs-sync`：

- 先确认文档所有权。
- 不改业务代码。
- 不改依赖文件。
- 明确是否允许更新 `docs/project-state/**` 和 `docs/project-map/MAP_STATUS.md`。

## 10. 日志路径

必须使用独立日志文件：

```text
docs/dev-log/YYYY-MM/YYYY-MM-DD/mac-任务名.md
docs/dev-log/YYYY-MM/YYYY-MM-DD/win-任务名.md
docs/dev-log/YYYY-MM/YYYY-MM-DD/integration-summary.md
```

禁止两端同时写同一个日志文件。

## 11. 修改前检查

如果本轮任务需要修改对方设备负责范围：

- 不直接修改。
- 记录为跨边界需求。
- 按 `docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md` 写入跨边界声明。
- 输出风险说明。
- 等集成阶段处理。

## 12. 收工前检查

提交前必须执行：

```bash
git diff --name-only
git status --short
```

并检查：

- 是否触碰禁止修改区域。
- 是否写入正确日志或 handoff。
- 是否运行适合本轮的验收命令。
- 是否 commit 到正确 feature 分支。
- 是否 push 到远程 feature 分支。
- integration 是否通过双方 HEAD 包含性检查。
