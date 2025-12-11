const { successResponse, errorResponse } = require('../utils/response');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const blizzardOAuth = require('../services/blizzardOAuth');
const User = require('../models/User');

class AuthController {
  /**
   * Initiate Blizzard OAuth login
   * @route GET /api/auth/blizzard
   */
  async blizzardLogin(req, res) {
    try {
      const state = Math.random().toString(36).substring(7);
      const authUrl = blizzardOAuth.getAuthorizationUrl(state);

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

      // Exchange code for access token
      const tokenData = await blizzardOAuth.getAccessToken(code);
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

      successResponse(res, {
        message: user.created_at === user.updated_at ? 'User registered successfully' : 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          email: user.email,
          blizzardBattletag: user.blizzard_battletag,
          avatarUrl: user.avatar_url,
          isRegistrationComplete: user.is_registration_complete
        },
        tokens: {
          accessToken: accessTokenJwt,
          refreshToken: refreshTokenJwt,
          expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
      });
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

  /**
   * 로그인 후 체크인
   *
   * 체크인을 위해 호출되는 라우터
   * 체크인은 UTC 00:00:00~23:59:59 사이에만 한번만 가능하다.
   *
   * 1. 어제까지 이틀동안의 체크인 기록을 조회한다.
   * 2. 어제 체크인을 했는지 확인한다.
   * 3. 어제 체크인을 했다면 오늘 체크인을 할 수 있는지 확인한다.
   * 4. 어제 체크인 정보가 있고 오늘 체크인을 할 수 있다면 연속 체크인 날짜를 증가시킨다.
   * 5. 어제 체크인 정보가 없다면 연속 체크인 날짜를 1로 초기화한다.
   * 6. 체크인 날짜를 기록한다.
   * 7. 체크인 성공 시 200 응답을 반환한다.
   * 8. 체크인 실패 시 400 응답을 반환한다.
   * 9. 체크인에 성공하면 마나를 증가시킨다.
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  async checkin(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

    } catch (error) {
      console.error('Error checking user:', error);
    }
  }

}
module.exports = new AuthController();
