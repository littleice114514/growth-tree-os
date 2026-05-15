# 开发日志｜Codex｜Time Debt 快捷键稳定化｜2026-05-14

## 1. 本轮目标

修正 Time Debt 产品方向地图，并将全局快捷键默认值从 `CommandOrControl+Shift+Space` 改为更稳定的 `CommandOrControl+Alt+T`。

本轮不做 Settings 页面、不做快捷键自定义、不做完整 Time Debt 首页仪表盘、不做浮窗字段增强、不做结束计时补充框、不进入 D 线桌面悬浮球、不改 Wealth、不改数据库结构。

## 2. Skill 与工作流

- 已搜索本机已有 skill。
- 未命中专门覆盖 Electron `globalShortcut` 快捷键稳定化的 skill。
- 本轮采用基础工作流：工程最小改动 + 文档地图更新 + 真实 Electron smoke + GitHub Sync Gate。
- 候选沉淀项：`Electron globalShortcut 回归排查 SOP` 仍可作为候选，但本轮不生成正式 skill。

## 3. 产品方向修正

新增 `docs/project-map/TIME_DEBT_PRODUCT_MODE.md`，记录 Time Debt 后续方向：

- 今日时间使用仪表盘
- 明日时间布局
- 实际执行反馈
- 浮窗快速记录
- 分类 / 任务复用

Time Debt 后续同时支持：

- 反映模式：不提前规划，只记录当天真实时间使用。
- 布局模式：提前一天安排第二天时间，并对比计划与实际偏差。

未完成任务不应被简单视为失败，后续应进入迁移、放弃、拆小、计划过载或复盘流程。

## 4. 快捷键策略

不使用 `Command+X`：

- macOS 中 `Command+X` 是系统剪切快捷键。
- 输入框内会干扰正常文本编辑。
- 作为全局快捷键可能注册失败或造成误触。

从 `CommandOrControl+Shift+Space` 改为 `CommandOrControl+Alt+T`：

- `T` 对应 Time，含义更直观。
- `Cmd + Option + T` 比 `Cmd + Shift + Space` 更不容易与输入法、系统搜索或空间切换类快捷键冲突。
- Electron 仍保留 fallback：`CommandOrControl+Shift+L`，并与主快捷键同时注册，避免主快捷键被当前前台应用或系统菜单捕获时没有备用入口。

## 5. 代码改动

- `app/main/index.ts`
  - `preferredTimeDebtShortcut` 改为 `CommandOrControl+Alt+T`。
  - `fallbackTimeDebtShortcut` 保持 `CommandOrControl+Shift+L`。
  - 主快捷键和 fallback 同时注册，触发同一个 `openTimeDebtQuickFloat` 动作。
  - 注册成功日志仍为 `[time-debt] registered global shortcut: ${shortcut}`。

未修改：

- `app/preload/index.ts`
- `app/shared/contracts.ts`
- `app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`
- `app/renderer/src/features/wealth/**`
- `package.json`
- `pnpm-lock.yaml`
- `docs/project-state/**`

## 6. 验证结果

命令验证：

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 启动成功。
- 终端输出：`[time-debt] registered global shortcut: CommandOrControl+Alt+T`。
- 终端输出：`[time-debt] registered global shortcut: CommandOrControl+Shift+L`。

真实 Electron smoke：

- Wealth 页面可打开，未白屏。
- Time Debt 浮窗按钮可展开 `时间控制台`。
- Time Debt 浮窗 B 线 UI 仍可见：任务名称、最近任务、开始计时、收起。
- 使用 Computer Use、macOS System Events 和 CGEvent 自动发送 `Cmd + Option + T` / `Cmd + Shift + L` 时，未能触发展开浮窗。
- 自动化无法替代最终物理按键验收；Mac 端仍需手动按 `Cmd + Option + T` 与 `Cmd + Shift + L` 复核。

结论：

- 代码层面已完成主快捷键与 fallback 注册。
- Electron 启动和注册日志通过。
- 浮窗 UI 与 Wealth 页面未回归。
- 物理快捷键触发仍需 Mac 端手动确认；本轮不伪装为已通过。

## 7. 影响评估

- Time Debt：只改变全局快捷键默认值，保留现有 main -> preload -> renderer 唤起链路。
- Wealth：不修改 Wealth 代码；验收时仅做不白屏和快捷键不切页 smoke。
- Settings：本轮不进入 Settings Foundation 或快捷键设置 UI。

## 8. 下一轮建议

1. 浮窗字段增强：任务名、一级分类、页面分类同步、新建任务名。
2. 结束计时补充框：备注、AI 赋能占比、完成状态。
3. Time Debt 首页仪表盘：今日分类占比、今日总时长、当前计时、计划 vs 实际。
4. Settings Foundation 接入：快捷键、时间单位、货币、安全线等配置统一收口。
