var express = require('express');
var router = express.Router();
var bidController = require('../controllers/bidController');
var { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/bids:
 *   get:
 *     summary: Get all bids
 *     description: Retrieve bids with optional filters
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: order_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: seller_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: buyer_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           enum: [WAIT, ACCEPT, REJECT, CANCEL, COMPLETED]
 *     responses:
 *       200:
 *         description: List of bids
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, bidController.getAllBids.bind(bidController));

/**
 * @swagger
 * /api/bids/my-bids:
 *   get:
 *     summary: Get my bids
 *     description: Retrieve all bids created by the authenticated user (as buyer)
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my bids
 *       401:
 *         description: Unauthorized
 */
router.get('/my-bids', authenticate, bidController.getMyBids.bind(bidController));

/**
 * @swagger
 * /api/bids/received:
 *   get:
 *     summary: Get received bids
 *     description: Retrieve all bids received by the authenticated user (as seller)
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received bids
 *       401:
 *         description: Unauthorized
 */
router.get('/received', authenticate, bidController.getReceivedBids.bind(bidController));

/**
 * @swagger
 * /api/bids/pending:
 *   get:
 *     summary: Get pending bids
 *     description: Retrieve all pending bids for the authenticated user
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending bids
 *       401:
 *         description: Unauthorized
 */
router.get('/pending', authenticate, bidController.getPendingBids.bind(bidController));

/**
 * @swagger
 * /api/bids/stats:
 *   get:
 *     summary: Get bid statistics
 *     description: Get statistics about bids
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bid statistics
 */
router.get('/stats', authenticate, bidController.getStats.bind(bidController));

/**
 * @swagger
 * /api/bids/order/{orderId}:
 *   get:
 *     summary: Get bids by order ID
 *     description: Retrieve all bids for a specific order
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of bids for the order
 */
router.get('/order/:orderId', authenticate, bidController.getBidsByOrder.bind(bidController));

/**
 * @swagger
 * /api/bids/{id}:
 *   get:
 *     summary: Get bid by ID
 *     description: Retrieve a single bid by ID
 *     tags: [Bids]
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
 *         description: Bid found
 *       404:
 *         description: Bid not found
 */
router.get('/:id', authenticate, bidController.getBidById.bind(bidController));

/**
 * @swagger
 * /api/bids:
 *   post:
 *     summary: Create a new bid
 *     description: Create a new bid on a sell order (requires authentication)
 *     tags: [Bids]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - price
 *             properties:
 *               order_id:
 *                 type: integer
 *                 example: 1
 *               price:
 *                 type: number
 *                 example: 4500000
 *     responses:
 *       201:
 *         description: Bid created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/', authenticate, bidController.createBid.bind(bidController));

/**
 * @swagger
 * /api/bids/{id}/accept:
 *   post:
 *     summary: Accept a bid
 *     description: Accept a pending bid (only seller can accept)
 *     tags: [Bids]
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
 *         description: Bid accepted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Bid not found
 */
router.post('/:id/accept', authenticate, bidController.acceptBid.bind(bidController));

/**
 * @swagger
 * /api/bids/{id}/reject:
 *   post:
 *     summary: Reject a bid
 *     description: Reject a pending bid (only seller can reject)
 *     tags: [Bids]
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
 *         description: Bid rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Bid not found
 */
router.post('/:id/reject', authenticate, bidController.rejectBid.bind(bidController));

/**
 * @swagger
 * /api/bids/{id}/cancel:
 *   post:
 *     summary: Cancel a bid
 *     description: Cancel a pending bid (only buyer can cancel)
 *     tags: [Bids]
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
 *         description: Bid cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Bid not found
 */
router.post('/:id/cancel', authenticate, bidController.cancelBid.bind(bidController));

/**
 * @swagger
 * /api/bids/{id}:
 *   delete:
 *     summary: Delete a bid
 *     description: Delete a bid (only buyer can delete their own bid)
 *     tags: [Bids]
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
 *         description: Bid deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Bid not found
 */
router.delete('/:id', authenticate, bidController.deleteBid.bind(bidController));

module.exports = router;
