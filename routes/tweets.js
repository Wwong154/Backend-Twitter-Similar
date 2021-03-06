const express = require('express');
const router = express.Router();
const db = require('../db/helper');

module.exports = () => {

  router.get('/', (req, res) => {
    db.getTweets()
      .then(result => {
        res.send(result);
      });
  });

  /*
  get more tweet to landing page
  client side should keep count of load call and sent to server as :count.
  */
  router.post('/:count', (req, res) => {
    const callCount = Number(req.params.count);
    db.getTweets(2, callCount)
      .then(result => {
        if (result.length) { //if there is result send them
          res.send(result);
        } else { //when no result come back, return no more tweet
          res.status(403).send({msg: 'no more tweet'});
        }
      });
  });

  router.get("/:tweet_id", (req, res) => {
    db.getTweetWithTweetID(req.params.tweet_id)
      .then(result => {
        if (result[0]) {
          res.send(result);
        } else {
          res.status(403).send([{err: 'tweet does not exist'}]);
        }
      });
  });

  return router;
}