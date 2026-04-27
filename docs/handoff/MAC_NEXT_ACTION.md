# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：main
- 最新 commit：以本轮最终汇报和 Mac 端 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-04-27

## 2. 本轮已完成

- 新增 Life Vitality Tree / 人生生长树主规划文档。
- 明确 Life Vitality Tree Canvas 是后续主视觉模块方向。
- 将 Obsidian Graph V1 记录为退出主线的历史实验分支。
- 建立树对象语义、四层视角、年轮视角、年龄阶段树形、保留池和 Life Tree Decision Gate。
- 补充数据库、网页端、多用户和隐私风险预留。
- 本轮只改文档，不改功能代码、数据库、IPC、Zustand 或依赖。

## 3. 本轮修改文件

- `docs/LIFE_VITALITY_TREE.md`
- `docs/CURRENT_STATE.md`
- `docs/CURRENT_TASK.md`
- `docs/PAUSED_BRANCHES.md`
- `docs/FILE_MAP.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `git diff --name-only` 只包含 `docs/` 下 Markdown 文件。
- 没有修改 `app/` 下 React / TypeScript 功能代码。
- 没有修改 `package.json` 或 `pnpm-lock.yaml`。
- 没有删除或移动 Obsidian Graph 文件。
- 没有改数据库、IPC、Zustand store。

### 未验证 / 风险

- 本轮为纯文档整理，默认未运行 `pnpm smoke`。
- Life Vitality Tree 仍处于产品定义阶段，尚未进入类型草案、Canvas 原型或 3D 开发。
- 树根、叶子状态、落叶入土、风系统、3D、网页端、多用户等仍在保留池，不是当前开发承诺。

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

本轮只检查文档，不需要安装新依赖。

如需打开项目继续开发：

```bash
pnpm install
pnpm dev
```

如需完整工程检查：

```bash
pnpm typecheck
pnpm build
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- `docs/LIFE_VITALITY_TREE.md` 是否存在。
- 文档是否明确 Life Vitality Tree / 人生生长树是新主视觉方向。
- 文档是否明确 Obsidian Graph V1 退出主线并归档。
- 文档是否包含树对象语义、四层视角、年轮视角、年龄阶段树形和畸形成长描述。
- 文档是否包含保留池和 Life Tree Decision Gate。
- 文档是否包含数据库、网页端、多用户和隐私风险预留。
- `docs/CURRENT_STATE.md`、`docs/CURRENT_TASK.md`、`docs/PAUSED_BRANCHES.md`、`docs/FILE_MAP.md` 是否有短摘要或指针。

预期结果：

- Mac 端能直接通过 `docs/LIFE_VITALITY_TREE.md` 理解主线、边界和暂不开发内容。
- Mac 端不需要重新阅读代码即可继续做下一轮类型草案或静态 Canvas 规划。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

在不改数据库、不改 IPC、不启动 3D 的前提下，基于 `docs/LIFE_VITALITY_TREE.md` 起草 Life Vitality Tree 的最小 TypeScript 类型方案或静态样例数据方案，并先输出计划，不直接替换现有成长树主图。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `docs/LIFE_VITALITY_TREE.md` 是否存在
- `git pull origin main` 的完整报错
- 如运行工程命令，则粘贴 `pnpm install`、`pnpm dev`、`pnpm typecheck` 或 `pnpm build` 的完整报错

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- `.env`、SQLite、本地 runtime、依赖和构建产物不要提交。
- Life Vitality Tree 当前是指导书和保留池，不是最终冻结方案。
