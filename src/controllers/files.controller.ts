import { Request, Response } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { s3Service } from "../services/s3Service";
import { FileInformation } from "../lib/filesConfig";

export const getPresignedPutUrls = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const filesInformation: FileInformation[] = req.body.filesInformation;
    const uploadType = req.body.uploadType;
    const results = await s3Service.getPutPresignedUrls(
      filesInformation,
      uploadType
    );
    res.json(results);
  }
);
