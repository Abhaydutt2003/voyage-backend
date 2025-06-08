import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createProperty,
  getProperties,
  getProperty,
  getPropertyLeases,
} from "../controllers/property.controller";
import { validateParams } from "../middlewares/validation.middleware";
import { param } from "express-validator";

const storage = multer.memoryStorage(); //will be held in the server's memory as Buffer objects.
const upload = multer({ storage: storage }); //methods like .array() to apply middleware to the routes

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.get(
  "/:id/leases",
  authMiddleware(["manager"]),
  validateParams([
    param("id").notEmpty().withMessage("Property Id is required"),
  ]),
  getPropertyLeases
);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"), //field in the form should be names photos, multer will add a req.files object
  createProperty
);

export default router;
