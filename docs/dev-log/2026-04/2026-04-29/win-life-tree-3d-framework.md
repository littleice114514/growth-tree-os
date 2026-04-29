# 开发日志｜Windows｜life-tree-3d-framework｜2026-04-29

## 1. 本轮目标

完成 M3D-0｜Life Vitality Tree 3D 生长树框架设计底座。

本轮只做文档和工程预留：

- 定义人生数据如何驱动 3D 生长树；
- 定义树的部位与人生模块映射；
- 定义时间线、快照和生长规则；
- 定义从程序化低模树到写实模型的升级路径；
- 定义 Windows 独显开发与 Mac 无独显稳定运行的性能分层。

## 2. 当前分支

`feature/win-life-tree-3d-framework`

## 3. 修改文件

- `docs/life-tree-3d/LIFE_TREE_3D_CONCEPT.md`
- `docs/life-tree-3d/LIFE_TREE_DATA_CONTRACT.md`
- `docs/life-tree-3d/LIFE_TREE_GROWTH_RULES.md`
- `docs/life-tree-3d/LIFE_TREE_TIMELINE.md`
- `docs/life-tree-3d/LIFE_TREE_RENDERER_STRATEGY.md`
- `docs/life-tree-3d/LIFE_TREE_WIN_MAC_PERFORMANCE.md`
- `docs/life-tree-3d/LIFE_TREE_ROADMAP.md`
- `docs/dev-log/2026-04/2026-04-29/win-life-tree-3d-framework.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 未修改区域

本轮未修改业务代码、UI 页面、依赖文件、数据库、IPC 或模型资源。

未触碰：

- `app/renderer/src/pages/**`
- `app/renderer/src/features/**`
- `package.json`
- `pnpm-lock.yaml`
- SQLite schema
- glb / glTF / 贴图 / Blender 资源

## 5. 未修改代码的原因

M3D-0 是框架设计阶段。当前关键问题是数据契约、规则层、快照层、渲染层和性能边界还需要先稳定。直接写 Three.js / R3F 会让视觉实现先于语义和数据模型，后续容易返工。

## 6. 当前框架结论

- Life Tree 3D 应以 `GrowthEvent + GrowthRule -> TreeSnapshot -> TreeTimeline -> Renderer` 为主链路。
- 树的根系、主干、枝干、叶子、果实、裂痕、年轮和季节都应由快照状态驱动。
- 写实模型不是整棵不可拆的死模型，而是树干、枝干、叶子、果实、裂痕、根系等模块化资产。
- 当前只应做 procedural / mock 快照验证，不应引入模型资源。
- Windows 负责 high profile、重资源、3D 渲染和资产实验；Mac 负责 medium / low profile、UI 容器和轻量体验验收。

## 7. 验收命令

计划执行：

- `git diff --name-only`
- `git diff -- package.json pnpm-lock.yaml`
- `Get-ChildItem docs/life-tree-3d`
- `Get-ChildItem -Recurse -File | Where-Object { $_.Extension -in ".glb",".gltf",".fbx",".obj",".png",".jpg",".jpeg",".webp" }`
- `pnpm typecheck`

## 8. 验收结果

- `docs/life-tree-3d/` 已创建。
- 7 个 M3D-0 设计文档均已创建。
- `docs/handoff/MAC_NEXT_ACTION.md` 已更新。
- `git diff -- package.json pnpm-lock.yaml` 无输出，未修改依赖文件。
- 未发现新增 `.glb`、`.gltf`、`.fbx`、`.obj` 模型文件。
- `pnpm typecheck` 通过。

## 9. 是否触碰 Mac 边界

否。本轮只新增 Windows 侧 3D 框架文档和 Windows 独立任务日志，并更新 Mac 下一步操作卡。

## 10. 跨边界风险

当前无跨边界修改风险。

后续 M3D-4 进入 3D 页面交互层时，可能涉及 Mac 负责的 UI 容器、控制按钮和页面体验，需要提前拆分文件边界。

## 11. 下一步建议

下一阶段进入 M3D-1：提取最小 TypeScript 类型和 mock 规则草案，但仍不安装 3D 依赖、不接数据库、不替换现有 Life Vitality Tree 页面。
