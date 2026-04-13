import { PlayerPublic, RoomState } from "@shared/game";

interface WinnerScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onRestart: () => void;
}

export function WinnerScreen({ room, me, onRestart }: WinnerScreenProps) {
  if (!room.finished) {
    return null;
  }

  const champion = room.winners[0];

  return (
    <section className="panel-strong p-5 md:p-8">
      <p className="text-sm uppercase tracking-[0.35em] text-gold/75">Final</p>
      <h2 className="mt-3 font-display text-4xl text-parchment md:text-5xl">{room.finished.headline}</h2>
      <p className="mt-4 max-w-3xl text-base leading-8 text-mist/85 md:text-lg">{room.finished.explanation}</p>

      <div className="mt-6 grid gap-3">
        {room.winners.map((result, index) => (
          <div key={result.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-parchment">{result.name}</p>
                <p className="mt-1 text-sm text-mist/70">Puesto #{index + 1}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/70">Total</p>
                <p className="mt-1 text-lg text-gold">{result.score} pts</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {champion ? (
        <div className="mt-6 rounded-[2rem] border border-gold/25 bg-gold/10 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-gold/75">Ganador</p>
          <h3 className="mt-2 font-display text-4xl text-parchment">{champion.name}</h3>
          <p className="mt-2 text-xl text-gold">{champion.score} pts</p>
        </div>
      ) : null}

      <div className="mt-6">
        {me?.isHost ? (
          <button
            onClick={onRestart}
            className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Reiniciar partida
          </button>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist/75">
            Esperando a que el anfitrión reinicie la partida.
          </div>
        )}
      </div>
    </section>
  );
}
