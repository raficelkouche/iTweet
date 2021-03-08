const router = require("express").Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = db => {
  //register a new user
  router.get("/", (req, res) => {
    const user_id = req.session.userID

    if(user_id) {
      db.getAllUsers()
        .then(data => {
          (data.length > 0) ? res.status(200).json(data)
          : res.status(500).json({ message: "no registered users" })
        })
    } else {
      res.status(500).json({ error: "unauthorized" })
    }
  })
  
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
    //input validation to be taken care of on the client side
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

  //this will only retrieve the tweets by a given user excluding retweets
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

  //this will retrieve all the tweets retweeted by a given user{
  router.get("/:user_id/retweets", (req, res) => {
    let user_id = req.params.user_id

    if(user_id === req.session.userID) {
      db.getRetweetedTweets(user_id)
        .then(data => {
          (data.length > 0) ? res.status(200).json(data)
                : res.status(200).json({message: "no retweets"})
        })
    } else {
      res.status(500).json({error: "unauthorized"})
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
    //input validation to be taken care of on the client side
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

  router.put("/:user_id/tweets/:tweet_id/like", (req, res) => {
    let { user_id, tweet_id } = req.params

    if (user_id === req.session.userID) {
      //if there is a requirement to know who liked what, user_id can also be passed as an additional argument
      db.likeTweet(tweet_id)
        .then(data => {
          data ? res.status(200).json(data) : res.status(500).json({ error: "tweet not found" })
        })
    } else {
      res.status(500).json({ error: "unauthorized" })
    }
  })

  router.put("/:user_id/tweets/:tweet_id/unlike", (req, res) => {
    let { user_id, tweet_id } = req.params

    if (user_id === req.session.userID) {
      db.unlikeTweet(tweet_id)
        .then(data => {
          data ? res.status(200).json(data)
            : res.status(500).json({ error: "tweet not found / likes can't be negative" })
        })
    } else {
      res.status(500).json({ error: "unauthorized" })
    }
  })

  router.get("/:user_id/replies", (req, res) => {
    const user_id = req.params.user_id

    if(user_id === req.session.userID){
      db.getUserReplies(user_id)
        .then(data => {
          (data.length > 0) ? res.status(200).json(data)
            : res.status(200).json({message: "no replies found"}); 
        })
    } else {
        res.status(500).json({error: "please log in first"});
    }
  })

  router.post("/:user_id/replies", (req, res) => {
    const user_id = req.params.user_id;
    const { tweet_id, reply } = req.body;

    if (user_id === req.session.userID) {
      db.addReply(user_id, tweet_id, reply)
        .then(data => {
          res.status(200).json(data)
        })
    } else {
      res.status(500).json({ error: "please login first" });
    }
  })

  return router;
};