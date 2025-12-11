const { successResponse, errorResponse } = require('../utils/response');
const SellOrder = require('../models/SellOrder');

// Valid values
const VALID_STATUSES = ['ON_SALE', 'IN_TRANSACTION', 'SOLD_OUT', 'EXPIRED', 'CANCELLED'];
const VALID_BID_POLICIES = ['FREE', 'FIXED', 'OFFER'];

class SellOrderController {
  /**
   * Get all sell orders with optional filters
   * @route GET /api/sell-orders
   */
  async getAllOrders(req, res) {
    try {
      const filters = {
        season: req.query.season,
        item_type: req.query.item_type,
        category: req.query.category,
        rarity: req.query.rarity,
        status: req.query.status,
        min_price: req.query.min_price,
        max_price: req.query.max_price,
        seller_id: req.query.seller_id
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );

      const orders = await SellOrder.findAll(filters);
      successResponse(res, orders);
    } catch (error) {
      console.error('Error fetching sell orders:', error);
      errorResponse(res, 'Failed to fetch sell orders', 500);
    }
  }

  /**
   * Get active sell orders
   * @route GET /api/sell-orders/active
   */
  async getActiveOrders(req, res) {
    try {
      const filters = {
        season: req.query.season,
        item_type: req.query.item_type,
        category: req.query.category,
        rarity: req.query.rarity
      };

      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );

      const orders = await SellOrder.findActive(filters);
      successResponse(res, orders);
    } catch (error) {
      console.error('Error fetching active orders:', error);
      errorResponse(res, 'Failed to fetch active orders', 500);
    }
  }

  /**
   * Get sell order by ID
   * @route GET /api/sell-orders/:id
   */
  async getOrderById(req, res) {
    try {
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return errorResponse(res, 'Invalid order ID', 400);
      }

      const order = await SellOrder.findById(orderId);

      if (!order) {
        return errorResponse(res, 'Order not found', 404);
      }

      successResponse(res, order);
    } catch (error) {
      console.error('Error fetching order:', error);
      errorResponse(res, 'Failed to fetch order', 500);
    }
  }

  /**
   * Get my sell orders
   * @route GET /api/sell-orders/my-orders
   */
  async getMyOrders(req, res) {
    try {
      const sellerId = req.user.id;
      const orders = await SellOrder.findBySeller(sellerId);
      successResponse(res, orders);
    } catch (error) {
      console.error('Error fetching my orders:', error);
      errorResponse(res, 'Failed to fetch your orders', 500);
    }
  }

  /**
   * 판매 주문 생성
   * Create a new sell order
   * @route POST /api/sell-orders
   */
  async createOrder(req, res) {
    try {
      const {
        season, item_type, category, sub_category, rarity, grade,
        greater_affixes, affixes, aspect_id, aspect,
        seller_message, price, bid_policy
      } = req.body;

      // Validation
      if (!season || !item_type || !price || !bid_policy) {
        return errorResponse(res, 'Season, item_type, price, and bid_policy are required', 400);
      }

      if (!VALID_BID_POLICIES.includes(bid_policy)) {
        return errorResponse(res, `Bid policy must be one of: ${VALID_BID_POLICIES.join(', ')}`, 400);
      }

      if (price < 0) {
        return errorResponse(res, 'Price must be greater than or equal to 0', 400);
      }

      const seller_id = req.user.id;

      const newOrder = await SellOrder.create({
        season, item_type, category, sub_category, rarity, grade,
        greater_affixes, affixes, aspect_id, aspect,
        seller_message, price, bid_policy, seller_id
      });

      successResponse(res, newOrder, 201);
    } catch (error) {
      console.error('Error creating order:', error);
      errorResponse(res, 'Failed to create order', 500);
    }
  }

  /**
   * Update a sell order
   * @route PUT /api/sell-orders/:id
   */
  async updateOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(orderId)) {
        return errorResponse(res, 'Invalid order ID', 400);
      }

      // Check if order exists and belongs to user
      const existingOrder = await SellOrder.findById(orderId);
      if (!existingOrder) {
        return errorResponse(res, 'Order not found', 404);
      }

      if (existingOrder.seller_id !== userId) {
        return errorResponse(res, 'You can only update your own orders', 403);
      }

      // Validate bid_policy if provided
      if (req.body.bid_policy && !VALID_BID_POLICIES.includes(req.body.bid_policy)) {
        return errorResponse(res, `Bid policy must be one of: ${VALID_BID_POLICIES.join(', ')}`, 400);
      }

      // Validate status if provided
      if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
        return errorResponse(res, `Status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
      }

      // Validate price if provided
      if (req.body.price !== undefined && req.body.price < 0) {
        return errorResponse(res, 'Price must be greater than or equal to 0', 400);
      }

      const updatedOrder = await SellOrder.update(orderId, req.body);

      if (!updatedOrder) {
        return errorResponse(res, 'Failed to update order', 500);
      }

      successResponse(res, updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      errorResponse(res, 'Failed to update order', 500);
    }
  }

  /**
   * Cancel a sell order
   * @route POST /api/sell-orders/:id/cancel
   */
  async cancelOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(orderId)) {
        return errorResponse(res, 'Invalid order ID', 400);
      }

      const existingOrder = await SellOrder.findById(orderId);
      if (!existingOrder) {
        return errorResponse(res, 'Order not found', 404);
      }

      if (existingOrder.seller_id !== userId) {
        return errorResponse(res, 'You can only cancel your own orders', 403);
      }

      if (existingOrder.status !== 'ON_SALE') {
        return errorResponse(res, 'Only orders on sale can be cancelled', 400);
      }

      const updatedOrder = await SellOrder.updateStatus(orderId, 'CANCELLED');
      successResponse(res, updatedOrder);
    } catch (error) {
      console.error('Error cancelling order:', error);
      errorResponse(res, 'Failed to cancel order', 500);
    }
  }

  /**
   * Delete a sell order
   * @route DELETE /api/sell-orders/:id
   */
  async deleteOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(orderId)) {
        return errorResponse(res, 'Invalid order ID', 400);
      }

      const existingOrder = await SellOrder.findById(orderId);
      if (!existingOrder) {
        return errorResponse(res, 'Order not found', 404);
      }

      if (existingOrder.seller_id !== userId) {
        return errorResponse(res, 'You can only delete your own orders', 403);
      }

      const deleted = await SellOrder.delete(orderId);

      if (!deleted) {
        return errorResponse(res, 'Failed to delete order', 500);
      }

      successResponse(res, { message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Error deleting order:', error);
      errorResponse(res, 'Failed to delete order', 500);
    }
  }

  /**
   * Get sell order statistics
   * @route GET /api/sell-orders/stats
   */
  async getStats(req, res) {
    try {
      const stats = await SellOrder.getStats();
      successResponse(res, stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      errorResponse(res, 'Failed to fetch statistics', 500);
    }
  }
}

module.exports = new SellOrderController();
