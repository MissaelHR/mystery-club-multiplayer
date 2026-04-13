import { useEffect, useMemo, useState } from "react";
import { PlayerPublic, RoomState } from "@shared/game";
import { HomeScreen } from "./components/HomeScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { RoundScreen } from "./components/RoundScreen";
import { Scoreboard } from "./components/Scoreboard";
import { WinnerScreen } from "./components/WinnerScreen";
import { socket } from "./lib/socket";

function App() {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRoom = (nextRoom: RoomState) => {
      setRoom(nextRoom);
    };
    const handleError = (message: string) => {
      setError(message);
    };
    const handleConnectError = () => {
      setError("No se pudo conectar con el servidor del juego.");
    };

    socket.on("room:update", handleRoom);
    socket.on("room:error", handleError);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("room:update", handleRoom);
      socket.off("room:error", handleError);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  const me = useMemo<PlayerPublic | undefined>(
    () => room?.players.find((player) => player.id === playerId),
    [playerId, room?.players],
  );

  const createRoom = (playerName: string) => {
    setError(null);
    socket.emit("room:create", { playerName }, (response) => {
      if (!response.ok) {
        setError(response.error ?? "No se pudo crear la sala.");
        return;
      }
      setPlayerId(response.playerId ?? null);
    });
  };

  const joinRoom = (playerName: string, roomCode: string) => {
    setError(null);
    socket.emit("room:join", { playerName, roomCode }, (response) => {
      if (!response.ok) {
        setError(response.error ?? "No se pudo unir a la sala.");
        return;
      }
      setPlayerId(response.playerId ?? null);
    });
  };

  const startGame = () => {
    if (!room) {
      return;
    }
    setError(null);
    socket.emit("game:start", { roomCode: room.code });
  };

  const configureGame = (challengeId: string) => {
    if (!room) {
      return;
    }
    setError(null);
    socket.emit("game:configure", { roomCode: room.code, challengeId });
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

  if (!room) {
    return <HomeScreen error={error} onCreateRoom={createRoom} onJoinRoom={joinRoom} />;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-gold/75">UNASLETAS A LA PAGINA</p>
          <h1 className="mt-2 font-display text-4xl text-parchment">Retos Black en vivo</h1>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-mist/70">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Sala {room.code}</div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            {room.players.length} jugadores
          </div>
          {me ? <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">{me.name}</div> : null}
        </div>
      </header>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div>
          {room.phase === "lobby" ? (
            <LobbyScreen room={room} me={me} onConfigure={configureGame} onStart={startGame} />
          ) : null}
          {room.phase === "question" ? <RoundScreen room={room} me={me} onSubmit={submitAnswer} /> : null}
          {room.phase === "finished" ? <WinnerScreen room={room} me={me} onRestart={restartGame} /> : null}
        </div>

        <div className="space-y-6">
          <Scoreboard players={room.players} revealResults={room.reveal?.results} winners={room.winners} />
          <section className="panel p-5">
            <h3 className="font-display text-2xl text-parchment">Modo de juego</h3>
            <p className="mt-4 leading-7 text-mist/80">
              El anfitrión elige un capítulo del 20 al 29 y uno de sus tres minijuegos. Si alguien responde
              mal, la partida se cierra de inmediato.
            </p>
            <p className="mt-3 leading-7 text-mist/70">
              Las respuestas correctas suman 100 puntos más bonificación por velocidad. El marcador se ve
              siempre y solo el anfitrión puede reiniciar la siguiente partida.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
