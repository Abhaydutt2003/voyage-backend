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
    await prisma.$transaction(async (localPrisma) => {
      const lease = await leaseRepository.checkLeaseReviewAdded(
        localPrisma,
        leaseId
      );
      if (!lease) {
        throw new NotFoundError("Lease not found");
      }
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
    });
  }

  async getAccpetedLeasesTimes(propertyId: number) {
    return await leaseRepository.getAccepetedLeasesTimes(propertyId);
  }
}

export const leaseService = new LeaseService();
