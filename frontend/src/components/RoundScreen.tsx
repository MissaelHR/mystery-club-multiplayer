import { FormEvent, useEffect, useState } from "react";
import { PlayerPublic, RoomState } from "@shared/game";

interface RoundScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onSubmit: (answer: string) => void;
}

export function RoundScreen({ room, me, onSubmit }: RoundScreenProps) {
  const stage = room.stage;
  const [answer, setAnswer] = useState("");
  const [memoryVisible, setMemoryVisible] = useState(true);
  const [sequenceSteps, setSequenceSteps] = useState<string[]>([]);
  const submittedAlready = Boolean(me?.answeredCurrentStage);
  const sequenceOptions = stage?.options ?? stage?.memorySequence ?? [];

  useEffect(() => {
    setAnswer("");
    setSequenceSteps([]);
  }, [room.currentStageNumber, room.phase, room.selectedMiniGameId]);

  useEffect(() => {
    if (!stage?.memorySequence || !stage.memoryRevealMs) {
      setMemoryVisible(true);
      return;
    }

    setMemoryVisible(true);
    const timeout = window.setTimeout(() => setMemoryVisible(false), stage.memoryRevealMs);
    return () => window.clearTimeout(timeout);
  }, [stage]);

  if (!stage) {
    return null;
  }

  const currentAnswer = stage.answerKind === "sequence" ? sequenceSteps.join(", ") : answer;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!currentAnswer.trim() || submittedAlready) {
      return;
    }
    onSubmit(currentAnswer);
  };

  const addStep = (step: string) => {
    if (submittedAlready) {
      return;
    }
    setSequenceSteps((current) => [...current, step]);
  };

  const clearSequence = () => {
    setSequenceSteps([]);
  };

  const removeLastStep = () => {
    setSequenceSteps((current) => current.slice(0, -1));
  };

  return (
    <section className="panel-strong p-5 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-gold/75">
            Etapa {room.currentStageNumber} de {room.totalStages}
          </p>
          <h2 className="mt-2 font-display text-4xl text-parchment">{room.selectedMiniGame.title}</h2>
          <p className="mt-2 text-lg text-mist/80">{stage.title}</p>
        </div>
        <div className="rounded-2xl border border-gold/25 bg-gold/10 px-5 py-3 text-right">
          <p className="text-xs uppercase tracking-[0.25em] text-gold/75">Modo</p>
          <p className="text-lg font-semibold text-parchment">Sin tiempo</p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm uppercase tracking-[0.25em] text-mist/50">{room.selectedMiniGame.kind.replace(/-/g, " ")}</p>
        <p className="mt-3 text-lg leading-8 text-mist/90">{stage.prompt}</p>
        <div className="mt-4 flex gap-2">
          {Array.from({ length: room.totalStages }).map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index < room.currentStageNumber ? "bg-gold" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {stage.memorySequence ? (
        <div className="mt-6 rounded-3xl border border-gold/25 bg-gold/10 p-5">
          <p className="text-sm uppercase tracking-[0.25em] text-gold/75">Vista de memoria</p>
          {memoryVisible ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {stage.memorySequence.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 font-semibold text-parchment"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-mist/80">La secuencia desapareció. Escríbela de memoria.</p>
          )}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
          <p className="text-sm uppercase tracking-[0.25em] text-mist/50">{stage.inputLabel}</p>

          {stage.answerKind === "single-choice" ? (
            <div className="mt-4 grid gap-3">
              {stage.options?.map((option) => {
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
          ) : stage.answerKind === "sequence" ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-gold/25 bg-gold/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/75">Tu secuencia</p>
                {sequenceSteps.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sequenceSteps.map((step, index) => (
                      <div
                        key={`${step}-${index}`}
                        className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 text-sm font-semibold text-parchment"
                      >
                        {index + 1}. {step}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-mist/75">Toca las piezas en orden.</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={removeLastStep}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist/85"
                  >
                    Borrar último
                  </button>
                  <button
                    type="button"
                    onClick={clearSequence}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist/85"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {sequenceOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => addStep(option)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left font-semibold text-mist/85 transition hover:border-gold/30 hover:bg-white/10"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="mt-4 min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-base text-white outline-none transition focus:border-gold/40"
              placeholder="Escribe tu respuesta aquí..."
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            disabled={submittedAlready}
            className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            Enviar respuesta
          </button>
          <p className="text-sm text-mist/70">Acierta para seguir. Si fallas, termina la misión.</p>
          {submittedAlready ? <p className="text-sm text-gold/80">Ya respondiste esta etapa.</p> : null}
        </div>
      </form>
    </section>
  );
}
