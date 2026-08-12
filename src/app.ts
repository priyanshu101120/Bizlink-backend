import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { env } from "./config/env";

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Yeh add karo
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api", routes);
app.use(errorHandler);

export default app;
