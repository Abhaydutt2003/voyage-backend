import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getLeasePayments, getLeases } from "../controllers/lease.controller";
import { validateParams } from "../middlewares/validation.middleware";
import { param } from "express-validator";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get(
  "/:id/payments",
  validateParams([param("id").notEmpty().withMessage("Lease id is required!")]),
  getLeasePayments
);
export default router;
