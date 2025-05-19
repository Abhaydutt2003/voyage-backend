import { ApplicationError } from "../middlewares/error.middleware";
import { managerRepository } from "../repositories/manager.repository";
import { propertyRepository } from "../repositories/property.repository";
import { Prisma } from "../generated/prisma/client";
import { locationRepository } from "../repositories/location.repository";
import { wktToGeoJSON } from "@terraformer/wkt";

class ManagerService {
  async createManager(
    cognitoId: string,
    name: string,
    email: string,
    phoneNumber: string
  ) {
    return await managerRepository.createManager(
      cognitoId,
      name,
      email,
      phoneNumber
    );
  }

  async getManager(cognitoId: string) {
    const manager = await managerRepository.getManager(cognitoId);
    if (!manager) {
      throw new ApplicationError("Validation Error", 404, [
        "User not found with the given id",
      ]);
    }
    return manager;
  }

  async updateManager(
    cognitoId: string,
    name: string,
    email: string,
    phoneNumber: string
  ) {
    return managerRepository.updateManager(cognitoId, name, email, phoneNumber);
  }

  async getManagerProperties(managerCognitoId: string) {
    const properties = await propertyRepository.findManyWithManagerId(
      managerCognitoId
    );
    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (singleProperty) => {
        const locationRawQuery = Prisma.sql`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${singleProperty.location.id}`;
        const coordinates: { coordinates: string }[] =
          (await locationRepository.getCoordinates(locationRawQuery)) as {
            coordinates: string;
          }[]; //do not want to create a new type.
        const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];
        return {
          ...singleProperty,
          location: {
            ...singleProperty.location,
            coordinates: {
              longitude,
              latitude,
            },
          },
        };
      })
    );
    return propertiesWithFormattedLocation;
  }
}
export const managerService = new ManagerService();
