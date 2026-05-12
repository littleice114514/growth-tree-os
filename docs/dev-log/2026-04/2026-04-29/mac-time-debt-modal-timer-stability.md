# 开发日志｜Mac｜Time Debt Modal 与计时稳定性修复｜2026-04-29

## 1. 本轮目标

修复 Time Debt 真实使用前的三项稳定性问题：表单重复分类字段、Time Entry Modal 打开后页面底部出现大块空白、开始计时后切换页面导致计时状态丢失。

## 2. 当前分支

`feature/mac-time-debt-plan-flow-overlap-ui`

## 3. 修改文件

- `app/renderer/src/components/Toolbar.tsx`
- `app/renderer/src/features/time-debt/TimeDebtDashboard.tsx`
- `app/renderer/src/features/time-debt/timeDebtActiveTimerStorage.ts`
- `docs/dev-log/2026-04/2026-04-29/mac-time-debt-modal-timer-stability.md`
- `docs/handoff/MAC_NEXT_ACTION.md`

## 4. 未修改区域

- 未修改 3D 模块。
- 未修改 Windows 端 skills、`.codex/`、`.claude/`。
- 未修改脚本、工具链和 `docs/dev-protocol/**`。
- 未修改财富、成长树、周回看业务逻辑。
- 本轮属于 Mac 默认 UI / 交互 / 页面体验范围，未触及跨边界修改。

## 5. 修复的 bug

- Time Entry 弹窗不再同时显示组合分类、一级分类、二级项目三套入口。
- 分类入口统一为 `分类项目`，选项展示为 `工作 · growth-tree-os` 一类用户可读文案，保存时仍拆回 `primaryCategory / secondaryProject`。
- 工作量单位从可联想输入改为固定下拉：分钟、小时、项、次、页、题，避免异常浮层。
- Modal 外层固定覆盖视窗并锁定 body 滚动，内容超过高度时只在 Modal 内部滚动，避免背景页面被撑出大块空白。
- active timer 不再只存在于 Time Debt 页面局部 state，切换到其他页面后仍能恢复。

## 6. activeTimer 保存与恢复方式

- 新增 localStorage key：`growth-tree-os:time-debt:active-timer`。
- 开始计时时写入 active timer，包含任务名、分类项目、真实开始时间、计划来源、原计划时间段、建议结束时间等字段。
- Time Debt 页面初始化时读取 active timer；如果状态为 active，则恢复 `runningTimer`，elapsed 按真实开始时间继续计算。
- 结束计时时生成 Completed 日志并清除 active timer。
- Toolbar 读取同一份 active timer，显示轻量全局计时提示；点击提示可回到 Time Debt。

## 7. Modal 空白问题修复方式

- Modal overlay 使用 `fixed inset-0 overflow-hidden`，不进入页面文档流。
- Modal 内容使用 `max-h-[85vh] overflow-auto`，内容超出时只滚动弹窗内部。
- Modal 挂载时设置 `document.body.style.overflow = 'hidden'`，卸载时恢复原值。

## 8. 分类字段简化方式

- `CategorySelect` 标签改为 `分类项目`。
- 选项显示从 `工作::growth-tree-os` 改为 `工作 · growth-tree-os`。
- 删除补记、计时、规划弹窗里的重复 `一级分类` 和 `二级项目` 输入框。

## 9. 验收命令

```bash
PATH="/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/tsc --noEmit -p tsconfig.node.json
PATH="/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/tsc --noEmit -p app/renderer/tsconfig.json
PATH="/Users/ice/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/electron-vite build
```

## 10. 验收结果

- TypeScript node 配置检查通过。
- TypeScript renderer 配置检查通过。
- Electron Vite build 通过。
- 已在运行中的 Electron dev app 中观察到 Time Debt 页面可正常渲染；真实完整点击流仍建议按 handoff 继续截图验收。

## 11. 风险与遗留问题

- active timer 使用 localStorage，是单机本地持久化，不做跨设备同步。
- 本轮没有拆分 `TimeDebtDashboard.tsx`，后续可在功能稳定后再组件化。
- 如果用户在多个窗口同时操作同一 localStorage 状态，当前只做轻量同步提示，不做复杂冲突处理。

## 12. 下一步建议

优先执行真实桌面验收：打开补记/规划/计时弹窗确认字段去重，开始计时后切换提醒、成长树、财富、周回看再返回 Time Debt，确认计时继续累计；结束计时后确认 Completed 日志生成且 Toolbar 提示消失。
