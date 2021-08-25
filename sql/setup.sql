DROP TABLE IF EXISTS results,
games,
users CASCADE;
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT NOT NULL
);
CREATE TABLE games (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_user_id TEXT NOT NULL,
    second_user_id TEXT NOT NULL,
    winner TEXT,
    timestamp_start TEXT NOT NULL,
    timestamp_end TEXT
);
CREATE TABLE results (
    result_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    game_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    number_of_rounds INTEGER NOT NULL,
    player_score INTEGER
);
