export function generateSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

export function generateTerrainSeed(username: string, repoCount: number): number {
  const combined = `${username}:${repoCount}`;
  return generateSeed(combined);
}

export function generateWorldFromSeed(
  seed: number,
  width: number = 100,
  height: number = 100
): number[][] {
  const terrain: number[][] = [];
  
  for (let x = 0; x < width; x++) {
    terrain[x] = [];
    for (let z = 0; z < height; z++) {
      const noise1 = Math.sin(x * 0.1 + seed) * Math.cos(z * 0.1 + seed);
      const noise2 = Math.sin(x * 0.05 + seed * 2) * Math.cos(z * 0.05 + seed * 2) * 0.5;
      terrain[x][z] = (noise1 + noise2) * 2;
    }
  }
  
  return terrain;
}
