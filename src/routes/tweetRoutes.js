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
  
  router.put("/:tweet_id/like", (req, res) => {
    const userID = req.session.userID 
    let tweet_id = req.params.tweet_id

    if(userID) {
      db.likeTweet(tweet_id)
        .then(data => {
          data ? res.status(200).json(data) : res.status(500).json({error: "tweet not found"})
        })
    } else {
      res.status(500).json({ error: "unauthorized" })
    }
  })

  router.put("/:tweet_id/unlike", (req, res) => {
    const userID = req.session.userID
    let tweet_id = req.params.tweet_id

    if (userID) {
      db.unlikeTweet(tweet_id)
        .then(data => {
          data ? res.status(200).json(data) 
          : res.status(500).json({ error: "tweet not found / likes can't be negative" })
        })
    } else {
      res.status(500).json({ error: "unauthorized" })
    }
  })
  return router
}