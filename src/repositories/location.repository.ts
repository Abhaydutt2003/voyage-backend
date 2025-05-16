import { Prisma, PrismaClient, Location } from "../generated/prisma/client";
const prisma = new PrismaClient();

class LocationRepository {
  async createLocation(rawSqlQuery: Prisma.Sql) {
    return await prisma.$queryRaw<Location[]>(rawSqlQuery);
  }
}

export const locationRepository = new LocationRepository();
