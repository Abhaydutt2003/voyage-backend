"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApplicationError = void 0;
class ApplicationError extends Error {
    constructor(message, statusCode = 500, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Object.setPrototypeOf(this, ApplicationError.prototype);
    }
}
exports.ApplicationError = ApplicationError;
/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log error
    console.error(`${req.method} ${req.path} - Error:`, err);
    // Default status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    // Format the response
    const errorResponse = { message };
    // Add validation errors if they exist
    if (err.errors && err.errors.length > 0) {
        errorResponse.errors = err.errors;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
