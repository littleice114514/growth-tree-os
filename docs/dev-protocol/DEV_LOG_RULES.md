# Dev Log Rules｜开发日志规则

## 1. 日志总原则

开发日志必须继续记录，但不得让 Mac 和 Windows 同时写入同一个日志文件。

后续开工不默认读取完整 dev-log 历史。默认先读：

1. `docs/project-state/CURRENT_STATUS.md`
2. `docs/project-state/LOG_INDEX.md` 最近 5 条
3. `docs/project-state/NEXT_ACTION.md`

只有当日志索引指向某条历史日志且任务确实需要追溯时，才读取相关 1 到 3 个原始日志。

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

## 6. 日志分层规则

本项目日志分为四层：

1. `docs/project-state/CURRENT_STATUS.md`：当前状态，只记录当前阶段、允许范围、禁止范围、卡点和下一步唯一任务。
2. `docs/project-state/LOG_INDEX.md`：日志索引，只记录最近任务摘要、日志路径、修改文件、验收结果、遗留问题和下一步。
3. `docs/dev-log/**`：完整归档，保存每轮详细日志，不作为默认开工入口。
4. 阶段交接卡：只在阶段收口、设备切换或用户明确要求时生成。

下次任务默认不读完整 dev-log。每轮结束必须更新 `CURRENT_STATUS.md`、`LOG_INDEX.md` 和本轮独立 dev-log；如果未更新，必须在日志中说明原因。
