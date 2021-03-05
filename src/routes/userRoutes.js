const router = require("express").Router();

module.exports = db => {
  router.get("/", (req, res) => {
    const obj = {name: "users"}
    res.json(obj)
  })

  return router
}