DROP TABLE IF EXISTS games;
CREATE TABLE games (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_user_id TEXT NOT NULL,
    second_user_id TEXT NOT NULL,
    winner TEXT,
    timestamp_start TEXT NOT NULL,
    timestamp_end TEXT
)