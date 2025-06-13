import { repoErrorHandler } from "../lib/repoErrorHandler";
import { prisma } from "../lib/prisma";
import { ApplicationStatus, PrismaClient } from "../generated/prisma/client";
import * as runtime from "../generated/prisma/runtime/library";
import CreateApplicationDto from "../dtos/application/createApplication.dto";

type TransactionPrismaClient = Omit<PrismaClient, runtime.ITXClientDenyList>;

class ApplicationRepository {
  async findManyWithWhereClause(whereClause: any) {
    return repoErrorHandler(() =>
      prisma.application.findMany({
        where: whereClause,
        include: {
          property: {
            include: {
              location: true,
              manager: true,
            },
          },
        },
      })
    );
  }

  async createApplicationWithLocalPrisma(
    localPrisma: TransactionPrismaClient,
    applicationDto: CreateApplicationDto,
    leaseId: number
  ) {
    return repoErrorHandler(() =>
      localPrisma.application.create({
        data: {
          applicationDate: new Date(applicationDto.applicationDate),
          status: applicationDto.status as ApplicationStatus,
          name: applicationDto.name,
          email: applicationDto.email,
          phoneNumber: applicationDto.phoneNumber,
          message: applicationDto.message,
          property: {
            connect: { id: Number(applicationDto.propertyId) },
          },
          tenant: {
            connect: { cognitoId: applicationDto.tenantCognitoId },
          },
          lease: {
            connect: { id: leaseId },
          },
        },
        include: {
          property: true,
          tenant: true,
          lease: true,
        },
      })
    );
  }

  async findUniqueWithApplicationId(
    applicationId: number,
    includeLease = false,
    includePropertyLocation = false
  ) {
    return repoErrorHandler(() =>
      prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          property: {
            include: {
              ...(includePropertyLocation && { location: true }),
            },
          },
          tenant: true,
          ...(includeLease && { lease: true }),
        },
      })
    );
  }

  async updateApplicationStatus(
    applicationId: number,
    applicationStatus: ApplicationStatus
  ) {
    return repoErrorHandler(() =>
      prisma.application.update({
        where: { id: applicationId },
        data: {
          status: applicationStatus,
        },
      })
    );
  }
}

export const applicationRepository = new ApplicationRepository();
