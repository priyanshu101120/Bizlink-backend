import { prisma } from "../config/prisma";

export const productRepository = {
  create(
    wholesalerId: string,
    data: {
      name: string;
      quantity: number;
      price?: number;
      description?: string;
    },
  ) {
    return prisma.product.create({
      data: {
        ...data,
        wholesalerId,
      },
    });
  },
  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
    });
  },
  findAllByWholesaler(wholesalerId: string) {
    return prisma.product.findMany({
      where: { wholesalerId },
    });
  },
  update(
    id: string,
    data: {
      name?: string;
      quantity?: number;
      price?: number;
      description?: string;
    },
  ) {
    return prisma.product.update({
      where: { id },
      data,
    });
  },
  delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  },
  findAllByWholesalerIds(wholesalerIds: string[]) {
    return prisma.product.findMany({
      where: { wholesalerId: { in: wholesalerIds } },
      orderBy: { createdAt: "desc" },
    });
  },
};
