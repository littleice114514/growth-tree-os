# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：feature/claude-onboarding-check
- 最新 commit：以本轮最终汇报和 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-05-08

## 2. 本轮已完成

- 已创建 `docs/handoff/CLAUDE_ONBOARDING.md`，作为 Claude 后续接入项目的固定说明。
- 已更新 `docs/project-state/LOG_INDEX.md`，追加本轮日志索引。
- 已更新 `docs/handoff/MAC_NEXT_ACTION.md`，记录本轮交接信息。
- 本轮为文档补全验证任务，不修改任何业务代码。

## 3. 本轮修改文件

- `docs/handoff/CLAUDE_ONBOARDING.md`（新建）
- `docs/project-state/LOG_INDEX.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `git diff --stat` 仅包含文档文件，未修改业务代码。
- 分支 `feature/claude-onboarding-check` 已创建并 push。
- CLAUDE_ONBOARDING.md 包含：开工读取顺序、分支规则、协同规则、适合任务类型、首次接入提示词模板。

### 未验证 / 风险

- 无。本轮为纯文档任务，不涉及业务代码或构建。

## 5. Mac 端第一步操作

如果 Mac 上已经有项目：

```bash
cd ~/Developer/growth-tree-os
git status --short
git fetch origin
git checkout feature/claude-onboarding-check
git pull origin feature/claude-onboarding-check
git rev-parse --short HEAD
```

确认输出的 commit 应与本轮最终汇报一致。

## 6. Mac 端验收方式

请在 Mac 端检查：

- `git branch --show-current` 输出 `feature/claude-onboarding-check`。
- `git status --short` 没有输出。
- `docs/handoff/CLAUDE_ONBOARDING.md` 存在且内容完整。
- `git diff --stat` 未包含 `app/**`、`src/**`、`public/assets/**` 等业务文件。
- 可选：决定是否将本分支合并到 `main` 或直接关闭。

## 7. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

回到 `feature/m13-time-debt-timer-stability-p0` 分支，读取 `AGENTS.md`、`docs/project-state/CURRENT_STATUS.md`、`docs/project-state/NEXT_ACTION.md`、`docs/project-state/LOG_INDEX.md` 最近 5 条，然后执行：M13 P1｜Time Debt 跨天计时拆分。不要默认扫描完整 `docs/dev-log` 历史，不要修改 3D、Wealth、Tree 或 assets。

## 8. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status --short` 输出
- `git branch --show-current` 输出
- `git rev-parse --short HEAD` 输出
- pull、checkout 命令的完整报错

## 9. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status --short`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮是 Claude 接入验证任务，只做文档补全，不改业务代码。
- 下一轮应回到 M13 P1 业务分支继续 Time Debt 跨天拆分。
