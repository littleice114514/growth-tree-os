# Codex Startup Checklist｜Codex 开工前强制检查清单

每次 Codex 开始任何开发任务前，必须先完成本清单。

## 1. 省 token 状态读取

每次开工先读取 project-state 三件套，禁止默认读取全部 dev-log：

1. `docs/project-state/CURRENT_STATUS.md`
2. `docs/project-state/LOG_INDEX.md` 最近 5 条
3. `docs/project-state/NEXT_ACTION.md`
4. 根据任务需要读取相关协议和代码

只有当 `LOG_INDEX.md` 指向某条历史日志且本轮确实需要追溯时，才允许读取相关 1 到 3 个原始 dev-log 文件。不得扫描 `docs/dev-log/**` 全部历史。

## 2. 读取协议文件

必须读取：

- docs/dev-protocol/AI_WORKFLOW_TOKEN_SAVING.md
- docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md
- docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md
- docs/dev-protocol/DEV_LOG_RULES.md
- docs/dev-protocol/PROJECT_HANDOFF_RULES.md
- docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md

如果文件不存在，停止业务开发，先提示需要建立协议文件。

每次开发前，必须先读取 docs/dev-protocol/PROJECT_HANDOFF_RULES.md，确认是否存在新聊天框交接规则、模块切换规则和固定任务指令开头。未完成读取前，不允许直接开始业务开发。

每次开发前，必须先读取 docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md，确认当前任务是否属于默认分工范围。如果任务需要跨设备边界，必须先写跨边界声明，再设计执行方案。未完成读取前，不允许直接开始跨边界任务。

## 3. 检查 Git 状态

必须执行：

git status
git branch --show-current
git remote -v

## 4. 判断当前设备角色

必须明确当前是在：

- Windows
- Mac

如果无法判断，通过路径、系统命令或用户指定判断。

## 5. 判断当前任务类型

必须将任务归入以下之一：

- UI / 页面 / 交互
- 业务模块功能
- skill / 工作流
- 脚本 / 工具链
- 3D / 重资源
- 文档 / 日志
- 集成 / 合并

## 6. 判断应使用的分支

禁止直接在 main 上开发。

推荐：

Mac：
feature/mac-任务名

Windows：
feature/win-任务名

集成：
develop

## 7. 声明文件边界

开始修改前必须输出：

- 本轮允许修改的文件 / 目录
- 本轮禁止修改的文件 / 目录
- 本轮日志文件路径
- 是否需要按 docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md 发起跨边界声明

## 8. 日志路径

必须使用独立日志文件：

docs/dev-log/YYYY-MM/YYYY-MM-DD/mac-任务名.md

或：

docs/dev-log/YYYY-MM/YYYY-MM-DD/win-任务名.md

禁止两端同时写同一个日志文件。

## 9. 修改前检查

如果本轮任务需要修改对方设备负责范围：

- 不直接修改。
- 记录为跨边界需求。
- 按 docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md 写入跨边界声明。
- 输出风险说明。
- 等集成阶段处理。

## 10. 收工前检查

提交前必须执行：

git diff --name-only
git status

并检查：

- 是否触碰禁止修改区域
- 是否写入正确日志
- 是否运行可用验收命令
- 是否 commit 到正确 feature 分支
- 是否 push 到远程 feature 分支
