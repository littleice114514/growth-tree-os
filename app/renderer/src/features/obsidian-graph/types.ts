export type ObsidianGraphNodeType = 'note' | 'tag' | 'daily' | 'project'

export type ObsidianGraphLinkType = 'link' | 'tag-ref' | 'timeline' | 'parent-child'

export type Node = {
  id: string
  label: string
  type: ObsidianGraphNodeType
  createdAt?: string
  updatedAt?: string
  degree?: number
}

export type Link = {
  source: string
  target: string
  type: ObsidianGraphLinkType
}

export type ObsidianGraphData = {
  nodes: Node[]
  links: Link[]
}

export type ObsidianGraphMode = 'global' | 'local'

export type NodePosition = {
  x: number
  y: number
  fx?: number | null
  fy?: number | null
}

export type PositionMap = Record<string, NodePosition>

export type ForceGraphNode = Node & {
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number
  fy?: number
}

export type ForceGraphLink = {
  source: string | ForceGraphNode
  target: string | ForceGraphNode
  type: ObsidianGraphLinkType
}

export type ForceGraphData = {
  nodes: ForceGraphNode[]
  links: ForceGraphLink[]
}
