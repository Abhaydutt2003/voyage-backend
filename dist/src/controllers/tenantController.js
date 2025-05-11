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
const createTenant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cognitoId, name, email, phoneNumber } = req.body;
        if (!cognitoId || !name || !email || !phoneNumber) {
            res.status(400).json({
                message: "Please provide all the required fields!",
            });
            return;
        }
        const tenant = yield tenant_service_1.tenantService.createTenant(cognitoId, name, email, phoneNumber);
        res.status(201).json({
            message: "Tenant created successfully!",
            tenant,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error creating tenant: ${error.message}` });
    }
});
exports.createTenant = createTenant;
const getTenant = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("Hi there");
        console.log(req.body);
        if (!((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.cognitoId)) {
            res.status(400).json({
                message: "Please provide all the required fields!",
            });
            return;
        }
        const { cognitoId } = req.body;
        const tenant = yield tenant_service_1.tenantService.getTenant(cognitoId);
        if (tenant) {
            res.json({
                message: "Tenant fetched successfully",
                tenant,
            });
        }
        else {
            res.status(404).json({ message: "Tenant not found" });
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving tenant: ${error.message}` });
    }
});
exports.getTenant = getTenant;
