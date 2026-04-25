import type { Link, Node } from '../types'

export function getLocalGraph(nodes: Node[], links: Link[], centerNodeId: string | null, depth: number) {
  if (!centerNodeId) {
    return { nodes, links }
  }

  const allowedNodeIds = new Set(nodes.map((node) => node.id))
  const visited = new Set<string>([centerNodeId])
  let frontier = new Set<string>([centerNodeId])

  for (let layer = 0; layer < depth; layer += 1) {
    const next = new Set<string>()
    links.forEach((link) => {
      if (frontier.has(link.source) && allowedNodeIds.has(link.target) && !visited.has(link.target)) {
        next.add(link.target)
      }
      if (frontier.has(link.target) && allowedNodeIds.has(link.source) && !visited.has(link.source)) {
        next.add(link.source)
      }
    })
    next.forEach((nodeId) => visited.add(nodeId))
    frontier = next
  }

  const localNodes = nodes.filter((node) => visited.has(node.id))
  const localNodeIds = new Set(localNodes.map((node) => node.id))
  const localLinks = links.filter((link) => localNodeIds.has(link.source) && localNodeIds.has(link.target))

  return { nodes: localNodes, links: localLinks }
}
