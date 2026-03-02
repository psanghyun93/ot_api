const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {registrationCompleted} = require("../middleware/user");

/**
 * @swagger
 * tags:
 *   name: 인증
 *   description: 인증 및 권한 관련 엔드포인트
 */

/**
 * @swagger
 * /api/auth/blizzard:
 *   get:
 *     summary: Blizzard OAuth 로그인 시작
 *     description: Blizzard OAuth 인증 URL을 생성합니다. 서버는 `APP_BASE_URL` 환경 변수 또는 요청 호스트 값을 기준으로 리디렉트 URI를 설정합니다.
 *     tags: [인증]
 *     responses:
 *       200:
 *         description: 인증 URL 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       example: https://oauth.battle.net/oauth/authorize?client_id=...&redirect_uri=...
 *                     state:
 *                       type: string
 */
router.get('/blizzard', authController.blizzardLogin.bind(authController));

/**
 * @swagger
 * /api/auth/blizzard/callback:
 *   get:
 *     summary: Blizzard OAuth 콜백
 *     description: Blizzard에서 발급한 인증코드를 받아 토큰 교환 및 사용자 인증을 수행합니다
 *     tags: [인증]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Blizzard에서 발급한 인증 코드
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: CSRF 보호를 위한 상태 파라미터
 *     responses:
 *       200:
 *         description: 인증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     user:
 *                       type: object
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *                         expiresIn:
 *                           type: string
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 인증 처리 실패
 */
router.get('/blizzard/callback', authController.blizzardCallback.bind(authController));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 액세스 토큰 갱신
 *     description: 리프레시 토큰으로 새로운 액세스 토큰을 발급합니다
 *     tags: [인증]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *       400:
 *         description: 리프레시 토큰 필수
 *       401:
 *         description: 유효하지 않거나 만료된 리프레시 토큰
 */
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 로그인 사용자 조회
 *     description: 인증된 사용자의 정보를 반환합니다
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 필요
 *       404:
 *         description: 사용자 없음
 */
router.get('/me', authenticate, registrationCompleted, authController.getMe.bind(authController));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 현재 로그인된 사용자를 로그아웃합니다
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *       401:
 *         description: 인증 필요
 */
router.post('/logout', authenticate, authController.logout.bind(authController));

module.exports = router;