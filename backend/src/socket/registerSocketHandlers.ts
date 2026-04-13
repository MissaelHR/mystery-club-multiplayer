import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  JoinRoomPayload,
  JoinRoomResponse,
  ServerToClientEvents,
} from "../../../shared/game";
import {
  addDrawingStroke,
  clearDrawing,
  configureGame,
  createRoom,
  endGame,
  expireInactiveRooms,
  getRoom,
  joinRoom,
  kickPlayer,
  leaveRoom,
  markDisconnected,
  restartGame,
  resumeSession,
  startGame,
  submitAnswer,
  toRoomState,
} from "../game/roomManager";

type MysterySocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type MysteryServer = Server<ClientToServerEvents, ServerToClientEvents>;

function findPlayerIdBySocket(roomCode: string, socketId: string) {
  const room = getRoom(roomCode);
  if (!room) {
    return null;
  }

  return [...room.players.values()].find((player) => player.socketId === socketId)?.id ?? null;
}

function emitRoom(io: MysteryServer, roomCode: string) {
  const room = getRoom(roomCode);
  if (!room) {
    return;
  }

  const members = io.sockets.adapter.rooms.get(roomCode);
  if (!members) {
    return;
  }

  for (const socketId of members) {
    const viewerPlayerId = findPlayerIdBySocket(roomCode, socketId);
    io.to(socketId).emit("room:update", toRoomState(room, viewerPlayerId));
  }
}

function emitError(socket: MysterySocket, message: string) {
  socket.emit("room:error", message);
}

function validateName(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return "Elige un nombre de detective de al menos 2 caracteres.";
  }
  if (trimmed.length > 18) {
    return "Los nombres de detective deben tener menos de 18 caracteres.";
  }
  return null;
}

export function registerSocketHandlers(io: MysteryServer) {
  setInterval(() => {
    expireInactiveRooms();
  }, 60 * 1000).unref();

  io.on("connection", (socket) => {
    socket.on("room:create", (payload, callback) => {
      const nameError = validateName(payload.playerName);
      if (nameError) {
        callback({ ok: false, error: nameError });
        return;
      }

      const { room, playerId } = createRoom(payload.playerName, payload.difficulty, socket.id);
      socket.join(room.code);
      callback({
        ok: true,
        playerId,
      });
      emitRoom(io, room.code);
    });

    socket.on("room:join", (payload: JoinRoomPayload, callback: (response: JoinRoomResponse) => void) => {
      const nameError = validateName(payload.playerName);
      if (nameError) {
        callback({ ok: false, error: nameError });
        return;
      }

      const result = joinRoom(payload.roomCode, payload.playerName, socket.id);
      if (!("room" in result)) {
        callback({ ok: false, error: result.error });
        return;
      }

      const { room, playerId } = result;
      socket.join(room.code);
      callback({ ok: true, playerId });
      emitRoom(io, room.code);
    });

    socket.on("room:resume", (payload, callback) => {
      const result = resumeSession(payload.roomCode, payload.playerId, socket.id);
      if (!("room" in result)) {
        callback({ ok: false, error: result.error });
        return;
      }

      const { room, playerId } = result;
      socket.join(room.code);
      callback({ ok: true, playerId });
      emitRoom(io, room.code);
    });

    socket.on("room:leave", ({ roomCode }) => {
      socket.leave(roomCode);
      const playerId = findPlayerIdBySocket(roomCode, socket.id);
      if (!playerId) {
        return;
      }
      const room = leaveRoom(roomCode, playerId);
      if (room) {
        emitRoom(io, room.code);
      }
    });

    socket.on("room:kick", ({ roomCode, targetPlayerId }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }
      if (room.hostId !== findPlayerIdBySocket(roomCode, socket.id)) {
        emitError(socket, "Solo el anfitrión puede expulsar jugadores.");
        return;
      }

      const result = kickPlayer(roomCode, targetPlayerId);
      if (!("kickedSocketId" in result)) {
        emitError(socket, result.error);
        return;
      }

      io.to(result.kickedSocketId).emit("room:kicked", "El anfitrión te expulsó de la sala.");
      io.sockets.sockets.get(result.kickedSocketId)?.leave(roomCode);
      if (result.room) {
        emitRoom(io, result.room.code);
      }
    });

    socket.on("game:configure", ({ roomCode, difficulty, playlist }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }

      if (room.hostId !== findPlayerIdBySocket(roomCode, socket.id)) {
        emitError(socket, "Solo el anfitrión puede configurar la misión.");
        return;
      }

      const result = configureGame(room, difficulty, playlist);
      if ("error" in result && result.error) {
        emitError(socket, result.error);
        return;
      }

      emitRoom(io, room.code);
    });

    socket.on("game:start", ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }

      if (room.hostId !== findPlayerIdBySocket(roomCode, socket.id)) {
        emitError(socket, "Solo el anfitrión puede iniciar la partida.");
        return;
      }

      const result = startGame(room);
      if ("error" in result && result.error) {
        emitError(socket, result.error);
        return;
      }

      emitRoom(io, room.code);
    });

    socket.on("game:end", ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }

      if (room.hostId !== findPlayerIdBySocket(roomCode, socket.id)) {
        emitError(socket, "Solo el anfitrión puede finalizar la partida.");
        return;
      }

      endGame(room);
      emitRoom(io, room.code);
    });

    socket.on("game:restart", ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }

      if (room.hostId !== findPlayerIdBySocket(roomCode, socket.id)) {
        emitError(socket, "Solo el anfitrión puede reiniciar la partida.");
        return;
      }

      restartGame(room);
      emitRoom(io, room.code);
    });

    socket.on("round:submit", ({ roomCode, answer }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }

      const playerId = findPlayerIdBySocket(roomCode, socket.id);
      if (!playerId) {
        emitError(socket, "Jugador no encontrado en la sala.");
        return;
      }

      const result = submitAnswer(room, playerId, answer);
      if ("error" in result && result.error) {
        emitError(socket, result.error);
      }
      emitRoom(io, room.code);
    });

    socket.on("drawing:stroke", ({ roomCode, stroke }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }
      const playerId = findPlayerIdBySocket(roomCode, socket.id);
      if (!playerId) {
        emitError(socket, "Jugador no encontrado en la sala.");
        return;
      }

      const result = addDrawingStroke(room, playerId, stroke);
      if ("error" in result && result.error) {
        emitError(socket, result.error);
        return;
      }
      emitRoom(io, room.code);
    });

    socket.on("drawing:clear", ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }
      const playerId = findPlayerIdBySocket(roomCode, socket.id);
      if (!playerId) {
        emitError(socket, "Jugador no encontrado en la sala.");
        return;
      }

      const result = clearDrawing(room, playerId);
      if ("error" in result && result.error) {
        emitError(socket, result.error);
        return;
      }
      emitRoom(io, room.code);
    });

    socket.on("disconnect", () => {
      const room = markDisconnected(socket.id);
      if (room) {
        emitRoom(io, room.code);
      }
    });
  });
}
