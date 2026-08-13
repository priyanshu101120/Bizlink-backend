import { prisma } from "../config/prisma";
import { Role } from "@prisma/client";

export interface CreateUserData {
  name?: string;
  email: string;
  mobile?: string;
  password: string;
  role: Role;
}

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: CreateUserData) {
    return prisma.user.create({ data });
  },

  updateRefreshToken(id: string, refreshToken: string | null) {
    return prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  },
  findAllByRole(role: Role) {
    return prisma.user.findMany({
      where: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  },
  updatePassword(id: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  },
  delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
