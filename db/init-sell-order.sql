-- Create sell_orders table
CREATE TABLE IF NOT EXISTS sell_orders (
    id SERIAL PRIMARY KEY,
    season VARCHAR(50) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),
    rarity VARCHAR(50),
    grade VARCHAR(50),
    greater_affixes INTEGER DEFAULT 0,
    affixes JSONB DEFAULT '[]'::jsonb,
    aspect_id VARCHAR(100),
    aspect JSONB DEFAULT '[]'::jsonb,
    seller_message TEXT,
    price DECIMAL(15, 2) NOT NULL,
    bid_policy VARCHAR(50) NOT NULL,
    seller_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    highest_bid_price DECIMAL(15, 2) DEFAULT 0,
    bidder_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key
    CONSTRAINT fk_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_greater_affixes CHECK (greater_affixes >= 0),
    CONSTRAINT valid_status CHECK (status IN ('ON_SALE', 'IN_TRANSACTION', 'SOLD_OUT', 'EXPIRED', 'CANCELLED')),
    CONSTRAINT valid_bid_policy CHECK (bid_policy IN ('FREE', 'FIXED', 'OFFER'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sell_orders_season ON sell_orders(season);
CREATE INDEX IF NOT EXISTS idx_sell_orders_item_type ON sell_orders(item_type);
CREATE INDEX IF NOT EXISTS idx_sell_orders_category ON sell_orders(category);
CREATE INDEX IF NOT EXISTS idx_sell_orders_rarity ON sell_orders(rarity);
CREATE INDEX IF NOT EXISTS idx_sell_orders_seller_id ON sell_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_sell_orders_status ON sell_orders(status);
CREATE INDEX IF NOT EXISTS idx_sell_orders_price ON sell_orders(price);
CREATE INDEX IF NOT EXISTS idx_sell_orders_created_at ON sell_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sell_orders_affixes_gin ON sell_orders USING gin(affixes);
CREATE INDEX IF NOT EXISTS idx_sell_orders_aspect_gin ON sell_orders USING gin(aspect);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_sell_orders_updated_at ON sell_orders;

CREATE TRIGGER update_sell_orders_updated_at
    BEFORE UPDATE ON sell_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO sell_orders (
    season, item_type, category, sub_category, rarity, grade,
    greater_affixes, affixes, aspect_id, aspect,
    seller_message, price, bid_policy, seller_id, status
) VALUES
    (
        'Season 3',
        'EQUIPMENT',
        'WEAPON',
        'SWORD',
        'LEGENDARY',
        'SACRED',
        2,
        '[{"name": "Critical Strike Damage", "value": 45.5}, {"name": "Strength", "value": 120}]'::jsonb,
        NULL,
        '[]'::jsonb,
        'Perfect rolls! Must see!',
        5000000,
        'OFFER',
        1,
        'ON_SALE'
    ),
    (
        'Season 3',
        'EQUIPMENT',
        'ARMOR',
        'CHEST',
        'UNIQUE',
        'ANCESTRAL',
        0,
        '[{"name": "Total Armor", "value": 2500}, {"name": "Maximum Life", "value": 1200}]'::jsonb,
        'RAIMENT_OF_THE_INFINITE',
        '[15, 20, 10]'::jsonb,
        'Best unique chest armor',
        10000000,
        'FIXED',
        1,
        'ON_SALE'
    ),
    (
        'Eternal',
        'MATERIAL',
        'CRAFTING',
        NULL,
        'RARE',
        NULL,
        0,
        '[]'::jsonb,
        NULL,
        '[]'::jsonb,
        'Bulk sale - 1000 units',
        500000,
        'FREE',
        2,
        'ON_SALE'
    )
ON CONFLICT DO NOTHING;

-- Create view for active sell orders
CREATE OR REPLACE VIEW active_sell_orders AS
SELECT 
    so.*,
    u.name as seller_name,
    u.nickname as seller_nickname
FROM sell_orders so
JOIN users u ON so.seller_id = u.id
WHERE so.status = 'ON_SALE'
ORDER BY so.created_at DESC;

-- Create view for sell order statistics
CREATE OR REPLACE VIEW sell_order_stats AS
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'ON_SALE' THEN 1 END) as on_sale_orders,
    COUNT(CASE WHEN status = 'IN_TRANSACTION' THEN 1 END) as in_transaction_orders,
    COUNT(CASE WHEN status = 'SOLD_OUT' THEN 1 END) as sold_out_orders,
    COUNT(CASE WHEN status = 'EXPIRED' THEN 1 END) as expired_orders,
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_orders,
    AVG(price) as average_price,
    MAX(price) as max_price,
    MIN(price) as min_price
FROM sell_orders;

-- Comment on table and columns
COMMENT ON TABLE sell_orders IS 'Sell orders for in-game items';
COMMENT ON COLUMN sell_orders.season IS 'Season identifier';
COMMENT ON COLUMN sell_orders.item_type IS 'Type of item (EQUIPMENT, MATERIAL, RUNE)';
COMMENT ON COLUMN sell_orders.category IS 'Item category';
COMMENT ON COLUMN sell_orders.affixes IS 'Item affixes in JSON format';
COMMENT ON COLUMN sell_orders.aspect IS 'Aspect values in JSON format';
COMMENT ON COLUMN sell_orders.bid_policy IS 'Bidding policy: FREE (자유 제안), FIXED (고정 가격), OFFER (제안 받기)';
COMMENT ON COLUMN sell_orders.status IS 'Order status: ON_SALE (판매중), IN_TRANSACTION (거래중), SOLD_OUT (판매완료), EXPIRED (만료), CANCELLED (취소)';
