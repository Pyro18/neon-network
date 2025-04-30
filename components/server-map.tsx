"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Environment, Html } from "@react-three/drei"
import { Vector3, Scene } from "three"
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
  const { camera, gl } = useThree()
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const sceneRef = useRef<THREE.Scene>(null)

  useEffect(() => {
    camera.position.set(5, 5, 5)
  }, [camera])

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (selectedRegion) {
        setSelectedRegion(null)
      }
    }

    const canvas = gl.domElement
    canvas.addEventListener('click', handleGlobalClick)

    return () => {
      canvas.removeEventListener('click', handleGlobalClick)
    }
  }, [gl, selectedRegion])

  const regions = [
    { name: "Spawn", position: [0, 0, 0] as [number, number, number], color: "#0ef", playerCount: 12 },
    { name: "Survival", position: [2, 0, 2] as [number, number, number], color: "#0f0", playerCount: 24 },
    { name: "SkyBlock", position: [-2, 0, -2] as [number, number, number], color: "#f0e", playerCount: 8 },
    { name: "BOOH", position: [-2, 0, 2] as [number, number, number], color: "#ff0", playerCount: 15 },
    { name: "BOOOOH 2", position: [2, 0, -2] as [number, number, number], color: "#f00", playerCount: 6 },
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

      {/* Info panel - using drei's Html component */}
      {selectedRegion && (
        <Html position={[0, 2, 0]} center distanceFactor={10}>
          <div 
            className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-primary/50 w-64 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-white hover:bg-primary/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRegion(null);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 className="text-lg font-bold mb-2 pr-6">{selectedRegion}</h3>
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur adipiscing elit quisque. {selectedRegion.toLowerCase()}
            </p>
          </div>
        </Html>
      )}

      <Environment preset="night" />
    </>
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