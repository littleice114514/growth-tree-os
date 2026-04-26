# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：git@github.com:littleice114514/growth-tree-os.git
- HTTPS 备选：https://github.com/littleice114514/growth-tree-os.git
- 分支：main
- 最新 commit：以本轮最终汇报和 Mac 端 `git rev-parse --short HEAD` 输出为准
- 当前设备完成时间：2026-04-26

## 2. 本轮已完成

- Time Debt / 时间负债已接入桌面端顶部导航。
- Time Debt 页面包含总览、时间日志、工作时间标准、日度统计、负债参数和仪表盘诊断。
- 时间日志、标准工时和参数使用 renderer localStorage 持久化，刷新后保留。
- 已完成 Windows 端 `pnpm install`、`pnpm typecheck`、`pnpm build` 和 `pnpm dev` smoke 验证。

## 3. 本轮修改文件

- `app/shared/timeDebt.ts`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/pages/MainWorkspacePage.tsx`
- `app/renderer/src/types/ui.ts`
- `docs/handoff/MACBOOK_SETUP.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm install` 通过。
- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- `pnpm dev` 可启动 Electron，renderer dev server 地址为 `http://localhost:5173/`。
- 固定测试样本在表单中作为默认日志草稿：持续时长 70 min，效率约 0.24 min / 个，状态加权 490，AI 化加权 0。

### 未验证 / 风险

- 本轮未做 SQLite / IPC 持久化迁移，Time Debt V1 继续使用 renderer localStorage。
- 本轮不包含 Android、APK、手机端导航、YOYO / MagicOS Bridge 或复杂 AI 自动分析。

## 5. Mac 端第一步操作

如果 Mac 上还没有项目：

```bash
mkdir -p ~/Developer
cd ~/Developer
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
git checkout main
```

如果 Mac 上已经有项目：

```bash
cd ~/Developer/growth-tree-os
git status
git fetch origin
git checkout main
git pull origin main
git rev-parse --short HEAD
```

确认输出的 commit 应与 Windows 端最终汇报一致。

## 6. Mac 端环境准备

```bash
pnpm install
pnpm dev
```

如需完整验收：

```bash
pnpm typecheck
pnpm build
```

## 7. Mac 端验收方式

请在 Mac 端检查：

- 是否能进入 `时间负债`。
- 是否能看到 `总览`、`时间日志`、`工作时间标准`、`日度统计`、`仪表盘诊断`。
- 是否能新增固定测试日志。
- 保存后最近日志是否出现。
- Daily Stats 是否出现当天统计。
- Dashboard / Diagnosis 是否出现中文诊断。
- 刷新后日志是否保留。
- `财富`、`成长树`、`Home` 主入口是否仍可进入。

固定测试日志：

```text
标题：优化单词突围完整词库，校对 1700 后缀
一级分类：工作
二级项目：单词突围考研版
开始时间：2026-03-30 14:00
结束时间：2026-03-30 15:10
工作量：295
工作量单位：个
状态分：7
AI 赋能比例：0
维度：时间管理
```

预期结果：

- 持续时长 = 70 min
- 效率呈现约为 0.24 min / 个
- 状态加权 = 490
- AI 化加权 = 0

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

验证 Time Debt V1 在 macOS Electron 环境的页面操作闭环，并判断 Wealth / Time Debt 的 renderer localStorage 是否需要进入下一阶段 SQLite / IPC 迁移。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出
- `git rev-parse --short HEAD` 输出
- `pnpm install`、`pnpm dev`、`pnpm typecheck` 或 `pnpm build` 的完整报错
- 页面异常截图
- DevTools 控制台首个关键错误

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- `.env`、SQLite、本地 runtime、依赖和构建产物不要提交。
