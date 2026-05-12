# Dual Device Workflow｜双端协同开发标准

## 1. 基本原则

本项目允许 Windows 与 Mac 同时开发，但必须遵守以下规则：

- 不允许两端同时直接在 main 分支开发。
- 不允许两端同时修改同一批业务文件。
- 不允许两端同时写入同一个日志文件。
- Windows 与 Mac 必须各自使用 feature 分支。
- 所有阶段性成果先合并到 develop，再由 develop 验收后进入 main。
- 每次 Codex 开工前，必须先读取 docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md。
- 每次新聊天框继续推进项目前，必须先参考 docs/dev-protocol/PROJECT_HANDOFF_RULES.md。
- 每次任务涉及默认分工调整或跨边界修改时，必须先参考 docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md。

## 2. 分支定义

main：
稳定版本，只保存已验收版本。

develop：
双端集成分支，用于汇合 Windows 和 Mac 的阶段性成果。

feature/mac-*：
Mac 端开发分支，主要负责 UI、交互、页面体验、视觉、前端验收。

feature/win-*：
Windows 端开发分支，主要负责 skill、脚本、工具链、文档、重资源、3D 实验、构建与集成辅助。

## 3. 推荐分工

Mac 优先负责：
- UI 页面
- 前端页面体验
- 交互体验
- 前端视觉
- 页面布局
- 轻量功能验收
- 用户实际操作体验验收

Windows 优先负责：
- 3D 模型开发
- 3D 资源处理
- Three.js / React Three Fiber / 3D 渲染实验
- 重资源处理
- Codex skills
- Claude / Codex 工作流文件
- 脚本与工具链
- 构建、打包、集成辅助
- 文档与流程固化

默认分工用于减少冲突，不是永久锁死。任何一端需要临时承担对方默认范围内的任务时，必须先按 docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md 完成跨边界声明、文件边界确认、日志记录和冲突检查。

## 4. 开工流程

每次开工前必须执行：

1. git status --short
2. git branch --show-current
3. git rev-parse --short HEAD
4. git fetch origin
5. 读取 docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md
6. 明确当前设备角色：Mac / Windows / 其他代理
7. 明确当前任务类型：module-dev / parallel-dev / multi-agent-dev / integration / smoke / docs-sync
8. 明确当前任务分支和远程 HEAD
9. 明确允许修改文件范围
10. 明确禁止修改文件范围
11. 明确本轮日志或 handoff 文件路径
12. 明确是否允许修改 docs/project-state/** 与 docs/project-map/MAP_STATUS.md

## 5. 开发模式

### 模式 A：单模块开发

适用于一端只负责一个模块、其他端不并行修改同一区域。

- 只读底座和协议文件。
- 确认模块分支正确。
- 只修改本模块文件和对应 handoff。
- 完成后验证、commit、push 当前 feature 分支。

### 模式 B：双端并行开发

适用于 Codex 做 Time Debt、Claude 做 Wealth 等双端并行场景。

- 双方各自使用 feature 分支。
- 双方各自维护模块 handoff。
- 默认不改 `docs/project-state/**`、`docs/project-map/MAP_STATUS.md`、`AGENTS.md`、`docs/dev-protocol/**`。
- 默认不改共享入口文件。
- 完成后各自 push，由 integration 分支统一汇合。

### 模式 C：多端并行开发

适用于 Codex、Claude、Gemini、Cursor 等多代理并行场景。

每个端必须声明：

- 设备 / 代理角色。
- 模块。
- 分支。
- 文件边界。
- 是否只读。
- 是否会改共享文件。

共享文件默认由主控代理或 integration 统一修改。

### 模式 D：integration

适用于合并 Time Debt + Wealth 或其他多端成果。

- 冻结双方开发。
- 确认双方任务已结束并 push。
- 确认双方工作区 clean。
- `git fetch origin` 后，以远程分支 HEAD 为准。
- 创建或更新 integration 分支。
- merge 双方 HEAD。
- 冲突必须手工合并，不盲目覆盖。
- 完成后运行验收和 HEAD 包含性检查。
- push integration 分支。

## 6. 收工流程

每次收工前必须执行：

1. git status
2. git diff --name-only
3. 检查是否触碰禁止修改区域
4. 写入本轮独立日志文件
5. 运行项目可用的 lint / test / smoke 命令
6. commit
7. push 当前 feature 分支
8. 输出本轮修改文件、验收结果、风险点、下一步建议
9. 如本轮存在跨边界修改，输出跨边界声明与冲突检查结果

## 7. 合并规则

- 单端任务完成后，只 push feature 分支，不直接推 main。
- 双端成果汇合时，先切换到 develop。
- 先 git pull origin develop。
- 再 merge 对应 feature 分支。
- 冲突时不得盲目覆盖。
- 合并完成后必须运行验收命令。
- develop 稳定后，才允许合并 main。

## 8. Integration Freeze Rule｜集成冻结规则

开始 integration 前必须确认：

- Codex 当前任务已结束并 push。
- Claude 当前任务已结束并 push。
- 双方工作区 clean。
- 双方远程 HEAD 已确认。
- 集成任务已执行 `git fetch origin`。

如果任一端仍在开发、未 push、工作区不 clean 或远程 HEAD 未确认，不得开始集成。

## 9. Feature Branch HEAD Rule｜远程 HEAD 规则

集成任务不得只依赖聊天记忆中的关键 commit。

必须执行：

```bash
git fetch origin
git rev-parse --short origin/feature/mac-time-debt-plan-flow-overlap-ui
git rev-parse --short origin/feature/claude-wealth-baseconfig-persistence-latest
```

本轮集成默认以远程 HEAD 为准。参考 commit 仅用于识别上下文，不作为最终集成依据。

## 10. Integration Completion Gate｜集成完成门禁

集成完成后必须执行：

```bash
git merge-base --is-ancestor origin/feature/mac-time-debt-plan-flow-overlap-ui HEAD
echo "Time Debt latest included: $?"
git merge-base --is-ancestor origin/feature/claude-wealth-baseconfig-persistence-latest HEAD
echo "Wealth latest included: $?"
```

只有两个输出都是 `0`，才允许说 integration 包含双方最新内容。

## 11. Unified Preview Rule｜统一预览规则

只有 integration 分支用于同时查看 Time Debt + Wealth 最新成果。

- 不得在 Time Debt 分支判断 Wealth 是否最新。
- 不得在 Wealth 分支判断 Time Debt 是否最新。
- 统一预览使用 `feature/integration-time-debt-wealth`。

## 12. 新聊天框继承规则

本项目不依赖单个聊天框记忆维持开发规则。

任何新聊天框继续推进项目时，必须先参考：

docs/dev-protocol/PROJECT_HANDOFF_RULES.md

并要求开发代理先读取：

docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md

再进行任务判断、分支选择、文件边界确认和日志路径确认。

## 13. 弹性分工规则

本项目采用默认分工，但不采用硬性锁死。

Windows 默认负责 3D、重资源、skills、脚本、工具链与文档协议。

Mac 默认负责 UI、页面体验、交互、前端视觉与轻量验收。

如果新任务需要跨越默认边界，必须先读取：

docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md

并在日志中写明跨边界原因、涉及文件、冲突风险、替代方案、最小修改策略和回滚方式。

出现新想法、新模块或紧急阻塞时，任一端可以在明确理由、明确文件边界、明确日志记录、明确冲突检查的前提下承担临时跨边界任务。

跨边界任务必须先参考：

docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md
