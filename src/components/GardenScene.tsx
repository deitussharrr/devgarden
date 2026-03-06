"use client";

import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useGarden } from "@/components/GardenContext";
import type { GardenCluster, GardenPlant } from "@/lib/garden";
import {
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  Matrix4,
  Object3D,
  PCFSoftShadowMap,
  PlaneGeometry,
  Vector3,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

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
      mixed.copy(centerColor).lerp(edgeColor, radial * 0.85).lerp(darkPatchColor, wave * 0.16);
      colors.push(mixed.r, mixed.g, mixed.b);
    }

    ground.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return ground;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]} receiveShadow geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.96} metalness={0.02} />
    </mesh>
  );
}

function GrassTufts() {
  const count = 900;
  const meshRef = useRef<InstancedMesh>(null);

  const matrices = useMemo(() => {
    const data: Matrix4[] = [];
    const dummy = new Object3D();

    for (let i = 0; i < count; i++) {
      const seed = i * 12.9898;
      const x = (Math.sin(seed) * 43758.5453) % 1;
      const z = (Math.cos(seed * 1.73) * 12415.773) % 1;
      const px = (x * 2 - 1) * 52;
      const pz = (z * 2 - 1) * 52;
      const height = 0.12 + Math.abs(Math.sin(seed * 0.3)) * 0.22;

      dummy.position.set(px, -1.05 + height * 0.5, pz);
      dummy.rotation.set((Math.sin(seed * 0.2) * 0.08), Math.sin(seed * 0.8) * Math.PI, Math.cos(seed * 0.4) * 0.08);
      dummy.scale.set(1, height, 1);
      dummy.updateMatrix();
      data.push(dummy.matrix.clone());
    }

    return data;
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((matrix, i) => {
      meshRef.current?.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow={false} receiveShadow>
      <boxGeometry args={[0.03, 1, 0.03]} />
      <meshStandardMaterial color="#6fb95a" roughness={1} metalness={0} />
    </instancedMesh>
  );
}

function Plant({
  position,
  scale,
  color,
  type,
  repoName,
  onHover,
  onLeave,
}: GardenPlant & {
  onHover: (repoName: string, x: number, y: number) => void;
  onLeave: () => void;
}) {
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

  const handleHover = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!repoName) return;
    event.stopPropagation();
    onHover(repoName, event.clientX, event.clientY);
  }, [onHover, repoName]);

  const handleLeave = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onLeave();
  }, [onLeave]);

  switch (type) {
    case "cone":
      return (
        <group ref={rootRef} position={position} onPointerMove={handleHover} onPointerOver={handleHover} onPointerLeave={handleLeave}>
          <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
            <coneGeometry args={[0.06, 0.3, 6]} />
            <meshStandardMaterial color={stemColor} roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.11, 7, 7]} />
            <meshStandardMaterial color={blossomColor} roughness={0.5} />
          </mesh>
        </group>
      );
    case "cylinder":
      return (
        <group ref={rootRef} position={position} onPointerMove={handleHover} onPointerOver={handleHover} onPointerLeave={handleLeave}>
          <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.12, 1.24, 7]} />
            <meshStandardMaterial color={stemColor} roughness={0.9} />
          </mesh>
          <group position={[0, 1.2, 0]}>
            <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.34, 9, 9]} />
              <meshStandardMaterial color={foliageColor} roughness={0.65} />
            </mesh>
            <mesh position={[0.24, 0.08, 0.02]} castShadow receiveShadow>
              <sphereGeometry args={[0.24, 8, 8]} />
              <meshStandardMaterial color={foliageColor} roughness={0.66} />
            </mesh>
            <mesh position={[-0.23, 0.1, -0.08]} castShadow receiveShadow>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshStandardMaterial color={foliageColor} roughness={0.66} />
            </mesh>
          </group>
        </group>
      );
    case "sphere":
      return (
        <group ref={rootRef} position={position} onPointerMove={handleHover} onPointerOver={handleHover} onPointerLeave={handleLeave}>
          <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
            <sphereGeometry args={[0.09, 6, 6]} />
            <meshStandardMaterial color="#597f3f" roughness={0.88} />
          </mesh>
          <group position={[0, 0.26, 0]}>
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

function Plants({
  plants,
  onHover,
  onLeave,
}: {
  plants: GardenPlant[];
  onHover: (repoName: string, x: number, y: number) => void;
  onLeave: () => void;
}) {
  if (plants.length === 0) {
    const fallbackPlants: GardenPlant[] = [
      { position: [3.64, -1.05, 6.79], scale: 0.75, color: "#4d8dff", type: "cylinder", repoName: "starter-tree" },
      { position: [-7.02, -1.05, -3.02], scale: 0.68, color: "#63b95b", type: "sphere", repoName: "starter-bush" },
      { position: [2.25, -1.05, 7.84], scale: 0.7, color: "#f5d546", type: "cone", repoName: "starter-flower" },
      { position: [-4.89, -1.05, -6.49], scale: 0.62, color: "#d97a34", type: "cylinder", repoName: "starter-rust" },
      { position: [7.11, -1.05, 1.54], scale: 0.72, color: "#63b95b", type: "sphere", repoName: "starter-python" },
    ];

    return (
      <group>
        {fallbackPlants.map((plant, i) => (
          <Plant key={i} {...plant} onHover={onHover} onLeave={onLeave} />
        ))}
      </group>
    );
  }

  return (
    <group>
      {plants.map((plant, i) => (
        <Plant key={`${plant.repoName ?? "p"}-${i}`} {...plant} onHover={onHover} onLeave={onLeave} />
      ))}
    </group>
  );
}

function CameraRig({
  clusters,
  selectedRepoName,
  controlsRef,
}: {
  clusters: GardenCluster[];
  selectedRepoName: string | null;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const desiredTarget = useRef(new Vector3(0, 0, 0));
  const desiredPosition = useRef(new Vector3(20, 15, 20));

  useEffect(() => {
    const selected = clusters.find((cluster) => cluster.repoName === selectedRepoName);
    if (!selected) {
      desiredTarget.current.set(0, 0, 0);
      desiredPosition.current.set(20, 15, 20);
      return;
    }

    desiredTarget.current.set(selected.position[0], -0.2, selected.position[2]);
    desiredPosition.current.set(selected.position[0] + 11, 9.5, selected.position[2] + 11);
  }, [clusters, selectedRepoName]);

  useFrame(() => {
    camera.position.lerp(desiredPosition.current, 0.06);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredTarget.current, 0.09);
      controlsRef.current.update();
    }
  });

  return null;
}

