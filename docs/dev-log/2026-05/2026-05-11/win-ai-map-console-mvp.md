# 2026-05-11｜Windows｜AI Map Console MVP

## 1. 本轮任务

搭建只读型 AI 活点地图总控台 MVP，用于读取 project-state 底座并生成 Codex / Claude 短任务卡。

## 2. Skill 选择

- 已搜索并沿用本机已有 `repo-map` skill，用于确认仓库入口、工具目录边界和业务代码隔离。
- 本轮不新增正式 skill。
- 候选沉淀项：如果 map-console 连续多轮稳定复用，可沉淀为项目级 SOP 或正式 skill。

## 3. 工作流模板

- 工具基础设施搭建
- 文档 / handoff 补全
- GitHub Sync Gate
- 双设备协同交接

## 4. 修改范围

- 新增 `tools/ai-map-console/**`
- 新增 `docs/handoff/WIN_AI_MAP_CONSOLE_NEXT_ACTION.md`
- 新增本日志

## 5. 核心实现

- `status` 输出当前分支、commit、工作区状态、已读取文件、缺失文件、地图位置、项目主线、下一步入口和风险提示。
- `task-card` 支持 `--agent codex --module time-debt` 和 `--agent claude --module wealth`。
- LOG_INDEX 只读取尾部片段，不扫描完整 dev-log。
- 缺失 `AGENTS.md`、`MAP_STATUS.md` 或业务 handoff 时正常输出“缺失”。

## 6. 验收方式

已运行：

```bash
node tools/ai-map-console/src/index.js status
node tools/ai-map-console/src/index.js task-card --agent codex --module time-debt
node tools/ai-map-console/src/index.js task-card --agent claude --module wealth
git status --short
git diff --stat
pnpm typecheck
pnpm build
```

验收结果：

- 三条 map-console 命令均正常输出中文内容。
- 缺失 `AGENTS.md`、`MAP_STATUS.md`、Time Debt / Wealth handoff 时未崩溃。
- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- 当前改动范围只包含 `tools/ai-map-console/**`、Win/Mac handoff 和本轮 Win dev-log。

## 7. 遗留问题

- `AGENTS.md` 当前缺失。
- `docs/project-map/MAP_STATUS.md` 当前缺失。
- Time Debt / Wealth 专用 handoff 当前缺失。

## 8. 下一步

下一轮先运行三条 map-console 命令确认输出稳定，再决定是否建立 `MAP_STATUS.md` 或将 map-console 接入正式开工 SOP。
