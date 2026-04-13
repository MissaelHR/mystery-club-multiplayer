import {
  DifficultyLevel,
  DrawingStroke,
  MemoryCard,
  MiniGameType,
  StageDefinition,
} from "../../../shared/game";

const brushPalette = ["#f8fafc", "#f59e0b", "#22d3ee", "#34d399", "#fb7185"];

type WordPath = { word: string; cells: Array<[number, number]> };
type CrosswordConfig = {
  answer: string;
  clue: string;
  size: number;
  row: number;
  startCol: number;
  distractors: string[];
};
type WordSearchConfig = {
  size: number;
  filler: string;
  paths: WordPath[];
};

const crosswordByDifficulty = {
  explorador: {
    answer: "BRUJULA",
    clue: "Instrumento basico para no perder el norte durante la primera busqueda.",
    size: 10,
    row: 4,
    startCol: 1,
    distractors: ["M", "A", "P", "A", "R", "U"],
  },
  agente: {
    answer: "EXPEDIENTE",
    clue: "Documento central del caso. Sin esta pieza, la investigacion queda incompleta.",
    size: 13,
    row: 6,
    startCol: 1,
    distractors: ["C", "L", "A", "V", "E", "R", "A", "S", "T", "R", "O"],
  },
  leyenda: {
    answer: "CRIPTOLOGIA",
    clue: "Disciplina necesaria para romper el mensaje final sin cometer un solo error de lectura.",
    size: 14,
    row: 7,
    startCol: 1,
    distractors: ["A", "N", "T", "I", "G", "U", "A", "R", "I", "O", "S", "M"],
  },
} satisfies Record<DifficultyLevel, CrosswordConfig>;

const wordSearchByDifficulty = {
  explorador: {
    size: 6,
    filler: "SOMBRANOCHE",
    paths: [
      {
        word: "MAPA",
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
        ],
      },
      {
        word: "LINTERNA",
        cells: [
          [1, 0],
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 4],
          [1, 5],
          [2, 5],
          [3, 5],
        ],
      },
      {
        word: "BRUJULA",
        cells: [
          [3, 0],
          [3, 1],
          [3, 2],
          [3, 3],
          [3, 4],
          [4, 4],
          [4, 3],
          [4, 2],
        ],
      },
      {
        word: "RUTA",
        cells: [
          [5, 0],
          [5, 1],
          [5, 2],
          [5, 3],
        ],
      },
    ],
  },
  agente: {
    size: 8,
    filler: "TRAMPASECRETAFALSOPASILLO",
    paths: [
      {
        word: "CLAVE",
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
        ],
      },
      {
        word: "CODIGO",
        cells: [
          [1, 0],
          [1, 1],
          [1, 2],
          [1, 3],
          [2, 3],
          [3, 3],
        ],
      },
      {
        word: "INDICIO",
        cells: [
          [2, 0],
          [2, 1],
          [2, 2],
          [3, 2],
          [4, 2],
          [4, 3],
          [4, 4],
        ],
      },
      {
        word: "ARCHIVO",
        cells: [
          [5, 0],
          [5, 1],
          [5, 2],
          [5, 3],
          [5, 4],
          [6, 4],
          [7, 4],
        ],
      },
      {
        word: "MENSAJE",
        cells: [
          [7, 0],
          [6, 0],
          [6, 1],
          [6, 2],
          [6, 3],
          [7, 3],
          [7, 2],
        ],
      },
      {
        word: "RASTRO",
        cells: [
          [3, 7],
          [4, 7],
          [5, 7],
          [5, 6],
          [5, 5],
          [4, 5],
        ],
      },
    ],
  },
  leyenda: {
    size: 10,
    filler: "NOCTURNASECRETAUMBRASOMBRAENCLAVE",
    paths: [
      {
        word: "LABERINTO",
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [1, 3],
          [2, 3],
          [2, 4],
          [2, 5],
          [2, 6],
        ],
      },
      {
        word: "RELIQUIA",
        cells: [
          [0, 9],
          [1, 9],
          [2, 9],
          [3, 9],
          [3, 8],
          [3, 7],
          [3, 6],
          [3, 5],
        ],
      },
      {
        word: "PASADIZO",
        cells: [
          [4, 0],
          [4, 1],
          [4, 2],
          [4, 3],
          [5, 3],
          [6, 3],
          [6, 2],
          [6, 1],
        ],
      },
      {
        word: "ACERTIJO",
        cells: [
          [5, 9],
          [5, 8],
          [5, 7],
          [5, 6],
          [6, 6],
          [7, 6],
          [7, 7],
          [7, 8],
        ],
      },
      {
        word: "PORTAL",
        cells: [
          [9, 0],
          [8, 0],
          [8, 1],
          [8, 2],
          [9, 2],
          [9, 3],
        ],
      },
      {
        word: "UMBRAL",
        cells: [
          [9, 9],
          [8, 9],
          [8, 8],
          [8, 7],
          [9, 7],
          [9, 6],
        ],
      },
      {
        word: "ENIGMA",
        cells: [
          [7, 0],
          [7, 1],
          [7, 2],
          [7, 3],
          [7, 4],
          [6, 4],
        ],
      },
      {
        word: "RUNAS",
        cells: [
          [1, 6],
          [1, 7],
          [1, 8],
          [2, 8],
          [2, 7],
        ],
      },
    ],
  },
} satisfies Record<DifficultyLevel, WordSearchConfig>;

