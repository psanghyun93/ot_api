-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    seller_nickname VARCHAR(50) NOT NULL,
    buyer_id INTEGER NOT NULL,
    buyer_nickname VARCHAR(50) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    state VARCHAR(20) DEFAULT 'WAIT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES sell_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_state CHECK (state IN ('WAIT', 'ACCEPT', 'REJECT', 'CANCEL', 'COMPLETED')),
    CONSTRAINT different_seller_buyer CHECK (seller_id != buyer_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bids_order_id ON bids(order_id);
CREATE INDEX IF NOT EXISTS idx_bids_seller_id ON bids(seller_id);
CREATE INDEX IF NOT EXISTS idx_bids_buyer_id ON bids(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bids_state ON bids(state);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_bids_updated_at ON bids;

CREATE TRIGGER update_bids_updated_at
    BEFORE UPDATE ON bids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO bids (
    order_id, seller_id, seller_nickname, buyer_id, buyer_nickname, price, state
) VALUES
    (1, 1, 'seller1', 2, 'buyer1', 4500000, 'WAIT'),
    (1, 1, 'seller1', 3, 'buyer2', 4800000, 'REJECT'),
    (2, 1, 'seller1', 2, 'buyer1', 9500000, 'ACCEPT')
ON CONFLICT DO NOTHING;

-- Create view for active bids
CREATE OR REPLACE VIEW active_bids AS
SELECT 
    b.*,
    so.season,
    so.item_type,
    so.category,
    so.rarity
FROM bids b
JOIN sell_orders so ON b.order_id = so.id
WHERE b.state = 'WAIT'
ORDER BY b.created_at DESC;

-- Create view for bid statistics
CREATE OR REPLACE VIEW bid_stats AS
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
FROM bids;

-- Comment on table and columns
COMMENT ON TABLE bids IS 'Bids on sell orders';
COMMENT ON COLUMN bids.order_id IS 'Reference to sell_orders table';
COMMENT ON COLUMN bids.seller_id IS 'Seller user ID';
COMMENT ON COLUMN bids.buyer_id IS 'Buyer user ID';
COMMENT ON COLUMN bids.state IS 'Bid state: WAIT, ACCEPT, REJECT, CANCEL, COMPLETED';
