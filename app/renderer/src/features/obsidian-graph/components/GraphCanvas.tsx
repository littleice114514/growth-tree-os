import { useEffect, useMemo, useRef } from 'react'
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d'
import type { ForceGraphData, ForceGraphLink, ForceGraphNode, Link } from '../types'
import { useObsidianGraphStore } from '../state/useObsidianGraphStore'
import { getHighlightIds, getNodeId } from '../utils/graphNeighbors'
import { captureGraphPositions, toNodePosition } from '../utils/graphPositions'
import { getLabelOpacity, getLinkColor, getLinkWidth, getNodeColor, getNodeOpacity } from '../utils/graphStyle'
import { GraphEmptyState } from './GraphEmptyState'

type D3Force = {
  distance?: (value: number) => D3Force
  iterations?: (value: number) => D3Force
  strength?: (value: number) => D3Force
}

export function GraphCanvas({ nodes, links }: { nodes: ForceGraphNode[]; links: Link[] }) {
  const graphRef = useRef<ForceGraphMethods<ForceGraphNode, ForceGraphLink> | undefined>(undefined)
  const hasFitInitialViewRef = useRef(false)
  const selectedNodeId = useObsidianGraphStore((state) => state.selectedNodeId)
  const setSelectedNodeId = useObsidianGraphStore((state) => state.setSelectedNodeId)
  const hoveredNodeId = useObsidianGraphStore((state) => state.hoveredNodeId)
  const setHoveredNodeId = useObsidianGraphStore((state) => state.setHoveredNodeId)
  const draggingNodeId = useObsidianGraphStore((state) => state.draggingNodeId)
  const isDragging = useObsidianGraphStore((state) => state.isDragging)
  const isViewportLocked = useObsidianGraphStore((state) => state.isViewportLocked)
  const startDragging = useObsidianGraphStore((state) => state.startDragging)
  const endDragging = useObsidianGraphStore((state) => state.endDragging)
  const setNodePosition = useObsidianGraphStore((state) => state.setNodePosition)
  const setManyNodePositions = useObsidianGraphStore((state) => state.setManyNodePositions)
  const showArrows = useObsidianGraphStore((state) => state.showArrows)
  const nodeSize = useObsidianGraphStore((state) => state.nodeSize)
  const linkDistance = useObsidianGraphStore((state) => state.linkDistance)
  const repelForce = useObsidianGraphStore((state) => state.repelForce)
  const activeNodeId = draggingNodeId ?? hoveredNodeId ?? selectedNodeId
  const highlightIds = useMemo(() => getHighlightIds(activeNodeId, links), [activeNodeId, links])
  const hasFocus = Boolean(activeNodeId)

  const graphData = useMemo<ForceGraphData>(
    () => ({
      nodes: nodes.map((node) => ({ ...node })),
      links: links.map((link) => ({ ...link }))
    }),
    [links, nodes]
  )

  useEffect(() => {
    const graph = graphRef.current
    if (!graph) {
      return
    }

    ;(graph.d3Force('link') as D3Force | undefined)?.distance?.(linkDistance)
    ;(graph.d3Force('link') as D3Force | undefined)?.strength?.(0.18)
    ;(graph.d3Force('link') as D3Force | undefined)?.iterations?.(1)
    ;(graph.d3Force('charge') as D3Force | undefined)?.strength?.(repelForce)
    if (!useObsidianGraphStore.getState().isDragging) {
      graph.d3ReheatSimulation()
    }
  }, [linkDistance, repelForce])

  useEffect(() => {
    const graph = graphRef.current
    if (!graph || hasFitInitialViewRef.current || nodes.length === 0 || isViewportLocked) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      if (!useObsidianGraphStore.getState().isViewportLocked) {
        graph.zoomToFit(240, 64)
        hasFitInitialViewRef.current = true
      }
    }, 320)

    return () => window.clearTimeout(timeoutId)
  }, [isViewportLocked, nodes.length])

  if (nodes.length === 0) {
    return <GraphEmptyState />
  }

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-white/8 bg-[#080d13]">
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(125,211,252,0.10),transparent_34%),radial-gradient(circle_at_76%_62%,rgba(134,239,172,0.08),transparent_30%)]" />
      <div className="absolute left-5 top-5 z-20 rounded-full border border-white/10 bg-base-950/70 px-3 py-1 text-xs text-base-300 backdrop-blur">
        {nodes.length} nodes / {links.length} links
      </div>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        backgroundColor="rgba(8, 13, 19, 0)"
        nodeRelSize={nodeSize}
        nodeVal={() => 1}
        nodeLabel={(node) => node.label}
        nodePointerAreaPaint={(node, color, ctx) => {
          const hitRadius = Math.max(12, nodeSize + 8)
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(node.x ?? 0, node.y ?? 0, hitRadius, 0, 2 * Math.PI, false)
          ctx.fill()
        }}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label
          const fontSize = Math.max(7.5, Math.min(13, 11.5 / globalScale))
          const radius = Math.max(3, nodeSize)
          const opacity = getNodeOpacity(node, highlightIds, hasFocus)
          const labelOpacity = getLabelOpacity(node, highlightIds, hasFocus)
          ctx.save()
          ctx.globalAlpha = opacity
          ctx.beginPath()
          ctx.arc(node.x ?? 0, node.y ?? 0, radius + 3, 0, 2 * Math.PI, false)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false)
          ctx.fillStyle = getNodeColor(node, highlightIds, hasFocus)
          ctx.fill()
          if (node.id === selectedNodeId || node.id === hoveredNodeId || node.id === draggingNodeId) {
            ctx.lineWidth = 1.8 / globalScale
            ctx.strokeStyle = 'rgba(237, 242, 247, 0.86)'
            ctx.stroke()
          }
          ctx.font = `${node.id === activeNodeId ? 600 : 500} ${fontSize}px Segoe UI`
          ctx.fillStyle = `rgba(229, 235, 244, ${labelOpacity})`
          ctx.fillText(label, (node.x ?? 0) + radius + 5, (node.y ?? 0) + fontSize / 3)
          ctx.restore()
        }}
        linkColor={(link) =>
          getLinkColor(
            {
              source: getNodeId(link.source),
              target: getNodeId(link.target),
              type: link.type
            },
            highlightIds,
            hasFocus
          )
        }
        linkWidth={(link) =>
          getLinkWidth(
            {
              source: getNodeId(link.source),
              target: getNodeId(link.target),
              type: link.type
            },
            highlightIds,
            hasFocus
          )
        }
        linkDirectionalArrowLength={showArrows ? 4 : 0}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={(link) => {
          if (!showArrows) {
            return 0
          }
          const source = getNodeId(link.source)
          const target = getNodeId(link.target)
          return highlightIds.has(source) && highlightIds.has(target) ? 1 : 0
        }}
        linkDirectionalParticleWidth={1.5}
        d3VelocityDecay={0.78}
        d3AlphaDecay={0.06}
        d3AlphaMin={0.018}
        warmupTicks={40}
        cooldownTicks={38}
        cooldownTime={2400}
        enableZoomInteraction={() => !useObsidianGraphStore.getState().isViewportLocked}
        enablePanInteraction={() => !useObsidianGraphStore.getState().isViewportLocked}
        onNodeHover={(node) => {
          if (isDragging) {
            return
          }
          setHoveredNodeId(node?.id ?? null)
        }}
        onNodeClick={(node) => setSelectedNodeId(node.id)}
        onNodeDrag={(node) => {
          if (!isDragging) {
            startDragging(node.id)
          }
          node.fx = node.x
          node.fy = node.y
          const position = toNodePosition(node, true)
          if (position) {
            setNodePosition(node.id, position)
          }
        }}
        onNodeDragEnd={(node) => {
          setSelectedNodeId(node.id)
          node.fx = node.x
          node.fy = node.y
          const position = toNodePosition(node, true)
          if (position) {
            setNodePosition(node.id, position)
          }
          endDragging()
        }}
        onEngineStop={() => {
          if (!useObsidianGraphStore.getState().isDragging) {
            setManyNodePositions(captureGraphPositions(graphData.nodes))
          }
        }}
      />
    </div>
  )
}
