# FILE_MAP

## Life Vitality Tree 文档

- `docs/LIFE_VITALITY_TREE.md`
  - Life Vitality Tree / 人生生长树的主规划与保留池。
  - 记录新主视觉方向、Obsidian Graph 归档、树对象语义、四层视角、年龄树形、保留池、Life Tree Decision Gate 和未来扩展风险。
  - 这是可调整的指导书，不是最终冻结方案。

## Life Vitality Tree v0.1

- `app/renderer/src/features/life-vitality-tree/LifeVitalityTreeCanvas.tsx`
  - 静态 Life Vitality Tree Canvas 占位组件。
  - 使用 HTML + SVG 做 2.5D 表达，支持远景、结构、模块、细节和年轮视角。
  - 使用本地 state 支持 hover 摘要和点击详情卡，不接 SQLite / IPC / Zustand TreeSnapshot。

- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeTypes.ts`
  - Life Tree v0.1 基础类型定义。
  - 包含视角、节点类型、季节、状态、树对象和年轮条目类型。

- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMockData.ts`
  - Life Tree v0.1 静态样例数据。
  - 用来表达根、土壤、树干、筋络、大枝、小枝、叶、花、果实、落叶和年轮入口。

## 主页面入口

- `app/renderer/src/pages/MainWorkspacePage.tsx`
  - 当前桌面工作区入口。
  - 根据 `currentView` 切换 `成长树 / 人生生长树 / 财富 / 时间负债 / 提醒 / 周回看`。
  - 不要在未明确需求时改三栏主布局。

## Store

- `app/renderer/src/app/store.ts`
  - Zustand 工作区状态中心。
  - 管理启动加载、树刷新、复盘详情、节点选择、节点跳转、搜索词、结构更新、提醒完成、节点已回看。
  - 基础功能闭环优先复用这里的动作，不另起状态系统。

## IPC

- `app/main/ipc.ts`
  - 主进程 IPC 注册入口。
  - 已注册 `reviews:create`、`reviews:listRecent`、`reviews:getDetail`、`nodes:getDetail`、`nodes:search`、`nodes:markReviewed`、`tree:getSnapshot`、`extraction:apply`、`reminders:listAll`、`reminders:complete`、`insights:getWeeklyReview`、`appPaths:getDataRoot`。
  - 新能力应优先沿用现有 IPC 命名和边界。

## DB

- `app/main/db.ts`
  - SQLite schema、seed、迁移、复盘、节点、边、证据、提醒、周回看规则都在这里。
  - 当前基础闭环的真实数据源。
  - 不要在状态恢复任务中改 schema 或状态推导。

## Graph 当前入口

- `app/renderer/src/features/tree/TreeCanvas.tsx`
  - 当前真实成长树主图。
  - 使用 `TreeSnapshot`，支持搜索过滤、hover、节点聚焦、React Flow 视口定位。

- `app/renderer/src/features/obsidian-graph/ObsidianGraphView.tsx`
  - Obsidian 图谱 V1 入口。
  - 当前使用 mock 数据，不是基础功能主线；2026-04-27 起已从主入口断开，旧代码保留为归档支线。

- `app/renderer/src/features/graph/GraphPrototype.tsx`
  - 旧图谱 prototype。
  - 文件内 mock 数据和 UI 原型较完整，但不是当前真实数据链路。

## Graph mock 数据入口

- `app/renderer/src/features/obsidian-graph/data/mockGraphData.ts`
  - Obsidian 图谱 V1 的 mock 节点和边。
  - 当前用于演示 note/tag/daily/project 关系，不应当作真实成长树数据。

## Seed 状态样本

- `data/seeds/seed-overview.json`
  - 记录首启 seed 概览。
  - 当前样本包含 6 条主线、2 篇 seed 复盘、stable/growing/review/dormant/repeat problem 等状态分布。

## 当前不能乱动的关键文件

- `app/main/db.ts`
  - 牵涉 schema、状态推导、提醒去重、周回看统计，改动风险高。
- `app/renderer/src/app/store.ts`
  - 牵涉主工作区所有视图和动作，改动会影响多条闭环。
- `app/renderer/src/pages/MainWorkspacePage.tsx`
  - 牵涉主布局和视图切换，当前不做 UI 大布局调整。
- `docs/PRODUCT_RULES_V0_1.md`、`docs/PRODUCT_RULES_V0_2.md`
  - 历史规则保留，用来追溯阶段演进，不作为当前默认主线。
