import type { Link, Node, ObsidianGraphNodeType } from '../types'

export function filterNodes(nodes: Node[], searchQuery: string, enabledTypes: ObsidianGraphNodeType[]) {
  const keyword = searchQuery.trim().toLowerCase()
  return nodes.filter((node) => {
    const typeMatch = enabledTypes.includes(node.type)
    const textMatch = !keyword || node.label.toLowerCase().includes(keyword)
    return typeMatch && textMatch
  })
}

export function filterLinksByNodes(links: Link[], nodes: Node[]) {
  const visibleIds = new Set(nodes.map((node) => node.id))
  return links.filter((link) => visibleIds.has(link.source) && visibleIds.has(link.target))
}
