# Academic-Weapon-App

QuestLog - Academic RPG Planner (Offline-First)

A pixel-art styled academic planner built with React + Firebase, featuring:
- 🎮 RPG-themed UI with pixel art styling
- 📚 Course management with schedule import
- ✅ Assignment tracking with smart parsing
- 📅 Calendar view
- 🎯 Focus mode for important assignments
- 📊 Dashboard with progress tracking
- 📤 Import: Syllabus PDF, Schedule screenshot, Voice
- 🔌 **Works offline** — syncs when connected

## Quick Start

```bash
npm install
npm run emulators   # Terminal 1: Firebase emulators
npm run dev         # Terminal 2: Vite dev server
```

Or run both:
```bash
npm run dev:all
```

See [docs/SETUP.md](docs/SETUP.md) for full setup.

## Features

- 🎮 RPG-themed UI with pixel art styling
- 📚 Course management
- ✅ Assignment tracking with status management
- 📅 Calendar view
- 🎯 Focus mode for important assignments
- 📊 Dashboard with progress tracking
- 📤 Import functionality (syllabus, schedule, voice)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- React 18
- React Router DOM 6
- Vite
- Tailwind CSS
- Iconify Icons
- VT323 & Inter Fonts

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── context/        # React context for state management
├── data/           # Mock data and constants
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```