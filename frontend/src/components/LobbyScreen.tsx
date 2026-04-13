import { MAX_PLAYERS, MIN_PLAYERS, PlayerPublic, RoomState } from "@shared/game";

interface LobbyScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onConfigure: (miniGameId: string) => void;
  onStart: () => void;
  onKick: (targetPlayerId: string) => void;
}

export function LobbyScreen({ room, me, onConfigure, onStart, onKick }: LobbyScreenProps) {
  const canStart = room.players.length >= MIN_PLAYERS && Boolean(me?.isHost);

  return (
    <section className="panel-strong p-5 md:p-8">
      <p className="text-sm uppercase tracking-[0.35em] text-gold/75">Sala activa</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h2 className="font-display text-4xl text-parchment">Sala {room.code}</h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist/75">
          {room.players.length}/{MAX_PLAYERS} jugadores
        </span>
      </div>

      <div className="mt-6 rounded-3xl border border-gold/20 bg-black/20 p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-gold/75">Minijuego creado</p>
        <h3 className="mt-2 font-display text-3xl text-parchment">{room.selectedMiniGame.title}</h3>
        <p className="mt-2 text-mist/80">{room.selectedMiniGame.summary}</p>

        {me?.isHost ? (
          <div className="mt-4">
            <label className="block text-sm text-mist/75">Cambiar minijuego</label>
            <select
              value={room.selectedMiniGameId}
              onChange={(event) => onConfigure(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none md:max-w-md"
            >
              {room.availableMiniGames.map((miniGame) => (
                <option key={miniGame.id} value={miniGame.id}>
                  {miniGame.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {room.players.map((player) => (
          <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-parchment">
                  {player.name}
                  {player.isHost ? <span className="ml-2 text-xs uppercase tracking-[0.2em] text-gold/75">Host</span> : null}
                </p>
                <p className="mt-1 text-sm text-mist/65">{player.connected ? "Conectado" : "Desconectado"}</p>
              </div>
              {me?.isHost && !player.isHost ? (
                <button
                  type="button"
                  onClick={() => onKick(player.id)}
                  className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-100"
                >
                  Expulsar
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
            Iniciar minijuego
          </button>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist/80">
            Esperando a que el anfitrión inicie la partida.
          </div>
        )}
        {!canStart ? (
          <p className="text-sm text-mist/70">Se necesitan al menos {MIN_PLAYERS} jugadores para comenzar.</p>
        ) : null}
      </div>
    </section>
  );
}
