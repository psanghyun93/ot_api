const db = require('../config/database');
const { errorResponse } = require('../utils/response');

// registrationCompleted 미들웨어 수정 버전
const registrationCompleted = async (req, res, next) => {
  try {
    const reqUser = req.user;

    // 1. 유저 정보가 없는 경우 방어 로직
    if (!reqUser || !reqUser.id) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const query = `SELECT is_registration_complete FROM users WHERE id = $1`;
    const result = await db.query(query, [reqUser.id]);

    // 2. 사용자를 찾을 수 없는 경우
    if (result.rows.length === 0) {
      return errorResponse(res, `User not found: ${reqUser.id}`, 404);
    }
    
    const isComplete = result.rows[0].is_registration_complete;

    // 2. 유저는 있지만 가입이 완료되지 않은 경우 (false, 0, null 등 체크)
    // 명시적으로 true가 아닌 경우를 체크하는 것이 안전합니다.
    if (isComplete !== true && isComplete !== 1) {
      return errorResponse(res, `Registration is not completed for user ${reqUser.id}.`, 403);
    } 

    next();
  } catch (error) {
    console.error('Registration check error:', error);
    // 4. 비동기 에러를 Express 에러 핸들러로 전달하거나 직접 응답
    return errorResponse(res, 'Internal server error during registration check', 500);
  }
};

module.exports = {
  registrationCompleted,
};