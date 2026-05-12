# 开发日志｜Mac｜protocol-check｜2026-04-29

## 1. 本轮目标

校验双端协同协议文件。

## 2. 当前分支

feature/win-dual-device-protocol

## 3. 当前 HEAD

91bbb5c

注：本轮任务要求确认 HEAD 是否为 918bb5c；实际 `git rev-parse --short HEAD` 输出为 91bbb5c。

## 4. 已读取协议文件

- docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md
- docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md
- docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md
- docs/dev-protocol/DEV_LOG_RULES.md
- docs/dev-protocol/PROJECT_HANDOFF_RULES.md

## 5. Mac 后续开发规则摘要

Mac 后续默认负责 UI、页面体验、交互、前端视觉和轻量验收。

每次开发前必须先读取协议文件，执行 Git 状态检查，确认当前设备角色、当前分支、任务类型、允许修改范围、禁止修改范围和本轮日志文件路径。未完成这些判断前，不允许直接修改业务代码。

## 6. 禁止事项

- Mac 不直接在 main 上开发。
- Mac 不和 Windows 同时修改同一批文件。
- Mac 不和 Windows 同时写同一个日志文件。
- Mac 不写 win-*.md 日志。
- Mac 不修改 Windows 当前负责文件。
- Mac 不在旧模块分支里直接开发新模块。

## 7. 日志规则

Mac 后续日志应写入：

```text
docs/dev-log/YYYY-MM/YYYY-MM-DD/mac-任务名.md
```

禁止两端同时写入共享单一日志文件。合并总结只在集成阶段写入 `integration-summary.md`。

## 8. 验收结果

协议文件齐全，已读取以下 5 个 dev-protocol 文件：

- docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md
- docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md
- docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md
- docs/dev-protocol/DEV_LOG_RULES.md
- docs/dev-protocol/PROJECT_HANDOFF_RULES.md

当前分支为 `feature/win-dual-device-protocol`，当前 HEAD 为 `91bbb5c`，与任务中给出的 `918bb5c` 不一致。

在确认该 HEAD 差异可接受后，可以开始后续 Mac feature 分支开发。后续 Mac 开发分支应使用：

```text
feature/mac-任务名
```
