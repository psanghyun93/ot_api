const { successResponse, errorResponse } = require('../utils/response');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const crypto = require('crypto');
const blizzardOAuth = require('../services/blizzardOAuth');
const User = require('../models/User');
const CheckIn = require("../models/CheckIn");

class AuthController {
  /**
   * Initiate Blizzard OAuth login
   * @route GET /api/auth/blizzard
   */
  async blizzardLogin(req, res) {
    try {
      const state = crypto.randomBytes(16).toString('hex');
      // determine base URL - prefer explicit APP_BASE_URL env var for external access
      const protocol = req.protocol;
      const host = req.get('host');
      
      // 외부 접속을 위해 APP_BASE_URL이 없으면 공인 IP 사용 (포트가 3000이라고 가정)
      // host가 localhost인 경우에도 외부 IP로 강제 변환하여 리다이렉트 문제 해결
      const serverIp = '211.184.27.184';
      const baseUrl = process.env.APP_BASE_URL || `${protocol}://${host.includes('localhost') ? `${serverIp}:3000` : host}`;
      const redirectUri = `${baseUrl}/api/auth/blizzard/callback`;

      const authUrl = blizzardOAuth.getAuthorizationUrl(state, redirectUri);

      successResponse(res, {
        authUrl,
        state
      });
    } catch (error) {
      console.error('Error initiating Blizzard login:', error);
      errorResponse(res, 'Failed to initiate Blizzard login', 500);
    }
  }

  /**
   * Handle Blizzard OAuth callback
   * @route GET /api/auth/blizzard/callback
   */
  async blizzardCallback(req, res) {
    try {
      const { code, state } = req.query;

      if (!code) {
        return errorResponse(res, 'Authorization code is required', 400);
      }

      // Exchange code for access token (must use the same redirect URI as used above)
      const protocol = req.protocol;
      const host = req.get('host');
      
      const serverIp = '211.184.27.184';
      const baseUrl = process.env.APP_BASE_URL || `${protocol}://${host.includes('localhost') ? `${serverIp}:3000` : host}`;
      const redirectUri = `${baseUrl}/api/auth/blizzard/callback`;

      const tokenData = await blizzardOAuth.getAccessToken(code, redirectUri);
      const { access_token, refresh_token, expires_in } = tokenData;

      // Get user info from Blizzard
      const blizzardUser = await blizzardOAuth.getUserInfo(access_token);

      // Calculate token expiration
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // Check if user exists by Blizzard ID
      let user = await User.findByBlizzardId(blizzardUser.sub);

      if (user) {
        // Update existing user with new tokens
        user = await User.updateBlizzardTokens(user.id, {
          blizzardAccessToken: access_token,
          blizzardRefreshToken: refresh_token,
          blizzardTokenExpiresAt: expiresAt,
          lastLogin: new Date()
        });
      } else {
        // Create new user
        user = await User.createFromBlizzard({
          blizzardId: blizzardUser.sub,
          blizzardBattletag: blizzardUser.battletag,
          email: blizzardUser.email || `${blizzardUser.sub}@blizzard.oauth`,
          name: blizzardUser.battletag || 'Blizzard User',
          blizzardAccessToken: access_token,
          blizzardRefreshToken: refresh_token,
          blizzardTokenExpiresAt: expiresAt
        });
      }

      // Generate our own JWT tokens
      const payload = {
        id: user.id,
        email: user.email,
        blizzardId: user.blizzard_id
      };

      const accessTokenJwt = generateAccessToken(payload);
      const refreshTokenJwt = generateRefreshToken(payload);

      // 프론트엔드 페이지로 리다이렉트 (토큰과 상태 전달)
      // FRONTEND_URL이 설정되어 있지 않으면 API 서버 주소를 기본값으로 사용
      const targetBaseUrl = process.env.FRONTEND_URL || baseUrl;
      res.redirect(`${targetBaseUrl}/login/callback?accessToken=${accessTokenJwt}&refreshToken=${refreshTokenJwt}&isRegistrationComplete=${user.is_registration_complete}`);
    } catch (error) {
      console.error('Error in Blizzard callback:', error);
      errorResponse(res, error.message || 'Failed to authenticate with Blizzard', 500);
    }
  }

  /**
   * Refresh JWT token
   * @route POST /api/auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token is required', 400);
      }

      const { verifyToken } = require('../utils/jwt');
      const decoded = verifyToken(refreshToken);

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Generate new tokens
      const payload = {
        id: user.id,
        email: user.email,
        blizzardId: user.blizzard_id
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      successResponse(res, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
      errorResponse(res, 'Invalid or expired refresh token', 401);
    }
  }

  /**
   * Get current user info
   * @route GET /api/auth/me
   */
  async getMe(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      successResponse(res, {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        blizzardBattletag: user.blizzard_battletag,
        avatarUrl: user.avatar_url,
        lastLogin: user.last_login,
        createdAt: user.created_at
      });
    } catch (error) {
      console.error('Error getting user info:', error);
      errorResponse(res, 'Failed to get user info', 500);
    }
  }

  /**
   * Logout user
   * @route POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      const userId = req.user.id;

      // Invalidate refresh token in database
      // This prevents the user from getting new access tokens
      const invalidated = await User.invalidateTokens(userId);

      if (!invalidated) {
        return errorResponse(res, 'Failed to logout', 500);
      }

      // Note: The client (frontend) should also:
      // 1. Remove access token from localStorage/cookies
      // 2. Remove refresh token from localStorage/cookies
      // 3. Clear any cached user data
      // 4. Redirect to login page

      successResponse(res, {
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Error during logout:', error);
      errorResponse(res, 'Failed to logout', 500);
    }
  }


}
module.exports = new AuthController();
