import { Request, Response } from "express";
import { tenantService } from "../services/tenant.service";

export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    if (!cognitoId || !name || !email || !phoneNumber) {
      res.status(400).json({
        message: "Please provide all the required fields!",
      });
      return;
    }
    const tenant = await tenantService.createTenant(
      cognitoId,
      name,
      email,
      phoneNumber
    );
    res.status(201).json({
      message: "Tenant created successfully!",
      tenant,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating tenant: ${error.message}` });
  }
};

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Hi there")
    console.log(req.body);
    if (!req?.body?.cognitoId) {
      res.status(400).json({
        message: "Please provide all the required fields!",
      });
      return;
    }
    const { cognitoId } = req.body;

    const tenant = await tenantService.getTenant(cognitoId);
    if (tenant) {
      res.json({
        message: "Tenant fetched successfully",
        tenant,
      });
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tenant: ${error.message}` });
  }
};