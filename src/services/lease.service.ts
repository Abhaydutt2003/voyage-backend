import { NotFoundError } from "../middlewares/error.middleware";
import { leaseRepository } from "../repositories/lease.repository";
import { propertyRepository } from "../repositories/property.repository";
import { prisma } from "../lib/prisma";

class LeaseService {
  async reviewLeaseProperty(
    leaseId: number,
    propertyId: number,
    reviewRating: number
  ) {
    //can be outside the transcation as this result is not affected by others.
    const lease = await leaseRepository.checkLeaseReviewAdded(leaseId);
    if (!lease) {
      throw new NotFoundError("Lease not found");
    }
    await prisma.$transaction(
      async (localPrisma) => {
        const property = await propertyRepository.getPropertyReviewData(
          localPrisma,
          propertyId
        );
        if (!property) {
          throw new NotFoundError("Property not found");
        }
        const currentTotal =
          (property.averageRating || 0) * (property.numberOfReviews || 0);
        const newTotal = currentTotal + reviewRating;
        const newNumberOfReviews = (property.numberOfReviews || 0) + 1;
        const newAverageRating = newTotal / newNumberOfReviews;
        await propertyRepository.addReview(
          localPrisma,
          propertyId,
          newAverageRating,
          newNumberOfReviews
        );
        // mark the lease to be reviwed
        //inside the isolation because if marking lease fails, the user can give review again
        await leaseRepository.markLeaseReviewed(localPrisma, leaseId);
      },
      {
        isolationLevel: "Serializable", //crucial to handle race conditons.
      }
    );
  }

  async getAccpetedLeasesTimes(propertyId: number) {
    return await leaseRepository.getAccepetedLeasesTimes(propertyId);
  }
}

export const leaseService = new LeaseService();
