# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：本轮 push 后以 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-06

## 2. 本轮已完成

- M12.1.1 补齐 Time Debt / Wealth renderer localStorage 账户命名空间。
- 新增 renderer 侧轻量 helper，当前固定账户为 `local_user`。
- Time Debt logs / standards / params 新 key 改为 `growth-tree-os:local_user:time-debt:*:v1`。
- Wealth records 新 key 改为 `growth-tree-os:local_user:wealth:records:v1`。
- 增加旧 key 到新 key 的幂等复制迁移；旧 key 保留，不删除。

## 3. 本轮修改文件

- `app/renderer/src/lib/accountStorage.ts`
- `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- `app/renderer/src/features/wealth/wealthStorage.ts`
- `docs/dev-log/2026-05/2026-05-06/mac-time-debt-wealth-localstorage-account-namespace.md`
- `docs/dev-log/2026-05/2026-05-06/mac-account-foundation.md`
- `docs/dev-log/2026-05/2026-05-06/mac-account-foundation-validation.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `pnpm typecheck` 通过。
- `pnpm smoke` 通过。
- `pnpm dev` 可启动到 Electron renderer，`http://localhost:5173/` 可用；验收后已停止 dev 进程。
- 脚本确认旧 localStorage 数据会复制到新 key，旧 key 保留，重复迁移不会重复追加或破坏已有新 key。

### 未验证 / 风险

- 其他 Time Debt 附属 localStorage key，如 plan、timer、options、plan reminder，本轮按任务边界未改。
- 未做真实登录、云同步、SQLite 迁移或 Time Debt / Wealth UI 改动。

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

如果 `pnpm` 不可用，先安装 Node.js LTS 或通过 Corepack 恢复 pnpm。

## 7. Mac 端验收方式

请在 Mac 端检查：

- 应用可启动。
- 打开 Time Debt / Wealth 页面不报错。
- DevTools Application / Local Storage 中可看到：
  - `growth-tree-os:local_user:time-debt:logs:v1`
  - `growth-tree-os:local_user:time-debt:standards:v1`
  - `growth-tree-os:local_user:time-debt:params:v1`
  - `growth-tree-os:local_user:wealth:records:v1`
- 如果旧 key 有数据，新 key 首次读取后应复制到对应新 key；旧 key 仍保留。
- 重复刷新页面不会产生重复追加。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

做 M12 Account Foundation 最终封板验收：确认 SQLite `local_user/user_id` 底座与 Time Debt / Wealth localStorage `local_user` key 同时生效，然后更新封板日志；不要扩展真实登录或云同步。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install` / `pnpm dev` 完整报错；
- 页面异常截图；
- DevTools 控制台首个关键错误；
- DevTools Application / Local Storage 里 Time Debt / Wealth 新旧 key 截图。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要在本轮基础上直接开发注册、登录、验证码、云同步或第三方登录。
- 不要删除旧 localStorage key；当前策略是复制兼容，旧 key 暂存。
