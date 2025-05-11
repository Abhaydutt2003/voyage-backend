import { Request, Response, NextFunction } from "express";
interface AppError extends Error {
  statusCode?: number;
  errors?: string[];
}

export class ApplicationError extends Error {
  statusCode?: number;
  errors?: string[];

  constructor(message: string, statusCode = 500, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  console.error(`${req.method} ${req.path} - Error:`, err);

  // Default status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Format the response
  const errorResponse: { message: string; errors?: string[] } = { message };

  // Add validation errors if they exist
  if (err.errors && err.errors.length > 0) {
    errorResponse.errors = err.errors;
  }

  res.status(statusCode).json(errorResponse);
};
