/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Data to send
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 */
const errorResponse = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  successResponse,
  errorResponse
};