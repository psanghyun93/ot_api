var express = require('express');
var router = express.Router();
var { successResponse } = require('../utils/response');

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Welcome endpoint
 *     description: Returns a welcome message
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Success
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
 *                       example: Welcome to AI Test API
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 */
router.get('/', function(req, res, next) {
  successResponse(res, {
    message: 'Welcome to AI Test API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

module.exports = router;
