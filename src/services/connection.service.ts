import { connectionRepository } from "../repositories/connection.repository";
import { ApiError } from "./auth.service";

export const connectionService = {
  async connect(
    currentUserId: string,
    currentUserRole: string,
    targetUserId: string,
  ) {
    const wholesalerId =
      currentUserRole === "WHOLESALER" ? currentUserId : targetUserId;
    const retailerId =
      currentUserRole === "RETAILER" ? currentUserId : targetUserId;

    const existing = await connectionRepository.findExisting(
      wholesalerId,
      retailerId,
    );
    if (existing) {
      throw new ApiError(409, "Already connected");
    }
    return connectionRepository.create(wholesalerId, retailerId);
  },
  async listForRetailer(retailerId: string) {
    return connectionRepository.findAllForRetailer(retailerId);
  },
  async listForWholesaler(wholesalerId: string) {
  return connectionRepository.findAllForWholesaler(wholesalerId);
},
  async removeConnection(connectionId: string, userId: string) {
    const connection = await connectionRepository.findById(connectionId);
    if (!connection) throw new ApiError(404, "Connection not found");
    if (
      connection.wholesalerId !== userId &&
      connection.retailerId !== userId
    ) {
      throw new ApiError(
        403,
        "You are not authorized to delete this connection",
      );
    }
    return connectionRepository.delete(connectionId);
  },
};
