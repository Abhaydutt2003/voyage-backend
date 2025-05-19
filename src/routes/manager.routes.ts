import express from "express";
import {
  validateBody,
  validateParams,
} from "../middlewares/validation.middleware";
import {
  createManager,
  getManager,
  getManagerProperties,
  updateManager,
} from "../controllers/manager.controller";
import { body, param } from "express-validator";

const router = express.Router();

router.post(
  "/",
  validateBody([
    body("cognitoId").notEmpty().withMessage("Cognito ID is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ]),
  createManager
);

router.get(
  "/:cognitoId",
  validateParams([
    param("cognitoId").notEmpty().withMessage("Cognito ID is required"),
  ]),
  getManager
);

router.put(
  "/:cognitoId",
  validateParams([
    param("cognitoId").notEmpty().withMessage("Cognito ID is required"),
  ]),
  updateManager
);

router.get(
  "/:cognitoId/properties",
  validateParams([
    param("cognitoId").notEmpty().withMessage("Cognito ID is required"),
  ]),
  getManagerProperties
);

export default router;
