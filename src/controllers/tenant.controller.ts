import { Request, Response } from "express";
import { tenantService } from "../services/tenant.service";
import { ApplicationError } from "../middlewares/error.middleware";

export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;
    const tenant = await tenantService.createTenant(
      cognitoId,
      name,
      email,
      phoneNumber
    );
    res.status(201).json({
      tenant,
    });
  } catch (error: any) {
    console.log(error);
    throw new ApplicationError("Server Error", 500, [
      `Error creating tenant: ${error.message}`,
    ]);
  }
};

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const tenant = await tenantService.getTenant(cognitoId);
    if (tenant) {
      res.json({
        tenant,
      });
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
