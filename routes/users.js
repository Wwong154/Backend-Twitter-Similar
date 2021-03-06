const express = require('express');
const router = express.Router();
const db = require('../db/helper');
const bcrypt = require('bcrypt');

module.exports = () => {

  /*
  register page post
  assume front end will use ajax or something similar, so will not redirect
  */
  router.post('/', (req, res) => {
    if (!req.body.name || req.body.name.trim() == false || !req.body.password || !req.body.password_confirm) { // if either field is empty or if name only contain space
      res.status(403).send({err: 'please fill in all field'});
    } else if (req.body.password !== req.body.password_confirm) { //if passowrd not match
      res.status(403).send({err: 'password does not match'});
    } else if (req.body.password.length < 6) { //if password is too short
      res.status(403).send({err: 'password is too short'});
    } else {
      let userInfo = { //hash the password with semi random salt
        name: req.body.name.toLowerCase().trim(),
        password: bcrypt.hashSync(req.body.password, Math.floor(Math.random() * 5) + 5)
      };
      db.checkUserExist(userInfo.name, true, userInfo)
        .then(result => {
          if (!result.length) { //if new user, helper return object which does not have length
            req.session.user_ID = result.id; //set up seesion
            res.send({msg: 'registered'}); //client side script should then connect to socket after this msg, might want to redirect depends on front end
          } else { //if user exist it return array, which have lenght
            res.status(403).send({err: 'user exist'});
          }
        });
    }
  });
  //use user_name as per real twitter, should allow all to view even if not login
  router.get("/:user_name/tweets", (req, res) => {
    db.checkUserExist(req.params.user_name.toLocaleLowerCase())
      .then(user =>{
        if (!user[0]) {
          res.status(403).send([{err: 'user does not exist'}]);
        } else { //case where the user is not logged in
          db.getTweetsByID(undefined,undefined,user[0].id)
            .then(tweets => {
              res.send(tweets);
            });
        }
      });
  });

  //use user_name as per real twitter
  router.post("/:user_name/tweets", (req, res) => {
    db.checkUserExist(req.params.user_name.toLocaleLowerCase())
      .then(user =>{
        const userID = req.session.user_ID;
        if (!req.body.tweet) {
          res.status(403).send([{err: 'tweet is empty'}]);
        } else if (req.body.tweet.length > 140) {
          res.status(403).send([{err: 'tweet is too long'}]);
        } else if (user[0] && user[0].id == userID) { //case where the user_id in the URL belongs to the logged in user
          db.postTweet(userID, req.body.tweet)
            .then(result => res.send(result)); // return the tweet
        } else if (userID) { //case where the user is logged in but wants to access another user's route
          res.status(403).send([{err: 'user not auth'}]);
        } else { //case where the user is not logged in
          res.status(403).send([{err: 'user not login'}]);
        }
      });
  });

  //update that 1 tweet if owner
  router.put("/:user_name/tweets/:tweet_id", (req, res) => {
    if (!req.body.tweet) {
      res.status(403).send([{err: 'tweet can not be empty'}]);
      return;
    }
    db.checkOwnershipOfTweet(req.params.user_name.toLocaleLowerCase(), req.params.tweet_id)
      .then(user =>{
        const userID = req.session.user_ID;
        if (!user[0]) {
          res.status(403).send([{err: 'tweet or user does not exist'}]);
        } else if (user[0].user_id !== userID) {
          res.status(403).send([{err: 'user not is not owner'}]);
        } else {
          db.updateTweet(req.params.tweet_id, req.body.tweet)
            .then(r => res.send([{msg: `update tweet id : ${r.id}\nwith : ${r.content}`}]));
        }
      });
  });

  //delete that 1 tweet if owner
  router.delete("/:user_name/tweets/:tweet_id", (req, res) => {
    db.checkOwnershipOfTweet(req.params.user_name.toLocaleLowerCase(), req.params.tweet_id)
      .then(user =>{
        const userID = req.session.user_ID;
        if (!user[0]) {
          res.status(403).send([{err: 'tweet or user does not exist'}]);
        } else if (user[0].user_id !== userID) {
          res.status(403).send([{err: 'user not is not owner'}]);
        } else {
          db.deleteTweet(req.params.tweet_id)
            .then(r => res.send([{msg: `delete tweet id : ${r.id}`}]));
        }
      });
  });

  return router;
}