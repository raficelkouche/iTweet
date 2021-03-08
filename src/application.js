const ENV = require("dotenv").config();
const express = require("express");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const app = express();
const db = require("../db/helper");


app.use(cookieSession({
  name: 'session',
  keys: ['secret1', 'secret2']
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//allow for PUT and DELETE requests
app.use(methodOverride('_method'));

//define and mount the routes
const userRoutes = require("./routes/userRoutes");
const tweetRoutes = require("./routes/tweetRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
app.use("/api/users", userRoutes(db));
app.use("/api/tweets", tweetRoutes(db));
app.use("/api/sessions", sessionRoutes(db));

module.exports = app;