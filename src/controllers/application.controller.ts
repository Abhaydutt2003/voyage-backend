import { Request, Response } from "express";
import { applicationService } from "../services/application.service";
import CreateApplicationDto from "../dtos/application/createApplication.dto";
import { asyncHandler } from "../lib/asyncHandler";

export const listApplications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, userType, limit, afterCursor, status, propertyId } =
      req.query;
    const applications = await applicationService.listApplications(
      status as string,
      userId as string | undefined,
      userType as string | undefined,
      limit ? parseInt(limit as string, 10) : 10,
      afterCursor as string | undefined,
      propertyId as string | undefined
    );
    res.json(applications);
  }
);

export const createApplication = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const applicationDto = new CreateApplicationDto(
      req.files as Express.Multer.File[],
      req.body
    );
    const newApplication = await applicationService.createApplication(
      applicationDto
    );
    res.json(newApplication);
  }
);

export const updateApplicationStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedApplication = await applicationService.updateApplicationStatus(
      Number(id),
      status
    );
    res.json(updatedApplication);
  }
);

export const downloadAgreement = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { user } = req;
    const pdfBuffer = await applicationService.downloadAgreement(
      Number(id),
      user?.id as string,
      user?.role as "tenant" | "manager"
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=agreement-${id}.pdf`
    );
    res.send(pdfBuffer);
  }
);

export const downloadPropertyAgreements = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { propertyId } = req.params;
    const { user } = req;
    const pdfBuffer = await applicationService.downloadPropertyAgreements(
      Number(propertyId),
      user!.id
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=property-${propertyId}-Agreements.pdf`
    );
    res.send(pdfBuffer);
  }
);
