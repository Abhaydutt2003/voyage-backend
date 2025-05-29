import { Request, Response } from "express";
import { leaseService } from "../services/lease.service";
import { asyncHandler } from "../lib/asyncHandler";

export const getLeases = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const leases = await leaseService.getLeases();
    res.json(leases);
  }
);

export const getLeasePayments = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const payments = await leaseService.getLeasePayments(id);
    res.json(payments);
  }
);
