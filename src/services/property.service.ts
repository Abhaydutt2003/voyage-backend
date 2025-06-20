import { wktToGeoJSON } from "@terraformer/wkt";
import { Prisma } from "../generated/prisma/client";
import { propertyRepository } from "../repositories/property.repository";
import {
  NotFoundError,
  UnprocessableEntityError,
} from "../middlewares/error.middleware";
import axios from "axios";
import { locationRepository } from "../repositories/location.repository";
import { Location } from "../generated/prisma/client";
import GetPropertiesDto from "../dtos/property/getProperties.dto";
import CreatePropertyDto from "../dtos/property/createPropertyDto";
import { s3Service } from "./s3UploadService";

class PropertyService {
  #getWhereConditionsForProperties(propertyData: GetPropertiesDto) {
    let whereConditions: Prisma.Sql[] = [];

    if (propertyData?.favoriteIds) {
      const favoriteIdsArray = propertyData.favoriteIds.split(",").map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
      );
    }

    if (propertyData?.priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerNight" >= ${Number(propertyData.priceMin)}`
      );
    }

    if (propertyData?.priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerNight" <= ${Number(propertyData.priceMax)}`
      );
    }

    if (propertyData?.beds && propertyData?.beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(propertyData.beds)}`);
    }

    if (propertyData?.baths && propertyData?.baths !== "any") {
      whereConditions.push(
        Prisma.sql`p.baths >= ${Number(propertyData.baths)}`
      );
    }
    if (propertyData?.squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(propertyData.squareFeetMin)}`
      );
    }

    if (propertyData?.squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" <= ${Number(propertyData.squareFeetMax)}`
      );
    }

    if (propertyData?.propertyType && propertyData.propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyData.propertyType}::"PropertyType"`
      );
    }

    if (propertyData?.amenities && propertyData?.amenities !== "any") {
      const amenitiesArray = (propertyData.amenities as string).split(",");
      whereConditions.push(
        Prisma.sql`p.amenities @> ${amenitiesArray}::"Amenity"[]`
      );
    }

    if (propertyData?.availableFrom && propertyData?.availableFrom !== "any") {
      const date = new Date(propertyData.availableFrom);
      if (!isNaN(date.getTime())) {
        whereConditions.push(
          Prisma.sql`EXISTS (
                    SELECT 1 FROM "Lease" l
                    WHERE l."propertyId" = p.id
                    AND l."startDate" <= ${date.toISOString()}
                )`
        );
      }
    }

    if (propertyData?.latitude && propertyData?.longitude) {
      const lat = parseFloat(propertyData.latitude);
      const lng = parseFloat(propertyData.longitude);
      const radiusInKilometers = 200;
      const degrees = radiusInKilometers / 111; //convert to degrees
      whereConditions.push(
        Prisma.sql`ST_DWithin(
              l.coordinates::geometry,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
              ${degrees}
            )`
      );
    }
    return whereConditions;
  }

  async getProperties(propertyData: GetPropertiesDto) {
    const whereConditions = this.#getWhereConditionsForProperties(propertyData);
    const completeQuery = Prisma.sql`
      SELECT 
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
          : Prisma.empty
      }
    `;

    return await propertyRepository.fetchPropertiesWithSql(completeQuery);
  }

  async getProperty(id: string) {
    const property = await propertyRepository.findPropertyById(Number(id));
    if (property) {
      // ST_asText is a spatial function found in postgis , converts geography object to WKT
      const rawQuery = Prisma.sql`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
      const coordinates = await propertyRepository.fetchPropertyCoordinates(
        rawQuery
      );
      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];
      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
      return propertyWithCoordinates;
    } else {
      throw new NotFoundError(`Property not found with id : ${id}`);
    }
  }

  async #getGeoCodingResponse(
    address: any,
    city: any,
    country: any,
    postalCode: any
  ) {
    const requestHeaders = {
      "User-Agent": "VoyageApp (justsomedummyemail@gmail.com)",
    };

    const searchStrategies = [
      // Most specific: with street address
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      },
      // Fallback: without street address(happens when nominatim cannot recognize the street address)
      {
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      },
    ];

    // Helper function to make geocoding request
    const makeGeocodingRequest = async (params: Record<string, any>) => {
      const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
        params
      ).toString()}`;
      return await axios.get(url, { headers: requestHeaders });
    };

    // Try each strategy
    for (const strategy of searchStrategies) {
      try {
        const response = await makeGeocodingRequest(strategy);

        if (response.data && response.data.length > 0) {
          return response;
        }
      } catch (error) {}
    }

    // If all strategies fail, throw error
    throw new UnprocessableEntityError(
      "Cannot get the coordinates for the provided address"
    );
  }

  async #createLocation(
    address: any,
    city: any,
    state: any,
    country: any,
    postalCode: any
  ): Promise<Location> {
    const geocodingResponse = await this.#getGeoCodingResponse(
      address,
      city,
      country,
      postalCode
    );
    //get the longitude, latitude from the response
    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
            parseFloat(geocodingResponse.data[0]?.lon),
            parseFloat(geocodingResponse.data[0]?.lat),
          ]
        : [0, 0];
    const locationRawQuery = Prisma.sql`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;      
      `;
    const [location] = await locationRepository.createLocation(
      locationRawQuery
    );
    return location;
  }

  async createProperty(propertyData: CreatePropertyDto) {
    //upload to s3
    // const photoUrls = await s3Service.uploadFilesToS3(propertyData.files, "properties"); //TODO remove this comment line after making the S3 work
    // create the location obj
    const location = await this.#createLocation(
      propertyData.locationData.address,
      propertyData.locationData.city,
      propertyData.locationData.state,
      propertyData.locationData.country,
      propertyData.locationData.postalCode
    );
    const newProperty = await propertyRepository.createProperty(
      propertyData,
      [],
      location.id
    );
    return newProperty;
  }

  async getPropertyLeases(propertyId: number) {
    const propertyWithLeases = await propertyRepository.getPropertyLease(
      propertyId
    );
    return propertyWithLeases?.leases;
  }
}

export const propertyService = new PropertyService();
