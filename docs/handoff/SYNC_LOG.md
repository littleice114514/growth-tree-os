# Sync Log｜Windows / MacBook / GitHub

## 记录规则

每次跨设备 push / pull 后追加一条记录。

## 日志格式

### YYYY-MM-DD｜同步记录

- 来源设备：
- 目标设备：
- 分支：
- commit：
- push 是否成功：
- pull 是否成功：
- 是否有冲突：
- 验收结果：
- 下一步：

### 2026-04-28｜Dashboard Preview V0.1 同步记录

- 来源设备：Windows
- 目标设备：GitHub / MacBook
- 分支：main
- commit：本轮最终 commit 以 `git rev-parse --short HEAD` 和最终汇报为准
- push 是否成功：待本轮提交后执行，结果以最终汇报为准
- pull 是否成功：MacBook 端待执行 `git fetch origin && git pull origin main`
- 是否有冲突：当前 Windows 工作区无冲突；仅有未跟踪本地运行残留 `codex-live-dev.pid`
- 验收结果：
  - `pnpm install`：通过。
  - `pnpm typecheck`：通过。
  - `pnpm build`：通过。
  - `pnpm dev`：renderer `http://localhost:5173/` 返回 HTTP 200。
- 下一步：
  - MacBook 拉取最新 main 后运行 `pnpm install`、`pnpm dev`，检查 Time Debt / Wealth / Life Dashboard Preview 和成长树入口。

### 2026-04-28｜AI Workflow Assets 同步记录

- 来源设备：Windows
- 目标设备：GitHub / MacBook
- 分支：main
- commit：本轮最终 commit 以 `git rev-parse --short HEAD` 和最终汇报为准
- push 是否成功：待本轮提交后执行，结果以最终汇报为准
- pull 是否成功：MacBook 端待执行 `git fetch origin && git pull origin main`
- 是否有冲突：
  - 执行前存在 `docs/handoff/DEVELOPMENT_LOG.md` rebase 冲突。
  - 已按“保留 Mac / Win 两段日志”策略解决，并完成 `git rebase --continue`。
- 验收结果：
  - `.ai-workflow/README.md` 已创建为跨设备 AI 工作流入口。
  - Win 端可复用 skills 已同步到 `.ai-workflow/skills/`。
  - `commands`、`docs`、`handoff` 索引已建立。
  - 已排除 `codex-live-dev.pid`、日志、缓存、构建产物和密钥文件。
- 下一步：
  - MacBook 拉取最新 main 后检查 `.ai-workflow/README.md`，并按需复制 `.ai-workflow/skills/*` 到 `$HOME/.codex/skills`。
