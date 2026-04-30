# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报中的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-30 CST

## 2. 本轮已完成

- Time Debt `日历` tab 升级为统一 Calendar View。
- 支持日 / 周 / 月 / 自定义天数视图，自定义天数支持 2-9 天。
- 月视图显示整月网格、非本月弱化、今天高亮、事件摘要和 `+N`。
- 日 / 周 / 自定义天数视图共用 Notion-like 时间刻度、半小时弱线和当前时间线。
- 当前时间线按分钟刷新，并在跨天后自动切换到新日期相关范围。
- 时间块按真实开始时间、持续时间和可见范围截断计算 top / height。
- 同一天重叠时间块按 overlap group 分列并排显示。
- 预留拖拽结构：`dragState`、`dragPreview`、`snapToMinute`、`pixelToTime`、`timeToPixel`，本轮仅预览不保存。
- 断点续跑已恢复本机依赖环境：临时 pnpm 可用，`typecheck` / `build` / `dev` 已通过或启动。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/*`
- `docs/dev-log/2026-04/2026-04-30/mac-time-debt-calendar-view-modes.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs typecheck`
- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs build`
- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs dev`
- 本地浏览器 smoke：Time Debt 可打开，日历 tab 可打开，日 / 月 / 天数可切换，月视图事件可打开右侧详情，洞察和提醒页面可打开。
- 未修改 3D、skills、`.codex`、`.claude`、脚本、工具链、协议文件、财富、成长树或周回看业务逻辑。

### 未验证 / 风险

- 当前 shell 仍没有系统级 `pnpm/npm/corepack`，本轮使用 `/tmp/codex-pnpm-package/bin/pnpm.cjs` 临时运行 pnpm。
- 普通浏览器访问 `http://localhost:5173/` 会因为缺少 Electron preload 而出现 `window.growthTree` 相关错误；真实 Electron dev app 已可启动。
- 正式截图归档仍需在 Electron 窗口完成。
- 完整拖拽保存链路未实现，本轮只做预览结构。
- 跨天事件仅做基础显示裁剪，不做复杂跨天编辑。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone https://github.com/Littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/mac-time-debt-plan-flow-overlap-ui
git rev-parse --short HEAD
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git status
git fetch origin
git checkout feature/mac-time-debt-plan-flow-overlap-ui
git pull origin feature/mac-time-debt-plan-flow-overlap-ui
git rev-parse --short HEAD
```

确认输出的 commit 应与本轮最终汇报一致。

## 6. Mac 端环境准备

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

如果 Mac 端 shell 里没有 `pnpm/npm/corepack`，可临时使用 standalone pnpm：

```bash
curl -fsSL https://registry.npmjs.org/pnpm/-/pnpm-10.18.3.tgz -o /tmp/codex-pnpm.tgz
rm -rf /tmp/codex-pnpm-package
mkdir -p /tmp/codex-pnpm-package
tar -xzf /tmp/codex-pnpm.tgz -C /tmp/codex-pnpm-package --strip-components=1

export PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH
rm -rf node_modules
node /tmp/codex-pnpm-package/bin/pnpm.cjs install --frozen-lockfile --force --ignore-scripts --child-concurrency=1 --reporter=append-only
node node_modules/electron/install.js
node /tmp/codex-pnpm-package/bin/pnpm.cjs typecheck
node /tmp/codex-pnpm-package/bin/pnpm.cjs build
node /tmp/codex-pnpm-package/bin/pnpm.cjs dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 打开 Time Debt，无页面报错。
- 进入 `日历` tab，确认右上角有日 / 周 / 月 / 天数切换。
- 切换日视图，检查单日时间轴、小时刻度和当前时间线。
- 切换周视图，检查 7 天列和今天列高亮。
- 切换月视图，检查整月网格、非本月弱化、今天高亮、事件摘要和 `+N`。
- 切换天数视图，分别选择 3 天和 9 天。
- 点击今天、上一段、下一段，确认范围变化正确。
- 创建 30 分钟事件和 2 小时事件，确认高度不同。
- 创建两个重叠事件，确认左右并排。
- 创建三个重叠事件，确认三列并排。
- 点击事件块，确认右侧详情面板出现。
- 拖动事件块，确认半透明预览框和详情面板“调整中”状态出现；松开后不保存真实数据。
- 回到 Today、洞察、Reminder 页面，确认无明显回归。
- 检查 active timer 跨页面保持。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

启动 Electron 桌面应用并按验收清单截图：日视图、周视图、月视图、天数下拉、当前时间线、半小时刻度、事件选中态、右侧详情面板、拖拽预览。如需验证两个 / 三个重叠事件，请先补记测试日志。确认稳定后，再继续瘦身 `TimeDebtDashboard.tsx`，移除旧周视图函数并把 Today 小日历合并到 Calendar 子模块。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- Time Debt 页面异常截图
- 日历视图切换异常截图
- Reminder 页面异常截图
- 开发者控制台首个关键错误
- 具体失败入口：日视图 / 周视图 / 月视图 / 天数视图 / 当前时间线 / 重叠事件 / 详情面板 / 拖拽预览

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有修改 3D 模块、Windows skills、`.codex`、`.claude`、脚本、工具链或协议文件。
- 本轮不接 Notion API、Google Calendar、iCal、云同步、系统通知或数据库迁移。
