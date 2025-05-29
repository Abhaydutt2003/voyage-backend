import { wktToGeoJSON } from "@terraformer/wkt";
import { Prisma } from "../generated/prisma/client";
import { propertyRepository } from "../repositories/property.repository";
import { ApplicationError } from "../middlewares/error.middleware";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import { locationRepository } from "../repositories/location.repository";
import { Location } from "../generated/prisma/client";
import GetPropertiesDto from "../dtos/property/getProperties.dto";
import CreatePropertyDto from "../dtos/property/createPropertyDto";

class PropertyService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

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
        Prisma.sql`p."pricePerMonth" >= ${Number(propertyData.priceMin)}`
      );
    }

    if (propertyData?.priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(propertyData.priceMax)}`
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
      const amenitiesArray = propertyData.amenities.split(",");
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
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
      const radiusInKilometers = 1000;
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
    const property = await propertyRepository.fetchProperty(id);
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
      throw new ApplicationError("Not Found ", 404, [
        `Property not found with id : ${id}`,
      ]);
    }
  }

  async #uploadFilesToS3(files: Express.Multer.File[]) {
    return await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const uploadResult = await new Upload({
          client: this.s3Client,
          params: uploadParams,
        }).done();
        return uploadResult.Location;
      })
    );
  }

  async #createLocation(
    address: any,
    city: any,
    state: any,
    country: any,
    postalCode: any
  ): Promise<Location> {
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      }
    ).toString()}`;
    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "VoyageApp (justsomedummyemail@gmail.com",
      },
    });
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
    // const photoUrls = await this.#uploadFilesToS3(propertyData.files);//TODO remove this comment line after making the S3 work
    //create the location obj
    const location = await this.#createLocation(
      propertyData.address,
      propertyData.city,
      propertyData.state,
      propertyData.country,
      propertyData.postalCode
    );
    const newProperty = await propertyRepository.createProperty(
      propertyData,
      propertyData.managerCognitoId,
      [],
      location.id
    );
    return newProperty;
  }
}

export const propertyService = new PropertyService();
