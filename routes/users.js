const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 모든 사용자 조회
 *     description: 데이터베이스에서 모든 사용자 목록을 가져옵니다
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, userController.getAllUsers.bind(userController));

/**
 * @swagger
 * /api/users/check-nickname/{nickname}:
 *   get:
 *     summary: 닉네임 사용 가능 여부 확인
 *     description: 등록 가능한 닉네임인지 확인합니다
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: nickname
 *         required: true
 *         schema:
 *           type: string
 *         description: Nickname to check
 *     responses:
 *       200:
 *         description: Nickname check result
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
 *                     nickname:
 *                       type: string
 *                     available:
 *                       type: boolean
 *                     message:
 *                       type: string
 *       400:
 *         description: Invalid nickname format
 */
router.get('/check-nickname/:nickname', userController.checkNickname.bind(userController));

/**
 * @swagger
 * /api/users/me/profile:
 *   get:
 *     summary: 내 프로필을 조회합니다
 *     description: 현재 인증된 사용자의 프로필을 조회합니다
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/me/profile', authenticate, userController.getMyProfile.bind(userController));

/**
 * @swagger
 * /api/users/me/profile:
 *   put:
 *     summary: 내 프로필을 업데이트합니다
 *     description: 현재 인증된 사용자의 프로필을 업데이트합니다
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
router.put('/me/profile', authenticate, userController.updateMyProfile.bind(userController));

/**
 * @swagger
 * /api/users/me/complete-registration:
 *   post:
 *     summary: 사용자 등록을 완료합니다
 *     description: 등록 절차를 완료하기 위해 추가 정보를 제출합니다
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Registration completed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Email already exists
 */
router.post('/me/complete-registration', authenticate, userController.completeRegistration.bind(userController));

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 새로운 사용자를 생성합니다
 *     description: 제공된 정보를 사용하여 데이터베이스에 새로운 사용자를 생성합니다 (관리자 전용)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - nickname
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               nickname:
 *                 type: string
 *                 example: player123
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, userController.createUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: 사용자를 삭제합니다
 *     description: 관리자 권한으로 사용자 ID를 통해 데이터베이스에서 사용자를 삭제합니다
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                       example: User deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticate, userController.deleteUser.bind(userController));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: 출석 기록 생성(체크인)
 *     description: 출석을 기록하고, 유저 등급 또는 연속 출석일수에 따라 Mana를 지급합니다
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User checkin successfully
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
 *                       example: User checkin successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/checkin', authenticate, registrationCompleted, userController.checkin.bind(userController));

module.exports = router;
