import { HTTP_STATUS } from "../../../constants/httpConstants";

/**
 * Base error class for application errors.
 * Extends the built-in Error class to include an error code and status code.
 *
 * This abstract provides:
 * - Consistent error structure for the whole application
 * - HTTP status codes for the proper responses
 * - Error codes for proper error handling
 * - Proper prototype for instance of checks
 */
export class AppError extends Error {
    /**
     * Creates a new AppError instance
     * @param message - The error message.
     * @param code - The error code.
     * @param statusCode - The http response code.
     */
    constructor(
        public message: string,
        public code: string,
        public statusCode: number
    ) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Class representing an authentication error.
 * Used for invalid tokens, expired tokens, or missing authentication
 */
export class AuthenticationError extends AppError {
    constructor(
        message: string,
        code: string = "AUTHENTICATION_ERROR",
        statusCode: number = HTTP_STATUS.UNAUTHORIZED
    ) {
        super(message, code, statusCode);
    }
}

/**
 * Class representing an authorization error.
 * Used for insufficient permissions and role validation failures.
 */
export class AuthorizationError extends AppError {
    constructor(
        message: string,
        code: string = "AUTHORIZATION_ERROR",
        statusCode: number = HTTP_STATUS.FORBIDDEN
    ) {
        super(message, code, statusCode);
    }
}
