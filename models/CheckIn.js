const db = require('../config/database');
const {query} = require("../config/database");
const dayjs = require("dayjs");
const result = require("pg/lib/query");

class CheckIn {
  /**
   * 체크인 기록 조회
   */
  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM checkins WHERE user_id = $1', [userId]);
    if(!result.rows || !result.rows.length) {
      const inserted = await db.query(`
        INSERT INTO checkins (user_id, date, streak)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, date, streak
      `, [userId, dayjs().toDate(), 1])
      return inserted.rows[0];
    }
    return result.rows[0];
  }

  /**
   * 체크인 기록
   * @param userId
   * @param checkin
   * @returns {Promise<*>}
   */
  static async record(userId, checkin) {
    const {date, streak} = checkin;
    const result = await db.query(`
      UPDATE checkins 
      SET date=$1, streak=$2 
      WHERE user_id=$3
      RETURNING id
    `, [date, streak, userId]);

    return result.rows[0];
  }

  static async reset(userId) {
    const query = `UPDATE checkins SET date=$1, streak=$2 WHERE user_id=$3 RETURNING id`;
    const results = await db.query(query, [dayjs().toDate(), 1, userId]);
    return results.rows[0];
  }
}

module.exports = CheckIn;