import { Prisma } from "../generated/prisma/client";
import { repoErrorHandler } from "../lib/repoErrorHandler";
import { prisma } from "../lib/prisma";
import CreatePropertyDto from "../dtos/property/createPropertyDto";

class PropertyRepository {
  async fetchPropertiesWithSql(rawSqlQuery: Prisma.Sql) {
    return repoErrorHandler(() => prisma.$queryRaw(rawSqlQuery));
  }

  async fetchProperty(id: string) {
    return repoErrorHandler(() =>
      prisma.property.findUnique({
        where: { id: Number(id) },
        include: {
          location: true,
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
}

export const propertyRepository = new PropertyRepository();
