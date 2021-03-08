const router = require("express").Router();

module.exports = db => {
  router.get("/", (req, res) => {
    const userID = req.session.userID;
    
    if (userID) {
      db.getAllTweets()
        .then(data => {
          res.status(200).json(data);
        });
    } else {
      res.status(500).json({error: "please login first"});
    }
  });
  
  router.get("/:tweet_id/retweets", (req, res) => {
    const user_id = req.session.userID;
    let tweet_id = req.params.tweet_id;

    if (user_id) {
      db.getRetweetCount(tweet_id)
        .then(data => {
          data ? res.status(200).json(data)
            : res.status(500).json({error: "tweet not found"});
        });
    } else {
      res.status(500).json({error: "access denied"});
    }
  });

  /*Add another endpoint here to get the likes for a tweet*/

  //this is not under /users since tweet being retweeted does not ideally belong to the user
  router.post("/:tweet_id/retweet", (req, res) => {
    const tweet_id = req.params.tweet_id;
    const user_id = req.session.userID;

    if (user_id) {
      db.addToRetweets(tweet_id, user_id)
        .then(async(data) => {
          await db.increaseRetweetCount(tweet_id);
          data ? res.status(200).json(data)
            : res.status(500).json({ error: "tweet not found" });
        });
    }
  });

  router.get("/:tweet_id/thread", (req, res) => {
    const tweet_id = req.params.tweet_id;
    const user_id = req.session.userID;

    if (user_id) {
      db.getTweetThread(tweet_id)
        .then(data => {
          (data.length > 0) ? res.status(200).json(data)
            : res.status(200).json({ message: "tweet does not have any replies" });
        });
    } else {
      res.status(500).json({ error: "unauthorized" });
    }

  });


  return router;
};