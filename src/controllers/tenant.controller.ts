import { Request, Response } from "express";
import { tenantService } from "../services/tenant.service";
import { ApplicationError } from "../middlewares/error.middleware";

export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const tenant = await tenantService.createTenant(
      req.body.cognitoId,
      req.body.name,
      req.body.email,
      req.body.phoneNumber
    );
    res.status(201).json(tenant);
  } catch (error: any) {
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
      res.json(tenant);
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

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;
    const updatedTenant = await tenantService.updateTenant(
      cognitoId,
      name,
      email,
      phoneNumber
    );
    res.json(updatedTenant);
  } catch (error: any) {
    throw new ApplicationError("Server Error", 500, [
      `Error updating tenant: ${error.message}`,
    ]);
  }
};

export const getCurrentResidences = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { cognitoId } = req.params;
  const residencesWithFormattedLocation =
    await tenantService.getCurrentResidences(cognitoId);
  res.json(residencesWithFormattedLocation);
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const updatedTenant = await tenantService.addFavoriteProperty(
    req.params.cognitoId,
    Number(req.params.propertyId)
  );
  res.json(updatedTenant);
};

export const removeFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const updatedTenant = await tenantService.removeFavoriteProperty(
    req.params.cognitoId,
    Number(req.params.propertyId)
  );
  res.json(updatedTenant);
};
