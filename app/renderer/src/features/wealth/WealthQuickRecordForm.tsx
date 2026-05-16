export type QuickEventType = 'income' | 'expense' | 'ongoing_cost'

export type FormState = {
  eventType: QuickEventType
  title: string
  amount: string
  incomeType: string
  expenseCategory: string
  cycle: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

export const defaultForm: FormState = {
  eventType: 'income',
  title: '',
  amount: '',
  incomeType: 'real_income',
  expenseCategory: '其他',
  cycle: 'monthly'
}

export const eventTypes: { key: QuickEventType; label: string }[] = [
  { key: 'income', label: '收入' },
  { key: 'expense', label: '支出' },
  { key: 'ongoing_cost', label: '持续出血' }
]

const incomeSourceOptions = [
  { value: 'real_income', label: '现实收入' },
  { value: 'passive_income', label: '睡后收入' },
  { value: 'system_income', label: '系统收入' },
  { value: 'stable_finance', label: '稳定理财' },
  { value: 'other', label: '其他收入' }
]

const expenseCategoryOptions = ['生活', '学习', '工具', '交通', '饮食', '娱乐', '其他']

const cycleOptions: { value: 'daily' | 'weekly' | 'monthly' | 'yearly'; label: string }[] = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' }
]

export type WealthQuickRecordFormProps = {
  form: FormState
  onFieldChange: (partial: Partial<FormState>) => void
  message: string
  onMessageClear: () => void
  successFeedback: string
  onSave: () => void
  onReset: () => void
}

export function WealthQuickRecordForm({
  form,
  onFieldChange,
  message,
  onMessageClear,
  successFeedback,
  onSave,
  onReset
}: WealthQuickRecordFormProps) {
  return (
    <>
      {/* Type selector */}
      <div className="mt-4 flex gap-2">
        {eventTypes.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onFieldChange({ eventType: t.key })}
            className={
              form.eventType === t.key
                ? 'flex-1 rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] py-2 text-sm font-semibold text-[color:var(--text-primary)]'
                : 'flex-1 rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs text-[color:var(--text-secondary)]">名称</span>
          <input
            value={form.title}
            onChange={(e) => {
              onFieldChange({ title: e.target.value })
              if (message) onMessageClear()
            }}
            placeholder={form.eventType === 'ongoing_cost' ? '例如：云服务订阅' : form.eventType === 'income' ? '例如：公众号收益' : '例如：午餐'}
            className="w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="text-xs text-[color:var(--text-secondary)]">金额</span>
          <input
            value={form.amount}
            onChange={(e) => {
              onFieldChange({ amount: e.target.value })
              if (message) onMessageClear()
            }}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]"
          />
        </label>

        {/* Income: source selector */}
        {form.eventType === 'income' ? (
          <div className="grid gap-1.5">
            <span className="text-xs text-[color:var(--text-secondary)]">收入来源</span>
            <div className="flex flex-wrap gap-1.5">
              {incomeSourceOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onFieldChange({ incomeType: opt.value })}
                  className={
                    form.incomeType === opt.value
                      ? 'rounded-lg border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-2.5 py-1 text-xs text-[color:var(--text-primary)]'
                      : 'rounded-lg border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2.5 py-1 text-xs text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Expense: category selector */}
        {form.eventType === 'expense' ? (
          <div className="grid gap-1.5">
            <span className="text-xs text-[color:var(--text-secondary)]">支出分类</span>
            <div className="flex flex-wrap gap-1.5">
              {expenseCategoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onFieldChange({ expenseCategory: cat })}
                  className={
                    form.expenseCategory === cat
                      ? 'rounded-lg border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-2.5 py-1 text-xs text-[color:var(--text-primary)]'
                      : 'rounded-lg border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2.5 py-1 text-xs text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Ongoing cost: cycle selector */}
        {form.eventType === 'ongoing_cost' ? (
          <div className="grid gap-1.5">
            <span className="text-xs text-[color:var(--text-secondary)]">周期</span>
            <div className="flex gap-2">
              {cycleOptions.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => onFieldChange({ cycle: c.value })}
                  className={
                    form.cycle === c.value
                      ? 'flex-1 rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] py-1.5 text-xs text-[color:var(--text-primary)]'
                      : 'flex-1 rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] py-1.5 text-xs text-[color:var(--text-muted)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onSave}
          className="flex-1 rounded-2xl bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-[color:var(--input-border)] px-4 py-2 text-sm text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)]"
        >
          重置
        </button>
      </div>

      {/* Feedback */}
      {message ? (
        <div className="mt-3 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-accent-rose">{message}</div>
      ) : null}
      {successFeedback ? (
        <div className="mt-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs text-accent-green">{successFeedback}</div>
      ) : null}
    </>
  )
}
