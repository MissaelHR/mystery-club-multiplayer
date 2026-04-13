import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@shared/game";

function getDefaultServerUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:4000";
  }

  return window.location.origin;
}

const serverUrl = import.meta.env.VITE_SERVER_URL ?? getDefaultServerUrl();

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, {
  autoConnect: true,
});
