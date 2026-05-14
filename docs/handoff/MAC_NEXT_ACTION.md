# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/integration-time-debt-wealth
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-14 18:43 CST

## 2. 本轮已完成

- 完成 Settings Foundation 设置中心底座。
- 在主工作台顶部导航新增 `设置` 入口。
- 新增 Settings 页面，包含通用、快捷键、时间负债、财富、数据与实验功能 5 个分区。
- 新增本地设置类型与 localStorage 存储。
- 支持保存、损坏数据回退默认值、reset to defaults。
- 保留 Time Debt 快捷键展示，不修改 Electron `globalShortcut` 注册逻辑。
- 保持 Wealth 投资 / 行情业务逻辑不变。
- 保持实验模块隐藏。
- 更新 Settings project-map、dev-log 和 handoff。

## 3. 本轮修改文件

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
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 启动成功。
- Electron 注册全局快捷键日志存在：`CommandOrControl+Shift+Space`。
- 真实 Electron App 中可见 `设置` 入口。
- Settings 页面不白屏，5 个分区可见。
- 可修改默认打开模块、外观模式和 Time Debt 最小记录单位。
- Time Debt 快捷键与 fallback 展示正确。
- Time Debt 浮窗仍挂载，未被 Settings 页面影响。
- 实验模块未恢复到主导航。
- Settings storage smoke：保存后可读取，损坏 JSON 回退默认值，reset 恢复默认值。

### 未验证 / 风险

- Settings 配置第一版多数只保存，尚未接入业务行为。
- 外观模式尚未接入 ThemeProvider。
- 快捷键启用开关尚未接入 Electron main 注册门禁。
- Wealth 默认货币与安全线月数尚未接入财富计算。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/integration-time-debt-wealth
git rev-parse --short HEAD
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/integration-time-debt-wealth
git pull origin feature/integration-time-debt-wealth
git rev-parse --short HEAD
```

确认输出的 commit 应与本轮最终汇报中的 commit 一致。

## 6. Mac 端环境准备

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 必须打开真实 Electron App，不要只打开浏览器里的 localhost。
- 主导航可见：时间负债、财富、复盘记录、提醒、Review、设置。
- 点击 `设置` 不白屏。
- Settings 页面可见：通用、快捷键、时间负债、财富、数据与实验功能。
- 修改默认打开模块、外观模式、最小记录单位、默认货币、安全线月数后保存。
- 刷新后设置仍保留。
- 点击重置默认值后恢复默认设置。
- Time Debt 浮窗仍可展开、收起、开始计时。
- Wealth 投资 / 行情页面仍可打开，不白屏。
- SystemX、AI Map、3D、Tree、Nodes、Graph 等实验模块没有恢复到主导航。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

Settings 接入第一批低风险业务配置：

1. 默认打开模块接入启动视图。
2. Time Debt 浮窗默认状态接入 `TimeDebtQuickFloat`。
3. 快捷键启用开关接入 Electron `globalShortcut` 注册门禁。

暂不做快捷键自定义、完整主题系统、完整多语言或数据导出。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install`、`pnpm typecheck`、`pnpm build` 或 `pnpm dev` 的完整报错；
- `pnpm dev` 终端中与 `time-debt`、`globalShortcut`、`settings` 相关的日志；
- Settings 页面截图；
- Time Debt 浮窗截图；
- Wealth 页面截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要进入 Time Debt D 线。
- 不要做桌面悬浮球、系统托盘或 always-on-top 小窗。
- 不要新增行情 API。
- 不要恢复实验模块。
