import { connectionRepository } from "../repositories/connection.repository";
import { productRepository } from "../repositories/product.repository";
import { getIO } from "../socket/io";
import {
  CreateProductInput,
  UpdateProductInput,
} from "../validators/product.validator";
import { ApiError } from "./auth.service";

const LOW_STOCK_THRESHOLD = 10;

export const productService = {
  async create(wholesalerId: string, input: CreateProductInput) {
    const product = await productRepository.create(wholesalerId, input);
    emitProductEvent(wholesalerId, product);
    return product;
  },

  async listMine(wholesalerId: string) {
    return productRepository.findAllByWholesaler(wholesalerId);
  },
  async update(
    wholesalerId: string,
    productId: string,
    input: UpdateProductInput,
  ) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");
    if (product.wholesalerId !== wholesalerId) {
      throw new ApiError(403, "You can only edit your own products");
    }
    const updated = await productRepository.update(productId, input);
    emitProductEvent(wholesalerId, updated);
    return updated;
  },
  async remove(wholesalerId: string, productId: string) {
    const product = await productRepository.findById(productId);
    if (!product) throw new Error("Product not found");
    if (product.wholesalerId !== wholesalerId) {
      throw new ApiError(403, "You are not authorized to delete this product");
    }
    return productRepository.delete(productId);
  },
  async listForRetailer(retailerId: string) {
    const connections =
      await connectionRepository.findAllForRetailer(retailerId);
    const wholesalerIds = connections
      .map((c) => c.wholesalerId)
      .filter((id): id is string => !!id);
    if (wholesalerIds.length === 0) return [];
    return productRepository.findAllByWholesalerIds(wholesalerIds);
  },
};
function emitProductEvent(wholesalerId: string, product: any) {
  const io = getIO();
  io.to(`wholesaler:${wholesalerId}`).emit("product:update", product);

  if (product.quantity <= LOW_STOCK_THRESHOLD) {
    io.to(`wholesaler:${wholesalerId}`).emit("product:low-stock", {
      productId: product.id,
      name: product.name,
      quantity: product.quantity,
    });
  }
}
