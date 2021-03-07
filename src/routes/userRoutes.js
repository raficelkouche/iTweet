const router = require("express").Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = db => {
  //register a new user
  router.post("/", (req, res) => {
    /* input validation to be taken care of on the client side. This includes 
    empty name/email/password fields, non-matching password/password confirmation fields and so on */
    const userInfo = req.body;
    userInfo.password = bcrypt.hashSync(userInfo.password, saltRounds);

    db.addNewUser(userInfo)
      .then(data => {
        if (!data) {
          return res.status(500).json({error: "user already exists"});
        }
        const { username } = data
        res.json({ username })
      })
  })

  router.get("/:user_id/messages", (req, res) => {
    //the user id is available after the login process is complete
    const user_id = req.params.user_id
    
    if(user_id === req.session.userID) {
      db.getUserMessages(user_id)
        .then(data => {
          res.status(200).json(data)
        })
    } else {
      res.status(500).json({error: "access denied!"});
    }
  })

  router.post("/:user_id/tweets", (req, res) => {
    let user_id = req.params.user_id
    let tweet = req.body.tweet

    if(user_id === req.session.userID) {
      db.addTweet(tweet, user_id)
        .then(data => {
          res.status(200).json(data)
        })
    } else {
      res.status(500).json({error: "unauthorized"})
    }
  })

  router.get("/:user_id/tweets", (req, res) => {
    const user_id = req.params.user_id

    if(user_id === req.session.userID) {
      db.getTweetsByUser(user_id)
        .then(data => {
          res.status(200).json(data)
        })
    } else {
      res.status(500).json({ error: "access denied!" });
    }

  })

  router.get("/:user_id/tweets/:tweet_id", (req, res) => {
    let {user_id, tweet_id} = req.params
    
    if(user_id === req.session.userID){
      db.getTweetByID(user_id, tweet_id)
        .then(data => {
          //absence of data implies that this tweet doesn't belong to user_id
          data ? res.status(200).json(data) : res.status(500).json({error: "not found"})
        })
    } else {
      res.status(500).json({error: "access denied!"});
    }
  })

  router.put("/:user_id/tweets/:tweet_id", (req, res) => {
    let { user_id, tweet_id } = req.params
    let tweet = req.body.tweet

    if(user_id === req.session.userID) {
      db.editTweet(user_id, tweet_id, tweet)
        .then(data => {
          //absence of data implies that this tweet doesn't belong to user_id
          data ? res.status(200).json(data) : res.status(500).json({ error: "request could not be completed" })
        })
    } else {
      res.status(500).json({error: "access denied!"});
    }
  })

  router.delete("/:user_id/tweets/:tweet_id", (req, res) => {
    let { user_id, tweet_id } = req.params

    if(user_id === req.session.userID) {
      db.deleteTweet(user_id, tweet_id)
        .then(data => {
          //absence of data implies that this tweet doesn't belong to user_id
          data ? res.status(200).json(data) : res.status(500).json({ error: "request could not be completed" })
        })
    } else {
      res.status(500).json({error: "access denied"});
    }
  })

  return router;
};