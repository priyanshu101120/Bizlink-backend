import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, changePasswordSchema } from "../validators/auth.validator";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);
router.put(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.delete("/account", requireAuth, authController.deleteAccount);

export default router;
