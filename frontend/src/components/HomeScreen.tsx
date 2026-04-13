import { FormEvent, useState } from "react";
import { DIFFICULTY_OPTIONS, GAME_SUBTITLE, GAME_TITLE, MINI_GAME_CATALOG, ROOM_CREATE_PASSWORD } from "@shared/game";

interface HomeScreenProps {
  error: string | null;
  onCreateRoom: (playerName: string, difficulty: (typeof DIFFICULTY_OPTIONS)[number]["id"], password: string) => void;
  onJoinRoom: (playerName: string, roomCode: string) => void;
}

export function HomeScreen({ error, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const [createName, setCreateName] = useState("");
  const [difficulty, setDifficulty] = useState(DIFFICULTY_OPTIONS[0].id);
  const [createPassword, setCreatePassword] = useState("");
  const [joinName, setJoinName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const selectedDifficulty = DIFFICULTY_OPTIONS.find((item) => item.id === difficulty)!;

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    onCreateRoom(createName, difficulty, createPassword);
  };

  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    onJoinRoom(joinName, roomCode);
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-5 md:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-8">
      <section className="panel-strong relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute -left-12 top-6 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="absolute bottom-6 left-1/3 h-44 w-44 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.5em] text-gold/80">UNASLETAS AMANDA BLACK</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-none text-parchment md:text-7xl">{GAME_TITLE}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-mist/80 md:text-xl md:leading-9">{GAME_SUBTITLE}</p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-mist/65">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Salas en vivo</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Lienzo compartido</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Tableros interactivos</span>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
          {MINI_GAME_CATALOG.map((miniGame) => (
            <div key={miniGame.id} className={`rounded-3xl border border-white/10 bg-gradient-to-br ${miniGame.accent} p-5`}>
              <p className="text-xs uppercase tracking-[0.25em] text-mist/60">{miniGame.id}</p>
              <p className="mt-2 font-display text-3xl text-parchment">{miniGame.title}</p>
              <p className="mt-2 text-sm leading-6 text-mist/80">{miniGame.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <form onSubmit={handleCreate} className="panel p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/70">Crear</p>
          <h2 className="mt-3 font-display text-3xl text-parchment">Cabina anfitrion</h2>

          <label className="mt-6 block text-sm text-mist/80">
            Nombre
            <input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-gold/50"
              placeholder="Amanda"
              maxLength={18}
            />
          </label>

          <label className="mt-4 block text-sm text-mist/80">
            Contraseña de anfitrión
            <input
              value={createPassword}
              onChange={(event) => setCreatePassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-gold/50"
              placeholder={ROOM_CREATE_PASSWORD}
            />
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setDifficulty(option.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  option.id === difficulty
                    ? "border-gold/50 bg-gold/10 shadow-glow"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70">{option.badge}</p>
                <p className="mt-2 font-semibold text-parchment">{option.title}</p>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/75">Dificultad</p>
            <p className="mt-2 font-semibold text-parchment">{selectedDifficulty.title}</p>
            <p className="mt-1 text-sm text-mist/80">{selectedDifficulty.summary}</p>
          </div>

          <button className="mt-6 w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">
            Crear sala arcade
          </button>
        </form>

        <form onSubmit={handleJoin} className="panel p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/70">Unirse</p>
          <h2 className="mt-3 font-display text-3xl text-parchment">Entrada rapida</h2>

          <label className="mt-6 block text-sm text-mist/80">
            Nombre
            <input
              value={joinName}
              onChange={(event) => setJoinName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-gold/50"
              placeholder="Eric"
              maxLength={18}
            />
          </label>

          <label className="mt-4 block text-sm text-mist/80">
            Sala
            <input
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base uppercase tracking-[0.35em] text-white outline-none transition focus:border-gold/50"
              placeholder="AB12C"
              maxLength={5}
            />
          </label>

          <button className="mt-6 w-full rounded-2xl border border-gold/40 bg-transparent px-4 py-3 font-semibold text-parchment transition hover:bg-gold/10">
            Entrar a la sala
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
