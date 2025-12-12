const { successResponse, errorResponse } = require('../utils/response');
const User = require('../models/User');
const CheckIn = require("../models/CheckIn");
const dayjs = require("dayjs");
const {MANA_REWARD} = require("../config/appPolicy");


class UserController {
  /**
   * Get all users
   * @route GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      successResponse(res, req.user);
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


  /**
   * 로그인 후 체크인
   *
   * 체크인을 위해 호출되는 라우터
   * 체크인은 UTC 00:00:00~23:59:59 사이에만 한번만 가능하다.
   * todo
   * 1. 어제까지 이틀동안의 체크인 기록을 조회한다.
   * 2. 어제 체크인을 했는지 확인한다.
   * 3. 어제 체크인을 했다면 오늘 체크인을 할 수 있는지 확인한다.
   * 4. 어제 체크인 정보가 있고 오늘 체크인을 할 수 있다면 연속 체크인 날짜를 증가시킨다.
   * 5. 어제 체크인 정보가 없다면 연속 체크인 날짜를 1로 초기화한다.
   * 6. 체크인 날짜를 기록한다.
   * 7. 체크인 성공 시 200 응답을 반환한다.
   * 8. 체크인 실패 시 400 응답을 반환한다.
   * 9. 체크인에 성공하면 마나를 증가시킨다.
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  async checkin(req, res) {
    try {
      const userId = req.user.id;
      const checkin = await CheckIn.findByUserId(userId);

      const checkinDate = dayjs(checkin.date)
      const isOneday = dayjs().diff(checkinDate, 'days') > 1;
      if(!isOneday) {
        const result = await CheckIn.reset(userId);
        return successResponse(result, "Reset User checkin record");
      }

      checkin.date= dayjs().toDate();
      checkin.streak+=1;

      // 연속 로그인일자에 따라 리워드 지급
      let checkinReward= MANA_REWARD.DEFAULT;
      switch (checkin.streak) {
        case 7: checkinReward=MANA_REWARD.D7; break;
        case 30: checkinReward=MANA_REWARD.D30; break;
      }

      try {
        // 체크인 기록
        const checkinResult = await CheckIn.record(userId, checkin);
        if (!checkinResult) return errorResponse(checkinResult, "Check-in failed", 400);

        // 체크인 성공시 마나 제공
        const manaResult = await User.increaseMana(userId, checkinReward);
        return successResponse(manaResult, "Record User checkin");
      } catch (err) {
        return errorResponse("Error while recording checkin", err);
      }

    } catch (error) {
      console.error('Error checking user:', error, 500);
    }
  }
}

module.exports = new UserController();
