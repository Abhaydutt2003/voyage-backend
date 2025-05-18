import { Request, Response } from "express";
import { applicationService } from "../services/application.service";
import CreateApplicationDto from "../dtos/application/createApplication.dto";

export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, userType } = req.query;
  const applications = applicationService.listApplications(
    userId as string,
    userType as string
  );
  res.json(applications);
};

export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  const applicationDto = new CreateApplicationDto(req.body);
  const newApplication = await applicationService.createApplication(
    applicationDto
  );
  res.json(newApplication);
};
