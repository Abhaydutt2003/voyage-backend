"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.ApplicationError = void 0;
class ApplicationError extends Error {
    constructor(message, statusCode = 500, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationError = ApplicationError;
class NotFoundError extends ApplicationError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends ApplicationError {
    constructor(errors) {
        super("Validation Error", 400, errors);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends ApplicationError {
    constructor(message = "Unauthorized access") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApplicationError {
    constructor(message = "Forbidden access") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
const errorHandler = (err, req, res, next) => {
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
exports.errorHandler = errorHandler;
