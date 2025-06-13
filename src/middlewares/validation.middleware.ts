import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ApplicationError, ValidationError } from "./error.middleware";

export const validateBody = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    throw new ApplicationError(
      "Validation Error",
      400,
      errors.array().map((err) => err.msg)
    );
  };
};
export const validateQuery = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    throw new ApplicationError(
      "Invalid Query Parameters",
      400,
      errors.array().map((err) => err.msg)
    );
  };
};
export const validateParams = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    throw new ApplicationError(
      "Invalid URL Parameters",
      400,
      errors.array().map((err) => err.msg)
    );
  };
};
