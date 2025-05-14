import { tenantRepository } from "../repositories/tenant.repository";

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
}
export const tenantService = new TenantService();
