import { Request, Response } from "express";
import { managerService } from "../services/manager.service";
import { ApplicationError } from "../middlewares/error.middleware";

export const createManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  const manager = await managerService.createManager(
    req.body.cognitoId,
    req.body.name,
    req.body.email,
    req.body.phoneNumber
  );
  res.status(201).json(manager);
};

export const getManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  const manager = await managerService.getManager(req.params.cognitoId);
  res.json(manager);
};

export const updateManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  const updatedTenant = await managerService.updateManager(
    req.params.cognitoId,
    req.body.name,
    req.body.email,
    req.body.phoneNumber
  );
  res.json(updatedTenant);
};

export const getManagerProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  const managerProperties = await managerService.getManagerProperties(
    req.params.cognitoId
  );
  res.json(managerProperties);
};
