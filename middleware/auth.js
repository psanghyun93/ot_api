const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return errorResponse(res, 'No token provided', 401);
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

/**
 * Optional authentication middleware
 * Verifies token if present, but doesn't require it
 */
const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

      if (token) {
        const decoded = verifyToken(token);
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
