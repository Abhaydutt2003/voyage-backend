import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>; //typescript is not strict enough with functions, so fewer arguments can be passed

/**
 * Wraps an async controller function to handle errors automatically
 * @param fn The async controller function to wrap
 * @returns A new function that handles errors and passes them to Express's error middleware
 */
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
