import { Request, Response } from "express";
import { propertyService } from "../services/property.service";
import { ApplicationError } from "../middlewares/error.middleware";
import { ParsedQs } from "qs";
import GetPropertiesDto from "../dtos/property/getProperties.dto";
import CreatePropertyDto from "../dtos/property/createPropertyDto";

export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  const propertyData = new GetPropertiesDto(req.query);
  const properties = await propertyService.getProperties(propertyData);
  res.json(properties);
};

export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const property = await propertyService.getProperty(id);
  res.json(property);
};

export const createProperty = async (req: Request, res: Response) => {
  const propertyData = new CreatePropertyDto(
    req.files as Express.Multer.File[],
    req.body
  );
  const newProperty = propertyService.createProperty(propertyData);
  res.json(newProperty);
};
