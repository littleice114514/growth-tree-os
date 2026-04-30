import { Text } from '@react-three/drei'
import type { ProceduralTreeLayoutNode } from '../layout'

export function TreeNodeLabel({ label }: { label: ProceduralTreeLayoutNode }) {
  return (
    <Text position={label.position} fontSize={0.1} color="#dbeafe" anchorX="center" anchorY="middle" outlineWidth={0.004} outlineColor="#0f172a">
      {label.label ?? label.nodeId}
    </Text>
  )
}
