import { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/user.repository";

export const userController = {
  async listRetailers(req: Request, res: Response, next: NextFunction) {
    try {
      const retailers = await userRepository.findAllByRole("RETAILER");
      res.status(200).json({ retailers });
    } catch (err) {
      next(err);
    }
  },

  async listWholesalers(req: Request, res: Response, next: NextFunction) {
    try {
      const wholesalers = await userRepository.findAllByRole("WHOLESALER");
      res.status(200).json({ wholesalers });
    } catch (err) {
      next(err);
    }
  },
};