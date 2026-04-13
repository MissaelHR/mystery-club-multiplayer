import {
  ChallengeCatalogItem,
  MAX_PLAYERS,
  MIN_PLAYERS,
  PlayerPublic,
  ROOM_TTL_MS,
  RoomState,
  RoundDefinition,
  RoundPublic,
  RoundReveal,
  WinnerSummary,
} from "../../../shared/game";
import { challengeCatalog, rounds } from "./rounds";

interface PlayerInternal extends PlayerPublic {
  socketId: string;
}

interface Submission {
  answer: string;
  submittedAt: number;
  isCorrect: boolean;
  pointsEarned: number;
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
  selectedChallengeId: string | null;
  activeRound: ActiveRound | null;
  reveal: RoundReveal | null;
  lastActivityAt: number;
  roundTimer: NodeJS.Timeout | null;
}

type JoinRoomResult =
  | { error: string }
  | {
      room: RoomInternal;
      playerId: string;
    };

const rooms = new Map<string, RoomInternal>();
const definitionsById = new Map(rounds.map((round) => [round.id, round]));
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
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s*,\s*/g, ", ");
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

function getSelectedChallenge(room: RoomInternal): ChallengeCatalogItem | null {
  return challengeCatalog.find((item) => item.id === room.selectedChallengeId) ?? null;
}

function makeRoundPublic(activeRound: ActiveRound | null): RoundPublic | null {
  if (!activeRound) {
    return null;
  }

  const { definition, deadlineAt, startedAt } = activeRound;
  return {
    id: definition.id,
    chapterNumber: definition.chapterNumber,
    chapterTitle: definition.chapterTitle,
    challengeType: definition.challengeType,
    minigameTitle: definition.minigameTitle,
    teaser: definition.teaser,
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

function clearRoundTimer(room: RoomInternal) {
  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    room.roundTimer = null;
  }
}

function finishRound(
  room: RoomInternal,
  outcome: RoundReveal["outcome"],
  finishedByPlayerName?: string,
) {
  if (!room.activeRound) {
    return;
  }

  clearRoundTimer(room);
  const { definition, submissions, startedAt } = room.activeRound;
  const results = [...room.players.values()].map((player) => {
    const submission = submissions.get(player.id);
    return {
      playerId: player.id,
      playerName: player.name,
      answer: submission ? sanitizeAnswer(submission.answer) : null,
      isCorrect: submission ? submission.isCorrect : false,
      pointsEarned: submission ? submission.pointsEarned : 0,
      responseTimeMs: submission ? Math.max(0, submission.submittedAt - startedAt) : null,
    };
  });

  const headlineByOutcome: Record<RoundReveal["outcome"], string> = {
    victory: "Mision completada",
    mistake: `Partida cerrada por un error${finishedByPlayerName ? ` de ${finishedByPlayerName}` : ""}`,
    timeout: "Tiempo agotado",
  };

  room.phase = "finished";
  room.reveal = {
    outcome,
    headline: headlineByOutcome[outcome],
    correctAnswer: definition.answer,
    explanation: definition.explanation,
    finishedByPlayerName,
    results: results.sort((left, right) => right.pointsEarned - left.pointsEarned),
  };
  room.activeRound = null;
  room.lastActivityAt = Date.now();
}

function startSelectedChallenge(room: RoomInternal) {
  const definition = room.selectedChallengeId ? definitionsById.get(room.selectedChallengeId) : null;
  if (!definition) {
    return { error: "Selecciona un minijuego antes de empezar." };
  }

  clearRoundTimer(room);
  const startedAt = Date.now();
  room.phase = "question";
  room.reveal = null;
  room.activeRound = {
    definition,
    startedAt,
    deadlineAt: startedAt + definition.timeLimitSec * 1000,
    submissions: new Map(),
  };
  room.lastActivityAt = startedAt;
  room.roundTimer = setTimeout(() => finishRound(room, "timeout"), definition.timeLimitSec * 1000);
  return { room };
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
    selectedChallengeId: challengeCatalog[0]?.id ?? null,
    activeRound: null,
    reveal: null,
    lastActivityAt: Date.now(),
    roundTimer: null,
  };

  rooms.set(code, room);
  return { room, playerId };
}

