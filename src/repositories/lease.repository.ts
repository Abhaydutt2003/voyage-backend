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
    pricePerMonth: number,
    securityDeposit: number,
    propertyId: number,
    tenantCognitoId: string
  ) {
    return repoErrorHandler(() =>
      localPrisma.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
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

  async createLease(
    pricePerMonth: number,
    securityDeposit: number,
    propertyId: number,
    tenantCognitoId: string
  ) {
    return repoErrorHandler(() =>
      prisma.lease.create({
        data: {
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          rent: pricePerMonth,
          deposit: securityDeposit,
          propertyId,
          tenantCognitoId,
        },
      })
    );
  }
}

export const leaseRepository = new LeaseRepository();
