"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManager = exports.createManager = void 0;
const manager_service_1 = require("../services/manager.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const createManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const manager = yield manager_service_1.managerService.createManager(cognitoId, name, email, phoneNumber);
        res.status(201).json({
            manager,
        });
    }
    catch (error) {
        console.log(error);
        throw new error_middleware_1.ApplicationError("Server Error", 500, [
            `Error creating manager: ${error.message}`,
        ]);
    }
});
exports.createManager = createManager;
const getManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const manager = yield manager_service_1.managerService.getManager(cognitoId);
        if (manager) {
            res.json({
                manager,
            });
        }
        else {
            throw new error_middleware_1.ApplicationError("Validation Error", 404, [
                "User not found with the given id",
            ]);
        }
    }
    catch (error) {
        if (error instanceof error_middleware_1.ApplicationError) {
            throw error;
        }
        throw new error_middleware_1.ApplicationError("Server Error", 500, [
            `Error retrieving tenant: ${error.message}`,
        ]);
    }
});
exports.getManager = getManager;
