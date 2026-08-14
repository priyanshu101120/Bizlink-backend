import { prisma } from "../config/prisma";

export const productRepository = {
  create(wholesalerId: string, data: { name: string; quantity: number; price?: number }) {
    return prisma.product.create({
      data: { ...data, wholesalerId },
      include: { wholesaler: { select: { name: true } } },
    });
  },

  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },

  findAllByWholesaler(wholesalerId: string) {
    return prisma.product.findMany({ where: { wholesalerId } });
  },

  findAllByWholesalerIds(wholesalerIds: string[]) {
    return prisma.product.findMany({
      where: { wholesalerId: { in: wholesalerIds } },
      include: { wholesaler: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  update(id: string, data: Partial<{ name: string; quantity: number; price: number }>) {
    return prisma.product.update({
      where: { id },
      data,
      include: { wholesaler: { select: { name: true } } },
    });
  },

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};