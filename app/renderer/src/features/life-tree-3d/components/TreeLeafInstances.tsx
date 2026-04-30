import type { ThreeEvent } from '@react-three/fiber'
import type { ProceduralTreeLayoutNode } from '../layout'

function leafColor(leaf: ProceduralTreeLayoutNode) {
  if (leaf.status === 'withered' || leaf.status === 'fallen') {
    return '#8b7a48'
  }
  if (leaf.intensity > 0.78) {
    return '#55b66e'
  }
  return '#3f8f5c'
}

export function TreeLeafInstances({
  leaves,
  onSelectNode
}: {
  leaves: ProceduralTreeLayoutNode[]
  onSelectNode: (node: ProceduralTreeLayoutNode) => void
}) {
  return (
    <group>
      {leaves.map((leaf) => {
        const handleClick = (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation()
          onSelectNode(leaf)
        }

        return (
          <mesh key={leaf.id} position={leaf.position} rotation={leaf.rotation} scale={leaf.scale} onClick={handleClick}>
            {/* TODO: Replace individual meshes with InstancedMesh when mock data grows beyond POC volume. */}
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={leafColor(leaf)} roughness={0.75} transparent opacity={0.72 + leaf.intensity * 0.22} />
          </mesh>
        )
      })}
    </group>
  )
}
