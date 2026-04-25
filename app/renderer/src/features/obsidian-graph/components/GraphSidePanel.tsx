import dayjs from 'dayjs'
import type { Link, Node } from '../types'
import { getNeighborIds } from '../utils/graphNeighbors'
import { linkTypeMeta, nodeTypeMeta } from '../utils/graphStyle'
import { useObsidianGraphStore } from '../state/useObsidianGraphStore'

export function GraphSidePanel({ nodes, links }: { nodes: Node[]; links: Link[] }) {
  const selectedNodeId = useObsidianGraphStore((state) => state.selectedNodeId)
  const setSelectedNodeId = useObsidianGraphStore((state) => state.setSelectedNodeId)
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null

  if (!selectedNode) {
    return (
      <aside className="flex h-full min-h-0 flex-col justify-center rounded-3xl border border-white/8 bg-base-900/80 p-6">
        <div className="text-xs uppercase tracking-[0.24em] text-base-500">graph node</div>
        <h2 className="mt-2 text-lg font-semibold text-base-100">节点详情</h2>
        <p className="mt-4 text-sm leading-7 text-base-400">点击图谱中的任意节点，这里会展示 mock 节点信息与相邻节点。</p>
      </aside>
    )
  }

  const neighbors = Array.from(getNeighborIds(selectedNode.id, links))
    .map((nodeId) => nodes.find((node) => node.id === nodeId))
    .filter((node): node is Node => Boolean(node))
  const relatedLinks = links.filter((link) => link.source === selectedNode.id || link.target === selectedNode.id)

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/8 bg-base-900/80 p-6">
      <div className="text-xs uppercase tracking-[0.24em] text-base-500">graph node</div>
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-base-100">{selectedNode.label}</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span
              className="rounded-full border px-3 py-1"
              style={{
                borderColor: nodeTypeMeta[selectedNode.type].color,
                color: nodeTypeMeta[selectedNode.type].color
              }}
            >
              {nodeTypeMeta[selectedNode.type].label}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-base-300">degree {selectedNode.degree ?? relatedLinks.length}</span>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 text-sm">
        <InfoRow label="id" value={selectedNode.id} />
        <InfoRow label="createdAt" value={formatTime(selectedNode.createdAt)} />
        <InfoRow label="updatedAt" value={formatTime(selectedNode.updatedAt)} />
        <InfoRow label="neighbors" value={`${neighbors.length}`} />
      </dl>

      <div className="mt-6">
        <div className="text-sm font-medium text-base-200">关联边类型</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {relatedLinks.map((link, index) => (
            <span key={`${link.source}-${link.target}-${index}`} className="rounded-full border border-white/10 px-3 py-2 text-xs text-base-300">
              {linkTypeMeta[link.type].label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 min-h-0 flex-1 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-base-200">1-hop 邻居</div>
          <div className="text-xs text-base-500">{neighbors.length} nodes</div>
        </div>
        <div className="mt-3 space-y-3 pr-1">
          {neighbors.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNodeId(node.id)}
              className="block w-full rounded-2xl border border-white/8 bg-base-850/60 px-4 py-4 text-left transition hover:border-white/14"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-base-100">{node.label}</div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-base-300">{node.type}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-base-850/55 px-4 py-3">
      <dt className="text-base-500">{label}</dt>
      <dd className="max-w-44 truncate text-base-100">{value}</dd>
    </div>
  )
}

function formatTime(value?: string) {
  return value ? dayjs(value).format('YYYY/MM/DD HH:mm') : '-'
}
