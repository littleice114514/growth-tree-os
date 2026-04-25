# MacBook 接力卡｜growth-tree-os

## 1. 仓库地址

GitHub Repo：

git@github.com:littleice114514/growth-tree-os.git

HTTPS 备选：

https://github.com/littleice114514/growth-tree-os.git

## 2. MacBook 首次准备

需要安装：

- Git
- Node.js LTS
- pnpm
- VS Code、Cursor 或 Codex 可用编辑器

检查命令：

```bash
git --version
node -v
pnpm -v
```

如果没有 pnpm：

```bash
npm install -g pnpm
```

## 3. 拉取项目

```bash
mkdir -p ~/Developer
cd ~/Developer
git clone git@github.com:littleice114514/growth-tree-os.git
cd growth-tree-os
```

如果 SSH 没配置，改用 HTTPS：

```bash
git clone https://github.com/littleice114514/growth-tree-os.git
cd growth-tree-os
```

## 4. 安装依赖

```bash
pnpm install
```

## 5. 启动项目

```bash
pnpm dev
```

## 6. MacBook 开发分支

不要直接在 main 上乱改，先建分支：

```bash
git checkout -b mac/wealth-dashboard-check
```

## 7. MacBook 提交修改

```bash
git status
git add .
git commit -m "chore: verify mac setup and wealth dashboard"
git push -u origin mac/wealth-dashboard-check
```

## 8. Windows 同步 MacBook 更新

Windows 端执行：

```bash
git fetch
git checkout main
git pull
```

如果要合并 Mac 分支：

```bash
git merge origin/mac/wealth-dashboard-check
```

## 9. 协同规则

- GitHub 是唯一代码源，不用 LocalSend 传整个项目文件夹。
- LocalSend 只传这份接力卡、GitHub 地址、临时截图或日志。
- 两台设备不要同时直接改 main。
- 每次开始开发前先 pull。
- 每次完成一个小功能就 commit。
- 一台设备改完 push，另一台设备先 pull 再继续。
- `.env`、SQLite、本地 runtime、依赖和构建产物不要提交。
