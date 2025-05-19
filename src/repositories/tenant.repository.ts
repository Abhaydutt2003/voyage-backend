import { repoErrorHandler } from "../lib/repoErrorHandler";
import { prisma } from "../lib/prisma";

class TenantRepository {
  async createTenant(
    cognitoId: string,
    name: string,
    email: string,
    phoneNumber: string
  ) {
    return repoErrorHandler(() =>
      prisma.tenant.create({
        data: {
          cognitoId,
          name,
          email,
          phoneNumber,
        },
      })
    );
  }

  async getTenantWithFavorites(cognitoId: string) {
    return repoErrorHandler(() =>
      prisma.tenant.findUnique({
        where: { cognitoId },
        include: {
          favorites: true,
        },
      })
    );
  }

  async updateTenant(
    cognitoId: string,
    name?: string,
    email?: string,
    phoneNumber?: string,
    favoritePropertyId?: number
  ) {
    return repoErrorHandler(() =>
      prisma.tenant.update({
        where: { cognitoId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phoneNumber && { phoneNumber }),
          ...(favoritePropertyId && {
            favorites: {
              connect: { id: favoritePropertyId },
            },
          }),
        },
        ...(favoritePropertyId && {
          include: {
            favorites: true,
          },
        }),
      })
    );
  }

  async removeFavoriteProperty(cognitoId: string, favoritePropertyId: number) {
    return repoErrorHandler(() =>
      prisma.tenant.update({
        where: { cognitoId },
        data: {
          favorites: {
            disconnect: {
              id: favoritePropertyId,
            },
          },
        },
        include: {
          favorites: true,
        },
      })
    );
  }
}

export const tenantRepository = new TenantRepository();
