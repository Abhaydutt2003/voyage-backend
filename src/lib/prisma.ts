import { PrismaClient } from "../generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

//create a single instance of PrismaClient
export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

export const handlePrismaShutdown = async () => {
  console.log("Shutting down Prisma client...");
  await prisma.$disconnect();
  console.log("Prisma client disconnected");
};
