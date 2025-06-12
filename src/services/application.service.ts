import CreateApplicationDto from "../dtos/application/createApplication.dto";
import { calculateNextPaymentDate } from "../lib/util";
import {
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
  ValidationError,
  ConflictError,
} from "../middlewares/error.middleware";
import { applicationRepository } from "../repositories/application.repository";
import { leaseRepository } from "../repositories/lease.repository";
import { propertyRepository } from "../repositories/property.repository";
import { prisma } from "../lib/prisma";
import { ApplicationStatus } from "../generated/prisma/client";
import PDFDocument from "pdfkit";

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
    const { propertyId, startDate, tenantCognitoId, endDate } = applicationDto;
    const property =
      await propertyRepository.fetchPricePerMonthAndSecurityDeposit(propertyId);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const overlappingLeases = await leaseRepository.getOverlappingleases(
      Number(propertyId),
      tenantCognitoId,
      startDate,
      endDate
    );

    if (overlappingLeases && overlappingLeases.length > 0) {
      throw new ConflictError(
        "These dates overlap with an existing lease or a pending application you've already submitted."
      );
    }

    const newApplication = await prisma.$transaction(async (localPrisma) => {
      const lease = await leaseRepository.createLeaseWithLocalPrisma(
        localPrisma,
        startDate,
        endDate,
        property.pricePerMonth,
        property.securityDeposit,
        Number(propertyId),
        tenantCognitoId
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
      await propertyRepository.updatePropertyTenants(
        application.propertyId,
        application.tenantCognitoId
      ); //update the application with the new leaseId
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

  async downloadAgreement(
    applicationId: number,
    requestingUserCognitoId: string,
    requestingUserType: "tenant" | "manager"
  ): Promise<Buffer> {
    const application = await applicationRepository.findUniqueWithApplicationId(
      applicationId,
      true,
      true
    );
    if (!application) {
      throw new NotFoundError("Application not found for the provided id");
    }

    if (application.status !== "Approved") {
      throw new ValidationError([
        "Agreement can only be downloaded for approved applications",
      ]);
    }

    //Authorization Check
    if (
      requestingUserType == "tenant" &&
      application.tenant.cognitoId !== requestingUserCognitoId
    ) {
      throw new UnauthorizedError(
        "You are not authorized to download this agreement."
      );
    }

    if (requestingUserType === "manager") {
      if (
        !application.property ||
        application.property.managerCognitoId !== requestingUserCognitoId
      ) {
        throw new UnauthorizedError("You do not manage this property.");
      }
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    // Collect chunks as they come in
    doc.on("data", (chunk) => chunks.push(chunk));

    // Create a promise that resolves when the PDF is complete
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);
    });

    // Add all the content to the PDF
    doc.fontSize(24).text("Rental Agreement", { align: "center" });
    doc.moveDown();

    doc.fontSize(16).text("Application Details:");
    doc.fontSize(12).text(`Application ID: ${application.id}`);
    doc.text(`Application Date: ${application.applicationDate.toDateString()}`);
    doc.text(`Status: ${application.status}`);
    doc.moveDown();

    doc.fontSize(16).text("Tenant Details:");
    doc.fontSize(12).text(`Name: ${application.tenant.name}`);
    doc.text(`Email: ${application.tenant.email}`);
    doc.text(`Phone: ${application.tenant.phoneNumber}`);
    doc.moveDown();

    doc.fontSize(16).text("Property Details:");
    doc.fontSize(12).text(`Property Name: ${application.property.name}`);
    doc.text(`Description: ${application.property.description}`);
    doc.text(
      `Address: ${application.property.location.address}, ${application.property.location.city}, ${application.property.location.state}`
    );
    doc.text(
      `Price per Month: $${application.property.pricePerMonth.toFixed(2)}`
    );
    doc.moveDown();

    doc.fontSize(16).text("Lease Details:");
    doc.fontSize(12).text(`Lease ID: ${application.lease!.id}`);
    doc.text(`Start Date: ${application.lease!.startDate.toDateString()}`);
    doc.text(`End Date: ${application.lease!.endDate.toDateString()}`);
    doc.text(`Monthly Rent: $${application.lease!.rent.toFixed(2)}`);
    doc.text(`Security Deposit: $${application.lease!.deposit.toFixed(2)}`);
    doc.moveDown();

    doc
      .fontSize(10)
      .text(
        "This agreement is generated automatically based on the approved application and lease details."
      );
    doc.text(
      "For any discrepancies or questions, please contact the property manager."
    );

    // End the document
    doc.end();

    // Wait for the PDF to be fully generated
    return pdfPromise;
  }
}

export const applicationService = new ApplicationService();
