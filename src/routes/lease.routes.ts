import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getAcceptedLeases,
  reviewLeaseProperty,
} from "../controllers/lease.controller";
import { validateQuery } from "../middlewares/validation.middleware";
import { body, param, query } from "express-validator";

const router = express.Router();

router.get(
  "/getAcceptedLeases",
  authMiddleware(["manager", "tenant"]),
  validateQuery([
    query("propertyId").notEmpty().withMessage("propertyId is required"),
  ]),
  getAcceptedLeases
);

router.post(
  "/reviewLeaseProperty",
  authMiddleware(["tenant"]),
  validateQuery([
    body("leaseId").notEmpty().withMessage("leaseId is required"),
    body("propertyId").notEmpty().withMessage("propertyId is required"),
    body("reviewRating")
      .notEmpty()
      .withMessage("reviewRating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("reviewRating must be an integer between 1 and 5"),
  ]),
  reviewLeaseProperty
);

export default router;
