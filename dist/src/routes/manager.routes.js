"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../middlewares/validation.middleware");
const manager_controller_1 = require("../controllers/manager.controller");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
router.post("/", (0, validation_middleware_1.validateBody)([
    (0, express_validator_1.body)("cognitoId").notEmpty().withMessage("Cognito ID is required"),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Valid email is required"),
]), manager_controller_1.createManager);
router.get("/:cognitoId", (0, validation_middleware_1.validateParams)([
    (0, express_validator_1.param)("cognitoId").notEmpty().withMessage("Cognito ID is required"),
]), manager_controller_1.getManager);
exports.default = router;
