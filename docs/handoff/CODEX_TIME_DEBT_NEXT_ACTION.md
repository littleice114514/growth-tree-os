# Codex Time Debt 下一步操作卡

## 0. 2026-05-17 任务名与一级分类统一底座

- 本轮目标：统一 Time Debt 正常记录与浮窗快速记录的任务名候选和一级分类来源，解决快速记录任务名不同步、需要重复输入的问题。
- Skill 选择：已搜索本机已有 skill；未命中专门覆盖本轮 Time Debt catalog 同步的现成 skill。真实 Electron UI smoke 使用 Computer Use 能力；GitHub 保存遵循本地 git 精确提交/推送流程。
- 工作流模板：工程代码修改 / 真实 Electron UI smoke / 文档交接 / GitHub Sync Gate / 双设备协同交接。
- 记录来源诊断：
  - 正常记录入口在 `TimeDebtDashboard.tsx` 的 `EntryModal`。
  - 正常记录已有 `title` 和 `primaryCategory` 字段。
  - 浮窗此前从 `loadTimeDebtLogs()` 自己组最近任务，分类常量在 `TimeDebtQuickRecordForm.tsx` 内部。
  - 两边结束写入均共用 `appendTimeDebtLog()` 和正常 Time Debt logs。
- 新增统一 helper：`app/renderer/src/features/time-debt/timeDebtTaskCatalog.ts`。
- 一级分类统一为：工作 / 学习 / 休息 / 生活 / 其他。
- 正常记录任务名候选和浮窗最近任务均改为复用 `getRecentTimeDebtTasks()`。
- 浮窗最近任务点击后已能同时回填任务名和一级分类。
- 浮窗开始计时会通过 `normalizeTimeDebtPrimaryCategory()` 保存一级分类；结束计时仍写入正常 Time Debt logs，不新建 quick-float logs。
- 本轮 smoke 测试记录：`统一任务库测试 / 学习`，记录保留。
- 验证结果：
  - `pnpm typecheck`：通过。
  - `pnpm build`：通过。
  - `pnpm dev`：真实 Electron App 启动成功，快捷键注册日志正常。
  - 真实 Electron UI smoke：通过，包含分类选项、开始计时、计时中显示、结束写入、最近任务回填、Time Debt 不白屏、Wealth 不白屏、`Cmd+Option+T` 展开浮窗。
- 本轮不做：ECharts、首页饼图、桌面浮窗、always-on-top、结束补充框、AI 赋能占比、Settings、Wealth、main/preload/ipc、package.json、project-state 三件套。
- 下一轮建议：在本轮 commit/push 后停止；下一轮若继续 Time Debt，可做结束计时补充框第一阶段，仍不要进入桌面浮窗或 Settings，除非用户明确要求。

## 0. 2026-05-15 浮窗一级分类第一阶段

- 本轮目标：补做 Time Debt 浮窗字段增强第一阶段，让右下角浮窗真实出现 `一级分类` 控件。
- Skill 选择：已按本机可用 skill 判断，未命中专门覆盖 Time Debt 浮窗字段增强的 skill；本轮采用“工程最小实现 + 真实 Electron UI smoke 硬门槛 + 文档交接 + GitHub Sync Gate”基础工作流。
- 工作流模板：工程代码修改 / UI 字段增强 / 真实 Electron smoke / 双设备协同交接。
- 起始 commit：`81f6076`。
- 实现范围：`TimeDebtQuickFloat`、`timeDebtQuickTimer`、`timeDebtStorage` 和对应 Time Debt 文档。
- 空闲态浮窗必须显示：任务名称、一级分类、最近任务、开始计时。
- 一级分类固定选项：工作 / 学习 / 休息 / 生活 / 其他。
- 默认一级分类：学习。
- 计时中卡片必须显示任务名、分类、开始时间、已用时、结束计时。
- 最近任务点击后必须回填任务名和一级分类；老记录缺分类时 fallback 为 `其他`。
- 验收硬门槛结果：真实 Electron UI smoke 已看到 `一级分类`，并完成 `浮窗分类测试 / 学习` 的开始、刷新恢复、结束写入、最近任务回填和 Wealth 不白屏检查。
- 本轮不做 Settings、不做 Time Debt 首页仪表盘、不做结束计时补充框、不做 AI 赋能占比、不做 D 线桌面悬浮球、不改 Wealth。

## 0. 2026-05-15 快捷键稳定化与产品地图更新

