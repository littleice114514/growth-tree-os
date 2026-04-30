import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { QualityProfile, TreeSnapshot } from '../contracts'
import { TreeBranchMeshes, TreeFruitInstances, TreeLeafInstances, TreeNodeLabel, TreeTrunkMesh } from '../components'
import { createProceduralTreeLayout, type ProceduralTreeLayoutNode } from '../layout'

export function ProceduralTreeRenderer({
  snapshot,
  qualityProfile,
  onSelectNode
}: {
  snapshot: TreeSnapshot
  qualityProfile: QualityProfile
  onSelectNode: (node: ProceduralTreeLayoutNode) => void
}) {
  const layout = useMemo(() => createProceduralTreeLayout(snapshot), [snapshot])
  const visibleLeaves = useMemo(() => layout.leaves.slice(0, qualityProfile.maxLeaves), [layout.leaves, qualityProfile.maxLeaves])
  const visibleFruits = useMemo(() => layout.fruits.slice(0, qualityProfile.maxFruits), [layout.fruits, qualityProfile.maxFruits])
  const visibleLabels = qualityProfile.enableDetailedLabels ? layout.labels.slice(0, 8) : []

  return (
    <group position={[0, -1.05, 0]}>
      <TreeTrunkMesh trunk={layout.trunk} onSelectNode={onSelectNode} />
      <TreeBranchMeshes branches={layout.branches.slice(0, 8)} onSelectNode={onSelectNode} />
      <TreeLeafInstances leaves={visibleLeaves} onSelectNode={onSelectNode} />
      <TreeFruitInstances fruits={visibleFruits} onSelectNode={onSelectNode} />
      <ScarMeshes scars={layout.scars} onSelectNode={onSelectNode} />
      {visibleLabels.map((label) => (
        <TreeNodeLabel key={label.id} label={label} />
      ))}
      <GroundRing />
    </group>
  )
}

function ScarMeshes({
  scars,
  onSelectNode
}: {
  scars: ProceduralTreeLayoutNode[]
  onSelectNode: (node: ProceduralTreeLayoutNode) => void
}) {
  return (
    <group>
      {scars.map((scar) => {
        const handleClick = (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation()
          onSelectNode(scar)
        }

        return (
          <mesh key={scar.id} position={scar.position} rotation={scar.rotation} scale={scar.scale} onClick={handleClick}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={scar.status === 'healed' ? '#78a07a' : '#b35c4c'} roughness={0.9} transparent opacity={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

function GroundRing() {
  return (
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.55, 2.65, 64]} />
      <meshBasicMaterial color="#16352d" transparent opacity={0.34} />
    </mesh>
  )
}
