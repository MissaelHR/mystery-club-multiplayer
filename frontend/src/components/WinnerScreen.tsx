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
  const podium = room.winners.slice(0, 3);
  const secondPlace = podium[1];
  const thirdPlace = podium[2];

  return (
    <section className="panel-strong p-5 md:p-8">
      <p className="text-xs uppercase tracking-[0.45em] text-gold/75">
        {room.finished.outcome === "stopped" ? "Partida cerrada" : "Meta final"}
      </p>
      <h2 className="mt-3 font-display text-4xl text-parchment md:text-5xl">{room.finished.headline}</h2>
      <p className="mt-4 max-w-3xl text-base leading-8 text-mist/85 md:text-lg">{room.finished.explanation}</p>

      {champion ? (
        <div className="mt-8 rounded-[2.25rem] border border-white/10 bg-white/5 px-4 py-8">
          <div className="mx-auto flex max-w-5xl items-end justify-center gap-3 md:gap-6">
            {secondPlace ? (
              <div className="flex w-[30%] flex-col items-center">
                <div className="mb-4 w-full rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-mist/55">2do lugar</p>
                  <p className="mt-2 font-display text-3xl text-parchment">{secondPlace.name}</p>
                  <p className="mt-2 text-lg text-slate-200">{secondPlace.score} pts</p>
                </div>
                <div className="flex h-28 w-full items-center justify-center rounded-t-[1.75rem] bg-slate-300/80 text-3xl font-black text-slate-950">
                  2
                </div>
              </div>
            ) : null}

            <div className="flex w-[34%] flex-col items-center">
              <div className="mb-4 w-full rounded-[2rem] border border-gold/30 bg-gold/10 p-5 text-center shadow-glow">
                <p className="text-xs uppercase tracking-[0.3em] text-gold/75">Primer lugar</p>
                <p className="mt-3 font-display text-4xl text-parchment md:text-5xl">{champion.name}</p>
                <p className="mt-3 text-2xl text-gold">{champion.score} pts</p>
              </div>
              <div className="flex h-40 w-full items-center justify-center rounded-t-[2rem] bg-gold text-4xl font-black text-slate-950">
                1
              </div>
            </div>

            {thirdPlace ? (
              <div className="flex w-[30%] flex-col items-center">
                <div className="mb-4 w-full rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-mist/55">3er lugar</p>
                  <p className="mt-2 font-display text-3xl text-parchment">{thirdPlace.name}</p>
                  <p className="mt-2 text-lg text-amber-200">{thirdPlace.score} pts</p>
                </div>
                <div className="flex h-20 w-full items-center justify-center rounded-t-[1.75rem] bg-amber-700/90 text-3xl font-black text-amber-50">
                  3
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {room.winners.map((result, index) => (
          <div key={result.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-parchment">{result.name}</p>
                <p className="mt-1 text-sm text-mist/70">Puesto #{index + 1}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/70">Total</p>
                <p className="mt-1 text-lg text-gold">{result.score} puntos</p>
              </div>
            </div>
          </div>
        ))}
      </div>

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
