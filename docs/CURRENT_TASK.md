# CURRENT_TASK

## 本轮唯一目标

完成 Life Vitality Tree / 人生生长树 v0.4 生命力状态视觉反馈层，并继续保持 Windows / GitHub / MacBook 协同底座。

本轮在 v0.3 今日生命力检查输入层之上，把 DailyVitalityCheck 转换为 LifeTreeVisualState，让生命力类型联动树的视觉 tone、顶部状态摘要、风险 / 亮点提示和详情卡说明。

## 当前默认主线

当前默认主线 = Life Vitality Tree v0.4 生命力状态视觉反馈层 + 双设备 GitHub 协同优先。

优先关注：

1. 保留 v0.2 Life Tree mapper 和 mock fallback
2. 保留 v0.3 VitalityCheckPanel 和 DailyVitalityCheck
3. 新增 LifeTreeVisualState 类型与前端规则函数
4. Canvas 顶部显示“今日树状态”、风险和亮点
5. 树容器 tone 随生命力类型变化
6. 详情卡显示“今日生命力影响”
5. 不改 DB / IPC / 原始 TreeSnapshot 逻辑
6. GitHub main 分支可同步，MacBook 可 pull 验收

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

## 涉及文件

- Life Vitality Tree 主规划：`docs/LIFE_VITALITY_TREE.md`
- Life Vitality Tree Canvas：`app/renderer/src/features/life-vitality-tree/LifeVitalityTreeCanvas.tsx`
- Life Tree 类型：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeTypes.ts`
- Life Tree mock 数据：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMockData.ts`
- Life Tree mapper：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMapper.ts`
- Life Tree vitality 规则：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeVitality.ts`
- Life Tree vitality 面板：`app/renderer/src/features/life-vitality-tree/VitalityCheckPanel.tsx`
- Life Tree visual state 规则：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeVisualState.ts`
- 主页面入口：`app/renderer/src/pages/MainWorkspacePage.tsx`
- 导航入口：`app/renderer/src/components/Toolbar.tsx`
- 视图类型：`app/renderer/src/types/ui.ts`
- 状态记录：`docs/CURRENT_STATE.md`
- 当前任务：`docs/CURRENT_TASK.md`
- 暂停分支：`docs/PAUSED_BRANCHES.md`
- 文件地图：`docs/FILE_MAP.md`
- Mac 接力卡：`docs/handoff/MAC_NEXT_ACTION.md`

## 下一步唯一优先事项

下一轮优先让 MacBook 按 `docs/handoff/MAC_NEXT_ACTION.md` pull 最新 main，并验证 `人生生长树` 是否显示半真实映射数据，以及“今日生命力检查”是否能联动顶部树状态、视觉 tone 和详情卡生命力解释。

MacBook 验收完成后，再决定是否推进 v0.5 叶子 / 果实 / 落叶细分规则，或先补 DailyVitalityCheck / LifeTreeVisualState 单元测试。

## 2026-04-27 v0.4 验收口径

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm dev` 可启动。
- `人生生长树` 页面 metrics 反映现有 TreeSnapshot 的主线数、非 mainline 节点数、achievement 数和修复事项数。
- hover / click 详情卡能显示真实节点标题、所属路径、创建时间、更新时间、状态映射和来源。
- 最近复盘存在时，年轮视角按年份聚合 review rings。
- 无 tree 数据时仍回退 mock，不白屏。
- 数据来源摘要显示节点数、叶子、果实、落叶和最近更新时间。
- 页面显示“今日生命力检查”面板。
- 7 个维度均可选择 0-5 分并填写备注。
- 总分、生命力类型和季节反馈随输入变化。
- 顶部“今日树状态”随生命力类型变化。
- 树容器 tone 随 burning / numb / repairing / strong_growth 等状态明显变化。
- 点击树节点后，详情卡显示“今日生命力影响”。
- 当前生命力检查仅保存在前端 state，不刷新页面时可正常显示。
- Obsidian Graph 旧文件仍保留，未物理删除。

## 验收标准

- 没有删除 Obsidian Graph 文件。
- 没有安装依赖。
- 没有改数据库。
- 没有改 IPC 主链路。
- 没有引入 Three.js / R3F / Drei。
- 不破坏 `成长树`、`财富`、`时间负债`、`提醒`、`周回看` 入口。
