# Mystery Club

Mystery Club is a browser-based multiplayer mini-game inspired by the feel of classic children's mystery adventures while using entirely original text, clues, and story content. Players form a private room, race through five mystery rounds, and compete on a real-time scoreboard.

## Stack

- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- Backend: Node.js + Express + Socket.IO
- State: In-memory room and game state with automatic expiration after 30 minutes of inactivity

## Features

- Private room creation with short room codes
- 2 to 6 players per room
- Host-controlled game start
- Five timed rounds:
  - clue selection
  - code deciphering
  - memory challenge
  - pattern lock
  - final deduction
- Real-time scoreboard updates
- Speed bonus scoring
- Winner screen at game end
- Clean split between `frontend`, `backend`, and shared game contracts

## Project Structure

```text
.
├── backend
│   ├── src
│   │   ├── game
│   │   └── socket
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   └── lib
└── shared
```

## Local Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start the backend:

```bash
npm run dev:backend
```

4. In a second terminal, start the frontend:

```bash
npm run dev:frontend
```

5. Open the frontend URL shown by Vite, usually `http://localhost:5173`.

## Environment Variables

### Backend

`backend/.env`

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
```

### Frontend

`frontend/.env`

```env
VITE_SERVER_URL=http://localhost:4000
```

## Build for Production

```bash
npm run build
```

This creates production assets in `frontend/dist` and compiled server files in `backend/dist`.

## Deployment Notes

### Recommended: Single-service deploy on Render

- Use [Render](https://render.com/), which supports WebSocket connections for Node web services.
- This repo includes a [render.yaml](/Users/missaelhr/Documents/AmandaBlack/render.yaml) blueprint for a single public service.
- The production server serves the built React frontend and Socket.IO backend from one URL.
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Health check path: `/health`

### Why not Vercel for this version?

- This game uses persistent `Socket.IO` connections for real-time multiplayer.
- Vercel's current guidance is to use an external realtime provider instead of keeping WebSocket connections inside Serverless Functions.
- Render is the simpler fit for this architecture because it supports public WebSocket-enabled web services.

## Game Rules

- The host creates a room and shares the code.
- Once at least 2 players join, the host starts the mystery.
- Each round is timed.
- Correct answers earn 100 points.
- Faster correct answers receive up to 60 bonus points.
- The highest score after round 5 wins.

## Room Expiration

Rooms are stored in memory only. If no activity happens for 30 minutes, the room is removed automatically.
