const router = require("express").Router();

module.exports = db => {
  router.get("/", (req, res) => {
    res.json({ "name": "Tweets" })
  })

  return router
}