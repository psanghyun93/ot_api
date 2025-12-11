var express = require('express');
var router = express.Router();
var sellOrderController = require('../controllers/sellOrderController');
var { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/sell-orders:
 *   get:
 *     summary: Get all sell orders
 *     description: Retrieve sell orders with optional filters
 *     tags: [SellOrders]
 *     parameters:
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *       - in: query
 *         name: item_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, SOLD, CANCELLED, EXPIRED]
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of sell orders
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
 *                     $ref: '#/components/schemas/SellOrder'
 */
router.get('/', sellOrderController.getAllOrders.bind(sellOrderController));

/**
 * @swagger
 * /api/sell-orders/active:
 *   get:
 *     summary: Get active sell orders
 *     description: Retrieve all active sell orders with optional filters
 *     tags: [SellOrders]
 *     parameters:
 *       - in: query
 *         name: season
 *         schema:
 *           type: string
 *       - in: query
 *         name: item_type
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of active sell orders
 */
router.get('/active', sellOrderController.getActiveOrders.bind(sellOrderController));

/**
 * @swagger
 * /api/sell-orders/my-orders:
 *   get:
 *     summary: Get my sell orders
 *     description: Retrieve all sell orders created by the authenticated user
 *     tags: [SellOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my sell orders
 *       401:
 *         description: Unauthorized
 */
router.get('/my-orders', authenticate, sellOrderController.getMyOrders.bind(sellOrderController));

/**
 * @swagger
 * /api/sell-orders/stats:
 *   get:
 *     summary: Get sell order statistics
 *     description: Get statistics about sell orders
 *     tags: [SellOrders]
 *     responses:
 *       200:
 *         description: Sell order statistics
 */
router.get('/stats', sellOrderController.getStats.bind(sellOrderController));

/**
 * @swagger
 * /api/sell-orders/{id}:
 *   get:
 *     summary: Get sell order by ID
 *     description: Retrieve a single sell order by ID
 *     tags: [SellOrders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sell order found
 *       404:
 *         description: Sell order not found
 */
router.get('/:id', sellOrderController.getOrderById.bind(sellOrderController));

/**
 * @swagger
 * /api/sell-orders:
 *   post:
 *     summary: Create a new sell order
 *     description: Create a new sell order (requires authentication)
 *     tags: [SellOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - season
 *               - item_type
 *               - price
 *               - bid_policy
 *             properties:
 *               season:
 *                 type: string
 *                 example: Season 3
 *               item_type:
 *                 type: string
 *                 example: EQUIPMENT
 *               category:
 *                 type: string
 *                 example: WEAPON
 *               sub_category:
 *                 type: string
 *                 example: SWORD
 *               rarity:
 *                 type: string
 *                 example: LEGENDARY
 *               grade:
 *                 type: string
 *                 example: SACRED
 *               greater_affixes:
 *                 type: integer
 *                 example: 2
 *               affixes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     value:
 *                       type: number
 *               aspect_id:
 *                 type: string
 *               aspect:
 *                 type: array
 *                 items:
 *                   type: number
 *               seller_message:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 5000000
 *               bid_policy:
 *                 type: string
 *                 enum: [FIXED, NEGOTIABLE, AUCTION]
 *     responses:
 *       201:
 *         description: Sell order created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, sellOrderController.createOrder.bind(sellOrderController));

/**
 * @swagger
 * /api/sell-orders/{id}:
 *   put:
 *     summary: Update a sell order
 *     description: Update an existing sell order (only owner can update)
 *     tags: [SellOrders]
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
 *               price:
 *                 type: number
 *               seller_message:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, SOLD, CANCELLED, EXPIRED]
 *               bid_policy:
 *                 type: string
 *                 enum: [FIXED, NEGOTIABLE, AUCTION]
 *     responses:
 *       200:
 *         description: Sell order updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Sell order not found
 */
router.put('/:id', authenticate, sellOrderController.updateOrder.bind(sellOrderController));

/**
 * @swagger
 * /api/sell-orders/{id}/cancel:
 *   post:
 *     summary: Cancel a sell order
 *     description: Cancel an active sell order (only owner can cancel)
 *     tags: [SellOrders]
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
 *         description: Sell order cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Sell order not found
 */
router.post('/:id/cancel', authenticate, sellOrderController.cancelOrder.bind(sellOrderController));

/**
 * @swagger
 * /api/sell-orders/{id}:
 *   delete:
 *     summary: Delete a sell order
 *     description: Delete a sell order (only owner can delete)
 *     tags: [SellOrders]
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
 *         description: Sell order deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Sell order not found
 */
router.delete('/:id', authenticate, sellOrderController.deleteOrder.bind(sellOrderController));

module.exports = router;
