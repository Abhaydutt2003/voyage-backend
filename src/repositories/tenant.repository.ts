import { PrismaClient } from "../generated/prisma/client";
const prisma = new PrismaClient();

class TenantRepository {
  async createTenant(
    cognitoId: string,
    name: string,
    email: string,
    phoneNumber: string
  ) {
    await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });
  }

  async getTenantWithFavorites(cognitoId: string) {
    return await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });
  }

  async updateTenant(
    cognitoId: string,
    name: string,
    email: string,
    phoneNumber: string
  ) {
    return await prisma.tenant.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });
  }
  
}

export const tenantRepository = new TenantRepository();
