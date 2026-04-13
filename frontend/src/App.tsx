import { useEffect, useMemo, useState } from "react";
import { DifficultyLevel, DrawingStroke, MiniGameType, PlayerPublic, RoomState } from "@shared/game";
import { HomeScreen } from "./components/HomeScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { RoundScreen } from "./components/RoundScreen";
import { Scoreboard } from "./components/Scoreboard";
import { WinnerScreen } from "./components/WinnerScreen";
import { socket } from "./lib/socket";

const SESSION_KEY = "unasletas-session";

type StoredSession = {
  roomCode: string;
  playerId: string;
  playerName: string;
};

function loadSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function saveSession(session: StoredSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

function App() {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRoom = (nextRoom: RoomState) => {
      setRoom(nextRoom);
      setError(null);
    };
    const handleError = (message: string) => {
      setError(message);
    };
    const handleKicked = (message: string) => {
      clearSession();
      setRoom(null);
      setPlayerId(null);
      setError(message);
    };
    const handleClosed = (message: string) => {
      clearSession();
      setRoom(null);
      setPlayerId(null);
      setError(message);
    };
    const handleConnectError = () => {
      setError("No se pudo conectar con el servidor del juego.");
    };
    const tryResume = () => {
      const session = loadSession();
      if (!session) {
        return;
      }

      socket.emit("room:resume", { roomCode: session.roomCode, playerId: session.playerId }, (response) => {
        if (!response.ok || !response.playerId) {
          clearSession();
          setPlayerId(null);
          setRoom(null);
          return;
        }
        setPlayerId(response.playerId);
      });
    };

    socket.on("room:update", handleRoom);
    socket.on("room:error", handleError);
    socket.on("room:kicked", handleKicked);
    socket.on("room:closed", handleClosed);
    socket.on("connect_error", handleConnectError);
    socket.on("connect", tryResume);

    if (socket.connected) {
      tryResume();
    }

    return () => {
      socket.off("room:update", handleRoom);
      socket.off("room:error", handleError);
      socket.off("room:kicked", handleKicked);
      socket.off("room:closed", handleClosed);
      socket.off("connect_error", handleConnectError);
      socket.off("connect", tryResume);
    };
  }, []);

  const me = useMemo<PlayerPublic | undefined>(
    () => room?.players.find((player) => player.id === playerId),
    [playerId, room?.players],
  );

  const createRoom = (playerName: string, difficulty: DifficultyLevel, password: string) => {
    setError(null);
    socket.emit("room:create", { playerName, difficulty, password }, (response) => {
      if (!response.ok || !response.playerId) {
        setError(response.error ?? "No se pudo crear la sala.");
        return;
      }
      setPlayerId(response.playerId);
    });
  };

  const joinRoom = (playerName: string, roomCode: string) => {
    setError(null);
    socket.emit("room:join", { playerName, roomCode }, (response) => {
      if (!response.ok || !response.playerId) {
        setError(response.error ?? "No se pudo unir a la sala.");
        return;
      }
      setPlayerId(response.playerId);
      saveSession({ roomCode: roomCode.toUpperCase(), playerId: response.playerId, playerName });
    });
  };

  useEffect(() => {
    if (!room || !playerId || !me) {
      return;
    }

    const session = loadSession();
    saveSession({
      roomCode: room.code,
      playerId,
      playerName: session?.playerName ?? me.name,
    });
  }, [me, playerId, room]);

  const configureGame = (difficulty: DifficultyLevel, playlist: MiniGameType[]) => {
    if (!room) {
      return;
    }
    setError(null);
    socket.emit("game:configure", { roomCode: room.code, difficulty, playlist });
  };

  const startGame = () => {
    if (!room) {
      return;
    }
    setError(null);
    socket.emit("game:start", { roomCode: room.code });
  };

  const endGame = () => {
    if (!room) {
      return;
    }
    setError(null);
    socket.emit("game:end", { roomCode: room.code });
  };

  const restartGame = () => {
    if (!room) {
      return;
    }
    setError(null);
    socket.emit("game:restart", { roomCode: room.code });
  };

  const submitAnswer = (answer: string) => {
    if (!room) {
      return;
    }
    setError(null);
    socket.emit("round:submit", { roomCode: room.code, answer });
  };

  const sendDrawingStroke = (stroke: DrawingStroke) => {
    if (!room) {
      return;
    }
    socket.emit("drawing:stroke", { roomCode: room.code, stroke });
  };

  const clearDrawing = () => {
    if (!room) {
      return;
    }
    socket.emit("drawing:clear", { roomCode: room.code });
  };

  const kickPlayer = (targetPlayerId: string) => {
    if (!room) {
      return;
    }
    setError(null);
    socket.emit("room:kick", { roomCode: room.code, targetPlayerId });
  };

  const closeRoom = () => {
    if (!room) {
      return;
    }
    setError(null);
    socket.emit("room:close", { roomCode: room.code });
  };

  if (!room) {
    return <HomeScreen error={error} onCreateRoom={createRoom} onJoinRoom={joinRoom} />;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 md:px-6 md:py-8">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-gold/75">UNASLETAS AMANDA BLACK</p>
          <h1 className="mt-2 font-display text-3xl text-parchment md:text-5xl">{room.gameTitle}</h1>
          <p className="mt-2 max-w-3xl text-sm text-mist/70 md:text-base">{room.gameSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-mist/70 sm:flex sm:flex-wrap">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center">Sala {room.code}</div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center">
            {room.players.length} jugadores
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center capitalize">
            {room.selectedDifficulty}
          </div>
          {me ? <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center">{me.name}</div> : null}
          {me?.isHost ? (
            <button
              type="button"
              onClick={closeRoom}
              className="rounded-full border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-center font-semibold text-rose-100 transition hover:bg-rose-500/20"
            >
              Cerrar sala
            </button>
          ) : null}
        </div>
      </header>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.38fr_0.62fr]">
        <div>
          {room.phase === "lobby" ? (
            <LobbyScreen
              room={room}
              me={me}
              onConfigure={configureGame}
              onStart={startGame}
              onEnd={endGame}
              onKick={kickPlayer}
            />
          ) : null}
          {room.phase === "playing" ? (
            <RoundScreen
              room={room}
              me={me}
              onSubmit={submitAnswer}
              onEnd={endGame}
              onDrawingStroke={sendDrawingStroke}
              onClearDrawing={clearDrawing}
            />
          ) : null}
          {room.phase === "finished" ? <WinnerScreen room={room} me={me} onRestart={restartGame} /> : null}
        </div>

        <div className="space-y-6">
          <Scoreboard players={room.players} winners={room.winners} isPlaying={room.phase === "playing"} />
          <section className="panel p-5">
            <h3 className="font-display text-2xl text-parchment">Mision</h3>
            <div className="mt-4 space-y-3 text-sm leading-7 text-mist/80">
              <p>El anfitrion puede ordenar los minijuegos antes de lanzar la sala.</p>
              <p>Cada ronda suma puntos y el marcador se actualiza para todos en vivo.</p>
              <p>Crucigrama, sopa, dibujo y memorama comparten la misma partida.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
