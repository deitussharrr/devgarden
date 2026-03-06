export type PlantType = 'cone' | 'cylinder' | 'sphere';

export interface GardenPlant {
  position: [number, number, number];
  scale: number;
  color: string;
  type: PlantType;
  language?: string;
}

export interface GardenSeed {
  username: string;
  repoCount: number;
  languages: string[];
  plantCount: number;
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
  return LANGUAGE_COLORS[language] ?? '#6366f1';
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

export function generateGarden(seed: GardenSeed): GardenPlant[] {
  const plants: GardenPlant[] = [];
  const gardenSeed = generateSeed(seed.username + ':' + seed.repoCount);
  const random = seededRandom(gardenSeed);

  const languages = seed.languages.length > 0 ? seed.languages : ['Default'];

  const radius = 25;
  const plantTypes: PlantType[] = ['cone', 'cylinder', 'sphere'];
  const repoCountFactor = Math.min(seed.repoCount, 10);

  for (let i = 0; i < seed.plantCount; i++) {
    const angle = random() * Math.PI * 2;
    const r = Math.sqrt(random()) * radius;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    const noiseX = (Math.sin(x * 0.3 + gardenSeed) * Math.cos(z * 0.3 + gardenSeed)) * 5;
    const noiseZ = (Math.cos(x * 0.3 + gardenSeed * 2) * Math.sin(z * 0.3 + gardenSeed * 2)) * 5;
    
    const finalX = x + noiseX;
    const finalZ = z + noiseZ;

    const languageIndex = Math.floor(Math.abs(Math.sin(i * 0.5 + gardenSeed)) * languages.length) % languages.length;
    const language = languages[languageIndex];

    let color = getLanguageColor(language);
    let type: PlantType;

    if (language === 'JavaScript') {
      color = '#f5d546';
      type = 'cone';
    } else if (language === 'Python') {
      color = '#63b95b';
      type = 'sphere';
    } else if (language === 'TypeScript') {
      color = '#4d8dff';
      type = 'cylinder';
    } else if (language === 'Rust') {
      color = '#d97a34';
      const rustTypeIndex = Math.floor((random() * plantTypes.length * (1 + repoCountFactor * 0.1))) % plantTypes.length;
      type = plantTypes[rustTypeIndex];
    } else {
      const typeIndex = Math.floor((random() * plantTypes.length * (1 + repoCountFactor * 0.1))) % plantTypes.length;
      type = plantTypes[typeIndex];
    }

    const scale = 0.5 + random() * 1.0;
    const y = -0.5 + scale * 0.5;

    plants.push({
      position: [finalX, y, finalZ],
      scale,
      color,
      type,
      language,
    });
  }

  return plants;
}
