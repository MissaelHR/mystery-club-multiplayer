import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { DrawingStroke, PlayerPublic, RoomState, StagePublic } from "@shared/game";

interface RoundScreenProps {
  room: RoomState;
  me?: PlayerPublic;
  onSubmit: (answer: string) => void;
  onEnd: () => void;
  onDrawingStroke: (stroke: DrawingStroke) => void;
  onClearDrawing: () => void;
}

type CellPoint = [number, number];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildLetterCounts(letters: string[]) {
  return letters.reduce((accumulator, letter) => {
    accumulator.set(letter, (accumulator.get(letter) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());
}

function isSameCell(left: CellPoint, right: CellPoint) {
  return left[0] === right[0] && left[1] === right[1];
}

function matchesWordPath(selection: CellPoint[], path: CellPoint[]) {
  if (selection.length !== path.length) {
    return false;
  }

  const directMatch = selection.every((cell, index) => isSameCell(cell, path[index]));
  if (directMatch) {
    return true;
  }

  return selection.every((cell, index) => isSameCell(cell, path[path.length - 1 - index]));
}

function matchesWordPathPrefix(selection: CellPoint[], path: CellPoint[]) {
  if (selection.length > path.length) {
    return false;
  }

  const directMatch = selection.every((cell, index) => isSameCell(cell, path[index]));
  if (directMatch) {
    return true;
  }

  return selection.every((cell, index) => isSameCell(cell, path[path.length - 1 - index]));
}

function drawStrokes(canvas: HTMLCanvasElement, strokes: DrawingStroke[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const stroke of strokes) {
    if (stroke.points.length === 0) {
      continue;
    }
    const firstPoint = stroke.points[0];
    const firstX = firstPoint.x * canvas.width;
    const firstY = firstPoint.y * canvas.height;

    if (stroke.points.length === 1) {
      ctx.beginPath();
      ctx.fillStyle = stroke.color;
      ctx.arc(firstX, firstY, Math.max(stroke.size / 2, 2), 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(firstX, firstY);
    for (const point of stroke.points.slice(1)) {
      ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
    }
    ctx.stroke();
  }
}

function getCanvasPoint(canvas: HTMLCanvasElement, event: PointerEvent<HTMLCanvasElement>) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
  };
}

function getMiniGameLabel(stage: StagePublic) {
  switch (stage.miniGameType) {
    case "crucigrama":
      return "Crucigrama";
    case "sopa":
      return "Sopa de letras";
    case "dibujo":
      return "Dibujo en vivo";
    case "memorama":
    default:
      return "Memorama";
  }
}

export function RoundScreen({ room, me, onSubmit, onEnd, onDrawingStroke, onClearDrawing }: RoundScreenProps) {
  const stage = room.stage;
  const [crosswordLetters, setCrosswordLetters] = useState<string[]>([]);
  const [selectedCrosswordCell, setSelectedCrosswordCell] = useState<number>(0);
  const [selectedWordCells, setSelectedWordCells] = useState<CellPoint[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [drawingAnswer, setDrawingAnswer] = useState("");
  const [memoryFlipped, setMemoryFlipped] = useState<string[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<string[]>([]);
  const [drawingColor, setDrawingColor] = useState("#f8fafc");
  const [drawingSize, setDrawingSize] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingPointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const isPointerDownRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stage) {
      return;
    }

    setSelectedWordCells([]);
    setFoundWords([]);
    setDrawingAnswer("");
    setMemoryFlipped([]);
    setMemoryMatched([]);
    setSelectedCrosswordCell(0);

    if (stage.crossword) {
      setCrosswordLetters(Array(stage.crossword.slots.length).fill(""));
    } else {
      setCrosswordLetters([]);
    }
  }, [stage?.id]);

  useEffect(() => {
    if (!stage?.drawing || !canvasRef.current) {
      return;
    }
    drawStrokes(canvasRef.current, stage.drawing.strokes);
  }, [stage?.drawing]);

  const submittedAlready = Boolean(me?.answeredCurrentStage);
  const isDrawer = stage?.miniGameType === "dibujo" && stage.drawing?.drawerPlayerId === me?.id;
  const crosswordBankCounts = useMemo(
    () => (stage?.crossword ? buildLetterCounts(stage.crossword.letterBank) : new Map<string, number>()),
    [stage?.crossword],
  );
  const crosswordPlacedCounts = useMemo(
    () => buildLetterCounts(crosswordLetters.filter(Boolean)),
    [crosswordLetters],
  );
  const wordSearchSelection = useMemo(() => {
    if (!stage?.wordSearch) {
      return "";
    }
    return selectedWordCells.map(([row, col]) => stage.wordSearch?.grid[row][col] ?? "").join("");
  }, [selectedWordCells, stage?.wordSearch]);
  const foundWordCells = useMemo(() => {
    if (!stage?.wordSearch) {
      return new Set<string>();
    }

    return stage.wordSearch.paths.reduce((accumulator, entry) => {
      if (foundWords.includes(entry.word.toUpperCase())) {
        entry.cells.forEach(([row, col]) => accumulator.add(`${row}-${col}`));
      }
      return accumulator;
    }, new Set<string>());
  }, [foundWords, stage?.wordSearch]);

  const memoryAnswer = useMemo(() => [...memoryMatched].sort().join("|"), [memoryMatched]);

  const crosswordAnswer = useMemo(() => crosswordLetters.join(""), [crosswordLetters]);
  const sopaAnswer = useMemo(() => [...foundWords].sort().join("|"), [foundWords]);
  const crosswordActiveLetter = crosswordLetters[selectedCrosswordCell] ?? "";
  const unresolvedWordPaths = useMemo(
    () => (stage?.wordSearch ? stage.wordSearch.paths.filter((entry) => !foundWords.includes(entry.word.toUpperCase())) : []),
    [foundWords, stage?.wordSearch],
  );

  const handleCrosswordLetter = (letter: string) => {
    const bankTotal = crosswordBankCounts.get(letter) ?? 0;
    const placedTotal = crosswordPlacedCounts.get(letter) ?? 0;
    const effectivePlacedTotal = crosswordActiveLetter === letter ? placedTotal - 1 : placedTotal;

    if (effectivePlacedTotal >= bankTotal) {
      return;
    }

    setCrosswordLetters((current) => {
      const next = [...current];
      next[selectedCrosswordCell] = letter;
      return next;
    });
    setSelectedCrosswordCell((current) =>
      stage?.crossword ? Math.min(current + 1, stage.crossword.slots.length - 1) : current,
    );
  };

  const clearCrosswordCell = () => {
    setCrosswordLetters((current) => {
      const next = [...current];
      next[selectedCrosswordCell] = "";
      return next;
    });
  };

  const toggleWordSearchCell = (cell: CellPoint) => {
    setSelectedWordCells((current) => {
      if (foundWordCells.has(`${cell[0]}-${cell[1]}`)) {
        return current;
      }

      const lastCell = current[current.length - 1];
      if (lastCell && isSameCell(lastCell, cell)) {
        return current.slice(0, -1);
      }

      const existsEarlier = current.some(([row, col]) => row === cell[0] && col === cell[1]);
      if (existsEarlier) {
        return current;
      }

      const candidate = [...current, cell];
      const matchesAnyPrefix = unresolvedWordPaths.some((entry) => matchesWordPathPrefix(candidate, entry.cells));

      if (!matchesAnyPrefix) {
        return current;
      }

      return candidate;
    });
  };

  const lockFoundWord = () => {
    if (!stage?.wordSearch) {
      return;
    }

    const matchedEntry = stage.wordSearch.paths.find(
      (entry) => !foundWords.includes(entry.word.toUpperCase()) && matchesWordPath(selectedWordCells, entry.cells),
    );

    if (!matchedEntry) {
      return;
    }

    setFoundWords((current) => [...current, matchedEntry.word.toUpperCase()]);
    setSelectedWordCells([]);
  };

  const handleMemoryFlip = (cardId: string) => {
    if (!stage?.memory || memoryFlipped.includes(cardId) || submittedAlready) {
      return;
    }

    const nextFlipped = [...memoryFlipped, cardId];
    setMemoryFlipped(nextFlipped);

    if (nextFlipped.length < 2) {
      return;
    }

    const [firstId, secondId] = nextFlipped;
    const firstCard = stage.memory.cards.find((card) => card.id === firstId);
    const secondCard = stage.memory.cards.find((card) => card.id === secondId);

    if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
      if (!memoryMatched.includes(firstCard.pairId)) {
        setMemoryMatched((current) => [...current, firstCard.pairId]);
      }
      window.setTimeout(() => setMemoryFlipped([]), 250);
      return;
    }

    window.setTimeout(() => setMemoryFlipped([]), 600);
  };

  const submitCurrentStage = () => {
    if (!stage || submittedAlready || isDrawer) {
      return;
    }

    switch (stage.miniGameType) {
      case "crucigrama":
        if (!crosswordLetters.every(Boolean)) {
          return;
        }
        onSubmit(crosswordAnswer);
        break;
      case "sopa":
        if (!stage.wordSearch || foundWords.length !== stage.wordSearch.words.length) {
          return;
        }
        onSubmit(sopaAnswer);
        break;
      case "dibujo":
        if (!drawingAnswer.trim()) {
          return;
        }
        onSubmit(drawingAnswer.trim());
        break;
      case "memorama":
        if (!stage.memory || memoryMatched.length !== stage.memory.cards.length / 2) {
          return;
        }
        onSubmit(memoryAnswer);
        break;
    }
  };

  const currentSelectionReady =
    (stage?.miniGameType === "crucigrama" && crosswordLetters.every(Boolean)) ||
    (stage?.miniGameType === "sopa" && stage.wordSearch && foundWords.length === stage.wordSearch.words.length) ||
    (stage?.miniGameType === "dibujo" && Boolean(drawingAnswer.trim())) ||
    (stage?.miniGameType === "memorama" && stage.memory && memoryMatched.length === stage.memory.cards.length / 2);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !canvasRef.current) {
      return;
    }

    event.preventDefault();
    canvasRef.current.setPointerCapture(event.pointerId);
    isPointerDownRef.current = true;
    activePointerIdRef.current = event.pointerId;
    drawingPointsRef.current = [getCanvasPoint(canvasRef.current, event)];
    drawStrokes(canvasRef.current, [
      ...(stage.drawing?.strokes ?? []),
      { color: drawingColor, size: drawingSize, points: drawingPointsRef.current },
    ]);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !canvasRef.current || !isPointerDownRef.current || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    event.preventDefault();
    drawingPointsRef.current = [...drawingPointsRef.current, getCanvasPoint(canvasRef.current, event)];
    drawStrokes(canvasRef.current, [
      ...(stage.drawing?.strokes ?? []),
      { color: drawingColor, size: drawingSize, points: drawingPointsRef.current },
    ]);
  };

  const commitStroke = (event?: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer) {
      return;
    }

    event?.preventDefault();
    if (canvasRef.current && event && canvasRef.current.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }

    if (drawingPointsRef.current.length === 0) {
      isPointerDownRef.current = false;
      activePointerIdRef.current = null;
      drawingPointsRef.current = [];
      return;
    }

    onDrawingStroke({
      color: drawingColor,
      size: drawingSize,
      points: drawingPointsRef.current,
    });
    isPointerDownRef.current = false;
    activePointerIdRef.current = null;
    drawingPointsRef.current = [];
  };

  if (!stage) {
    return null;
  }

  return (
    <section className="panel-strong overflow-hidden p-5 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-gold/75">
            Ronda {room.currentStageNumber} de {room.totalStages}
          </p>
          <h2 className="mt-3 font-display text-4xl text-parchment md:text-5xl">{stage.title}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-mist/85 md:text-lg">{stage.prompt}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-gold/75">Minijuego</p>
            <p className="mt-1 text-lg font-semibold text-parchment">{getMiniGameLabel(stage)}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-mist/60">Puntaje</p>
            <p className="mt-1 text-lg font-semibold text-parchment">{stage.pointsLabel}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {Array.from({ length: room.totalStages }).map((_, index) => (
          <div key={index} className={`h-2 flex-1 rounded-full ${index < room.currentStageNumber ? "bg-gold" : "bg-white/10"}`} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-mist/55">Instrucciones</p>
          <p className="mt-3 text-sm leading-7 text-mist/80">{stage.instructions}</p>

          {stage.miniGameType === "crucigrama" && stage.crossword ? (
            <div className="mt-6">
              {(() => {
                const crossword = stage.crossword!;
                return (
                  <>
              <div className="rounded-[1.75rem] border border-gold/20 bg-gold/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Pista</p>
                <p className="mt-2 text-base text-parchment">{crossword.clue}</p>
              </div>

              <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${crossword.size}, minmax(0, 1fr))` }}>
                {Array.from({ length: crossword.size * crossword.size }).map((_, index) => {
                  const row = Math.floor(index / crossword.size);
                  const col = index % crossword.size;
                  const slotIndex = crossword.slots.findIndex(([slotRow, slotCol]) => slotRow === row && slotCol === col);
                  const isBlocked = crossword.blocks.some(([blockRow, blockCol]) => blockRow === row && blockCol === col);

                  if (isBlocked) {
                    return <div key={index} className="aspect-square rounded-2xl bg-black/30" />;
                  }

                  const active = slotIndex === selectedCrosswordCell;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedCrosswordCell(slotIndex)}
                      className={`aspect-square rounded-2xl border text-xl font-semibold transition ${
                        active ? "border-gold bg-gold/15 text-parchment" : "border-white/10 bg-slate-950/60 text-mist/85"
                      }`}
                    >
                      {crosswordLetters[slotIndex] || ""}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {crossword.letterBank.map((letter, index) => (
                  (() => {
                    const available =
                      (crosswordBankCounts.get(letter) ?? 0) -
                      ((crosswordPlacedCounts.get(letter) ?? 0) - (crosswordActiveLetter === letter ? 1 : 0));

                    return (
                      <button
                        key={`${letter}-${index}`}
                        type="button"
                        disabled={available <= 0}
                        onClick={() => handleCrosswordLetter(letter)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-parchment transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        {letter}
                      </button>
                    );
                  })()
                ))}
                <button
                  type="button"
                  onClick={clearCrosswordCell}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-mist/80"
                >
                  Borrar
                </button>
              </div>
                  </>
                );
              })()}
            </div>
          ) : null}

          {stage.miniGameType === "sopa" && stage.wordSearch ? (
            <div className="mt-6">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${stage.wordSearch.grid[0].length}, minmax(0, 1fr))` }}>
                {stage.wordSearch.grid.map((row, rowIndex) =>
                  row.map((letter, colIndex) => {
                    const selected = selectedWordCells.some(([selectedRow, selectedCol]) => selectedRow === rowIndex && selectedCol === colIndex);
                    const found = foundWordCells.has(`${rowIndex}-${colIndex}`);
                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        type="button"
                        onClick={() => toggleWordSearchCell([rowIndex, colIndex])}
                        className={`aspect-square rounded-2xl border text-sm font-semibold transition sm:text-lg ${
                          selected
                            ? "border-cyan-300 bg-cyan-300/15 text-parchment"
                            : found
                              ? "border-emerald-300/30 bg-emerald-400/10 text-parchment"
                              : "border-white/10 bg-slate-950/60 text-mist/85"
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  }),
                )}
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-cyan-200/10 bg-cyan-300/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/70">Seleccion actual</p>
                <p className="mt-2 text-xl tracking-[0.3em] text-parchment">{wordSearchSelection || "..."}</p>
                <p className="mt-2 text-sm leading-6 text-cyan-50/70">
                  La seleccion debe seguir un recorrido continuo valido. Solo puedes avanzar o retroceder sobre la ruta.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={lockFoundWord}
                    className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    Marcar palabra
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWordCells([])}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist/80"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {stage.wordSearch.words.map((word) => {
                  const found = foundWords.includes(word.toUpperCase());
                  return (
                    <div
                      key={word}
                      className={`rounded-2xl border px-4 py-3 ${found ? "border-emerald-300/30 bg-emerald-400/10" : "border-white/10 bg-white/5"}`}
                    >
                      <p className="font-semibold text-parchment">{word}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {stage.miniGameType === "dibujo" && stage.drawing ? (
            <div className="mt-6">
              <canvas
                ref={canvasRef}
                width={720}
                height={420}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={commitStroke}
                onPointerCancel={commitStroke}
                onPointerLeave={commitStroke}
                onContextMenu={(event) => event.preventDefault()}
                className={`w-full select-none rounded-[1.75rem] border border-white/10 bg-slate-950 ${isDrawer ? "cursor-crosshair" : "cursor-default"}`}
                style={{ touchAction: "none" }}
              />

              {isDrawer ? (
                <div className="mt-4 rounded-[1.5rem] border border-gold/20 bg-gold/10 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Tu palabra</p>
                  <p className="mt-2 font-display text-3xl text-parchment">{stage.drawing.promptForDrawer}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {stage.drawing.brushPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setDrawingColor(color)}
                        className={`h-10 w-10 rounded-full border ${drawingColor === color ? "border-gold" : "border-white/10"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setDrawingSize((current) => Math.max(4, current - 2))}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist/80"
                    >
                      Pincel -
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawingSize((current) => Math.min(16, current + 2))}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist/80"
                    >
                      Pincel +
                    </button>
                    <button
                      type="button"
                      onClick={onClearDrawing}
                      className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100"
                    >
                      Limpiar lienzo
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {stage.drawing.answerMode === "options" ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {stage.drawing.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setDrawingAnswer(option)}
                          className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                            drawingAnswer === option
                              ? "border-gold/60 bg-gold/15 text-parchment"
                              : "border-white/10 bg-white/5 text-mist/85 hover:bg-white/10"
                          }`}
                        >
                          <p className="text-base font-semibold">{option}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-mist/55">Respuesta abierta</p>
                      <input
                        type="text"
                        value={drawingAnswer}
                        onChange={(event) => setDrawingAnswer(event.target.value)}
                        placeholder="Escribe lo que crees que esta dibujando"
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-parchment outline-none transition placeholder:text-mist/35 focus:border-gold/45"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}

          {stage.miniGameType === "memorama" && stage.memory ? (
            <div
              className="mt-6 grid gap-3"
              style={{ gridTemplateColumns: `repeat(${stage.memory.cards.length >= 18 ? 5 : 4}, minmax(0, 1fr))` }}
            >
              {stage.memory.cards.map((card) => {
                const opened = memoryFlipped.includes(card.id) || memoryMatched.includes(card.pairId);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleMemoryFlip(card.id)}
                    className={`aspect-[0.8] rounded-[1.5rem] border p-3 text-center transition ${
                      opened
                        ? `border-white/10 bg-gradient-to-br ${card.tint}`
                        : "border-white/10 bg-slate-950/70 hover:bg-slate-900"
                    }`}
                  >
                    {opened ? (
                      <div className="flex h-full flex-col items-center justify-center">
                        <div className="text-4xl">{card.icon}</div>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-parchment/80">{card.label}</p>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-gold/80">
                          ?
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-mist/50">Cabina</p>
              <p className="mt-2 text-sm text-mist/75">
                {submittedAlready ? "Tu jugada ya quedo enviada." : isDrawer ? "Estas dibujando para tu equipo." : "Aun puedes jugar esta ronda."}
              </p>
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

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-mist/55">Objetivo</p>
            <p className="mt-2 text-base leading-7 text-parchment">{stage.pointsLabel}</p>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-mist/55">Estado</p>
            <p className="mt-2 text-sm leading-7 text-mist/80">
              {stage.miniGameType === "crucigrama" ? `${crosswordLetters.filter(Boolean).length}/${stage.crossword?.slots.length ?? 0} letras colocadas` : null}
              {stage.miniGameType === "sopa" ? `${foundWords.length}/${stage.wordSearch?.words.length ?? 0} palabras encontradas` : null}
              {stage.miniGameType === "dibujo" && isDrawer ? "El lienzo esta abierto para ti." : null}
              {stage.miniGameType === "dibujo" && !isDrawer ? "Mira el dibujo y marca una opcion." : null}
              {stage.miniGameType === "memorama" ? `${memoryMatched.length}/${(stage.memory?.cards.length ?? 0) / 2} parejas completas` : null}
            </p>
          </div>

          {!isDrawer ? (
            <button
              type="button"
              disabled={submittedAlready || !currentSelectionReady}
              onClick={submitCurrentStage}
              className="mt-6 w-full rounded-2xl bg-gold px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-500"
            >
              Enviar jugada
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
