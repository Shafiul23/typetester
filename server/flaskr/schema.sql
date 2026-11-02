DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS score;

CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE score (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    duration_seconds INTEGER CHECK (duration_seconds IN (15, 30, 60)),
    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user (id)
);
