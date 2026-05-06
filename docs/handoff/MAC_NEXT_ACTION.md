# Mac 下一步操作卡

## 1. 项目信息

- 项目名：growth-tree-os
- GitHub 仓库：https://github.com/Littleice114514/growth-tree-os.git
- 分支：feature/mac-time-debt-plan-flow-overlap-ui
- 最新 commit：提交后以 `git rev-parse --short HEAD` 为准
- 当前设备完成时间：2026-05-06

## 2. 本轮已完成

- 增加本地账户身份层底座，只预留 `local_user` 和 `user_id`。
- 新增 SQLite `users` 表，并幂等初始化 `id = local_user`、`display_name = 本地账户`、`mode = local`。
- 为当前 SQLite 核心表补 `user_id`，旧数据为空时回填 `local_user`。
- DB 查询和新增写入默认按 `local_user` 过滤 / 写入。
- 左侧工作区信息区增加轻量账户展示：当前模式、本机保存、登录同步暂未开放。

## 3. 本轮修改文件

- `app/main/db.ts`
- `app/main/ipc.ts`
- `app/preload/index.ts`
- `app/shared/contracts.ts`
- `app/renderer/src/services/api.ts`
- `app/renderer/src/types/ui.ts`
- `app/renderer/src/app/store.ts`
- `app/renderer/src/features/reviews/ReviewSidebar.tsx`
- `docs/dev-log/2026-05/2026-05-06/mac-account-foundation.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 当前验证结果

### 已验证

- `./node_modules/.bin/tsc --noEmit -p tsconfig.node.json` 通过。
- `./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json` 通过。
- 临时 SQLite smoke 通过：重复初始化不报错，`users/local_user` 创建成功，新增复盘记录带 `user_id = local_user`。
- 旧 schema smoke 通过：旧 `reviews / nodes / app_settings` 保留并回填 `user_id = local_user`。

### 未验证 / 风险

- 当前 Codex App shell 没有 `pnpm/npm/corepack`，`electron-vite build/dev` 被 Rollup darwin optional native package 签名问题拦截，未完成真实页面启动验收。
- Time Debt 与 Wealth 当前使用 renderer `localStorage`，不是 SQLite 表；本轮未改主流程，只记录为后续多账户隔离风险。
- `app_settings.key` 仍是全局唯一，本轮只服务 `local_user` 单账户底座。

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

确认输出的 commit 应为本轮最终 commit。

## 6. Mac 端环境准备

```bash
corepack enable
pnpm install
pnpm typecheck
pnpm dev
```

如果 `pnpm` 不可用，先安装 Node.js LTS 或通过 Corepack 恢复 pnpm。

## 7. Mac 端验收方式

请在 Mac 端检查：

- 应用可启动，不因账户 API 崩溃。
- 左侧工作区信息区显示“当前模式：本地账户”“数据保存：本机”“登录同步：暂未开放”。
- 新建一条复盘后，SQLite `reviews` 新记录包含 `user_id = local_user`。
- 旧复盘、旧节点仍能显示。

## 8. Mac 端下一轮任务

请让 Mac 端 Codex 接着完成：

在正常 pnpm 环境启动项目，做真实页面 smoke，并用实际 app 数据库确认 `users/local_user` 和新增复盘 `user_id = local_user`；若通过，补一条验收日志并推进到集成分支准备。

## 9. 如果 Mac 端失败，请返回这些信息

请截图或粘贴：

- `git status` 输出；
- `git rev-parse --short HEAD` 输出；
- `pnpm install` / `pnpm dev` 完整报错；
- 页面异常截图；
- DevTools 控制台首个关键错误；
- SQLite 检查中 `users`、`reviews`、`nodes` 的 `PRAGMA table_info` 和样例行输出。

## 10. 注意事项

- 不要直接覆盖本地未提交改动。
- 如果 Mac 端已有本地修改，先运行 `git status`，不要直接 pull。
- 如果出现冲突，先停止并输出冲突文件列表。
- 不要在本轮基础上直接开发注册、登录、验证码、云同步或第三方登录。
