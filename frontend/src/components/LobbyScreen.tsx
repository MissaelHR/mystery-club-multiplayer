import { DIFFICULTY_OPTIONS, MAX_PLAYERS, MIN_PLAYERS, PlayerPublic, RoomState } from "@shared/game";

interface LobbyScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onConfigure: (difficulty: (typeof DIFFICULTY_OPTIONS)[number]["id"]) => void;
  onStart: () => void;
  onKick: (targetPlayerId: string) => void;
}

export function LobbyScreen({ room, me, onConfigure, onStart, onKick }: LobbyScreenProps) {
  const canStart = room.players.length >= MIN_PLAYERS && Boolean(me?.isHost);
  const difficulty = room.availableDifficulties.find((item) => item.id === room.selectedDifficulty)!;

  return (
    <section className="panel-strong p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-gold/75">Sala {room.code}</p>
          <h2 className="mt-2 font-display text-4xl text-parchment">{room.gameTitle}</h2>
          <p className="mt-2 text-mist/80">{room.gameSubtitle}</p>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-gold/75">Dificultad</p>
          <p className="mt-1 text-xl font-semibold text-parchment">{difficulty.title}</p>
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
          <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-parchment">
                  {player.name}
                  {player.isHost ? <span className="ml-2 text-xs uppercase tracking-[0.2em] text-gold/75">Host</span> : null}
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
          <button
            onClick={onStart}
            disabled={!canStart}
            className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            Lanzar misión
          </button>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist/80">
            Esperando al host
          </div>
        )}
        {!canStart ? <p className="text-sm text-mist/70">Faltan jugadores.</p> : null}
        <p className="text-sm text-mist/70">
          {room.players.length}/{MAX_PLAYERS}
        </p>
      </div>
    </section>
  );
}
