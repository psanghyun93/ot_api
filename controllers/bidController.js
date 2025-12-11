const { successResponse, errorResponse } = require('../utils/response');
const Bid = require('../models/Bid');
const SellOrder = require('../models/SellOrder');
const User = require('../models/User');

// Valid bid states
const VALID_STATES = ['WAIT', 'ACCEPT', 'REJECT', 'CANCEL', 'COMPLETED'];

class BidController {
  /**
   * Get all bids with optional filters
   * @route GET /api/bids
   */
  async getAllBids(req, res) {
    try {
      const filters = {
        order_id: req.query.order_id,
        seller_id: req.query.seller_id,
        buyer_id: req.query.buyer_id,
        state: req.query.state
      };

      Object.keys(filters).forEach(key => 
        filters[key] === undefined && delete filters[key]
      );

      const bids = await Bid.findAll(filters);
      successResponse(res, bids);
    } catch (error) {
      console.error('Error fetching bids:', error);
      errorResponse(res, 'Failed to fetch bids', 500);
    }
  }

  /**
   * Get bid by ID
   * @route GET /api/bids/:id
   */
  async getBidById(req, res) {
    try {
      const bidId = parseInt(req.params.id);

      if (isNaN(bidId)) {
        return errorResponse(res, 'Invalid bid ID', 400);
      }

      const bid = await Bid.findById(bidId);

      if (!bid) {
        return errorResponse(res, 'Bid not found', 404);
      }

      successResponse(res, bid);
    } catch (error) {
      console.error('Error fetching bid:', error);
      errorResponse(res, 'Failed to fetch bid', 500);
    }
  }

  /**
   * Get bids by order ID
   * @route GET /api/bids/order/:orderId
   */
  async getBidsByOrder(req, res) {
    try {
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId)) {
        return errorResponse(res, 'Invalid order ID', 400);
      }

