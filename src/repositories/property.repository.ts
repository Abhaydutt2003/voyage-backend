import { Prisma, PrismaClient } from "../generated/prisma/client";
import { repoErrorHandler } from "../lib/repoErrorHandler";
const prisma = new PrismaClient();

class PropertyRepository {
  async fetchPropertiesWithSql(rawSqlQuery: Prisma.Sql) {
    return await prisma.$queryRaw(rawSqlQuery);
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

  async fetchPropertyCoordinates(rawSqlQuery: Prisma.Sql) {
    return await prisma.$queryRaw<{ coordinates: string }[]>(rawSqlQuery);
  }

  async createProperty(
    propertyData: any,
    photoUrls: (string | undefined)[],
    locationId: number
  ) {
    return await prisma.property.create({
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
    });
  }
}

export const propertyRepository = new PropertyRepository();
