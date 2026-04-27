# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：main
- 最新 commit：以本轮最终汇报和 Mac 端 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-04-27

## 2. 本轮已完成

- 新增 Life Vitality Tree / 人生生长树 v0.1 静态框架。
- 顶部导航新增 `人生生长树`。
- 顶部导航和页面切换中移除 `图谱 V1` 主入口。
- 保留 Obsidian Graph 旧代码，不删除、不移动。
- 新增 Life Tree 基础 TypeScript 类型和 mock 数据。
- 新增 2.5D / SVG / HTML 版 Life Vitality Tree Canvas 占位组件。
- 支持远景、结构、模块、细节和年轮视角。
- 支持 hover 摘要和点击详情卡。
- 本轮不接数据库、不改 IPC、不改 SQLite、不安装 3D 依赖。

## 3. 本轮修改文件

- `app/renderer/src/features/life-vitality-tree/LifeVitalityTreeCanvas.tsx`
- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeTypes.ts`
- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMockData.ts`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/types/ui.ts`
- `docs/LIFE_VITALITY_TREE.md`
- `docs/CURRENT_STATE.md`
- `docs/CURRENT_TASK.md`
- `docs/PAUSED_BRANCHES.md`
- `docs/FILE_MAP.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `git diff --name-only` 仅包含 Life Vitality Tree 新模块、入口切换文件和文档。
- 没有修改 `package.json` 或 `pnpm-lock.yaml`。
- 没有修改 `app/main/db.ts` 或 `app/main/ipc.ts`。
- 没有删除或移动 `app/renderer/src/features/obsidian-graph` 旧文件。

### 未验证 / 风险

- Life Vitality Tree v0.1 仍是静态 mock，不接真实复盘、节点、财富或时间负债数据。
- 本轮不是最终视觉方案，不做真实 3D。
- 年轮、落叶入土、根系字段、数据库映射仍在后续设计阶段。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Developer
cd ~/Developer
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout main
```

如果 Mac 上已经有项目：

```bash
cd ~/Developer/growth-tree-os
git status
git fetch origin
git checkout main
git pull origin main
git rev-parse --short HEAD
```

确认输出的 commit 应与 Windows 端最终汇报一致。

## 6. Mac 端环境准备

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 顶部导航不再显示 `图谱 V1`。
- 顶部导航显示 `人生生长树`。
- 点击 `人生生长树` 后显示 Life Vitality Tree Canvas。
- 远景、结构、模块、细节、年轮 5 个视角按钮可切换。
- hover 树对象时出现摘要。
- 点击树对象后右侧详情卡更新。
- `成长树`、`财富`、`时间负债`、`提醒`、`周回看` 仍能进入。
- `app/renderer/src/features/obsidian-graph` 目录仍存在。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

验证 Life Vitality Tree v0.1 在 macOS Electron 环境的页面操作闭环，并评估下一步是否把静态 mock 数据拆成可测试的数据映射层。不要直接接数据库，不要启动 3D。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- 页面异常截图
- DevTools 控制台首个关键错误

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- `.env`、SQLite、本地 runtime、依赖和构建产物不要提交。
- Life Vitality Tree v0.1 是静态框架，不是最终视觉或真实数据方案。
