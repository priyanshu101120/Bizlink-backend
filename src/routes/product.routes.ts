import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator";
import { validate } from "../middlewares/validate.middleware";
import { productController } from "../controllers/product.controller";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("WHOLESALER"),
  validate(createProductSchema),
  productController.create,
);
router.get(
  "/mine",
  requireAuth,
  requireRole("WHOLESALER"),
  productController.listMine,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("WHOLESALER"),
  validate(updateProductSchema),
  productController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("WHOLESALER"),
  productController.remove,
);
router.get(
  "/connected",
  requireAuth,
  requireRole("RETAILER"),
  productController.listForRetailer,
);

export default router;
