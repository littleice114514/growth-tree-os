# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-07

## 2. 本轮已完成

- 拆分 Time Debt 的 15 分钟规则：真实日志保存仍用实际 duration，日历视觉高度才使用最小 15 分钟。
- `CalendarEventDetailPanel` 对已保存短任务显示真实短任务说明，不再在未编辑时用“至少 15 分钟”红字误导。
- resize / 时间段编辑仍保留 15 分钟最小交互规则；计时结束和补记保存不使用 15 分钟门槛。
- 保持 Active Timer 闭环、跨天分段、历史任务 Combobox 不回退。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/calendar/CalendarEventDetailPanel.tsx`
- `app/renderer/src/features/time-debt/calendar/calendarTimePositionUtils.ts`
- `app/renderer/src/features/time-debt/calendar/calendarTypes.ts`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/handoff/TIME_DEBT_MODULE_INDEX.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm smoke` 通过，包含 renderer production build。
- 本地 dev 页面 `http://localhost:5174/` 可打开 Time Debt。

### 未验证 / 风险

- Codex in-app browser 的 datetime-local `fill` 没有可靠触发 React state，本轮未把自动化补记 5 分钟作为有效 UI 验收。
- 需要 Mac 端用真实鼠标/键盘补记或计时一个 3-8 分钟短任务，确认保存后详情显示真实分钟数。
- 当前分支本地已有 commit，但 GitHub HTTPS / `gh` 凭据未配置时 push 会失败。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Desktop/vibe-coding-projects
cd ~/Desktop/vibe-coding-projects
git clone https://github.com/Littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout feature/mac-time-debt-plan-flow-overlap-ui
```

如果 Mac 上已经有项目：

```bash
cd <Mac上的项目目录>
git fetch origin
git checkout feature/mac-time-debt-plan-flow-overlap-ui
git pull origin feature/mac-time-debt-plan-flow-overlap-ui
git rev-parse --short HEAD
```

确认输出的 commit 应为本轮最终汇报中的 commit。

## 6. Mac 端环境准备

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm smoke
pnpm dev
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 开始计时 3-8 分钟后可以结束并保存，不被 15 分钟规则拦截。
- 补记 `10:03 - 10:08` 可以保存为真实 5 分钟。
- 日历短任务块有可点击高度，但详情面板显示真实 5 分钟。
- resize / 时间段编辑仍至少按 15 分钟处理。
- Active Timer 结束、跨天分段、历史任务 Combobox 不回退。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

用真实 UI 输入补记一个 5 分钟短任务，再创建一个 3-8 分钟计时任务，确认统计和详情都使用真实分钟数；通过后只补简短验收日志。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm dev` 完整报错；
- Time Debt 短任务详情截图；
- DevTools 控制台首个关键错误。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要扩展洞察页、仪表盘、字段系统、Notion API 或外部日历同步。
