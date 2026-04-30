import { useCallback, useState } from 'react'
import type { ProceduralTreeLayoutNode } from '../layout'

export interface TreeSelection {
  selectedNode: ProceduralTreeLayoutNode | null
  selectedAt: string | null
  selectNode: (node: ProceduralTreeLayoutNode) => void
  clearSelection: () => void
}

export function useTreeSelection(): TreeSelection {
  const [selectedNode, setSelectedNode] = useState<ProceduralTreeLayoutNode | null>(null)
  const [selectedAt, setSelectedAt] = useState<string | null>(null)

  const selectNode = useCallback((node: ProceduralTreeLayoutNode) => {
    setSelectedNode(node)
    setSelectedAt(new Date().toISOString())
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedNode(null)
    setSelectedAt(null)
  }, [])

  return { selectedNode, selectedAt, selectNode, clearSelection }
}
