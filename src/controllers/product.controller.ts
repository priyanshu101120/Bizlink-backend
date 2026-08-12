import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service";

export const productController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const wholesalerId = req.user!.userId;
      const product = await productService.create(wholesalerId, req.body);
      res
        .status(201)
        .json({ message: "Product created successfully", product });
    } catch (error) {
      next(error);
    }
  },
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const wholesalerId = req.user!.userId;
      const products = await productService.listMine(wholesalerId);
      res.status(200).json({ products });
    } catch (error) {
      next(error);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const wholesalerId = req.user!.userId;
      const product = await productService.update(
        wholesalerId,
        req.params.id,
        req.body,
      );
      res
        .status(200)
        .json({ message: "Product updated successfully", product });
    } catch (error) {
      next(error);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const wholesalerId = req.user!.userId;
      await productService.remove(wholesalerId, req.params.id);
      res.status(200).json({ message: "Product removed successfully" });
    } catch (error) {
      next(error);
    }
  },
  async listForRetailer(req: Request, res: Response, next: NextFunction) {
    try {
      const retailerId = req.user!.userId;
      const products = await productService.listForRetailer(retailerId);
      res.status(200).json({ products });
    } catch (err) {
      next(err);
    }
  },
};
