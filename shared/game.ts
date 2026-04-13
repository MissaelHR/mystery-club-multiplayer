export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const ROOM_TTL_MS = 30 * 60 * 1000;
export const GAME_TITLE = "UNASLETAS AMANDA BLACK";
export const GAME_SUBTITLE = "Pilota, esquiva trampas y llega hasta la azotea.";

export type GamePhase = "lobby" | "playing" | "finished";
export type DifficultyLevel = "explorador" | "agente" | "leyenda";

export interface DifficultyOption {
  id: DifficultyLevel;
  title: string;
  summary: string;
  badge: string;
}

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    id: "explorador",
    title: "Explorador",
    summary: "Tramos cortos y movimientos fáciles para empezar.",
    badge: "Suave",
  },
  {
    id: "agente",
    title: "Agente",
    summary: "Más giros, más trampas y decisiones más finas.",
    badge: "Reto",
  },
  {
    id: "leyenda",
    title: "Leyenda",
    summary: "Ruta completa, secuencias largas y tensión total.",
    badge: "Pro",
  },
];

export interface PlayerPublic {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  connected: boolean;
  answeredCurrentStage: boolean;
}

export interface StagePublic {
  id: string;
  title: string;
  prompt: string;
  inputLabel: string;
  answerKind: "single-choice" | "sequence";
  options?: string[];
  memorySequence?: string[];
  memoryRevealMs?: number;
}

export interface StageDefinition extends StagePublic {
  answer: string;
  explanation: string;
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
  gameTitle: string;
  gameSubtitle: string;
  selectedDifficulty: DifficultyLevel;
  availableDifficulties: DifficultyOption[];
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
