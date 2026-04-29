# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/win-life-tree-3d-framework
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-29

## 2. 本轮已完成

- 新增 M3D-1 Life Tree 3D TypeScript contracts。
- 新增 `defaultGrowthRules` 静态规则草案。
- 新增 `mockTreeSnapshot` 与 `mockGrowthEvents`，为 M3D-2 无 3D 生长模拟器准备输入。
- 更新 M3D roadmap，明确下一步进入 M3D-2。

## 3. 本轮修改文件

- `app/renderer/src/features/life-tree-3d/**`
- `docs/life-tree-3d/LIFE_TREE_ROADMAP.md`
- `docs/dev-log/2026-04/2026-04-29/win-life-tree-3d-contracts.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 已通过。
- `pnpm dev` 已启动 Electron/Vite dev server。
- `http://localhost:5173/` 返回 HTTP 200。
- 未新增 `three`、`@react-three/fiber`、`@react-three/drei`。
- 未新增 glb / glTF / 图片贴图等大型资源。

### 未验证 / 风险

- M3D-1 不实现 3D renderer。
- M3D-2 仍需实现纯数据生长模拟器。

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

- `app/renderer/src/features/life-tree-3d/` 是否存在。
- `contracts/index.ts` 是否能统一导出类型。
- `pnpm typecheck` 是否通过。
- `pnpm dev` 是否能启动现有应用。

预期结果：

- 不出现 Three.js / React Three Fiber / Drei 依赖。
- 不出现 glb / glTF / 图片贴图等大型资源。
- 主页面 UI 不应因为 M3D-1 类型契约而变化。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 只读验收 M3D-1 输出，确认类型命名和 README 是否足够让 M3D-2 接续；不要修改主页面 UI。

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
