# Doro - Gamified Pomodoro Productivity App

A gamified Pomodoro productivity desktop application where users grow a digital bouquet of flowers by completing focused work sessions.

## Tech Stack

- **React** - Frontend framework (pure React, not React Native)
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **IndexedDB** - Offline storage
- **Electron** - Desktop packaging (Windows)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Start Vite development server (web)
npm run dev

# Run Electron app (after starting dev server)
npm run electron:dev
```

The web app will be available at `http://localhost:5173`

### Building

```bash
# Build web version
npm run build

# Build Electron app for Windows
npm run electron:build
```

## Project Structure

```
doro/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── data/             # IndexedDB setup and CRUD operations
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript types
│   ├── styles/           # Global styles
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── electron/             # Electron configuration
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
└── package.json
```

## Features

- ⏱️ 25-minute Pomodoro timer
- 🌸 Flower rewards system
- 💐 Digital bouquet collection
- 📊 Progress tracking with calendar heatmap
- 🔥 Streak system
- 💻 Offline-first architecture
- 🖥️ Windows desktop app

## Development Status

Currently in Phase 1: Foundation & Core Timer

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for detailed development phases and roadmap.

## TypeScript

The project uses TypeScript. To check if your IDE recognizes types:
1. Open any `.ts` or `.tsx` file
2. Hover over variables/functions - you should see type information
3. In VS Code, press `Ctrl+Shift+P` → "TypeScript: Restart TS Server" if types aren't working

## License

Private project
