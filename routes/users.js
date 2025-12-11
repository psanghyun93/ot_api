var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
var { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users from database
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
 *     summary: Check nickname availability
 *     description: Check if a nickname is available for registration
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
 *     summary: Get my profile
 *     description: Get current authenticated user's profile
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
 *     summary: Update my profile
 *     description: Update current authenticated user's profile
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
 *     summary: Complete user registration
 *     description: Submit additional information to complete registration process
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
 *     summary: Create a new user
 *     description: Create a new user with the provided information in database (Admin only)
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
 *     summary: Delete a user
 *     description: Delete a user by their ID from database (Admin only)
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

module.exports = router;
