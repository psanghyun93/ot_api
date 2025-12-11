-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    blizzard_id VARCHAR(255) UNIQUE,
    blizzard_battletag VARCHAR(255),
    blizzard_access_token TEXT,
    blizzard_refresh_token TEXT,
    blizzard_token_expires_at TIMESTAMP,
    avatar_url TEXT,
    is_registration_complete BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on blizzard_id for faster OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_blizzard_id ON users(blizzard_id);

-- Create index on nickname for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists (to avoid conflict)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (name, email, blizzard_id, blizzard_battletag) VALUES
    ('John Doe', 'john@example.com', NULL, NULL),
    ('Jane Smith', 'jane@example.com', NULL, NULL),
    ('Bob Johnson', 'bob@example.com', NULL, NULL)
ON CONFLICT (email) DO NOTHING;

-- Create a view for user statistics (optional)
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    MAX(created_at) as last_user_created
FROM users;
