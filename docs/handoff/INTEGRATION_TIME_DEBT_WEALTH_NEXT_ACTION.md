# Integration｜Time Debt + Wealth 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 集成分支：feature/integration-time-debt-wealth
- develop 创建来源：origin/main @ 4df9ada
- Time Debt 来源：origin/feature/mac-time-debt-plan-flow-overlap-ui @ 3a74cf0
- Time Debt merge commit：eb2cdef
- Wealth 来源：origin/feature/claude-wealth-baseconfig-persistence-latest @ edd4a1a
- Wealth merge commit：8cb384c
- 当前设备完成时间：2026-05-12

## 2. 本轮已完成

- 已创建并推送 `develop`，基于 `origin/main @ 4df9ada`。
- 已创建 `feature/integration-time-debt-wealth`。
- 已合入 Time Debt 分支，并完成文档冲突解决。
- 已合入 Wealth 分支，并完成共享文档冲突解决。
- 已确认 `package.json` 保留 `echarts` 与 `echarts-for-react`。
- 已完成命令验证和轻量 UI smoke。
- 已固化并行开发与集成开工门禁，覆盖 `AGENTS.md`、Codex 开工清单、双端工作流和交接规则。

## 3. 冲突与处理

本轮发生冲突。

Time Debt merge 冲突文件：

- `AGENTS.md`
- `docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md`
- `docs/dev-protocol/DEV_LOG_RULES.md`
- `docs/dev-protocol/DUAL_DEVICE_WORKFLOW.md`
- `docs/dev-protocol/PROJECT_HANDOFF_RULES.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/project-state/NEXT_ACTION.md`

Wealth merge 冲突文件：

- `AGENTS.md`
- `docs/project-map/MAP_STATUS.md`
- `docs/project-state/CURRENT_STATUS.md`
- `docs/project-state/LOG_INDEX.md`
- `docs/project-state/NEXT_ACTION.md`

处理策略：

- `AGENTS.md` 与 dev-protocol 以 Time Debt / integration 协同规则为主体，补回 main v4 的 Skill、GitHub Sync Gate、Mac 操作卡和安全门禁。
- `docs/handoff/MAC_NEXT_ACTION.md` 保留 Time Debt 接续卡。
- `docs/project-state/**` 与 `docs/project-map/MAP_STATUS.md` 手工合并为 integration 当前态，不直接采用单一分支版本。
- Wealth 业务文件和 ECharts 依赖全部保留。

## 4. 当前验证结果

### Time Debt 最新内容补入记录

- 原 integration commit：`4d09389`
- 本轮补入来源：`origin/feature/time-debt-usage-dashboard @ fe4b02e`
- 本轮 merge commit：`792458b`
- 是否发生冲突：否。
- 冲突处理：无冲突；自动合入 Time Debt 仪表盘相关文件和 Time Debt 模块索引。
- Wealth 回退检查：本轮合并未修改 `app/renderer/src/features/wealth/**`、`package.json` 或 `pnpm-lock.yaml`；`echarts` 与 `echarts-for-react` 依赖保留。
- 本轮复验结果：`pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm smoke` 均通过。
- Time Debt UI smoke：页面可打开，今日时间状态、已记录时间、主线推进、时间负债、空白 / 未归档、时间使用比例和分类明细均可见；日历页和 day / week / month 入口可见，详情面板存在，未见 `NaN` / `Invalid Date` 异常。
- Wealth UI smoke：页面可打开，现金流趋势 / 安全线可见，记录页搜索框、按日期 / 按类型 / 按分类分组、支出占比空态、新增财富记录弹窗和分类 chip 均可见。

### 已验证

- `pnpm install`：通过。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm smoke`：通过。
- `pnpm dev`：Electron / Vite 启动成功，仅出现 SQLite experimental warning。

### UI smoke

- Wealth 页面能打开。
- 财务生命体征 Hero 正常。
- ECharts 现金流图正常，支出柱 / 收入折线 / 安全线存在。
- 记录页能打开，搜索框存在，按日期 / 类型 / 分类分组存在。
- 支出类型占比饼图存在。
- 新增财富记录弹窗能打开，分类 chip 可用。
- 参数页能打开。
- Time Debt 页面能打开。
- 日历视图能打开，day / week / month 切换可用。
- 开始计时、补记时间、规划任务入口存在。
- 日志详情面板能打开。
- 短任务显示不异常。
- 顶部导航中成长树、人生总览、Wealth、Time Debt 可来回切换且不崩。

### 未验证 / 风险

- 未新增真实数据写入记录，避免污染本地数据。
- 跨天分段只读逻辑以现有日历详情面板不崩为轻量 smoke，未构造新的跨天样例。
- 本分支尚未合入 `develop`。
- Workflow hardening 本轮只验证 Markdown diff 与 Git 状态，不运行 `pnpm build`。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/integration-time-debt-wealth
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status --short
git fetch origin
git checkout feature/integration-time-debt-wealth
git pull origin feature/integration-time-debt-wealth
git rev-parse --short HEAD
```

确认输出的 commit 应为本轮最终 push 后的最新 commit。

## 6. Mac 端环境准备

```bash
pnpm install
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- Wealth：总览、现金流图、记录页、搜索框、分组、支出类型饼图、新增记录弹窗、分类 chip、参数页。
- Time Debt：执行台、日历 day/week/month、计时入口、日志详情、短任务显示。
- 导航：成长树、人生总览、Wealth、Time Debt 可来回切换。

预期结果：两个模块在同一 integration 分支中可同时运行，不退回单分支旧状态。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

先拉取 `feature/integration-time-debt-wealth`，确认 `AGENTS.md` 与 `docs/dev-protocol/CODEX_STARTUP_CHECKLIST.md` 中的 Parallel Development Startup Gate 生效；然后基于该分支做一次真实设备统一预览验收，并决定是否单独发起“合入 develop”任务。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status --short` 输出。
- `git rev-parse --short HEAD` 输出。
- `pnpm install`、`pnpm dev`、`pnpm typecheck`、`pnpm build` 或 `pnpm smoke` 的完整报错。
- 页面异常截图。
- 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 不要 push `main`。
- 不要把 integration 自动合回 `develop`。
- 如果 Mac 端已有本地修改，先运行 `git status --short`，不要直接 pull。
