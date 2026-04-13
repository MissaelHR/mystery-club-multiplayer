import { FormEvent, useState } from "react";

interface HomeScreenProps {
  error: string | null;
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (playerName: string, roomCode: string) => void;
}

export function HomeScreen({ error, onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    onCreateRoom(createName);
  };

  const handleJoin = (event: FormEvent) => {
    event.preventDefault();
    onJoinRoom(joinName, roomCode);
  };

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="flex flex-col justify-between rounded-[2rem] border border-gold/20 bg-slate-950/60 p-8 shadow-glow backdrop-blur-xl">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-gold/80">UNASLETAS A LA PAGINA</p>
          <div className="space-y-4">
            <h1 className="max-w-2xl font-display text-5xl leading-tight text-parchment md:text-6xl">
              El anfitrión elige capítulo, minijuego y misión. Todos compiten en directo por sobrevivir a la página.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-mist/80">
              Crea una sala privada, invita de 2 a 6 jugadores y juega retos inspirados en los capítulos
              20 al 29. Si alguien falla, la partida se cierra y el anfitrión decide el siguiente reto.
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-4 text-sm text-mist/75 md:grid-cols-3">
          <div className="panel p-4">
            <p className="font-semibold text-parchment">Capítulos 20 al 29</p>
            <p className="mt-2">Cada capítulo ofrece 3 minijuegos distintos para elegir.</p>
          </div>
          <div className="panel p-4">
            <p className="font-semibold text-parchment">Partida de alto riesgo</p>
            <p className="mt-2">Un error cierra la misión. La velocidad y los aciertos suman puntos.</p>
          </div>
          <div className="panel p-4">
            <p className="font-semibold text-parchment">Mando del anfitrión</p>
            <p className="mt-2">El anfitrión selecciona capítulo, reto y reinicio de la sala.</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <form onSubmit={handleCreate} className="panel p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-gold/70">Crear una sala</p>
          <h2 className="mt-3 font-display text-3xl text-parchment">Comenzar el caso</h2>
          <label className="mt-6 block text-sm text-mist/80">
            Nombre del detective
            <input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-gold/50"
              placeholder="Avery"
              maxLength={18}
            />
          </label>
          <button className="mt-6 w-full rounded-2xl bg-gold px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">
            Crear sala
          </button>
        </form>

        <form onSubmit={handleJoin} className="panel p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-gold/70">Unirse a una sala</p>
          <h2 className="mt-3 font-display text-3xl text-parchment">Entrar a la mansión</h2>
          <label className="mt-6 block text-sm text-mist/80">
            Nombre del detective
            <input
              value={joinName}
              onChange={(event) => setJoinName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-gold/50"
              placeholder="Rin"
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
