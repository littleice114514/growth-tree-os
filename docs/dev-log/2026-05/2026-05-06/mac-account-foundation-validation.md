# 开发日志｜Mac｜Account Foundation 验收补齐｜2026-05-06

## 1. 本轮目标

补齐 M12.1 Account Foundation 验收：确认 `users/local_user`、`user_id` 预留、旧数据保留、新增数据归属和查询过滤是否真实生效。只做补齐和修复，不做真实登录、云同步、注册、验证码或后端接入。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `app/main/db.ts`
- `docs/dev-log/2026-05/2026-05-06/mac-account-foundation-validation.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 未修改区域

- 未修改图谱、时间负债、财富核心业务逻辑。
- 未修改 Time Debt / Wealth localStorage 数据结构。
- 未做真实登录、云同步、注册、验证码、密码、Supabase/Firebase/自建后端。

## 5. 本轮检查结论

### 已确认覆盖的 SQLite 表

- `users`：存在，且 `local_user` 可幂等创建 / 更新。
- `reviews`：已有 `user_id`，新增复盘默认写入 `local_user`，列表和详情按当前用户过滤。
- `nodes`：已有 `user_id`，新增节点默认写入 `local_user`，搜索、详情、树快照、派生状态更新按当前用户过滤。
- `edges`：已有 `user_id`，新增节点产生的主线边默认写入 `local_user`，树快照按当前用户过滤。
- `node_evidence`：已有 `user_id`，新增证据默认写入 `local_user`，复盘详情、节点详情、周证据统计按当前用户过滤。
- `reminders`：已有 `user_id`，自动生成提醒、列表、完成、关闭均按当前用户过滤 / 写入。
- `app_settings`：已有 `user_id`，seed 相关设置默认写入 `local_user`。

### 未覆盖的表和原因

- Time Debt 相关数据当前没有 SQLite 表，现有入口是 renderer `localStorage`：`timeDebtStorage.ts`、`timeDebtPlansStorage.ts`、`timeDebtActiveTimerStorage.ts`、`timeDebtOptionsStorage.ts`、`timePlanReminderStorage.ts`。
- Wealth 相关数据当前没有 SQLite 表，现有入口是 renderer `localStorage`：`wealthStorage.ts`。
- 上述 localStorage 数据属于用户数据，但本轮按任务边界不改 Time Debt / Wealth 主流程；后续真实登录或多账户隔离时，应单独设计 key 命名或迁移结构。

## 6. 本轮补齐

- 新增 `GrowthTreeDatabase.getCurrentUserId()`，当前默认返回 `local_user`，后续真实登录可替换这里。
- 主要查询 / 写入链路改为通过 `getCurrentUserId()` 获取当前用户。
- `applyExtraction` 增加复盘归属检查，避免给非当前用户复盘写入节点 / 证据。

## 7. 新增数据 user_id 验证方式

使用临时编译后的 main 代码和临时 SQLite 数据库验证：

- 新库初始化两次，不报错。
- `createReview` 新增复盘，检查 `reviews.user_id = local_user`。
- `applyExtraction` 新建节点，检查 `nodes.user_id = local_user`。
- 新节点自动连主线，检查 `edges.user_id = local_user`。
- 结构更新写证据，检查 `node_evidence.user_id = local_user`。
- 派生提醒生成后，检查 `reminders.user_id = local_user`。
- 所有核心表 `user_id IS NULL OR user_id = ''` 计数为 0。

## 8. 迁移幂等验证结果

- 新 schema 重复初始化通过。
- 旧 schema 构造 `reviews / nodes / edges / node_evidence / reminders / app_settings` 后重复初始化通过。
- 旧数据未丢失，旧记录均回填 `user_id = local_user`。
- `users.local_user` 创建成功。

## 9. 验收命令

- `./node_modules/.bin/tsc --noEmit -p tsconfig.node.json`
- `./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json`
- `pnpm typecheck`
- `./node_modules/.bin/electron-vite build`
- `./node_modules/.bin/electron-vite dev`
- 临时 SQLite smoke：新库重复初始化 + 新增复盘/节点/边/证据/提醒 user_id 检查。
- 临时旧 schema smoke：旧数据保留 + user_id 回填检查。

## 10. 验收结果

- TypeScript node + renderer 检查通过。
- `pnpm typecheck` 未运行成功：当前 Codex App shell 没有 `pnpm`。
- 项目没有 `lint` / `test` scripts，未强行新增测试框架。
- `electron-vite build` 未通过：Rollup darwin optional native package 被 macOS code signature 拦截。
- `electron-vite dev` 未通过：同一 Rollup native package 签名问题。
- SQLite smoke 通过。

## 11. 风险与遗留问题

- Time Debt / Wealth localStorage 用户数据尚未绑定 `user_id`，需要后续单独迁移，不应混在本轮最小账户底座里改。
- `app_settings.key` 当前仍是全局唯一；本轮只有 `local_user`，真实多账户时需要评估是否改成复合唯一约束或 key 命名空间。
- 当前分支仍未 push 到 GitHub，原因是本机 GitHub HTTPS 凭据不可用。

## 12. 下一步建议

在有正常 `pnpm` 和 GitHub 凭据的环境中运行 `pnpm install && pnpm typecheck && pnpm dev`，做真实页面 smoke：确认 Account 展示、旧数据展示、新增复盘后 SQLite `reviews.user_id = local_user`。
