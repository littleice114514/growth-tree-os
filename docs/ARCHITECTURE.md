# ARCHITECTURE

## 五层拆分

### 1. 界面层

- `app/renderer/src/pages`
- `app/renderer/src/components`
- `app/renderer/src/features/*`

职责：

- 三栏工作区
- 顶部工具栏
- 复盘录入弹层
- 结构更新抽屉
- 成长树画布
- 节点详情栏

### 2. 事件层

由 Zustand store 协调：

- 打开/关闭复盘录入
- 保存复盘
- 打开结构更新面板
- 提交结构更新
- hover / click 节点

### 3. 业务层

主要体现在：

- `createReview`
- `submitExtraction`
- `selectNode`
- `refreshTree`

职责：

- 控制复盘保存后自动进入结构更新面板
- 控制节点新增/绑定
- 控制状态更新与证据累积

### 4. 数据层

主进程内实现：

- `app/main/db.ts`
- `app/main/seed.ts`
- `app/main/storage.ts`

职责：

- SQLite schema 初始化
- seed 首次写入
- markdown 文件落盘
- reviews / nodes / edges / node_evidence CRUD

### 5. 能力层

- `app/main/index.ts`
- `app/main/ipc.ts`
- `app/preload/index.ts`

职责：

- Electron 窗口启动
- 本地目录初始化
- preload 白名单桥接
- IPC 能力边界控制

## 数据流

1. 渲染层表单提交复盘
2. preload 调用 `reviews:create`
3. 主进程写 markdown + SQLite
4. 渲染层打开结构更新面板
5. preload 调用 `extraction:apply`
6. 主进程更新节点、证据和边
7. 返回最新树快照
8. React Flow 刷新主图
9. 点击节点后再调用 `nodes:getDetail`

## preload 暴露接口

- `reviews.create(payload)`
- `reviews.listRecent()`
- `tree.getSnapshot()`
- `nodes.getDetail(nodeId)`
- `nodes.search(query)`
- `extraction.apply(reviewId, updates[])`
- `appPaths.getDataRoot()`

## 本轮设计取舍

- SQLite 放在主进程，不让渲染层直接碰数据库
- Markdown 作为每日复盘原始副本，数据库保存结构化索引
- 先用固定主线和规则保证可验证性，不提前开放自由化编辑
