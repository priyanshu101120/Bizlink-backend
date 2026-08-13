import http from "http";
import app from "./app";
import { env } from "./config/env";
import { initSocket } from "./socket/io";

const httpServer = http.createServer(app);
initSocket(httpServer, env.CLIENT_URL);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 BizLink backend running on port ${env.PORT}`);
});