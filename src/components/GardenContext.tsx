"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { GardenSeed, GardenPlant } from "@/lib/garden";

interface GardenContextType {
  gardenSeed: GardenSeed | null;
  gardenPlants: GardenPlant[];
  setGardenData: (seed: GardenSeed, plants: GardenPlant[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [gardenSeed, setGardenSeed] = useState<GardenSeed | null>(null);
  const [gardenPlants, setGardenPlants] = useState<GardenPlant[]>([]);
  const [isLoading, setIsLoadingState] = useState(false);

  const setGardenData = useCallback((seed: GardenSeed, plants: GardenPlant[]) => {
    setGardenSeed(seed);
    setGardenPlants(plants);
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setIsLoadingState(loading);
  }, []);

  return (
    <GardenContext.Provider value={{ gardenSeed, gardenPlants, setGardenData, isLoading, setIsLoading }}>
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
