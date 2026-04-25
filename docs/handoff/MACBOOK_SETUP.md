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

## 10. Wealth 记录功能同步说明

Windows 已新增 Wealth semantic recording flow。

MacBook 拉取最新代码：

```bash
cd ~/Developer/growth-tree-os
git fetch origin
git pull
pnpm install
pnpm dev
```

检查：

- Wealth 页面是否有“新增财富记录”入口。
- 是否能新增现实收入。
- 是否能新增持续出血。
- 是否能新增体验出血，并标记失控 / 多巴胺泄漏。
- 是否能新增资产变化。
- 最近记录是否显示。
- Income / Expenses / Assets / Evaluation 是否有对应变化。
- 刷新后记录是否保留。

当前保存位置：

```text
renderer localStorage: growth-tree-os:wealth-records:v1
```

本轮不接外部账户、银行卡、支付宝、微信、股票或 BTC 实时行情。

## 11. Time Debt 模块同步说明

Windows 已新增 Time Debt module baseline。

MacBook 拉取最新代码：

```bash
cd ~/Developer/growth-tree-os
git fetch origin
git pull
pnpm install
pnpm dev
```

检查：

- 是否能进入 Time Debt / 时间负债。
- 是否能看到 Overview / 总览。
- 是否能进入 Logs / 时间日志。
- 是否能新增时间日志。
- 是否能看到 Daily Stats / 日度统计。
- 是否能看到 Dashboard / Diagnosis / 仪表盘诊断。
- 刷新后日志是否保留。

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

预期：

- 持续时长为 70 min。
- 效率约为 0.24 min / 个。
- 状态加权为 490。
- AI 化加权为 0。

当前保存位置：

```text
renderer localStorage:
- growth-tree-os:time-debt-logs:v1
- growth-tree-os:time-debt-standards:v1
- growth-tree-os:time-debt-params:v1
```
