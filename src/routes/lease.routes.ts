import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getAcceptedLeases, getLeases } from "../controllers/lease.controller";
import {
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import { param, query } from "express-validator";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);

router.get(
  "/getAcceptedLeases",
  authMiddleware(["manager", "tenant"]),
  validateQuery([
    query("propertyId").notEmpty().withMessage("propertyId is required"),
  ]),
  getAcceptedLeases
);

export default router;
