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
    answer: "LINTERNA",
    clue: "Objeto que ilumina los pasillos del misterio.",
    size: 8,
    row: 3,
    startCol: 0,
    bank: ["L", "I", "N", "T", "E", "R", "N", "A", "M", "P", "O", "S"],
  },
  agente: {
    answer: "BRUJULA",
    clue: "Sirve para no perder la ruta cuando todo gira.",
    size: 8,
    row: 2,
    startCol: 0,
    bank: ["B", "R", "U", "J", "U", "L", "A", "C", "L", "A", "V", "E"],
  },
  leyenda: {
    answer: "LABERINTO",
    clue: "Lugar lleno de giros donde la salida nunca parece cerca.",
    size: 10,
    row: 4,
    startCol: 0,
    bank: ["L", "A", "B", "E", "R", "I", "N", "T", "O", "S", "M", "A", "P"],
  },
} satisfies Record<DifficultyLevel, { answer: string; clue: string; size: number; row: number; startCol: number; bank: string[] }>;

const wordSearchByDifficulty = {
  explorador: {
    grid: [
      ["M", "A", "P", "A", "X", "R"],
      ["T", "O", "R", "R", "E", "L"],
      ["C", "L", "A", "V", "E", "A"],
      ["P", "I", "S", "T", "A", "S"],
      ["L", "U", "Z", "N", "O", "R"],
      ["R", "U", "T", "A", "O", "K"],
    ],
    words: ["MAPA", "TORRE", "CLAVE"],
  },
  agente: {
    grid: [
      ["B", "A", "L", "C", "O", "N", "X"],
      ["M", "I", "S", "I", "O", "N", "L"],
      ["C", "O", "D", "I", "G", "O", "A"],
      ["L", "I", "N", "T", "E", "R", "N"],
      ["P", "I", "S", "T", "A", "S", "D"],
      ["R", "U", "T", "A", "S", "O", "O"],
      ["E", "S", "C", "A", "L", "A", "R"],
    ],
    words: ["CODIGO", "MISION", "RUTA", "LINTERNA"],
  },
  leyenda: {
    grid: [
      ["S", "E", "C", "R", "E", "T", "O", "X"],
      ["B", "R", "U", "J", "U", "L", "A", "M"],
      ["L", "A", "B", "E", "R", "I", "N", "T"],
      ["A", "C", "E", "R", "T", "I", "J", "O"],
      ["P", "A", "S", "A", "D", "I", "Z", "O"],
      ["T", "E", "R", "R", "A", "Z", "A", "S"],
      ["M", "A", "P", "A", "S", "O", "M", "B"],
      ["R", "U", "T", "A", "F", "I", "N", "A"],
    ],
    words: ["BRUJULA", "LABERINTO", "ACERTIJO", "PASADIZO"],
  },
} satisfies Record<DifficultyLevel, { grid: string[][]; words: string[] }>;

const drawingByDifficulty = {
  explorador: {
    prompt: "Linterna",
    options: ["Linterna", "Brújula", "Mochila", "Llave"],
  },
  agente: {
    prompt: "Brújula",
    options: ["Reloj", "Brújula", "Candado", "Ventana"],
  },
  leyenda: {
    prompt: "Mapa",
    options: ["Mapa", "Escalera", "Maleta", "Campana"],
  },
} satisfies Record<DifficultyLevel, { prompt: string; options: string[] }>;

const memoryByDifficulty = {
  explorador: [
    ["astro", "🌙", "Luna", "from-indigo-400/40 to-sky-400/10"],
    ["llave", "🗝️", "Llave", "from-amber-300/40 to-gold/10"],
    ["mapa", "🗺️", "Mapa", "from-emerald-300/40 to-teal-400/10"],
    ["lupa", "🔎", "Lupa", "from-cyan-300/40 to-blue-400/10"],
  ],
  agente: [
    ["astro", "🌙", "Luna", "from-indigo-400/40 to-sky-400/10"],
    ["llave", "🗝️", "Llave", "from-amber-300/40 to-gold/10"],
    ["mapa", "🗺️", "Mapa", "from-emerald-300/40 to-teal-400/10"],
    ["lupa", "🔎", "Lupa", "from-cyan-300/40 to-blue-400/10"],
    ["gema", "💎", "Gema", "from-fuchsia-300/40 to-rose-400/10"],
    ["reloj", "⏰", "Reloj", "from-orange-300/40 to-amber-400/10"],
  ],
  leyenda: [
    ["astro", "🌙", "Luna", "from-indigo-400/40 to-sky-400/10"],
    ["llave", "🗝️", "Llave", "from-amber-300/40 to-gold/10"],
    ["mapa", "🗺️", "Mapa", "from-emerald-300/40 to-teal-400/10"],
    ["lupa", "🔎", "Lupa", "from-cyan-300/40 to-blue-400/10"],
    ["gema", "💎", "Gema", "from-fuchsia-300/40 to-rose-400/10"],
    ["reloj", "⏰", "Reloj", "from-orange-300/40 to-amber-400/10"],
    ["candado", "🔐", "Candado", "from-lime-300/40 to-emerald-400/10"],
    ["pluma", "🪶", "Pluma", "from-pink-300/40 to-fuchsia-400/10"],
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
