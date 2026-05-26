import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function SpinningDish({ isHovered }) {
  const groupRef = useRef()
  const scaleRef = useRef(1)
  const speedRef = useRef(0.003)

  useFrame(() => {
    if (!groupRef.current) return

    const targetScale = isHovered ? 1.2 : 1
    const targetSpeed = isHovered ? 0.02 : 0.003

    scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 0.07)
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, 0.06)

    groupRef.current.rotation.y += speedRef.current
    groupRef.current.scale.setScalar(scaleRef.current)
  })

  return (
    <group ref={groupRef}>
      {/* Main dish body — icosahedron */}
      <mesh>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshPhysicalMaterial
          color="#c2440f"
          metalness={0.25}
          roughness={0.55}
          clearcoat={0.5}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* Smaller orbiting sphere accent */}
      <mesh position={[1.6, 0.3, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshPhysicalMaterial
          color="#f97316"
          metalness={0.1}
          roughness={0.4}
          clearcoat={0.8}
        />
      </mesh>

      {/* Second accent */}
      <mesh position={[-1.4, -0.2, 0.4]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshPhysicalMaterial
          color="#fbbf24"
          metalness={0.1}
          roughness={0.5}
        />
      </mesh>
    </group>
  )
}

export default function ThreeDScene({ isHovered }) {
  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#f97316" />
      <Environment preset="city" />
      <SpinningDish isHovered={isHovered} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}