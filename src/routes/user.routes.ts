import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/retailers", requireAuth, requireRole("WHOLESALER"), userController.listRetailers);

router.get("/wholesalers", requireAuth, requireRole("RETAILER"), userController.listWholesalers);

export default router;