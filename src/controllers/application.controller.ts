import { Request, Response } from "express";
import { applicationService } from "../services/application.service";
import CreateApplicationDto from "../dtos/application/createApplication.dto";
import { asyncHandler } from "../lib/asyncHandler";

export const listApplications = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId, userType } = req.query;
    const applications = await applicationService.listApplications(
      userId as string | undefined,
      userType as string | undefined
    );
    res.json(applications);
  }
);

export const createApplication = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const applicationDto = new CreateApplicationDto(req.body);
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
