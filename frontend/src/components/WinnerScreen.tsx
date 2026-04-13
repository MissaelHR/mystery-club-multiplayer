import { PlayerPublic, RoomState } from "@shared/game";

interface WinnerScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onRestart: () => void;
}

export function WinnerScreen({ room, me, onRestart }: WinnerScreenProps) {
  const champion = room.winners[0];
  const reveal = room.reveal;

  if (!reveal) {
    return null;
  }

  return (
    <section className="panel-strong p-8">
      <p className="text-sm uppercase tracking-[0.35em] text-gold/75">Partida finalizada</p>
      <h2 className="mt-3 font-display text-5xl text-parchment">{reveal.headline}</h2>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-mist/85">
        {room.selectedChallenge
          ? `Capítulo ${room.selectedChallenge.chapterNumber}: ${room.selectedChallenge.chapterTitle}. ${room.selectedChallenge.minigameTitle}.`
          : "La misión ha terminado."}
      </p>

      <div className="mt-8 rounded-3xl border border-gold/25 bg-gold/10 p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-gold/75">Respuesta correcta</p>
        <p className="mt-3 text-2xl text-parchment">{reveal.correctAnswer}</p>
        <p className="mt-4 leading-7 text-mist/85">{reveal.explanation}</p>
      </div>

      <div className="mt-6 grid gap-3">
        {reveal.results.map((result) => (
          <div key={result.playerId} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-parchment">{result.playerName}</p>
                <p className="mt-1 text-sm text-mist/70">
                  {result.answer ? `Respuesta: ${result.answer}` : "No alcanzó a responder"}
                </p>
              </div>
              <div className="text-right">
                <p className={result.isCorrect ? "text-emerald-300" : "text-rose-200"}>
                  {result.isCorrect ? "Correcta" : "Incorrecta"}
                </p>
                <p className="mt-1 text-lg text-gold">+{result.pointsEarned}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {champion ? (
        <div className="mt-8 rounded-[2rem] border border-gold/25 bg-gold/10 p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-gold/75">Líder del marcador</p>
          <h3 className="mt-3 font-display text-4xl text-parchment">{champion.name}</h3>
          <p className="mt-2 text-xl text-gold">{champion.score} puntos</p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {me?.isHost ? (
          <button
            onClick={onRestart}
            className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Reiniciar y volver al panel
          </button>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-mist/75">
            Esperando a que el anfitrión reinicie la siguiente partida.
          </div>
        )}
      </div>
    </section>
  );
}
