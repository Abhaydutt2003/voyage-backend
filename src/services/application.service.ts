import CreateApplicationDto from "../dtos/application/createApplication.dto";
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
import { ApplicationStatus, Prisma } from "../generated/prisma/client";
import PDFDocument from "pdfkit";
import { s3Service } from "./s3UploadService";

interface ApplicationCursor {
  applicationDate: string; //ISO string
  id: number;
}

class ApplicationService {
  async listApplications(
    status: string,
    userId: string | undefined,
    userType: string | undefined,
    limit: number,
    afterCursor?: string
  ) {
    let whereClause: Prisma.ApplicationWhereInput = {
      status: status as ApplicationStatus,
    };

    if (userType === "tenant") {
      whereClause = { ...whereClause, tenantCognitoId: String(userId) };
    } else if (userType === "manager") {
      whereClause = {
        ...whereClause,
        property: {
          managerCognitoId: String(userId),
        },
      };
    } else if (userType !== undefined) {
      throw new UnprocessableEntityError(`userType ${userType} does not exist`);
    }

    const orderBy: Prisma.ApplicationOrderByWithRelationInput[] = [
      { applicationDate: "desc" },
      { id: "desc" }, // Tie-breaker for same applicationDate
    ];

    let decodedCursor: ApplicationCursor | undefined = undefined;

    if (afterCursor) {
      const decodedString = Buffer.from(afterCursor, "base64").toString(
        "utf-8"
      );
      decodedCursor = JSON.parse(decodedString) as ApplicationCursor;
      if (
        !decodedCursor.applicationDate ||
        typeof decodedCursor.id !== "number"
      ) {
        throw new ValidationError(["Invalid cursor format"]);
      } else if (isNaN(new Date(decodedCursor.applicationDate).getTime())) {
        throw new ValidationError(["Invalid applicationDate in cursor"]);
      }
      whereClause = {
        ...whereClause,
        AND: [
          {
            OR: [
              {
                applicationDate: {
                  lte: new Date(decodedCursor.applicationDate),
                },
              }, // Applications strictly older
              {
                AND: [
                  { applicationDate: new Date(decodedCursor.applicationDate) }, // Same date
                  { id: { lt: decodedCursor.id } }, // Smaller ID (because sorting DESC)
                ],
              },
            ],
          },
        ],
      };
    }

    const applications = await applicationRepository.findManyWithWhereClause(
      whereClause,
      orderBy,
      limit + 1,
      decodedCursor
    );

    const hasMore = applications.length > limit;
    const itemsToReturn = hasMore ? applications.slice(0, limit) : applications;

    let nextCursor: string | null = null;
    if (itemsToReturn.length > 0) {
      const lastApplication = itemsToReturn[itemsToReturn.length - 1];
      const cursorData: ApplicationCursor = {
        applicationDate: lastApplication.applicationDate.toISOString(),
        id: lastApplication.id,
      };
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString("base64");
    }
    return {
      applications: itemsToReturn,
      hasMore,
      nextCursor,
    };
  }

  async createApplication(applicationDto: CreateApplicationDto) {
    const { propertyId, startDate, tenantCognitoId, endDate, paymentProof } =
      applicationDto;
    const property = await propertyRepository.findUniqueProperty(propertyId);
    if (!property) {
      throw new NotFoundError("Property not found");
    }

    const newApplication = await prisma.$transaction(
      async (localPrisma) => {
        const overlappingLeases = await leaseRepository.getOverlappingleases(
          localPrisma,
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

        // const paymentProofUrls = await s3Service.uploadFilesToS3(
        //   paymentProof,
        //   `paymentProof/${tenantCognitoId}/${property.id}`
        // );
        const lease = await leaseRepository.createLeaseWithLocalPrisma(
          localPrisma,
          startDate,
          endDate,
          Number(propertyId),
          tenantCognitoId
        );
        const application =
          await applicationRepository.createApplicationWithLocalPrisma(
            localPrisma,
            applicationDto,
            lease.id,
            []
          );
        return application;
      },
      {
        isolationLevel: "Serializable", //crucial to handle race conditons.
      }
    );
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
    }

    await applicationRepository.updateApplicationStatus(
      applicationId,
      applicationStatus
    );
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
      `Price per Night: $${application.property.pricePerNight.toFixed(2)}`
    );
    doc.moveDown();

    doc.fontSize(16).text("Lease Details:");
    doc.fontSize(12).text(`Lease ID: ${application.lease!.id}`);
    doc.text(`Start Date: ${application.lease!.startDate.toDateString()}`);
    doc.text(`End Date: ${application.lease!.endDate.toDateString()}`);

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
