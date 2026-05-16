import { useEffect, useState } from 'react'
import type { WealthRecord, WealthRecordType } from '@shared/wealth'
import { appendWealthRecord } from './wealthStorage'
import {
  WealthQuickRecordForm,
  defaultForm,
  eventTypes,
  type FormState,
  type QuickEventType
} from './WealthQuickRecordForm'

const today = (() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})()

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

          <WealthQuickRecordForm
            form={form}
            onFieldChange={patch}
            message={message}
            onMessageClear={() => setMessage('')}
            successFeedback={successFeedback}
            onSave={handleSave}
            onReset={resetForm}
          />
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
