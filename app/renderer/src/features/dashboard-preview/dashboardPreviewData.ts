export const timeDebtMock = {
  status: '时间透支',
  diagnosis: '今天工作时间超过标准，但净时间价值偏低，属于高消耗低回流。',
  suggestion: '明天建议把工作上限压到 6 小时，并安排 30 分钟恢复。',
  standardWorkMinutes: 480,
  actualWorkMinutes: 620,
  workMinuteDelta: 140,
  netTimeValue: -82,
  aiEnableRatio: 0.28,
  timeStructure: [
    { label: '工作', minutes: 620 },
    { label: '学习', minutes: 80 },
    { label: '生活', minutes: 120 },
    { label: '运动', minutes: 30 },
    { label: '空转', minutes: 90 }
  ],
  debtValue: 180,
  nourishmentValue: 98,
  topTasks: [
    { title: 'Codex 项目推进', duration: 240, efficiency: '正常', statusScore: 7, aiRatio: 0.65 },
    { title: '公众号文章处理', duration: 160, efficiency: '偏慢', statusScore: 6, aiRatio: 0.35 },
    { title: '无效刷信息', duration: 90, efficiency: '失控', statusScore: 3, aiRatio: 0 }
  ],
  trend7d: [20, -10, 35, -40, 12, -15, -82]
}

export const wealthMock = {
  status: '轻微透支',
  diagnosis: '今天出现少量未来钱消耗，但仍未触发系统风险。',
  suggestion: '明天优先补回节省池，不建议新增订阅或大额消费。',
  accountDelta: -46,
  incomeToday: 120,
  expenseToday: 166,
  investableSurplus: 0,
  futureMoneyUsed: 26,
  savingPoolBefore: 80,
  savingPoolAfter: 54,
  ongoingCostToday: 30,
  passiveIncomeToday: 8,
  supportCoverage: 0.18,
  laborDependency: 0.82,
  upgradeGate: '暂缓',
  cashFlowQuality: [
    { label: '现实收入', value: 100 },
    { label: '睡后收入', value: 8 },
    { label: '系统收入', value: 12 },
    { label: '真实支出', value: 86 },
    { label: '持续出血', value: 30 },
    { label: '体验出血', value: 50 }
  ]
}

export const lifeDashboardMock = {
  systemStatus: '系统变重',
  timeAxis: '时间透支',
  wealthAxis: '轻微透支',
  coreContradiction: '今天投入了大量时间，但财富自由度没有明显增长，系统处于高消耗低回流状态。',
  nextAction: '明天减少低回流工作时长，优先补回节省池，并安排恢复窗口。'
}
