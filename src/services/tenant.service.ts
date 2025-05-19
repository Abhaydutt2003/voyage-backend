import { propertyRepository } from "../repositories/property.repository";
import { tenantRepository } from "../repositories/tenant.repository";
import { Prisma } from "../generated/prisma/client";
import { locationRepository } from "../repositories/location.repository";
import { wktToGeoJSON } from "@terraformer/wkt";
import { ConflictError, NotFoundError } from "../middlewares/error.middleware";

class TenantService {
  async createTenant(
    cognitoId: string,
    name: string,
    email: string,
    phoneNumber: string
  ) {
    return await tenantRepository.createTenant(
      cognitoId,
      name,
      email,
      phoneNumber
    );
  }

  async getTenant(cognitoId: string) {
    return await tenantRepository.getTenantWithFavorites(cognitoId);
  }

  async updateTenant(
    cognitoId: string,
    name: string,
    email: string,
    phoneNumber: string
  ) {
    return tenantRepository.updateTenant(cognitoId, name, email, phoneNumber);
  }

  async getCurrentResidences(tenantCognitoId: string) {
    const properties = await propertyRepository.findManyWithTenantId(
      tenantCognitoId
    );
    const residencesWithFormattedLocation = await Promise.all(
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
    return residencesWithFormattedLocation;
  }

  async addFavoriteProperty(cognitoId: string, propertyId: number) {
    const tenant = await tenantRepository.getTenantWithFavorites(cognitoId);
    if (!tenant) {
      throw new NotFoundError("Tenant not found");
    }
    const existingFavorites = tenant.favorites || [];
    if (!existingFavorites.some((fav) => fav.id === propertyId)) {
      const updatedTenant = await tenantRepository.updateTenant(
        cognitoId,
        undefined,
        undefined,
        undefined,
        propertyId
      );
      return updatedTenant;
    } else {
      throw new ConflictError("Property already added as favorite");
    }
  }

  async removeFavoriteProperty(cognitoId: string, propertyId: number) {
    return await tenantRepository.removeFavoriteProperty(cognitoId, propertyId);
  }
}
export const tenantService = new TenantService();
