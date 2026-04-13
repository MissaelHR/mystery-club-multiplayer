export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const ROOM_TTL_MS = 30 * 60 * 1000;
export const CHAPTER_NUMBER = 28;
export const CHAPTER_TITLE = "Drones al rescate";

export type GamePhase = "lobby" | "playing" | "finished";
export type MiniGameKind =
  | "preguntas-rapidas"
  | "memoria-flash"
  | "rastro-drone"
  | "decision-secreta"
  | "secuencia-de-altura";

export interface PlayerPublic {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  connected: boolean;
  answeredCurrentStage: boolean;
}

export interface MiniGameCatalogItem {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  title: string;
  kind: MiniGameKind;
  summary: string;
}

export const MINI_GAME_CATALOG: MiniGameCatalogItem[] = [
  {
    id: "ruta-del-guardia",
    chapterNumber: CHAPTER_NUMBER,
    chapterTitle: CHAPTER_TITLE,
    title: "Ruta del guardia",
    kind: "preguntas-rapidas",
    summary: "Tres rondas de decisiones para detectar riesgos antes de que Amanda sea vista.",
  },
  {
    id: "memoria-de-drones",
    chapterNumber: CHAPTER_NUMBER,
    chapterTitle: CHAPTER_TITLE,
    title: "Memoria de drones",
    kind: "memoria-flash",
    summary: "Recuerda secuencias cortas inspiradas en el rescate de Benson.",
  },
  {
    id: "comandos-de-eric",
    chapterNumber: CHAPTER_NUMBER,
    chapterTitle: CHAPTER_TITLE,
    title: "Comandos de Eric",
    kind: "rastro-drone",
    summary: "Sigue las instrucciones correctas de Eric para mantener la misión en curso.",
  },
  {
    id: "escondite-transparente",
    chapterNumber: CHAPTER_NUMBER,
    chapterTitle: CHAPTER_TITLE,
    title: "Escondite transparente",
    kind: "decision-secreta",
    summary: "Elige la mejor cobertura cuando todo alrededor parece visible.",
  },
  {
    id: "pulso-en-la-altura",
    chapterNumber: CHAPTER_NUMBER,
    chapterTitle: CHAPTER_TITLE,
    title: "Pulso en la altura",
    kind: "secuencia-de-altura",
    summary: "Encadena pasos de sangre fría para que Amanda siga avanzando.",
  },
];

export interface StagePublic {
  id: string;
  title: string;
  prompt: string;
  inputLabel: string;
  answerKind: "single-choice" | "text" | "sequence";
  options?: string[];
  memorySequence?: string[];
  memoryRevealMs?: number;
}

export interface StageDefinition extends StagePublic {
  answer: string;
  explanation: string;
}

export interface MiniGameDefinition extends MiniGameCatalogItem {
  stages: StageDefinition[];
}

export interface StageResult {
  playerId: string;
  playerName: string;
  answer: string | null;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface GameFinishedState {
  outcome: "victory" | "mistake";
  headline: string;
  explanation: string;
  failedPlayerName?: string;
  correctAnswer?: string;
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
  selectedMiniGameId: string;
  selectedMiniGame: MiniGameCatalogItem;
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
  miniGameId: string;
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
  miniGameId: string;
}

export interface RoomPayload {
  roomCode: string;
}

export interface KickPlayerPayload {
  roomCode: string;
  targetPlayerId: string;
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
  "game:restart": (payload: RoomPayload) => void;
  "round:submit": (payload: SubmitAnswerPayload) => void;
}
