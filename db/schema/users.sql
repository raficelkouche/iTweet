DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  registered_on TIMESTAMP DEFAULT NOW(),
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

/*ensures email addresses are unique*/
CREATE UNIQUE INDEX users_unique_username on users(lower(username));