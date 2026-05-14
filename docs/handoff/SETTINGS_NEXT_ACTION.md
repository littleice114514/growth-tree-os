# Settings Foundation｜下一步操作卡

## 1. 当前状态

- 项目：growth-tree-os
- 分支：`feature/integration-time-debt-wealth`
- 阶段：Settings Foundation
- 基线：Time Debt A/B/C 与 Wealth 投资/行情 integration 已通过。
- 本轮目标：建立设置中心底座，不做完整设置系统。

## 2. 本轮已完成

- 新增主导航 `设置` 入口。
- 新增 Settings 页面与 5 个设置分区。
- 新增 settings 类型与 localStorage 存储。
- 支持保存、刷新保留、重置默认值。
- 保留 Time Debt 快捷键展示：
  - 主快捷键：`CommandOrControl+Shift+Space`
  - fallback：`CommandOrControl+Shift+L`
- 保持实验模块隐藏。

## 3. 修改文件

- `app/renderer/src/features/settings/settingsTypes.ts`
- `app/renderer/src/features/settings/settingsStorage.ts`
- `app/renderer/src/features/settings/SettingsPage.tsx`
- `app/renderer/src/types/ui.ts`
- `app/renderer/src/app/store.ts`
- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `docs/project-map/SETTINGS_FOUNDATION_MODE.md`
- `docs/dev-log/2026-05/2026-05-14/settings-foundation.md`
- `docs/handoff/SETTINGS_NEXT_ACTION.md`

## 4. 验收方式

```bash
git status --short
pnpm typecheck
pnpm build
pnpm dev
```

真实 Electron App 中检查：

- 主界面可见 `设置` 入口。
- 点击设置不白屏。
- 可见：通用、快捷键、时间负债、财富、数据与实验功能。
- 修改默认打开模块、外观模式、最小记录单位、默认货币、安全线月数后保存。
- 刷新后设置仍保留。
- 点击重置恢复默认值。
- Time Debt 浮窗 A/B/C 仍可用。
- Wealth 投资/行情仍可用。
- 实验模块未恢复。

## 5. 下一轮唯一建议

如果本轮 Settings Foundation smoke 通过，下一轮建议做：

Settings 接入第一批低风险业务配置：

1. 默认打开模块接入启动视图。
2. Time Debt 浮窗默认状态接入 `TimeDebtQuickFloat`。
3. 快捷键启用开关接入 Electron `globalShortcut` 注册门禁。

仍然暂不做快捷键自定义、完整主题系统、完整多语言或数据导出。
