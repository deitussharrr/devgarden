# DevGarden Implementation Plan

## Overview
Complete the remaining features for DevGarden to become a finished product.

## Implementation Steps

### Step 1: Create Garden Types & Logic (`src/lib/garden.ts`)
- Define `GardenPlant`, `GardenSeed` interfaces
- Define `LANGUAGE_COLORS` mapping
- Implement `generateGarden(seed: GardenSeed): GardenPlant[]`
  - Use seeded random for deterministic generation
  - Cluster plants organically using noise
  - Distribute colors based on languages
  - Select geometry type weighted by repoCount

### Step 2: Update API Route (`src/app/api/github/route.ts`)
- Fetch user data from `https://api.github.com/user`
- Return username, repoCount, languages array

### Step 3: Create Garden Context (`src/components/GardenContext.tsx`)
```typescript
interface GardenContextType {
  gardenSeed: GardenSeed | null;
  gardenPlants: GardenPlant[];
  setGardenData: (seed: GardenSeed, plants: GardenPlant[]) => void;
  isLoading: boolean;
}
```

### Step 4: Update StatsPanel (`src/components/StatsPanel.tsx`)
- Auto-fetch GitHub data on login
- Compute gardenSeed from data
- Call setGardenData to share with GardenScene
- Display: username, repoCount, languages

### Step 5: Update GardenScene (`src/components/GardenScene.tsx`)
- Consume GardenContext
- Show spinner while loading
- Render plants from gardenPlants array
- Use InstancedMesh if plantCount > 100
- Plant geometries: cone, cylinder, sphere

### Step 6: Update Page (`src/app/page.tsx`)
- Wrap with GardenProvider

## Key Details

### Language Colors
- JavaScript: #f7df1e
- Python: #3572A5
- TypeScript: #3178c6
- Rust: #dea584
- Go: #00add8
- Java: #b07219
- C++: #f34b7d
- Default: #6366f1

### Plant Generation
- Garden radius: 25 units
- Plant count: repoCount * 5 (max 200)
- Scale: 0.5-1.5
- Position: clustered distribution with noise
- Type: weighted random based on repoCount

### Performance
- plantCount ≤ 100: individual meshes
- plantCount > 100: InstancedMesh

## Files to Modify/Create
- [x] `src/lib/garden.ts` (create)
- [ ] `src/app/api/github/route.ts` (modify)
- [ ] `src/components/GardenContext.tsx` (create)
- [ ] `src/components/StatsPanel.tsx` (modify)
- [ ] `src/components/GardenScene.tsx` (modify)
- [ ] `src/app/page.tsx` (modify)
