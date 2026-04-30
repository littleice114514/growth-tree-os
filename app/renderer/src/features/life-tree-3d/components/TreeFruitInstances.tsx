import type { ThreeEvent } from '@react-three/fiber'
import type { ProceduralTreeLayoutNode } from '../layout'

export function TreeFruitInstances({
  fruits,
  onSelectNode
}: {
  fruits: ProceduralTreeLayoutNode[]
  onSelectNode: (node: ProceduralTreeLayoutNode) => void
}) {
  return (
    <group>
      {fruits.map((fruit) => {
        const handleClick = (event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation()
          onSelectNode(fruit)
        }

        return (
          <mesh key={fruit.id} position={fruit.position} scale={fruit.scale} onClick={handleClick}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshStandardMaterial color={fruit.intensity > 0.65 ? '#f1b84b' : '#d99b3d'} roughness={0.52} metalness={0.03} />
          </mesh>
        )
      })}
    </group>
  )
}
