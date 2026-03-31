// create an custom class to throw error with status code to extends Error(builtInClass)

/**
 * Creates a custom application error
 *
 * @param {number} statusCode - HTTP status code (400, 404, 500, etc.)
 * @param {string} message - Error message
 * @param {string} [stack] - Optional stack trace (for rethrowing errors)
 *
 * @example
 * throw new CustomAppError(404, "File not found");
 * throw new CustomAppError(400, "Invalid file data");
 */

class CustomAppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string, stack?: string) {
    super(message);
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default CustomAppError;
