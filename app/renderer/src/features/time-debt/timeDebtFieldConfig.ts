export type TimeDebtFieldType =
  | 'text'
  | 'number'
  | 'percent'
  | 'select'
  | 'multi_select'
  | 'status'
  | 'datetime'
  | 'checkbox'
  | 'relation'
  | 'rollup'
  | 'formula'

export type TimeDebtFieldConfig = {
  fieldKey: string
  label: string
  type: TimeDebtFieldType
  required?: boolean
  options?: string[]
  placeholder?: string
  defaultValue?: string | number | boolean | string[]
  validation?: {
    min?: number
    max?: number
  }
}

export const timeDebtSupportedFieldTypes: TimeDebtFieldType[] = [
  'text',
  'number',
  'percent',
  'select',
  'multi_select',
  'status',
  'datetime',
  'checkbox'
]

export const timeDebtReservedFieldTypes: TimeDebtFieldType[] = ['relation', 'rollup', 'formula']

export const timeDebtFieldConfigs = {
  title: {
    fieldKey: 'title',
    label: '任务名',
    type: 'text',
    required: true,
    placeholder: '例如：整理 Time Debt 周视图'
  },
  primaryCategory: {
    fieldKey: 'primaryCategory',
    label: '一级分类',
    type: 'select',
    required: true
  },
  secondaryProject: {
    fieldKey: 'secondaryProject',
    label: '二级项目',
    type: 'select',
    required: true
  },
  startTime: {
    fieldKey: 'startTime',
    label: '开始时间',
    type: 'datetime',
    required: true
  },
  endTime: {
    fieldKey: 'endTime',
    label: '结束时间',
    type: 'datetime',
    required: true
  },
  plannedStartTime: {
    fieldKey: 'plannedStartTime',
    label: '计划开始',
    type: 'datetime',
    required: true
  },
  plannedEndTime: {
    fieldKey: 'plannedEndTime',
    label: '计划结束',
    type: 'datetime',
    required: true
  },
  statusScore: {
    fieldKey: 'statusScore',
    label: '状态分',
    type: 'number',
    validation: { min: 0, max: 100 }
  },
  aiEnableRatio: {
    fieldKey: 'aiEnableRatio',
    label: 'AI 赋能比例（%）',
    type: 'percent',
    defaultValue: 0,
    validation: { min: 0, max: 100 }
  },
  tags: {
    fieldKey: 'tags',
    label: '标签，可选',
    type: 'multi_select',
    placeholder: '用逗号分隔，例如：深度工作, UI'
  },
  distractionSource: {
    fieldKey: 'distractionSource',
    label: '干扰源，可选',
    type: 'select',
    placeholder: '例如：消息、短视频、临时插入'
  },
  note: {
    fieldKey: 'note',
    label: '备注',
    type: 'text'
  }
} satisfies Record<string, TimeDebtFieldConfig>
