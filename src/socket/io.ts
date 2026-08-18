import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { verifyAccessToken } from "../utils/jwt";
import cookie from "cookie";

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer, clientUrl: string) {
  io = new SocketIOServer(httpServer, {
    cors: { origin: clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Not authenticated"));

      const parsed = cookie.parse(rawCookie);
      if (!parsed.accessToken) return next(new Error("Not authenticated"));

      const payload = verifyAccessToken(parsed.accessToken);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Not authenticated"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, role } = socket.data;

    if (role === "WHOLESALER") {
      socket.join(`wholesaler:${userId}`);
    } else {
      socket.on("join-wholesaler-rooms", (wholesalerIds: string[]) => {
        wholesalerIds.forEach((id) => socket.join(`wholesaler:${id}`));
      });
    }
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
}