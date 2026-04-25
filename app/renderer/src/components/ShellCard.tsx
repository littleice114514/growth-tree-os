import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

type ShellCardProps = PropsWithChildren<{
  className?: string
}>

export function ShellCard({ className, children }: ShellCardProps) {
  return (
    <section
      className={clsx(
        'rounded-[22px] border border-[color:var(--panel-border)] bg-[var(--panel-bg)] text-[color:var(--text-primary)] shadow-panel backdrop-blur-2xl',
        className
      )}
    >
      {children}
    </section>
  )
}
