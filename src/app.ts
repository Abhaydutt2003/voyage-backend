import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middlewares/auth.middleware";
import tenantRoutes from "./routes/tenantRoutes";
import { errorHandler } from "./middlewares/error.middleware";

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

app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use(errorHandler);

export default app;
