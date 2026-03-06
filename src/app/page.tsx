import GardenScene from "@/components/GardenScene";
import StatsPanel from "@/components/StatsPanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <h1 className="text-3xl font-bold text-white">DevGarden</h1>
        <p className="text-zinc-400">Visualize your GitHub journey in 3D</p>
      </div>

      <div className="flex h-screen pt-20">
        <div className="w-96 p-6 overflow-y-auto border-r border-zinc-800">
          <StatsPanel />
        </div>

        <div className="flex-1">
          <GardenScene />
        </div>
      </div>
    </main>
  );
}
