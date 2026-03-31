/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const requestValidator = (schema: ZodObject<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Try parsing as wrapped object first (schemas that expect { body, cookies, query, params })
      await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default requestValidator;
