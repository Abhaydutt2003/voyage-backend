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
exports.tenantService = void 0;
const tenant_repository_1 = require("../repositories/tenant.repository");
class TenantService {
    createTenant(cognitoId, name, email, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield tenant_repository_1.tenantRepository.createTenant(cognitoId, name, email, phoneNumber);
        });
    }
    getTenant(cognitoId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield tenant_repository_1.tenantRepository.getTenantWithFavorites(cognitoId);
        });
    }
}
exports.tenantService = new TenantService();
