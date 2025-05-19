import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "./error.middleware";

interface DecodedToken extends JwtPayload {
  sub: string; //cognito id
  "custom:role"?: string;
}

//to tell typescript that we are going to attach user object to request after auth
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError();
    }

    try {
      const decoded = jwt.decode(token) as DecodedToken;
      const userRole = decoded["custom:role"] || "";
      req.user = {
        id: decoded.sub,
        role: userRole,
      };
      const hasAccess = allowedRoles.includes(userRole.toLowerCase());
      if (!hasAccess) {
        throw new ForbiddenError();
      }
    } catch (error) {
      throw new ValidationError(["Invalid token"]);
    }
    next();
  };
};
