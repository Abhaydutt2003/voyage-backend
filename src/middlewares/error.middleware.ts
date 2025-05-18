import { Request, Response, NextFunction } from "express";

export class ApplicationError extends Error {
  statusCode: number;
  errors?: string[];

  constructor(message: string, statusCode = 500, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}
export class UnprocessableEntityError extends ApplicationError {
  constructor(message = "Unprocessable Entity", errors?: string[]) {
    super(message, 422, errors);
  }
}

export class ValidationError extends ApplicationError {
  constructor(errors: string[]) {
    super("Validation Error", 400, errors);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error for debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  // Handle known error types
  if (err instanceof ApplicationError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
