# 2026-05-14｜Settings Foundation 设置中心底座

## 1. 本轮目标

- 在 integration 封存点之后进入 Settings Foundation。
- 建立统一设置入口、设置页面、设置分区与最小 localStorage 持久化。
- 不进入 Time Debt D 线，不改 Wealth 行情真实数据逻辑，不做完整主题 / 多语言 / 快捷键自定义。

## 2. 基线

- branch：`feature/integration-time-debt-wealth`
- 起始 HEAD：`3863d1a`
- 起始 remote HEAD：`origin/feature/integration-time-debt-wealth @ 3863d1a`
- 起始状态：clean
- integration 状态：Time Debt A/B/C 通过，Wealth 投资/行情通过。

## 3. 实施内容

- 新增 Settings 页面：`app/renderer/src/features/settings/SettingsPage.tsx`
- 新增设置类型：`app/renderer/src/features/settings/settingsTypes.ts`
- 新增设置存储：`app/renderer/src/features/settings/settingsStorage.ts`
- 主导航新增 `设置` 入口。
- 主工作台新增 Settings 渲染分支。
- localStorage key：`growth-tree-os:settings:v1`
- 支持保存、刷新保留、reset to defaults。
- localStorage 损坏时回退默认值，避免白屏。

## 4. 第一版分区

- 通用：默认打开模块、外观模式、语言。
- 快捷键：Time Debt 快速记录快捷键展示、fallback 展示、全局快捷键启用开关。
- 时间负债：最小记录单位、取整规则、浮窗默认状态。
- 财富：默认货币、安全线月数、行情 candle 来源说明。
- 数据与实验功能：模块显示管理、实验模块开关、数据导出 / 备份占位。

## 5. 明确未做

- 未重写 Electron `globalShortcut` 注册逻辑。
- 未做快捷键自定义。
- 未接入完整主题系统。
- 未接入全站多语言。
- 未新增汇率 API。
- 未修改 Time Debt 浮窗 A/B/C 业务逻辑。
- 未修改 Wealth 投资 / 行情业务逻辑。
- 未恢复实验模块。

## 6. 验证记录

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 启动成功。
- Electron 启动日志：`[time-debt] registered global shortcut: CommandOrControl+Shift+Space`。
- 真实 Electron smoke：
  - 主导航可见 `设置` 入口。
  - 点击 `设置` 后页面不白屏。
  - 页面可见 5 个分区：通用、快捷键、时间负债、财富、数据与实验功能。
  - 可修改默认打开模块、外观模式、Time Debt 最小记录单位。
  - 可见 Time Debt 快捷键：`CommandOrControl+Shift+Space` 与 fallback `CommandOrControl+Shift+L`。
  - Time Debt 浮窗仍挂载并与 Settings 页面同屏共存。
  - 实验模块未恢复到主导航。
- Settings storage smoke：
  - 保存后可重新读取 `defaultModule = wealth`、`appearance = dark`、`minimumRecordMinutes = 30`、`defaultCurrency = USD`、`safetyLineMonths = 12`。
  - localStorage 损坏 JSON 时回退默认值。
  - reset 后恢复 `defaultModule = time-debt`、`defaultCurrency = CNY`。
- Browser localhost 辅助检查：不作为本轮最终 UI 判据；该项目 renderer 直接在浏览器打开时缺少 Electron preload，会触发既有 `window.growthTree` 相关错误。真实 Electron App 无此问题。

## 7. 风险与后续

- 当前 Settings 配置多数只保存，不驱动业务行为。
- 下一步应先接入低风险项：默认打开模块、Time Debt 浮窗默认状态。
- 快捷键启用开关接入主进程前，需要设计 renderer 设置与 Electron main 之间的同步边界。
