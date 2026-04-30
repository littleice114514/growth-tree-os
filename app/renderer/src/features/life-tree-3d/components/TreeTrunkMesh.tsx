import type { ThreeEvent } from '@react-three/fiber'
import type { ProceduralTreeLayoutNode } from '../layout'

export function TreeTrunkMesh({
  trunk,
  onSelectNode
}: {
  trunk: ProceduralTreeLayoutNode
  onSelectNode: (node: ProceduralTreeLayoutNode) => void
}) {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    onSelectNode(trunk)
  }

  return (
    <mesh position={trunk.position} scale={trunk.scale} onClick={handleClick}>
      <cylinderGeometry args={[0.72, 1, 1.8, 16, 3]} />
      <meshStandardMaterial color={trunk.status === 'weak' ? '#6f4b38' : '#7a5638'} roughness={0.82} metalness={0.02} />
    </mesh>
  )
}
