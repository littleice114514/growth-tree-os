# 开发日志｜Windows｜Life Tree 3D Procedural POC｜2026-04-30

## 1. 本轮目标

推进 M3D-3：用 `TreeSnapshot` 生成一棵低风险、可交互、可降级的程序化 3D 树。

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

Windows 本轮负责 3D 程序化渲染 POC、3D 依赖安装、预览入口、画质档位、WebGL fallback、文档和日志。

Mac 本轮不参与实现，后续只做 low / medium 档轻量验收和 M3D-4 交互体验反馈。

## 5. 跨边界修改声明

### 1. 跨边界原因

M3D-3 必须提供可进入的低风险 3D Preview，否则无法验收旋转、缩放、点击和画质档位。

### 2. 涉及文件

- `app/renderer/src/types/ui.ts`
- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/pages/MainWorkspacePage.tsx`

### 3. 冲突风险

风险较低。本轮只新增一个 `lifeTree3DPreview` view 和导航项，不替换默认首页，不删除旧页面。

### 4. 替代方案

可通过独立 preview 组件承载 3D 页面，避免重构现有 Life Vitality Tree UI。

### 5. 最小修改策略

只增加入口枚举、导航项和条件渲染，不调整既有 view 行为。

### 6. 回滚方式

移除新增 view、Toolbar 项和 MainWorkspacePage 条件渲染即可恢复入口前状态。

## 6. 修改文件

- `package.json`
- `pnpm-lock.yaml`
- `app/renderer/src/types/ui.ts`
- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `app/renderer/src/features/life-tree-3d/components/**`
- `app/renderer/src/features/life-tree-3d/renderers/**`
- `app/renderer/src/features/life-tree-3d/layout/**`
- `app/renderer/src/features/life-tree-3d/interaction/**`
- `app/renderer/src/features/life-tree-3d/performance/**`
- `app/renderer/src/features/life-tree-3d/demo/**`
- `app/renderer/src/features/life-tree-3d/README.md`
- `docs/life-tree-3d/LIFE_TREE_ROADMAP.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/dev-log/2026-04/2026-04-30/win-life-tree-3d-procedural-poc.md`

## 7. 新增 3D 依赖

- `three`
- `@react-three/fiber`
- `@react-three/drei`

`@react-three/fiber` 和 `@react-three/drei` 使用 React 18 兼容大版本，避免升级 React 扩大范围。

## 8. 3D 入口位置

顶部导航新增 `Life Tree 3D Preview`，对应 `WorkspaceView` 为 `lifeTree3DPreview`。

## 9. 画质档位策略

- 默认 `medium`。
- macOS 或低性能环境倾向 `low`。
- `high` 只能手动切换。
- low / medium / high 分别限制叶子、果实和动画预算。

## 10. 未做写实模型的原因

M3D-3 目标是验证 `TreeSnapshot -> ProceduralRenderer -> 可交互 3D 树` 的链路，不进入 Blender、glb / glTF、贴图或写实资产阶段。

## 11. 未修改区域

- 未新增 glb / glTF / 模型文件 / 贴图资源。
- 未修改数据库 schema。
- 未接真实数据库。
- 未把 3D Preview 设为默认首页。
- 未删除旧成长树页面。
- 未把 GrowthEvent / GrowthRule 判断写进 renderer。

## 12. 验收命令

- `pnpm install`
- `pnpm typecheck`
- `pnpm dev`

## 13. 验收结果

- `pnpm install` 已完成。
- `pnpm typecheck` 已通过。
- `pnpm dev` 已启动，renderer dev server 在 `http://localhost:5173/` 返回 HTTP 200。
- 浏览器验收已确认 `Life Tree 3D Preview` 可进入并显示基础 3D 树。
- 已确认点击 canvas 中树干可显示 `trunk-main` 调试详情。
- 已确认 ESC 可取消选中。
- 已确认 low / medium / high 可以切换，默认进入时为 medium。
- 已向 canvas 发送拖拽和滚轮事件，OrbitControls 接收正常。

## 14. 风险与遗留问题

- 当前为程序化 POC，不是最终视觉版。
- Mac low / medium 实机帧率和交互体验待 M3D-4 验收。
- WebGL fallback 已保留，但不同设备驱动异常仍需实机反馈。
- 在普通浏览器访问 Electron renderer 时仍会出现既有 preload/API 类 pageerror：`Cannot read properties of undefined (reading 'tree')`；本轮 3D Preview 渲染和交互未因此阻塞，Electron dev app 启动正常。

## 15. 下一步建议

M3D-4 进入 3D 交互层完善：hover 高亮、视角预设、节点定位、调试面板可读性、Mac low / medium 稳定性验收。
