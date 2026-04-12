import { MAX_PLAYERS, MIN_PLAYERS, PlayerPublic, RoomState } from "@shared/game";

interface LobbyScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onStart: () => void;
}

export function LobbyScreen({ room, me, onStart }: LobbyScreenProps) {
  const canStart = room.players.length >= MIN_PLAYERS && Boolean(me?.isHost);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="panel-strong p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-gold/75">Sala privada</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <h2 className="font-display text-4xl text-parchment">Sala {room.code}</h2>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist/75">
            {room.players.length}/{MAX_PLAYERS} detectives
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-mist/80">
          Reúne a tu equipo, comparte el código de la sala y empieza cuando se hayan unido al menos{" "}
          {MIN_PLAYERS} jugadores.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {room.players.map((player) => (
            <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="font-semibold text-parchment">{player.name}</p>
              <p className="mt-1 text-sm text-mist/65">
                {player.isHost ? "Anfitrión" : "Jugador"} {player.connected ? "conectado" : "desconectado"}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          {me?.isHost ? (
            <button
              onClick={onStart}
              disabled={!canStart}
              className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              Iniciar misterio
            </button>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist/80">
              Esperando a que el anfitrión inicie la partida.
            </div>
          )}
          {!canStart && me?.isHost ? (
            <p className="text-sm text-mist/70">Necesitas al menos {MIN_PLAYERS} jugadores para comenzar.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
