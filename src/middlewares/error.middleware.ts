import { Request, Response, NextFunction } from "express";
import { ApiError } from "../services/auth.service";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Something went wrong" });
}