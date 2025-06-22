import { leaseRepository } from "../repositories/lease.repository";

class LeaseService {
  async getAccpetedLeasesTimes(propertyId: number) {
    return await leaseRepository.getAccepetedLeasesTimes(propertyId);
  }
}

export const leaseService = new LeaseService();
