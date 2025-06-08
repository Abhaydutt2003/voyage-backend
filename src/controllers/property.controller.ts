import { Request, Response, NextFunction } from "express";
import { propertyService } from "../services/property.service";
import GetPropertiesDto from "../dtos/property/getProperties.dto";
import CreatePropertyDto from "../dtos/property/createPropertyDto";
import { asyncHandler } from "../lib/asyncHandler";

export const getProperties = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const propertyData = new GetPropertiesDto(req.query);
    const properties = await propertyService.getProperties(propertyData);
    res.json(properties);
  }
);

export const getProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const property = await propertyService.getProperty(id);
    res.json(property);
  }
);

export const createProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const propertyData = new CreatePropertyDto(
      req.files as Express.Multer.File[],
      req.body
    );
    const newProperty = await propertyService.createProperty(propertyData);
    res.json(newProperty);
  }
);

export const getPropertyLeases = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const propertyWithLeases = await propertyService.getPropertyLeases(
      Number(id)
    );
    res.json(propertyWithLeases);
  }
);
