import { useMemo } from 'react'
import { mockGraphData } from './data/mockGraphData'
import { GraphCanvas } from './components/GraphCanvas'
import { GraphControls } from './components/GraphControls'
import { GraphSidePanel } from './components/GraphSidePanel'
import { useObsidianGraphStore } from './state/useObsidianGraphStore'
import { filterLinksByNodes, filterNodes } from './utils/graphFilter'
import { getLocalGraph } from './utils/graphLocalView'
import { getNodeDegree } from './utils/graphNeighbors'
import { mergeGraphPositions } from './utils/graphPositions'

export function ObsidianGraphView() {
  const searchQuery = useObsidianGraphStore((state) => state.searchQuery)
  const enabledTypes = useObsidianGraphStore((state) => state.enabledTypes)
  const mode = useObsidianGraphStore((state) => state.mode)
  const depth = useObsidianGraphStore((state) => state.depth)
  const selectedNodeId = useObsidianGraphStore((state) => state.selectedNodeId)
  const positions = useObsidianGraphStore((state) => state.positions)

  const preparedData = useMemo(() => {
    const nodesWithDegree = mockGraphData.nodes.map((node) => ({
      ...node,
      degree: getNodeDegree(node.id, mockGraphData.links)
    }))
    const filteredNodes = filterNodes(nodesWithDegree, searchQuery, enabledTypes)
    const filteredLinks = filterLinksByNodes(mockGraphData.links, filteredNodes)
    const centerNodeId =
      selectedNodeId && filteredNodes.some((node) => node.id === selectedNodeId)
        ? selectedNodeId
        : filteredNodes[0]?.id ?? null

    const graph =
      mode === 'local'
        ? getLocalGraph(filteredNodes, filteredLinks, centerNodeId, depth)
        : {
            nodes: filteredNodes,
            links: filteredLinks
          }

    return {
      nodes: mergeGraphPositions(graph.nodes, positions),
      links: graph.links
    }
  }, [depth, enabledTypes, mode, positions, searchQuery, selectedNodeId])

  return (
    <main className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_360px] gap-5">
      <div className="min-h-0">
        <GraphControls />
      </div>
      <div className="min-h-0">
        <GraphCanvas nodes={preparedData.nodes} links={preparedData.links} />
      </div>
      <div className="min-h-0">
        <GraphSidePanel nodes={preparedData.nodes} links={preparedData.links} />
      </div>
    </main>
  )
}
