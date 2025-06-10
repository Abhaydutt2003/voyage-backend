import { Prisma } from "../generated/prisma/client";
import { repoErrorHandler } from "../lib/repoErrorHandler";
import { prisma } from "../lib/prisma";
import CreatePropertyDto from "../dtos/property/createPropertyDto";

class PropertyRepository {
  async fetchPropertiesWithSql(rawSqlQuery: Prisma.Sql) {
    return repoErrorHandler(() => prisma.$queryRaw(rawSqlQuery));
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

  async fetchPricePerMonthAndSecurityDeposit(propertyId: string) {
    return repoErrorHandler(() =>
      prisma.property.findUnique({
        where: { id: Number(propertyId) },
        select: { pricePerMonth: true, securityDeposit: true },
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
    photoUrls: string[],
    locationId: number
  ) {
    return repoErrorHandler(() =>
      prisma.property.create({
        data: {
          ...propertyData.propertyData,
          photoUrls: photoUrls,
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
