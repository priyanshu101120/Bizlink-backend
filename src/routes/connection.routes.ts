import { Router } from "express";
import { connectionController } from "../controllers/connection.controller";
import { validate } from "../middlewares/validate.middleware";
import { createConnectionSchema } from "../validators/connection.validator";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createConnectionSchema),
  connectionController.connect,
);

router.get("/mine", requireAuth, connectionController.listMine);

router.delete("/:id", requireAuth, connectionController.remove);

export default router;
