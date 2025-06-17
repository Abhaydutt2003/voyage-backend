import { prisma } from "../lib/prisma";
import { repoErrorHandler } from "../lib/repoErrorHandler";
import { PrismaClient } from "../generated/prisma/client";
import * as runtime from "../generated/prisma/runtime/library";

type TransactionPrismaClient = Omit<PrismaClient, runtime.ITXClientDenyList>;

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

  async findFirstLeaseWithTenantAndProperty(
    tenantCognitoId: string,
    propertyId: number
  ) {
    return repoErrorHandler(() =>
      prisma.lease.findFirst({
        where: {
          tenant: {
            cognitoId: tenantCognitoId,
          },
          propertyId: propertyId,
        },
        orderBy: { startDate: "desc" },
      })
    );
  }

  async createLeaseWithLocalPrisma(
    localPrisma: TransactionPrismaClient,
    startDate: string,
    endDate: string,
    pricePerMonth: number,
    securityDeposit: number,
    propertyId: number,
    tenantCognitoId: string,
    paymentProofUrls: string[]
  ) {
    return repoErrorHandler(() =>
      localPrisma.lease.create({
        data: {
          paymentProof: paymentProofUrls,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          rent: pricePerMonth,
          deposit: securityDeposit,
          property: {
            connect: { id: propertyId },
          },
          tenant: {
            connect: { cognitoId: tenantCognitoId },
          },
        },
      })
    );
  }

  /**
   * A overlapping lease is already approved for that period of time for some other tenant,
   * or the tenant congnito ids match for that period of time and the lease is not in the denied state
   */
  async getOverlappingleases(
    propertyId: number,
    tenantCognitoId: string,
    startDate: string,
    endDate: string
  ) {
    const newStartDate = new Date(startDate);
    const newEndDate = new Date(endDate);
    return repoErrorHandler(() =>
      prisma.lease.findMany({
        where: {
          propertyId,
          AND: [
            {
              startDate: {
                lte: newEndDate,
              },
              endDate: {
                gte: newStartDate,
              },
            },
            {
              OR: [
                {
                  application: {
                    status: "Approved",
                  },
                },
                {
                  application: {
                    status: {
                      not: "Denied",
                    },
                  },
                  tenantCognitoId,
                },
              ],
            },
          ],
        },
        select: {
          startDate: true,
          endDate: true,
        },
      })
    );
  }

  async getAccepetedLeasesTimes(propertyId: number) {
    return repoErrorHandler(() =>
      prisma.lease.findMany({
        where: {
          propertyId,
          application: {
            status: "Approved",
          },
        },
        select: {
          startDate: true,
          endDate: true,
        },
      })
    );
  }
}

export const leaseRepository = new LeaseRepository();
