const PORT = process.env.PORT || 8001;
const ENV = require("dotenv").config();
const express = require("express");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const app = express();
const db = require("../db/helper")

app.use(cookieSession({
  name: 'session',
  keys: ['secret1', 'secret2']
}));

//allow for PUT and DELETE requests
app.use(methodOverride('_method'));

//define and mount the routes
const userRoutes = require("./routes/userRoutes");
const tweetRoutes = require("./routes/tweetRoutes");
app.use("/api/users", userRoutes(db))
app.use("/api/tweets", tweetRoutes(db))

//start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`)
})
