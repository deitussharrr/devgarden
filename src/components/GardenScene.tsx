"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { useGarden } from "@/components/GardenContext";
import type { GardenPlant } from "@/lib/garden";
import { Color, Float32BufferAttribute, Group, PCFSoftShadowMap, PlaneGeometry } from "three";

function Terrain() {
  const geometry = useMemo(() => {
    const ground = new PlaneGeometry(110, 110, 48, 48);
    const positions = ground.attributes.position;
    const colors: number[] = [];
    const edgeColor = new Color("#5f9f55");
    const centerColor = new Color("#79bf67");
    const darkPatchColor = new Color("#4b8346");
    const mixed = new Color();

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const radial = Math.min(1, Math.sqrt(x * x + y * y) / 58);
      const wave = (Math.sin(x * 0.12) * Math.cos(y * 0.1) + 1) * 0.5;
      mixed.copy(centerColor).lerp(edgeColor, radial * 0.85).lerp(darkPatchColor, wave * 0.12);
      colors.push(mixed.r, mixed.g, mixed.b);
    }

    ground.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return ground;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0.03} />
    </mesh>
  );
}

function Plant({ position, scale, color, type }: GardenPlant) {
  const rootRef = useRef<Group>(null);
  const growthRef = useRef(0);
  const swayPhase = useMemo(() => ((position[0] * 0.41 + position[2] * 0.29) % 1) * Math.PI * 2, [position]);
  const swayStrength = type === "cylinder" ? 0.08 : type === "cone" ? 0.11 : 0.06;

  useFrame((state, delta) => {
    if (!rootRef.current) return;
    growthRef.current = Math.min(1, growthRef.current + delta * 0.55);
    const easedGrowth = 1 - Math.pow(1 - growthRef.current, 3);
    const sway = Math.sin(state.clock.elapsedTime * 1.15 + swayPhase) * swayStrength;
    rootRef.current.rotation.z = sway;
    rootRef.current.scale.setScalar(Math.max(0.001, scale * easedGrowth));
  });

  const stemColor = "#6d4b34";
  const foliageColor = new Color(color).offsetHSL(0, 0.04, 0.02).getStyle();
  const blossomColor = new Color(color).offsetHSL(0.01, 0.08, 0.12).getStyle();

  switch (type) {
    case "cone":
      return (
        <group ref={rootRef} position={position}>
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.06, 0.3, 6]} />
            <meshStandardMaterial color={stemColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.11, 7, 7]} />
            <meshStandardMaterial color={blossomColor} roughness={0.55} />
          </mesh>
        </group>
      );
    case "cylinder":
      return (
        <group ref={rootRef} position={position}>
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.07, 0.1, 0.9, 8]} />
            <meshStandardMaterial color={stemColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.34, 10, 10]} />
            <meshStandardMaterial color={foliageColor} roughness={0.62} />
          </mesh>
        </group>
      );
    case "sphere":
      return (
        <group ref={rootRef} position={position}>
          <group position={[0, 0.28, 0]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.24, 8, 8]} />
              <meshStandardMaterial color={foliageColor} roughness={0.7} />
            </mesh>
            <mesh position={[0.18, 0.06, 0.12]} castShadow receiveShadow>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial color={foliageColor} roughness={0.72} />
            </mesh>
            <mesh position={[-0.16, 0.07, -0.11]} castShadow receiveShadow>
              <sphereGeometry args={[0.14, 6, 6]} />
              <meshStandardMaterial color={foliageColor} roughness={0.72} />
            </mesh>
            <mesh position={[0.02, 0.11, -0.16]} castShadow receiveShadow>
              <sphereGeometry args={[0.13, 6, 6]} />
              <meshStandardMaterial color={foliageColor} roughness={0.72} />
            </mesh>
          </group>
        </group>
      );
  }
}

function Plants({ plants }: { plants: GardenPlant[] }) {
  if (plants.length === 0) {
    const fallbackPlants: GardenPlant[] = [
      { position: [3.64, -0.1, 6.79], scale: 0.75, color: "#4d8dff", type: "cylinder" },
      { position: [-7.02, -0.2, -3.02], scale: 0.68, color: "#63b95b", type: "sphere" },
      { position: [2.25, -0.1, 7.84], scale: 0.7, color: "#f5d546", type: "cone" },
      { position: [-4.89, -0.25, -6.49], scale: 0.62, color: "#d97a34", type: "cylinder" },
      { position: [7.11, -0.2, 1.54], scale: 0.72, color: "#63b95b", type: "sphere" },
    ];

    return (
      <group>
        {fallbackPlants.map((plant, i) => (
          <Plant key={i} {...plant} />
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
      <color attach="background" args={["#b8dbff"]} />
      <fog attach="fog" args={["#a9cde8", 18, 75]} />
      <ambientLight intensity={0.62} color="#d7f0ff" />
      <directionalLight
        position={[20, 28, 10]}
        intensity={1.2}
        color="#fff0d6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
        shadow-radius={4}
        shadow-camera-near={5}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
      />
      <Terrain />
      <Plants plants={plants} />
      <OrbitControls
        target={[0, 0.6, 0]}
        enablePan={false}
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.24}
        minDistance={12}
        maxDistance={45}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.05}
        enableDamping
        dampingFactor={0.08}
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
        camera={{ position: [20, 15, 20], fov: 45 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = PCFSoftShadowMap;
        }}
      >
        <Suspense fallback={null}>
          <Scene plants={gardenPlants} />
        </Suspense>
      </Canvas>
    </div>
  );
}
