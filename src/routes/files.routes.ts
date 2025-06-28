import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { body, CustomValidator } from "express-validator";
import { ValidationError } from "../middlewares/error.middleware";
import { getPresignedPutUrls } from "../controllers/files.controller";
import { ALLOWED_MIME_TYPES, config, UPLOAD_TYPES } from "../lib/filesConfig";

const isValidMimeType: CustomValidator = (value: string) => {
  if (!ALLOWED_MIME_TYPES.includes(value as any)) {
    throw new ValidationError([
      `File type '${value}' is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(
        ", "
      )}`,
    ]);
  }
  return true;
};

const isValidUploadType: CustomValidator = (value: string) => {
  if (!Object.values(UPLOAD_TYPES).includes(value as any)) {
    throw new ValidationError([`${value} is not a valid upload type.`]);
  }
  return true;
};

const router = express.Router();

router.post(
  "/files-upload/presigned-put-urls",
  authMiddleware(["manager", "tenant"]),
  validateBody([
    body("filesInformation")
      .isArray({ min: 1, max: 10 })
      .withMessage(
        "filesInformation must be a non-empty array of file details."
      ),
    body("filesInformation.*.fileName")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("File name must be a non-empty string.")
      .isLength({ min: 1, max: config.files.maxFileNameLength })
      .withMessage(
        `File name must be between 1 and ${config.files.maxFileNameLength} characters.`
      )
      .matches(/^[^<>:"/\\|?*\x00-\x1f]+$/)
      .withMessage("File name contains invalid characters."),
    body("filesInformation.*.fileType")
      .isString()
      .notEmpty()
      .withMessage("File type cannot be empty.")
      .custom(isValidMimeType),

    body("uploadType")
      .isString()
      .notEmpty()
      .withMessage("uploadType is required.")
      .custom(isValidUploadType),
  ]),
  getPresignedPutUrls
);

export default router;
