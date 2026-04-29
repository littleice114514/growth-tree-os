# Codex Startup Checklist｜Codex 开工前强制检查清单

每次 Codex 开始任何开发任务前，必须先完成本清单。

## 1. 读取协议文件

必须读取：

- docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md
- docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md
- docs/dev-protocol/DEV_LOG_RULES.md

如果文件不存在，停止业务开发，先提示需要建立协议文件。

## 2. 检查 Git 状态

必须执行：

git status
git branch --show-current
git remote -v

## 3. 判断当前设备角色

必须明确当前是在：

- Windows
- Mac

如果无法判断，通过路径、系统命令或用户指定判断。

## 4. 判断当前任务类型

必须将任务归入以下之一：

- UI / 页面 / 交互
- 业务模块功能
- skill / 工作流
- 脚本 / 工具链
- 3D / 重资源
- 文档 / 日志
- 集成 / 合并

## 5. 判断应使用的分支

禁止直接在 main 上开发。

推荐：

Mac：
feature/mac-任务名

Windows：
feature/win-任务名

集成：
develop

## 6. 声明文件边界

开始修改前必须输出：

- 本轮允许修改的文件 / 目录
- 本轮禁止修改的文件 / 目录
- 本轮日志文件路径

## 7. 日志路径

必须使用独立日志文件：

docs/dev-log/YYYY-MM/YYYY-MM-DD/mac-任务名.md

或：

docs/dev-log/YYYY-MM/YYYY-MM-DD/win-任务名.md

禁止两端同时写同一个日志文件。

## 8. 修改前检查

如果本轮任务需要修改对方设备负责范围：

- 不直接修改。
- 记录为跨边界需求。
- 输出风险说明。
- 等集成阶段处理。

## 9. 收工前检查

提交前必须执行：

git diff --name-only
git status

并检查：

- 是否触碰禁止修改区域
- 是否写入正确日志
- 是否运行可用验收命令
- 是否 commit 到正确 feature 分支
- 是否 push 到远程 feature 分支
