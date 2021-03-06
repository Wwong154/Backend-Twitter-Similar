require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const PORT = process.env.PORT || 3000;
const db = require('./db/helper');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());
app.use(cookieSession({ name: 'session', keys: [process.env.SESSIONKEY, process.env.SESSIONKEY2] }));

const clients = {}; //to hold active user

//sokcket event
io.sockets.on('connection', function(socket) {
  let userID;

  socket.on('connect test', function() { //exist only to test socket is working
    io.sockets.emit('connected', 'connection sucess');
  });

  socket.on('connection id',function(user) { //need rewrite on a real webpage, as chai request does not seems to work with socket that well
    userID = user.id;
    clients[user.id] = socket;
  });

  socket.on('dm', function(msg) { //when user send an dm to an other user
    let fromMsg = {to: msg.to, from:userID, txt:msg.txt};
    db.checkConversationExist(fromMsg) //check if conversation already exist
      .then((res) => {
        if (clients[msg.to]) { //if other user is online
          db.userHaveUnreadMsg(msg.to) //change user unread msg to true
            .then(() => {
              clients[msg.to].emit('dm', fromMsg); //send msg to reciever
              clients[userID].emit('msg sent', fromMsg);// send msg back to sender to show
            });
        } else if (res) { //when other user is offline, return msg sent
          db.userHaveUnreadMsg(msg.to) //change user unread msg to true
            .then(() => {
              clients[userID].emit('msg sent', fromMsg);//send msg back to sender to show
            });
        } else { //for whatever reason, send error
          clients[userID].emit('error', 'message cannot be sent');
        }
      });
  });

  socket.on('disconnect', function() {
    delete clients[userID];
  });
});

/*
get all tweet page
load a certain amount of tweet at user come to the site
assume user can view login or not, so does not have auth.
*/
app.get('/', (req, res) => {
  res.redirect('/tweets');
});

app.get('/tweets', (req, res) => {
  db.getTweets()
    .then(result => {
      res.send(result);
    });
});

/*
get more tweet to landing page
client side should keep count of load call and sent to server as :count.
*/
app.post('/tweets/:count', (req, res) => {
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

app.get("/tweets/:tweet_id", (req, res) => {
  db.getTweetWithTweetID(req.params.tweet_id)
    .then( result => {
      if (result[0]) { 
        res.send(result)
      } else {
        res.status(403).send([{err: 'tweet does not exist'}])
      }
    })
});

/*
register page post
assume front end will use ajax or something similar, so will not redirect
*/
app.post('/users', (req, res) => {
  if (!req.body.name || req.body.name.trim() == false || !req.body.password || !req.body.password_confirm) { //if either field is empty or if name only contain space
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
app.get("/users/:user_name/tweets", (req, res) => {
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
app.post("/users/:user_name/tweets", (req, res) => {
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

app.put("/users/:user_name/tweets/:tweet_id", (req, res) => {
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
      } else { //case where the user is not logged in
        db.updateTweet(req.params.tweet_id, req.body.tweet)
          .then(r => res.send([{msg: `update tweet id : ${r.id}\nwith : ${r.content}`}]));
      }
    });
});

app.delete("/users/:user_name/tweets/:tweet_id", (req, res) => {
  db.checkOwnershipOfTweet(req.params.user_name.toLocaleLowerCase(), req.params.tweet_id)
    .then(user =>{
      const userID = req.session.user_ID;
      if (!user[0]) {
        res.status(403).send([{err: 'tweet or user does not exist'}]);
      } else if (user[0].user_id !== userID) {
        res.status(403).send([{err: 'user not is not owner'}]);
      } else { //case where the user is not logged in
        db.deleteTweet(req.params.tweet_id)
          .then(r => res.send([{msg: `delete tweet id : ${r.id}`}]));
      }
    });
});
/*
login page post
assume front end will use ajax or something similar, so will not redirect
*/
app.post('/session', (req, res) => {
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

app.delete('/session', (req, res) => {
  req.session.user_ID = null;
  res.redirect('/tweets');
});

app.get("/chat/:user_name", (req, res) => {
  const userID = req.session.user_ID;
  if (!userID) {
    res.status(403).send([{err: 'Please login'}]);
  } else {
    db.checkUserExist(req.params.user_name.toLocaleLowerCase(), undefined, undefined, true, userID)
      .then(result => {
        if (result[0].err === 'same user') {
          res.status(403).send(result)
        } else if(result.length){
          res.send(result)
        } else {
          res.send([{err: 'start of conversation'}])
        }
      })
  }
});

//msging is already handled by socket.io, so this will just check if user is login and give a boolean for socket to process
app.post("/chat/:user_name", (req, res) => {
  const userID = req.session.user_ID;
  if (!userID) {
    res.status(403).send([{err: 'Please login'}]);
  } else {
    res.send([{login:true}])
  }
});

server.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`);
});

module.exports = server;