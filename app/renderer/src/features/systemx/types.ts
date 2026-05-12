export type SystemXInputType =
  | 'daily_reflection'
  | 'decision'
  | 'project_log'
  | 'wealth_judgement'
  | 'study_log'
  | 'flash_idea'
  | 'reading_note'

export type SystemXSystemTag =
  | 'time_debt'
  | 'wealth'
  | 'study'
  | 'content_creation'
  | 'ai_workflow'
  | 'health'
  | 'project_development'
  | 'life_review'

export type SystemXInput = {
  id: string
  title: string
  content: string
  type: SystemXInputType
  sourceModule?: 'time_debt' | 'wealth' | 'review' | 'reading' | 'manual'
  createdAt: string
}

export type SystemXPrincipleCandidate = {
  id: string
  title: string
  statement: string
  triggerCondition: string
  useCase: string
  counterExample: string
  verificationMethod: string
  status: 'candidate' | 'active' | 'rejected'
}

export type SystemXActionCandidate = {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  effort: '5min' | '15min' | '30min' | 'deep_work'
  status: 'todo' | 'doing' | 'done' | 'dropped'
  evidence?: string
}

export type SystemXAnalysis = {
  id: string
  inputId: string
  summary: string
  facts: string[]
  patterns: string[]
  principles: SystemXPrincipleCandidate[]
  actions: SystemXActionCandidate[]
  risks: string[]
  feedbackRule: string
  systemTags: SystemXSystemTag[]
  createdAt: string
}

export type SystemXRecord = {
  input: SystemXInput
  analysis: SystemXAnalysis
}

export const systemXInputTypeLabels: Record<SystemXInputType, string> = {
  daily_reflection: '每日反思',
  decision: '决策判断',
  project_log: '项目日志',
  wealth_judgement: '财富判断',
  study_log: '学习记录',
  flash_idea: '灵感想法',
  reading_note: '阅读摘录'
}

export const systemXSystemTagLabels: Record<SystemXSystemTag, string> = {
  time_debt: '时间负债',
  wealth: '财富',
  study: '学习',
  content_creation: '内容创作',
  ai_workflow: 'AI 工作流',
  health: '健康',
  project_development: '项目开发',
  life_review: '人生复盘'
}

export const systemXInputTypes = Object.keys(systemXInputTypeLabels) as SystemXInputType[]
