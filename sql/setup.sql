DROP TABLE IF EXISTS users,
users_games,
users_zilches,
games,
results,
zilches,
users_uber_zilches,
uber_zilches CASCADE;
CREATE TABLE users (
  user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT NOT NULL
);
CREATE TABLE users_games (
  user_id BIGINT NOT NULL,
  game_id BIGINT NOT NULL
);
CREATE TABLE users_zilches(
  user_id BIGINT NOT NULL,
  game_id BIGINT NOT NULL,
  zilch_id BIGINT NOT NULL
);
CREATE TABLE users_uber_zilches (
  user_id BIGINT NOT NULL,
  game_id BIGINT NOT NULL,
  uber_zilch_id BIGINT NOT NULL
);
CREATE TABLE games (
  game_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_user_id BIGINT NOT NULL,
  second_user_id BIGINT NOT NULL,
  winner TEXT,
  timestamp_start TEXT NOT NULL,
  timestamp_end TEXT,
  target_score INTEGER NOT NULL
);
CREATE TABLE results (
  result_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  number_of_rounds INTEGER NOT NULL,
  player_score INTEGER
);
CREATE TABLE zilches (
  zilch_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  player_zilches INTEGER
);
CREATE TABLE uber_zilches (
  uber_zilch_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  player_uber_zilches INTEGER
);