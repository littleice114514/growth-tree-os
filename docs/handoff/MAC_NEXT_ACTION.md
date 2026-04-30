# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报中的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-04-30 17:06 CST

## 2. 本轮已完成

- Time Debt 主 tab 显示名从“今日台”改为“执行台”，内部 key 仍保留 `today`。
- 执行台移除旧的大型“今日时间日志表”/日历网格，改为行动入口、统计摘要、下一行动和诊断简报。
- 日历事件块内容压缩为摘要：小块只显示任务名，中块显示任务名和时间范围，大块最多显示状态小标签。
- 右侧详情面板承接完整信息：状态、分类、项目、计划/实际时间、时长、AI 赋能比例、状态分、标签、干扰源、备注/结果记录、Reminder/计划提示和相关操作。
- 日 / 周 / 自定义天数视图复用半小时时间轴，整点和半小时文字贴在横线左侧，网格线更轻。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventBlock.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventDetailPanel.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarTimeAxis.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`
- `docs/dev-log/2026-04/2026-04-30/mac-time-debt-calendar-ui-density.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs typecheck`：通过。
- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs build`：通过。
- `PATH=/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH node /tmp/codex-pnpm-package/bin/pnpm.cjs dev`：可启动 renderer 与 Electron app。
- 浏览器 smoke：Time Debt 可打开；tab 为“执行台 / 日历 / 洞察”；执行台无完整日志表/大日历；日历日/月视图可切换；半小时标签可见；点击已有事件后右侧详情显示完整字段。

### 未验证 / 风险

- 系统级 `pnpm/npm/corepack` 仍不在 PATH，本轮使用 `/tmp/codex-pnpm-package/bin/pnpm.cjs`。
- 普通浏览器访问 renderer 仍会记录既有 Electron preload 相关 `window.growthTree` / `tree` 错误；真实 Electron dev app 已可启动。
- 未完成正式截图归档。
- 旧 `DailyCalendarView` / `TimelineView` 等未渲染函数仍在 `TimeDebtDashboard.tsx` 中，后续可专门瘦身。

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
node /tmp/codex-pnpm-package/bin/pnpm.cjs install --frozen-lockfile --ignore-scripts --child-concurrency=1 --reporter=append-only
node node_modules/electron/install.js
node /tmp/codex-pnpm-package/bin/pnpm.cjs typecheck
node /tmp/codex-pnpm-package/bin/pnpm.cjs build
node /tmp/codex-pnpm-package/bin/pnpm.cjs dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 打开 Time Debt，无页面级崩溃。
- tab 显示为“执行台 / 日历 / 洞察”。
- 执行台保留今日状态、当前焦点、开始计时、补记时间、规划任务、待开始任务和诊断摘要。
- 执行台不再显示完整日志表、完整日历网格或多条日志详情列表。
- 进入日历，切换日 / 周 / 月 / 天数视图。
- 日 / 周 / 天数视图中整点与半小时标注显示在线条左侧，半小时更浅。
- 事件块只显示摘要，不常驻显示备注、AI 赋能比例、状态分、分类项目等详细字段。
- 点击事件块后，右侧详情面板显示完整字段。
- Active 任务仍能结束计时。
- 两个/三个重叠事件仍并排，不互相完全遮挡。
- 打开提醒页面，确认 Time Debt 计划提醒入口无明显回归。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

在 Electron 桌面窗口补齐截图验收：执行台、日历页、半小时刻度、事件块摘要、右侧详情面板、两个/三个重叠事件、月视图。确认稳定后，再专门瘦身 `TimeDebtDashboard.tsx`，移除不再渲染的旧日历函数。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm typecheck`、`pnpm build`、`pnpm dev` 的完整报错
- Time Debt 页面异常截图
- 执行台异常截图
- 日历视图切换异常截图
- 右侧详情面板异常截图
- Reminder 页面异常截图
- 开发者控制台首个关键错误

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 本轮没有修改 3D 模块、Windows skills、`.codex`、`.claude`、脚本、工具链或协议文件。
- 本轮不接 Notion API、Google Calendar、iCal、云同步、系统通知或数据库迁移。
