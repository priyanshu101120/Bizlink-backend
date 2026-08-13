import { Request, Response, NextFunction } from "express";
import { authService, ApiError } from "../services/auth.service";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies";
import { userRepository } from "../repositories/user.repository";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.register(
        req.body,
      );
      setAuthCookies(res, accessToken, refreshToken);
      res.status(201).json({ message: "Registered successfully", user });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(
        req.body,
      );
      setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ message: "Logged in successfully", user });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const incomingToken = req.cookies?.refreshToken;
      if (!incomingToken) {
        throw new ApiError(401, "No refresh token provided");
      }
      const { user, accessToken, refreshToken } =
        await authService.refresh(incomingToken);
      setAuthCookies(res, accessToken, refreshToken);
      res.status(200).json({ message: "Token refreshed", user });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (userId) {
        await authService.logout(userId);
      }
      clearAuthCookies(res);
      res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, refreshToken, ...safeUser } = user;
      res.status(200).json({ user: safeUser });
    } catch (err) {
      next(err);
    }
  },
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(
        req.user!.userId,
        currentPassword,
        newPassword,
      );
      clearAuthCookies(res);
      res
        .status(200)
        .json({ message: "Password changed. Please login again." });
    } catch (err) {
      next(err);
    }
  },

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.deleteAccount(req.user!.userId);
      clearAuthCookies(res);
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
