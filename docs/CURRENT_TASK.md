# CURRENT_TASK

## 本轮唯一目标

完成 Life Vitality Tree / 人生生长树基础框架 v0.1，并继续保持 Windows / GitHub / MacBook 协同底座。

本轮做最小功能框架：主入口切换、静态类型、mock 数据、2.5D / SVG / HTML Canvas 占位组件和文档更新。

## 当前默认主线

当前默认主线 = Life Vitality Tree v0.1 静态 Canvas 框架 + 双设备 GitHub 协同优先。

优先关注：

1. 从主入口移除 Obsidian Graph V1
2. 新增 `人生生长树` 主入口
3. 建立 Life Tree 基础类型和 mock 数据
4. 建立静态 Life Vitality Tree Canvas 占位体验
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
- 不接真实 SQLite / IPC / TreeSnapshot。

## 涉及文件

- Life Vitality Tree 主规划：`docs/LIFE_VITALITY_TREE.md`
- Life Vitality Tree Canvas：`app/renderer/src/features/life-vitality-tree/LifeVitalityTreeCanvas.tsx`
- Life Tree 类型：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeTypes.ts`
- Life Tree mock 数据：`app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMockData.ts`
- 主页面入口：`app/renderer/src/pages/MainWorkspacePage.tsx`
- 导航入口：`app/renderer/src/components/Toolbar.tsx`
- 视图类型：`app/renderer/src/types/ui.ts`
- 状态记录：`docs/CURRENT_STATE.md`
- 当前任务：`docs/CURRENT_TASK.md`
- 暂停分支：`docs/PAUSED_BRANCHES.md`
- 文件地图：`docs/FILE_MAP.md`
- Mac 接力卡：`docs/handoff/MAC_NEXT_ACTION.md`

## 下一步唯一优先事项

下一轮优先让 MacBook 按 `docs/handoff/MAC_NEXT_ACTION.md` pull 最新 main，并验证 `人生生长树` 入口、5 个视角按钮、hover 摘要和点击详情卡。

MacBook 验收完成后，再决定是否把静态 mock 进一步拆成可测试的数据映射层。

## 2026-04-27 v0.1 验收口径

- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- 顶部导航不再显示 `图谱 V1`。
- 顶部导航显示 `人生生长树`。
- `人生生长树` 页面能显示 Life Vitality Tree Canvas。
- 远景、结构、模块、细节、年轮 5 个视角按钮可切换。
- hover 树对象可显示摘要，点击树对象可显示详情卡。
- Obsidian Graph 旧文件仍保留，未物理删除。

## 验收标准

- 没有删除 Obsidian Graph 文件。
- 没有安装依赖。
- 没有改数据库。
- 没有改 IPC 主链路。
- 没有引入 Three.js / R3F / Drei。
- 不破坏 `成长树`、`财富`、`时间负债`、`提醒`、`周回看` 入口。
