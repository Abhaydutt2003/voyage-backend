import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getAcceptedLeases } from "../controllers/lease.controller";
import { validateQuery } from "../middlewares/validation.middleware";
import { param, query } from "express-validator";

const router = express.Router();

router.get(
  "/getAcceptedLeases",
  authMiddleware(["manager", "tenant"]),
  validateQuery([
    query("propertyId").notEmpty().withMessage("propertyId is required"),
  ]),
  getAcceptedLeases
);

export default router;
