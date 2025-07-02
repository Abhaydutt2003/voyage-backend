import { Request, Response } from "express";
import { leaseService } from "../services/lease.service";
import { asyncHandler } from "../lib/asyncHandler";

export const getAcceptedLeases = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const acceptedleaseTimes = await leaseService.getAccpetedLeasesTimes(
      Number(req.query.propertyId)
    );
    res.json(acceptedleaseTimes);
  }
);

export const reviewLeaseProperty = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { leaseId, propertyId, reviewRating } = req.body;
    await leaseService.reviewLeaseProperty(
      parseInt(leaseId),
      parseInt(propertyId),
      parseInt(reviewRating)
    );
    res.json("Review added successfully");
  }
);
