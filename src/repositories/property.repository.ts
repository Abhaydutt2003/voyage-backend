import { Prisma } from "../generated/prisma/client";
import { repoErrorHandler } from "../lib/repoErrorHandler";
import { prisma } from "../lib/prisma";

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
    propertyData: any,
    photoUrls: (string | undefined)[],
    locationId: number
  ) {
    return repoErrorHandler(() =>
      prisma.property.create({
        data: {
          ...propertyData,
          photoUrls,
          locationId,
          amenities:
            typeof propertyData.amenities === "string"
              ? propertyData.amenities.split(",")
              : [],
          highlights:
            typeof propertyData.highlights === "string"
              ? propertyData.highlights.split(",")
              : [],
          isPetsAllowed: propertyData.isPetsAllowed === "true",
          isParkingIncluded: propertyData.isParkingIncluded === "true",
          pricePerMonth: parseFloat(propertyData.pricePerMonth),
          securityDeposit: parseFloat(propertyData.securityDeposit),
          applicationFee: parseFloat(propertyData.applicationFee),
          beds: parseInt(propertyData.beds),
          baths: parseFloat(propertyData.baths),
          squareFeet: parseInt(propertyData.squareFeet),
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
