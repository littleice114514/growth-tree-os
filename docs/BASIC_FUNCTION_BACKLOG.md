# BASIC_FUNCTION_BACKLOG

当前主线 = 基础功能闭环优先。

## 1. 复盘录入闭环

状态：已完成，仍需继续验收。

依赖文件：

- `app/renderer/src/features/reviews/ReviewComposer.tsx`
- `app/renderer/src/features/reviews/ReviewSidebar.tsx`
- `app/renderer/src/app/store.ts`
- `app/main/db.ts`

当前做到哪里：

- 用户可以新建复盘。
- `store.ts` 的 `createReview` 调用 `api.createReview`。
- `db.ts` 的 `createReview` 写入 SQLite，并通过 `persistMarkdownReview` 写 Markdown。
- 保存后会打开结构更新流程。

下一步最小推进点：

- 手动验证新建复盘后最近复盘列表刷新、Markdown 路径存在、第二篇复盘不覆盖第一篇。

## 2. 节点生成闭环

状态：已完成，仍需继续验收。

依赖文件：

- `app/renderer/src/features/extraction/ExtractionDrawer.tsx`
- `app/renderer/src/app/store.ts`
- `app/main/db.ts`
- `app/main/ipc.ts`

当前做到哪里：

- 复盘保存后可提交 1 到 3 条结构更新。
- 结构更新可新建节点或绑定已有节点。
- `db.ts` 的 `applyExtraction` 会截取最多 3 条更新，写入节点、证据和主线边。
- 节点状态会通过 `recomputeDerivedState` 重新计算。

下一步最小推进点：

- 验证新建节点、绑定已有节点、勾选/取消证据三种路径是否都能刷新树和详情。

## 3. 节点详情闭环

状态：已完成，仍需继续验收。

依赖文件：

- `app/renderer/src/features/nodes/NodeDetailPanel.tsx`
- `app/renderer/src/features/reviews/ReviewDetailPanel.tsx`
- `app/renderer/src/app/store.ts`
- `app/main/db.ts`

当前做到哪里：

- 点击节点会调用 `selectNode`，切回成长树视图并打开节点详情。
- `getNodeDetail` 返回节点基础信息、最近 3 条证据、待处理提醒摘要、回看状态。
- 复盘详情中的关联节点可触发统一节点跳转。
- `markNodeReviewed` 和 `completeReminder` 已能刷新树、提醒、周回看和当前详情。

下一步最小推进点：

- 验证节点详情中的“这条我看过了”和“处理这条提醒”是否符合当前规则，不写入新证据、不刷新 `last_active_at`。

## 4. 搜索 / 回看 / 筛选闭环

状态：进行中。

依赖文件：

- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/features/tree/TreeCanvas.tsx`
- `app/renderer/src/app/store.ts`
- `app/main/ipc.ts`
- `app/main/db.ts`

当前做到哪里：

- 顶部工具栏已有搜索框，写入 `store.ts` 的 `searchQuery`。
- `TreeCanvas` 根据 `searchQuery` 在前端过滤当前 `TreeSnapshot`，并保留命中节点的上级关系。
- `db.ts` 已实现 `searchNodes`，`ipc.ts` 已暴露 `nodes:search`，`api.ts` 也有 `searchNodes`，但主工作区搜索框当前没有直接使用数据库搜索结果。
- 提醒和周回看条目可通过 `jumpToNode` / `selectNode` 回到节点详情。

下一步最小推进点：

- 先不改大布局，最小补齐搜索体验：明确工具栏搜索是“当前树内过滤”还是“数据库搜索结果跳转”。若要用真实搜索结果，复用已有 `nodes.search` IPC，不新增第二套搜索状态。

## 5. 图谱展示闭环

状态：真实成长树图已完成基础展示；Obsidian 高保真图谱仍为 mock / 暂停支线。

依赖文件：

- `app/renderer/src/features/tree/TreeCanvas.tsx`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `app/renderer/src/features/obsidian-graph/ObsidianGraphView.tsx`
- `app/renderer/src/features/obsidian-graph/data/mockGraphData.ts`
- `app/renderer/src/features/graph/GraphPrototype.tsx`

当前做到哪里：

- 真实成长树主图使用 `TreeSnapshot`，支持节点点击、hover、聚焦、缩放拖拽和搜索过滤。
- Obsidian 图谱 V1 已有入口和交互模块，但数据来自 `mockGraphData.ts`。
- 旧 `GraphPrototype` 也是 mock 数据原型，不接真实 SQLite。

下一步最小推进点：

- 当前不推进 Obsidian 高保真。只保证真实成长树图在基础功能闭环中稳定可用；未来恢复图谱支线时，先做真实数据映射，而不是继续堆 mock 交互。