export function joinRoom(code: string, playerName: string, socketId: string): JoinRoomResult {
  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return { error: "Sala no encontrada." };
  }

  if (room.phase === "question") {
    return { error: "La partida ya está en curso." };
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
    availableChallenges: challengeCatalog,
    selectedChallengeId: room.selectedChallengeId,
    selectedChallenge: getSelectedChallenge(room),
    round: makeRoundPublic(room.activeRound),
    reveal: room.reveal,
    submittedPlayerIds: room.activeRound ? [...room.activeRound.submissions.keys()] : [],
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
  room.lastActivityAt = Date.now();

  if (room.players.size === 0) {
    clearRoundTimer(room);
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

  if (room.phase === "question" && room.activeRound) {
    const connectedPlayers = [...room.players.values()].filter((player) => player.connected);
    if (
      connectedPlayers.length > 0 &&
      connectedPlayers.every((player) => room.activeRound?.submissions.has(player.id))
    ) {
      finishRound(room, "victory");
    }
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

    if (room.phase === "question" && room.activeRound) {
      const connectedPlayers = [...room.players.values()].filter((candidate) => candidate.connected);
      if (
        connectedPlayers.length > 0 &&
        connectedPlayers.every((candidate) => room.activeRound?.submissions.has(candidate.id))
      ) {
        finishRound(room, "victory");
      }
    }

    return room;
  }

  return null;
}

export function configureGame(room: RoomInternal, challengeId: string) {
  if (room.phase === "question") {
    return { error: "No puedes cambiar el minijuego con una partida activa." };
  }

  if (!definitionsById.has(challengeId)) {
    return { error: "El minijuego seleccionado no existe." };
  }

  room.selectedChallengeId = challengeId;
  room.phase = "lobby";
  room.reveal = null;
  room.activeRound = null;
  room.lastActivityAt = Date.now();
  return { room };
}

export function startGame(room: RoomInternal) {
  if (room.phase === "question") {
    return { error: "La partida ya comenzó." };
  }

  if (room.players.size < MIN_PLAYERS) {
    return { error: `Se requieren al menos ${MIN_PLAYERS} jugadores para comenzar.` };
  }

  return startSelectedChallenge(room);
}

export function restartGame(room: RoomInternal) {
  clearRoundTimer(room);
  room.phase = "lobby";
  room.reveal = null;
  room.activeRound = null;
  room.lastActivityAt = Date.now();
  return { room };
}

export function submitAnswer(room: RoomInternal, playerId: string, rawAnswer: string) {
  if (room.phase !== "question" || !room.activeRound) {
    return { error: "No hay un minijuego activo en este momento." };
  }

  const player = room.players.get(playerId);
  if (!player) {
    return { error: "Jugador no encontrado en la sala." };
  }

  if (room.activeRound.submissions.has(playerId)) {
    return { error: "Ya enviaste una respuesta para esta partida." };
  }

  const now = Date.now();
  const normalizedAnswer = sanitizeAnswer(rawAnswer);
  const expectedAnswer = sanitizeAnswer(room.activeRound.definition.answer);
  const isCorrect = normalizedAnswer === expectedAnswer;
  const responseTimeMs = Math.max(0, now - room.activeRound.startedAt);
  const remainingRatio = Math.max(
    0,
    Math.min(1, (room.activeRound.deadlineAt - now) / (room.activeRound.deadlineAt - room.activeRound.startedAt)),
  );
  const pointsEarned = isCorrect ? 100 + Math.round(remainingRatio * 60) : 0;

  if (isCorrect) {
    player.score += pointsEarned;
  }

  room.activeRound.submissions.set(playerId, {
    answer: rawAnswer,
    submittedAt: now,
    isCorrect,
    pointsEarned,
  });
  room.lastActivityAt = now;

  if (!isCorrect) {
    finishRound(room, "mistake", player.name);
    return { room };
  }

  const connectedPlayers = [...room.players.values()].filter((participant) => participant.connected);
  if (
    connectedPlayers.length > 0 &&
    connectedPlayers.every((participant) => room.activeRound?.submissions.has(participant.id))
  ) {
    finishRound(room, "victory", player.name);
  }

  return { room };
}

export function expireInactiveRooms() {
  const now = Date.now();
  for (const room of rooms.values()) {
    if (now - room.lastActivityAt < ROOM_TTL_MS) {
      continue;
    }

    clearRoundTimer(room);
    rooms.delete(room.code);
  }
}
