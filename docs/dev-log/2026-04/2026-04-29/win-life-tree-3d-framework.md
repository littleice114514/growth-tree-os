# 开发日志｜Windows｜life-tree-3d-framework｜2026-04-29

## 1. 本轮目标

完成 M3D-0｜Life Vitality Tree 3D 生长树框架设计底座。

本轮只做文档和工程预留：

- 定义人生数据如何驱动 3D 生长树；
- 定义树的部位与人生模块映射；
- 定义时间线、快照和生长规则；
- 定义从程序化低模树到写实模型的升级路径；
- 定义 Windows 独显开发与 Mac 无独显稳定运行的性能分层。
- 补齐严格验收项：12 个 eventType、4 个 rendererMode、5 个 tree age stage、模型路径预留、性能上限和 3D 非单点故障原则。

## 2. 开工前读取的协议文件

- `docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md`
- `docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md`
- `docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md`
- `docs/dev-protocol/DEV_LOG_RULES.md`
- `docs/dev-protocol/PROJECT_HANDOFF_RULES.md`
- `docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md`

## 3. 当前设备角色判断

- 当前设备角色：Windows。
- 判断依据：当前路径为 Windows 路径 `C:\Users\32042\Desktop\vibe coding项目\growth-tree-os`，任务明确为 Windows 侧 3D / 重资源 / 架构预研范围。

## 4. 当前任务边界判断

- 当前任务类型：3D / 重资源架构预研 + 文档 / 日志。
- 当前分支：`feature/win-life-tree-3d-framework`，符合 Windows feature 分支规则。
- 允许修改：`docs/life-tree-3d/**`、本 Windows dev-log、必要 handoff 文档。
- 禁止修改：`app/renderer/src/pages/**`、`app/renderer/src/features/**`、`package.json`、`pnpm-lock.yaml`、数据库、IPC、模型和贴图资源。
- 是否触碰 Mac UI 优化边界：否。
- 是否存在跨边界风险：当前无；M3D-4 进入交互层时需要重新拆分 Win / Mac 文件边界。

## 5. 当前分支

`feature/win-life-tree-3d-framework`

## 6. 修改文件

- `docs/life-tree-3d/LIFE_TREE_3D_CONCEPT.md`
- `docs/life-tree-3d/LIFE_TREE_DATA_CONTRACT.md`
- `docs/life-tree-3d/LIFE_TREE_GROWTH_RULES.md`
- `docs/life-tree-3d/LIFE_TREE_TIMELINE.md`
- `docs/life-tree-3d/LIFE_TREE_RENDERER_STRATEGY.md`
- `docs/life-tree-3d/LIFE_TREE_WIN_MAC_PERFORMANCE.md`
- `docs/life-tree-3d/LIFE_TREE_ROADMAP.md`
- `docs/dev-log/2026-04/2026-04-29/win-life-tree-3d-framework.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 7. 未修改区域

本轮未修改业务代码、UI 页面、依赖文件、数据库、IPC 或模型资源。

未触碰：

- `app/renderer/src/pages/**`
- `app/renderer/src/features/**`
- `package.json`
- `pnpm-lock.yaml`
- SQLite schema
- glb / glTF / 贴图 / Blender 资源

## 8. 未修改代码的原因

M3D-0 是框架设计阶段。当前关键问题是数据契约、规则层、快照层、渲染层和性能边界还需要先稳定。直接写 Three.js / R3F 会让视觉实现先于语义和数据模型，后续容易返工。

## 9. 当前框架结论

- Life Tree 3D 应以 `GrowthEvent + GrowthRule -> TreeSnapshot -> TreeTimeline -> Renderer` 为主链路。
- 更精确地说：`previous TreeSnapshot + GrowthEvents + GrowthRules = next TreeSnapshot`。
- 树的根系、主干、枝干、叶子、果实、裂痕、年轮和季节都应由快照状态驱动。
- 写实模型不是整棵不可拆的死模型，而是树干、枝干、叶子、果实、裂痕、根系等模块化资产。
- 当前只应做 procedural / mock 快照验证，不应引入模型资源。
- Windows 负责 high profile、重资源、3D 渲染和资产实验；Mac 负责 medium / low profile、UI 容器和轻量体验验收。
- 3D 不允许成为系统单点故障，WebGL 失败时必须能降级到 2D / 摘要状态。

## 10. 验收命令

已执行 / 计划执行：

- `git diff --name-only`
- `git diff -- package.json pnpm-lock.yaml`
- `Get-ChildItem docs/life-tree-3d`
- `Select-String` 检查 12 个 eventType、4 个 rendererMode、5 个 tree age stage、`public/models/life-tree`、`nodeId`、性能上限和“单点故障”
- `Get-ChildItem -Recurse -File | Where-Object { $_.Extension -in ".glb",".gltf",".fbx",".obj",".png",".jpg",".jpeg",".webp" }`
- `pnpm typecheck`

## 11. 验收结果

- `docs/life-tree-3d/` 已创建。
- 7 个 M3D-0 设计文档均已创建。
- `docs/handoff/MAC_NEXT_ACTION.md` 已更新。
- `git diff -- package.json pnpm-lock.yaml` 无输出，未修改依赖文件。
- 未发现新增 `.glb`、`.gltf`、`.fbx`、`.obj` 模型文件。
- `pnpm typecheck` 通过。
- 补齐后已执行内容验收：12 个 eventType、4 个 rendererMode、5 个 tree age stage、`public/models/life-tree`、`nodeId`、性能上限和“单点故障”描述均可检索。
- `git diff --name-only -- app/renderer/src/pages app/renderer/src/features` 无输出，未修改主页面和 feature UI 文件。
- 未运行 `pnpm dev`，本轮为文档补齐，已用 `pnpm typecheck` 做代码回归检查。

## 12. 是否触碰 Mac 边界

否。本轮只新增 Windows 侧 3D 框架文档和 Windows 独立任务日志，并更新 Mac 下一步操作卡。

## 13. 跨边界风险

当前无跨边界修改风险。

后续 M3D-4 进入 3D 页面交互层时，可能涉及 Mac 负责的 UI 容器、控制按钮和页面体验，需要提前拆分文件边界。

## 14. 下一步建议

下一阶段进入 M3D-1：提取最小 TypeScript 类型和 mock 规则草案，但仍不安装 3D 依赖、不接数据库、不替换现有 Life Vitality Tree 页面。
