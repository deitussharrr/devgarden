# DevGarden Devlog

## Laying the Foundation

*Week 1 • March 2026*

---

## The Vision

DevGarden is a 3D visualization tool that transforms your GitHub activity into an interactive garden world. Every repository becomes a patch of terrain, commits grow as floating markers, and your coding journey unfolds as a living digital landscape.

This week marked the foundational build—the core infrastructure that makes everything else possible.

---

## What Was Built

### GitHub OAuth Integration

Set up NextAuth with GitHub provider to securely authenticate users and access their repository data.

```
src/app/api/auth/[...nextauth]/route.ts
```

The auth flow handles token management and session persistence, enabling us to make authenticated API calls to GitHub on behalf of the user.

### Data Normalization Layer

Raw GitHub API responses are messy. Created a normalization pipeline in `src/lib/github.ts` that:

- Transforms repository data into structured `GitHubRepo` objects
- Parses commit history with stats (additions/deletions)
- Aggregates meaningful stats: total stars, forks, commits, language breakdown, top repos

### Stats Panel Component

A React component that displays:
- User profile with avatar
- Repository count, stars, forks
- Commit statistics (total, additions, deletions)
- Language distribution
- Top 5 repositories by activity

The panel uses a "Load GitHub Stats" button to fetch data client-side after authentication, keeping the initial page load fast.

### Three.js Scene

Built the initial 3D environment using React Three Fiber:

- **Terrain**: Dark textured plane (100x100 units) as the garden floor
- **Grid**: Subtle grid overlay for depth perception
- **Sky & Stars**: Atmospheric background with procedural stars
- **Floating Markers**: Five octahedron markers that represent potential garden elements
- **Orbit Controls**: Auto-rotating camera for dynamic viewing

```
src/components/GardenScene.tsx
```

### Deterministic Seed Generator

Created `src/lib/seed.ts` with- Generate consistent functions to:

 seeds from usernames (`generateSeed`)
- Create reproducible random values (`seededRandom`)
- Build terrain heightmaps from seeds (`generateWorldFromSeed`)

This ensures every user's garden is unique but deterministic—same username always produces the same world.

---

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **3D**: React Three Fiber + Drei
- **Auth**: NextAuth.js
- **Language**: TypeScript

---

## Screenshots

### 1. Login View
[Stats panel showing sign-in prompt with GitHub OAuth button]

### 2. Stats Panel with Data
[Authenticated view showing repository stats, languages, and top repos]

### 3. Garden Scene
[Three.js terrain with sky, stars, and floating markers]

---

## What's Next

- Connect garden markers to actual repository data
- Implement terrain generation from seed
- Add commit timeline visualization
- Build node interaction (click to see repo details)
- Polish the 3D scene with better materials and lighting

---

## Reflections

Starting with the boring parts—auth, data fetching, basic UI—paid off. Getting the foundation solid means we can iterate quickly on the fun 3D visualization aspects.

The deterministic seed system is key. It means we can regenerate the exact same garden for a user, which enables features like sharing and comparing gardens later.

Next week: making the garden actually reflect the user's code.

---

*Building in public • Day 7*