const drawingByDifficulty = {
  explorador: {
    prompt: "Linterna",
    answerMode: "options",
    options: ["Linterna", "Brújula", "Mapa", "Mochila"],
  },
  agente: {
    prompt: "Candado antiguo",
    answerMode: "options",
    options: ["Candado antiguo", "Llave maestra", "Cofre sellado", "Archivo clasificado", "Reloj de arena", "Farol"],
  },
  leyenda: {
    prompt: "Reloj de arena",
    answerMode: "text",
    options: [],
  },
} satisfies Record<DifficultyLevel, { prompt: string; answerMode: "options" | "text"; options: string[] }>;

const memoryByDifficulty = {
  explorador: [
    ["linterna", "🏮", "Linterna", "from-amber-300/40 to-gold/10"],
    ["mapa", "🗺️", "Mapa", "from-emerald-300/40 to-teal-400/10"],
    ["brujula", "🧭", "Brújula", "from-cyan-300/40 to-blue-400/10"],
    ["mochila", "🎒", "Mochila", "from-indigo-400/40 to-sky-400/10"],
  ],
  agente: [
    ["codigo", "🔐", "Código", "from-lime-300/40 to-emerald-400/10"],
    ["llave", "🗝️", "Llave", "from-amber-300/40 to-gold/10"],
    ["archivo", "🗂️", "Archivo", "from-emerald-300/40 to-teal-400/10"],
    ["lupa", "🔎", "Lupa", "from-cyan-300/40 to-blue-400/10"],
    ["mensaje", "✉️", "Mensaje", "from-fuchsia-300/40 to-rose-400/10"],
    ["reloj", "⏰", "Reloj", "from-orange-300/40 to-amber-400/10"],
    ["candado", "🧰", "Candado", "from-slate-300/40 to-slate-500/10"],
    ["brujula", "🧭", "Brújula", "from-indigo-300/40 to-blue-500/10"],
  ],
  leyenda: [
    ["reliquia", "💎", "Reliquia", "from-fuchsia-300/40 to-rose-400/10"],
    ["runas", "📜", "Runas", "from-indigo-400/40 to-sky-400/10"],
    ["mapa", "🗺️", "Mapa", "from-emerald-300/40 to-teal-400/10"],
    ["portal", "🪞", "Portal", "from-cyan-300/40 to-blue-400/10"],
    ["acertijo", "🧩", "Acertijo", "from-orange-300/40 to-amber-400/10"],
    ["pasadizo", "🚪", "Pasadizo", "from-lime-300/40 to-emerald-400/10"],
    ["candado", "🔐", "Candado", "from-lime-300/40 to-emerald-400/10"],
    ["brujula", "🧭", "Brújula", "from-pink-300/40 to-fuchsia-400/10"],
    ["amuleto", "🪬", "Amuleto", "from-slate-300/40 to-slate-500/10"],
    ["archivo", "🗂️", "Archivo", "from-amber-300/40 to-orange-400/10"],
  ],
} satisfies Record<DifficultyLevel, Array<[string, string, string, string]>>;

