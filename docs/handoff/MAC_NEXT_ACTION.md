# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：main
- 最新 commit：以本轮最终汇报和 Mac 端 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-04-27

## 2. 本轮已完成

- Life Vitality Tree / 人生生长树 已从 v0.1 纯 mock 推进到 v0.2 半真实数据映射。
- 新增 `lifeVitalityTreeMapper.ts`。
- Canvas 优先使用现有 `TreeSnapshot`、`recentReviews`、`weeklyReview` 映射出的 Life Tree 数据。
- Mapper 已补齐 unknown 安全读取，兼容常见时间字段命名。
- Review 可映射为 `leaf`；包含失控、拖延、失败等关键词时映射为 `fallen_leaf`。
- mock 数据继续保留，用于无 tree 数据 fallback。
- metrics 可反映主线数、行动/叶片数、阶段成果数和修复事项数。
- hover / click 详情卡可显示真实节点标题、路径、时间、状态映射和来源。
- 页面显示数据来源、节点数、叶子、果实、落叶和最近更新时间。
- 年轮视角可按近期复盘年份聚合 rings。
- 本轮不接数据库、不改 IPC、不改 SQLite、不安装 3D 依赖。

## 3. 本轮修改文件

- `app/renderer/src/features/life-vitality-tree/LifeVitalityTreeCanvas.tsx`
- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeTypes.ts`
- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMockData.ts`
- `app/renderer/src/features/life-vitality-tree/lifeVitalityTreeMapper.ts`
- `docs/LIFE_VITALITY_TREE.md`
- `docs/CURRENT_STATE.md`
- `docs/CURRENT_TASK.md`
- `docs/FILE_MAP.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：通过，renderer dev server 地址为 `http://localhost:5173/`。
- `git diff --name-only` 仅包含 Life Vitality Tree 模块和文档。
- 没有修改 `package.json` 或 `pnpm-lock.yaml`。
- 没有修改 `app/main/db.ts` 或 `app/main/ipc.ts`。
- 没有删除或移动 `app/renderer/src/features/obsidian-graph` 旧文件。

### 未验证 / 风险

- Life Vitality Tree v0.2 是 renderer 侧半真实映射，不是后端真实 schema。
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
- metrics 应反映当前成长树数据，不再只是纯 mock 数字。
- 数据来源摘要应显示节点数、叶子、果实、落叶和最近更新时间。
- 远景、结构、模块、细节、年轮 5 个视角按钮可切换。
- hover 树对象时出现摘要，能看到真实节点标题或映射对象。
- 点击树对象后右侧详情卡更新，并显示来源。
- 年轮视角能按近期复盘年份显示 rings；如果没有复盘则保留 fallback。
- `成长树`、`财富`、`时间负债`、`提醒`、`周回看` 仍能进入。
- `app/renderer/src/features/obsidian-graph` 目录仍存在。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

验证 Life Vitality Tree v0.2 在 macOS Electron 环境的半真实映射效果，并评估是否为 `lifeVitalityTreeMapper.ts` 增加单元测试或更明确的映射规则说明。不要直接接数据库，不要启动 3D。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- `人生生长树` 数据来源摘要截图
- 页面异常截图
- DevTools 控制台首个关键错误

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- `.env`、SQLite、本地 runtime、依赖和构建产物不要提交。
- Life Vitality Tree v0.2 是半真实 renderer 映射，不是最终视觉或后端真实数据方案。
