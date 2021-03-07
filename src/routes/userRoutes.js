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
    const user_id = Number(req.params.user_id)
    
    if(user_id === req.session.userID) {
      db.getUserMessages(user_id)
        .then(data => {
          res.status(200).json(data)
        })
    } else {
      res.status(500).json({error: "access denied!"})
    }
  })

  return router;
};