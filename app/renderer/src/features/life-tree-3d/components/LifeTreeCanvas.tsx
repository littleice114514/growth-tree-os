import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { QualityProfile, TreeSnapshot } from '../contracts'
import type { ProceduralTreeLayoutNode } from '../layout'
import { ProceduralTreeRenderer } from '../renderers'

export function LifeTreeCanvas({
  snapshot,
  qualityProfile,
  onSelectNode
}: {
  snapshot: TreeSnapshot
  qualityProfile: QualityProfile
  onSelectNode: (node: ProceduralTreeLayoutNode) => void
}) {
  return (
    <div className="h-full min-h-[560px] overflow-hidden rounded-[22px] border border-[color:var(--panel-border)] bg-[rgba(4,10,16,0.82)] shadow-panel">
      <Canvas camera={{ position: [0, 2.7, 6.2], fov: 46 }} dpr={[1, qualityProfile.devicePixelRatioLimit]}>
        <color attach="background" args={['#061015']} />
        <ambientLight intensity={0.62} />
        <directionalLight position={[4, 7, 5]} intensity={1.15} />
        <pointLight position={[-3, 3, -4]} intensity={0.42} color="#7dd3fc" />
        <ProceduralTreeRenderer snapshot={snapshot} qualityProfile={qualityProfile} onSelectNode={onSelectNode} />
        <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} minDistance={3.2} maxDistance={9} maxPolarAngle={Math.PI * 0.86} />
      </Canvas>
    </div>
  )
}
