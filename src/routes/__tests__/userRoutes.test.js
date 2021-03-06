const request = require("supertest");
const app  = require("../../application");
const { closeConnection } = require("../../../db/helper")

describe("User Registration, /users endpoint", () => {
  
  afterAll(async() => {
    await closeConnection();
  })

  test("It should add a new user to the database", async () => {
    const res = await request(app)
      .post('/api/users')
      .send({username: "jack", password:"12345"})
      .set('Accept', 'application/json')
    expect(res.body).toHaveProperty('username', 'jack')
    expect(res.statusCode).toBe(200)
  })

  test("It should not allow duplicate usernames", async () => {
    const res = await request(app)
      .post('/api/users')
      .send({username: "rafic", password:"123456" }) //this user already exists
      .set('Accept', 'application/json')
    expect(res.body).toHaveProperty('error')
    expect(res.statusCode).toBe(500)
  })
})