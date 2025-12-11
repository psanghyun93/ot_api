const { successResponse, errorResponse } = require('../utils/response');
const Season = require('../models/Season');

// Valid season states
const VALID_STATES = ['ETERNAL', 'WAITING', 'ONGOING', 'ENDED'];

class SeasonController {
  /**
   * Get all seasons
   * @route GET /api/seasons
   */
  async getAllSeasons(req, res) {
    try {
      const seasons = await Season.findAll();
      successResponse(res, seasons);
    } catch (error) {
      console.error('Error fetching seasons:', error);
      errorResponse(res, 'Failed to fetch seasons', 500);
    }
  }

  /**
   * Get active seasons
   * @route GET /api/seasons/active
   */
  async getActiveSeasons(req, res) {
    try {
      const seasons = await Season.findActive();
      successResponse(res, seasons);
    } catch (error) {
      console.error('Error fetching active seasons:', error);
      errorResponse(res, 'Failed to fetch active seasons', 500);
    }
  }

  /**
   * Get season by ID
   * @route GET /api/seasons/:id
   */
  async getSeasonById(req, res) {
    try {
      const seasonId = parseInt(req.params.id);

      if (isNaN(seasonId)) {
        return errorResponse(res, 'Invalid season ID', 400);
      }

      const season = await Season.findById(seasonId);

      if (!season) {
        return errorResponse(res, 'Season not found', 404);
      }

      successResponse(res, season);
    } catch (error) {
      console.error('Error fetching season:', error);
      errorResponse(res, 'Failed to fetch season', 500);
    }
  }

  /**
   * Get seasons by state
   * @route GET /api/seasons/state/:state
   */
  async getSeasonsByState(req, res) {
    try {
      const state = req.params.state.toUpperCase();

      if (!VALID_STATES.includes(state)) {
        return errorResponse(res, `Invalid state. Must be one of: ${VALID_STATES.join(', ')}`, 400);
      }

      const seasons = await Season.findByState(state);
      successResponse(res, seasons);
    } catch (error) {
      console.error('Error fetching seasons by state:', error);
      errorResponse(res, 'Failed to fetch seasons', 500);
    }
  }

  /**
   * Create a new season
   * @route POST /api/seasons
   */
  async createSeason(req, res) {
    try {
      const { name, start_time, end_time, state } = req.body;

      // Validation
      if (!name || !name.ko || !name.zh || !name.ja || !name.en) {
        return errorResponse(res, 'Name must include all languages (ko, zh, ja, en)', 400);
      }

      if (!start_time) {
        return errorResponse(res, 'Start time is required', 400);
      }

      if (!state || !VALID_STATES.includes(state)) {
        return errorResponse(res, `State must be one of: ${VALID_STATES.join(', ')}`, 400);
      }

      // Validate time range
      if (end_time && new Date(end_time) <= new Date(start_time)) {
        return errorResponse(res, 'End time must be after start time', 400);
      }

      const newSeason = await Season.create({
        name,
        start_time,
        end_time: end_time || null,
        state
      });

      successResponse(res, newSeason, 201);
    } catch (error) {
      console.error('Error creating season:', error);
      errorResponse(res, 'Failed to create season', 500);
    }
  }

  /**
   * Update a season
   * @route PUT /api/seasons/:id
   */
  async updateSeason(req, res) {
    try {
      const seasonId = parseInt(req.params.id);
      const { name, start_time, end_time, state } = req.body;

      if (isNaN(seasonId)) {
        return errorResponse(res, 'Invalid season ID', 400);
      }

      // Check if season exists
      const existingSeason = await Season.findById(seasonId);
      if (!existingSeason) {
        return errorResponse(res, 'Season not found', 404);
      }

      // Validation
      if (name && (!name.ko || !name.zh || !name.ja || !name.en)) {
        return errorResponse(res, 'Name must include all languages (ko, zh, ja, en)', 400);
      }

      if (state && !VALID_STATES.includes(state)) {
        return errorResponse(res, `State must be one of: ${VALID_STATES.join(', ')}`, 400);
      }

      // Validate time range if both times are provided
      const newStartTime = start_time || existingSeason.start_time;
      const newEndTime = end_time !== undefined ? end_time : existingSeason.end_time;

      if (newEndTime && new Date(newEndTime) <= new Date(newStartTime)) {
        return errorResponse(res, 'End time must be after start time', 400);
      }

      const updatedSeason = await Season.update(seasonId, {
        name,
        start_time,
        end_time,
        state
      });

      if (!updatedSeason) {
        return errorResponse(res, 'Failed to update season', 500);
      }

      successResponse(res, updatedSeason);
    } catch (error) {
      console.error('Error updating season:', error);
      errorResponse(res, 'Failed to update season', 500);
    }
  }

  /**
   * Delete a season
   * @route DELETE /api/seasons/:id
   */
  async deleteSeason(req, res) {
    try {
      const seasonId = parseInt(req.params.id);

      if (isNaN(seasonId)) {
        return errorResponse(res, 'Invalid season ID', 400);
      }

      const deleted = await Season.delete(seasonId);

      if (!deleted) {
        return errorResponse(res, 'Season not found', 404);
      }

      successResponse(res, { message: 'Season deleted successfully' });
    } catch (error) {
      console.error('Error deleting season:', error);
      errorResponse(res, 'Failed to delete season', 500);
    }
  }

  /**
   * Get season statistics
   * @route GET /api/seasons/stats
   */
  async getSeasonStats(req, res) {
    try {
      const stats = await Season.getStats();
      successResponse(res, stats);
    } catch (error) {
      console.error('Error fetching season stats:', error);
      errorResponse(res, 'Failed to fetch season statistics', 500);
    }
  }
}

module.exports = new SeasonController();
