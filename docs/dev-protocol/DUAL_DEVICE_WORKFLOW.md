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
- AI 工作流 / skills / 协议底座优化
- project-state 状态卡、日志索引规则和同步说明
- 脚本与工具链
- 构建、打包、集成辅助
- 文档与流程固化

默认分工用于减少冲突，不是永久锁死。任何一端需要临时承担对方默认范围内的任务时，必须先按 docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md 完成跨边界声明、文件边界确认、日志记录和冲突检查。

## 4. 开工流程

每次开工前必须执行：

1. git status
2. git branch --show-current
3. git remote -v
4. 读取 docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md
5. 明确当前设备角色：Mac / Windows
6. 明确当前任务分支
7. 明确允许修改文件范围
8. 明确禁止修改文件范围
9. 明确本轮日志文件路径

## 5. 收工流程

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

## 5.1 AI 工作流同步验收

当 Windows 端更新 AI 工作流、skills、协议底座、`docs/project-state/**` 或日志索引规则后：

1. Windows 端必须 push 当前 feature 分支。
2. Windows 端必须更新 `docs/handoff/MAC_NEXT_ACTION.md`，写清 Mac 拉取和验收命令。
3. Mac 端同步后必须执行一次 pull 验收，确认 project-state 三件套和相关协议存在。
4. Mac 端不要在同一轮同时改 `docs/project-state/**` 和 `docs/dev-protocol/**` 的核心内容，避免与 Windows 端冲突。
5. Mac 端验收通过后只新增独立日志：`docs/dev-log/YYYY-MM/YYYY-MM-DD/mac-ai-workflow-sync-check.md`。

## 6. 合并规则

- 单端任务完成后，只 push feature 分支，不直接推 main。
- 双端成果汇合时，先切换到 develop。
- 先 git pull origin develop。
- 再 merge 对应 feature 分支。
- 冲突时不得盲目覆盖。
- 合并完成后必须运行验收命令。
- develop 稳定后，才允许合并 main。

## 7. 新聊天框继承规则

本项目不依赖单个聊天框记忆维持开发规则。

任何新聊天框继续推进项目时，必须先参考：

docs/dev-protocol/PROJECT_HANDOFF_RULES.md

并要求开发代理先读取：

docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md

再进行任务判断、分支选择、文件边界确认和日志路径确认。

## 8. 弹性分工规则

本项目采用默认分工，但不采用硬性锁死。

Windows 默认负责 3D、重资源、skills、脚本、工具链与文档协议。

Mac 默认负责 UI、页面体验、交互、前端视觉与轻量验收。

如果新任务需要跨越默认边界，必须先读取：

docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md

并在日志中写明跨边界原因、涉及文件、冲突风险、替代方案、最小修改策略和回滚方式。

出现新想法、新模块或紧急阻塞时，任一端可以在明确理由、明确文件边界、明确日志记录、明确冲突检查的前提下承担临时跨边界任务。

跨边界任务必须先参考：

docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md
