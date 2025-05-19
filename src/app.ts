import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middlewares/auth.middleware";
import tenantRoutes from "./routes/tenant.routes";
import { errorHandler } from "./middlewares/error.middleware";
import managerRoutes from "./routes/manager.routes";
import leaseRoutes from "./routes/lease.routes";
import applicationRoutes from "./routes/application.routes";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route.");
});

app.use("/applications", applicationRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);
app.use("/leases", leaseRoutes);
app.use(errorHandler);

export default app;
