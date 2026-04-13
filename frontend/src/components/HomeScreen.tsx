import { FormEvent, useState } from "react";
import { MINI_GAME_CATALOG } from "@shared/game";

interface HomeScreenProps {
  error: string | null;
  onCreateRoom: (playerName: string, miniGameId: string) => void;
  onJoinRoom: (playerName: string, roomCode: string) => void;
}

export function HomeScreen({ error, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const [createName, setCreateName] = useState("");
  const [miniGameId, setMiniGameId] = useState(MINI_GAME_CATALOG[0].id);
  const [joinName, setJoinName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const selectedMiniGame = MINI_GAME_CATALOG.find((item) => item.id === miniGameId)!;

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    onCreateRoom(createName, miniGameId);
  };

  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    onJoinRoom(joinName, roomCode);
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 md:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-10">
      <section className="flex flex-col justify-between rounded-[2rem] border border-gold/20 bg-slate-950/60 p-6 shadow-glow backdrop-blur-xl md:p-8">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-gold/80">UNASLETAS AMANDA BLACK</p>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-display text-4xl leading-tight text-parchment md:text-6xl">
              Elige un reto. Crea la sala. Entra a jugar.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-mist/80 md:text-lg md:leading-8">
              Cinco minijuegos del capítulo 28. Rápidos, visuales y en vivo.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {MINI_GAME_CATALOG.map((miniGame) => (
            <div
              key={miniGame.id}
              className={`rounded-3xl border p-4 transition ${
                miniGame.id === miniGameId ? "border-gold/40 bg-gold/10" : "border-white/10 bg-white/5"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-gold/70">{miniGame.kind.replace(/-/g, " ")}</p>
              <p className="mt-2 font-display text-2xl text-parchment">{miniGame.title}</p>
              <p className="mt-2 text-sm leading-6 text-mist/75">{miniGame.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <form onSubmit={handleCreate} className="panel p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-gold/70">Crear minijuego y sala</p>
          <h2 className="mt-3 font-display text-3xl text-parchment">Anfitrión</h2>

          <label className="mt-6 block text-sm text-mist/80">
            Nombre del anfitrión
            <input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-gold/50"
              placeholder="Amanda"
              maxLength={18}
            />
          </label>

          <label className="mt-4 block text-sm text-mist/80">
            Minijuego del capítulo 28
            <select
              value={miniGameId}
              onChange={(event) => setMiniGameId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-gold/50"
            >
              {MINI_GAME_CATALOG.map((miniGame) => (
                <option key={miniGame.id} value={miniGame.id}>
                  {miniGame.title}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/75">Reto</p>
            <p className="mt-2 font-semibold text-parchment">{selectedMiniGame.title}</p>
            <p className="mt-2 text-sm leading-6 text-mist/80">{selectedMiniGame.summary}</p>
          </div>

          <button className="mt-6 w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">
            Crear sala
          </button>
        </form>

        <form onSubmit={handleJoin} className="panel p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-gold/70">Unirse a una sala</p>
          <h2 className="mt-3 font-display text-3xl text-parchment">Jugar</h2>

          <label className="mt-6 block text-sm text-mist/80">
            Nombre del jugador
            <input
              value={joinName}
              onChange={(event) => setJoinName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-gold/50"
              placeholder="Eric"
              maxLength={18}
            />
          </label>

          <label className="mt-4 block text-sm text-mist/80">
            Código de sala
            <input
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base uppercase tracking-[0.35em] text-white outline-none transition focus:border-gold/50"
              placeholder="AB12C"
              maxLength={5}
            />
          </label>

          <button className="mt-6 w-full rounded-2xl border border-gold/40 bg-transparent px-4 py-3 font-semibold text-parchment transition hover:bg-gold/10">
            Unirse a la sala
          </button>
        </form>

        {error ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
      </section>
    </div>
  );
}
