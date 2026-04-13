import {
  DifficultyLevel,
  DrawingStroke,
  MemoryCard,
  MiniGameType,
  StageDefinition,
} from "../../../shared/game";

const brushPalette = ["#f8fafc", "#f59e0b", "#22d3ee", "#34d399", "#fb7185"];

const crosswordByDifficulty = {
  explorador: {
    answer: "BRUJULA",
    clue: "Te orienta cuando apenas empiezas la expedicion.",
    size: 8,
    row: 3,
    startCol: 0,
    bank: ["B", "R", "U", "J", "U", "L", "A", "M", "A", "P", "O", "S"],
  },
  agente: {
    answer: "CODIGO",
    clue: "La clave principal del caso esta escondida en esta palabra.",
    size: 7,
    row: 2,
    startCol: 0,
    bank: ["C", "O", "D", "I", "G", "O", "L", "L", "A", "V", "E"],
  },
  leyenda: {
    answer: "RELIQUIA",
    clue: "Pieza legendaria que justifica toda la busqueda.",
    size: 9,
    row: 4,
    startCol: 0,
    bank: ["R", "E", "L", "I", "Q", "U", "I", "A", "M", "A", "P", "S"],
  },
} satisfies Record<DifficultyLevel, { answer: string; clue: string; size: number; row: number; startCol: number; bank: string[] }>;

const wordSearchByDifficulty = {
  explorador: {
    grid: [
      ["M", "A", "P", "A", "R", "S"],
      ["L", "I", "N", "T", "E", "R"],
      ["O", "B", "S", "E", "N", "U"],
      ["B", "R", "U", "J", "U", "L"],
      ["A", "D", "A", "C", "R", "A"],
      ["R", "U", "T", "A", "S", "L"],
    ],
    words: ["MAPA", "LINTERNA", "BRUJULA", "RUTA"],
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
    grid: [
      ["C", "O", "D", "I", "G", "O", "S"],
      ["M", "E", "N", "S", "A", "J", "E"],
      ["P", "I", "S", "T", "A", "R", "D"],
      ["N", "A", "L", "L", "A", "V", "E"],
      ["O", "K", "X", "H", "C", "I", "V"],
      ["R", "A", "R", "C", "H", "I", "V"],
      ["T", "R", "A", "Z", "A", "L", "O"],
    ],
    words: ["CODIGO", "MENSAJE", "PISTA", "LLAVE", "ARCHIVO"],
    paths: [
      {
        word: "CODIGO",
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
        ],
      },
      {
        word: "MENSAJE",
        cells: [
          [1, 0],
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 4],
          [1, 5],
          [1, 6],
        ],
      },
      {
        word: "PISTA",
        cells: [
          [2, 0],
          [2, 1],
          [2, 2],
          [2, 3],
          [2, 4],
        ],
      },
      {
        word: "LLAVE",
        cells: [
          [3, 2],
          [3, 3],
          [3, 4],
          [3, 5],
          [3, 6],
        ],
      },
      {
        word: "ARCHIVO",
        cells: [
          [5, 1],
          [5, 2],
          [5, 3],
          [5, 4],
          [5, 5],
          [5, 6],
          [6, 6],
          [6, 5],
        ],
      },
    ],
  },
  leyenda: {
    grid: [
      ["L", "A", "B", "E", "R", "I", "N", "T"],
      ["P", "A", "S", "A", "D", "I", "Z", "O"],
      ["A", "C", "E", "R", "T", "I", "J", "O"],
      ["R", "E", "L", "I", "Q", "U", "I", "A"],
      ["T", "V", "X", "R", "U", "N", "A", "S"],
      ["A", "P", "O", "R", "O", "D", "I", "G"],
      ["L", "M", "R", "T", "A", "L", "L", "O"],
      ["M", "A", "P", "A", "S", "O", "L", "S"],
    ],
    words: ["LABERINTO", "PASADIZO", "ACERTIJO", "RELIQUIA", "RUNAS", "PORTAL"],
    paths: [
      {
        word: "LABERINTO",
        cells: [
          [0, 0],
          [0, 1],
          [0, 2],
          [0, 3],
          [0, 4],
          [0, 5],
          [0, 6],
          [0, 7],
          [1, 7],
        ],
      },
      {
        word: "PASADIZO",
        cells: [
          [1, 0],
          [1, 1],
          [1, 2],
          [1, 3],
          [1, 4],
          [1, 5],
          [1, 6],
          [1, 7],
        ],
      },
      {
        word: "ACERTIJO",
        cells: [
          [2, 0],
          [2, 1],
          [2, 2],
          [2, 3],
          [2, 4],
          [2, 5],
          [2, 6],
          [2, 7],
        ],
      },
      {
        word: "RELIQUIA",
        cells: [
          [3, 0],
          [3, 1],
          [3, 2],
          [3, 3],
          [3, 4],
          [3, 5],
          [3, 6],
          [3, 7],
        ],
      },
      {
        word: "RUNAS",
        cells: [
          [4, 3],
          [4, 4],
          [4, 5],
          [4, 6],
          [4, 7],
        ],
      },
      {
        word: "PORTAL",
        cells: [
          [5, 1],
          [5, 2],
          [5, 3],
          [6, 3],
          [6, 4],
          [6, 5],
        ],
      },
    ],
  },
} satisfies Record<
  DifficultyLevel,
  { grid: string[][]; words: string[]; paths: Array<{ word: string; cells: Array<[number, number]> }> }
