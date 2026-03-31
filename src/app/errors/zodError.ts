import { ZodError, ZodIssue } from "zod";

import { TErrorSources, TGenericErrorResponse } from "../interface/error";

const handleZodError = (error: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1] as string | number,
      message: issue?.message,
    };
  });

  const statusCode = 400;
  return {
    statusCode,
    message: error.issues.map((i) => i.message).join(". "),
    errorSources,
  };
};

export default handleZodError;
