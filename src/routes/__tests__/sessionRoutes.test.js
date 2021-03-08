const request = require("supertest");
const app = require("../../application");
const { closeConnection } = require("../../../db/helper");

describe("User Authentication, /session endpoint", () => {

  afterAll(async() => {
    await closeConnection();
  });

  test("If login is successful, it should set session cookies", async() => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ username: "Rafic", password: "123456" })  //user already exists in database
      .set('Accept', 'application/json');
    expect(res.headers).toHaveProperty('set-cookie');
    expect(res.body).toHaveProperty('username', 'Rafic');
    expect(res.statusCode).toBe(200);
  });

  test("If user does not exist, cookies should not be set and an error should be returned", async() => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ username: "sara", password: "123456" })  //user is not in the database
      .set('Accept', 'application/json');
    expect(res.headers).not.toHaveProperty('set-cookie');
    expect(res.body).toHaveProperty('error', 'user not found');
    expect(res.statusCode).toBe(500);
  });
  
  test("If a password is wrong, cookies should not be set and an error should be returned", async() => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ username: "Rafic", password: "1234" })
      .set('Accept', 'application/json');
    expect(res.headers).not.toHaveProperty('set-cookie');
    expect(res.body).toHaveProperty('error', 'incorrect password');
    expect(res.statusCode).toBe(500);
  });

});