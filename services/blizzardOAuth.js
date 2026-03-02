const axios = require('axios');

const BLIZZARD_CLIENT_ID = process.env.BLIZZARD_CLIENT_ID;
const BLIZZARD_CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET;
const BLIZZARD_REDIRECT_URI = process.env.BLIZZARD_REDIRECT_URI || 'http://localhost:3000/api/auth/blizzard/callback';
const BLIZZARD_REGION = process.env.BLIZZARD_REGION || 'us';

// Regional OAuth endpoints
const OAUTH_ENDPOINTS = {
  us: 'https://oauth.battle.net',
  eu: 'https://oauth.battle.net',
  kr: 'https://oauth.battle.net',
  tw: 'https://oauth.battle.net',
  cn: 'https://oauth.battlenet.com.cn'
};

// Regional API endpoints
const API_ENDPOINTS = {
  us: 'https://us.api.blizzard.com',
  eu: 'https://eu.api.blizzard.com',
  kr: 'https://kr.api.blizzard.com',
  tw: 'https://tw.api.blizzard.com',
  cn: 'https://gateway.battlenet.com.cn'
};

const OAUTH_BASE_URL = OAUTH_ENDPOINTS[BLIZZARD_REGION];
const API_BASE_URL = API_ENDPOINTS[BLIZZARD_REGION];

class BlizzardOAuthService {
  /**
   * Get authorization URL for OAuth flow
   * @param {string} state - Optional state parameter
   * @returns {string} Authorization URL
   */
  /**
   * Get authorization URL for OAuth flow
   * @param {string} state - Optional state parameter
   * @param {string|null} redirectUri - Optional redirect URI override
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl(state = '', redirectUri = null) {
    const uri = redirectUri || BLIZZARD_REDIRECT_URI;
    const params = new URLSearchParams({
      client_id: BLIZZARD_CLIENT_ID,
      redirect_uri: uri,
      response_type: 'code',
      scope: 'openid',
      ...(state && { state })
    });

    return `${OAUTH_BASE_URL}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code
   * @returns {Promise<Object>} Token response
   */
  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code
   * @param {string|null} redirectUri - Redirect URI used in auth request
   * @returns {Promise<Object>} Token response
   */
  async getAccessToken(code, redirectUri = null) {
    try {
      const uri = redirectUri || BLIZZARD_REDIRECT_URI;
      const response = await axios.post(
        `${OAUTH_BASE_URL}/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: uri
        }),
        {
          auth: {
            username: BLIZZARD_CLIENT_ID,
            password: BLIZZARD_CLIENT_SECRET
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw new Error('Failed to get access token from Blizzard');
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Token response
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        `${OAUTH_BASE_URL}/oauth/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        {
          auth: {
            username: BLIZZARD_CLIENT_ID,
            password: BLIZZARD_CLIENT_SECRET
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw new Error('Failed to refresh token');
    }
  }

  /**
   * Get user info from Blizzard
   * @param {string} accessToken - Access token
   * @returns {Promise<Object>} User info
   */
  async getUserInfo(accessToken) {
    try {
      const response = await axios.get(`${OAUTH_BASE_URL}/oauth/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user info:', error.response?.data || error.message);
      throw new Error('Failed to get user info from Blizzard');
    }
  }

  /**
   * Validate access token
   * @param {string} accessToken - Access token
   * @returns {Promise<Object>} Token info
   */
  async validateToken(accessToken) {
    try {
      const response = await axios.post(
        `${OAUTH_BASE_URL}/oauth/check_token`,
        new URLSearchParams({ token: accessToken }),
        {
          auth: {
            username: BLIZZARD_CLIENT_ID,
            password: BLIZZARD_CLIENT_SECRET
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error validating token:', error.response?.data || error.message);
      throw new Error('Invalid token');
    }
  }
}

module.exports = new BlizzardOAuthService();