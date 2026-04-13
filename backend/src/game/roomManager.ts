import {
  DIFFICULTY_OPTIONS,
  DifficultyLevel,
  DrawingStroke,
  GAME_SUBTITLE,
  GAME_TITLE,
  MAX_PLAYERS,
  MINI_GAME_CATALOG,
  MIN_PLAYERS,
  MiniGameType,
  PlayerPublic,
  ROOM_TTL_MS,
  RoomState,
  StageDefinition,
  StagePublic,
  WinnerSummary,
} from "../../../shared/game";
import { buildStageQueue } from "./rounds";

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
  selectedDifficulty: DifficultyLevel;
  configuredMiniGames: MiniGameType[];
  stageQueue: StageDefinition[];
  currentStageIndex: number;
  stage: StageDefinition | null;
  submissions: Map<string, Submission>;
  finished: RoomState["finished"];
  lastActivityAt: number;
}

type JoinRoomResult = { error: string } | { room: RoomInternal; playerId: string };
type KickResult = { error: string } | { room: RoomInternal | null; kickedSocketId: string };

const DEFAULT_PLAYLIST: MiniGameType[] = ["crucigrama", "sopa", "dibujo", "memorama"];
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

function sanitizePlaylist(playlist: MiniGameType[] | undefined) {
  const validIds = new Set(MINI_GAME_CATALOG.map((game) => game.id));
  const seen = new Set<MiniGameType>();
  const sanitized = (playlist ?? DEFAULT_PLAYLIST).filter((miniGame): miniGame is MiniGameType => {
    if (!validIds.has(miniGame) || seen.has(miniGame)) {
      return false;
    }
    seen.add(miniGame);
    return true;
  });

  return sanitized.length > 0 ? sanitized : DEFAULT_PLAYLIST;
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

function getConnectedPlayers(room: RoomInternal) {
  return [...room.players.values()].filter((player) => player.connected);
}

function getDrawingDrawerId(stage: StageDefinition | null) {
  return stage?.miniGameType === "dibujo" ? stage.drawing?.drawerPlayerId ?? null : null;
}

function getStagePoints(room: RoomInternal, stage: StageDefinition) {
  const difficultyBonus: Record<DifficultyLevel, number> = {
    explorador: 110,
    agente: 160,
    leyenda: 220,
  };

  const gameBonus: Record<MiniGameType, number> = {
    crucigrama: 35,
    sopa: 45,
    dibujo: 55,
    memorama: 40,
  };

  return difficultyBonus[room.selectedDifficulty] + gameBonus[stage.miniGameType] + room.currentStageIndex * 20;
}

function buildFinalResults(room: RoomInternal) {
  return sortPlayers(room.players.values()).map((player) => ({
    playerId: player.id,
    playerName: player.name,
    answer: null,
    isCorrect: false,
    pointsEarned: player.score,
  }));
}

function toStagePublic(stage: StageDefinition | null, viewerPlayerId?: string | null): StagePublic | null {
  if (!stage) {
    return null;
  }

  if (stage.miniGameType === "dibujo" && stage.drawing) {
    return {
      ...stage,
      drawing: {
        ...stage.drawing,
        promptForDrawer: viewerPlayerId === stage.drawing.drawerPlayerId ? stage.drawing.promptForDrawer : undefined,
      },
    };
  }

  return {
    ...stage,
  };
}

function advanceStage(room: RoomInternal) {
  if (room.currentStageIndex >= room.stageQueue.length) {
    room.phase = "finished";
    room.stage = null;
    room.finished = {
      outcome: "victory",
      headline: "Mision completada",
      explanation: "La secuencia termino. Gana quien sumo mas puntos en el marcador final.",
      stageResults: buildFinalResults(room),
    };
    return;
  }

  room.stage = room.stageQueue[room.currentStageIndex];
  room.phase = "playing";
  room.finished = null;
  resetAnswers(room);

  const drawerId = getDrawingDrawerId(room.stage);
  if (drawerId) {
    const drawer = room.players.get(drawerId);
    if (drawer) {
      drawer.answeredCurrentStage = true;
      room.submissions.set(drawer.id, {
        answer: "DIBUJANTE",
        isCorrect: true,
        pointsEarned: 0,
      });
    }
  }
}

function startPreparedGame(room: RoomInternal) {
  const playerIds = [...room.players.values()].map((player) => player.id);
  room.stageQueue = buildStageQueue(room.selectedDifficulty, room.configuredMiniGames, playerIds);
  room.currentStageIndex = 0;
  room.finished = null;
  for (const player of room.players.values()) {
    player.score = 0;
  }
  advanceStage(room);
}

export function createRoom(playerName: string, difficulty: DifficultyLevel, socketId: string) {
  let code = randomCode();
  while (rooms.has(code)) {
    code = randomCode();
  }

  const selectedDifficulty = DIFFICULTY_OPTIONS.some((item) => item.id === difficulty) ? difficulty : "explorador";
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
    selectedDifficulty,
    configuredMiniGames: [...DEFAULT_PLAYLIST],
    stageQueue: [],
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

export function toRoomState(room: RoomInternal, viewerPlayerId?: string | null): RoomState {
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
    gameTitle: GAME_TITLE,
    gameSubtitle: GAME_SUBTITLE,
    selectedDifficulty: room.selectedDifficulty,
    configuredMiniGames: room.configuredMiniGames,
    availableDifficulties: DIFFICULTY_OPTIONS,
    availableMiniGames: MINI_GAME_CATALOG,
    currentStageNumber: room.phase === "playing" ? room.currentStageIndex + 1 : room.currentStageIndex,
    totalStages: room.configuredMiniGames.length,
    stage: toStagePublic(room.stage, viewerPlayerId),
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
    const connectedPlayers = getConnectedPlayers(room);
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

export function configureGame(room: RoomInternal, difficulty: DifficultyLevel, playlist: MiniGameType[]) {
  if (!DIFFICULTY_OPTIONS.some((item) => item.id === difficulty)) {
    return { error: "Esa dificultad no existe." };
  }

  room.selectedDifficulty = difficulty;
  room.configuredMiniGames = sanitizePlaylist(playlist);
  room.stageQueue = [];
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

  startPreparedGame(room);
  room.lastActivityAt = Date.now();
  return { room };
}

export function restartGame(room: RoomInternal) {
  room.phase = "lobby";
  room.currentStageIndex = 0;
  room.stageQueue = [];
  room.stage = null;
  room.finished = null;
  room.lastActivityAt = Date.now();
  resetAnswers(room);
  for (const player of room.players.values()) {
    player.score = 0;
  }
  return { room };
}

export function endGame(room: RoomInternal) {
  room.phase = "finished";
  room.stage = null;
  room.finished = {
    outcome: "stopped",
    headline: "Partida finalizada",
    explanation: "El anfitrion cerro la sesion y el marcador quedo fijado.",
    stageResults: buildFinalResults(room),
  };
  room.lastActivityAt = Date.now();
  resetAnswers(room);
  return { room };
}

export function addDrawingStroke(room: RoomInternal, playerId: string, stroke: DrawingStroke) {
  if (room.phase !== "playing" || !room.stage || room.stage.miniGameType !== "dibujo" || !room.stage.drawing) {
    return { error: "No hay un lienzo activo." };
  }
  if (room.stage.drawing.drawerPlayerId !== playerId) {
    return { error: "Solo el dibujante puede usar el lienzo." };
  }

  room.stage.drawing.strokes.push(stroke);
  room.lastActivityAt = Date.now();
  return { room };
}

export function clearDrawing(room: RoomInternal, playerId: string) {
  if (room.phase !== "playing" || !room.stage || room.stage.miniGameType !== "dibujo" || !room.stage.drawing) {
    return { error: "No hay un lienzo activo." };
  }
  if (room.stage.drawing.drawerPlayerId !== playerId) {
    return { error: "Solo el dibujante puede limpiar el lienzo." };
  }

  room.stage.drawing.strokes = [];
  room.lastActivityAt = Date.now();
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

  const drawerId = getDrawingDrawerId(room.stage);
  if (drawerId === playerId) {
    return { error: "El dibujante no responde esta ronda." };
  }

  if (player.answeredCurrentStage) {
    return { error: "Ya enviaste una respuesta en esta etapa." };
  }

  const normalizedAnswer = normalizeText(rawAnswer);
  const expectedAnswer = normalizeText(room.stage.answer);
  const isCorrect = normalizedAnswer === expectedAnswer;
  const pointsEarned = isCorrect ? getStagePoints(room, room.stage) : 0;

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

  const connectedPlayers = getConnectedPlayers(room);
  if (connectedPlayers.length > 0 && connectedPlayers.every((candidate) => candidate.answeredCurrentStage)) {
    if (drawerId) {
      const drawer = room.players.get(drawerId);
      const anyCorrectGuess = [...room.submissions.entries()].some(
        ([submissionPlayerId, submission]) => submissionPlayerId !== drawerId && submission.isCorrect,
      );

      if (drawer && anyCorrectGuess) {
        const drawerPoints = Math.floor(getStagePoints(room, room.stage) * 0.6);
        drawer.score += drawerPoints;
        room.submissions.set(drawer.id, {
          answer: "DIBUJO ENTREGADO",
          isCorrect: true,
          pointsEarned: drawerPoints,
        });
      }
    }

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
