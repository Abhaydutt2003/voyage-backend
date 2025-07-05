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
    pricePerNight: number;
    amenities: Amenity[];
    highlights: Highlight[];
    isPetsAllowed: boolean;
    isParkingIncluded: boolean;
    beds: number;
    baths: number;
    squareFeet: number;
    propertyType: PropertyType;
    managerCognitoId: string;
    photoUrlsBaseKeys: string[];
  };
  // Location fields
  locationData: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    longitude: string;
    latitude: string;
  };

  constructor(body: any) {
    this.propertyData = {
      name: body.name,
      description: body.description,
      pricePerNight: parseFloat(body.pricePerNight),
      amenities:
        typeof body.amenities === "string" ? JSON.parse(body.amenities) : [],
      highlights:
        typeof body.highlights === "string" ? JSON.parse(body.highlights) : [],
      isPetsAllowed: body.isPetsAllowed === true,
      isParkingIncluded: body.isParkingIncluded === true,
      beds: parseInt(body.beds),
      baths: parseFloat(body.baths),
      squareFeet: parseInt(body.squareFeet),
      propertyType: body.propertyType,
      managerCognitoId: body.managerCognitoId,
      photoUrlsBaseKeys: body.photoUrlsBaseKeys,
    };
    this.locationData = {
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      postalCode: body.postalCode,
      longitude: body.longitude,
      latitude: body.latitude,
    };
  }
}

export default CreatePropertyDto;
