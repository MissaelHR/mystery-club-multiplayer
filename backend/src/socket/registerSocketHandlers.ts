import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  JoinRoomPayload,
  JoinRoomResponse,
  ServerToClientEvents,
} from "../../../shared/game";
import {
  configureGame,
  createRoom,
  expireInactiveRooms,
  getRoom,
  joinRoom,
  leaveRoom,
  markDisconnected,
  restartGame,
  startGame,
  submitAnswer,
  toRoomState,
} from "../game/roomManager";

type MysterySocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type MysteryServer = Server<ClientToServerEvents, ServerToClientEvents>;

function emitRoom(io: MysteryServer, roomCode: string) {
  const room = getRoom(roomCode);
  if (!room) {
    return;
  }
  io.to(roomCode).emit("room:update", toRoomState(room));
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

      const { room, playerId } = createRoom(payload.playerName, socket.id);
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

    socket.on("room:leave", ({ roomCode }) => {
      socket.leave(roomCode);
      const room = leaveRoom(roomCode, socket.id);
      if (room) {
        emitRoom(io, room.code);
      }
    });

    socket.on("game:configure", ({ roomCode, challengeId }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }

      if (room.hostId !== socket.id) {
        emitError(socket, "Solo el anfitrión puede elegir capítulo y minijuego.");
        return;
      }

      const result = configureGame(room, challengeId);
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

      if (room.hostId !== socket.id) {
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

    socket.on("game:restart", ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) {
        emitError(socket, "Sala no encontrada.");
        return;
      }

      if (room.hostId !== socket.id) {
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

      const result = submitAnswer(room, socket.id, answer);
      if ("error" in result && result.error) {
        emitError(socket, result.error);
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
