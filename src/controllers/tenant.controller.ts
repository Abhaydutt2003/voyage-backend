import { Request, Response } from "express";
import { tenantService } from "../services/tenant.service";
import { ApplicationError } from "../middlewares/error.middleware";
import { asyncHandler } from "../lib/asyncHandler";

export const createTenant = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const tenant = await tenantService.createTenant(
      req.body.cognitoId,
      req.body.name,
      req.body.email,
      req.body.phoneNumber
    );
    res.status(201).json(tenant);
  }
);

export const getTenant = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const tenant = await tenantService.getTenant(req.params.cognitoId);
    res.json(tenant);
  }
);

export const updateTenant = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const updatedTenant = await tenantService.updateTenant(
      req.params.cognitoId,
      req.body.name,
      req.body.email,
      req.body.phoneNumber
    );
    res.json(updatedTenant);
  }
);

export const getCurrentResidences = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { cognitoId } = req.params;
    const residencesWithFormattedLocation =
      await tenantService.getCurrentResidences(cognitoId);
    res.json(residencesWithFormattedLocation);
  }
);

export const addFavoriteProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const updatedTenant = await tenantService.addFavoriteProperty(
      req.params.cognitoId,
      Number(req.params.propertyId)
    );
    res.json(updatedTenant);
  }
);

export const removeFavoriteProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const updatedTenant = await tenantService.removeFavoriteProperty(
      req.params.cognitoId,
      Number(req.params.propertyId)
    );
    res.json(updatedTenant);
  }
);
