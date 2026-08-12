import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/auth.validator";

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(409, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      mobile: input.mobile,
      password: hashedPassword,
      role: input.role,
    });

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: sanitizeUser(user), ...tokens };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: sanitizeUser(user), ...tokens };
  },

  async refresh(incomingToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(incomingToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.refreshToken !== incomingToken) {
      throw new ApiError(401, "Refresh token mismatch — please login again");
    }

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: sanitizeUser(user), ...tokens };
  },

  async logout(userId: string) {
    await userRepository.updateRefreshToken(userId, null);
  },

  async issueTokens(userId: string, role: string) {
    const accessToken = signAccessToken({ userId, role });
    const refreshToken = signRefreshToken({ userId, role });
    await userRepository.updateRefreshToken(userId, refreshToken);
    return { accessToken, refreshToken };
  },
};

function sanitizeUser(user: any) {
  const { password, refreshToken, ...safe } = user;
  return safe;
}