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

  return router;
};