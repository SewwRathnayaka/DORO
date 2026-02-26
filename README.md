# Doro - Gamified Pomodoro Productivity App

A gamified Pomodoro productivity app where you grow a digital bouquet of flowers by completing focused work sessions.  
Runs as a **Vite + React web app** and as a **Windows desktop app via Electron**.

The primary target is **desktop**: you can download the latest Windows installer from the public GitHub release:  
`https://github.com/SewwRathnayaka/DORO/releases/tag/v1.0.0_Doro_Public_Release`

## Tech Stack

- **React 18** + **React Router** – SPA and navigation
- **react-native-web** – React Native–style UI components rendered on the web
- **TypeScript** – Type safety across the app
- **Vite** – Dev server and production bundler
- **Tailwind CSS** + custom CSS – Layout and visual styling
- **IndexedDB (via `idb`)** – Local, offline-first persistence for sessions, flowers, progress and user data
- **Zustand** – Lightweight global state management
- **html2canvas** – Capture bouquet view as an image on the Share screen
- **Electron + electron-builder** – Windows desktop packaging and installer

## Getting Started (for developers)

### Prerequisites

- Node.js **v18+**
- npm (comes with Node)

### Install dependencies

```bash
npm install
```

### Run on localhost (web only)

```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Run Electron + web together (desktop dev)

```bash
npm run electron:dev
```

This will:
- start Vite on `http://localhost:5173`
- start Electron and load that URL in a desktop window


## How users install the desktop app

1. Download the latest `doro Setup <version>.exe`.
2. Double‑click the installer and follow the steps.
3. Launch **Doro** from the Start Menu (and/or desktop shortcut, depending on NSIS options).

No separate Node/Vite/Electron installation is required for end users.

## Project Structure (high level)

```text
DORO/
├── App.tsx                     # Top-level router wrapper (BrowserRouter / HashRouter)
├── electron-main.cjs           # Electron main process (CommonJS)
├── electron-builder.config.cjs # electron-builder configuration
├── scripts/
│   └── copy-build-icon.cjs     # Copies PNG → build/icon.ico for Windows installer
├── src/
│   ├── app/                    # AppRouter, NavigationGuard, LaunchGuard
│   ├── components/             # Reusable UI components (cards, heatmap, etc.)
│   ├── modals/                 # Reusable modal components (e.g. FlowerSelect)
│   ├── screens/                # Main screens: Logo, Welcome, Home, Pomodoro, Break, Bouquet, Progress, Settings, Share
│   ├── data/                   # IndexedDB schema + CRUD (users, sessions, flowers, progress, bouquets)
│   ├── state/                  # Zustand store
│   ├── utils/                  # Helpers (e.g. electronEnv)
│   ├── styles/                 # Global styles / Tailwind entry
│   └── main.tsx                # Web/Electron renderer entry point
├── assets/                     # Images, fonts (Goldman, Poppins), icons, audio
├── dist/                       # Built web/Electron assets (gitignored)
├── PROJECT_PLAN.md             # Detailed feature and implementation plan
├── PROGRESS.md                 # Running log of progress and decisions
├── ELECTRON_READINESS_AND_STEPS.md  # Electron audit + step-by-step guide
└── package.json
```

## Key Features

- **Pomodoro timer** with focused work and break sessions
- **Flower rewards**: sessions earn individual flowers
- **Bouquet view**: grow a bouquet over time as you complete sessions
- **Progress tracking** with a heatmap and stats
- **Settings**: audio, timing and user preferences
- **Offline-first**: IndexedDB keeps all progress locally
- **Windows desktop app** built with Electron

## Future Improvements

- **Mobile-friendly layout** so Doro works well on phones and tablets.
- **Monetization via “locked” flowers** – some premium flower types unlocked via purchase or achievements.
- **Richer analytics**: deeper statistics and visual insights (e.g. more detailed heatmaps to understand focus patterns over time).


## TypeScript Notes

- All React code is in `.tsx` with strong typing on data models and store state.
- To refresh the TS server in VS Code if types look stale:
  1. Press `Ctrl+Shift+P`
  2. Run **“TypeScript: Restart TS Server”**

## License

Private project (not currently licensed for redistribution beyond the author’s control).
