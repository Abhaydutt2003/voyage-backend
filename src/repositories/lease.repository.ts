import { prisma } from "../lib/prisma";
import { repoErrorHandler } from "../lib/repoErrorHandler";
import { PrismaClient } from "../generated/prisma/client";
import * as runtime from "../generated/prisma/runtime/library";
import CreateApplicationDto from "../dtos/application/createApplication.dto";

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
    tenantCognitoId: string
  ) {
    return repoErrorHandler(() =>
      localPrisma.lease.create({
        data: {
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

  async getExistingLeaves(
    propertyId: number,
    startDate: string,
    endDate: string
  ) {
    return repoErrorHandler(() =>
      prisma.lease.findMany({
        where: {
          propertyId,
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gte: new Date(endDate) } },
              ],
            },
            {
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(endDate) } },
              ],
            },
            {
              AND: [
                { startDate: { gte: new Date(startDate) } },
                { endDate: { lte: new Date(endDate) } },
              ],
            },
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(startDate) } },
              ],
            },
          ],
        },
      })
    );
  }
}

export const leaseRepository = new LeaseRepository();
