# Dev Log Rules｜开发日志规则

## 1. 日志总原则

开发日志必须继续记录，但不得让 Mac 和 Windows 同时写入同一个日志文件。

禁止两端同时修改：

- docs/dev-log/latest.md
- docs/dev-log/today.md
- docs/dev-log/2026-xx-xx.md
- 任意共享单一日志文件

## 2. 日志目录标准

推荐目录：

docs/dev-log/YYYY-MM/YYYY-MM-DD/

例如：

docs/dev-log/2026-04/2026-04-29/

## 3. 日志文件命名

Mac 端日志：

mac-任务名.md

例如：

mac-time-debt-ui.md
mac-growth-tree-interaction.md
mac-wealth-page-ui.md

Windows 端日志：

win-任务名.md

例如：

win-skills-sync.md
win-3d-assets-pipeline.md
win-dev-scripts.md

集成日志：

integration-summary.md

只允许在合并阶段写入，不允许 Mac / Windows 日常开发同时写。

## 4. 单次日志内容模板

每个日志文件必须包含：

# 开发日志｜设备｜任务名｜日期

## 1. 本轮目标
写清楚本轮要完成什么。

## 2. 当前分支
写清楚当前 Git 分支。

## 3. 修改文件
列出 git diff --name-only 的结果。

## 4. 未修改区域
说明是否触碰禁止修改区域。

## 5. 验收命令
列出实际运行的命令。

## 6. 验收结果
写清楚通过 / 失败 / 未运行及原因。

## 7. 风险与遗留问题
列出后续需要注意的问题。

## 8. 下一步建议
写出下一步最合理推进点。

## 5. 日志冲突处理

如果出现日志冲突：

- 优先保留两个设备各自日志。
- 不要互相覆盖。
- 将冲突内容拆成 mac-*.md 和 win-*.md。
- integration-summary.md 只在合并阶段整理。
