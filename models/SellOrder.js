const db = require('../config/database');

class SellOrder {
  /**
   * Get all sell orders
   * @returns {Promise<Array>}
   */
  static async findAll(filters = {}) {
    let query = `
      SELECT so.*, u.name as seller_name, u.nickname as seller_nickname
      FROM sell_orders so
      JOIN users u ON so.seller_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Apply filters
    if (filters.season) {
      query += ` AND so.season = $${paramCount}`;
      params.push(filters.season);
      paramCount++;
    }

    if (filters.item_type) {
      query += ` AND so.item_type = $${paramCount}`;
      params.push(filters.item_type);
      paramCount++;
    }

    if (filters.category) {
      query += ` AND so.category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters.rarity) {
      query += ` AND so.rarity = $${paramCount}`;
      params.push(filters.rarity);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND so.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.min_price) {
      query += ` AND so.price >= $${paramCount}`;
      params.push(filters.min_price);
      paramCount++;
    }

    if (filters.max_price) {
      query += ` AND so.price <= $${paramCount}`;
      params.push(filters.max_price);
      paramCount++;
    }

    if (filters.seller_id) {
      query += ` AND so.seller_id = $${paramCount}`;
      params.push(filters.seller_id);
      paramCount++;
    }

    query += ' ORDER BY so.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get sell order by ID
   * @param {number} id - Order ID
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const query = `
      SELECT so.*, u.name as seller_name, u.nickname as seller_nickname
      FROM sell_orders so
      JOIN users u ON so.seller_id = u.id
      WHERE so.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Get active sell orders (ON_SALE status)
   * @returns {Promise<Array>}
   */
  static async findActive(filters = {}) {
    return this.findAll({ ...filters, status: 'ON_SALE' });
  }

  /**
   * Get sell orders by seller
   * @param {number} sellerId - Seller user ID
   * @returns {Promise<Array>}
   */
  static async findBySeller(sellerId) {
    return this.findAll({ seller_id: sellerId });
  }

  /**
   * Create a new sell order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>}
   */
  static async create(orderData) {
    const {
      season,
      item_type,
      category,
      sub_category,
      rarity,
      grade,
      greater_affixes,
      affixes,
      aspect_id,
      aspect,
      seller_message,
      price,
      bid_policy,
      seller_id
    } = orderData;

    const query = `
      INSERT INTO sell_orders (
        season, item_type, category, sub_category, rarity, grade,
        greater_affixes, affixes, aspect_id, aspect,
        seller_message, price, bid_policy, seller_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const result = await db.query(query, [
      season,
      item_type,
      category,
      sub_category || null,
      rarity || null,
      grade || null,
      greater_affixes || 0,
      JSON.stringify(affixes || []),
      aspect_id || null,
      JSON.stringify(aspect || []),
      seller_message || null,
      price,
      bid_policy,
      seller_id
    ]);

    return result.rows[0];
  }

  /**
   * Update a sell order
   * @param {number} id - Order ID
   * @param {Object} orderData - Order data to update
   * @returns {Promise<Object|null>}
   */
  static async update(id, orderData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'season', 'item_type', 'category', 'sub_category', 'rarity', 'grade',
      'greater_affixes', 'affixes', 'aspect_id', 'aspect',
      'seller_message', 'price', 'bid_policy', 'status'
    ];

    allowedFields.forEach(field => {
      if (orderData[field] !== undefined) {
        if (field === 'affixes' || field === 'aspect') {
          fields.push(`${field} = $${paramCount}`);
          values.push(JSON.stringify(orderData[field]));
        } else {
          fields.push(`${field} = $${paramCount}`);
          values.push(orderData[field]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE sell_orders
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object|null>}
   */
  static async updateStatus(id, status) {
    const query = `
      UPDATE sell_orders
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete a sell order
   * @param {number} id - Order ID
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const query = 'DELETE FROM sell_orders WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
    * Update highest bid price and bidder count
    * @param {number} id - Order ID
    * @param {number} bidPrice - Bid price
    * @param {boolean} isNewBidder - Whether this is a new bidder
    * @returns {Promise<Object|null>}
    */
   static async updateBidInfo(id, bidPrice, isNewBidder) {
     let query;
     if (isNewBidder) {
       query = `
         UPDATE sell_orders
         SET highest_bid_price = GREATEST(highest_bid_price, $1),
             bidder_count = bidder_count + 1
         WHERE id = $2
         RETURNING *
       `;
     } else {
       query = `
         UPDATE sell_orders
         SET highest_bid_price = GREATEST(highest_bid_price, $1)
         WHERE id = $2
         RETURNING *
       `;
     }
     const result = await db.query(query, [bidPrice, id]);
     return result.rows[0] || null;
   }

   /**
    * Validate bid price according to bid policy
    * @param {Object} order - Order object
    * @param {number} bidPrice - Bid price
    * @returns {Object} Validation result {valid: boolean, message: string}
    */
   static validateBidPrice(order, bidPrice) {
     switch (order.bid_policy) {
       case 'FREE':
         // 자유 제안 - 모든 가격 허용
         return { valid: true };

       case 'FIXED':
         // 고정 가격 - 정확히 일치해야 함
         if (bidPrice !== parseFloat(order.price)) {
           return {
             valid: false,
             message: `Fixed price is ${order.price}. You must bid exactly this amount.`
           };
         }
         return { valid: true };

       case 'OFFER':
         // 제안 받기 - 판매 가격 이상이어야 함
         if (bidPrice < parseFloat(order.price)) {
           return {
             valid: false,
             message: `Bid price must be at least ${order.price}.`
           };
         }
         return { valid: true };

       default:
         return { valid: false, message: 'Invalid bid policy' };
     }
   }

   /**
   * Get sell order statistics
   * @returns {Promise<Object>}
   */
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_orders,
        COUNT(CASE WHEN status = 'SOLD' THEN 1 END) as sold_orders,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_orders,
        AVG(price) as average_price,
        MAX(price) as max_price,
        MIN(price) as min_price
      FROM sell_orders
    `;
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = SellOrder;
