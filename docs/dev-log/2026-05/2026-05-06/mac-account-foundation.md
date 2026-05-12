# 开发日志｜Mac｜Account Foundation｜2026-05-06

## 1. 本轮目标

为 growth-tree-os 增加本地账户身份层底座：只预留 `local_user` 与 `user_id`，不做真实注册、登录、验证码、云同步或第三方登录。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 跨边界修改声明

### 1. 跨边界原因

本轮任务是账号登录前置底座，必须触碰 main 进程 SQLite schema、IPC/preload/API 类型和一个轻量设置展示区域，属于业务底座跨层改动。

### 2. 涉及文件

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

### 3. 冲突风险

当前分支仍是 Mac Time Debt 分支，本轮没有修改 Time Debt、Wealth、Graph 主流程文件。风险主要来自跨层 DB/API 文件未来与集成分支合并时可能产生冲突。

### 4. 替代方案

不新增独立 migration 框架，沿用现有 `GrowthTreeDatabase` 启动时幂等 schema / migration 模式，避免扩大工程结构。

### 5. 最小修改策略

只创建 `users` 表、初始化 `local_user`、为现有核心 SQLite 表补 `user_id`，并让 DB 查询/写入默认过滤 `local_user`。设置展示只复用左侧已有 Data Root 区块，不新增真实登录 UI。

### 6. 回滚方式

如集成冲突，可回退本 commit 中上述文件；已迁移 SQLite 的旧数据仍保留，`user_id` 列可继续作为前置兼容字段。

## 4. 修改文件

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

## 5. 未修改区域

- 未修改图谱、时间负债、财富业务逻辑主流程。
- 未做注册、登录、验证码、云同步、第三方登录。
- 未新增独立 migration 框架。

## 6. 验收命令

- `./node_modules/.bin/tsc --noEmit -p tsconfig.node.json`
- `./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json`
- `./node_modules/.bin/electron-vite build`
- `./node_modules/.bin/electron-vite dev`
- 临时编译 main/shared 到 `/tmp/gto-db-check` 后运行 SQLite smoke：新库重复初始化、创建复盘、检查 `user_id`。
- 构造旧 schema SQLite 后重复初始化，检查旧 `reviews / nodes / app_settings` 数据回填为 `local_user`。

## 7. 验收结果

- TypeScript node + renderer 检查通过。
- SQLite smoke 通过：`users/local_user` 创建成功，新增复盘记录 `user_id = local_user`。
- 旧 schema 迁移 smoke 通过：旧 `reviews / nodes / app_settings` 保留并回填 `user_id = local_user`。
- `electron-vite build` 未通过：当前 Codex App 环境缺少 `pnpm/npm/corepack`，且 Rollup darwin optional native package 被 macOS code signature 拦截。
- `electron-vite dev` 同样被 Rollup native package 签名问题拦截，未完成页面启动验收。

## 8. 风险与遗留问题

- Time Debt 与 Wealth 当前是 renderer `localStorage` 存储，不属于 SQLite 表；本轮未改其主流程。后续若要多账户隔离，需要专门迁移 localStorage key 或数据结构。
- `app_settings.key` 仍是全局唯一，本轮只做 `local_user` 预留，未设计多账户唯一键。
- 页面启动验收受本机依赖/签名环境阻塞，需要在可用 pnpm 环境重新跑 `pnpm install && pnpm dev`。

## 9. 下一步建议

在 Mac 或 Windows 的正常 Node/pnpm 环境中重新安装依赖并启动项目，检查左侧 Account 展示和新增复盘后的 SQLite `reviews.user_id`。
