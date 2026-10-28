// An error with an HTTP status. Throw it from services; errorMiddleware turns it into `{ message }`.
export default class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }

  static badRequest(message) { return new ApiError(400, message); }
  static unauthorized(message = "Authentication required") { return new ApiError(401, message); }
  static forbidden(message = "Permission denied") { return new ApiError(403, message); }
  static notFound(message = "Not found") { return new ApiError(404, message); }
  static conflict(message) { return new ApiError(409, message); }
}
