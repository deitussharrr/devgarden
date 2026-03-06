"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { GardenSeed, GardenPlant, GardenCluster, GardenRepo } from "@/lib/garden";

interface GardenContextType {
  gardenSeed: GardenSeed | null;
  gardenPlants: GardenPlant[];
  gardenClusters: GardenCluster[];
  repos: GardenRepo[];
  selectedRepoName: string | null;
  setSelectedRepoName: (repoName: string | null) => void;
  setGardenData: (seed: GardenSeed, plants: GardenPlant[], clusters: GardenCluster[], repos: GardenRepo[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [gardenSeed, setGardenSeed] = useState<GardenSeed | null>(null);
  const [gardenPlants, setGardenPlants] = useState<GardenPlant[]>([]);
  const [gardenClusters, setGardenClusters] = useState<GardenCluster[]>([]);
  const [repos, setRepos] = useState<GardenRepo[]>([]);
  const [selectedRepoName, setSelectedRepoName] = useState<string | null>(null);
  const [isLoading, setIsLoadingState] = useState(false);

  const setGardenData = useCallback((seed: GardenSeed, plants: GardenPlant[], clusters: GardenCluster[], repoList: GardenRepo[]) => {
    setGardenSeed(seed);
    setGardenPlants(plants);
    setGardenClusters(clusters);
    setRepos(repoList);
    setSelectedRepoName(repoList[0]?.name ?? null);
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setIsLoadingState(loading);
  }, []);

  return (
    <GardenContext.Provider value={{
      gardenSeed,
      gardenPlants,
      gardenClusters,
      repos,
      selectedRepoName,
      setSelectedRepoName,
      setGardenData,
      isLoading,
      setIsLoading
    }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const context = useContext(GardenContext);
  if (context === undefined) {
    throw new Error("useGarden must be used within a GardenProvider");
  }
  return context;
}
