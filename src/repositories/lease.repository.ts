import { PrismaClient, Prisma } from "../generated/prisma/client";
import { repoErrorHandler } from "../lib/repoErrorHandler";
const prisma = new PrismaClient();

class LeaseRepository {
  async findManyLeases() {
    return repoErrorHandler(() =>
      prisma.lease.findMany({
        include: {
          tenant: true,
          property: true,
        },
      })
    );
  }
}

export const leaseRepository = new LeaseRepository();
