const router = require("express").Router();
const db = require('../../db/helper');

module.exports = db => {
  router.get("/", (req, res) => {
    const userID = req.session.userID
    
    if(userID) {
      db.getAllTweets()
        .then(data => {
          res.status(200).json(data)
        })
    } else {
        res.status(500).json({error: "please login first"})
    }
  })
  return router
}