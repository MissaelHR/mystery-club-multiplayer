import cors from "cors";
import express from "express";
import fs from "fs";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../shared/game";
import { config } from "./config";
import { registerSocketHandlers } from "./socket/registerSocketHandlers";

const app = express();
app.use(
  cors({
    origin: config.frontendUrl || true,
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    service: "mystery-club-backend",
  });
});

const frontendDistDir = path.resolve(process.cwd(), "frontend", "dist");
if (fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/socket.io") || request.path.startsWith("/health")) {
      next();
      return;
    }

    response.sendFile(path.join(frontendDistDir, "index.html"));
  });
}

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: config.frontendUrl || true,
  },
});

registerSocketHandlers(io);

server.listen(config.port, () => {
  console.log(`Mystery Club backend listening on http://localhost:${config.port}`);
});