>;

const drawingByDifficulty = {
  explorador: {
    prompt: "Mochila",
    options: ["Mochila", "Brújula", "Ventana", "Candado"],
  },
  agente: {
    prompt: "Candado",
    options: ["Reloj", "Candado", "Brújula", "Campana"],
  },
  leyenda: {
    prompt: "Reliquia",
    options: ["Reliquia", "Mapa", "Escalera", "Maleta"],
  },
} satisfies Record<DifficultyLevel, { prompt: string; options: string[] }>;

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

function validateWordSearchConfig(
  difficulty: DifficultyLevel,
  config: { grid: string[][]; words: string[]; paths: Array<{ word: string; cells: Array<[number, number]> }> },
) {
  const listedWords = [...config.words].map(normalizeText).sort().join("|");
  const pathWords = config.paths.map((entry) => normalizeText(entry.word)).sort().join("|");

  if (listedWords !== pathWords) {
    throw new Error(`Word search words mismatch for ${difficulty}`);
  }

  config.paths.forEach((entry) => {
    const tracedWord = entry.cells
      .map(([row, col]) => config.grid[row]?.[col] ?? "")
      .join("");

    if (normalizeText(tracedWord) !== normalizeText(entry.word)) {
      throw new Error(`Invalid word path for ${difficulty}: ${entry.word}`);
    }
  });
}

function buildCrosswordStage(difficulty: DifficultyLevel): StageDefinition {
  const config = crosswordByDifficulty[difficulty];
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
    title: "Crucigrama de acceso",
    prompt: "Completa la palabra clave dentro de la cuadrícula.",
    instructions: "Toca una casilla y coloca una letra del banco.",
    pointsLabel: "Completa la palabra secreta",
    crossword: {
      size: config.size,
      blocks,
      slots,
      clue: config.clue,
      letterBank: config.bank,
    },
    answer: normalizeText(config.answer),
  };
}

function buildWordSearchStage(difficulty: DifficultyLevel): StageDefinition {
  const config = wordSearchByDifficulty[difficulty];
  validateWordSearchConfig(difficulty, config);
  return {
    id: `wordsearch-${difficulty}`,
    miniGameType: "sopa",
    title: "Sopa de letras nocturna",
    prompt: "Encuentra todas las palabras escondidas del tablero.",
    instructions: "Selecciona letras en la rejilla y confirma cada palabra.",
    pointsLabel: `${config.words.length} palabras ocultas`,
    wordSearch: config,
    answer: config.words.map(normalizeText).sort().join("|"),
  };
}

function buildDrawingStage(difficulty: DifficultyLevel, drawerPlayerId: string): StageDefinition {
  const config = drawingByDifficulty[difficulty];
  return {
    id: `drawing-${difficulty}`,
    miniGameType: "dibujo",
    title: "Dibujo en clave",
    prompt: "Una persona dibuja en vivo y el resto adivina la pieza secreta.",
    instructions: "El dibujante usa el lienzo. Los demas eligen una respuesta.",
    pointsLabel: "Adivina antes de cerrar la ronda",
    drawing: {
      drawerPlayerId,
      promptForDrawer: config.prompt,
      options: config.options,
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

  const shuffled = [...cards].sort((left, right) => left.pairId.localeCompare(right.pairId) || left.id.localeCompare(right.id));

  return {
    id: `memory-${difficulty}`,
    miniGameType: "memorama",
    title: "Memorama de reliquias",
    prompt: "Voltea las cartas y encuentra todas las parejas ilustradas.",
    instructions: "Toca dos cartas por turno hasta limpiar el tablero.",
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
