DROP TABLE IF EXISTS games,
users CASCADE;
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT NOT NULL
);
CREATE TABLE games (
    game_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_user_id TEXT NOT NULL,
    second_user_id TEXT NOT NULL,
    winner TEXT,
    timestamp_start TEXT NOT NULL,
    timestamp_end TEXT,
    target_score INTEGER NOT NULL
);