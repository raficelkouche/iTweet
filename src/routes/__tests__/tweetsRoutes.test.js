const request = require("supertest");
const app = require("../../application");
const { closeConnection, getTweetByID } = require("../../../db/helper");

describe("Testing tweets routes", () => {
  const agent = request.agent(app)
  let user_id;

  beforeAll(async () => {
    await agent
      .post('/api/sessions')
      .send({ username: "Rafic", password: "123456" })
      .set('Accept', 'application/json')
      .then(response => {
        user_id = response.body.id
      })
  })

  afterAll(async () => {
    await closeConnection();
  })

  test("should return all the tweets if a user is authenticated (admin)", async () => {
    await agent
      .get('/api/tweets')
      .set('Accept', 'application/json')
      .then(data => {
        expect(data.statusCode).toBe(200)
        expect.objectContaining({
          id: expect.any(Number),
          text: expect.any(String)
        })
      });
  })

  test("should return an error if an unauthorized user tries to retrieve all tweets", async () => {
    //note that the agent won't be used here to test for an unauthorized user
    const res = await request(app)
      .get('/api/tweets')
      .set('Accept', 'application/json')
    expect(res.statusCode).toBe(500)
    expect(res.body).toHaveProperty('error', 'please login first')
    expect.not.objectContaining({
      id: expect.any(Number),
      text: expect.any(String)
    })
  })

  test("should increase the like count by 1", async () => {
    let tweet_id = 2;
    let likes;
    //get the initial likes count
    await getTweetByID(user_id, tweet_id) //note that user_id 1 is the owner of tweet_id 2
      .then(data => {
        likes = data.likes
      }) 
    await agent
      .put(`/api/tweets/${tweet_id}/like`)
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body.likes).toEqual(likes + 1)
      })
  })

  test("should return an error if a user likes a tweet that does not exist", async () => {
    let tweet_id = 12; //this tweet does not exist in the test DB
    await agent
      .put(`/api/tweets/${tweet_id}/like`)
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toHaveProperty('error')
      })
  })

  test("should decrease the like count by 1", async () => {
    let tweet_id = 1; //this tweet initially has 1 like
    let likes;
    //get the initial likes count
    await getTweetByID(user_id, tweet_id) //note that user_id 1 is the owner of tweet_id 1
      .then(data => {
        likes = data.likes
      })
    await agent
      .put(`/api/tweets/${tweet_id}/unlike`)
      .then(response => {
        expect(response.statusCode).toBe(200)
        expect(response.body.likes).toEqual(likes - 1)
      })
  })

  test("should return an error if a user tries to unlike a tweet with 0 likes", async () => {
    let tweet_id = 1; //the like count for this tweet has been reduced to 0 in the previous test
    let likes;
    //get the initial likes count
    await getTweetByID(user_id, tweet_id) //note that user_id 1 is the owner of tweet_id 1
      .then(data => {
        likes = data.likes
      })
    await agent
      .put(`/api/tweets/${tweet_id}/unlike`)
      .then(response => {
        expect(response.statusCode).toBe(500)
        expect(response.body).toHaveProperty('error')
      })
  })
})