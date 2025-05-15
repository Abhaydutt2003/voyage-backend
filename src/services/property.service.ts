import { wktToGeoJSON } from "@terraformer/wkt";
import { Prisma } from "../generated/prisma/client";
import { propertyRepository } from "../repositories/property.repository";
import { ApplicationError } from "../middlewares/error.middleware";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
import { locationRepository } from "../repositories/location.repository";
import { Location } from "../generated/prisma/client";

class PropertyService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
    });
  }
  //TODO make this better
  async getProperties(
    favoriteIds?: string,
    priceMin?: string,
    priceMax?: string,
    beds?: string,
    baths?: string,
    propertyType?: string,
    squareFeetMin?: string,
    squareFeetMax?: string,
    amenities?: string,
    availableFrom?: string,
    latitude?: string,
    longitude?: string
  ) {
    let whereConditions: Prisma.Sql[] = [];

    if (favoriteIds) {
      const favoriteIdsArray = favoriteIds.split(",").map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
      );
    }

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`
      );
    }

    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    }

    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
    }
    if (squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`
      );
    }

    if (squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`
      );
    }

    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
      );
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = amenities.split(",");
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
    }

    if (availableFrom && availableFrom !== "any") {
      const date = new Date(availableFrom);
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

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
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

  async createProperty(
    files: Express.Multer.File[],
    address: any,
    city: any,
    state: any,
    country: any,
    postalCode: any,
    managerCognitoId: any,
    propertyData: any
  ) {
    //upload to s3
    const photoUrls = await this.#uploadFilesToS3(files);
    //create the location obj
    const location = await this.#createLocation(
      address,
      city,
      state,
      country,
      postalCode
    );
    const newProperty = await propertyRepository.createProperty(
      propertyData,
      photoUrls,
      location.id
    );
    return newProperty;
  }
}

export const propertyService = new PropertyService();
