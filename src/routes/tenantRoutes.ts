import express from "express";
import {
  validateBody,
  validateParams,
} from "../middlewares/validation.middleware";
import { createTenant, getTenant } from "../controllers/tenantController";
import { body, param } from "express-validator";

const router = express.Router();

router.post(
  "/",
  validateBody([
    body("cognitoId").notEmpty().withMessage("Cognito ID is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ]),
  createTenant
);

router.get(
  "/:cognitoId",
  validateParams([
    param("cognitoId").notEmpty().withMessage("Cognito ID is required"),
  ]),
  getTenant
);

export default router;
