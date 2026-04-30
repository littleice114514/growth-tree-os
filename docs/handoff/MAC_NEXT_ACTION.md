# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/win-life-tree-3d-framework
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-30

## 2. 本轮已完成

- 新增 M3D-2 Life Tree 3D 无 3D 纯数据生长模拟器。
- 新增 `growth-engine/`，支持 GrowthEvent 批量应用、规则执行、生命力重算、枝干健康计算。
- 新增 `GrowthTransition` 与 `GrowthDeltaSummary`，后续 M3D-3 可读取变化结果做动画。
- 新增 `mockGrowthSimulationResult`，使用 M3D-1 mock 数据生成 `nextSnapshot`。
- 更新 README、roadmap、data contract 和 Windows dev-log。

## 3. 本轮修改文件

- `app/renderer/src/features/life-tree-3d/contracts/growthEngine.types.ts`
- `app/renderer/src/features/life-tree-3d/growth-engine/**`
- `app/renderer/src/features/life-tree-3d/mock/mockGrowthSimulationResult.ts`
- `app/renderer/src/features/life-tree-3d/README.md`
- `docs/life-tree-3d/LIFE_TREE_ROADMAP.md`
- `docs/life-tree-3d/LIFE_TREE_DATA_CONTRACT.md`
- `docs/dev-log/2026-04/2026-04-30/win-life-tree-3d-growth-engine.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 已通过。
- `pnpm dev` 已启动 Electron/Vite dev server。
- `http://localhost:5173/` 返回 HTTP 200。
- `package.json` 未新增 `three`、`@react-three/fiber`、`@react-three/drei`。
- `app`、`docs`、`public`、`resources` 范围内未新增 `.glb` / `.gltf` 资源。
- 未修改主页面 UI 文件。

### 未验证 / 风险

- M3D-2 不实现 3D renderer。
- M3D-2 不接真实数据库。
- 生命力和枝干健康公式是可替换版本。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/win-life-tree-3d-framework
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/win-life-tree-3d-framework
git pull origin feature/win-life-tree-3d-framework
git rev-parse --short HEAD
```

确认输出的 commit 应为本轮最终汇报中的 commit。

## 6. Mac 端环境准备

```bash
pnpm install
pnpm typecheck
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- `app/renderer/src/features/life-tree-3d/growth-engine/` 是否存在。
- `createNextTreeSnapshot.ts`、`applyGrowthEvents.ts`、`createGrowthTransition.ts` 是否存在。
- `mockGrowthSimulationResult.ts` 是否能静态导入模拟结果。
- `pnpm typecheck` 是否通过。
- `pnpm dev` 是否能启动现有应用。

预期结果：

- 不出现 Three.js / React Three Fiber / Drei 依赖。
- 不出现 glb / glTF / 图片贴图等大型资源。
- 主页面 UI 不应因为 M3D-2 数据模拟器而变化。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 只读验收 M3D-2 输出，确认 M3D-3 只能从 `TreeSnapshot` / `GrowthTransition` 读取数据；不要修改主页面 UI。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm typecheck` 完整报错；
- `pnpm dev` 完整报错；
- 页面异常截图；
- 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
