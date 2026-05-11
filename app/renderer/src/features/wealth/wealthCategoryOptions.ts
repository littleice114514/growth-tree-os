import type { WealthRecordType } from '@shared/wealth'

export type CategoryPresetGroup = {
  field: 'source' | 'category' | 'title' | 'assetName'
  options: string[]
}

export const categoryPresets: Record<WealthRecordType, CategoryPresetGroup> = {
  real_income: {
    field: 'source',
    options: ['工资', '兼职', '接单', '临时收入', '奖学金', '补贴', '其他现实收入']
  },
  passive_income: {
    field: 'source',
    options: ['公众号', '广告收益', '内容分成', '课程/资料', '数字产品', '版权收入', '其他睡后收入']
  },
  system_income: {
    field: 'source',
    options: ['自动化收入', '项目收入', '工具收入', '系统节省', '返利', '其他系统收入']
  },
  stable_finance: {
    field: 'source',
    options: ['货币基金', '指数基金', '债券', '定投', '股息', '利息', '其他稳定理财']
  },
  real_expense: {
    field: 'category',
    options: ['饮食', '交通', '学习', '住宿', '生活用品', '医疗', '通讯', '其他真实支出']
  },
  ongoing_cost: {
    field: 'title',
    options: ['会员订阅', '软件订阅', '云服务', '手机套餐', '分期付款', '固定账单', '其他持续出血']
  },
  experience_cost: {
    field: 'category',
    options: ['奶茶咖啡', '游戏', '短视频/娱乐', '聚餐', '旅行', '冲动消费', '情绪消费', '其他体验出血']
  },
  asset_change: {
    field: 'assetName',
    options: ['现金', '储蓄', '投资', '数字资产', '设备', '应收款', '负债变化', '其他资产变化']
  }
}
