const { successResponse, errorResponse } = require('../utils/response');
const User = require('../models/User');


class UserController {
  /**
   * Get all users
   * @route GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      successResponse(res, users);
    } catch (error) {
      console.error('Error fetching users:', error);
      errorResponse(res, 'Failed to fetch users', 500);
    }
  }

  /**
   * Get user by ID
   * @route GET /api/users/:id
   */
  async getUserById(req, res) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return errorResponse(res, 'Invalid user ID', 400);
      }

      const user = await User.findById(userId);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      successResponse(res, user);
    } catch (error) {
      console.error('Error fetching user:', error);
      errorResponse(res, 'Failed to fetch user', 500);
    }
  }

  /**
   * Complete user registration
   * @route POST /api/users/me/complete-registration
   */
  async completeRegistration(req, res) {
    try {
      const userId = req.user.id;
      const {name, email} = req.body;

      // Validation
      if (!name || !email) {
        return errorResponse(res, 'Name and email are required', 400);
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return errorResponse(res, 'Invalid email format', 400);
      }

      // Check if email already exists (excluding current user)
      const emailExists = await User.emailExists(email, userId);
      if (emailExists) {
        return errorResponse(res, 'Email already exists', 409);
      }

      // Update user and set registration complete flag
      const updatedUser = await User.completeRegistration(userId, {name, email});

      if (!updatedUser) {
        return errorResponse(res, 'Failed to complete registration', 500);
      }

      successResponse(res, updatedUser);
    } catch (error) {
      console.error('Error completing registration:', error);

      // Handle unique constraint violation
      if (error.code === '23505') {
        return errorResponse(res, 'Email already exists', 409);
      }

      errorResponse(res, 'Failed to complete registration', 500);
    }
  }

  /**
   * Check nickname availability
   * @route GET /api/users/check-nickname/:nickname
   */
  async checkNickname(req, res) {
    try {
      const { nickname } = req.params;

      if (!nickname) {
        return errorResponse(res, 'Nickname is required', 400);
      }

      // Nickname validation
      const nicknameRegex = /^[a-zA-Z0-9_가-힣]{2,20}$/;
      if (!nicknameRegex.test(nickname)) {
        return errorResponse(res, 'Nickname must be 2-20 characters (letters, numbers, underscore, Korean allowed)', 400);
      }

      const exists = await User.nicknameExists(nickname);

      successResponse(res, {
        nickname,
        available: !exists,
        message: exists ? 'Nickname is already taken' : 'Nickname is available'
      });
    } catch (error) {
      console.error('Error checking nickname:', error);
      errorResponse(res, 'Failed to check nickname', 500);
    }
  }

  /**
   * Create a new user
   * @route POST /api/users
   */
  async createUser(req, res) {
    try {
      const {name, email} = req.body;

      // Validation
      if (!name || !email) {
        return errorResponse(res, 'Name and email are required', 400);
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return errorResponse(res, 'Invalid email format', 400);
      }

      // Check if email already exists
      const emailExists = await User.emailExists(email);
      if (emailExists) {
        return errorResponse(res, 'Email already exists', 409);
      }

      // Create user
      const newUser = await User.create({name, email});
      successResponse(res, newUser, 201);
    } catch (error) {
      console.error('Error creating user:', error);

      // Handle unique constraint violation
      if (error.code === '23505') {
        return errorResponse(res, 'Email already exists', 409);
      }

      errorResponse(res, 'Failed to create user', 500);
    }
  }


  /**
   * Update a user
   * @route PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      const { name, email, avatarUrl } = req.body;

      if (isNaN(userId)) {
        return errorResponse(res, 'Invalid user ID', 400);
      }

      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return errorResponse(res, 'User not found', 404);
      }

      // Email format validation
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return errorResponse(res, 'Invalid email format', 400);
        }

        // Check if email already exists (excluding current user)
        const emailExists = await User.emailExists(email, userId);
        if (emailExists) {
          return errorResponse(res, 'Email already exists', 409);
        }
      }

      // Update user
      const updatedUser = await User.update(userId, { name, email, avatarUrl });

      if (!updatedUser) {
        return errorResponse(res, 'Failed to update user', 500);
      }

      successResponse(res, updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);

      // Handle unique constraint violation
      if (error.code === '23505') {
        return errorResponse(res, 'Email already exists', 409);
      }

      errorResponse(res, 'Failed to update user', 500);
    }
  }

  /**
   * Delete a user
   * @route DELETE /api/users/:id
   */
  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return errorResponse(res, 'Invalid user ID', 400);
      }

      const deleted = await User.delete(userId);

      if (!deleted) {
        return errorResponse(res, 'User not found', 404);
      }

      successResponse(res, { message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      errorResponse(res, 'Failed to delete user', 500);
    }
  }

  /**
   * Get current user's profile (authenticated)
   * @route GET /api/users/me/profile
   */
  async getMyProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      successResponse(res, user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      errorResponse(res, 'Failed to fetch profile', 500);
    }
  }

  /**
   * Update current user's profile (authenticated)
   * @route PUT /api/users/me/profile
   */
  async updateMyProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, avatarUrl } = req.body;

      const updatedUser = await User.update(userId, { name, avatarUrl });

      if (!updatedUser) {
        return errorResponse(res, 'Failed to update profile', 500);
      }

      successResponse(res, updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      errorResponse(res, 'Failed to update profile', 500);
    }
  }
}

module.exports = new UserController();
