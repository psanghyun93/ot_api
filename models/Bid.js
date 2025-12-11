const db = require('../config/database');

class Bid {
  /**
   * Get all bids with optional filters
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT b.*, 
             so.season, so.item_type, so.category, so.rarity, so.price as order_price,
             seller.name as seller_name, seller.email as seller_email,
             buyer.name as buyer_name, buyer.email as buyer_email
      FROM bids b
      JOIN sell_orders so ON b.order_id = so.id
      JOIN users seller ON b.seller_id = seller.id
      JOIN users buyer ON b.buyer_id = buyer.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.order_id) {
      query += ` AND b.order_id = $${paramCount}`;
      params.push(filters.order_id);
      paramCount++;
    }

    if (filters.seller_id) {
      query += ` AND b.seller_id = $${paramCount}`;
      params.push(filters.seller_id);
      paramCount++;
    }

    if (filters.buyer_id) {
      query += ` AND b.buyer_id = $${paramCount}`;
      params.push(filters.buyer_id);
      paramCount++;
    }

    if (filters.state) {
      query += ` AND b.state = $${paramCount}`;
      params.push(filters.state);
      paramCount++;
    }

    query += ' ORDER BY b.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get bid by ID
   * @param {number} id - Bid ID
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const query = `
      SELECT b.*, 
             so.season, so.item_type, so.category, so.rarity, so.price as order_price,
             seller.name as seller_name, seller.email as seller_email,
             buyer.name as buyer_name, buyer.email as buyer_email
      FROM bids b
      JOIN sell_orders so ON b.order_id = so.id
      JOIN users seller ON b.seller_id = seller.id
      JOIN users buyer ON b.buyer_id = buyer.id
      WHERE b.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get bids by order ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Array>}
   */
  static async findByOrderId(orderId) {
    return this.findAll({ order_id: orderId });
  }

  /**
   * Get bids by seller ID
   * @param {number} sellerId - Seller user ID
   * @returns {Promise<Array>}
   */
  static async findBySellerId(sellerId) {
    return this.findAll({ seller_id: sellerId });
  }

  /**
   * Get bids by buyer ID
   * @param {number} buyerId - Buyer user ID
   * @returns {Promise<Array>}
   */
  static async findByBuyerId(buyerId) {
    return this.findAll({ buyer_id: buyerId });
  }

  /**
   * Get pending bids (WAIT state)
   * @param {number} userId - User ID (seller or buyer)
   * @returns {Promise<Array>}
   */
  static async findPendingByUser(userId) {
    const query = `
      SELECT b.*, 
             so.season, so.item_type, so.category, so.rarity, so.price as order_price,
             seller.name as seller_name, seller.email as seller_email,
             buyer.name as buyer_name, buyer.email as buyer_email
      FROM bids b
      JOIN sell_orders so ON b.order_id = so.id
      JOIN users seller ON b.seller_id = seller.id
      JOIN users buyer ON b.buyer_id = buyer.id
      WHERE (b.seller_id = $1 OR b.buyer_id = $1) AND b.state = 'WAIT'
      ORDER BY b.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  /**
   * Create a new bid
   * @param {Object} bidData - Bid data
   * @returns {Promise<Object>}
   */
  static async create(bidData) {
    const {
      order_id,
      seller_id,
      seller_nickname,
      buyer_id,
      buyer_nickname,
      price
    } = bidData;

    const query = `
      INSERT INTO bids (
        order_id, seller_id, seller_nickname, buyer_id, buyer_nickname, price
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await db.query(query, [
      order_id,
      seller_id,
      seller_nickname,
      buyer_id,
      buyer_nickname,
      price
    ]);

    return result.rows[0];
  }

  /**
   * Update bid state
   * @param {number} id - Bid ID
   * @param {string} state - New state
   * @returns {Promise<Object|null>}
   */
  static async updateState(id, state) {
    const query = `
      UPDATE bids
      SET state = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [state, id]);
    return result.rows[0] || null;
  }

  /**
   * Update a bid
   * @param {number} id - Bid ID
   * @param {Object} bidData - Bid data to update
   * @returns {Promise<Object|null>}
   */
  static async update(id, bidData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['price', 'state'];

    allowedFields.forEach(field => {
      if (bidData[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(bidData[field]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE bids
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a bid
   * @param {number} id - Bid ID
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const query = 'DELETE FROM bids WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Get bid statistics
   * @returns {Promise<Object>}
   */
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_bids,
        COUNT(CASE WHEN state = 'WAIT' THEN 1 END) as waiting_bids,
        COUNT(CASE WHEN state = 'ACCEPT' THEN 1 END) as accepted_bids,
        COUNT(CASE WHEN state = 'REJECT' THEN 1 END) as rejected_bids,
        COUNT(CASE WHEN state = 'CANCEL' THEN 1 END) as cancelled_bids,
        COUNT(CASE WHEN state = 'COMPLETED' THEN 1 END) as completed_bids,
        AVG(price) as average_bid_price,
        MAX(price) as max_bid_price,
        MIN(price) as min_bid_price
      FROM bids
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  /**
   * Check if user can bid on order
   * @param {number} userId - User ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} {canBid: boolean, reason: string}
   */
  static async canUserBid(userId, orderId) {
    // Check if user is not the seller
    const orderQuery = 'SELECT seller_id FROM sell_orders WHERE id = $1';
    const orderResult = await db.query(orderQuery, [orderId]);

    if (!orderResult.rows[0]) {
      return { canBid: false, reason: 'Order not found' };
    }

    if (orderResult.rows[0].seller_id === userId) {
      return { canBid: false, reason: 'Cannot bid on your own order' };
    }

    // Check if user already has a WAIT or ACCEPT bid
    const bidQuery = `
      SELECT id, state FROM bids 
      WHERE order_id = $1 AND buyer_id = $2 AND state IN ('WAIT', 'ACCEPT')
    `;
    const bidResult = await db.query(bidQuery, [orderId, userId]);

    if (bidResult.rows.length > 0) {
      const state = bidResult.rows[0].state;
      return { 
        canBid: false, 
        reason: `You already have a ${state === 'WAIT' ? 'pending' : 'accepted'} bid on this order` 
      };
    }

    return { canBid: true };
  }

  /**
   * Check if user has bid on this order before
   * @param {number} userId - User ID
   * @param {number} orderId - Order ID
   * @returns {Promise<boolean>}
   */
  static async hasUserBidBefore(userId, orderId) {
    const query = `
      SELECT id FROM bids 
      WHERE order_id = $1 AND buyer_id = $2
      LIMIT 1
    `;
    const result = await db.query(query, [orderId, userId]);
    return result.rows.length > 0;
  }
}

module.exports = Bid;
