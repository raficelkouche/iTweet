const request = require("supertest");
const app = require("../../application");
const { closeConnection } = require("../../../db/helper");

describe("Testing tweets routes", () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent
      .post('/api/sessions')
      .send({ username: "Rafic", password: "123456" })
      .set('Accept', 'application/json')
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
})