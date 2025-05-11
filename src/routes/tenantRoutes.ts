import express from "express";
import { createTenant, getTenant } from "../controllers/tenantController";

const router = express.Router();

router.post("/", createTenant);
router.get("/:cognitoId", getTenant);

export default router;