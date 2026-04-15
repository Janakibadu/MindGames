# MindGames

A browser-based cognitive testing platform with three mini-games designed to measure reaction time, working memory, and cognitive control. Supports solo play and head-to-head 2-player sessions with cumulative scoring and a persistent leaderboard.

![React](https://img.shields.io/badge/React-18.2-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)

---

## Features

### Three Cognitive Games

**Reaction Time**
- 3 rounds per player — a random 2–6 second delay before the screen turns green
- Click or press `Space` as fast as possible; early clicks are penalized
- Score is derived from the average of your best two times
- Rating tiers from *Superhuman* (<150 ms) down to *Slow* (≥800 ms)

**Memory Test**
- 9 space-themed words are revealed in a 3×3 grid for 6 seconds, then hidden with a 3D card-flip animation
- Players type back as many words as they can recall
- Score = `(correct / 9) × 1000`

**Stroop Test**
- 10 rounds, 4 seconds each — a color word is displayed in a *conflicting* ink color (e.g. the word RED shown in blue)
- Players select the ink color, not the word meaning
- Base 100 pts per correct answer plus a speed bonus of up to 50 pts

### Multi-player
- 1-player or 2-player mode selectable at startup
- Each game runs sequentially per player so both can share a single device
- Cumulative scoring across all games with a ranked scoreboard

### Leaderboard API
- REST endpoints for submitting and retrieving top scores
- Scores persist in-memory for the server session

### Design
- Glassmorphism cards with backdrop blur
- Animated starfield / nebula background
- Orbitron display font, Inter body font
- Per-player color theming
- Fully keyboard-accessible reaction game

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 |
| Build tool | Vite 5 |
| Styling | Plain CSS — custom design system with CSS variables and utility classes |
| Backend | Node.js + Express 4 |
| Dev runner | Concurrently (client + server in one terminal) |

No external UI library, no CSS framework, no state management library — the entire frontend state lives in a single `App.jsx` root component via React hooks.

---

## Architecture

```
JS-converter/
├── client/                  # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js       # Dev server :3000, proxies /api → :4000
│   └── src/
│       ├── main.jsx
│       ├── App.jsx          # Root state, screen router
│       ├── index.css        # Global design system
│       ├── components/
│       │   ├── PlayerSetup.jsx   # Mode + name + avatar selection
│       │   ├── GameMenu.jsx      # Game picker
│       │   └── ScoreBoard.jsx    # Results + history
│       └── games/
│           ├── ReactionTime.jsx
│           ├── MemoryTest.jsx
│           └── StroopTest.jsx
└── server/
    ├── index.js             # Express API on :4000
    └── package.json
```

### State & Routing

All client-side navigation is managed by a single `screen` state variable in `App.jsx` — there is no client-side router. Possible screens: `SETUP → MENU → REACTION | MEMORY | STROOP → SCORES`.

```
App (state: screen, players, scores, history)
├── PlayerSetup   — chooses mode, names, emoji avatars
├── GameMenu      — selects next game
├── ReactionTime ─┐
├── MemoryTest    ├─ each calls onComplete(gameScores) on finish
├── StroopTest   ─┘
└── ScoreBoard    — cumulative rankings + per-game history
```

Each game component receives `{ players, onComplete, onBack }` and is self-contained. `onComplete` merges the returned scores into the root `scores` object and appends a history entry.

### API

The Express server exposes three endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/leaderboard` | Top 20 entries, sorted by score |
| `POST` | `/api/leaderboard` | Submit `{ name, score, avatar }` |

Leaderboard data is stored in memory (resets on restart). The server keeps a rolling top-100 entries and returns the top 20 on `GET`.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Install

```bash
# Clone the repo
git clone <repo-url>
cd JS-converter

# Install dependencies for root, client, and server
npm run install:all
```

### Run (development)

```bash
npm run dev
```

This starts both servers concurrently:
- Client: `http://localhost:3000`
- API: `http://localhost:4000`

Vite proxies all `/api` requests from the client to the Express server automatically.

### Run individually

```bash
npm run dev:client   # Vite only
npm run dev:server   # Express only (with --watch hot reload)
```

### Build for production

```bash
cd client
npm run build        # Output → client/dist/
```

Serve `client/dist` from any static host and point the API base URL to your deployed Express instance.

---

## Scoring Reference

### Reaction Time

| Average (ms) | Points | Rating |
|---|---|---|
| < 150 | 1000 | Superhuman |
| < 250 | 900 | Lightning |
| < 350 | 800 | Excellent |
| < 450 | 700 | Good |
| < 600 | 550 | Average |
| < 800 | 400 | Slow |
| ≥ 800 | 250 | — |

Score is based on the average of the **best 2 out of 3** rounds.

### Memory Test

```
score = floor((correctWords / 9) × 1000)
```

### Stroop Test

```
score per round = correct ? 100 + max(0, (4000 - reactionMs) / 4000 × 50) : 0
```

Maximum possible score: 1500 pts (10 correct instant answers).

---

## License

MIT
