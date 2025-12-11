const db = require('../config/database');

class Season {
  /**
   * Get all seasons
   * @returns {Promise<Array>}
   */
  static async findAll() {
    const query = `
      SELECT id, name, start_time, end_time, state, created_at, updated_at
      FROM seasons
      ORDER BY start_time DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get season by ID
   * @param {number} id - Season ID
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const query = `
      SELECT id, name, start_time, end_time, state, created_at, updated_at
      FROM seasons
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get active seasons (ONGOING or ETERNAL)
   * @returns {Promise<Array>}
   */
  static async findActive() {
    const query = `
      SELECT id, name, start_time, end_time, state, created_at, updated_at
      FROM seasons
      WHERE state IN ('ONGOING', 'ETERNAL')
      ORDER BY start_time DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Get seasons by state
   * @param {string} state - Season state
   * @returns {Promise<Array>}
   */
  static async findByState(state) {
    const query = `
      SELECT id, name, start_time, end_time, state, created_at, updated_at
      FROM seasons
      WHERE state = $1
      ORDER BY start_time DESC
    `;
    const result = await db.query(query, [state]);
    return result.rows;
  }

  /**
   * Create a new season
   * @param {Object} seasonData - Season data
   * @returns {Promise<Object>}
   */
  static async create(seasonData) {
    const { name, start_time, end_time, state } = seasonData;

    const query = `
      INSERT INTO seasons (name, start_time, end_time, state)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, start_time, end_time, state, created_at, updated_at
    `;

    const result = await db.query(query, [
      JSON.stringify(name),
      start_time,
      end_time,
      state
    ]);

    return result.rows[0];
  }

  /**
   * Update a season
   * 시즌 수정
   * - 시즌 수정은 관리자만 가능합니다.
   * - 수정 가능한 필드는 종료시간, 상태입니다.
   * - 두 가지 필드 중 하나 이상이 있어야 합니다.
   * - 상태는 WAITING -> ONGOING -> ENDED로 변경됩니다.
   * @param {number} id - Season ID
   * @param {Object} seasonData - Season data to update
   * @returns {Promise<Object|null>}
   */
  static async update(id, seasonData) {
    const { end_time, state } = seasonData;
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (end_time !== undefined) {
      fields.push(`end_time = $${paramCount}`);
      values.push(end_time);
      paramCount++;
    }

    if (state !== undefined) {
      fields.push(`state = $${paramCount}`);
      values.push(state);
      paramCount++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE seasons
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, start_time, end_time, state, created_at, updated_at
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a season
   * @param {number} id - Season ID
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const query = 'DELETE FROM seasons WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Get season statistics
   * @returns {Promise<Object>}
   */
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_seasons,
        COUNT(CASE WHEN state = 'ONGOING' THEN 1 END) as ongoing_seasons,
        COUNT(CASE WHEN state = 'WAITING' THEN 1 END) as waiting_seasons,
        COUNT(CASE WHEN state = 'ENDED' THEN 1 END) as ended_seasons,
        COUNT(CASE WHEN state = 'ETERNAL' THEN 1 END) as eternal_seasons
      FROM seasons
    `;
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = Season;