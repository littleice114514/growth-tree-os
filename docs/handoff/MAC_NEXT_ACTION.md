# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/integration-time-debt-wealth
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-15 CST

## 2. 本轮已完成

- 新增 Time Debt 产品模式地图：`docs/project-map/TIME_DEBT_PRODUCT_MODE.md`。
- 记录 Time Debt 新方向：今日时间使用仪表盘、明日时间布局、实际执行反馈、浮窗快速记录、分类 / 任务复用。
- 明确 Time Debt 同时支持反映模式与布局模式。
- 明确未完成任务后续进入迁移、放弃、拆小、计划过载或复盘，不作为简单失败。
- 将 Time Debt 全局快捷键默认值改为 `CommandOrControl+Alt+T`。
- 保留 fallback：`CommandOrControl+Shift+L`，并与主快捷键同时注册为真实备用入口。
- 更新 Time Debt 浮窗路线图、Codex handoff 和本轮 dev-log。
- 本轮未做 Settings 页面、完整首页仪表盘、浮窗字段增强、结束计时补充框、D 线桌面悬浮球、数据库结构或 Wealth 改动。

## 3. 本轮修改文件

- `app/main/index.ts`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- `docs/project-map/TIME_DEBT_PRODUCT_MODE.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-14/time-debt-hotkey-stabilization.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 启动成功。
- Electron 注册全局快捷键日志：`CommandOrControl+Alt+T`。
- Electron 注册 fallback 快捷键日志：`CommandOrControl+Shift+L`。
- Wealth 页面可打开，未白屏。
- Time Debt 浮窗按钮可展开 `时间控制台`。

### 未验证 / 风险

- Settings 中若仍展示旧快捷键，需要后续 Settings 接入任务单独更新 UI 文案或配置来源。
- 本轮使用 Computer Use、macOS System Events 和 CGEvent 自动发送 `Cmd + Option + T` / `Cmd + Shift + L`，未能触发全局快捷键展开浮窗；需要 Mac 端手动物理按键复核。
- 如果 `Cmd + Option + T` 被当前前台应用或系统菜单捕获，使用 fallback `Cmd + Shift + L` 继续验收同一浮窗唤起链路。

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
- `pnpm dev` 终端出现：`[time-debt] registered global shortcut: CommandOrControl+Alt+T`。
- `pnpm dev` 终端出现：`[time-debt] registered global shortcut: CommandOrControl+Shift+L`。
- App 聚焦时手动按 `Cmd + Option + T`，右下角 Time Debt 浮窗应展开为 `时间控制台`。
- App 不聚焦时手动按 `Cmd + Option + T`，App 应被聚焦且 Time Debt 浮窗展开。
- 如果 `Cmd + Option + T` 未触发，手动按 `Cmd + Shift + L` 复核 fallback。
- 在 Wealth 页面手动按快捷键后应不切页，右下角 Time Debt 浮窗展开，Wealth 不白屏。
- Time Debt 浮窗仍可展开、收起、开始计时、结束计时。
- `docs/project-map/TIME_DEBT_PRODUCT_MODE.md` 存在，并包含反映模式、布局模式、首页仪表盘、浮窗字段增强和快捷键策略。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

浮窗字段增强第一阶段：

- 开始计时时支持任务名。
- 开始计时时支持一级分类：工作 / 学习 / 休息 / 生活。
- 页面记录分类与浮窗记录分类同步。
- 支持从已有任务名中复用或新建任务名。

暂不做结束计时补充框、完整 Time Debt 首页仪表盘、Settings 快捷键自定义或 D 线桌面悬浮球。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install`、`pnpm typecheck`、`pnpm build` 或 `pnpm dev` 的完整报错；
- `pnpm dev` 终端中与 `time-debt`、`globalShortcut` 相关的日志；
- Time Debt 浮窗截图；
- Wealth 页面截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要使用 `Command+X` 作为全局快捷键。
- 不要恢复 `CommandOrControl+Shift+Space` 作为默认主快捷键。
- 不要进入 Time Debt D 线。
- 不要做桌面悬浮球、系统托盘或 always-on-top 小窗。
- 不要改 Wealth。
