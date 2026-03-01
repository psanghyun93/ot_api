var express = require('express');
var router = express.Router();
var { successResponse } = require('../utils/response');

/**
 * @swagger
 * /api:
 *   get:
 *     summary: 환영 엔드포인트
 *     description: 환영 메시지를 반환합니다
 *     tags: [일반]
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: OnlyItems API에 오신 것을 환영합니다
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 */
router.get('/', function(req, res, next) {
  successResponse(res, {
    message: 'OnlyItems API에 오신 것을 환영합니다',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

module.exports = router;
