import { Prisma } from "../generated/prisma/client";
import {
  ApplicationError,
  NotFoundError,
  ValidationError,
} from "../middlewares/error.middleware";
/**
 * Repository wrapper to handle common Prisma errors
 */
export const repoErrorHandler = <T>(fn: () => Promise<T>): Promise<T> => {
  return fn().catch((error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2001": // Record not found
        case "P2018": // Required relation record not found
        case "P2025": // Record not found in the database
          return Promise.reject(
            new NotFoundError("The requested resource does not exist")
          );

        case "P2002": // Unique constraint violation
          return Promise.reject(
            new ValidationError([
              `A record with this ${
                error.meta?.target || "value"
              } already exists`,
            ])
          );

        case "P2003": // Foreign key constraint violation
          return Promise.reject(
            new ValidationError(["Invalid relationship reference"])
          );

        case "P2014": // Required relation violation
          return Promise.reject(
            new ValidationError(["Required relation missing"])
          );

        case "P2016": // Query interpretation error
        case "P2023": // Inconsistent database query
        case "P2010": // Raw query failure
          return Promise.reject(
            new ValidationError(["Invalid query parameters"])
          );

        // Add other specific error codes as needed
        default:
          return Promise.reject(
            new ApplicationError(`Database error: ${error.code}`, 500)
          );
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return Promise.reject(new ValidationError(["Invalid data provided"]));
    }

    // If it's already an ApplicationError, just rethrow it
    if (error instanceof ApplicationError) {
      return Promise.reject(error);
    }
    // For any other unexpected errors
    return Promise.reject(
      new ApplicationError("Database operation failed", 500)
    );
  });
};
