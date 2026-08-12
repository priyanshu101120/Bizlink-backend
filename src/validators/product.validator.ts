import { z } from "zod";


export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is too short"),
  description: z.string().max(200, "Product description is too long").optional(),
  price: z.number().positive("Price must be a positive number"),
  quantity: z.number().int("Quantity must be an integer").nonnegative("Quantity cannot be negative"),
})

export const updateProductSchema = z.object({
  name: z.string().min(2, "Product name is too short").optional(),
  description: z.string().max(200, "Product description is too long").optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  quantity: z.number().int("Quantity must be an integer").nonnegative("Quantity cannot be negative").optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;