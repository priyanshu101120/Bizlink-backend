import { z } from "zod";

export const createConnectionSchema = z.object({
  targetUserId: z.string().uuid("Invalid user ID"),
});

export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
