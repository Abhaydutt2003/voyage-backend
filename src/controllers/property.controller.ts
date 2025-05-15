import { Request, Response } from "express";
import { propertyService } from "../services/property.service";
import { ApplicationError } from "../middlewares/error.middleware";
import { ParsedQs } from "qs";

export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
    } = req.query;

    const properties = await propertyService.getProperties(
      favoriteIds && (favoriteIds as string),
      priceMin && (priceMin as string),
      priceMax && (priceMax as string),
      beds && (beds as string),
      baths && (baths as string),
      propertyType && (propertyType as string),
      squareFeetMin && (squareFeetMin as string),
      squareFeetMax && (squareFeetMax as string),
      amenities && (amenities as string),
      availableFrom && (availableFrom as string),
      latitude && (latitude as string),
      longitude && (longitude as string)
    );
    res.json(properties);
  } catch (error: any) {
    throw new ApplicationError("Server Error", 500, [
      `Error retrieving properties: ${error.message}`,
    ]);
  }
};

export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await propertyService.getProperty(id);
    res.json(property);
  } catch (error: any) {
    throw new ApplicationError("Server Error", 500, [
      `Error retrieving property: ${error.message}`,
    ]);
  }
};

export const createProperty = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...propertyData
    } = req.body;
    const newProperty = propertyService.createProperty(
      files,
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      propertyData
    );
    res.json(newProperty);
  } catch (error: any) {
    throw new ApplicationError("Server Error", 500, [
      `Error retrieving property: ${error.message}`,
    ]);
  }
};
