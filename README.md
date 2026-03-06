# 🌱 DevGarden

DevGarden turns your **GitHub repositories into a procedural 3D garden** you can explore.

Each repository grows its own cluster of plants, and different programming languages generate different plant types. Walk through your codebase like a small world.

---

## ✨ Features

- 🔐 **GitHub Login**
  - Authenticate with GitHub to generate your personal garden.

- 🌿 **Procedural Garden Generation**
  - Repositories generate deterministic plant clusters.
  - Same repo data → same garden layout.

- 🌳 **Language-Based Plants**
  - JavaScript → Yellow Flowers  
  - Python → Green Bushes  
  - TypeScript → Blue Trees  
  - Rust → Orange Plants

- 🎮 **Interactive Exploration**
  - WASD movement
  - Shift to sprint
  - Hover clusters to view repository names
  - Click a repo in the sidebar to focus its cluster

- 🌬 **Plant Animation**
  - Plants grow when the garden loads
  - Subtle wind sway for atmosphere

- 🧑‍💻 **GitHub Profile Integration**
  - Displays GitHub avatar and repository list.

---

## 🕹 Controls

| Key | Action |
|----|------|
| W A S D | Move |
| Shift | Sprint |
| Mouse | Look / Orbit |
| Esc | Toggle cursor lock |

---

## 🏗 Tech Stack

- **Next.js**
- **React**
- **Three.js / React Three Fiber**
- **GitHub API**

---

## 🌍 How It Works

1. Log in with GitHub.
2. DevGarden fetches your repositories and language data.
3. A procedural generator converts that data into a **3D garden layout**.
4. Each repository becomes a **cluster of plants** representing its languages.

The result is a **spatial visualization of your GitHub projects**.

---

## 🚀 Running Locally

```bash
git clone https://github.com/deitussharrr/devgarden.git
cd devgarden
npm install
npm run dev
