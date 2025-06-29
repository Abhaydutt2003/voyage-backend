import { Location, Prisma, Property } from "../generated/prisma/client";
import { repoErrorHandler } from "../lib/repoErrorHandler";
import { prisma } from "../lib/prisma";
import CreatePropertyDto from "../dtos/property/createPropertyDto";
import { PrismaClient } from "../generated/prisma/client";
import * as runtime from "../generated/prisma/runtime/library";
type TransactionPrismaClient = Omit<PrismaClient, runtime.ITXClientDenyList>;

class PropertyRepository {
  async addReview(
    localPrisma: TransactionPrismaClient,
    propertyId: number,
    newAverageRating: number,
    newNumberOfReviews: number
  ) {
    return repoErrorHandler(() =>
      localPrisma.property.update({
        where: { id: propertyId },
        data: {
          averageRating: newAverageRating,
          numberOfReviews: newNumberOfReviews,
        },
      })
    );
  }

  async getPropertyReviewData(
    localPrisma: TransactionPrismaClient,
    id: number
  ) {
    return repoErrorHandler(() =>
      localPrisma.property.findUnique({
        where: { id },
        select: {
          averageRating: true,
          numberOfReviews: true,
        },
      })
    );
  }

  async fetchPropertiesWithSql(rawSqlQuery: Prisma.Sql) {
    return repoErrorHandler(() => prisma.$queryRaw<Property[]>(rawSqlQuery));
  }

  async findPropertyById(id: number) {
    return repoErrorHandler(() =>
      prisma.property.findUnique({
        where: { id },
        include: {
          location: true,
          manager: {
            select: {
              phoneNumber: true,
            },
          },
        },
      })
    );
  }

  async findUniqueProperty(propertyId: string) {
    return repoErrorHandler(() =>
      prisma.property.findUnique({
        where: { id: Number(propertyId) },
        select: { id: true },
      })
    );
  }

  async fetchPropertyCoordinates(rawSqlQuery: Prisma.Sql) {
    return repoErrorHandler(() =>
      prisma.$queryRaw<{ coordinates: string }[]>(rawSqlQuery)
    );
  }

  async createProperty(
    propertyData: CreatePropertyDto,
    photoUrlsBaseKeys: string[],
    locationId: number
  ) {
    return repoErrorHandler(() =>
      prisma.property.create({
        data: {
          ...propertyData.propertyData,
          photoUrlsBaseKeys,
          locationId,
        },
        include: {
          location: true,
          manager: true,
        },
      })
    );
  }

  async updatePropertyTenants(propertyId: number, tenantCognitoId: string) {
    return repoErrorHandler(() =>
      prisma.property.update({
        where: { id: propertyId },
        data: {
          tenants: {
            connect: { cognitoId: tenantCognitoId },
          },
        },
      })
    );
  }

  async findManyWithTenantId(tenantCognitoId: string) {
    return repoErrorHandler(() =>
      prisma.property.findMany({
        where: { tenants: { some: { cognitoId: tenantCognitoId } } },
        include: {
          location: true,
        },
      })
    );
  }

  async findManyWithManagerId(managerCognitoId: string) {
    return repoErrorHandler(() =>
      prisma.property.findMany({
        where: { managerCognitoId },
        include: {
          location: true,
        },
      })
    );
  }

  async getPropertyLease(propertyId: number) {
    return repoErrorHandler(() =>
      prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          leases: {
            where: {
              application: {
                status: "Approved",
              },
            },
            include: {
              tenant: true,
            },
          },
        },
      })
    );
  }
}

export const propertyRepository = new PropertyRepository();