function Scene({
  plants,
  clusters,
  selectedRepoName,
  onHover,
  onLeave,
}: {
  plants: GardenPlant[];
  clusters: GardenCluster[];
  selectedRepoName: string | null;
  onHover: (repoName: string, x: number, y: number) => void;
  onLeave: () => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <color attach="background" args={["#b8dbff"]} />
      <fog attach="fog" args={["#a9cde8", 18, 75]} />
      <ambientLight intensity={0.64} color="#d7f0ff" />
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
      <GrassTufts />
      <Plants plants={plants} onHover={onHover} onLeave={onLeave} />
      <CameraRig clusters={clusters} selectedRepoName={selectedRepoName} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        target={[0, 0.6, 0]}
        enablePan={false}
        enableZoom
        enableRotate
        autoRotate
        autoRotateSpeed={0.2}
        minDistance={10}
        maxDistance={45}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.02}
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
  const { gardenPlants, gardenClusters, selectedRepoName, isLoading } = useGarden();
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  const handleHover = useCallback((repoName: string, x: number, y: number) => {
    setTooltip({ name: repoName, x, y });
  }, []);

  const handleLeave = useCallback(() => {
    setTooltip(null);
  }, []);

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
          <Scene
            plants={gardenPlants}
            clusters={gardenClusters}
            selectedRepoName={selectedRepoName}
            onHover={handleHover}
            onLeave={handleLeave}
          />
        </Suspense>
      </Canvas>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-20 px-3 py-2 rounded-md bg-zinc-900/90 border border-zinc-700 text-zinc-100 text-sm"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
}
