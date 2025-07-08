import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

//conservative.
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Rate limit exceeded, please try again later",
});

let activeRequests = 0;
export const concurrencyLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (activeRequests >= 5) {
    res.status(503).json({
      error: "Server busy",
      message: "Too many concurrent requests, please try again",
      retryAfter: 5,
    });
  }
  activeRequests++;
  res.on("finish", () => {
    activeRequests--;
  });
  next();
};
