export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const ROOM_TTL_MS = 30 * 60 * 1000;
export const GAME_TITLE = "UNASLETAS AMANDA BLACK";
export const GAME_SUBTITLE = "Crucigramas, rutas ocultas, dibujos y memorias en una mision cooperativa.";

export type GamePhase = "lobby" | "playing" | "finished";
export type DifficultyLevel = "explorador" | "agente" | "leyenda";
export type MiniGameType = "crucigrama" | "sopa" | "dibujo" | "memorama";

export interface DifficultyOption {
  id: DifficultyLevel;
  title: string;
  summary: string;
  badge: string;
}

export interface MiniGameCatalogItem {
  id: MiniGameType;
  title: string;
  summary: string;
  accent: string;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { id: "explorador", title: "Explorador", summary: "Tableros cortos y rondas rapidas.", badge: "Suave" },
  { id: "agente", title: "Agente", summary: "Mas piezas, mas rutas y pistas cruzadas.", badge: "Reto" },
  { id: "leyenda", title: "Leyenda", summary: "Version completa con maxima presion.", badge: "Pro" },
];

export const MINI_GAME_CATALOG: MiniGameCatalogItem[] = [
  { id: "crucigrama", title: "Crucigrama", summary: "Rellena una palabra secreta en una cuadricula real.", accent: "from-amber-300/25 to-gold/5" },
  { id: "sopa", title: "Sopa de letras", summary: "Encuentra palabras escondidas dentro de la rejilla.", accent: "from-cyan-300/25 to-sky-400/5" },
  { id: "dibujo", title: "Dibujo", summary: "Un jugador dibuja y el resto adivina en vivo.", accent: "from-rose-300/25 to-fuchsia-400/5" },
  { id: "memorama", title: "Memorama", summary: "Voltea cartas ilustradas y completa todas las parejas.", accent: "from-emerald-300/25 to-teal-400/5" },
];

export interface PlayerPublic {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  connected: boolean;
  answeredCurrentStage: boolean;
}

export interface CrosswordPublicData {
  size: number;
  blocks: Array<[number, number]>;
  slots: Array<[number, number]>;
  clue: string;
  letterBank: string[];
}

export interface WordSearchPublicData {
  grid: string[][];
  words: string[];
  paths: Array<{
    word: string;
    cells: Array<[number, number]>;
  }>;
}

export interface DrawingStroke {
  color: string;
  size: number;
  points: Array<{ x: number; y: number }>;
}

export interface DrawingPublicData {
  drawerPlayerId: string;
  promptForDrawer?: string;
  options: string[];
  strokes: DrawingStroke[];
  brushPalette: string[];
}

export interface MemoryCard {
  id: string;
  pairId: string;
  icon: string;
  label: string;
  tint: string;
}

export interface MemoryPublicData {
  cards: MemoryCard[];
}

export interface StagePublic {
  id: string;
  miniGameType: MiniGameType;
  title: string;
  prompt: string;
  instructions: string;
  pointsLabel: string;
  crossword?: CrosswordPublicData;
  wordSearch?: WordSearchPublicData;
  drawing?: DrawingPublicData;
  memory?: MemoryPublicData;
}

export interface StageDefinition extends StagePublic {
  answer: string;
}

export interface StageResult {
  playerId: string;
  playerName: string;
  answer: string | null;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface GameFinishedState {
  outcome: "victory" | "stopped";
  headline: string;
  explanation: string;
  stageResults: StageResult[];
}

export interface WinnerSummary {
  id: string;
  name: string;
  score: number;
}

export interface RoomState {
  code: string;
  phase: GamePhase;
  hostId: string;
  players: PlayerPublic[];
  gameTitle: string;
  gameSubtitle: string;
  selectedDifficulty: DifficultyLevel;
  configuredMiniGames: MiniGameType[];
  availableDifficulties: DifficultyOption[];
  availableMiniGames: MiniGameCatalogItem[];
  currentStageNumber: number;
  totalStages: number;
  stage: StagePublic | null;
  finished: GameFinishedState | null;
  winners: WinnerSummary[];
  lastActivityAt: number;
}

export interface CreateRoomPayload {
  playerName: string;
  difficulty: DifficultyLevel;
}

export interface JoinRoomPayload {
  playerName: string;
  roomCode: string;
}

export interface ResumeSessionPayload {
  roomCode: string;
  playerId: string;
}

export interface JoinRoomResponse {
  ok: boolean;
  error?: string;
  playerId?: string;
}

export interface SubmitAnswerPayload {
  roomCode: string;
  answer: string;
}

export interface ConfigureGamePayload {
  roomCode: string;
  difficulty: DifficultyLevel;
  playlist: MiniGameType[];
}

export interface RoomPayload {
  roomCode: string;
}

export interface KickPlayerPayload {
  roomCode: string;
  targetPlayerId: string;
}

export interface DrawingStrokePayload {
  roomCode: string;
  stroke: DrawingStroke;
}

export interface ServerToClientEvents {
  "room:update": (room: RoomState) => void;
  "room:error": (message: string) => void;
  "room:kicked": (message: string) => void;
}

export interface ClientToServerEvents {
  "room:create": (
    payload: CreateRoomPayload,
    callback: (response: JoinRoomResponse) => void,
  ) => void;
  "room:join": (
    payload: JoinRoomPayload,
    callback: (response: JoinRoomResponse) => void,
  ) => void;
  "room:resume": (
    payload: ResumeSessionPayload,
    callback: (response: JoinRoomResponse) => void,
  ) => void;
  "room:leave": (payload: RoomPayload) => void;
  "room:kick": (payload: KickPlayerPayload) => void;
  "game:configure": (payload: ConfigureGamePayload) => void;
  "game:start": (payload: RoomPayload) => void;
  "game:end": (payload: RoomPayload) => void;
  "game:restart": (payload: RoomPayload) => void;
  "round:submit": (payload: SubmitAnswerPayload) => void;
  "drawing:stroke": (payload: DrawingStrokePayload) => void;
  "drawing:clear": (payload: RoomPayload) => void;
}
