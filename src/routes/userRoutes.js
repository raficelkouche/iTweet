const router = require("express").Router();

module.exports = db => {
  router.get("/", (req, res) => {
    db.getAllUsers()
      .then(data => {
        res.json(data)
      })
      .catch(err => {
        console.log("error: ", err)
      })
  })

  return router
}