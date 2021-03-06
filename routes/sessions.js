const express = require('express');
const router = express.Router();
const db = require('../db/helper');
const bcrypt = require('bcrypt');

module.exports = () => {
  /*
  login page post
  assume front end will use ajax or something similar, so will not redirect
  */
  router.post('/', (req, res) => {
    if (!req.body.name || req.body.name.trim() == false || !req.body.password) { //if either field is empty or name is empty after trim
      res.status(403).send({err: 'please fill in both field'});
    } else if (req.session.user_ID) {
      res.status(403).send({err: 'you are already login'});
    } else {
      db.checkUserExist(req.body.name.toLowerCase()) //name should be case insensitive
        .then(result => {
          if (!result.length) {
            res.status(403).send({err: 'invalid combination'}); //if user does not exist, shown invalid for security reason
          } else if (bcrypt.compareSync(req.body.password, result[0].password)) {
            req.session.user_ID = result.id; //set up session id
            res.send({msg: 'login'}); //client side script should then connect to socket after this msg, might want to redirect base on front end
          } else {
            res.status(403).send({err: 'invalid combination'});
          } //if password does not match record
        }); //to be expand with help function
    }
  });

  //logout
  router.delete('/', (req, res) => {
    req.session.user_ID = null;
    res.redirect('/tweets');
  });

  return router;
}