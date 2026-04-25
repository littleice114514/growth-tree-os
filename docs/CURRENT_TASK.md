# CURRENT_TASK

## 本轮唯一目标

固化当前项目真相，并把主线切回基础功能闭环优先。

本轮只做状态恢复、文档固化、主线切换和最小必要同步，不做大规模功能开发。

## 当前默认主线

当前默认主线 = 基础功能闭环优先。

优先关注：

1. 复盘录入闭环
2. 节点生成闭环
3. 节点详情闭环
4. 搜索 / 回看 / 筛选闭环
5. 图谱展示闭环

## 本轮不做

- 不重做图谱引擎。
- 不继续追 Obsidian 交互高还原。
- 不新开第二套工作流。
- 不重构数据库或状态架构。
- 不随意改 UI 大布局。
- 不做超出状态恢复范围的大功能。

## 涉及文件

- 状态记录：`docs/CURRENT_STATE.md`
- 当前任务：`docs/CURRENT_TASK.md`
- 暂停支线：`docs/PAUSED_BRANCHES.md`
- 文件地图：`docs/FILE_MAP.md`
- 基础功能 backlog：`docs/BASIC_FUNCTION_BACKLOG.md`
- 当前规则同步：`docs/PRODUCT_RULES_V0_3.md`
- Smoke 口径同步：`docs/SMOKE_TEST.md`

## 下一步唯一优先事项

下一轮从 `docs/BASIC_FUNCTION_BACKLOG.md` 开始，优先推进“搜索 / 回看 / 筛选闭环”的最小缺口。

推荐最小推进点：梳理主工作区搜索框当前只做前端过滤的问题，决定是否复用已有 `nodes.search` IPC，先让搜索结果、节点跳转、右侧详情形成稳定闭环。

## 验收标准

- 打开 `docs/CURRENT_STATE.md` 能看到当前项目真相。
- 打开 `docs/CURRENT_TASK.md` 能知道现在该做什么。
- 打开 `docs/PAUSED_BRANCHES.md` 能知道图谱为什么暂停。
- 打开 `docs/FILE_MAP.md` 能知道关键代码在哪。
- 打开 `docs/BASIC_FUNCTION_BACKLOG.md` 能看到基础功能主链状态。
- `docs/PRODUCT_RULES_V0_3.md` 和 `docs/SMOKE_TEST.md` 已明确当前主线不再是图谱高保真。
- 本轮没有源码重构、数据库改动或 UI 大布局改动。

