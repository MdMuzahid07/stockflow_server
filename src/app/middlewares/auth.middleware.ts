import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import passport from "../config/passport.config";
import CustomAppError from "../errors/CustomAppError";

/**
 * Extend Express Request to include user
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      userId: string;
      email: string;
      googleId?: string;
      name?: string;
      avatar?: string;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: Error, user: Express.User) => {
    if (err) {
      return next(new CustomAppError(httpStatus.INTERNAL_SERVER_ERROR, "Authentication error"));
    }

    if (!user) {
      return next(
        new CustomAppError(
          httpStatus.UNAUTHORIZED,
          "Unauthorized. Please login to access this resource."
        )
      );
    }

    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: Error, user: Express.User) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};

/**
 * Refresh Token Middleware
 * Verifies refresh token from cookies
 */
export const verifyRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(
      new CustomAppError(httpStatus.UNAUTHORIZED, "Refresh token not found. Please login again.")
    );
  }

  // Token verification will be done in the service
  next();
};

export default authenticate;
