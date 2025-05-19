import express from "express";
import {
  validateBody,
  validateParams,
} from "../middlewares/validation.middleware";
import {
  createTenant,
  getCurrentResidences,
  getTenant,
  updateTenant,
  addFavoriteProperty,
  removeFavoriteProperty,
} from "../controllers/tenant.controller";
import { body, param } from "express-validator";

const router = express.Router();

router.post(
  "/",
  validateBody([
    body("cognitoId").notEmpty().withMessage("cognitoId is required"),
    body("name").notEmpty().withMessage("name is required"),
    body("email").isEmail().withMessage("email is required"),
  ]),
  createTenant
);

router.get(
  "/:cognitoId",
  validateParams([
    param("cognitoId").notEmpty().withMessage("cognitoId is required"),
  ]),
  getTenant
);

router.put(
  "/:cognitoId",
  validateParams([
    param("cognitoId").notEmpty().withMessage("cognitoId is required"),
  ]),
  updateTenant
);

router.put(
  "/:cognitoId/current-residences",
  validateParams([
    param("cognitoId").notEmpty().withMessage("cognitoId is required"),
  ]),
  getCurrentResidences
);

router.post(
  "/:cognitoId/favorites/:propertyId",
  validateParams([
    param("cognitoId").notEmpty().withMessage("cognitoId is required"),
    param("propertyId").notEmpty().withMessage("propertyId is required"),
  ]),
  addFavoriteProperty
);

router.delete(
  "/:cognitoId/favorites/:propertyId",
  validateParams([
    param("cognitoId").notEmpty().withMessage("cognitoId is required"),
    param("propertyId").notEmpty().withMessage("propertyId is required"),
  ]),
  removeFavoriteProperty
);

export default router;
