/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // Extract value within quotes using regex
  const match = err.message.match(/"([^"]*)"/);
  const extractedMessage = match?.[1] || "Value";

  // Alternative: Extract field name from keyValue
  // const fieldName = Object.keys(err.keyValue || {})[0] || "field";
  // const fieldValue = err.keyValue?.[fieldName] || "value";

  const errorSources: TErrorSources = [
    {
      path: Object.keys(err.keyValue || {})[0] || "",
      message: `${extractedMessage} is already exists`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: "Duplicate Entry",
    errorSources,
  };
};

export default handleDuplicateError;