function normalizeText(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildLetterCounts(letters: string[]) {
  return letters.reduce((accumulator, letter) => {
    accumulator.set(letter, (accumulator.get(letter) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());
}

function shuffleArray<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function buildCrosswordLetterBank(answer: string, distractors: string[]) {
  return shuffleArray([...answer.split(""), ...distractors.map((letter) => normalizeText(letter))]);
}

function validateCrosswordConfig(difficulty: DifficultyLevel, config: CrosswordConfig) {
  const answerLetters = config.answer.split("");
  const bankCounts = buildLetterCounts(buildCrosswordLetterBank(config.answer, config.distractors));
  const answerCounts = buildLetterCounts(answerLetters);

  answerCounts.forEach((count, letter) => {
    if ((bankCounts.get(letter) ?? 0) < count) {
      throw new Error(`Crossword bank is missing letters for ${difficulty}`);
    }
  });

  if (config.startCol + answerLetters.length > config.size) {
    throw new Error(`Crossword answer overflows board for ${difficulty}`);
  }
}

function buildWordSearchGrid(config: WordSearchConfig) {
  const normalizedFiller = normalizeText(config.filler).replace(/[^A-Z]/g, "") || "SOMBRA";
  let fillerIndex = 0;
  const grid = Array.from({ length: config.size }, () => Array.from({ length: config.size }, () => ""));

  config.paths.forEach((entry) => {
    const letters = normalizeText(entry.word).split("");
    entry.cells.forEach(([row, col], index) => {
      const nextLetter = letters[index];
      const current = grid[row]?.[col];

      if (current && current !== nextLetter) {
        throw new Error(`Word search overlap mismatch for ${entry.word}`);
      }

      grid[row][col] = nextLetter;
    });
  });

  return grid.map((row) =>
    row.map((cell) => {
      if (cell) {
        return cell;
      }

      const nextLetter = normalizedFiller[fillerIndex % normalizedFiller.length];
      fillerIndex += 1;
      return nextLetter;
    }),
  );
}

function validateWordSearchConfig(
  difficulty: DifficultyLevel,
  config: WordSearchConfig,
) {
  const grid = buildWordSearchGrid(config);
  const listedWords = config.paths.map((entry) => normalizeText(entry.word)).sort().join("|");
  const pathWords = config.paths.map((entry) => normalizeText(entry.word)).sort().join("|");

  if (listedWords !== pathWords) {
    throw new Error(`Word search words mismatch for ${difficulty}`);
  }

  config.paths.forEach((entry) => {
    if (entry.cells.length !== normalizeText(entry.word).length) {
      throw new Error(`Word search path length mismatch for ${difficulty}: ${entry.word}`);
    }

    const tracedWord = entry.cells
      .map(([row, col]) => {
        if (row < 0 || col < 0 || row >= config.size || col >= config.size) {
          throw new Error(`Word search path out of bounds for ${difficulty}: ${entry.word}`);
        }
        return grid[row]?.[col] ?? "";
      })
      .join("");

    if (normalizeText(tracedWord) !== normalizeText(entry.word)) {
      throw new Error(`Invalid word path for ${difficulty}: ${entry.word}`);
    }

    entry.cells.forEach(([row, col], index) => {
      if (index === 0) {
        return;
      }

      const [previousRow, previousCol] = entry.cells[index - 1];
      const rowDelta = Math.abs(previousRow - row);
      const colDelta = Math.abs(previousCol - col);

      if ((rowDelta === 0 && colDelta === 0) || rowDelta > 1 || colDelta > 1) {
        throw new Error(`Word search path is not contiguous for ${difficulty}: ${entry.word}`);
      }
    });
  });
}

function buildCrosswordStage(difficulty: DifficultyLevel): StageDefinition {
  const config = crosswordByDifficulty[difficulty];
  validateCrosswordConfig(difficulty, config);
  const slots = config.answer.split("").map((_, index) => [config.row, config.startCol + index] as [number, number]);
  const blocks: Array<[number, number]> = [];

  for (let row = 0; row < config.size; row += 1) {
    for (let col = 0; col < config.size; col += 1) {
      if (!slots.some(([slotRow, slotCol]) => slotRow === row && slotCol === col)) {
        blocks.push([row, col]);
      }
    }
  }

  return {
    id: `crossword-${difficulty}`,
    miniGameType: "crucigrama",
    title: "Archivo cifrado",
    prompt: "Reconstruye el termino central usando una pista breve y un banco de letras contaminado.",
    instructions: "El banco incluye señuelos. Usa cada letra con criterio: no hay piezas infinitas.",
    pointsLabel: `${config.answer.length} letras con ruido`,
    crossword: {
      size: config.size,
      blocks,
      slots,
      clue: config.clue,
      letterBank: buildCrosswordLetterBank(config.answer, config.distractors),
    },
    answer: normalizeText(config.answer),
  };
}

function buildWordSearchStage(difficulty: DifficultyLevel): StageDefinition {
  const config = wordSearchByDifficulty[difficulty];
  validateWordSearchConfig(difficulty, config);
  const grid = buildWordSearchGrid(config);
  const words = config.paths.map((entry) => entry.word);
  return {
    id: `wordsearch-${difficulty}`,
    miniGameType: "sopa",
    title: "Matriz de rastreo",
    prompt: "Rastrea terminos reales dentro de la matriz. Las rutas pueden girar, cruzarse y engañar.",
    instructions: "Construye cada palabra siguiendo una trayectoria continua. Si rompes la ruta, no cuenta.",
    pointsLabel: `${words.length} rutas validas`,
    wordSearch: {
      grid,
      words,
      paths: config.paths,
    },
    answer: words.map(normalizeText).sort().join("|"),
  };
}

function buildDrawingStage(difficulty: DifficultyLevel, drawerPlayerId: string): StageDefinition {
  const config = drawingByDifficulty[difficulty];
  return {
    id: `drawing-${difficulty}`,
    miniGameType: "dibujo",
    title: "Testigo visual",
    prompt: "Una persona ilustra la evidencia sin hablar. El resto debe identificarla con precision.",
    instructions:
      config.answerMode === "text"
        ? "El dibujante ilustra. El resto responde por texto, sin opciones guiadas."
        : "El dibujante ilustra. El resto discrimina entre opciones visualmente cercanas.",
    pointsLabel: config.answerMode === "text" ? "Respuesta abierta" : `${config.options.length} opciones similares`,
    drawing: {
      drawerPlayerId,
      promptForDrawer: config.prompt,
      options: config.options,
      answerMode: config.answerMode,
      strokes: [] as DrawingStroke[],
      brushPalette,
    },
    answer: normalizeText(config.prompt),
  };
}

function buildMemoryStage(difficulty: DifficultyLevel): StageDefinition {
  const cards = memoryByDifficulty[difficulty].flatMap(([pairId, icon, label, tint], index) => {
    const cardA: MemoryCard = { id: `${pairId}-a-${index}`, pairId, icon, label, tint };
    const cardB: MemoryCard = { id: `${pairId}-b-${index}`, pairId, icon, label, tint };
    return [cardA, cardB];
  });

  const shuffled = shuffleArray(cards);

  return {
    id: `memory-${difficulty}`,
    miniGameType: "memorama",
    title: "Mesa de evidencias",
    prompt: "Relaciona cada evidencia con su pareja en un tablero que cambia de orden en cada partida.",
    instructions: "Memoriza ubicaciones reales; las cartas no salen ordenadas ni por pareja ni por categoria.",
    pointsLabel: `${shuffled.length / 2} parejas por completar`,
    memory: {
      cards: shuffled,
    },
    answer: [...new Set(shuffled.map((card) => normalizeText(card.pairId)))].sort().join("|"),
  };
}

function getDrawerPlayerId(playerIds: string[], stageIndex: number) {
  return playerIds[stageIndex % playerIds.length];
}

export function buildStageQueue(
  difficulty: DifficultyLevel,
  playlist: MiniGameType[],
  playerIds: string[],
): StageDefinition[] {
  return playlist.map((miniGameType, stageIndex) => {
    switch (miniGameType) {
      case "crucigrama":
        return buildCrosswordStage(difficulty);
      case "sopa":
        return buildWordSearchStage(difficulty);
      case "dibujo":
        return buildDrawingStage(difficulty, getDrawerPlayerId(playerIds, stageIndex));
      case "memorama":
      default:
        return buildMemoryStage(difficulty);
    }
  });
}
