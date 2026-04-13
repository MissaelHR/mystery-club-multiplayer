export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const ROOM_TTL_MS = 30 * 60 * 1000;

export type GamePhase = "lobby" | "question" | "finished";
export type ChallengeType = "pista-relampago" | "memoria-flash" | "decision-secreta";
export type RevealOutcome = "victory" | "mistake" | "timeout";

export interface PlayerPublic {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  connected: boolean;
}

export interface ChallengeCatalogItem {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  challengeType: ChallengeType;
  minigameTitle: string;
  teaser: string;
}

export interface RoundDefinition extends ChallengeCatalogItem {
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

export interface RoundPublic extends ChallengeCatalogItem {
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
  outcome: RevealOutcome;
  headline: string;
  correctAnswer: string;
  explanation: string;
  finishedByPlayerName?: string;
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
  availableChallenges: ChallengeCatalogItem[];
  selectedChallengeId: string | null;
  selectedChallenge: ChallengeCatalogItem | null;
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

export interface ConfigureGamePayload {
  roomCode: string;
  challengeId: string;
}

export interface StartGamePayload {
  roomCode: string;
}

export interface RestartGamePayload {
  roomCode: string;
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
  "game:configure": (payload: ConfigureGamePayload) => void;
  "game:start": (payload: StartGamePayload) => void;
  "game:restart": (payload: RestartGamePayload) => void;
  "round:submit": (payload: SubmitAnswerPayload) => void;
}
