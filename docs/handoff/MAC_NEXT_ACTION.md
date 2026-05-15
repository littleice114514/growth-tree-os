# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- 分支：feature/integration-time-debt-wealth
- 最新 commit：以本轮最终汇报的 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-15 CST

## 2. 本轮已完成

- 补做 Time Debt 浮窗字段增强第一阶段。
- 右下角 Time Debt 浮窗空闲态新增 `一级分类` 控件。
- 一级分类固定选项：工作 / 学习 / 休息 / 生活 / 其他。
- 默认一级分类：学习。
- 开始计时后 active timer 保存一级分类。
- 计时中卡片显示分类。
- 结束计时后 Time Debt log 写入一级分类。
- 最近任务点击后同时回填任务名和一级分类。
- 老日志缺分类时 fallback 为 `其他`。
- 本轮未做 Settings、Time Debt 首页仪表盘、结束计时补充框、AI 赋能占比、D 线桌面悬浮球或 Wealth 改动。

## 3. 本轮修改文件

- `app/renderer/src/features/time-debt/components/TimeDebtQuickFloat.tsx`
- `app/renderer/src/features/time-debt/timeDebtQuickTimer.ts`
- `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- `docs/project-map/TIME_DEBT_FLOATING_WINDOW_MODE.md`
- `docs/project-map/TIME_DEBT_PRODUCT_MODE.md`
- `docs/handoff/CODEX_TIME_DEBT_NEXT_ACTION.md`
- `docs/handoff/MAC_NEXT_ACTION.md`
- `docs/dev-log/2026-05/2026-05-15/time-debt-floating-category-phase1.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- `pnpm dev`：真实 Electron App 启动成功。
- 真实 Electron 浮窗中看到了 `一级分类`。
- 一级分类选项包含：工作 / 学习 / 休息 / 生活 / 其他。
- `浮窗分类测试 / 学习` 可开始计时。
- 计时中卡片显示任务名和 `分类：学习`。
- 收起浮窗后状态不丢。
- 刷新后 active timer 恢复，分类仍为 `学习`。
- 结束计时后记录写入成功，反馈显示 `已记录：浮窗分类测试 · 1 分钟`。
- 最近任务出现 `浮窗分类测试`，并能回填任务名和分类 `学习`。
- Wealth 页面可打开，未白屏。

### 未验证 / 风险

- 老 active timer 若来自更早版本且缺分类，建议先结束或清空后重新开始；本轮新建 timer 会保存分类。

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
- 必须打开真实 Electron App，不要只打开浏览器里的 localhost。
- 展开右下角 Time Debt 浮窗。
- 确认空闲态可见：任务名称、一级分类、最近任务、开始计时。
- 确认一级分类选项包含：工作 / 学习 / 休息 / 生活 / 其他。
- 选择 `学习`，输入 `浮窗分类测试`，点击开始计时。
- 计时中卡片应显示：`正在记录：浮窗分类测试` 和 `分类：学习`。
- 收起浮窗后状态不丢。
- 刷新后 active timer 恢复，分类仍为 `学习`。
- 点击结束计时后，Time Debt 日志写入成功且分类为 `学习`。
- 最近任务出现 `浮窗分类测试`；再次点击后任务名和分类都回填。
- Wealth 页面不白屏。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

结束计时补充框第一阶段：

- 备注。
- AI 赋能占比。
- 完成状态。

暂不做完整 Time Debt 首页仪表盘、Settings 快捷键自定义或 D 线桌面悬浮球。

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
