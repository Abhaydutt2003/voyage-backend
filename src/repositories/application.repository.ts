import { repoErrorHandler } from "../lib/repoErrorHandler";
import { prisma } from "../lib/prisma";
import {
  ApplicationStatus,
  Prisma,
  PrismaClient,
} from "../generated/prisma/client";
import * as runtime from "../generated/prisma/runtime/library";
import CreateApplicationDto from "../dtos/application/createApplication.dto";

type TransactionPrismaClient = Omit<PrismaClient, runtime.ITXClientDenyList>;

class ApplicationRepository {
  async findManyWithWhereClause(
    whereClause: any,
    orderBy: Prisma.ApplicationOrderByWithRelationInput[],
    take: number,
    cursor?: Prisma.ApplicationWhereUniqueInput
  ) {
    return repoErrorHandler(() =>
      prisma.application.findMany({
        where: whereClause,
        take,
        skip: cursor ? 1 : undefined,
        orderBy,
        include: {
          property: {
            include: {
              location: true,
              manager: true,
            },
          },
          lease: true,
        },
      })
    );
  }

  async createApplicationWithLocalPrisma(
    localPrisma: TransactionPrismaClient,
    applicationDto: CreateApplicationDto,
    leaseId: number,
    paymentProofUrls: string[]
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
          paymentProof: paymentProofUrls,
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
