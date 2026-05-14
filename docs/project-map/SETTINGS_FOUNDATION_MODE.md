# Settings Foundation｜设置中心底座

## 1. 当前定位

- 阶段：Settings Foundation。
- 目标：为 App 提供统一设置入口、设置页面、设置分区与最小本地持久化配置。
- 基线：Time Debt 浮窗 A/B/C 与 Wealth 投资/行情 integration 已通过。
- 本轮不接入完整主题系统、多语言系统、快捷键自定义注册、汇率 API 或业务数据库。

## 2. 页面入口

- 入口位置：主工作台顶部模块导航。
- 新增模块：`设置`。
- 当前保留模块：Time Debt、Wealth、Review、Reminders、Daily Review、Settings。
- 实验模块继续隐藏：SystemX、AI Map、3D、Tree、Nodes、Graph。

## 3. 第一版分区

### 通用

- 默认打开模块：可保存。
- 外观模式：`system` / `light` / `dark`，可保存。
- 语言：`zh-CN` / `en-US`，可保存。
- 说明：第一版只保存配置，不做全站主题或翻译联动。

### 快捷键

- Time Debt 快速记录快捷键：展示 `CommandOrControl+Shift+Space`。
- fallback：展示 `CommandOrControl+Shift+L`。
- 是否启用全局快捷键：可保存。
- 说明：第一版不重写 Electron `globalShortcut` 注册逻辑，不做快捷键自定义。

### 时间负债

- 最小记录单位：`5` / `15` / `30` 分钟，可保存。
- 取整规则：`none` / `ceil-to-minimum` / `nearest`，可保存。
- 浮窗默认状态：`collapsed` / `expanded`，可保存。
- 说明：第一版不强制接入 Time Debt 计时、记录或浮窗业务逻辑。

### 财富

- 默认货币：`CNY` / `USD` / `HKD`，可保存。
- 安全线月数：`3` / `6` / `12`，可保存。
- 行情 candle 来源说明：展示 Yahoo Live / Mock / Finnhub Quote 说明。
- 说明：第一版不改 Wealth 行情真实数据逻辑，不新增行情 API。

### 数据与实验功能

- 模块显示管理：占位展示。
- 实验模块开关：配置可保存。
- 数据导出 / 备份：占位展示。
- 说明：第一版不恢复实验模块，不实现真实导出或备份。

## 4. 设置存储

- 类型文件：`app/renderer/src/features/settings/settingsTypes.ts`
- 存储文件：`app/renderer/src/features/settings/settingsStorage.ts`
- 页面文件：`app/renderer/src/features/settings/SettingsPage.tsx`
- localStorage key：`growth-tree-os:settings:v1`
- 存储策略：
  - localStorage 损坏时回退默认值，不白屏。
  - 保存后刷新保留。
  - 支持 reset to defaults。
  - 不影响 Time Debt 与 Wealth 既有业务数据。

## 5. 已保存配置

- `general.defaultModule`
- `general.appearance`
- `general.language`
- `shortcuts.timeDebtQuickFloatEnabled`
- `shortcuts.timeDebtQuickFloatShortcut`
- `shortcuts.timeDebtQuickFloatFallback`
- `timeDebt.minimumRecordMinutes`
- `timeDebt.roundingMode`
- `timeDebt.floatingDefaultState`
- `wealth.defaultCurrency`
- `wealth.safetyLineMonths`
- `modules.enabledModules`
- `modules.showExperimentalModules`

## 6. 暂未接入业务逻辑

- 外观模式未接入全局 ThemeProvider。
- 语言未接入全站 i18n。
- 快捷键启用开关未接入 Electron `globalShortcut` 注册。
- 快捷键字符串不支持自定义。
- Time Debt 最小记录单位、取整规则、浮窗默认状态未接入计时业务。
- Wealth 默认货币、安全线月数未接入投资与行情计算。
- 数据导出 / 备份未实现。

## 7. 建议接入顺序

1. Settings Foundation smoke 稳定后，接入默认打开模块。
2. 将 Time Debt 浮窗默认状态接入 `TimeDebtQuickFloat`。
3. 将快捷键启用开关接入 Electron 主进程注册门禁。
4. 接入外观模式到全局主题。
5. 接入 Wealth 默认货币与安全线月数。
6. 最后再做快捷键自定义、多语言和数据导出。
