class ApiError extends Error {
  constructor(
    statusCode,
    message = "Internal server error",
    errStack = "",
    errors = []
  ) {
    super(message);

    this.success = false;
    this.data = null;
    this.statusCode = statusCode;
    this.errors = errors;
    this.message = message;

    if (errStack) {
      this.stack = errStack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
