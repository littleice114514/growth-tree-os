# 开发日志｜Mac｜Time Debt / Wealth localStorage 账户命名空间补齐｜2026-05-06

## 1. 本轮目标

补齐 M12.1.1 Account Foundation 封板前的最后缺口：只给 Time Debt / Wealth 的 renderer localStorage 增加 `local_user` 账户命名空间，并保留旧 key 数据兼容迁移。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `app/renderer/src/lib/accountStorage.ts`
- `app/renderer/src/features/time-debt/timeDebtStorage.ts`
- `app/renderer/src/features/wealth/wealthStorage.ts`
- `docs/dev-log/2026-05/2026-05-06/mac-time-debt-wealth-localstorage-account-namespace.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 本轮完成内容

- 新增 renderer 侧轻量账户 storage helper，当前固定返回 `local_user`。
- Time Debt logs / standards / params 全部改为账户化 localStorage key。
- Wealth records 改为账户化 localStorage key。
- 增加旧 key 到新 key 的幂等迁移：新 key 为空且旧 key 有值时复制；旧 key 暂时保留，不删除。
- 未修改 Time Debt / Wealth UI、数据结构、业务逻辑、SQLite 迁移、真实登录或云同步。

## 5. localStorage key 对照

### Time Debt

- `growth-tree-os:time-debt-logs:v1` -> `growth-tree-os:local_user:time-debt:logs:v1`
- `growth-tree-os:time-debt-standards:v1` -> `growth-tree-os:local_user:time-debt:standards:v1`
- `growth-tree-os:time-debt-params:v1` -> `growth-tree-os:local_user:time-debt:params:v1`

### Wealth

- `growth-tree-os:wealth-records:v1` -> `growth-tree-os:local_user:wealth:records:v1`

## 6. 验收结果

- `pnpm typecheck`：通过。
- `pnpm smoke`：通过；首次因本机 node_modules 的 Rollup optional native 包加载问题失败，执行 `CI=true pnpm install` 重建后通过。
- `pnpm dev`：可启动到 Electron renderer，`http://localhost:5173/` 可用；验收后已停止 dev 进程。
- localStorage 迁移脚本确认：
  - 新 key 包含 `local_user`。
  - 旧 Time Debt / Wealth 数据会复制到新 key。
  - 旧 key 保留。
  - 重复执行迁移不会重复追加或覆盖已有新 key。

## 7. 风险与下一步

- 其他 Time Debt 附属 localStorage key，如 plan、timer、options、plan reminder，本轮按任务边界未改。
- M12 Account Foundation 可按当前目标进入封板验收；下一轮建议只做集成确认，不扩展真实登录或云同步。
