# Project Handoff Rules｜项目推进交接规则

## 1. 文件目的

本文件用于保证在新聊天框、新设备、新模块继续推进项目时，不会忘记双端协同开发规则。

本项目不依赖单个聊天框记忆维持开发标准。任何新一轮开发任务开始前，都必须先读取项目内协议文件，再判断任务类型、设备角色、分支、文件边界和日志路径。

---

## 2. 新聊天框固定交接块

以后在新聊天框继续推进 growth-tree-os 项目时，必须继承以下规则：

```text
# growth-tree-os 项目推进固定规则

项目必须遵守双端协同开发标准。

仓库内协议文件：
- docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md
- docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md
- docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md
- docs/dev-protocol/DEV_LOG_RULES.md
- docs/dev-protocol/PROJECT_HANDOFF_RULES.md
- docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md

以后给 Codex / Claude / Cursor 等开发代理任何开发指令时，必须要求它先按 Parallel Development Startup Gate 执行，读取 CODEX_STARTUP_CHECKLIST.md，再判断当前设备、分支、任务类型、允许修改范围、禁止修改范围和日志路径。

不要让 Mac 和 Windows 同时直接改 main。
不要让两端同时改同一批业务文件。
不要让两端同时写同一个日志文件。

Mac 默认负责：
- UI
- 页面体验
- 交互
- 前端视觉
- 轻量验收

Windows 默认负责：
- 3D 模型开发
- 3D 资源处理
- Three.js / React Three Fiber / 3D 渲染实验
- 重资源处理
- skills
- .codex / .claude 工作流
- 脚本
- 工具链
- 构建辅助
- 文档协议

默认分工不是永久锁死。
如果一端需要临时承担对方默认负责范围，必须先读取 FLEXIBLE_OWNERSHIP_RULES.md，并明确跨边界原因、文件边界、日志路径和冲突检查结果。

双端默认分工不是永久锁死。新想法出现时，先根据任务类型、资源需求、文件边界和冲突风险重新判断设备角色；如需跨边界，必须按 FLEXIBLE_OWNERSHIP_RULES.md 记录跨边界声明。

日志必须按设备拆分：
docs/dev-log/YYYY-MM/YYYY-MM-DD/mac-任务名.md
docs/dev-log/YYYY-MM/YYYY-MM-DD/win-任务名.md

合并总结只在集成阶段写：
docs/dev-log/YYYY-MM/YYYY-MM-DD/integration-summary.md

分支规则：
main = 稳定版本
develop = 双端集成分支
feature/mac-* = Mac 任务分支
feature/win-* = Windows 任务分支
feature/integration-time-debt-wealth = Time Debt + Wealth 统一预览和集成分支

业务分支默认不得修改：
- docs/project-state/**
- docs/project-map/MAP_STATUS.md
- AGENTS.md
- docs/dev-protocol/**

除非任务明确是 integration、workflow hardening、地图归档或协议更新。

集成任务不得只依赖聊天记忆中的关键 commit。参考 commit 仅供识别，最终以 git fetch origin 后的 origin/<branch> HEAD 为准。

同时查看 Time Debt + Wealth 最新成果时，只看 feature/integration-time-debt-wealth；不得在 Time Debt 分支判断 Wealth 是否最新，也不得在 Wealth 分支判断 Time Debt 是否最新。

本轮任务开始前，请先生成给开发代理的指令，并且指令第一段必须要求开发代理读取上述协议文件。
```

---

## 3. 每次开发前必须执行的判断

每次开发前，开发代理必须先输出：

1. 当前设备角色：Mac / Windows
2. 当前分支
3. 当前 commit
4. 工作区是否 clean
5. 当前任务类型：module-dev / parallel-dev / multi-agent-dev / integration / smoke / docs-sync
6. 当前模块
7. 当前远程 HEAD
8. 本轮允许修改范围
9. 本轮禁止修改范围
10. 是否允许修改 `docs/project-state/**` / `docs/project-map/MAP_STATUS.md`
11. 本轮日志或 handoff 文件路径
12. 是否存在跨边界风险
13. 是否需要 commit / push
14. 本轮唯一目标
15. 是否可以开始开发

未完成以上判断，不允许直接修改业务代码。

---

## 4. 模块切换规则

当项目从一个模块切换到另一个模块时，例如：

- Time Debt → Wealth
- Wealth → Life Vitality Tree
- Life Vitality Tree → 3D Tree
- UI 优化 → skill / 工作流优化

必须先重新判断：

- 当前模块边界
- 当前设备是否适合负责该模块
- 是否需要新建 feature 分支
- 是否会触碰另一端正在开发的文件
- 是否需要先从 develop 拉取最新内容
- 本轮日志应该写入哪个独立文件

禁止在旧模块分支里直接开发新模块。

---

## 5. 交接卡要求

每次阶段结束，如果用户要求“任务交接卡”或“阶段索引卡”，必须包含：

- 当前项目目标
- 当前分支
- 当前设备角色
- 已完成内容
- 修改文件列表
- 当前模块边界
- 禁止误改区域
- 是否涉及弹性分工或跨边界声明
- 日志文件位置
- 验收结果
- 当前风险
- 下一步唯一优先事项
- 可直接复制到新聊天框的续推文本

交接内容应尽量放进一个完整 Markdown 代码块，方便用户一键复制到新聊天框。
