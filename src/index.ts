import dotenv from "dotenv";
import app from "./app";
import { handlePrismaShutdown } from "./lib/prisma";
dotenv.config();

/* SERVER */
const port = process.env.PORT || 3002;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

//clean databse shutdown.
process.on("SIGINT", async () => {
  console.log("SIGINT signal received: Closing HTTP server.");
  server.close(async () => {
    console.log("HTTP server closed.");
    await handlePrismaShutdown();
    process.exit(0);
  });
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: Closing HTTP server.");
  server.close(async () => {
    console.log("HTTP server closed.");
    await handlePrismaShutdown();
    process.exit(0);
  });
});
