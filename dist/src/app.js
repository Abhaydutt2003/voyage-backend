"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const tenant_routes_1 = __importDefault(require("./routes/tenant.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const manager_routes_1 = __importDefault(require("./routes/manager.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
/* ROUTES */
app.get("/", (req, res) => {
    res.send("This is home route.");
});
app.use("/tenants", (0, auth_middleware_1.authMiddleware)(["tenant"]), tenant_routes_1.default);
app.use("/managers", (0, auth_middleware_1.authMiddleware)(["manager"]), manager_routes_1.default);
app.use(error_middleware_1.errorHandler);
exports.default = app;
