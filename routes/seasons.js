var express = require('express');
var router = express.Router();
var seasonController = require('../controllers/seasonController');
var { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/seasons:
 *   get:
 *     summary: Get all seasons
 *     description: Retrieve a list of all seasons
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: List of seasons
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
 *     summary: Get active seasons
 *     description: Retrieve all active seasons (ONGOING or ETERNAL)
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: List of active seasons
 */
router.get('/active', seasonController.getActiveSeasons.bind(seasonController));

/**
 * @swagger
 * /api/seasons/stats:
 *   get:
 *     summary: Get season statistics
 *     description: Get statistics about seasons
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: Season statistics
 */
router.get('/stats', seasonController.getSeasonStats.bind(seasonController));

/**
 * @swagger
 * /api/seasons/state/{state}:
 *   get:
 *     summary: Get seasons by state
 *     description: Retrieve seasons filtered by state
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
 *         description: List of seasons with the specified state
 */
router.get('/state/:state', seasonController.getSeasonsByState.bind(seasonController));

/**
 * @swagger
 * /api/seasons/{id}:
 *   get:
 *     summary: Get season by ID
 *     description: Retrieve a single season by ID
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Season found
 *       404:
 *         description: Season not found
 */
router.get('/:id', seasonController.getSeasonById.bind(seasonController));

/**
 * @swagger
 * /api/seasons:
 *   post:
 *     summary: Create a new season
 *     description: Create a new season (requires authentication)
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
 *         description: Season created successfully
 */
router.post('/', authenticate, seasonController.createSeason.bind(seasonController));

/**
 * @swagger
 * /api/seasons/{id}:
 *   put:
 *     summary: Update a season
 *     description: Update an existing season (requires authentication)
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
 *         description: Season updated successfully
 */
router.put('/:id', authenticate, seasonController.updateSeason.bind(seasonController));

/**
 * @swagger
 * /api/seasons/{id}:
 *   delete:
 *     summary: Delete a season
 *     description: Delete a season (requires authentication)
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
 *         description: Season deleted successfully
 */
router.delete('/:id', authenticate, seasonController.deleteSeason.bind(seasonController));

module.exports = router;
