"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Stars } from "@react-three/drei";
import { Suspense, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
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
  const geometry = useMemo(() => {
    switch (type) {
      case 'cone':
        return new THREE.ConeGeometry(0.3, 1, 8);
      case 'cylinder':
        return new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8);
      case 'sphere':
        return new THREE.SphereGeometry(0.35, 8, 8);
    }
  }, [type]);

  return (
    <mesh position={position} scale={scale} castShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
    </mesh>
  );
}

function Plants({ plants }: { plants: GardenPlant[] }) {
  if (plants.length === 0) {
    return (
      <group>
        {[3.64, -7.02, 2.25, -4.89, 7.11].map((x, i) => (
          <mesh key={i} position={[x, [2.1, 3.8, 1.5, 4.2, 2.9][i], [6.79, -3.02, 7.84, -6.49, 1.54][i]]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
    );
  }

  if (plants.length > 100) {
    return <InstancedPlants plants={plants} />;
  }

  return (
    <group>
      {plants.map((plant, i) => (
        <Plant key={i} {...plant} />
      ))}
    </group>
  );
}

function InstancedPlants({ plants }: { plants: GardenPlant[] }) {
  const coneRef = useRef<THREE.InstancedMesh>(null);
  const cylinderRef = useRef<THREE.InstancedMesh>(null);
  const sphereRef = useRef<THREE.InstancedMesh>(null);

  const conePlants = useMemo(() => plants.filter(p => p.type === 'cone'), [plants]);
  const cylinderPlants = useMemo(() => plants.filter(p => p.type === 'cylinder'), [plants]);
  const spherePlants = useMemo(() => plants.filter(p => p.type === 'sphere'), [plants]);

  const tempObject = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (coneRef.current) {
      conePlants.forEach((plant, i) => {
        tempObject.position.set(...plant.position);
        tempObject.scale.setScalar(plant.scale);
        tempObject.updateMatrix();
        coneRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      coneRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [conePlants, tempObject]);

  useEffect(() => {
    if (cylinderRef.current) {
      cylinderPlants.forEach((plant, i) => {
        tempObject.position.set(...plant.position);
        tempObject.scale.setScalar(plant.scale);
        tempObject.updateMatrix();
        cylinderRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      cylinderRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [cylinderPlants, tempObject]);

  useEffect(() => {
    if (sphereRef.current) {
      spherePlants.forEach((plant, i) => {
        tempObject.position.set(...plant.position);
        tempObject.scale.setScalar(plant.scale);
        tempObject.updateMatrix();
        sphereRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      sphereRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [spherePlants, tempObject]);

  return (
    <group>
      {conePlants.length > 0 && (
        <instancedMesh ref={coneRef} args={[new THREE.ConeGeometry(0.3, 1, 8), new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.3 }), conePlants.length]}>
          {conePlants.map((p, i) => (
            <meshStandardMaterial key={i} attach={`material-${i}`} color={p.color} />
          ))}
        </instancedMesh>
      )}
      {cylinderPlants.length > 0 && (
        <instancedMesh ref={cylinderRef} args={[new THREE.CylinderGeometry(0.2, 0.25, 0.8, 8), new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.3 }), cylinderPlants.length]} />
      )}
      {spherePlants.length > 0 && (
        <instancedMesh ref={sphereRef} args={[new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0.3 }), spherePlants.length]} />
      )}
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
