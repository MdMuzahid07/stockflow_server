import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";

import config from "../config";
import CustomAppError from "../errors/CustomAppError";

const authorizationGuard = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization;

      if (!token) {
        throw new CustomAppError(httpStatus.UNAUTHORIZED, "you are not authorized");
      }

      // checking the token, valid or invalid
      jwt.verify(
        token,
        config.jwt_access_token_secret_key as string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function (err: any, decoded: any) {
          // if the token is invalid then it will throw error
          if (err) {
            throw new CustomAppError(httpStatus.UNAUTHORIZED, "you are not authorized");
          }

          const decodedPayload = decoded as JwtPayload;
          // storing te role from, the decoded
          const role = decodedPayload.role;

          // checking the role is includes or not in ...requiredRoles
          if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
            throw new CustomAppError(httpStatus.UNAUTHORIZED, "you are not authorized");
          }

          // setting user in req
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (req as any).user = decodedPayload;
          // if i get the token, and its valid then it will call next step
          next();
        }
      );
    } catch (error) {
      // if any error occurs , it will send to the global error handler
      next(error);
    }
  };
};

export default authorizationGuard;
