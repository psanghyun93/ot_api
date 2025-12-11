-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
    id SERIAL PRIMARY KEY,
    name JSONB NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    state VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_name_structure CHECK (
        name ? 'ko' AND 
        name ? 'zh' AND 
        name ? 'ja' AND 
        name ? 'en'
    ),
    CONSTRAINT valid_state CHECK (
        state IN ('ETERNAL', 'WAITING', 'ONGOING', 'ENDED')
    ),
    CONSTRAINT valid_time_range CHECK (
        end_time IS NULL OR end_time > start_time
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seasons_state ON seasons(state);
CREATE INDEX IF NOT EXISTS idx_seasons_start_time ON seasons(start_time);
CREATE INDEX IF NOT EXISTS idx_seasons_end_time ON seasons(end_time);
CREATE INDEX IF NOT EXISTS idx_seasons_name_gin ON seasons USING gin(name);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_seasons_updated_at ON seasons;

CREATE TRIGGER update_seasons_updated_at
    BEFORE UPDATE ON seasons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO seasons (name, start_time, end_time, state) VALUES
    (
        '{"ko": "시즌 1", "zh": "赛季 1", "ja": "シーズン 1", "en": "Season 1"}'::jsonb,
        '2024-01-01 00:00:00',
        '2024-03-31 23:59:59',
        'ENDED'
    ),
    (
        '{"ko": "시즌 2", "zh": "赛季 2", "ja": "シーズン 2", "en": "Season 2"}'::jsonb,
        '2024-04-01 00:00:00',
        '2024-06-30 23:59:59',
        'ENDED'
    ),
    (
        '{"ko": "시즌 3", "zh": "赛季 3", "ja": "シーズン 3", "en": "Season 3"}'::jsonb,
        '2024-07-01 00:00:00',
        '2024-12-31 23:59:59',
        'ONGOING'
    ),
    (
        '{"ko": "영원", "zh": "永恒赛季", "ja": "エターナルシーズン", "en": "Eternal Season"}'::jsonb,
        '2024-01-01 00:00:00',
        NULL,
        'ETERNAL'
    )
ON CONFLICT DO NOTHING;

-- Create a view for active seasons
CREATE OR REPLACE VIEW active_seasons AS
SELECT 
    id,
    name,
    start_time,
    end_time,
    state,
    created_at,
    updated_at
FROM seasons
WHERE state IN ('ONGOING', 'ETERNAL')
ORDER BY start_time DESC;

-- Create a view for season statistics
CREATE OR REPLACE VIEW season_stats AS
SELECT 
    COUNT(*) as total_seasons,
    COUNT(CASE WHEN state = 'ONGOING' THEN 1 END) as ongoing_seasons,
    COUNT(CASE WHEN state = 'WAITING' THEN 1 END) as waiting_seasons,
    COUNT(CASE WHEN state = 'ENDED' THEN 1 END) as ended_seasons,
    COUNT(CASE WHEN state = 'ETERNAL' THEN 1 END) as eternal_seasons
FROM seasons;

-- Helper function to get season name by language
CREATE OR REPLACE FUNCTION get_season_name(season_name JSONB, lang VARCHAR(2) DEFAULT 'en')
RETURNS TEXT AS $$
BEGIN
    RETURN season_name->>lang;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Comment on table and columns
COMMENT ON TABLE seasons IS 'Game seasons with multi-language support';
COMMENT ON COLUMN seasons.name IS 'Season name in multiple languages (ko, zh, ja, en)';
COMMENT ON COLUMN seasons.start_time IS 'Season start time';
COMMENT ON COLUMN seasons.end_time IS 'Season end time (NULL for eternal seasons)';
COMMENT ON COLUMN seasons.state IS 'Season state: ETERNAL, WAITING, ONGOING, ENDED';
