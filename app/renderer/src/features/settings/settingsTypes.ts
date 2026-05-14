export type DefaultModule = 'time-debt' | 'wealth' | 'review' | 'reminders' | 'daily-review'
export type AppearanceMode = 'system' | 'light' | 'dark'
export type AppLanguage = 'zh-CN' | 'en-US'
export type MinimumRecordMinutes = 5 | 15 | 30
export type RoundingMode = 'none' | 'ceil-to-minimum' | 'nearest'
export type FloatingDefaultState = 'collapsed' | 'expanded'
export type DefaultCurrency = 'CNY' | 'USD' | 'HKD'
export type SafetyLineMonths = 3 | 6 | 12

export type AppSettings = {
  general: {
    defaultModule: DefaultModule
    appearance: AppearanceMode
    language: AppLanguage
  }
  shortcuts: {
    timeDebtQuickFloatEnabled: boolean
    timeDebtQuickFloatShortcut: string
    timeDebtQuickFloatFallback: string
  }
  timeDebt: {
    minimumRecordMinutes: MinimumRecordMinutes
    roundingMode: RoundingMode
    floatingDefaultState: FloatingDefaultState
  }
  wealth: {
    defaultCurrency: DefaultCurrency
    safetyLineMonths: SafetyLineMonths
  }
  modules: {
    enabledModules: string[]
    showExperimentalModules: boolean
  }
}
