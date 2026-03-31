/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { MulterError } from "multer";
import { ZodError } from "zod";

import config from "../config";
import CustomAppError from "../errors/CustomAppError";
import handleCastError from "../errors/handleCastError";
import handleDuplicateError from "../errors/handleDuplicateError";
import handleValidationError from "../errors/handleValidationError";
import handleZodError from "../errors/zodError";
import { TErrorSources } from "../interface/error";

function globalErrorHandler(error: any, req: Request, res: Response, next: NextFunction) {
  let statusCode = 500;
  let message = "Something went wrong!";

  let errorSources: TErrorSources = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  if (error instanceof ZodError) {
    const customErrorPattern = handleZodError(error);
    statusCode = customErrorPattern?.statusCode;
    message = customErrorPattern?.message;
    errorSources = customErrorPattern?.errorSources;
  } else if (error?.name === "ValidationError") {
    const customErrorPattern = handleValidationError(error);
    statusCode = customErrorPattern?.statusCode;
    message = customErrorPattern?.message;
    errorSources = customErrorPattern?.errorSources;
  } else if (error?.name === "CastError") {
    const customErrorPattern = handleCastError(error);
    statusCode = customErrorPattern?.statusCode;
    message = customErrorPattern?.message;
    errorSources = customErrorPattern?.errorSources;
  } else if (error?.code === 11000) {
    const customErrorPattern = handleDuplicateError(error);
    statusCode = customErrorPattern?.statusCode;
    message = customErrorPattern?.message;
    errorSources = customErrorPattern?.errorSources;
  } else if (error instanceof CustomAppError) {
    statusCode = error?.statusCode;
    message = error.message;
    errorSources = [
      {
        path: "",
        message: error?.message,
      },
    ];
  } else if (error?.name === "JsonWebTokenError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid token";
    errorSources = [
      {
        path: "",
        message: "Invalid token. Please login again.",
      },
    ];
  } else if (error?.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Token expired";
    errorSources = [
      {
        path: "",
        message: "Your session has expired. Please login again.",
      },
    ];
  } else if (error instanceof MulterError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = error.message;
    errorSources = [
      {
        path: "",
        message: error.message,
      },
    ];
  } else if (error instanceof Error) {
    message = error.message;
    errorSources = [
      {
        path: "",
        message: error?.message,
      },
    ];
  }

  // custom pattern of errors

  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.NODE_ENV === "development" ? error.stack : null,
  });
}

export default globalErrorHandler;
