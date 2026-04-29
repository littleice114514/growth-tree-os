# 开发日志｜Windows｜life-tree-3d-contracts｜2026-04-29

## 1. 本轮目标

在 M3D-0 文档基础上，把 Life Vitality Tree / 人生生长树的核心概念落成 TypeScript 类型契约、基础规则草案、mock 数据和 M3D-2 可复用的纯数据入口。

## 2. 当前分支

`feature/win-life-tree-3d-framework`

## 3. 开工前读取的协议文件

- `docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md`
- `docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md`
- `docs/dev-protocol/BRANCH_AND_FILE_BOUNDARY.md`
- `docs/dev-protocol/DEV_LOG_RULES.md`
- `docs/dev-protocol/PROJECT_HANDOFF_RULES.md`
- `docs/dev-protocol/FLEXIBLE_OWNERSHIP_RULES.md`

## 4. 当前设备角色判断

- 当前设备：Windows
- 本轮属于 Windows 默认负责范围：3D 前置数据契约、规则草案、mock 数据、文档日志。
- 未触碰 Mac UI 边界。

## 5. 是否补齐 M3D-0 文档

未补齐。开工前确认以下 M3D-0 文档均已存在：

- `docs/life-tree-3d/LIFE_TREE_3D_CONCEPT.md`
- `docs/life-tree-3d/LIFE_TREE_DATA_CONTRACT.md`
- `docs/life-tree-3d/LIFE_TREE_GROWTH_RULES.md`
- `docs/life-tree-3d/LIFE_TREE_TIMELINE.md`
- `docs/life-tree-3d/LIFE_TREE_RENDERER_STRATEGY.md`
- `docs/life-tree-3d/LIFE_TREE_WIN_MAC_PERFORMANCE.md`
- `docs/life-tree-3d/LIFE_TREE_ROADMAP.md`

## 6. 新增类型契约文件

- `app/renderer/src/features/life-tree-3d/contracts/treeSnapshot.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/growthEvent.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/growthRule.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/treeTimeline.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/renderer.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/qualityProfile.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/index.ts`

## 7. 新增规则文件

- `app/renderer/src/features/life-tree-3d/rules/defaultGrowthRules.ts`
- `app/renderer/src/features/life-tree-3d/rules/growthRuleNotes.ts`

## 8. 新增 mock 文件

- `app/renderer/src/features/life-tree-3d/mock/mockTreeSnapshot.ts`
- `app/renderer/src/features/life-tree-3d/mock/mockGrowthEvents.ts`

## 9. 修改文件

- `app/renderer/src/features/life-tree-3d/README.md`
- `app/renderer/src/features/life-tree-3d/contracts/treeSnapshot.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/growthEvent.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/growthRule.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/treeTimeline.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/renderer.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/qualityProfile.types.ts`
- `app/renderer/src/features/life-tree-3d/contracts/index.ts`
- `app/renderer/src/features/life-tree-3d/rules/defaultGrowthRules.ts`
- `app/renderer/src/features/life-tree-3d/rules/growthRuleNotes.ts`
- `app/renderer/src/features/life-tree-3d/mock/mockTreeSnapshot.ts`
- `app/renderer/src/features/life-tree-3d/mock/mockGrowthEvents.ts`
- `app/renderer/src/features/life-tree-3d/utils/clamp.ts`
- `app/renderer/src/features/life-tree-3d/utils/normalizeScore.ts`
- `docs/life-tree-3d/LIFE_TREE_ROADMAP.md`
- `docs/dev-log/2026-04/2026-04-29/win-life-tree-3d-contracts.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 10. 未安装 3D 依赖的原因

M3D-1 只做类型契约、规则草案和 mock 数据。真实 3D 渲染、Canvas、Three.js / React Three Fiber / Drei、模型加载和 WebGL 初始化都留到 M3D-3 之后，避免在数据契约稳定前引入渲染复杂度和跨设备性能风险。

## 11. 未修改区域

- 未修改主页面 UI。
- 未修改现有 `app/renderer/src/features/life-vitality-tree/**`。
- 未修改 `package.json` 或 lockfile。
- 未新增 glb / glTF / 图片贴图等大型资源。
- 未接真实数据库。

## 12. 验收命令

- `pnpm typecheck`
- `pnpm dev`
- `Invoke-WebRequest http://localhost:5173/`

## 13. 验收结果

- `pnpm typecheck`：通过。
- `pnpm dev`：已启动 Electron/Vite dev server。
- `http://localhost:5173/`：返回 HTTP 200。
- dev server 验收后已停止本轮启动的 Electron / Node 进程。
- 未发现 `package.json` / `pnpm-lock.yaml` 新增 `three`、`@react-three/fiber`、`@react-three/drei`。
- 未新增 glb / glTF / 图片贴图等大型资源。

## 14. 风险与遗留问题

- M3D-1 只提供静态规则和 mock 数据，尚未实现 `GrowthEvent[] + GrowthRule[]` 生成新 `TreeSnapshot` 的模拟器。
- `defaultGrowthRules` 的权重、衰减和上限仍是草案，M3D-2 需要通过样例 diff 调整。

## 15. 下一步 M3D-2 建议

实现无 3D 生长模拟器：输入 `mockTreeSnapshot`、`mockGrowthEvents`、`defaultGrowthRules`，输出新 `TreeSnapshot`、变化列表和每条变化对应的规则解释。
