import {
  MAX_PLAYERS,
  MINI_GAME_CATALOG,
  MIN_PLAYERS,
  PlayerPublic,
  ROOM_TTL_MS,
  RoomState,
  StageDefinition,
  StagePublic,
  WinnerSummary,
} from "../../../shared/game";
import { miniGamesById } from "./rounds";

interface PlayerInternal {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  connected: boolean;
  socketId: string;
  answeredCurrentStage: boolean;
}

interface Submission {
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

interface RoomInternal {
  code: string;
  hostId: string;
  players: Map<string, PlayerInternal>;
  phase: RoomState["phase"];
  selectedMiniGameId: string;
  currentStageIndex: number;
  stage: StageDefinition | null;
  submissions: Map<string, Submission>;
  finished: RoomState["finished"];
  lastActivityAt: number;
}

type JoinRoomResult =
  | { error: string }
  | {
      room: RoomInternal;
      playerId: string;
    };

type KickResult =
  | { error: string }
  | {
      room: RoomInternal | null;
      kickedSocketId: string;
    };

const rooms = new Map<string, RoomInternal>();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length = 5) {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
}

function randomPlayerId() {
  return `player_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeText(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toStagePublic(stage: StageDefinition | null): StagePublic | null {
  if (!stage) {
    return null;
  }

  return {
    id: stage.id,
    title: stage.title,
    prompt: stage.prompt,
    inputLabel: stage.inputLabel,
    answerKind: stage.answerKind,
    options: stage.options,
    memorySequence: stage.memorySequence,
    memoryRevealMs: stage.memoryRevealMs,
  };
}

function sortPlayers(players: Iterable<PlayerInternal>) {
  return [...players].sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
}

function computeWinners(room: RoomInternal): WinnerSummary[] {
  return sortPlayers(room.players.values()).map((player) => ({
    id: player.id,
    name: player.name,
    score: player.score,
  }));
}

function syncHostFlags(room: RoomInternal) {
  for (const player of room.players.values()) {
    player.isHost = player.id === room.hostId;
  }
}

function resetAnswers(room: RoomInternal) {
  room.submissions.clear();
  for (const player of room.players.values()) {
    player.answeredCurrentStage = false;
  }
}

function getCurrentMiniGame(room: RoomInternal) {
  return miniGamesById.get(room.selectedMiniGameId)!;
}

function advanceStage(room: RoomInternal) {
  const miniGame = getCurrentMiniGame(room);

  if (room.currentStageIndex >= miniGame.stages.length) {
    room.phase = "finished";
    room.stage = null;
    room.finished = {
      outcome: "victory",
      headline: "Misión completada",
      explanation: "El equipo superó todas las etapas del minijuego del capítulo 28.",
      stageResults: sortPlayers(room.players.values()).map((player) => ({
        playerId: player.id,
        playerName: player.name,
        answer: null,
        isCorrect: true,
        pointsEarned: player.score,
      })),
    };
    return;
  }

  room.stage = miniGame.stages[room.currentStageIndex];
  room.phase = "playing";
  room.finished = null;
  resetAnswers(room);
}

function finishWithMistake(room: RoomInternal, failedPlayerName: string, correctAnswer: string, explanation: string) {
  room.phase = "finished";
  room.stage = null;
  room.finished = {
    outcome: "mistake",
    headline: `Partida cerrada: falló ${failedPlayerName}`,
    explanation,
    failedPlayerName,
    correctAnswer,
    stageResults: sortPlayers(room.players.values()).map((player) => {
      const submission = room.submissions.get(player.id);
      return {
        playerId: player.id,
        playerName: player.name,
        answer: submission?.answer ?? null,
        isCorrect: submission?.isCorrect ?? false,
        pointsEarned: submission?.pointsEarned ?? 0,
      };
    }),
  };
}

export function createRoom(playerName: string, miniGameId: string, socketId: string) {
  let code = randomCode();
  while (rooms.has(code)) {
    code = randomCode();
  }

  const playerId = randomPlayerId();
  const room: RoomInternal = {
    code,
    hostId: playerId,
    players: new Map([
      [
        playerId,
        {
          id: playerId,
          name: playerName.trim(),
          score: 0,
          isHost: true,
          connected: true,
          socketId,
          answeredCurrentStage: false,
        },
      ],
    ]),
    phase: "lobby",
    selectedMiniGameId: miniGamesById.has(miniGameId) ? miniGameId : MINI_GAME_CATALOG[0].id,
    currentStageIndex: 0,
    stage: null,
    submissions: new Map(),
    finished: null,
    lastActivityAt: Date.now(),
  };

  rooms.set(code, room);
  return { room, playerId };
}

export function joinRoom(code: string, playerName: string, socketId: string): JoinRoomResult {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return { error: "Sala no encontrada." };
  }
  if (room.phase === "playing") {
    return { error: "La partida ya está en curso." };
  }
  if (room.players.size >= MAX_PLAYERS) {
    return { error: "La sala está llena." };
  }

  const trimmedName = playerName.trim();
  const existing = [...room.players.values()].find((player) => player.name.toLowerCase() === trimmedName.toLowerCase());
  if (existing) {
    return { error: "Ese nombre ya está en uso en esta sala." };
  }

  const playerId = randomPlayerId();
  room.players.set(playerId, {
    id: playerId,
    name: trimmedName,
    score: 0,
    isHost: false,
    connected: true,
    socketId,
    answeredCurrentStage: false,
  });
  room.lastActivityAt = Date.now();
  return { room, playerId };
}

export function resumeSession(code: string, playerId: string, socketId: string): JoinRoomResult {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return { error: "La sala ya no existe." };
  }

  const player = room.players.get(playerId);
  if (!player) {
    return { error: "Tu sesión ya no está disponible en esta sala." };
  }

  player.connected = true;
  player.socketId = socketId;
  room.lastActivityAt = Date.now();
  return { room, playerId };
}

export function getRoom(code: string) {
  return rooms.get(code.toUpperCase()) ?? null;
}

export function toRoomState(room: RoomInternal): RoomState {
  const selectedMiniGame = MINI_GAME_CATALOG.find((item) => item.id === room.selectedMiniGameId)!;

  return {
    code: room.code,
    phase: room.phase,
    hostId: room.hostId,
    players: sortPlayers(room.players.values()).map(
      (player): PlayerPublic => ({
        id: player.id,
        name: player.name,
        score: player.score,
        isHost: player.id === room.hostId,
        connected: player.connected,
        answeredCurrentStage: player.answeredCurrentStage,
      }),
    ),
    selectedMiniGameId: room.selectedMiniGameId,
    selectedMiniGame,
    availableMiniGames: MINI_GAME_CATALOG,
    currentStageNumber: room.phase === "playing" ? room.currentStageIndex + 1 : room.currentStageIndex,
    totalStages: getCurrentMiniGame(room).stages.length,
    stage: toStagePublic(room.stage),
    finished: room.finished,
    winners: computeWinners(room),
    lastActivityAt: room.lastActivityAt,
  };
}

export function leaveRoom(code: string, playerId: string) {
  const room = getRoom(code);
  if (!room) {
    return null;
  }

  room.players.delete(playerId);
  room.submissions.delete(playerId);
  room.lastActivityAt = Date.now();

  if (room.players.size === 0) {
    rooms.delete(room.code);
    return null;
  }

  if (room.hostId === playerId) {
    const nextHost = room.players.values().next().value;
    if (nextHost) {
      room.hostId = nextHost.id;
    }
    syncHostFlags(room);
  }

  if (room.phase === "playing") {
    const connectedPlayers = [...room.players.values()].filter((player) => player.connected);
    if (connectedPlayers.length > 0 && connectedPlayers.every((player) => player.answeredCurrentStage)) {
      room.currentStageIndex += 1;
      advanceStage(room);
    }
  }

  return room;
}

export function kickPlayer(roomCode: string, targetPlayerId: string): KickResult {
  const room = getRoom(roomCode);
  if (!room) {
    return { error: "Sala no encontrada." };
  }
  const target = room.players.get(targetPlayerId);
  if (!target) {
    return { error: "Jugador no encontrado." };
  }
  if (target.id === room.hostId) {
    return { error: "El anfitrión no puede expulsarse a sí mismo." };
  }

  const kickedSocketId = target.socketId;
  const nextRoom = leaveRoom(room.code, target.id);
  return { room: nextRoom, kickedSocketId };
}

export function markDisconnected(socketId: string) {
  for (const room of rooms.values()) {
    const player = [...room.players.values()].find((candidate) => candidate.socketId === socketId);
    if (!player) {
      continue;
    }

    player.connected = false;
    room.lastActivityAt = Date.now();

    if (player.id === room.hostId) {
      const nextHost = [...room.players.values()].find((candidate) => candidate.id !== player.id);
      if (nextHost) {
        room.hostId = nextHost.id;
        syncHostFlags(room);
      }
    }
    return room;
  }
  return null;
}

export function configureGame(room: RoomInternal, miniGameId: string) {
  if (!miniGamesById.has(miniGameId)) {
    return { error: "Ese minijuego no existe." };
  }

  room.selectedMiniGameId = miniGameId;
  room.phase = "lobby";
  room.currentStageIndex = 0;
  room.stage = null;
  room.finished = null;
  room.lastActivityAt = Date.now();
  resetAnswers(room);
  for (const player of room.players.values()) {
    player.score = 0;
  }
  return { room };
}

export function startGame(room: RoomInternal) {
  if (room.players.size < MIN_PLAYERS) {
    return { error: `Se requieren al menos ${MIN_PLAYERS} jugadores para comenzar.` };
  }

  room.currentStageIndex = 0;
  room.finished = null;
  for (const player of room.players.values()) {
    player.score = 0;
  }
  advanceStage(room);
  room.lastActivityAt = Date.now();
  return { room };
}

export function restartGame(room: RoomInternal) {
  room.phase = "lobby";
  room.currentStageIndex = 0;
  room.stage = null;
  room.finished = null;
  room.lastActivityAt = Date.now();
  resetAnswers(room);
  for (const player of room.players.values()) {
    player.score = 0;
  }
  return { room };
}

export function submitAnswer(room: RoomInternal, playerId: string, rawAnswer: string) {
  if (room.phase !== "playing" || !room.stage) {
    return { error: "No hay una etapa activa en este momento." };
  }

  const player = room.players.get(playerId);
  if (!player) {
    return { error: "Jugador no encontrado en la sala." };
  }
  if (player.answeredCurrentStage) {
    return { error: "Ya enviaste una respuesta en esta etapa." };
  }

  const normalizedAnswer = normalizeText(rawAnswer);
  const expectedAnswer = normalizeText(room.stage.answer);
  const isCorrect = normalizedAnswer === expectedAnswer;
  const pointsEarned = isCorrect ? 100 : 0;

  player.answeredCurrentStage = true;
  if (isCorrect) {
    player.score += pointsEarned;
  }
  room.submissions.set(player.id, {
    answer: rawAnswer,
    isCorrect,
    pointsEarned,
  });
  room.lastActivityAt = Date.now();

  if (!isCorrect) {
    finishWithMistake(room, player.name, room.stage.answer, room.stage.explanation);
    return { room };
  }

  const connectedPlayers = [...room.players.values()].filter((candidate) => candidate.connected);
  if (connectedPlayers.length > 0 && connectedPlayers.every((candidate) => candidate.answeredCurrentStage)) {
    room.currentStageIndex += 1;
    advanceStage(room);
  }

  return { room };
}

export function expireInactiveRooms() {
  const now = Date.now();
  for (const room of rooms.values()) {
    if (now - room.lastActivityAt < ROOM_TTL_MS) {
      continue;
    }
    rooms.delete(room.code);
  }
}
