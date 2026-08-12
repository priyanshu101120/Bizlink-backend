import { prisma } from "../config/prisma";

export const connectionRepository = {
  create(wholesalerId: string, retailerId: string) {
    return prisma.connection.create({
      data: { wholesalerId, retailerId },
    });
  },

  findExisting(wholesalerId: string, retailerId: string) {
    return prisma.connection.findFirst({
      where: { wholesalerId, retailerId },
    });
  },

  findAllForRetailer(retailerId: string) {
    return prisma.connection.findMany({
      where: { retailerId },
      include: { wholesaler: { select: { id: true, name: true, email: true } } },
    });
  },

  findAllForWholesaler(wholesalerId: string) {
    return prisma.connection.findMany({
      where: { wholesalerId },
      include: { retailer: { select: { id: true, name: true, email: true } } },
    });
  },

  findById(id: string) {
    return prisma.connection.findUnique({ where: { id } });
  },

  delete(id: string) {
    return prisma.connection.delete({ where: { id } });
  },
};