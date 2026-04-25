# growth-tree-os

本项目是一个 `Desktop + Local-first` 的成长树软件底座。  
本轮只实现一条最小闭环：

`每日复盘 -> 手动确认 1~3 条结构更新 -> 成长树刷新 -> 本地持久化`

## 技术栈

- Electron
- React + TypeScript + Vite
- Zustand
- React Flow
- Tailwind CSS
- SQLite（通过 Node 内置 `node:sqlite`）
- Markdown 文件落盘

## 项目结构

```text
growth-tree-os/
  app/
    main/         Electron 主进程、SQLite、IPC、seed
    preload/      渲染层白名单桥接
    renderer/     React 界面层
    shared/       主进程与渲染层共享类型
  data/
    seeds/        种子说明
  docs/
    PRODUCT_RULES_V0_1.md
    ARCHITECTURE.md
    SMOKE_TEST.md
```

## 开发命令

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## Windows 启动

```powershell
cd C:\Users\32042\Desktop\vibe coding项目\growth-tree-os
pnpm install
pnpm dev
```

常用检查：

```powershell
pnpm typecheck
pnpm build
```

## macOS 启动

```bash
mkdir -p ~/Developer
cd ~/Developer
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
pnpm install
pnpm dev
```

如果 MacBook 没有配置 GitHub SSH，可以使用：

```bash
git clone https://github.com/littleice114514/growth-tree-os.git
```

## GitHub 双设备协同

```bash
git status
git pull
git checkout -b mac/wealth-dashboard-check
git add .
git commit -m "chore: verify mac setup and wealth dashboard"
git push -u origin mac/wealth-dashboard-check
```

协同规则：

- GitHub 是唯一代码源，不用 LocalSend 传整个项目文件夹。
- 两台设备不要同时直接改 `main`。
- 每次开始开发前先 `git pull`。
- 每次完成一个小功能就 commit。
- `.env`、SQLite、本地运行数据、依赖和构建产物不提交。

MacBook 详细接力说明见 `docs/handoff/MACBOOK_SETUP.md`。

## Smoke 命令

```bash
pnpm smoke
```

`pnpm smoke` 会执行：

- `pnpm typecheck`
- `pnpm build`

## 本地数据位置

应用运行后会在 Electron `userData` 下创建：

```text
growth-tree-os/
  reviews/   每日复盘 markdown
  db/        SQLite 数据库
  config/    本地配置
```

Windows 开发环境下通常会落在类似路径：

```text
C:\Users\<用户名>\AppData\Roaming\growth-tree-os\...
```

实际运行路径可在应用左下角 `Data Root` 区域查看。

## 本轮能力边界

- 支持新建每日复盘并落盘为 markdown
- 支持手动录入 1~3 条结构更新
- 支持新建节点或绑定已有节点
- 支持将结构更新写入 SQLite 并刷新成长树
- 支持查看节点时间信息与最近证据
- 支持 Wealth Dashboard V1，以自由度、未来钱消耗、节省池和投资池为核心展示财富状态

## 本轮明确不做

- 云同步
- 手机端
- AI 自动抽取
- 富文本编辑器
- 周/月回顾正式页
- 提醒系统
- 插件系统
- 自由图编辑器

## 说明

- 当前使用 Node 内置 `node:sqlite`，避免 Windows 下原生 SQLite 依赖阻塞本轮闭环。
- 打包脚本本轮只保留 `pnpm build` 产物，不额外接正式安装包流程。
