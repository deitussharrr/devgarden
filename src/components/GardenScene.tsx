"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Stars } from "@react-three/drei";
import { Suspense } from "react";

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

const MARKER_POSITIONS = [
  [3.64, 2.1, 6.79],
  [-7.02, 3.8, -3.02],
  [2.25, 1.5, 7.84],
  [-4.89, 4.2, -6.49],
  [7.11, 2.9, 1.54],
];

function FloatingMarkers() {
  return (
    <group>
      {MARKER_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          position={pos as [number, number, number]}
        >
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#6366f1" />
      
      <Sky sunPosition={[100, 20, 100]} />
      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
      
      <Terrain />
      <GridLines />
      <FloatingMarkers />
      
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

export default function GardenScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [15, 10, 15], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
