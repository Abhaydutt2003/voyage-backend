import { Prisma, PrismaClient, Location } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { repoErrorHandler } from "../lib/repoErrorHandler";

class LocationRepository {
  async createLocation(rawSqlQuery: Prisma.Sql) {
    return repoErrorHandler(() => prisma.$queryRaw<Location[]>(rawSqlQuery));
  }

  async getCoordinates(rawSqlQuery: Prisma.Sql) {
    return repoErrorHandler(() => prisma.$queryRaw(rawSqlQuery));
  }
}

export const locationRepository = new LocationRepository();
