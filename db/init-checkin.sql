-- Create checkins table
CREATE TABLE IF NOT EXISTS checkins (
                                        id SERIAL PRIMARY KEY,
                                        user_id INTEGER NOT NULL,
                                        date DATE NOT NULL,
                                        streak INTEGER DEFAULT 1,

                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key
                                        CONSTRAINT fk_checkins_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT unique_daily_checkin UNIQUE (user_id, date),
    CONSTRAINT valid_streak CHECK (streak >= 1)
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
CREATE INDEX IF NOT EXISTS idx_checkins_streak ON checkins(streak);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_checkins_updated_at ON checkins;

CREATE TRIGGER update_checkins_updated_at
    BEFORE UPDATE ON checkins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
