import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createApplication,
  updateApplicationStatus,
  listApplications,
} from "../controllers/application.controller";
import {
  validateBody,
  validateParams,
} from "../middlewares/validation.middleware";
import { body, param } from "express-validator";

const router = express.Router();

router.post(
  "/",
  authMiddleware(["tenant"]),
  validateBody([
    body("applicationDate")
      .notEmpty()
      .withMessage("applicationDate is required"),
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

router.get("/", authMiddleware(["manager", "tenant"]), listApplications);

export default router;
