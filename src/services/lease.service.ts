import { NotFoundError } from "../middlewares/error.middleware";
import { leaseRepository } from "../repositories/lease.repository";

class LeaseService {
  async getLeases() {
    const leases = await leaseRepository.findManyLeases();
    if (!leases || leases.length === 0) {
      throw new NotFoundError("No leases found");
    }
    return leases;
  }

  async getAccpetedLeasesTimes(propertyId: number) {
    return await leaseRepository.getAccepetedLeasesTimes(propertyId);
  }
}

export const leaseService = new LeaseService();
