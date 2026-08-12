import { Request, Response, NextFunction } from "express";
import { connectionService } from "../services/connection.service";

export const connectionController = {
  async connect(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.user!;
      const { targetUserId } = req.body;
      const connection = await connectionService.connect(
        userId,
        role,
        targetUserId,
      );
      res.status(201).json({ message: "Connected successfully", connection });
    } catch (err) {
      next(err);
    }
  },

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, role } = req.user!;
      const connections =
        role === "WHOLESALER"
          ? await connectionService.listForWholesaler(userId)
          : await connectionService.listForRetailer(userId);
      res.status(200).json({ connections });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await connectionService.removeConnection(req.params.id, userId);
      res.status(200).json({ message: "Connection removed" });
    } catch (err) {
      next(err);
    }
  },
};
