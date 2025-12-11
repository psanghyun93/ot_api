const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

/**
 * Verify token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode token without verification
 * @param {string} token - JWT token
 * @returns {Object} Decoded token
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};