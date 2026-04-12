import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  PlayerPublic,
  ROOM_TTL_MS,
  ROUND_REVEAL_MS,
  RoomState,
  RoundDefinition,
  RoundPublic,
  RoundReveal,
  TOTAL_ROUNDS,
  WinnerSummary,
} from "../../../shared/game";
import { rounds } from "./rounds";

interface PlayerInternal extends PlayerPublic {
  socketId: string;
}

interface Submission {
  answer: string;
  submittedAt: number;
}

interface ActiveRound {
  definition: RoundDefinition;
  startedAt: number;
  deadlineAt: number;
  submissions: Map<string, Submission>;
}

interface RoomInternal {
  code: string;
  hostId: string;
  players: Map<string, PlayerInternal>;
  phase: RoomState["phase"];
  currentRoundIndex: number;
  activeRound: ActiveRound | null;
  reveal: RoundReveal | null;
  winners: WinnerSummary[];
  lastActivityAt: number;
  roundTimer: NodeJS.Timeout | null;
  revealTimer: NodeJS.Timeout | null;
}

type JoinRoomResult =
  | { error: string }
  | {
      room: RoomInternal;
      playerId: string;
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

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

function sanitizeAnswer(value: string) {
  return normalizeText(value).replace(/\s*,\s*/g, ", ");
}

function makeRoundPublic(activeRound: ActiveRound | null): RoundPublic | null {
  if (!activeRound) {
    return null;
  }

  const { definition, deadlineAt, startedAt } = activeRound;

  return {
    id: definition.id,
    type: definition.type,
    title: definition.title,
    storyText: definition.storyText,
    prompt: definition.prompt,
    inputLabel: definition.inputLabel,
    answerKind: definition.answerKind,
    options: definition.options,
    timeLimitSec: definition.timeLimitSec,
    deadlineAt,
    startedAt,
    memorySequence: definition.memorySequence,
    memoryRevealMs: definition.memoryRevealMs,
  };
}

function sortPlayers(players: Iterable<PlayerInternal>) {
  return [...players].sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
}

function computeWinners(room: RoomInternal) {
  return sortPlayers(room.players.values()).map((player) => ({
    id: player.id,
    name: player.name,
    score: player.score,
  }));
}

export function createRoom(playerName: string, socketId: string) {
  let code = randomCode();
  while (rooms.has(code)) {
    code = randomCode();
  }

  const playerId = socketId;
  const player: PlayerInternal = {
    id: playerId,
    socketId,
    name: playerName.trim(),
    score: 0,
    isHost: true,
    connected: true,
  };

  const room: RoomInternal = {
    code,
    hostId: playerId,
    players: new Map([[playerId, player]]),
    phase: "lobby",
    currentRoundIndex: 0,
    activeRound: null,
    reveal: null,
    winners: [],
    lastActivityAt: Date.now(),
    roundTimer: null,
    revealTimer: null,
  };

  rooms.set(code, room);
  return { room, playerId };
}

export function joinRoom(code: string, playerName: string, socketId: string): JoinRoomResult {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return { error: "Sala no encontrada." };
  }

  if (room.phase !== "lobby") {
    return { error: "Este misterio ya ha comenzado." };
  }

  if (room.players.size >= MAX_PLAYERS) {
    return { error: "La sala está llena." };
  }

  const trimmedName = playerName.trim();
  const nameTaken = [...room.players.values()].some(
    (player) => player.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (nameTaken) {
    return { error: "Ese nombre de detective ya está en uso en esta sala." };
  }

  const playerId = socketId;
  room.players.set(playerId, {
    id: playerId,
    socketId,
    name: trimmedName,
    score: 0,
    isHost: false,
    connected: true,
  });
  room.lastActivityAt = Date.now();

  return { room, playerId };
}

export function getRoom(code: string) {
  return rooms.get(code.toUpperCase()) ?? null;
}

export function toRoomState(room: RoomInternal): RoomState {
  return {
    code: room.code,
    phase: room.phase,
    hostId: room.hostId,
    players: sortPlayers(room.players.values()).map((player) => ({
      id: player.id,
      name: player.name,
      score: player.score,
      isHost: player.id === room.hostId,
      connected: player.connected,
    })),
    currentRoundIndex: room.currentRoundIndex,
    totalRounds: TOTAL_ROUNDS,
    round: makeRoundPublic(room.activeRound),
    reveal: room.reveal,
    submittedPlayerIds: room.activeRound ? [...room.activeRound.submissions.keys()] : [],
    winners: room.winners,
    lastActivityAt: room.lastActivityAt,
  };
}

export function leaveRoom(code: string, playerId: string) {
  const room = getRoom(code);
  if (!room) {
    return null;
  }

  room.players.delete(playerId);
  room.lastActivityAt = Date.now();

  if (room.players.size === 0) {
    clearRoomTimers(room);
    rooms.delete(room.code);
    return null;
  }

  if (room.hostId === playerId) {
    const nextHost = room.players.values().next().value as PlayerInternal;
    room.hostId = nextHost.id;
  }

  for (const player of room.players.values()) {
    player.isHost = player.id === room.hostId;
  }

  return room;
}

export function markDisconnected(socketId: string) {
  for (const room of rooms.values()) {
    const player = room.players.get(socketId);
    if (!player) {
      continue;
    }

    player.connected = false;
    room.lastActivityAt = Date.now();

    if (room.hostId === player.id) {
      const connectedFallback = [...room.players.values()].find((candidate) => candidate.id !== player.id);
      if (connectedFallback) {
        room.hostId = connectedFallback.id;
      }
    }

    for (const existing of room.players.values()) {
      existing.isHost = existing.id === room.hostId;
    }

    return room;
  }

  return null;
}

export function startGame(room: RoomInternal) {
  if (room.phase !== "lobby") {
    return { error: "La partida ya comenzó." };
  }

  if (room.players.size < MIN_PLAYERS) {
    return { error: `Se requieren al menos ${MIN_PLAYERS} jugadores para comenzar.` };
  }

  room.players.forEach((player) => {
    player.score = 0;
  });
  room.currentRoundIndex = 0;
  room.reveal = null;
  room.winners = [];

  beginRound(room, 0);
  return { room };
}

function beginRound(room: RoomInternal, roundIndex: number) {
  clearRoundTimers(room);

  const definition = rounds[roundIndex];
  const startedAt = Date.now();
  const deadlineAt = startedAt + definition.timeLimitSec * 1000;

  room.phase = "question";
  room.currentRoundIndex = roundIndex + 1;
  room.activeRound = {
    definition,
    startedAt,
    deadlineAt,
    submissions: new Map(),
  };
  room.reveal = null;
  room.lastActivityAt = startedAt;
  room.roundTimer = setTimeout(() => {
    revealRound(room);
  }, definition.timeLimitSec * 1000);
}

function revealRound(room: RoomInternal) {
  if (!room.activeRound) {
    return;
  }

  clearRoundTimers(room);
  const { definition, submissions, startedAt, deadlineAt } = room.activeRound;
  const correctAnswer = sanitizeAnswer(definition.answer);
  const results = [...room.players.values()].map((player) => {
    const submission = submissions.get(player.id);
    const answer = submission ? sanitizeAnswer(submission.answer) : null;
    const isCorrect = answer === correctAnswer;
    const responseTimeMs = submission ? Math.max(0, submission.submittedAt - startedAt) : null;
    const remainingRatio =
      responseTimeMs === null ? 0 : Math.max(0, Math.min(1, (deadlineAt - submission!.submittedAt) / (deadlineAt - startedAt)));
    const speedBonus = isCorrect ? Math.round(remainingRatio * 60) : 0;
    const pointsEarned = isCorrect ? 100 + speedBonus : 0;

    player.score += pointsEarned;

    return {
      playerId: player.id,
      playerName: player.name,
      answer,
      isCorrect,
      pointsEarned,
      responseTimeMs,
    };
  });

  room.phase = "reveal";
  room.reveal = {
    correctAnswer: definition.answer,
    explanation: definition.explanation,
    results: results.sort((left, right) => right.pointsEarned - left.pointsEarned),
  };
  room.lastActivityAt = Date.now();

  const isLastRound = room.currentRoundIndex >= TOTAL_ROUNDS;
  room.revealTimer = setTimeout(() => {
    if (isLastRound) {
      room.phase = "finished";
      room.winners = computeWinners(room);
      room.activeRound = null;
      room.reveal = null;
      room.lastActivityAt = Date.now();
      return;
    }

    beginRound(room, room.currentRoundIndex);
  }, ROUND_REVEAL_MS);
}

export function submitAnswer(room: RoomInternal, playerId: string, rawAnswer: string) {
  if (room.phase !== "question" || !room.activeRound) {
    return { error: "No hay un desafío activo en este momento." };
  }

  const player = room.players.get(playerId);
  if (!player) {
    return { error: "Jugador no encontrado en la sala." };
  }

  if (room.activeRound.submissions.has(playerId)) {
    return { error: "Ya enviaste una respuesta para esta ronda." };
  }

  room.activeRound.submissions.set(playerId, {
    answer: rawAnswer,
    submittedAt: Date.now(),
  });
  room.lastActivityAt = Date.now();

  const activePlayers = [...room.players.values()].filter((participant) => participant.connected);
  if (room.activeRound.submissions.size >= activePlayers.length && activePlayers.length > 0) {
    revealRound(room);
  }

  return { room };
}

function clearRoundTimers(room: RoomInternal) {
  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    room.roundTimer = null;
  }
}

function clearRoomTimers(room: RoomInternal) {
  clearRoundTimers(room);
  if (room.revealTimer) {
    clearTimeout(room.revealTimer);
    room.revealTimer = null;
  }
}

export function expireInactiveRooms() {
  const now = Date.now();

  for (const room of rooms.values()) {
    if (now - room.lastActivityAt < ROOM_TTL_MS) {
      continue;
    }

    clearRoomTimers(room);
    rooms.delete(room.code);
  }
}
