import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middlewares/auth.middleware";
import tenantRoutes from "./routes/tenant.routes";
import { errorHandler } from "./middlewares/error.middleware";
import managerRoutes from "./routes/manager.routes";
import leaseRoutes from "./routes/lease.routes";
import filesRoutes from "./routes/files.routes";
import applicationRoutes from "./routes/application.routes";
import propertyRoutes from "./routes/property.routes";
import {
  rateLimiter,
  concurrencyLimiter,
} from "./middlewares/limiters.middleware";

const app = express();
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors());
app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));
app.use(rateLimiter);
app.use(concurrencyLimiter);

/* ROUTES */
app.get("/health", (req, res) => {
  res.send("OK");
});

app.use("/applications", applicationRoutes);
app.use("/properties", propertyRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);
app.use("/leases", leaseRoutes);
app.use("/files", filesRoutes);
app.use(errorHandler);

export default app;
