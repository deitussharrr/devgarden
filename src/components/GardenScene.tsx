"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Stars } from "@react-three/drei";
import { Suspense } from "react";
import { useGarden } from "@/components/GardenContext";
import type { GardenPlant } from "@/lib/garden";

function Terrain() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[100, 100, 64, 64]} />
      <meshStandardMaterial
        color="#1a1a2e"
        wireframe={false}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

function GridLines() {
  return (
    <gridHelper
      args={[100, 50, "#3b3b5c", "#2a2a4a"]}
      position={[0, -0.99, 0]}
    />
  );
}

function Plant({ position, scale, color, type }: GardenPlant) {
  const stemColor = "#4a3728";
  const foliageColor = color;
  
  switch (type) {
    case 'cone':
      return (
        <group position={position} scale={scale}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.6, 8]} />
            <meshStandardMaterial color={stemColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.8, 0]} castShadow>
            <coneGeometry args={[0.4, 0.8, 8]} />
            <meshStandardMaterial color={foliageColor} roughness={0.7} />
          </mesh>
        </group>
      );
    case 'cylinder':
      return (
        <group position={position} scale={scale}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.1, 0.5, 8]} />
            <meshStandardMaterial color={stemColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.65, 0]} castShadow>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshStandardMaterial color={foliageColor} roughness={0.7} />
          </mesh>
        </group>
      );
    case 'sphere':
      return (
        <group position={position} scale={scale}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, 0.3, 6]} />
            <meshStandardMaterial color={stemColor} roughness={0.9} />
          </mesh>
          <group position={[0, 0.4, 0]}>
            <mesh position={[0, 0, 0]} castShadow>
              <sphereGeometry args={[0.25, 8, 8]} />
              <meshStandardMaterial color={foliageColor} roughness={0.7} />
            </mesh>
            <mesh position={[0.15, 0.1, 0.1]} castShadow>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial color={foliageColor} roughness={0.7} />
            </mesh>
            <mesh position={[-0.12, 0.08, -0.1]} castShadow>
              <sphereGeometry args={[0.12, 6, 6]} />
              <meshStandardMaterial color={foliageColor} roughness={0.7} />
            </mesh>
          </group>
        </group>
      );
  }
}

function Plants({ plants }: { plants: GardenPlant[] }) {
  if (plants.length === 0) {
    return (
      <group>
        {[3.64, -7.02, 2.25, -4.89, 7.11].map((x, i) => (
          <group key={i} position={[x, 0, [6.79, -3.02, 7.84, -6.49, 1.54][i]]} scale={0.8}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.12, 0.6, 8]} />
              <meshStandardMaterial color="#4a3728" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.8, 0]} castShadow>
              <coneGeometry args={[0.4, 0.8, 8]} />
              <meshStandardMaterial color="#6366f1" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  return (
    <group>
      {plants.map((plant, i) => (
        <Plant key={i} {...plant} />
      ))}
    </group>
  );
}

function Scene({ plants }: { plants: GardenPlant[] }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#6366f1" />
      
      <Sky sunPosition={[100, 20, 100]} />
      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
      
      <Terrain />
      <GridLines />
      <Plants plants={plants} />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2.2}
      />
    </>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 z-10">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-indigo-400 font-medium">Generating garden...</div>
      </div>
    </div>
  );
}

export default function GardenScene() {
  const { gardenPlants, isLoading } = useGarden();

  return (
    <div className="w-full h-full relative">
      {isLoading && <LoadingSpinner />}
      <Canvas
        shadows
        camera={{ position: [15, 10, 15], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene plants={gardenPlants} />
        </Suspense>
      </Canvas>
    </div>
  );
}
