# iTweet

A RESTful application that exposes and API to provide functionality similar to twitter.

## Features
- User authentication and session management.
- Support direct messaging between registered users.
- Create, read, update and delete tweets.
- Like/unlike tweets.
- Retweet specific tweets.
- Threading (support replying to tweets only).

## Getting Started
- Install all dependencies using `npm install`.
- Rename the `.env.example` file to `.env`.
- Replace all the variables in the `.env` to reflect the database configuration that will be used. Note that a local postgresql database was used during development and testing.
- Populate the database by using `npm run db:reset`.
- Start the web server using `npm run local`.

## API Routes
### Sessions
---
|HTTP VERB|URI Path| ACTION  |
|---------|:-------:|------:|
|POST|/api/sessions|Login|
|DELETE|/api/sessions|Logout|
---
### Users
---
|HTTP VERB|URI Path| ACTION  |
|---------|:-------:|------:|
| GET |api/users| Get all users|
|POST|api/users|Add a new user|
|GET|/api/users/:user_id/messages|Get the message history for a user|
|GET|/api/users/:user_id/tweets| Get all the tweets by a user (excluding retweets)|
|POST|/api/users/:user_id/tweets|Add a new tweet|
|GET|/api/users/:user_id/retweets|Get all the tweets retweeted by a user|
|GET|/api/users/:user_id/tweets/:tweet_id|Get a specific tweet|
|PUT|/api/users/:user_id/tweets/:tweet_id|Edit a tweet|
|DELETE|/api/users/:user_id/tweets/:tweet_id|Delete a tweet|
|PUT|/api/users/:user_id/tweets/:tweet_id/like|Like a tweet|
|PUT|/api/users/:user_id/tweets/:tweet_id/unlike|Unlike a tweet|
|GET|/api/users/:user_id/replies|Get all the replies made by a user|
|POST|/api/users/:user_id/replies|Add a new reply to a tweet|
---
### Tweets
---
|HTTP VERB|URI Path| ACTION  |
|---------|:-------:|------:|
|GET|/api/tweets|Get all the tweets|
|GET|/api/tweets/:tweet_id/retweets|Get the retweet count for a given tweet|
|POST|/api/tweets/:tweet_id/retweet|Retweet a tweet|
|GET|/api/tweets/:tweet_id/thread|Get the reply thread for a tweet|
---

## Dependencies
- bcrypt
- cookie-session
- dotenv
- express
- method-override
- pg
- pg-format
- socket.io
- socket.io-client
- uuid

## Development Dependencies
- chalk
- fs
- jest
- supertest
- nodemon

## Testing
- Testing was done using `Jest` and `Supertest`. The coverage report is available in the repo.
- **Please note** that all the real-time chat tests will **Fail** if the server was not started before running the server.

## Important Notes
- Please start the server to be able to test the chat feature. All other tests do not need the server to be started.
- All input validation is assumed to be taken care of on the **client side**.


