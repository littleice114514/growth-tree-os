import type { ThreeEvent } from '@react-three/fiber'
import type { ProceduralTreeLayoutNode } from '../layout'

function branchColor(branch: ProceduralTreeLayoutNode) {
  if (branch.status === 'weak') {
    return '#6c5842'
  }
  if (branch.status === 'active') {
    return '#8a673f'
  }
  return '#765638'
}

export function TreeBranchMeshes({
  branches,
  onSelectNode
}: {
  branches: ProceduralTreeLayoutNode[]
  onSelectNode: (node: ProceduralTreeLayoutNode) => void
}) {
  return (
    <group>
      {branches.map((branch) => {
        const handleClick = (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation()
          onSelectNode(branch)
        }

        return (
          <mesh key={branch.id} position={branch.position} rotation={branch.rotation} scale={branch.scale} onClick={handleClick}>
            <cylinderGeometry args={[0.72, 0.9, 1, 12, 1]} />
            <meshStandardMaterial color={branchColor(branch)} roughness={0.86} transparent opacity={0.72 + branch.intensity * 0.24} />
          </mesh>
        )
      })}
    </group>
  )
}
