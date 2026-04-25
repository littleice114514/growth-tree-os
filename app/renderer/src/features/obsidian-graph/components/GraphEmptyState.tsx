export function GraphEmptyState({ message = '当前过滤条件下没有可展示节点。' }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-base-950/50 p-8">
      <div className="max-w-sm text-center">
        <div className="text-xs uppercase tracking-[0.26em] text-base-500">empty graph</div>
        <div className="mt-3 text-lg font-semibold text-base-100">图谱为空</div>
        <p className="mt-3 text-sm leading-7 text-base-400">{message}</p>
      </div>
    </div>
  )
}
