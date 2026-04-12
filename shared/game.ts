export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const TOTAL_ROUNDS = 5;
export const ROOM_TTL_MS = 30 * 60 * 1000;
export const ROUND_REVEAL_MS = 9000;

export type GamePhase = "lobby" | "question" | "reveal" | "finished";
export type ChallengeType =
  | "clue-selection"
  | "code-deciphering"
  | "memory-challenge"
  | "pattern-lock"
  | "final-deduction";

export interface PlayerPublic {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  connected: boolean;
}

export interface RoundDefinition {
  id: string;
  type: ChallengeType;
  title: string;
  storyText: string;
  prompt: string;
  inputLabel: string;
  answerKind: "single-choice" | "text";
  options?: string[];
  answer: string;
  explanation: string;
  timeLimitSec: number;
  memorySequence?: string[];
  memoryRevealMs?: number;
}

export interface RoundPublic {
  id: string;
  type: ChallengeType;
  title: string;
  storyText: string;
  prompt: string;
  inputLabel: string;
  answerKind: "single-choice" | "text";
  options?: string[];
  timeLimitSec: number;
  deadlineAt: number;
  startedAt: number;
  memorySequence?: string[];
  memoryRevealMs?: number;
}

export interface PlayerRoundResult {
  playerId: string;
  playerName: string;
  answer: string | null;
  isCorrect: boolean;
  pointsEarned: number;
  responseTimeMs: number | null;
}

export interface RoundReveal {
  correctAnswer: string;
  explanation: string;
  results: PlayerRoundResult[];
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
  currentRoundIndex: number;
  totalRounds: number;
  round: RoundPublic | null;
  reveal: RoundReveal | null;
  submittedPlayerIds: string[];
  winners: WinnerSummary[];
  lastActivityAt: number;
}

export interface CreateRoomPayload {
  playerName: string;
}

export interface JoinRoomPayload {
  playerName: string;
  roomCode: string;
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

export interface ServerToClientEvents {
  "room:update": (room: RoomState) => void;
  "room:error": (message: string) => void;
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
  "room:leave": (payload: { roomCode: string }) => void;
  "game:start": (payload: { roomCode: string }) => void;
  "round:submit": (payload: SubmitAnswerPayload) => void;
}
