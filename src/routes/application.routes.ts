import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createApplication,
  updateApplicationStatus,
  listApplications,
  downloadAgreement,
  downloadPropertyAgreements,
} from "../controllers/application.controller";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { body, param, query } from "express-validator";

const router = express.Router();

router.post(
  "/",
  authMiddleware(["tenant"]),
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
      .withMessage("startDate must be in ISO 8601 format (YYYY-MM-DD)")
      .custom((startDate, { req }) => {
        if (
          req.body.endDate &&
          new Date(startDate) >= new Date(req.body.endDate)
        ) {
          throw new Error("startDate must be less than endDate");
        }
        return true;
      }),
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
    body("paymentProofsBaseKeys")
      .isArray()
      .withMessage("paymentProofsBaseKeys must be an array")
      .custom((value) => {
        if (!Array.isArray(value) || value.length < 1) {
          throw new Error(
            "paymentProofsBaseKeys must be an array with at least 1 element"
          );
        }
        if (!value.every((item) => typeof item === "string")) {
          throw new Error("paymentProofsBaseKeys must contain only strings");
        }
        return true;
      }),
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
  validateParams([
    param("id").notEmpty().withMessage("id (applicationId) is required"),
  ]),
  downloadAgreement
);

router.get(
  "/:propertyId/agreements",
  authMiddleware(["manager"]),
  validateParams([
    param("propertyId").notEmpty().withMessage("propertyId is required"),
  ]),
  downloadPropertyAgreements
);

export default router;
