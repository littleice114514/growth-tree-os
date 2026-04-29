# Dual Device Workflow｜双端协同开发标准

## 1. 基本原则

本项目允许 Windows 与 Mac 同时开发，但必须遵守以下规则：

- 不允许两端同时直接在 main 分支开发。
- 不允许两端同时修改同一批业务文件。
- 不允许两端同时写入同一个日志文件。
- Windows 与 Mac 必须各自使用 feature 分支。
- 所有阶段性成果先合并到 develop，再由 develop 验收后进入 main。
- 每次 Codex 开工前，必须先读取 docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md。

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
- 前端页面体验
- UI / 交互 / 视觉优化
- 轻量功能闭环
- 用户实际操作体验验收

Windows 优先负责：
- Codex skills
- Claude / Codex 工作流文件
- 脚本与工具链
- 3D 模型实验或重资源处理
- 构建、打包、集成辅助
- 文档与流程固化

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

## 6. 合并规则

- 单端任务完成后，只 push feature 分支，不直接推 main。
- 双端成果汇合时，先切换到 develop。
- 先 git pull origin develop。
- 再 merge 对应 feature 分支。
- 冲突时不得盲目覆盖。
- 合并完成后必须运行验收命令。
- develop 稳定后，才允许合并 main。
