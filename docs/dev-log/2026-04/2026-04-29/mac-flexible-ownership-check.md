# 开发日志｜Mac｜flexible-ownership-check｜2026-04-29

## 1. 本轮目标

拉取并校验弹性分工协议。

## 2. 当前分支

feature/win-dual-device-protocol

## 3. 当前 HEAD

60c1917

## 4. 已读取协议文件

- docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md
- docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md
- docs/dev-protocol/PROJECT_HANDOFF_RULES.md

同时确认以下协议文件均已同步存在：

- docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md
- docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md
- docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md
- docs/dev-protocol/DEV_LOG_RULES.md
- docs/dev-protocol/PROJECT_HANDOFF_RULES.md
- docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md

## 5. 弹性分工摘要

Windows 默认负责 3D / 重资源 / skills / 脚本 / 工具链 / 构建辅助 / 文档协议。

Mac 默认负责 UI / 页面体验 / 交互 / 前端视觉 / 页面布局 / 轻量验收 / 用户实际操作体验。

默认分工用于减少冲突，不是硬锁死。新功能、新模块或新想法出现时，应先判断任务类型、资源需求、文件边界和冲突风险，再决定由 Windows、Mac 或双方协同完成。

## 6. 跨边界规则摘要

默认分工不是硬限制，但跨边界修改前必须写跨边界声明。

跨边界声明应说明：

- 跨边界原因
- 涉及文件
- 冲突风险
- 替代方案
- 最小修改策略
- 回滚方式

如果 Mac 临时参与 3D 页面展示，应优先处理 UI 容器、交互按钮、布局面板、状态提示和用户体验，不直接修改 Windows 负责的 3D 模型资源、glb / glTF、贴图材质、模型压缩或资源加载底座。

如果 Windows 临时修 UI，应先声明跨边界原因，只处理阻塞性 bug 或 3D 接入 demo 所需的最小 UI 改动，避免改动 Mac 当前负责的页面体验、核心组件和布局文件。

## 7. 3D 模块协同摘要

Windows 负责：

- 3D 模型资源
- glb / glTF 文件
- 模型压缩
- 贴图与材质资源
- 3D 渲染实验
- 资源加载性能测试
- 3D 资源目录结构

Mac 负责：

- 3D 页面入口
- 3D 控制按钮
- 面板布局
- 状态提示
- 用户交互体验
- 轻量预览验收
- 与现有 UI 风格统一

3D 模块协同时，应尽量拆分为资源层文件、渲染层文件、UI 控制层文件和页面容器文件，避免双方同时修改同一个 3D 组件文件。

## 8. 验收结果

协议文件齐全，弹性分工协议已同步到 Mac 端并完成读取确认。

当前 HEAD 为 `60c1917`，符合本轮预期。

Mac 可以在后续从最新协议分支或集成分支拉取后，创建 `feature/mac-*` 分支开展 UI、页面体验、交互和轻量验收类任务。开始前仍必须重新读取协议文件，并确认文件边界和日志路径。
