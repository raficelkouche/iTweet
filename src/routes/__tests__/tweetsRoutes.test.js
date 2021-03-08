const request = require("supertest");
const app = require("../../application");
const { closeConnection, getRetweetCount } = require("../../../db/helper");

describe("Testing tweets routes", () => {
  const agent = request.agent(app);
  let user_id;

  beforeAll(async() => {
    await agent
      .post('/api/sessions')
      .send({ username: "Rafic", password: "123456" })
      .set('Accept', 'application/json')
      .then(response => {
        user_id = response.body.id;
      });
  });

  afterAll(async() => {
    await closeConnection();
  });

  test("should return all the tweets if a user is authenticated (admin)", async() => {
    await agent
      .get('/api/tweets')
      .set('Accept', 'application/json')
      .then(data => {
        expect(data.statusCode).toBe(200);
        expect.objectContaining({
          id: expect.any(Number),
          text: expect.any(String)
        });
      });
  });

  test("should return an error if an unauthorized user tries to retrieve all tweets", async() => {
    //note that the agent won't be used here to test for an unauthorized user
    const res = await request(app)
      .get('/api/tweets')
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'please login first');
    expect.not.objectContaining({
      id: expect.any(Number),
      text: expect.any(String)
    });
  });

  test("should get the number of times a specific tweet was retweeted", async() => {
    let tweet_id = 4; //this tweet has been retweeted 3 times
    await agent
      .get(`/api/tweets/${tweet_id}/retweets`)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect.objectContaining({
          retweet_count: 3
        });
      });
  });

  test("should return an error if an unauthorized user tries to get the retweet count", async() => {
    let tweet_id = 4; //this tweet has been retweeted 3 times
    await request(app) //using a new request to simulate a user not being logged in
      .get(`/api/tweets/${tweet_id}/retweets`)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error');
      });
  });

  test("should increase the retweet count by 1", async() => {
    const tweet_id = 1; //it has been retweeted twice
    const retweets = await getRetweetCount(tweet_id);
    await agent
      .post(`/api/tweets/${tweet_id}/retweet`)
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect.objectContaining({
          tweet_id,
          retweeted_by: user_id
        });
      });
    let updated_count = await getRetweetCount(tweet_id);
    expect(Number(updated_count.retweet_count)).toEqual(Number(retweets.retweet_count) + 1);
  });

  test("should return all the thread for a given tweet", async() => {
    const tweet_id = 2;
    await agent
      .get(`/api/tweets/${tweet_id}/thread`)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
      });
  });

  test("should return an error if an unauthorized user attempts to get a tweet thread", async() => {
    const tweet_id = 2;
    await request(app)
      .get(`/api/tweets/${tweet_id}/thread`)
      .set('Accept', 'application/json')
      .then(response => {
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error');
      });
  });
});