- 本轮目标：先修正 Time Debt 产品地图，并把全局快捷键默认值从更易冲突的 `CommandOrControl+Shift+Space` 稳定到 `CommandOrControl+Alt+T`。
- Skill 选择：已搜索本机已有 skill，未命中专门覆盖 Electron `globalShortcut` 回归排查的 skill；本轮采用“工程最小改动 + 文档地图更新 + 真实 Electron smoke + GitHub Sync Gate”基础工作流。
- 工作流模板：integration / Time Debt 产品地图修正 / 快捷键稳定化 / 双设备协同交接。
- 当前分支：`feature/integration-time-debt-wealth`。
- 起始 commit：`e3c96d0`。
- 新增产品地图：`docs/project-map/TIME_DEBT_PRODUCT_MODE.md`。
- Time Debt 新方向：今日时间使用仪表盘 + 明日时间布局 + 实际执行反馈 + 浮窗快速记录 + 分类 / 任务复用。
- 两种模式：反映模式、布局模式。
- 新主快捷键：`CommandOrControl+Alt+T`。
- macOS 显示：`Cmd + Option + T`。
- fallback：`CommandOrControl+Shift+L`，与主快捷键同时注册，作为真实备用入口。
- 不使用 `Command+X`，因为它是 macOS 系统剪切快捷键，会干扰输入框编辑行为。
- 不再默认使用 `CommandOrControl+Shift+Space`，因为它可能与输入法、系统搜索或空间切换类快捷键冲突。
- 验证结果：`pnpm typecheck`、`pnpm build` 通过；`pnpm dev` 注册主快捷键和 fallback 成功。
- 验证风险：Computer Use、macOS System Events 和 CGEvent 自动发送快捷键时未能展开浮窗，Mac 端需要手动物理按键复核。
- 本轮不做 Settings 页面、不做快捷键自定义、不做完整 Time Debt 首页仪表盘、不做浮窗字段增强、不做结束计时补充框、不做 D 线桌面悬浮球、不改 Wealth、不改数据库结构。
- 下一轮建议：先做浮窗字段增强，再做结束计时补充框，再做 Time Debt 首页仪表盘，最后再把配置收进 Settings。

## 0. 2026-05-14 快捷键回归排查更新

- 本轮目标：排查 Time Debt C 线全局快捷键是否仍可用，只做诊断和必要的最小修复。
- Skill 选择：已搜索本机已有 skill，未命中专门覆盖 Electron 全局快捷键回归排查的 skill；本轮采用“工程回归诊断 + 真实 Electron smoke + 文档交接 + GitHub Sync Gate”基础工作流。
- 工作流模板：工程回归诊断 / 文档交接 / 双设备协同交接。
- 当前分支：`feature/integration-time-debt-wealth`。
- 起始 commit：`9d89025`。
- C 线代码仍存在：main `globalShortcut`、preload `onOpenQuickFloat`、contracts 类型声明、renderer 监听与 `MainWorkspacePage` 挂载均仍在。
- 当时实际主快捷键：`CommandOrControl+Shift+Space`。
- fallback：`CommandOrControl+Shift+L`。
- IPC channel：`time-debt:open-quick-float`。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 可启动，并输出 `[time-debt] registered global shortcut: CommandOrControl+Shift+Space`。
- 真实 Electron smoke：App 聚焦时 `Cmd+Shift+Space` 可展开 `时间控制台` 并显示 `已通过快捷键打开`。
- 真实 Electron smoke：App 不聚焦时先切到 Finder，再触发 `Cmd+Shift+Space`，Electron App 可被重新聚焦并展开 Time Debt 浮窗。
- Wealth 页面：快捷键触发后仍停留 Wealth 页面，未白屏。
- fallback：主快捷键已注册并生效，本轮未触发 fallback。
- 是否修改默认快捷键：否。
- 是否修改 Wealth：否。
- 候选沉淀项：`Electron globalShortcut 回归排查 SOP`，本轮只记录为候选，不生成正式 skill。
- 下一步建议：不要进入 D 线或 Settings 页面；等待 Wealth/行情线程收口后做 integration 验收。

## 1. 当前任务

- 项目：growth-tree-os
- 分支：feature/integration-time-debt-wealth
- 模块：Time Debt / 快速记录浮窗
- 当前路线：C 线全局快捷键 / 系统级唤起回归排查
- 当前状态：A 线已封存；B 线已封存；C 线已完成并通过真实 Electron UI smoke 与 2026-05-14 回归排查，可继续封存；D 线暂不开始

## 2. 本轮完成

