import { prisma } from "../lib/prisma";
import { repoErrorHandler } from "../lib/repoErrorHandler";

class PaymentRepository {
  async findManyPaymentsWithLeaseId(leaseId: string) {
    return repoErrorHandler(() =>
      prisma.payment.findMany({
        where: { leaseId: Number(leaseId) },
      })
    );
  }
}

export const paymentRepository = new PaymentRepository();
