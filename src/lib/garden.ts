export type PlantType = 'cone' | 'cylinder' | 'sphere';

export interface GardenRepo {
  name: string;
  language: string | null;
  htmlUrl: string;
}

export interface GardenPlant {
  position: [number, number, number];
  scale: number;
  color: string;
  type: PlantType;
  language?: string;
  repoName?: string;
}

export interface GardenCluster {
  repoName: string;
  language: string;
  position: [number, number, number];
  plantCount: number;
}

export interface GardenSeed {
  username: string;
  repoCount: number;
  languages: string[];
  plantCount: number;
  repos?: GardenRepo[];
}

export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  Go: '#00add8',
  Rust: '#dea584',
  PHP: '#4f5d95',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Scala: '#c22d40',
  R: '#198ce7',
  Dart: '#00b4ab',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Lua: '#000080',
  Perl: '#0298c3',
  Shell: '#89e051',
  Vue: '#41b883',
  CSS: '#563d7c',
  HTML: '#e34c26',
  JSON: '#292929',
  Markdown: '#083fa1',
  Jupyter: '#DA5B0B',
  Dockerfile: '#384d54',
};

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? '#5ba37a';
}

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
  let s = seed;
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function styleForLanguage(language: string, random: () => number): { color: string; type: PlantType } {
  const legendStyle = getLanguageGardenStyle(language);
  if (legendStyle.type !== 'mixed') {
    return { color: legendStyle.color, type: legendStyle.type };
  }
  if (language === 'Rust') {
    const rustTypes: PlantType[] = ['cone', 'cylinder', 'sphere'];
    return {
      color: legendStyle.color,
      type: rustTypes[Math.floor(random() * rustTypes.length)],
    };
  }

  const types: PlantType[] = ['cone', 'cylinder', 'sphere'];
  return {
    color: getLanguageColor(language),
    type: types[Math.floor(random() * types.length)],
  };
}

export function getLanguageGardenStyle(language: string): { color: string; type: PlantType | 'mixed' } {
  if (language === 'JavaScript') {
    return { color: '#f5d546', type: 'cone' };
  }
  if (language === 'Python') {
    return { color: '#63b95b', type: 'sphere' };
  }
  if (language === 'TypeScript') {
    return { color: '#4d8dff', type: 'cylinder' };
  }
  if (language === 'Rust') {
    return { color: '#d97a34', type: 'mixed' };
  }

  return { color: getLanguageColor(language), type: 'mixed' };
}

export function generateGarden(seed: GardenSeed): GardenPlant[] {
  const plants: GardenPlant[] = [];
  const gardenSeed = generateSeed(`${seed.username}:${seed.repoCount}`);
  const random = seededRandom(gardenSeed);

  const repos = (seed.repos ?? []).filter((repo) => repo.name).sort((a, b) => a.name.localeCompare(b.name));

  if (repos.length === 0) {
    const languages = seed.languages.length > 0 ? seed.languages : ['Default'];
    const radius = 25;

    for (let i = 0; i < seed.plantCount; i++) {
      const angle = random() * Math.PI * 2;
      const r = Math.sqrt(random()) * radius;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const noiseX = (Math.sin(x * 0.3 + gardenSeed) * Math.cos(z * 0.3 + gardenSeed)) * 5;
      const noiseZ = (Math.cos(x * 0.3 + gardenSeed * 2) * Math.sin(z * 0.3 + gardenSeed * 2)) * 5;
      const language = languages[Math.floor(Math.abs(Math.sin(i * 0.5 + gardenSeed)) * languages.length) % languages.length];
      const style = styleForLanguage(language, random);

      plants.push({
        position: [x + noiseX, -1.05, z + noiseZ],
        scale: 0.58 + random() * 0.62,
        color: style.color,
        type: style.type,
        language,
      });
    }

    return plants;
  }

  const clusterCount = repos.length;
  const basePlants = Math.max(2, Math.floor(seed.plantCount / clusterCount));
  const extraPlants = Math.max(0, seed.plantCount - basePlants * clusterCount);

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    const language = repo.language ?? 'Default';
    const style = styleForLanguage(language, random);

    const angle = ((i / clusterCount) * Math.PI * 2) + (random() * 0.18 - 0.09);
    const ringRadius = 6 + Math.sqrt(i / Math.max(1, clusterCount - 1)) * 20;
    const centerX = Math.cos(angle) * ringRadius;
    const centerZ = Math.sin(angle) * ringRadius;

    const clusterPlants = basePlants + (i < extraPlants ? 1 : 0);

    for (let p = 0; p < clusterPlants; p++) {
      const localAngle = random() * Math.PI * 2;
      const localRadius = Math.sqrt(random()) * (1.5 + Math.min(2.8, clusterPlants * 0.2));
      const offsetX = Math.cos(localAngle) * localRadius;
      const offsetZ = Math.sin(localAngle) * localRadius;
      const scale = 0.58 + random() * 0.7;

      plants.push({
        position: [centerX + offsetX, -1.05, centerZ + offsetZ],
        scale,
        color: style.color,
        type: style.type,
        language,
        repoName: repo.name,
      });
    }
  }

  return plants;
}

export function buildGardenClusters(plants: GardenPlant[]): GardenCluster[] {
  const clusterMap = new Map<string, { x: number; z: number; count: number; language: string }>();

  for (const plant of plants) {
    if (!plant.repoName) continue;
    const current = clusterMap.get(plant.repoName);
    if (!current) {
      clusterMap.set(plant.repoName, {
        x: plant.position[0],
        z: plant.position[2],
        count: 1,
        language: plant.language ?? 'Default',
      });
      continue;
    }

    current.x += plant.position[0];
    current.z += plant.position[2];
    current.count += 1;
  }

  return Array.from(clusterMap.entries())
    .map(([repoName, value]) => ({
      repoName,
      language: value.language,
      plantCount: value.count,
      position: [value.x / value.count, -1.05, value.z / value.count] as [number, number, number],
    }))
    .sort((a, b) => a.repoName.localeCompare(b.repoName));
}
