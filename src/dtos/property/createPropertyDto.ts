import {
  Amenity,
  PropertyType,
  Highlight,
} from "../../generated/prisma/client";

class CreatePropertyDto {
  // Property fields
  propertyData: {
    name: string;
    description: string;
    pricePerMonth: number;
    securityDeposit: number;
    applicationFee: number;
    amenities: Amenity[];
    highlights: Highlight[];
    isPetsAllowed: boolean;
    isParkingIncluded: boolean;
    beds: number;
    baths: number;
    squareFeet: number;
    propertyType: PropertyType;
    managerCognitoId: string;
  };
  files: Express.Multer.File[];
  // Location fields
  locationData: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  constructor(files: Express.Multer.File[], body: any) {
    this.propertyData = {
      name: body.name,
      description: body.description,
      pricePerMonth: parseFloat(body.pricePerMonth),
      securityDeposit: parseFloat(body.securityDeposit),
      applicationFee: parseFloat(body.applicationFee),
      amenities:
        typeof body.amenities === "string" ? body.amenities.split(",") : [],
      highlights:
        typeof body.highlights === "string" ? body.highlights.split(",") : [],
      isPetsAllowed: body.isPetsAllowed === "true",
      isParkingIncluded: body.isParkingIncluded === "true",
      beds: parseInt(body.beds),
      baths: parseFloat(body.baths),
      squareFeet: parseInt(body.squareFeet),
      propertyType: body.propertyType,
      managerCognitoId: body.managerCognitoId,
    };
    this.locationData = {
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      postalCode: body.postalCode,
    };
    this.files = files;
  }
}

export default CreatePropertyDto;
