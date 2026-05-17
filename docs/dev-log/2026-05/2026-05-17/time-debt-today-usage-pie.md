# Time Debt 今日时间使用饼图

## 本轮目标

- 在 Time Debt 首页加入今日时间使用饼图。
- 展示今日时间按一级分类的占比，并包含空白时间。

## 实现记录

- 使用现有 `echarts` 和 `echarts-for-react`，未安装新依赖，未修改 `package.json`。
- 新增 `TimeDebtTodayUsagePie` 组件。
- 分类固定为：工作 / 学习 / 休息 / 生活 / 其他 / 空白。
- 老记录缺分类或未知分类 fallback 到 `其他`。
- 空白时间 = 今天已过去分钟数 - 今日 logs 总时长，最小值为 0。
- 复用现有 Time Debt logs state 和 `timeDebtLogsChangeEvent` 刷新链路。

## 验收记录

- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- 真实 Electron smoke：通过。
- Time Debt 首页可见 `今日时间使用` ECharts 饼图。
- 分类包含：工作 / 学习 / 休息 / 生活 / 其他 / 空白。
- 用浮窗记录 `饼图测试 / 学习` 后，学习分类从 1 min 刷新为 2 min。
