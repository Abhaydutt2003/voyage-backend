import { managerRepository } from "../repositories/manager.repository";

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
    return await managerRepository.getManager(cognitoId);
  }
}
export const managerService = new ManagerService();
