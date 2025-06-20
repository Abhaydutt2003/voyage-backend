import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createApplication,
  updateApplicationStatus,
  listApplications,
  downloadAgreement,
} from "../controllers/application.controller";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { body, param, query } from "express-validator";

const storage = multer.memoryStorage(); //will be held in the server's memory as Buffer objects.
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = express.Router();

router.post(
  "/",
  authMiddleware(["tenant"]),
  upload.array("paymentProof"),
  validateBody([
    body("applicationDate")
      .notEmpty()
      .withMessage("applicationDate is required")
      .isISO8601()
      .withMessage("applicationDate must be in ISO 8601 format (YYYY-MM-DD)"),
    body("startDate")
      .notEmpty()
      .withMessage("startDate is required")
      .isISO8601()
      .withMessage("startDate must be in ISO 8601 format (YYYY-MM-DD)"),
    body("endDate")
      .notEmpty()
      .withMessage("endDate is required")
      .isISO8601()
      .withMessage("endDate must be in ISO 8601 format (YYYY-MM-DD)"),
    body("status").notEmpty().withMessage("status is required"),
    body("propertyId").notEmpty().withMessage("propertyId is required"),
    body("tenantCognitoId")
      .notEmpty()
      .withMessage("tenantCognitoId is required"),
    body("name").notEmpty().withMessage("name is required"),
    body("email").notEmpty().withMessage("email is required"),
    body("phoneNumber").notEmpty().withMessage("phoneNumber is required"),
  ]),
  createApplication
);

router.put(
  "/:id/status",
  authMiddleware(["manager"]),
  validateBody([body("status").notEmpty().withMessage("status is required")]),
  validateParams([
    param("id").notEmpty().withMessage("id(applicationId) is required"),
  ]),
  updateApplicationStatus
);

router.get(
  "/",
  authMiddleware(["manager", "tenant"]),
  validateQuery([query("status").notEmpty().withMessage("status is required")]),
  listApplications
);

router.get(
  "/:id/agreement",
  authMiddleware(["tenant", "manager"]),
  validateQuery([
    query("userCognitoId").notEmpty().withMessage("userCognitoId is required"),
    query("userType").notEmpty().withMessage("userType is required"),
  ]),
  validateParams([
    param("id").notEmpty().withMessage("id (applicationId) is required"),
  ]),
  downloadAgreement
);

export default router;
