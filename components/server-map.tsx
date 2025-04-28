"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Environment } from "@react-three/drei"
import { Vector3 } from "three"
import { cn } from "@/lib/utils"
import type * as THREE from "three"

function MapRegion({
  position,
  color,
  name,
  size = [1, 0.2, 1],
  playerCount = 0,
  onClick,
}: {
  position: [number, number, number]
  color: string
  name: string
  size?: [number, number, number]
  playerCount?: number
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005

      if (hovered) {
        meshRef.current.scale.lerp(new Vector3(1.1, 1.1, 1.1), 0.1)
      } else {
        meshRef.current.scale.lerp(new Vector3(1, 1, 1), 0.1)
      }
    }
  })

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
      <Text position={[0, size[1] + 0.3, 0]} fontSize={0.2} color="white" anchorX="center" anchorY="middle">
        {name}
      </Text>
      {playerCount > 0 && (
        <Text position={[0, size[1] + 0.1, 0]} fontSize={0.15} color="#0ef" anchorX="center" anchorY="middle">
          {playerCount} players
        </Text>
      )}
    </group>
  )
}

function MapBase() {
  const { camera } = useThree()
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  useEffect(() => {
    camera.position.set(5, 5, 5)
  }, [camera])

  const regions = [
    { name: "Spawn", position: [0, 0, 0], color: "#0ef", playerCount: 12 },
    { name: "Survival", position: [2, 0, 2], color: "#0f0", playerCount: 24 },
    { name: "Creative", position: [-2, 0, -2], color: "#f0e", playerCount: 8 },
    { name: "Minigames", position: [-2, 0, 2], color: "#ff0", playerCount: 15 },
    { name: "PvP Arena", position: [2, 0, -2], color: "#f00", playerCount: 6 },
  ]

  return (
    <>
      {/* Base terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Grid lines */}
      <gridHelper args={[10, 10, "#333", "#222"]} />

      {/* Regions */}
      {regions.map((region) => (
        <MapRegion
          key={region.name}
          position={region.position}
          color={region.color}
          name={region.name}
          playerCount={region.playerCount}
          onClick={() => setSelectedRegion(region.name)}
        />
      ))}

      {/* Info panel */}
      {selectedRegion && (
        <Html position={[0, 2, 0]}>
          <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-primary/50 w-64">
            <h3 className="text-lg font-bold mb-2">{selectedRegion}</h3>
            <p className="text-sm text-muted-foreground">
              Click to teleport to this location in-game using /warp {selectedRegion.toLowerCase()}
            </p>
          </div>
        </Html>
      )}

      <Environment preset="night" />
    </>
  )
}

// Html component for overlay information
function Html({ children, position }: { children: React.ReactNode; position: [number, number, number] }) {
  const { camera } = useThree()
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  useFrame(() => {
    const vector = new Vector3(...position)
    vector.project(camera)

    setCoords({
      x: (vector.x * 0.5 + 0.5) * 100,
      y: (-(vector.y * 0.5) + 0.5) * 100,
    })
  })

  return (
    <div
      style={{
        position: "absolute",
        left: `${coords.x}%`,
        top: `${coords.y}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  )
}

export function ServerMap({ className }: { className?: string }) {
  return (
    <div className={cn("w-full h-full rounded-lg overflow-hidden", className)}>
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <MapBase />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={2} maxDistance={10} />
      </Canvas>
    </div>
  )
}
