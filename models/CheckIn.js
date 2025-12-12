const db = require('../config/database');
const {query} = require("../config/database");
const dayjs = require("dayjs");

class CheckIn {
  /**
   * 체크인 기록 조회
   */
  static async findByUserId(userId) {
    const result = db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if(!result.rows.length) {
      throw new Error(`User with id ${userId} not found`);
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
    UPDATE users 
    SET date=$1, streak=$2 
    WHERE user_id=$3
    RETURNING id
    `, [date, streak, userId]);

    return result.rows[0];
  }

  static async reset(userId) {
    const query = `UPDATE users SET date=$1, streak=$2 WHERE user_id=$3`;
    return await db.query(query, [dayjs().toDate(), 1, userId]);
  }
}

module.exports = CheckIn;