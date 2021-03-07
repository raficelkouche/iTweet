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
  
  const agent = request.agent(app); //using an agent to be able to store the session cookies for the next test
  let user_id; //to be used by the next test
  test("users should be logged in to be able to retrieve their messages", async () => {
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
})