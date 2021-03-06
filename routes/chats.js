const express = require('express');
const router = express.Router();
const db = require('../db/helper');

module.exports = () => {
  //get chat log with that user
  router.get("/:user_name", (req, res) => {
    const userID = req.session.user_ID;
    if (!userID) {
      res.status(403).send([{err: 'Please login'}]);
    } else {
      db.checkUserExist(req.params.user_name.toLocaleLowerCase(), undefined, undefined, true, userID)
        .then(result => {
          if (result[0].err === 'same user') { //if user trying to send msg to himself
            res.status(403).send(result);
          } else if (result.length) {
            res.send(result);
          } else { //if nothing in db
            res.send([{err: 'start of conversation'}]);
          }
        });
    }
  });

  //msging is already handled by socket.io, so this will just check if user is login and give a boolean for socket to process
  router.post("/:user_name", (req, res) => {
    const userID = req.session.user_ID;
    if (!userID) {
      res.status(403).send([{err: 'Please login'}]);
    } else {
      res.send([{login:true}]);
    }
  });

  return router;
}