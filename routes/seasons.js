var express = require('express');
var router = express.Router();
var seasonController = require('../controllers/seasonController');
var { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/seasons:
 *   get:
 *     summary: 모든 시즌 조회
 *     description: 모든 시즌 목록을 조회합니다
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: 시즌 목록 반환
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
 *                     $ref: '#/components/schemas/Season'
 */
router.get('/', seasonController.getAllSeasons.bind(seasonController));

/**
 * @swagger
 * /api/seasons/active:
 *   get:
 *     summary: 활성 시즌 조회
 *     description: 활성화된 시즌(ONGOING 또는 ETERNAL)을 조회합니다
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: 활성 시즌 목록 반환
 */
router.get('/active', seasonController.getActiveSeasons.bind(seasonController));

/**
 * @swagger
 * /api/seasons/stats:
 *   get:
 *     summary: 시즌 통계 조회
 *     description: 시즌 통계를 조회합니다
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: 시즌 통계 반환
 */
router.get('/stats', seasonController.getSeasonStats.bind(seasonController));

/**
 * @swagger
 * /api/seasons/state/{state}:
 *   get:
 *     summary: 상태별 시즌 조회
 *     description: 지정된 상태로 필터링된 시즌 목록을 조회합니다
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ETERNAL, WAITING, ONGOING, ENDED]
 *     responses:
 *       200:
 *         description: 해당 상태의 시즌 목록 반환
 */
router.get('/state/:state', seasonController.getSeasonsByState.bind(seasonController));

/**
 * @swagger
 * /api/seasons/{id}:
 *   get:
 *     summary: ID로 시즌 조회
 *     description: ID로 특정 시즌을 조회합니다
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 시즌 조회 성공
 *       404:
 *         description: 시즌을 찾을 수 없음
 */
router.get('/:id', seasonController.getSeasonById.bind(seasonController));

/**
 * @swagger
 * /api/seasons:
 *   post:
 *     summary: 새 시즌 생성
 *     description: 새로운 시즌을 생성합니다 (인증 필요)
 *     tags: [Seasons]
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
 *               - start_time
 *               - state
 *             properties:
 *               name:
 *                 type: object
 *                 properties:
 *                   ko:
 *                     type: string
 *                   zh:
 *                     type: string
 *                   ja:
 *                     type: string
 *                   en:
 *                     type: string
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               state:
 *                 type: string
 *                 enum: [ETERNAL, WAITING, ONGOING, ENDED]
 *     responses:
 *       201:
 *         description: 시즌 생성 성공
 */
router.post('/', authenticate, seasonController.createSeason.bind(seasonController));

/**
 * @swagger
 * /api/seasons/{id}:
 *   put:
 *     summary: 시즌 수정
 *     description: 기존 시즌을 수정합니다 (인증 필요)
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: object
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               state:
 *                 type: string
 *                 enum: [ETERNAL, WAITING, ONGOING, ENDED]
 *     responses:
 *       200:
 *         description: 시즌 수정 성공
 */
router.put('/:id', authenticate, seasonController.updateSeason.bind(seasonController));

/**
 * @swagger
 * /api/seasons/{id}:
 *   delete:
 *     summary: 시즌 삭제
 *     description: 시즌을 삭제합니다 (인증 필요)
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 시즌 삭제 성공
 */
router.delete('/:id', authenticate, seasonController.deleteSeason.bind(seasonController));

module.exports = router;