- A 线：App 右下角 `记录` 浮窗入口已完成，真实 Electron UI smoke 已通过。
- B 线：浮窗增强为 App 内小控制台。
- 收起态无计时时显示 `记录`，计时中显示 `计时中 · HH:MM:SS`。
- 展开态显示时间控制台、当前状态、任务名称输入、开始计时、收起按钮。
- 计时中显示当前计时卡片：任务名、开始时间、已用时和结束计时。
- 结束计时后显示最近一次记录反馈，例如 `已记录：xxx · N 分钟`。
- 从已有 Time Debt logs 提取最多 3 个最近任务名，支持快捷填入。
- 继续复用现有 Time Debt active timer localStorage，不新建第二套长期记录系统。
- 结束计时后仍写入现有 Time Debt logs，Time Debt 页面可通过 logs 变更事件刷新。
- C 线：Electron main 进程注册 Time Debt 全局快捷键。
- C 线：首选快捷键已更新为 `CommandOrControl+Alt+T`，fallback `CommandOrControl+Shift+L` 与主快捷键同时注册。
- C 线：快捷键触发后聚焦/显示主窗口，并发送 `time-debt:open-quick-float` 给 renderer。
- C 线：preload 暴露 `window.growthTree.timeDebt.onOpenQuickFloat(callback)` 安全订阅接口，不暴露任意 `ipcRenderer`。
- C 线：renderer 收到事件后展开既有 B 线 `时间控制台` 浮窗，并显示轻提示 `已通过快捷键打开`。
- C 线：不强制切换页面；在 Wealth 页面触发后仍停留 Wealth，只展开右下角 Time Debt 浮窗。
- C 线复验：`5cb88bd` 已通过真实 Electron UI smoke，实际快捷键为 `CommandOrControl+Shift+Space`，fallback 未触发。
- C 线复验：使用 `浮窗C线复验测试` 创建真实测试记录，记录已保留。

## 3. 修改文件

- `app/main/index.ts`
- `app/preload/index.ts`
- `app/shared/contracts.ts`
- `app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-c-hotkey.md`
- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-c-smoke.md`
- `docs/dev-log/2026-05/2026-05-14/codex-time-debt-floating-window-b-console.md`

## 4. 验证

必须验证：

```bash
pnpm typecheck
pnpm build
```

手动 smoke：

- 打开 App，右下角看到 `记录`。
- 点击后展开 `时间控制台`。
- 空任务名点击开始会提示。
- 输入 `浮窗B线控制台测试` 后可以开始计时。
- 收起后按钮显示 `计时中 · HH:MM:SS`。
- 展开后当前计时卡片显示任务名、开始时间和已用时。
- 切换到 Wealth 后计时状态不丢失。
- 切回 Time Debt 后计时状态仍在。
- 刷新后未结束计时可恢复。
- 点击结束计时后 Time Debt 能看到新记录。
- 结束后面板底部显示最近一次记录反馈。
- 有历史 logs 时，最近任务快捷项最多显示 3 个，点击可填入任务名称。
- Wealth 不白屏。
- C 线真实 Electron UI smoke：
  - App 正常启动，终端无 `globalShortcut` 注册崩溃。
  - 在非展开浮窗状态按实际注册快捷键，App 被聚焦，右下角浮窗展开为 `时间控制台`。
  - 在 Wealth 页面按快捷键后不切页，Wealth 不白屏，Time Debt 浮窗展开。
  - 计时中收起浮窗后按快捷键，计时状态仍存在且继续递增。
  - 使用 `浮窗C线快捷键测试` 结束计时后，Time Debt 日志出现记录且不重复。
  - 退出并重启 App 后快捷键仍可注册。

## 5. 下一轮唯一任务

C 线已完成并通过真实 Electron UI smoke 复验，可封存。

当前不要进入 D 线，除非用户明确要求桌面级悬浮球。下一轮唯一建议：等待 Wealth/行情线程收口后做 integration 验收，不改 project-state 三件套，不 push 未确认的并行现场。

## 6. A 线 Smoke 结果｜2026-05-13

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：可启动。
- 右下角 `记录` 按钮：通过。
- `快速记录时间` 展开面板：通过。
- 空任务名提示 `先写一下这次在做什么`：通过。
- `浮窗A线smoke测试` 开始计时：通过。
- 切换 Wealth 不丢计时且 Wealth 不白屏：通过。
- 切回 Time Debt 后计时仍在：通过。
- 计时中刷新后恢复，开始时间未重置：通过。
- 结束计时后写入 Time Debt：通过。
- 日历出现 `浮窗A线smoke测试 / 1 min / 已完成`：通过。
- 测试记录：已保留，未删除。
- Wealth 并行未提交文件：本轮未修改、未回退、未提交。

## 7. B 线实现记录｜2026-05-14

- 基线：本机 `feature/integration-time-debt-wealth @ d05f24c`。
- 远程同名分支仍停在 `75911c0`，本轮不 pull，不覆盖 Wealth/行情现场。
- 检测到 Wealth/行情未提交改动和 `app/main/env.ts`，本轮未修改、未回退、未提交。
- 新增浮窗 UI 状态 key：`growth-tree-os:time-debt-floating-ui:v1`。
- 核心计时仍复用：`growth-tree-os:time-debt:active-timer`。
- 下一步必须先 smoke B 线，确认小控制台稳定后再讨论后续路线。
