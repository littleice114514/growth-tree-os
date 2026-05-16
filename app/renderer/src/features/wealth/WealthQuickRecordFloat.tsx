import { useEffect, useState } from 'react'
import type { WealthRecord, WealthRecordType } from '@shared/wealth'
import { wealthRecordTypeLabels } from '@shared/wealth'
import { appendWealthRecord } from './wealthStorage'

type QuickEventType = 'income' | 'expense' | 'ongoing_cost'

const eventTypes: { key: QuickEventType; label: string }[] = [
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

const today = new Date().toISOString().slice(0, 10)

type FormState = {
  eventType: QuickEventType
  title: string
  amount: string
  incomeType: string
  expenseCategory: string
  cycle: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

const defaultForm: FormState = {
  eventType: 'income',
  title: '',
  amount: '',
  incomeType: 'real_income',
  expenseCategory: '其他',
  cycle: 'monthly'
}

const floatUiStorageKey = 'growth-tree-os:wealth-quick-float-ui:v1'

export function WealthQuickRecordFloat() {
  const [isOpen, setIsOpen] = useState(() => loadIsOpen())
  const [form, setForm] = useState<FormState>(defaultForm)
  const [message, setMessage] = useState('')
  const [successFeedback, setSuccessFeedback] = useState('')

  useEffect(() => {
    saveIsOpen(isOpen)
  }, [isOpen])

  useEffect(() => {
    return window.growthTree.wealth.onOpenQuickFloat(() => {
      setIsOpen((prev) => !prev)
    })
  }, [])

  const patch = (partial: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...partial }))
    if (message) setMessage('')
  }

  const handleSave = () => {
    const title = form.title.trim()
    const amount = Number(form.amount)

    if (!title) {
      setMessage('名称不能为空')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage('金额必须大于 0')
      return
    }
    if (form.eventType === 'ongoing_cost' && !form.cycle) {
      setMessage('持续出血必须选择周期')
      return
    }

    const timestamp = new Date().toISOString()
    let record: WealthRecord

    if (form.eventType === 'income') {
      const mappedType: WealthRecordType = form.incomeType === 'other' ? 'real_income' : (form.incomeType as WealthRecordType)
      record = {
        id: `wealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: today,
        type: mappedType,
        amount,
        title,
        source: form.incomeType === 'other' ? '其他收入' : undefined,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    } else if (form.eventType === 'expense') {
      record = {
        id: `wealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: today,
        type: 'real_expense',
        amount,
        title,
        category: form.expenseCategory,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    } else {
      record = {
        id: `wealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: today,
        type: 'ongoing_cost',
        amount,
        title,
        meta: { cycle: form.cycle },
        createdAt: timestamp,
        updatedAt: timestamp
      }
    }

    appendWealthRecord(record)

    const typeLabel = eventTypes.find((t) => t.key === form.eventType)?.label ?? ''
    const amountStr = `¥${Math.round(amount)}`
    setSuccessFeedback(`已记录：${typeLabel} · ${title} · ${amountStr}`)
    setForm((current) => ({ ...defaultForm, eventType: current.eventType }))
    setMessage('')
  }

  const resetForm = () => {
    setForm(defaultForm)
    setMessage('')
    setSuccessFeedback('')
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-40px)] flex-col items-end gap-3 text-[color:var(--text-primary)]">
      {isOpen ? (
        <section className="max-h-[min(560px,calc(100vh-96px))] w-[340px] max-w-full overflow-y-auto rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--overlay-bg)] p-4 shadow-panel backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Wealth</div>
              <h2 className="mt-1 text-base font-semibold">快速记录财富事件</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-2.5 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]"
            >
              收起
            </button>
          </div>

          {/* Type selector */}
          <div className="mt-4 flex gap-2">
            {eventTypes.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => patch({ eventType: t.key })}
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
                onChange={(e) => patch({ title: e.target.value })}
                placeholder={form.eventType === 'ongoing_cost' ? '例如：云服务订阅' : form.eventType === 'income' ? '例如：公众号收益' : '例如：午餐'}
                className="w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]"
              />
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="text-xs text-[color:var(--text-secondary)]">金额</span>
              <input
                value={form.amount}
                onChange={(e) => patch({ amount: e.target.value })}
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
                      onClick={() => patch({ incomeType: opt.value })}
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
                      onClick={() => patch({ expenseCategory: cat })}
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
                      onClick={() => patch({ cycle: c.value })}
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
              onClick={handleSave}
              className="flex-1 rounded-2xl bg-[var(--button-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--button-text)] transition hover:bg-[var(--button-hover)]"
            >
              保存
            </button>
            <button
              type="button"
              onClick={resetForm}
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
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="max-w-[min(260px,calc(100vw-40px))] rounded-full border border-emerald-400/30 bg-emerald-400/95 px-5 py-3 text-sm font-semibold text-slate-950 shadow-panel transition hover:bg-emerald-300"
      >
        记一笔
      </button>
    </div>
  )
}

function loadIsOpen(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(floatUiStorageKey)
    if (!raw) return false
    const parsed = JSON.parse(raw) as Partial<{ isOpen: boolean }>
    return Boolean(parsed.isOpen)
  } catch {
    return false
  }
}

function saveIsOpen(isOpen: boolean): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(floatUiStorageKey, JSON.stringify({ isOpen }))
}
