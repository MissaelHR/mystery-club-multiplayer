import { FormEvent, useEffect, useState } from "react";
import { PlayerPublic, RoomState, StagePublic } from "@shared/game";

interface RoundScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onSubmit: (answer: string) => void;
  onEnd: () => void;
}

function getModeCopy(stage: StagePublic) {
  switch (stage.mode) {
    case "memory":
      return { eyebrow: "Memoria flash", tone: "Mira, guarda y repite." };
    case "route":
      return { eyebrow: "Ruta secreta", tone: "Construye el camino sin romper la jugada." };
    case "signal":
      return { eyebrow: "Pulso rapido", tone: "Lee la escena y marca la jugada mas fuerte." };
    case "radar":
    default:
      return { eyebrow: "Radar tactico", tone: "Escanea la amenaza y bloquea tu eleccion." };
  }
}

export function RoundScreen({ room, me, onSubmit, onEnd }: RoundScreenProps) {
  const stage = room.stage;
  const [answer, setAnswer] = useState("");
  const [memoryVisible, setMemoryVisible] = useState(true);
  const [sequenceSteps, setSequenceSteps] = useState<string[]>([]);
  const submittedAlready = Boolean(me?.answeredCurrentStage);
  const sequenceOptions = stage?.options ?? stage?.memorySequence ?? [];

  useEffect(() => {
    setAnswer("");
    setSequenceSteps([]);
  }, [room.currentStageNumber, room.phase, room.selectedDifficulty]);

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
  const modeCopy = getModeCopy(stage);

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

  const isSequence = stage.answerKind === "sequence";

  return (
    <section className="panel-strong overflow-hidden p-5 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-gold/75">
            Etapa {room.currentStageNumber} de {room.totalStages}
          </p>
          <h2 className="mt-3 font-display text-4xl text-parchment md:text-5xl">{stage.title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-mist/85 md:text-lg">{stage.prompt}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-gold/75">Modo</p>
            <p className="mt-1 text-lg font-semibold text-parchment">{modeCopy.eyebrow}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Nivel</p>
            <p className="mt-1 text-lg font-semibold capitalize text-parchment">{room.selectedDifficulty}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-mist/55">{modeCopy.eyebrow}</p>
              <p className="mt-2 text-sm text-mist/70">{modeCopy.tone}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.25em] text-gold/75">
              {stage.inputLabel}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            {Array.from({ length: room.totalStages }).map((_, index) => (
              <div key={index} className={`h-2 flex-1 rounded-full ${index < room.currentStageNumber ? "bg-gold" : "bg-white/10"}`} />
            ))}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-950/55 p-5">
            <p className="text-sm text-mist/75">{stage.hint}</p>

            {stage.memorySequence ? (
              <div className="mt-4 rounded-[1.5rem] border border-gold/20 bg-gold/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Ventana de memoria</p>
                {memoryVisible ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {stage.memorySequence.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-center font-semibold text-parchment"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-mist/80">La memoria se cerró. Ahora ejecútala.</p>
                )}
              </div>
            ) : null}

            {isSequence ? (
              <div className="mt-5 rounded-[1.5rem] border border-cyan-200/10 bg-cyan-300/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/70">Combo actual</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={removeLastStep}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-mist/85"
                    >
                      Atras
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

                {sequenceSteps.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
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
                <p className="mt-4 text-sm text-mist/70">Pulsa las piezas en orden para armar la jugada.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-mist/50">Cabina</p>
              <p className="mt-2 text-sm text-mist/75">{submittedAlready ? "Jugada enviada" : "Tu turno sigue abierto"}</p>
            </div>
            {me?.isHost ? (
              <button
                type="button"
                onClick={onEnd}
                className="rounded-2xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
              >
                Finalizar
              </button>
            ) : null}
          </div>

          {stage.answerKind === "single-choice" ? (
            <div className="mt-6 grid gap-3">
              {stage.options?.map((option) => {
                const active = answer === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswer(option)}
                    className={`rounded-[1.5rem] border px-4 py-5 text-left transition ${
                      active
                        ? "border-gold/60 bg-gold/15 text-parchment shadow-glow"
                        : "border-white/10 bg-white/5 text-mist/85 hover:border-gold/30 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-base font-semibold">{option}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {sequenceOptions.map((option, index) => (
                <button
                  key={`${option}-${index}`}
                  type="button"
                  onClick={() => addStep(option)}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-5 text-left font-semibold text-mist/85 transition hover:border-gold/30 hover:bg-white/10"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              disabled={submittedAlready || !currentAnswer.trim()}
              className="rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              Bloquear jugada
            </button>
            <p className="text-sm text-mist/70">Cada ronda puede subir tu puesto.</p>
          </div>
        </form>
      </div>
    </section>
  );
}
