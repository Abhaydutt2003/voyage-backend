import { PrismaClient } from "../generated/prisma/client";
const prisma = new PrismaClient();

class ManagerRepository {
  async createManager(
    cognitoId: string,
    name: string,
    email: string,
    phoneNumber: string
  ) {
    await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });
  }

  async getManager(cognitoId: string) {
    return await prisma.manager.findUnique({
      where: { cognitoId }, //manager does not have favorites
    });
  }

  async updateManager(
    cognitoId: string,
    name: string,
    email: string,
    phoneNumber: string
  ) {
    return await prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });
  }

}

export const managerRepository = new ManagerRepository(); //example of module caching
