const db = require('../config/database');
const {CONST_USER_RANK} = require("./constants/UserConstant");
const {MAX_MANA} = require("../config/appPolicy");

class User {
  /**
   * Get all users
   * @returns {Promise<Array>}
   */
  static async findAll() {
    const query = `
        SELECT id, name, nickname, email, blizzard_battletag, avatar_url, is_registration_complete, last_login, created_at, updated_at
        FROM users
        ORDER BY id ASC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const query = `
        SELECT id, name, nickname, email, blizzard_id, blizzard_battletag, avatar_url,
               is_registration_complete, mana, last_login, created_at, updated_at
        FROM users
        WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    const query = `
        SELECT id, name, nickname, email, blizzard_id, blizzard_battletag, avatar_url,
               is_registration_complete, last_login, created_at, updated_at
        FROM users
        WHERE email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Get user by Blizzard ID
   * @param {string} blizzardId - Blizzard user ID
   * @returns {Promise<Object|null>}
   */
  static async findByBlizzardId(blizzardId) {
    const query = `
        SELECT id, name, nickname, email, blizzard_id, blizzard_battletag, avatar_url,
               blizzard_access_token, blizzard_refresh_token, blizzard_token_expires_at,
               is_registration_complete, last_login, created_at, updated_at
        FROM users
        WHERE blizzard_id = $1
    `;
    const result = await db.query(query, [blizzardId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    const { name, email } = userData;
    const query = `
        INSERT INTO users (name, email)
        VALUES ($1, $2)
            RETURNING id, name, email, created_at, updated_at
    `;
    const result = await db.query(query, [name, email]);
    return result.rows[0];
  }

  /**
   * Create user from Blizzard OAuth
   * @param {Object} userData - User data from Blizzard
   * @returns {Promise<Object>}
   */
  static async createFromBlizzard(userData) {
    const {
      blizzardId,
      blizzardBattletag,
      email,
      name,
      blizzardAccessToken,
      blizzardRefreshToken,
      blizzardTokenExpiresAt
    } = userData;

    const query = `
        INSERT INTO users (
            name, email, blizzard_id, blizzard_battletag,
            blizzard_access_token, blizzard_refresh_token, blizzard_token_expires_at,
            is_registration_complete, last_login
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, NOW())
            RETURNING id, name, nickname, email, blizzard_id, blizzard_battletag, avatar_url,
                is_registration_complete, last_login, created_at, updated_at
    `;

    const result = await db.query(query, [
      name,
      email,
      blizzardId,
      blizzardBattletag,
      blizzardAccessToken,
      blizzardRefreshToken,
      blizzardTokenExpiresAt
    ]);

    return result.rows[0];
  }

  /**
   * Complete user registration with additional info
   * @param {number} id - User ID
   * @param {Object} userData - Additional user data
   * @returns {Promise<Object>} Updated user
   */
  static async completeRegistration(id, userData) {
    const { name, nickname, email } = userData;

    const query = `
      UPDATE users 
      SET name = $1,
          nickname = $2, 
          email = $3,
          is_registration_complete = TRUE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, nickname, email, blizzard_battletag, avatar_url, is_registration_complete, created_at, updated_at
    `;

    const result = await db.query(query, [name, nickname, email, id]);
    return result.rows[0];
  }

  /**
   * Update a user
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object|null>}
   */
  static async update(id, userData) {
    const { name, nickname, email, avatarUrl } = userData;
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (nickname !== undefined) {
      fields.push(`nickname = $${paramCount}`);
      values.push(nickname);
      paramCount++;
    }

    if (email !== undefined) {
      fields.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramCount}`);
      values.push(avatarUrl);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
        UPDATE users
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
            RETURNING id, name, email, blizzard_battletag, avatar_url, created_at, updated_at
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Update Blizzard tokens
   * @param {number} id - User ID
   * @param {Object} tokenData - Token data
   * @returns {Promise<Object|null>}
   */
  static async updateBlizzardTokens(id, tokenData) {
    const {
      blizzardAccessToken,
      blizzardRefreshToken,
      blizzardTokenExpiresAt,
      lastLogin
    } = tokenData;

    const query = `
        UPDATE users
        SET blizzard_access_token = $1,
            blizzard_refresh_token = $2,
            blizzard_token_expires_at = $3,
            last_login = $4
        WHERE id = $5
            RETURNING id, name, email, blizzard_id, blizzard_battletag, avatar_url,
                             is_registration_complete, last_login, created_at, updated_at
    `;

    const result = await db.query(query, [
      blizzardAccessToken,
      blizzardRefreshToken,
      blizzardTokenExpiresAt,
      lastLogin,
      id
    ]);

    return result.rows[0] || null;
  }

  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Check if nickname exists
   * @param {string} nickname - User nickname
   * @param {number} excludeId - User ID to exclude from check (for updates)
   * @returns {Promise<boolean>}
   */
  static async nicknameExists(nickname, excludeId = null) {
    let query = 'SELECT id FROM users WHERE nickname = $1';
    const params = [nickname];

    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }

    const result = await db.query(query, params);
    return result.rows.length > 0;
  }

  /**
    * Decrease user's mana
    * @param {number} id - User ID
    * @param {number} amount - Amount to decrease
    * @returns {Promise<Object|null>}
    */
   static async decreaseMana(id, amount) {
     const query = `
       UPDATE users
       SET mana = mana - $1
       WHERE id = $2 AND mana >= $1
       RETURNING id, mana
     `;
     const result = await db.query(query, [amount, id]);
     return result.rows[0] || null;
   }

   /**
    * Increase user's mana
    * @param {number} id - User ID
    * @param {number} amount - Amount to increase
    * @returns {Promise<Object|null>}
    */
   static async increaseMana(id, amount) {
     // 체그인 사용자의 등급별로 최대 마나량과 비교하여 충천
     // 본인이 가질수 있는 마나보다 많다면 최대값으로 조정
     const user = await this.findById(id);
     if(MAX_MANA[user.rank] < user.mana + amount) {
       const result = await db.query(`
           UPDATE users
           SET mana = $1
           WHERE id = $2
           RETURNING id, mana
       `, [MAX_MANA[user.rank], id])
       return result.rows[0] || null;
     }

     const query = `
       UPDATE users
       SET mana = mana + $1
       WHERE id = $2
       RETURNING id, mana
     `;
     const result = await db.query(query, [amount, id]);
     return result.rows[0] || null;
   }

   /**
    * Get user's mana
    * @param {number} id - User ID
    * @returns {Promise<number>}
    */
   static async getMana(id) {
     const query = 'SELECT mana FROM users WHERE id = $1';
     const result = await db.query(query, [id]);
     return result.rows[0] ? result.rows[0].mana : 0;
   }

   /**
   * Check if email exists
   * @param {string} email - User email
   * @param {number} excludeId - User ID to exclude from check (for updates)
   * @returns {Promise<boolean>}
   */
  static async emailExists(email, excludeId = null) {
    let query = 'SELECT id FROM users WHERE email = $1';
    const params = [email];

    if (excludeId) {
      query += ' AND id != $2';
      params.push(excludeId);
    }

    const result = await db.query(query, params);
    return result.rows.length > 0;
  }

  /**
   * Invalidate user tokens (for logout)
   * @param {number} id - User ID
   * @returns {Promise<boolean>}
   */
  static async invalidateTokens(id) {
    const query = `
      UPDATE users 
      SET blizzard_access_token = NULL,
          blizzard_refresh_token = NULL,
          blizzard_token_expires_at = NULL
      WHERE id = $1
      RETURNING id
    `;
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }
}

module.exports = User;