import { FormEvent, useEffect, useState } from "react";
import { PlayerPublic, RoomState } from "@shared/game";
import { useCountdown } from "../hooks/useCountdown";

interface RoundScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onSubmit: (answer: string) => void;
}

export function RoundScreen({ room, me, onSubmit }: RoundScreenProps) {
  const round = room.round;
  const countdown = useCountdown(round?.deadlineAt);
  const [answer, setAnswer] = useState("");
  const [memoryVisible, setMemoryVisible] = useState(true);

  useEffect(() => {
    setAnswer("");
  }, [room.currentRoundIndex, room.phase]);

  useEffect(() => {
    if (!round || round.type !== "memory-challenge" || !round.memoryRevealMs) {
      setMemoryVisible(true);
      return;
    }

    setMemoryVisible(true);
    const timeout = window.setTimeout(() => setMemoryVisible(false), round.memoryRevealMs);
    return () => window.clearTimeout(timeout);
  }, [round]);

  const submittedAlready = me ? room.submittedPlayerIds.includes(me.id) : false;

  if (!round) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim()) {
      return;
    }
    onSubmit(answer);
  };

  return (
    <section className="panel-strong p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-gold/75">
            Ronda {room.currentRoundIndex} de {room.totalRounds}
          </p>
          <h2 className="mt-3 font-display text-4xl text-parchment">{round.title}</h2>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-gold/10 px-5 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.25em] text-gold/75">Tiempo restante</p>
          <p className="text-3xl font-semibold text-parchment">{countdown}s</p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-mist/50">{round.type.replace("-", " ")}</p>
          <p className="mt-3 text-lg leading-8 text-mist/90">{round.storyText}</p>
        </div>

        {round.type === "memory-challenge" && round.memorySequence ? (
          <div className="rounded-3xl border border-gold/25 bg-gold/10 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-gold/75">Ventana de memoria</p>
            {memoryVisible ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {round.memorySequence.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 font-semibold text-parchment"
                  >
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-mist/80">El gabinete se cerró. Escribe la secuencia de memoria.</p>
            )}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-mist/50">{round.inputLabel}</p>
            <p className="mt-3 text-xl text-parchment">{round.prompt}</p>

            {round.answerKind === "single-choice" ? (
              <div className="mt-5 grid gap-3">
                {round.options?.map((option) => {
                  const active = answer === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswer(option)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-gold/60 bg-gold/15 text-parchment"
                          : "border-white/10 bg-white/5 text-mist/80 hover:border-gold/30 hover:bg-white/10"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                className="mt-5 min-h-32 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white outline-none transition focus:border-gold/40"
                placeholder="Escribe tu respuesta aquí..."
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300">
              Confirmar respuesta
            </button>
            <p className="text-sm text-mist/70">
              Cada respuesta correcta da 100 puntos, más hasta 60 puntos extra por velocidad.
            </p>
            {submittedAlready ? <p className="text-sm text-gold/80">Respuesta recibida.</p> : null}
          </div>
        </form>
      </div>
    </section>
  );
}
