const request = require("supertest");
const app  = require("../../application");
const { closeConnection, getTweetByID, getAllTweets } = require("../../../db/helper")

describe("User Registration, /users endpoint", () => {
  
  afterAll(async() => {
    await closeConnection();
  })

  test("It should add a new user to the database", async () => {
    const res = await request(app)
      .post('/api/users')
      .send({username: "Jack", password:"12345"})
      .set('Accept', 'application/json')
    expect(res.body).toHaveProperty('username', 'Jack')
    expect(res.statusCode).toBe(200)
  })

  test("It should not allow duplicate usernames", async () => {
    const res = await request(app)
      .post('/api/users')
      .send({username: "Rafic", password:"123456" }) //this user already exists
      .set('Accept', 'application/json')
    expect(res.body).toHaveProperty('error')
    expect(res.statusCode).toBe(500)
  })
  
  test("should not allow unauthorized access to messages", async() => {
    const response = await request(app)
      .get('/api/users/1/messages')
    expect(response.statusCode).toBe(500)
    expect(response.body).toHaveProperty('error', 'access denied!')
  })
  
  const agent = request.agent(app); //using an agent to be able to store the session cookies for the next tests
  let user_id; //to be used by the next test
  test("logged in users will have session cookies set", async () => {
    await agent
      .post('/api/sessions')
      .send({ username: "Rafic", password: "123456" })
      .set('Accept', 'application/json')
      .then(res => {
        user_id = res.body.id
        expect(res.headers).toHaveProperty('set-cookie')
        expect(res.body).toHaveProperty('username', 'Rafic')
        expect(res.statusCode).toBe(200)
      })
  })

  test("users should be able to view their messages if they are logged in", async () => {
    const response = await agent
      .get(`/api/users/${user_id}/messages`)
    expect(response.statusCode).toBe(200)
    expect(response.body).not.toHaveLength(0)
  })

  test("an authenticated user can post a new tweet", async () => {
    let tweet_id;
    await agent
      .post(`/api/users/${user_id}/tweets`)
      .send({tweet: "it feels cold today!"})
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .then(response => {
        expect(response.statusCode).toBe(200)
        tweet_id = response.body.id //use it to check if the new tweet has been persisted to the DB
      })
    await getTweetByID(user_id, tweet_id)
      .then(data => {
        expect(data).toBeDefined();
      })
  })

  test("if a user tries to post a tweet on behalf of another user an error should be returned", async () => {
    let tweet_id;
    //note that the agent is logged in as user_id 1.
    await agent
      .post(`/api/users/3/tweets`) //user_id 1 will attempt to post on behalf of user_id 3 
      .send({ tweet: "I am starving..." })
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .then(response => {
        expect(response.statusCode).toBe(500)
        tweet_id = response.body.id //use it to check if the new tweet has been persisted to the DB
      })
    //confirm that the tweet has not been posted
    await getTweetByID(user_id, tweet_id)
      .then(data => {
        expect(data).not.toBeDefined();
      })
  })

  test("authenticated users can retrieve all their tweets", async () => {
    await agent
      .get(`/api/users/${user_id}/tweets`)
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect.objectContaining({
          id: expect.any(Number),
          text: expect.any(String)
        })
      })
  })

  test("an error should occur if user 1 tries to retrieve user 2's tweets", async () => {
    await agent
      .get('/api/users/2/tweets')
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toHaveProperty('error', 'access denied!')
        expect(response.body).not.toHaveProperty('id')
      })
  })

  test("users should be able to retrieve a specific tweet", async () => {
    const tweet_id = 1; //this tweet belongs to user_id 1
    await agent
      .get(`/api/users/${user_id}/tweets/${tweet_id}`)
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect.objectContaining({
          id: tweet_id,
          user_id
        })
      })
  })

  test("if a tweet is not found or does not belong to the user, an error will be returned", async () => {
    const tweet_id = 3; //this tweet belongs to user_id 2
    await agent
      .get(`/api/users/${user_id}/tweets/${tweet_id}`)
      .then(response => {
        expect(response.statusCode).toBe(500)
      })
  })

  test("if a tweet belongs to a user, they should be able to edit it", async () => {
    const newTweet = "This is for testing purposes"
    const tweet_id = 2; //this tweet belongs to user_id 1
    await agent
      .put(`/api/users/${user_id}/tweets/${tweet_id}`)
      .send({tweet: newTweet})
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect.objectContaining({
          text: newTweet
        })
      })
  })

  test("if a user tries to edit a tweet that doesn't belong to them, an error should be returned", async () => {
    const newTweet = "This is for testing purposes"
    const tweet_id = 3; //this tweet does not belong to user_id 1
    await agent
      .put(`/api/users/${user_id}/tweets/${tweet_id}`)
      .send({ tweet: newTweet })
      .set('Accept', 'application/x-www-form-urlencoded')
      .then(response => {
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error')
      })
  })
  
  test("should delete a tweet if the tweet owner requests it", async () => {
    const tweet_id = 2; //this tweet belongs to user_id 1
    await agent
      .delete(`/api/users/${user_id}/tweets/${tweet_id}`)
      .then(response => {
        expect(response.statusCode).toBe(200)
      })
    //call DB and confirm deletion
    await getTweetByID(user_id, tweet_id)
      .then(data => {
        expect(data).not.toBeDefined()
      })
  })

  test("if an unauthorized user tries to delete a tweet, an error is received", async () => {
    const tweet_id = 3; //this tweet doest not belong to user_id 1
    await agent
      .delete(`/api/users/${user_id}/tweets/${tweet_id}`)
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toHaveProperty('error')
      })
    //call DB and confirm that no deletion took place
    await getAllTweets()
      .then(() => {
        expect.objectContaining({
          id: tweet_id
        })
      })
  })
})