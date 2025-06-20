import express from "express";
import multer from "multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createProperty,
  getProperties,
  getProperty,
  getPropertyLeases,
} from "../controllers/property.controller";
import {
  validateBody,
  validateParams,
} from "../middlewares/validation.middleware";
import { body, param } from "express-validator";

const storage = multer.memoryStorage(); //will be held in the server's memory as Buffer objects.
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}); //methods like .array() to apply middleware to the routes

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
  validateBody([
    body("name").notEmpty().withMessage("Property name is required"),
    body("description")
      .notEmpty()
      .withMessage("Property description is required"),
    body("pricePerNight")
      .notEmpty()
      .withMessage("Price per night is required")
      .isFloat({ gt: 0 })
      .withMessage("Price per night must be a positive number"),
    body("amenities")
      .optional() // Amenities might be optional if no amenities are selected
      .isString()
      .withMessage("Amenities must be a stringified JSON array")
      .custom((value) => {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch (e) {
          return false;
        }
      })
      .withMessage("Amenities must be a valid JSON array"),
    body("highlights")
      .optional() // Highlights might be optional
      .isString()
      .withMessage("Highlights must be a stringified JSON array")
      .custom((value) => {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch (e) {
          return false;
        }
      })
      .withMessage("Highlights must be a valid JSON array"),
    body("isPetsAllowed")
      .notEmpty()
      .withMessage("isPetsAllowed is required")
      .isBoolean()
      .withMessage("isPetsAllowed must be a boolean value"),
    body("isParkingIncluded")
      .notEmpty()
      .withMessage("isParkingIncluded is required")
      .isBoolean()
      .withMessage("isParkingIncluded must be a boolean value"),
    body("beds")
      .notEmpty()
      .withMessage("Number of beds is required")
      .isInt({ gt: 0 })
      .withMessage("Number of beds must be a positive integer"),
    body("baths")
      .notEmpty()
      .withMessage("Number of baths is required")
      .isFloat({ gt: 0 })
      .withMessage("Number of baths must be a positive number"),
    body("squareFeet")
      .notEmpty()
      .withMessage("Square footage is required")
      .isInt({ gt: 0 })
      .withMessage("Square footage must be a positive integer"),
    body("propertyType")
      .notEmpty()
      .withMessage("Property type is required")
      .isString()
      .withMessage("Property type must be a string"), // You might want to add .isIn() if PropertyType is an enum with specific values
    body("managerCognitoId")
      .notEmpty()
      .withMessage("Manager Cognito ID is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("postalCode").notEmpty().withMessage("Postal code is required"),
  ]),
  createProperty
);

export default router;