      const bids = await Bid.findByOrderId(orderId);
      successResponse(res, bids);
    } catch (error) {
      console.error('Error fetching bids by order:', error);
      errorResponse(res, 'Failed to fetch bids', 500);
    }
  }

  /**
   * Get my bids (as buyer)
   * @route GET /api/bids/my-bids
   */
  async getMyBids(req, res) {
    try {
      const buyerId = req.user.id;
      const bids = await Bid.findByBuyerId(buyerId);
      successResponse(res, bids);
    } catch (error) {
      console.error('Error fetching my bids:', error);
      errorResponse(res, 'Failed to fetch your bids', 500);
    }
  }

  /**
   * Get received bids (as seller)
   * @route GET /api/bids/received
   */
  async getReceivedBids(req, res) {
    try {
      const sellerId = req.user.id;
      const bids = await Bid.findBySellerId(sellerId);
      successResponse(res, bids);
    } catch (error) {
      console.error('Error fetching received bids:', error);
      errorResponse(res, 'Failed to fetch received bids', 500);
    }
  }

  /**
   * Get pending bids
   * @route GET /api/bids/pending
   */
  async getPendingBids(req, res) {
    try {
      const userId = req.user.id;
      const bids = await Bid.findPendingByUser(userId);
      successResponse(res, bids);
    } catch (error) {
      console.error('Error fetching pending bids:', error);
      errorResponse(res, 'Failed to fetch pending bids', 500);
    }
  }

  /**
   * Create a new bid
   * @route POST /api/bids
   * 
   * 입찰 규칙:
   * 1. 판매 주문 유효성 검사
   * 2. 입찰 금액이 정책에 맞는지 검사
   * 3. WAIT/ACCEPT 상태 입찰 중복 검사
   * 4. 입찰 생성
   * 5. 최고 입찰가 갱신
   * 6. 입찰자 수 업데이트 (신규 입찰자인 경우)
   * 7. 입찰자 mana 차감 (10)
   */
  async createBid(req, res) {
    try {
      const { order_id, price } = req.body;
      const buyer_id = req.user.id;
      const MANA_COST = 10;

      // Validation
      if (!order_id || !price) {
        return errorResponse(res, 'Order ID and price are required', 400);
      }

      if (price < 0) {
        return errorResponse(res, 'Price must be greater than or equal to 0', 400);
      }

      // 1. 판매 주문 ID로 주문 정보를 조회한다.
      const order = await SellOrder.findById(order_id);
      if (!order) {
        return errorResponse(res, 'Order not found', 404);
      }

      // 2. 판매 주문이 유효한 상태인지 검사한다.
      if (order.status !== 'ON_SALE') {
        return errorResponse(res, 'Order is not available for bidding', 400);
      }

      // 3. 입찰 금액이 판매 주문의 입찰 정책에 맞는지 검사한다.
      const priceValidation = SellOrder.validateBidPrice(order, price);
      if (!priceValidation.valid) {
        return errorResponse(res, priceValidation.message, 400);
      }

      // 4. 입찰자의 입찰 중 WAIT나 ACCEPT 상태인 입찰이 있는지 검사한다.
      const bidCheck = await Bid.canUserBid(buyer_id, order_id);
      if (!bidCheck.canBid) {
        return errorResponse(res, bidCheck.reason, 400);
      }

      // 입찰자의 mana 확인
      const buyerMana = await User.getMana(buyer_id);
      if (buyerMana < MANA_COST) {
        return errorResponse(res, `Insufficient mana. Required: ${MANA_COST}, Available: ${buyerMana}`, 400);
      }

      // Get buyer info
      const buyer = await User.findById(buyer_id);
      if (!buyer) {
        return errorResponse(res, 'Buyer not found', 404);
      }

      // 6. 입찰자의 기 입찰 정보가 없으면 주문의 입찰자 수를 증가 시킨다.
      const hasUserBidBefore = await Bid.hasUserBidBefore(buyer_id, order_id);
      const isNewBidder = !hasUserBidBefore;

      // 4. 입찰 정보를 생성한다.
      const newBid = await Bid.create({
        order_id,
        seller_id: order.seller_id,
        seller_nickname: order.seller_nickname,
        buyer_id,
        buyer_nickname: buyer.nickname || buyer.name,
        price
      });

      // 5. 판매 정보의 최고 입찰가와 비교하여 최고 입찰 정보를 갱신한다.
      await SellOrder.updateBidInfo(order_id, price, isNewBidder);

      // 7. 입찰자의 mana를 10만큼 감소시킨다.
      const manaResult = await User.decreaseMana(buyer_id, MANA_COST);
      if (!manaResult) {
        // Rollback bid if mana decrease fails
        await Bid.delete(newBid.id);
        return errorResponse(res, 'Failed to decrease mana. Bid cancelled.', 500);
      }

      // Add mana info to response
      newBid.remaining_mana = manaResult.mana;

      successResponse(res, newBid, 201);
    } catch (error) {
      console.error('Error creating bid:', error);
      errorResponse(res, 'Failed to create bid', 500);
    }
  }

  /**
   * Accept a bid
   * @route POST /api/bids/:id/accept
   */
  async acceptBid(req, res) {
    try {
      const bidId = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(bidId)) {
        return errorResponse(res, 'Invalid bid ID', 400);
      }

      const bid = await Bid.findById(bidId);
      if (!bid) {
        return errorResponse(res, 'Bid not found', 404);
      }

      // Only seller can accept
      if (bid.seller_id !== userId) {
        return errorResponse(res, 'Only the seller can accept bids', 403);
      }

      if (bid.state !== 'WAIT') {
        return errorResponse(res, 'Only pending bids can be accepted', 400);
      }

      const updatedBid = await Bid.updateState(bidId, 'ACCEPT');

      // Mark order as in transaction when bid is accepted
      await SellOrder.updateStatus(bid.order_id, 'IN_TRANSACTION');

      successResponse(res, updatedBid);
    } catch (error) {
      console.error('Error accepting bid:', error);
      errorResponse(res, 'Failed to accept bid', 500);
    }
  }

  /**
   * Reject a bid
   * @route POST /api/bids/:id/reject
   */
  async rejectBid(req, res) {
    try {
      const bidId = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(bidId)) {
        return errorResponse(res, 'Invalid bid ID', 400);
      }

      const bid = await Bid.findById(bidId);
      if (!bid) {
        return errorResponse(res, 'Bid not found', 404);
      }

      // Only seller can reject
      if (bid.seller_id !== userId) {
        return errorResponse(res, 'Only the seller can reject bids', 403);
      }

      if (bid.state !== 'WAIT') {
        return errorResponse(res, 'Only pending bids can be rejected', 400);
      }

      const updatedBid = await Bid.updateState(bidId, 'REJECT');
      successResponse(res, updatedBid);
    } catch (error) {
      console.error('Error rejecting bid:', error);
      errorResponse(res, 'Failed to reject bid', 500);
    }
  }

  /**
   * Cancel a bid
   * @route POST /api/bids/:id/cancel
   */
  async cancelBid(req, res) {
    try {
      const bidId = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(bidId)) {
        return errorResponse(res, 'Invalid bid ID', 400);
      }

      const bid = await Bid.findById(bidId);
      if (!bid) {
        return errorResponse(res, 'Bid not found', 404);
      }

      // Only buyer can cancel
      if (bid.buyer_id !== userId) {
        return errorResponse(res, 'Only the buyer can cancel their bid', 403);
      }

      if (bid.state !== 'WAIT') {
        return errorResponse(res, 'Only pending bids can be cancelled', 400);
      }

      const updatedBid = await Bid.updateState(bidId, 'CANCEL');
      successResponse(res, updatedBid);
    } catch (error) {
      console.error('Error cancelling bid:', error);
      errorResponse(res, 'Failed to cancel bid', 500);
    }
  }

  /**
   * Delete a bid
   * @route DELETE /api/bids/:id
   */
  async deleteBid(req, res) {
    try {
      const bidId = parseInt(req.params.id);
      const userId = req.user.id;

      if (isNaN(bidId)) {
        return errorResponse(res, 'Invalid bid ID', 400);
      }

      const bid = await Bid.findById(bidId);
      if (!bid) {
        return errorResponse(res, 'Bid not found', 404);
      }

      // Only buyer can delete their own bid
      if (bid.buyer_id !== userId) {
        return errorResponse(res, 'You can only delete your own bids', 403);
      }

      const deleted = await Bid.delete(bidId);
      if (!deleted) {
        return errorResponse(res, 'Failed to delete bid', 500);
      }

      successResponse(res, { message: 'Bid deleted successfully' });
    } catch (error) {
      console.error('Error deleting bid:', error);
      errorResponse(res, 'Failed to delete bid', 500);
    }
  }

  /**
   * Get bid statistics
   * @route GET /api/bids/stats
   */
  async getStats(req, res) {
    try {
      const stats = await Bid.getStats();
      successResponse(res, stats);
    } catch (error) {
      console.error('Error fetching bid stats:', error);
      errorResponse(res, 'Failed to fetch statistics', 500);
    }
  }
}

module.exports = new BidController();
