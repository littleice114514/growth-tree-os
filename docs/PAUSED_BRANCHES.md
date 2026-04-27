# PAUSED_BRANCHES

## Obsidian Graph V1 归档说明

状态：已退出主线，作为历史实验与局部交互参考保留。

Obsidian Graph V1 已退出主线。后续不再对标 Obsidian 关系图谱，而是转向 Life Vitality Tree / 人生生长树。旧图谱只作为历史实验与局部交互参考保留。

### 当前决策

- Obsidian Graph 内容先归档。
- 主入口已从顶部导航和页面切换中移除。
- 旧代码暂时不要直接物理删除。
- 不再围绕 Obsidian Graph 做产品优化。
- Obsidian Graph 只作为旧实验分支或交互参考保留。

### 保留价值

- hover 摘要；
- highlight 高亮；
- 点击详情卡；
- 局部聚焦；
- 复杂结构的渐进展示。

### 退出主线原因

- Obsidian Graph 最初只是为了参考关系图谱和生长感。
- Life Vitality Tree 更适合作为系统核心隐喻。
- 关系图谱表达的是节点连接，生命树表达的是人的生命状态、生长阶段和长期结构。

## Obsidian 高保真图谱优化

状态：暂停支线，已被上方 Obsidian Graph V1 归档说明覆盖为历史实验方向。

### 暂停原因

- 当前项目主线需要回到基础功能闭环优先。
- `app/renderer/src/features/obsidian-graph/ObsidianGraphView.tsx` 使用 `mockGraphData` 作为数据源，不是 SQLite / Markdown 的真实成长树数据。
- `app/renderer/src/features/graph/GraphPrototype.tsx` 也是独立 mock prototype，文件内明确提示下一轮应从 `buildGraphPrototypeData()` 替换为真实节点与关系映射。
- 继续追 Obsidian 高保真交互，会把精力投入到视觉和交互还原，而不是当前更需要稳定的复盘、节点、详情、搜索、回看闭环。

### 暂停前做到哪里

- `ObsidianGraphView` 曾接入图谱视图入口；2026-04-27 起已从主入口断开。
- `mockGraphData.ts` 已有 note / tag / daily / project 节点和 link / tag-ref / timeline / parent-child 关系样本。
- `features/obsidian-graph` 已有控制面板、画布、侧栏、筛选、局部图、节点拖拽位置等交互模块。
- 顶部工具栏不再暴露 `图谱 V1` 入口。
- 主页面不再按 `currentView === 'obsidianGraph'` 渲染 `ObsidianGraphView`。

### 当前已知问题

- 图谱数据仍为 mock，不能代表真实成长树。
- 图谱位置状态只存在于前端 store，没有持久化到 SQLite。
- 图谱节点类型与真实成长树节点类型不同：Obsidian 图谱为 `note / tag / daily / project`，真实成长树为 `mainline / ability / habit / method / issue / cognition / achievement`。
- 图谱线没有接入 `tree:getSnapshot`、`nodes:getDetail`、`reviews:getDetail` 等真实 IPC。
- 图谱高保真验收不应阻塞当前基础功能闭环。

### 未来恢复条件

只有当以下基础链路稳定后，才恢复本支线：

- 复盘录入闭环稳定。
- 节点生成闭环稳定。
- 节点详情闭环稳定。
- 搜索 / 回看 / 筛选闭环稳定。
- 当前成长树主图的数据口径、节点状态、提醒、周回看验收清楚。

### 恢复时先做什么

1. 先定义真实成长树数据到 Obsidian 图谱节点/边的最小映射。
2. 先用 `tree:getSnapshot` 输出真实节点和边，不新增第二套图谱数据源。
3. 先保证点击图谱节点能复用 `selectNode` / `jumpToNode` 打开真实节点详情。
4. 再考虑力导向布局、节点样式、局部图深度、位置持久化。

### 恢复时不要做什么

- 不要直接继续堆 mock 图谱节点。
- 不要另起一套数据库 schema。
- 不要绕开现有 IPC 和 Zustand 工作区状态。
- 不要把视觉高还原作为恢复第一步。
- 不要让图谱支线阻塞基础功能主线。
