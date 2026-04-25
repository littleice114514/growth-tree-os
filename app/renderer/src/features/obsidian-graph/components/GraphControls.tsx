import clsx from 'clsx'
import { useObsidianGraphStore } from '../state/useObsidianGraphStore'
import { nodeTypeMeta } from '../utils/graphStyle'
import type { ObsidianGraphNodeType } from '../types'

const nodeTypes: ObsidianGraphNodeType[] = ['note', 'tag', 'daily', 'project']

export function GraphControls() {
  const searchQuery = useObsidianGraphStore((state) => state.searchQuery)
  const setSearchQuery = useObsidianGraphStore((state) => state.setSearchQuery)
  const mode = useObsidianGraphStore((state) => state.mode)
  const setMode = useObsidianGraphStore((state) => state.setMode)
  const depth = useObsidianGraphStore((state) => state.depth)
  const setDepth = useObsidianGraphStore((state) => state.setDepth)
  const showArrows = useObsidianGraphStore((state) => state.showArrows)
  const setShowArrows = useObsidianGraphStore((state) => state.setShowArrows)
  const nodeSize = useObsidianGraphStore((state) => state.nodeSize)
  const setNodeSize = useObsidianGraphStore((state) => state.setNodeSize)
  const linkDistance = useObsidianGraphStore((state) => state.linkDistance)
  const setLinkDistance = useObsidianGraphStore((state) => state.setLinkDistance)
  const repelForce = useObsidianGraphStore((state) => state.repelForce)
  const setRepelForce = useObsidianGraphStore((state) => state.setRepelForce)
  const enabledTypes = useObsidianGraphStore((state) => state.enabledTypes)
  const toggleType = useObsidianGraphStore((state) => state.toggleType)

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-auto rounded-3xl border border-white/8 bg-base-900/80 p-5">
      <div>
        <div className="text-xs uppercase tracking-[0.26em] text-base-500">obsidian graph</div>
        <h2 className="mt-2 text-lg font-semibold text-base-100">图谱 V1 控制台</h2>
        <p className="mt-3 text-sm leading-6 text-base-400">mock 数据原型，只验证交互语言，不接数据库。</p>
      </div>

      <label className="mt-6 block text-sm text-base-300">
        <span className="text-xs uppercase tracking-[0.18em] text-base-500">搜索节点标题</span>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="例如：复盘 / Graph / Daily"
          className="mt-3 w-full rounded-2xl border border-white/10 bg-base-950/70 px-4 py-3 text-base-100 outline-none placeholder:text-base-500"
        />
      </label>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-[0.18em] text-base-500">图谱范围</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            ['global', '全局图'],
            ['local', '局部图']
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value as 'global' | 'local')}
              className={
                mode === value
                  ? 'rounded-2xl border border-accent-cyan/30 bg-accent-cyan/15 px-4 py-3 text-sm text-base-100'
                  : 'rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-base-400'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/8 bg-base-950/45 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-base-400">局部图 depth</span>
          <span className="text-base-100">{depth}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((value) => (
            <button
              key={value}
              type="button"
              disabled={mode !== 'local'}
              onClick={() => setDepth(value as 1 | 2 | 3)}
              className={
                depth === value
                  ? 'rounded-xl border border-accent-cyan/30 bg-accent-cyan/15 px-3 py-2 text-sm text-base-100 disabled:opacity-40'
                  : 'rounded-xl border border-white/8 px-3 py-2 text-sm text-base-400 disabled:opacity-40'
              }
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-[0.18em] text-base-500">类型过滤 / 着色</div>
        <div className="mt-3 space-y-2">
          {nodeTypes.map((type) => {
            const enabled = enabledTypes.includes(type)
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={clsx(
                  'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left',
                  enabled ? 'border-white/12 bg-white/5 text-base-100' : 'border-white/6 text-base-500'
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: nodeTypeMeta[type].color }}
                  />
                  <span className="text-sm">{nodeTypeMeta[type].label}</span>
                </span>
                <span className="text-xs text-base-500">{type}</span>
              </button>
            )
          })}
        </div>
      </div>

      <label className="mt-6 flex items-center justify-between rounded-2xl border border-white/8 bg-base-950/35 px-4 py-3 text-sm opacity-75">
        <span>
          <span className="block text-base-400">可选：显示方向提示</span>
          <span className="mt-1 block text-xs text-base-600">默认关闭，主体验保持无向关系网。</span>
        </span>
        <input
          type="checkbox"
          checked={showArrows}
          onChange={(event) => setShowArrows(event.target.checked)}
        />
      </label>

      <Slider label="nodeSize" value={nodeSize} min={4} max={7} step={1} onChange={setNodeSize} />
      <Slider label="linkDistance" value={linkDistance} min={64} max={124} step={4} onChange={setLinkDistance} />
      <Slider label="repelForce" value={repelForce} min={-180} max={-60} step={10} onChange={setRepelForce} />
    </aside>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}) {
  return (
    <label className="mt-5 block rounded-2xl border border-white/8 bg-base-950/45 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-base-400">{label}</span>
        <span className="text-base-100">{value}</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-cyan"
      />
    </label>
  )
}
