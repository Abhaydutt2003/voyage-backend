import CreateApplicationDto from "../dtos/application/createApplication.dto";
import { calculateNextPaymentDate } from "../lib/util";
import {
  NotFoundError,
  UnprocessableEntityError,
} from "../middlewares/error.middleware";
import { applicationRepository } from "../repositories/application.repository";
import { leaseRepository } from "../repositories/lease.repository";
import { propertyRepository } from "../repositories/property.repository";
import { prisma } from "../lib/prisma";
import { ApplicationStatus } from "../generated/prisma/client";

class ApplicationService {
  async listApplications(
    userId: string | undefined,
    userType: string | undefined
  ) {
    let whereClause = {};
    if (userType === "tenant") {
      whereClause = { tenantCognitoId: String(userId) };
    } else if (userType === "manager") {
      whereClause = {
        property: {
          managerCognitoId: String(userId),
        },
      };
    } else if (userType !== undefined) {
      throw new UnprocessableEntityError(`userType ${userType} does not exist`);
    }

    const applications = await applicationRepository.findManyWithWhereClause(
      whereClause
    );
    const formattedApplications = await Promise.all(
      applications.map(async (singleApplication) => {
        const lease = await leaseRepository.findFirstLeaseWithTenantAndProperty(
          singleApplication.tenantCognitoId,
          singleApplication.propertyId
        );
        return {
          ...singleApplication,
          lease: lease
            ? {
                ...lease,
                nextPaymentDate: calculateNextPaymentDate(lease.startDate),
              }
            : null,
        };
      })
    );
    return formattedApplications;
  }

  async createApplication(applicationDto: CreateApplicationDto) {
    const property =
      await propertyRepository.fetchPricePerMonthAndSecurityDeposit(
        applicationDto.propertyId
      );
    if (!property) {
      throw new NotFoundError("Property not found");
    }
    const newApplication = await prisma.$transaction(async (localPrisma) => {
      const lease = await leaseRepository.createLeaseWithLocalPrisma(
        localPrisma,
        property.pricePerMonth,
        property.securityDeposit,
        Number(applicationDto.propertyId),
        applicationDto.tenantCognitoId
      );
      const application =
        await applicationRepository.createApplicationWithLocalPrisma(
          localPrisma,
          applicationDto,
          lease.id
        );
      return application;
    });
    return newApplication;
  }

  async updateApplicationStatus(
    applicationId: number,
    applicationStatus: ApplicationStatus
  ) {
    const application = await applicationRepository.findUniqueWithApplicationId(
      applicationId
    );
    if (!application) {
      throw new NotFoundError("Application not found");
    }
    if (applicationStatus == "Approved") {
      const newLease = await leaseRepository.createLease(
        application.property.pricePerMonth,
        application.property.securityDeposit,
        application.propertyId,
        application.tenantCognitoId
      );
      await propertyRepository.updatePropertyTenants(
        application.propertyId,
        application.tenantCognitoId
      ); //update the application with the new leaseId
      await applicationRepository.updateLeaseId(
        applicationId,
        applicationStatus,
        newLease.id
      );
    } else {
      await applicationRepository.updateApplicationStatus(
        applicationId,
        applicationStatus
      );
    }
    return await applicationRepository.findUniqueWithApplicationId(
      applicationId,
      true
    );
  }
}

export const applicationService = new ApplicationService();
