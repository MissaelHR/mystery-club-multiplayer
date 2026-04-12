import { RoomState } from "@shared/game";

interface RevealScreenProps {
  room: RoomState;
}

export function RevealScreen({ room }: RevealScreenProps) {
  if (!room.reveal) {
    return null;
  }

  return (
    <section className="panel-strong p-8">
      <p className="text-sm uppercase tracking-[0.35em] text-gold/75">Revelación de la ronda</p>
      <h2 className="mt-3 font-display text-4xl text-parchment">{room.round?.title ?? "Avance del caso"}</h2>

      <div className="mt-8 rounded-3xl border border-gold/25 bg-gold/10 p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-gold/75">Respuesta correcta</p>
        <p className="mt-3 text-2xl text-parchment">{room.reveal.correctAnswer}</p>
        <p className="mt-4 leading-7 text-mist/85">{room.reveal.explanation}</p>
      </div>

      <div className="mt-6 grid gap-3">
        {room.reveal.results.map((result) => (
          <div key={result.playerId} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-parchment">{result.playerName}</p>
                <p className="mt-1 text-sm text-mist/65">
                  {result.answer ? `Respuesta: ${result.answer}` : "No envió respuesta"}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${result.isCorrect ? "text-emerald-300" : "text-rose-200"}`}>
                  {result.isCorrect ? "Correcta" : "Incorrecta"}
                </p>
                <p className="mt-1 text-lg text-gold">+{result.pointsEarned}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
