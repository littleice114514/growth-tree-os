import { useMemo, useState } from 'react'

export type SmartOptionInputProps = {
  label: string
  value: string
  options: string[]
  placeholder?: string
  onChange: (value: string) => void
  onCreateOption?: (value: string) => void
}

const inputClass =
  'w-full rounded-2xl border border-[color:var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[color:var(--text-primary)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--node-selected-border)] focus:bg-[var(--control-hover)]'

export function SmartOptionInput({ label, value, options, placeholder, onChange, onCreateOption }: SmartOptionInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const normalizedValue = value.trim().toLowerCase()
  const filteredOptions = useMemo(() => {
    const uniqueOptions = Array.from(new Set(options.map((option) => option.trim()).filter(Boolean)))
    if (!normalizedValue) {
      return uniqueOptions
    }
    return uniqueOptions.filter((option) => option.toLowerCase().includes(normalizedValue))
  }, [normalizedValue, options])
  const canCreate = Boolean(value.trim()) && !options.some((option) => option.trim().toLowerCase() === normalizedValue)

  return (
    <label className="relative block">
      <span className="text-xs text-[color:var(--text-muted)]">{label}</span>
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
        placeholder={placeholder}
        className={`mt-2 ${inputClass}`}
      />
      {isOpen ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-48 overflow-auto rounded-2xl border border-[color:var(--panel-border)] bg-[var(--panel-bg-strong)] p-2 shadow-lg">
          {filteredOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(option)
                    setIsOpen(false)
                  }}
                  className={
                    option === value
                      ? 'rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-1.5 text-xs text-[color:var(--text-primary)]'
                      : 'rounded-xl border border-[color:var(--input-border)] bg-[var(--control-bg)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)] transition hover:bg-[var(--control-hover)] hover:text-[color:var(--text-primary)]'
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[color:var(--panel-border)] px-3 py-2 text-xs text-[color:var(--text-muted)]">暂无候选，可直接输入新值</div>
          )}
          {canCreate && onCreateOption ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onCreateOption(value.trim())
                setIsOpen(false)
              }}
              className="mt-2 w-full rounded-xl border border-[color:var(--node-selected-border)] bg-[var(--control-hover)] px-3 py-2 text-left text-xs text-[color:var(--text-primary)]"
            >
              新建并复用：{value.trim()}
            </button>
          ) : null}
        </div>
      ) : null}
    </label>
  )
}
