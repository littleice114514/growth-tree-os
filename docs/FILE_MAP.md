# FILE_MAP

## Life Vitality Tree 文档

- `docs/LIFE_VITALITY_TREE.md`
  - Life Vitality Tree / 人生生长树的主规划与保留池。
  - 记录新主视觉方向、Obsidian Graph 归档、树对象语义、四层视角、年龄树形、保留池、Life Tree Decision Gate 和未来扩展风险。
  - 这是可调整的指导书，不是最终冻结方案。

## Life Vitality Tree v0.1

- `app/renderer/src/features/life-vitality-tree/LifeVitalityTreeCanvas.tsx`
  - Life Vitality Tree Canvas 入口组件。
  - 使用 HTML + SVG 做 2.5D 表达，支持远景、结构、模块、细节和年轮视角。
  - v0.2 后优先使用半真实映射数据，保留 mock fallback。
  - v0.3 接入“今日生命力检查”面板和顶部季节反馈。
  - v0.4 接入 LifeTreeVisualState，联动顶部树状态、画布 tone 和详情卡生命力解释。

- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeTypes.ts`
  - Life Tree 基础类型定义。
  - 包含视角、节点类型、季节、状态、树对象、年轮条目、v0.3 DailyVitalityCheck 和 v0.4 LifeTreeVisualState 类型。

- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMockData.ts`
  - Life Tree v0.1 静态样例数据。
  - 用来表达根、土壤、树干、筋络、大枝、小枝、叶、花、果实、落叶和年轮入口。
  - v0.2 后继续作为无 tree 数据时的 fallback。

- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMapper.ts`
  - Life Tree v0.2 半真实数据映射层。
  - 将现有 `TreeSnapshot`、`ReviewRecord[]`、`WeeklyReviewSummary` 转换为 Life Vitality Tree 对象。
  - 不改 SQLite、IPC 或原始成长树推导逻辑。
  - 使用 unknown + 安全读取函数兼容字段缺失和不同命名风格。
  - 将普通 review 映射为 `leaf`，将包含失控、拖延、失败等关键词的 review 映射为 `fallen_leaf`。
  - 数据为空或异常时回退 `lifeVitalityTreeMockData.ts`。

- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeVitality.ts`
  - Life Tree v0.3 生命力检查规则层。
  - 定义 7 个默认维度、总分计算、生命力类型判断、季节映射和中文摘要。
  - 当前为纯前端规则，不接数据库、不做 AI 自动判断。

- `app/renderer/src/features/life-vitality-tree/VitalityCheckPanel.tsx`
  - Life Tree v0.3 “今日生命力检查”面板。
  - 使用组件 state 记录 7 个维度的 0-5 分和备注。
  - 向 Canvas 回传总分、生命力类型和季节反馈；v0.4 后继续驱动视觉反馈规则；暂不持久化。

- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeVisualState.ts`
  - Life Tree v0.4 生命力视觉反馈规则层。
  - 将 DailyVitalityCheck 映射为 LifeTreeVisualState。
  - 定义 tone、season、summary、warnings、highlights 和树干 / 叶子 / 根系 / 果实 / 落叶状态说明。
  - 提供节点详情卡的“今日生命力影响”文案。

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
