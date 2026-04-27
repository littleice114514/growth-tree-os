# CURRENT_TASK

## 本轮唯一目标

完成 Life Vitality Tree / 人生生长树 v0.2 半真实数据映射层，并继续保持 Windows / GitHub / MacBook 协同底座。

本轮做 renderer 侧 adapter / mapper：把现有 TreeSnapshot、recentReviews、weeklyReview 转换为 Life Vitality Tree 可识别的树对象。

## 当前默认主线

当前默认主线 = Life Vitality Tree v0.2 半真实数据映射 + 双设备 GitHub 协同优先。

优先关注：

1. 新增 Life Tree mapper
2. Canvas 优先使用半真实映射数据
3. 保留 mock fallback
4. 不改 DB / IPC / 原始 TreeSnapshot 逻辑
5. GitHub main 分支可同步，MacBook 可 pull 验收

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

## 涉及文件

- Life Vitality Tree 主规划：`docs/LIFE_VITALITY_TREE.md`
- Life Vitality Tree Canvas：`app/renderer/src/features/life-vitality-tree/LifeVitalityTreeCanvas.tsx`
- Life Tree 类型：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeTypes.ts`
- Life Tree mock 数据：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMockData.ts`
- Life Tree mapper：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMapper.ts`
- 主页面入口：`app/renderer/src/pages/MainWorkspacePage.tsx`
- 导航入口：`app/renderer/src/components/Toolbar.tsx`
- 视图类型：`app/renderer/src/types/ui.ts`
- 状态记录：`docs/CURRENT_STATE.md`
- 当前任务：`docs/CURRENT_TASK.md`
- 暂停分支：`docs/PAUSED_BRANCHES.md`
- 文件地图：`docs/FILE_MAP.md`
- Mac 接力卡：`docs/handoff/MAC_NEXT_ACTION.md`

## 下一步唯一优先事项

下一轮优先让 MacBook 按 `docs/handoff/MAC_NEXT_ACTION.md` pull 最新 main，并验证 `人生生长树` 是否显示现有成长树数据映射后的 metrics、节点标题、路径、状态和年轮聚合。

MacBook 验收完成后，再决定是否把 mapper 拆成更明确的单元测试或数据映射规则文档。

## 2026-04-27 v0.2 验收口径

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `人生生长树` 页面 metrics 反映现有 TreeSnapshot 的主线数、非 mainline 节点数、achievement 数和修复事项数。
- hover / click 详情卡能显示真实节点标题、所属路径、创建时间、更新时间、状态映射和来源。
- 最近复盘存在时，年轮视角按年份聚合 review rings。
- 无 tree 数据时仍回退 mock，不白屏。
- Obsidian Graph 旧文件仍保留，未物理删除。

## 验收标准

- 没有删除 Obsidian Graph 文件。
- 没有安装依赖。
- 没有改数据库。
- 没有改 IPC 主链路。
- 没有引入 Three.js / R3F / Drei。
- 不破坏 `成长树`、`财富`、`时间负债`、`提醒`、`周回看` 入口。
