# LOG_INDEX｜开发日志压缩索引

本文件只做索引，不替代原始日志。需要细节时再按路径读取对应日志。

- 2026-05-12｜Mac｜SystemX MVP｜新增 SystemX 系统感知模块：主导航入口、手动输入、mock sense engine、localStorage 保存、历史回看；补齐 ECharts 依赖后 `pnpm typecheck`、`pnpm build` 通过｜影响本地产品层。
- 2026-05-12｜Integration｜Time Debt + Wealth｜develop 已从 `origin/main @ 4df9ada` 创建并推送，`feature/integration-time-debt-wealth` 已创建；Time Debt 已合入，merge commit `eb2cdef`；Wealth merge 发生共享文档冲突，正在处理；待命令与 UI 验证。
- 2026-05-10｜受控业务开发第一轮闭环验证｜Codex Time Debt commit 0c35ad9；Claude Wealth commit abef583；并行边界、GitHub Sync Gate、handoff 接续有效；下一步补验 Time Debt Mac UI smoke。
- 2026-05-06｜Mac｜Time Debt / Wealth localStorage Account Namespace｜为 Time Debt / Wealth localStorage 补账户命名空间；`pnpm typecheck` 和 `pnpm smoke` 通过｜影响数据层轻预留。
- 2026-05-06｜Mac｜M12.1 Startup Env Fix｜恢复 pnpm、重装依赖、定位 Rollup 签名问题；`pnpm typecheck` 通过｜影响运维维护层。
- 2026-05-06｜Mac｜Account Foundation Validation｜补齐 `user_id` 查询/写入过滤验证；SQLite smoke 通过，真实页面 smoke 待补｜影响数据库层/用户系统层。
- 2026-05-06｜Mac｜Account Foundation｜新增 `local_user`、`user_id` 预留和幂等迁移；TypeScript/SQLite smoke 通过，build/dev 受环境阻塞｜影响数据库层/用户系统层。
- 2026-04-30｜Mac｜Time Debt Calendar Interaction Stability｜修复详情持续显示、非当天事件、拖拽落位、重叠布局；dev/browser smoke 通过｜影响本地产品层。
- 2026-04-30｜Mac｜Time Debt Calendar UI Density｜优化日历密度和详情字段；typecheck/build/浏览器 smoke 通过｜影响本地产品层。
- 2026-04-30｜Mac｜Time Debt Calendar View V1｜新增日/周/月/自定义天数、时间刻度、定位和重叠算法；部分验证受环境阻塞｜影响本地产品层。
- 2026-04-29｜Mac｜Reminder x Time Debt｜计划任务接入 Reminder，支持跳转、计时、延后、补记、归档；build 通过｜影响本地产品层。
- 2026-04-29｜Mac｜Time Debt Modal/Timer Stability｜修复重复分类、Modal 空白、计时状态丢失；build 通过｜影响本地产品层。
- 2026-04-29｜Mac｜Time Debt Fields + Weekly Calendar｜新增字段配置与周视图；tsc 通过，build 受环境阻塞｜影响本地产品层。
- 2026-04-29｜Mac｜Time Debt Form/Plan/Stats/Calendar Fix｜修复表单、计划限制、动态统计、日历问题；tsc 通过，build 受 Rollup 签名阻塞｜影响本地产品层。
- 2026-04-29｜Mac｜Time Debt Plan Flow｜优化计划流、重叠时间块和状态流；typecheck/build 通过，真实桌面验收待补｜影响本地产品层。
- 2026-04-29｜Mac｜Time Debt Today UI｜重构今日时间操作中心，新增开始计时/补记/规划入口；build 通过，真实点击未验收｜影响本地产品层。
- 2026-04-29｜Windows｜flexible-ownership-rules｜新增/确认双端弹性 ownership 协议；`git diff --check` 通过｜影响开发协同工作流层。
- 2026-04-29｜Mac｜flexible-ownership-check｜确认弹性分工、跨边界规则和 3D 协同摘要｜影响开发协同工作流层。
- 2026-04-29｜Mac｜protocol-check｜确认 Mac 后续开发规则、日志规则和禁止事项；发现 HEAD 记录差异｜影响开发协同工作流层。
