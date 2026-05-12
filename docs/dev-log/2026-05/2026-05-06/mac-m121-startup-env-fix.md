# 开发日志｜Mac｜M12.1 启动验收环境修复｜2026-05-06

## 1. 本轮目标

只修复 M12.1 启动验收环境：恢复 pnpm、重装依赖、验证 Rollup native package 问题和项目启动。不继续开发真实登录、不改数据库结构、不改业务功能。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `docs/dev-log/2026-05/2026-05-06/mac-m121-startup-env-fix.md`

## 4. 未修改区域

- 未修改业务代码。
- 未修改数据库 schema / migration。
- 未修改图谱、时间负债、财富核心业务逻辑。
- 未做真实登录、云同步、注册、验证码、密码或后端接入。

## 5. 环境检查

- `pwd`：`/Users/ice/Documents/Codex/2026-04-25/growth-tree-os-mac-github-fresh/growth-tree-os`
- `node -v`：`v24.14.0`，来自 Codex App 内置 Node。
- `corepack --version`：失败，`corepack: command not found`。
- `pnpm -v`：初始失败，`pnpm: command not found`。

## 6. 修复动作

- 由于当前环境没有 `corepack`，未继续无限重试 `corepack enable` / `corepack prepare`。
- 先尝试 `/tmp` pnpm standalone，版本 `6.16.0`，但不兼容 lockfile v9 且在 Node 24 下请求 registry 报 `ERR_INVALID_THIS`。
- 使用 pnpm 官方安装脚本安装 pnpm `10.33.3`。
- 最终稳定位置：`/Users/ice/.local/share/pnpm`。
- `/Users/ice/.zshrc` 已由安装脚本写入 `PNPM_HOME=/Users/ice/.local/share/pnpm`。
- 未删除 `pnpm-lock.yaml`。
- 执行 `rm -rf node_modules` 后用 pnpm `10.33.3` 重新 `pnpm install`。

## 7. Rollup native package 结果

- 依赖重装后，`@rollup/rollup-darwin-arm64@4.60.2` 已存在。
- 普通 `pnpm dev` 仍失败，原因不是缺包，而是 Codex App 内置 Node 加载 native `.node` 时被 macOS code signature 拦截。
- 错误包：`@rollup/rollup-darwin-arm64`。
- 同类安装期警告包：`@swc/core-darwin-arm64`。
- 最小可行修复：用项目安装的 Electron 自带 Node 执行 pnpm script，并在启动子 Electron app 前清理 `ELECTRON_RUN_AS_NODE`。

## 8. 验收命令

- `PNPM_HOME=/Users/ice/.local/share/pnpm PATH=/Users/ice/.local/share/pnpm:$PATH pnpm -v`
- `rm -rf node_modules`
- `PNPM_HOME=/tmp/gto-pnpm-home PATH=/tmp/gto-pnpm-home:$PATH pnpm install`
- `PNPM_HOME=/Users/ice/.local/share/pnpm PATH=/Users/ice/.local/share/pnpm:$PATH pnpm typecheck`
- `PNPM_HOME=/Users/ice/.local/share/pnpm PATH=/Users/ice/.local/share/pnpm:$PATH pnpm dev`
- `PATH=/tmp/gto-electron-node-shim:/tmp/gto-pnpm-home:$PATH pnpm dev`

## 9. 验收结果

- pnpm 已恢复：`10.33.3`。
- `pnpm install` 完成，lockfile 未被删除。
- `pnpm typecheck` 通过。
- 普通 `pnpm dev` 仍失败：Codex App Node 加载 `@rollup/rollup-darwin-arm64` native 包时签名不匹配。
- Electron Node shim 下 `pnpm dev` 可启动，输出 renderer 地址 `http://localhost:5173/`，Electron app 进程启动，并仅出现 Node SQLite experimental warning。
- 验收后已手动停止 dev 进程。

## 10. 风险与遗留问题

- 当前 Codex App shell 默认 `node` 仍是 Codex App 内置 Node；直接跑普通 `pnpm dev` 仍可能触发 native 签名问题。
- 临时可用启动方式依赖 `/tmp/gto-electron-node-shim`；如果要长期固定，建议后续只做环境脚本，不改业务代码。
- 本轮未处理 GitHub HTTPS 凭据问题，因此本地 commit 仍可能需要用户在已登录 GitHub 的终端或 GitHub Desktop 中 push。

## 11. 下一步建议

后续在正常 macOS Terminal 中先执行 `source ~/.zshrc && pnpm -v`。如果 `pnpm dev` 仍因 native 签名失败，再固化一个项目外部启动脚本：用 Electron 自带 Node 运行 `electron-vite`，并在启动子 Electron 前删除 `ELECTRON_RUN_AS_NODE`。
