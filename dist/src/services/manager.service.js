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
exports.managerService = void 0;
const manager_repository_1 = require("../repositories/manager.repository");
class ManagerService {
    createManager(cognitoId, name, email, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield manager_repository_1.managerRepository.createManager(cognitoId, name, email, phoneNumber);
        });
    }
    getManager(cognitoId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield manager_repository_1.managerRepository.getManager(cognitoId);
        });
    }
}
exports.managerService = new ManagerService();
