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
exports.getTenant = exports.createTenant = void 0;
const tenant_service_1 = require("../services/tenant.service");
const error_middleware_1 = require("../middlewares/error.middleware");
const createTenant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        const tenant = yield tenant_service_1.tenantService.createTenant(cognitoId, name, email, phoneNumber);
        res.status(201).json({
            tenant,
        });
    }
    catch (error) {
        console.log(error);
        throw new error_middleware_1.ApplicationError("Server Error", 500, [
            `Error creating tenant: ${error.message}`,
        ]);
    }
});
exports.createTenant = createTenant;
const getTenant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId } = req.params;
        const tenant = yield tenant_service_1.tenantService.getTenant(cognitoId);
        if (tenant) {
            res.json({
                message: "Tenant fetched successfully",
                tenant,
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
exports.getTenant = getTenant;
