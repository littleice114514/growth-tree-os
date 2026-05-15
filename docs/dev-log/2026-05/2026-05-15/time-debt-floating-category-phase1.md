# 开发日志｜Codex｜Time Debt 浮窗一级分类第一阶段｜2026-05-15

## 1. 本轮目标

补做 Time Debt 浮窗字段增强第一阶段：右下角 Time Debt 浮窗必须真实出现 `一级分类` 控件，并能把分类写入 active timer 和 Time Debt logs。

本轮不做 Settings、不做 Time Debt 首页仪表盘、不做结束计时补充框、不做 AI 赋能占比、不做 D 线桌面悬浮球、不改 Wealth。

## 2. Skill 与工作流

- 已按本机可用 skill 判断。
- 未命中专门覆盖 Time Debt 浮窗字段增强的 skill。
- 本轮采用基础工作流：工程最小实现 + 真实 Electron UI smoke 硬门槛 + 文档交接 + GitHub Sync Gate。
- 候选沉淀项：`Electron UI smoke 硬门槛 SOP`，本轮先记录为候选，不生成正式 skill。

## 3. 代码改动

- `TimeDebtQuickFloat.tsx`
  - 新增 `一级分类` select。
  - 固定选项：工作 / 学习 / 休息 / 生活 / 其他。
  - 默认值：学习。
  - 开始计时时传入分类。
  - 计时中卡片显示 `分类：...`。
  - 最近任务点击时回填任务名和一级分类。

- `timeDebtQuickTimer.ts`
  - `startQuickTimeDebtTimer(title, primaryCategory)` 接收一级分类。
  - 创建 active timer 时写入 `primaryCategory`。
  - 结束计时时继续写入 Time Debt log。

- `timeDebtStorage.ts`
  - 老日志缺少 `primaryCategory` 时 fallback 为 `其他`。
  - 老日志缺少 `secondaryProject` 时 fallback 为 `未归属项目`。

## 4. 验证硬门槛

已完成：

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 启动成功。
- 真实 Electron App 中展开右下角 Time Debt 浮窗：通过。
- 页面上看到 `一级分类`：通过。
- 选项包含工作 / 学习 / 休息 / 生活 / 其他：通过。
- 使用 `浮窗分类测试` + `学习` 开始计时：通过。
- 计时中卡片显示 `正在记录：浮窗分类测试` 和 `分类：学习`：通过。
- 收起浮窗后计时状态不丢：通过。
- 刷新后 active timer 恢复，分类仍为 `学习`：通过。
- 结束计时后 Time Debt logs 写入成功，记录反馈显示 `已记录：浮窗分类测试 · 1 分钟`：通过。
- 最近任务出现 `浮窗分类测试`，Help 显示 `浮窗分类测试 / 学习`：通过。
- 再次点击最近任务后回填任务名和分类 `学习`：通过。
- Wealth 页面可打开，现金流趋势可见，未白屏：通过。

如果真实 UI 中没有看到 `一级分类`，不允许 commit / push。
