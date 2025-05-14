import { Request, Response } from "express";
import { managerService } from "../services/manager.service";
import { ApplicationError } from "../middlewares/error.middleware";

export const createManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;
    const manager = await managerService.createManager(
      cognitoId,
      name,
      email,
      phoneNumber
    );
    res.status(201).json(manager);
  } catch (error: any) {
    console.log(error);
    throw new ApplicationError("Server Error", 500, [
      `Error creating manager: ${error.message}`,
    ]);
  }
};

export const getManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const manager = await managerService.getManager(cognitoId);
    if (manager) {
      res.json(manager);
    } else {
      throw new ApplicationError("Validation Error", 404, [
        "User not found with the given id",
      ]);
    }
  } catch (error: any) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    throw new ApplicationError("Server Error", 500, [
      `Error retrieving tenant: ${error.message}`,
    ]);
  }
};

export const updateManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;
    const updatedTenant = await managerService.updateManager(
      cognitoId,
      name,
      email,
      phoneNumber
    );
    res.json(updatedTenant);
  } catch (error: any) {
    throw new ApplicationError("Server Error", 500, [
      `Error updating Manager: ${error.message}`,
    ]);
  }
};
