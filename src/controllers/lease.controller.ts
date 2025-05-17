import { Request, Response } from "express";
import { leaseService } from "../services/lease.service";

export const getLeases = async (req: Request, res: Response): Promise<void> => {
  const leases = await leaseService.getLeases();
  res.json(leases);
};

export const getLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const payments = await leaseService.getLeasePayments(id);
  res.json(payments);
};