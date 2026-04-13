import { DIFFICULTY_OPTIONS, MAX_PLAYERS, MIN_PLAYERS, PlayerPublic, RoomState } from "@shared/game";

interface LobbyScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onConfigure: (difficulty: (typeof DIFFICULTY_OPTIONS)[number]["id"]) => void;
  onStart: () => void;
  onEnd: () => void;
  onKick: (targetPlayerId: string) => void;
}

export function LobbyScreen({ room, me, onConfigure, onStart, onEnd, onKick }: LobbyScreenProps) {
  const canStart = room.players.length >= MIN_PLAYERS && Boolean(me?.isHost);
  const difficulty = room.availableDifficulties.find((item) => item.id === room.selectedDifficulty)!;

  return (
    <section className="panel-strong overflow-hidden p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold/75">Sala {room.code}</p>
          <h2 className="mt-2 font-display text-4xl text-parchment md:text-5xl">{room.gameTitle}</h2>
          <p className="mt-2 max-w-2xl text-mist/80">{room.gameSubtitle}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-gold/75">Dificultad</p>
            <p className="mt-1 text-xl font-semibold text-parchment">{difficulty.title}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Equipo</p>
            <p className="mt-1 text-xl font-semibold text-parchment">
              {room.players.length}/{MAX_PLAYERS}
            </p>
          </div>
        </div>
      </div>

      {me?.isHost ? (
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {room.availableDifficulties.map((option) => {
            const active = option.id === room.selectedDifficulty;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onConfigure(option.id)}
                className={`rounded-3xl border p-4 text-left transition ${
                  active ? "border-gold/50 bg-gold/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70">{option.badge}</p>
                <p className="mt-2 font-display text-2xl text-parchment">{option.title}</p>
                <p className="mt-2 text-sm leading-6 text-mist/75">{option.summary}</p>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {room.players.map((player) => (
          <div key={player.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-parchment">
                  {player.name}
                  {player.isHost ? (
                    <span className="ml-2 text-xs uppercase tracking-[0.2em] text-gold/75">Anfitrion</span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-mist/65">{player.connected ? "Listo" : "Fuera"}</p>
              </div>
              {me?.isHost && !player.isHost ? (
                <button
                  type="button"
                  onClick={() => onKick(player.id)}
                  className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-100"
                >
                  Sacar
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        {me?.isHost ? (
          <>
            <button
              onClick={onStart}
              disabled={!canStart}
              className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              Lanzar misión
            </button>
            <button
              onClick={onEnd}
              className="rounded-2xl border border-rose-300/30 bg-rose-500/10 px-6 py-3 font-semibold text-rose-100 transition hover:bg-rose-500/20"
            >
              Finalizar
            </button>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist/80">
            Esperando al anfitrion
          </div>
        )}
        {!canStart ? <p className="text-sm text-mist/70">Faltan jugadores.</p> : null}
        <p className="text-sm text-mist/70">Cuando el anfitrion lance la mision, todos entran juntos.</p>
      </div>
    </section>
  );
}
