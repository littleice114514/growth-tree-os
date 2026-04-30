# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/win-life-tree-3d-framework
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-30

## 2. 本轮已完成

- 新增 M3D-3 Life Tree 程序化 3D POC。
- 安装 `three`、`@react-three/fiber`、`@react-three/drei`，并固定到 React 18 兼容版本。
- 新增 `LifeTree3DPreview` 入口，可从 mock `TreeSnapshot` 渲染基础 3D 树。
- 支持 OrbitControls 旋转 / 缩放、点击枝干 / 叶子 / 果实显示调试详情、ESC 取消选中。
- 支持 low / medium / high 画质档位，默认不使用 high。
- 保留 WebGL fallback，不让 3D 预览成为系统单点故障。

## 3. 本轮修改文件

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
- `docs/dev-log/2026-04/2026-04-30/win-life-tree-3d-procedural-poc.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm install` 已完成。
- `pnpm typecheck` 已通过。
- 依赖只新增 `three`、`@react-three/fiber`、`@react-three/drei`。
- 3D Preview 没有设为默认首页。
- 未新增 glb / glTF / 模型文件 / 贴图资源。
- Renderer 只读取 `TreeSnapshot`，不读取 `GrowthEvent` / `GrowthRule`。

### 未验证 / 风险

- Mac 端 low / medium 实机帧率尚未验收。
- 当前是程序化 POC，不是最终视觉版。
- 写实模型、Blender、glb / glTF 和贴图资源仍未进入本阶段。

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

- 顶部导航是否出现 `Life Tree 3D Preview`。
- 进入后是否能看到基础 3D 树。
- 鼠标拖拽是否能旋转，滚轮是否能缩放。
- 点击枝干 / 叶子 / 果实是否显示 nodeId 调试详情。
- ESC 是否能取消选中。
- low / medium / high 是否可切换，默认是否不是 high。

预期结果：

- Mac 可优先使用 low 或 medium。
- 不出现 glb / glTF / 图片贴图等大型资源。
- 不接真实数据库。
- 原有 2D 页面仍可访问。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 做 M3D-4 交互层验收与体验完善：hover 高亮、视角预设、节点定位、调试面板可读性和 low / medium 稳定性反馈。不要进入写实模型或资源导入。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install` / `pnpm typecheck` / `pnpm dev` 完整报错；
- 页面异常截图；
- 控制台首个关键错误；
- 当前选择的 quality profile。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
