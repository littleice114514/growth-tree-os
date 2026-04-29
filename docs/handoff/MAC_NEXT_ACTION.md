# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：feature/win-life-tree-3d-framework
- 最新 commit：以 Windows 端最终汇报和 Mac 端 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-04-29

## 2. 本轮已完成

- 新增 Life Vitality Tree 3D 框架设计目录 `docs/life-tree-3d/`。
- 完成 7 个 M3D-0 设计文档，覆盖概念、数据契约、生长规则、时间线、渲染策略、Win/Mac 性能和路线图。
- 已补齐严格验收项：12 个指定 eventType、4 个 rendererMode、5 个 tree age stage、`public/models/life-tree/low|medium|high` 路径预留、`nodeId` 绑定原则、low / medium / high 性能上限和 3D 非单点故障策略。
- 明确 3D 树应由 `GrowthEvent + GrowthRule -> TreeSnapshot -> TreeTimeline -> Renderer` 驱动。
- 更精确地说：`previous TreeSnapshot + GrowthEvents + GrowthRules = next TreeSnapshot`。
- 明确后期写实模型必须是模块化资产，不是整棵不可拆的死模型。
- 明确 Windows high profile 与 Mac medium / low profile 的性能分层。
- 本轮未安装 3D 依赖，未写 Three.js / R3F，未修改 UI 页面和数据库。

## 3. 本轮修改文件

- `docs/life-tree-3d/LIFE_TREE_3D_CONCEPT.md`
- `docs/life-tree-3d/LIFE_TREE_DATA_CONTRACT.md`
- `docs/life-tree-3d/LIFE_TREE_GROWTH_RULES.md`
- `docs/life-tree-3d/LIFE_TREE_TIMELINE.md`
- `docs/life-tree-3d/LIFE_TREE_RENDERER_STRATEGY.md`
- `docs/life-tree-3d/LIFE_TREE_WIN_MAC_PERFORMANCE.md`
- `docs/life-tree-3d/LIFE_TREE_ROADMAP.md`
- `docs/dev-log/2026-04/2026-04-29/win-life-tree-3d-framework.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- Windows 端将在提交前确认 `docs/life-tree-3d/` 存在。
- Windows 端将在提交前确认 7 个设计文档均存在。
- Windows 端将在提交前确认未修改 `package.json` / `pnpm-lock.yaml`。
- Windows 端将在提交前确认未新增模型文件。
- Windows 端将在提交前运行 `pnpm typecheck`。

### 未验证 / 风险

- Mac 端尚未 pull 验收。
- M3D-0 只完成框架设计，不包含 3D 实现。
- 下一阶段如果进入页面交互，需要重新确认 Mac / Windows 文件边界。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/win-life-tree-3d-framework
git rev-parse --short HEAD
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

确认输出的 commit 应与 Windows 端最终汇报一致。

## 6. Mac 端环境准备

```bash
pnpm install
pnpm typecheck
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- `docs/life-tree-3d/` 存在。
- 7 个 M3D-0 文档均存在。
- 文档中可检索到 12 个指定 eventType、4 个 rendererMode、5 个 tree age stage 和 `public/models/life-tree` 路径约定。
- `docs/dev-log/2026-04/2026-04-29/win-life-tree-3d-framework.md` 存在。
- `git diff origin/main -- package.json pnpm-lock.yaml` 没有 3D 依赖变更。
- 没有新增 `.glb`、`.gltf`、贴图或 Blender 模型文件。
- 现有应用可以通过 `pnpm dev` 启动。

预期结果：

- Mac 端能读取 3D 框架文档；
- 不需要启动 3D 页面；
- 不需要修改 UI 页面；
- 不需要安装 three / R3F / drei。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

只阅读并验收 `docs/life-tree-3d/` 的 M3D-0 文档完整性，确认没有触碰 Mac UI 文件。不要修改页面。若要继续推进，应先让 Windows 进入 M3D-1 类型与规则草案，或等待集成阶段从 `feature/win-life-tree-3d-framework` 合并。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git branch --show-current` 输出；
- `git rev-parse --short HEAD` 输出；
- `find docs/life-tree-3d -maxdepth 1 -type f | sort` 输出；
- `pnpm install`、`pnpm typecheck`、`pnpm dev` 的完整报错；
- 页面异常截图；
- 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖 Mac 本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有 3D 依赖、没有模型资源、没有数据库迁移。
