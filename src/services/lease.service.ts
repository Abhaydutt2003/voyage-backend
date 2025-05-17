import { NotFoundError } from "../middlewares/error.middleware";
import { leaseRepository } from "../repositories/lease.repository";
import { paymentRepository } from "../repositories/payment.repository";

class LeaseService {
  async getLeases() {
    const leases = await leaseRepository.findManyLeases();
    if (!leases || leases.length === 0) {
      throw new NotFoundError("No leases found");
    }
    return leases;
  }

  async getLeasePayments(leaseId: string) {
    return await paymentRepository.findManyPaymentsWithLeaseId(leaseId);
  }
}

export const leaseService = new LeaseService();
