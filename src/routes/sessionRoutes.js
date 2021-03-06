const router = require("express").Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = db => {
  //create a new session on successful login
  router.post("/", (req, res) => {
    const { username, password } = req.body
    
    db.retrieveUserRecord(username)
      .then(data => {
        if (!data) {
          return res.status(500).json({ error: "user not found" });
        } else if (!bcrypt.compareSync(password, data.password)) {
            return res.status(500).json({ error: "incorrect password" });
        } else {
          const { id, username } = data;
          req.session.userID = id      //set the session cookies
          res.json({ id, username })  //can be used by the client to display username, etc...
        }
      })
  })

  return router;
};