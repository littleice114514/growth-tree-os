# CURRENT_TASK

## 本轮唯一目标

完成 Life Vitality Tree / 人生生长树 V0.6 2D 树形视觉骨架重塑，并继续保持 Windows / GitHub / MacBook 协同底座。

本轮不推进 3D。只在现有 Life Vitality Tree 页面内强化 2D 树形骨架：根系、树干、主枝、叶子、果实和枯萎信号的视觉层级。

## 当前默认主线

当前默认主线 = Life Vitality Tree V0.6 2D 树形视觉骨架 + 双设备 GitHub 协同优先。

优先关注：

1. 保留 v0.2 Life Tree mapper 和 mock fallback。
2. 保留 v0.3 VitalityCheckPanel 和 DailyVitalityCheck。
3. 保留 v0.4 LifeTreeVisualState 和视觉 tone 联动。
4. 节点 label 改成更稳定的深色 pill，保证暗色发光背景下可读。
5. 收缩并避让画布浮层，减少对主树干和核心节点遮挡。
6. 右侧未选中节点时显示 Global Vitality / 全局生命力。
7. 点击节点后仍显示 Selected Node Details。
8. V0.6 在 Canvas 内部派生树形布局，不改变 LifeTreeNode 原始数据。
9. 中心树干、底部根系、左右主枝、叶 / 果 / 枯萎信号应形成清晰层级。
10. 右侧未选中状态改为解释“这棵树如何阅读”。
11. 不改 DB / IPC / 原始 TreeSnapshot 逻辑。
12. GitHub main 分支可同步，MacBook 可 pull 验收。

## 本轮不做

- 不删除 Obsidian Graph 文件。
- 不移动工程文件。
- 不改数据库。
- 不改 Zustand store。
- 不改 IPC。
- 不安装新依赖。
- 不启动 3D 开发。
- 不新增多个分散规划文档。
- 不新增真实 SQLite / IPC 链路。
- 不删除 mock 数据。
- 不做 AI 自动评分。
- 不做真实 3D、摄像头或手势识别。
- 不新增 `root_nutrient` 作为正式节点类型，根系养分本轮仍作为土壤候选说明。
- 不新增 `life_curve_daily_scores` 表。
- 不做 30 天趋势、阶段台阶或未来人生预测图。
- 不引入 Recharts 或其他图表依赖。
- 不开发 3D 树，不安装 three.js / @react-three/fiber / drei。
- 不做物理引擎、L-System 或生成式动画。

## 涉及文件

- Life Vitality Tree 主规划：`docs/LIFE_VITALITY_TREE.md`
- Life Vitality Tree Canvas：`app/renderer/src/features/life-vitality-tree/LifeVitalityTreeCanvas.tsx`
- Life Tree 类型：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeTypes.ts`
- Life Tree mock 数据：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMockData.ts`
- Life Tree mapper：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMapper.ts`
- Life Tree vitality 规则：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeVitality.ts`
- Life Tree vitality 面板：`app/renderer/src/features/life-vitality-tree/VitalityCheckPanel.tsx`
- Life Tree visual state 规则：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeVisualState.ts`
- Life Curve 页面：`app/renderer/src/features/life-curve/LifeCurveDashboard.tsx`
- Life Curve 类型：`app/renderer/src/features/life-curve/lifeCurveTypes.ts`
- Life Curve 规则：`app/renderer/src/features/life-curve/lifeCurveRules.ts`
- 本轮重点组件：`app/renderer/src/features/life-vitality-tree/LifeVitalityTreeCanvas.tsx`
- 主页面入口：`app/renderer/src/pages/MainWorkspacePage.tsx`
- 导航入口：`app/renderer/src/components/Toolbar.tsx`
- 视图类型：`app/renderer/src/types/ui.ts`
- 状态记录：`docs/CURRENT_STATE.md`
- 当前任务：`docs/CURRENT_TASK.md`
- 文件地图：`docs/FILE_MAP.md`

## 下一步唯一优先事项

下一轮优先让另一台设备按 `docs/handoff/MAC_NEXT_ACTION.md` pull 最新 main，并验证 `人生生长树` 是否已从普通节点图变成更明确的 2D 生命树骨架。

设备验收完成后，再决定是否推进 Life Vitality Tree 3D Prototype 独立 Playground，或先把当前视觉布局 helper 拆成可测试的独立 layout 模块。

## 2026-04-28 Life Vitality Tree 2D 可读性验收口径

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm dev` 可启动。
- 顶部导航仍显示 `人生生长树`，且不恢复 `图谱 V1`。
- `人生生长树` 页面可打开。
- 节点 label 在暗色发光背景下清晰可读。
- 当前视角浮层不遮挡主树干和核心节点区域。
- 第一眼能看到中心树干、底部根系、左右主枝和枝端叶 / 果。
- 枝干连接线从树干向外生长，不再像普通关系线。
- 果实节点暖色突出，枯萎 / 时间负债信号更暗且略微下坠。
- 未点击节点时，右侧显示 Global Vitality / 全局生命力。
- 右侧未选中状态解释根系、树干、主枝、叶子、果实和枯萎如何阅读。
- 点击节点后，右侧切换为节点详情。
- hover tooltip、视角切换和今日生命力检查面板仍可用。
- 有复盘时能生成最近 7 天 LifeCurveDailyScore。
- 无复盘时显示 mock fallback，不白屏。
- 每日卡片显示五条子线分数、复合分、证据、风险和 nextFocus。
- 顶部显示今日复合分、变强的线、最该补的线。
- 典型学习 / 项目 / AI / 财富 / 健康文本能触发对应分数和证据。
- 严重失控、健康或财富损耗会进入 risks。
- `人生生长树` 页面 metrics 反映现有 TreeSnapshot、复盘和节点映射状态。
- hover / click 详情卡能显示真实节点标题、所属路径、创建时间、更新时间、状态映射和来源。
- 最近复盘存在时，年轮视角按年份聚合 review rings。
- 无 tree 数据时仍回退 mock，不白屏。
- 数据来源摘要显示叶子、花、果实、枯叶、落叶 / 枯叶、土壤候选和最近更新时间。
- 复盘中的普通行动映射为叶子。
- 复盘中的阶段完成映射为花。
- 复盘中的成果、发布、收益、可复用语义映射为果实。
- 复盘中的拖延、未完成、中断、卡住映射为枯叶。
- 复盘中的失控、失败、错误、复发映射为落叶。
- 复盘、归因、总结、调整映射为土壤候选。
- 防复发、固定规则、模板、机制映射为根系养分候选说明。
- 页面显示“今日生命力检查”面板。
- 7 个维度均可选择 0-5 分并填写备注。
- 总分、生命力类型和季节反馈随输入变化。
- 顶部“今日树状态”随生命力类型变化。
- 树容器 tone 随 burning / numb / repairing / strong_growth 等状态明显变化。
- 点击树节点后，详情卡显示“今日生命力影响”和树对象说明。
- 当前生命力检查仅保存在前端 state，不刷新页面时可正常显示。
- Obsidian Graph 旧文件仍保留，未物理删除。

## 验收标准

- 没有删除 Obsidian Graph 文件。
- 没有安装依赖。
- 没有改数据库。
- 没有改 IPC 主链路。
- 没有引入 Three.js / R3F / Drei。
- 不破坏 `成长树`、`人生生长树`、`财富`、`时间负债`、`提醒`、`周回看` 入口。
