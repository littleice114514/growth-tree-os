# MAP_STATUS｜当前项目地图位置

更新时间：2026-05-12
定位来源：`feature/integration-time-debt-wealth` 集成现场、Time Debt merge commit `eb2cdef`、Wealth merge 当前工作区。

## 1. 当前地图位置

- 当前阶段：Integration｜Time Debt + Wealth 双模块集成验证。
- 集成基线：`develop` 已从 `origin/main @ 4df9ada` 创建并推送。
- 当前分支：`feature/integration-time-debt-wealth`。
- Time Debt：已合入，来源 `origin/feature/mac-time-debt-plan-flow-overlap-ui @ 3a74cf0`，merge commit `eb2cdef`。
- Wealth：正在合入，来源 `origin/feature/claude-wealth-baseconfig-persistence-latest @ edd4a1a`，当前处理共享文档冲突；业务文件与 ECharts 依赖已进入工作区，待命令与 UI 验证。
- 本状态只代表 integration 分支，不代表 `main` 或 `develop` 已完成集成。

## 2. 本轮集成目标

验证 Time Debt 最新成果与 Wealth 最新成果能否在同一个版本共存运行。

本轮不开发新功能，不做 Wealth 新需求，不做 Time Debt 新需求，不做 UI 大改，不合回 `develop`，不 push `main`。

## 3. 已合入 / 待验证能力

- Time Debt 已合入：计时闭环稳定化、短任务真实时长与视觉高度分离、跨天分段详情只读、Calendar UI 修复、时区入口 UI-only MVP、短任务点击误触 resize 修复。
- Wealth 待集成验证：连续透支天数、日期 / 周期查看、现金流趋势、UI-IA 重构、分类项目 chip、ECharts 现金流图表、记录搜索 / 分组、支出类型占比饼图。
- Wealth 依赖待确认保留：`echarts`、`echarts-for-react`。

## 4. 当前项目底座

- 主层级：本地产品层 + 开发协同工作流层。
- 副层级：Time Debt / Wealth 双模块并行，数据库和用户系统轻预留，可视化层 Life Vitality Tree 已进入半真实 2D 骨架。
- 当前阶段判断：Demo 可运行层基本成立，本地产品层处于多模块本地闭环收口 + 验收口径统一阶段；不是 AI/RAG、云同步、商业化或 3D 主攻阶段。

## 5. 半完成路径

- 数据库层：核心成长树数据已进 SQLite；Time Debt / Wealth 多数仍在 renderer localStorage。
- 用户系统层：`local_user` 和 `user_id` 已预留，但没有真实登录、注册、云账号或多用户切换。
- 可视化层：真实成长树与 Life Vitality Tree 可用；Obsidian Graph 仍是 mock 归档支线。
- 知识库层：复盘 Markdown、日志和 handoff 可用，但没有全文检索/RAG。
- 运维维护层：本地验证命令可用；没有 CI、lint/test 脚本和自动发布。

## 6. 当前风险

- `docs/project-state/**` 和本文件是新对话开工入口，不能被 Time Debt 或 Wealth 单分支状态直接覆盖。
- Wealth merge 完成后必须确认 `package.json` / `pnpm-lock.yaml` 保留 ECharts 依赖。
- Time Debt / Wealth 共存需要通过 `pnpm typecheck`、`pnpm build`、`pnpm smoke` 和轻量 UI smoke 验证后，才能作为统一预览分支交付。

## 7. 下一轮唯一入口

继续完成 Wealth merge 的共享文档冲突解决，然后验证：

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm smoke
pnpm dev
```

验证通过后新增 `docs/handoff/INTEGRATION_TIME_DEBT_WEALTH_NEXT_ACTION.md` 并 push `feature/integration-time-debt-wealth`。
