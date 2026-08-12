import { connectionRepository } from "../repositories/connection.repository";
import { productRepository } from "../repositories/product.repository";
import {
  CreateProductInput,
  UpdateProductInput,
} from "../validators/product.validator";
import { ApiError } from "./auth.service";

export const productService = {
  async create(wholesalerId: string, input: CreateProductInput) {
    return productRepository.create(wholesalerId, input);
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
    if (!product) throw new Error("Product not found");
    if (product.wholesalerId !== wholesalerId) {
      throw new ApiError(403, "You are not authorized to update this product");
    }
    return productRepository.update(productId, input);
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
