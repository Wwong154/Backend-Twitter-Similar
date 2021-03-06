require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
const PORT = process.env.PORT || 3000;
const db = require('./db/helper')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieSession({ name: 'session', keys: process.env.SESSIONKEY }))

const clients = {}; //to hold active user

//sokcket event
io.sockets.on('connection', function (socket) {
  let userID;
  /* Getting cookie as userID in lieu of an emit event
  let cookieString = socket.request.headers.cookie;
  let req = {connection: {encrypted: false}, headers: {cookie: cookieString}}
  let res = {getHeader: () =>{}, setHeader: () => {}};
  cookieSession(req, res, () => {
    clients[req.session.user_ID]; //create socket with userID
  })
  */
  socket.on('connect test', function() { //exist only to test socket is working
    io.sockets.emit('connected', 'connection sucess')
  })

  socket.on('connection id',function(user){ //save id to active user object
    userID = user.id;
    clients[user.id] = socket;
  });

  socket.on('dm', function(msg){ //when user send an dm to an other user
    fromMsg = {to: msg.to, from:userID, txt:msg.txt}
    db.checkConversationExist(fromMsg) //check if conversation already exist
      .then((res) => {
        if(clients[msg.to]) { //if other user is online
          db.userHaveUnreadMsg(msg.to) //change user unread msg to true 
          .then(() => {
            clients[msg.to].emit('dm', fromMsg);
          })
        } else if (res){ //when other user is offline, return msg sent
          db.userHaveUnreadMsg(msg.to) //change user unread msg to true 
            .then(() => {
              clients[userID].emit('receiver offline', 'message sent')
            })
        } else { //for whatever reason, send error
          clients[userID].emit('error', 'message cannot be sent')
        }
      })
  });

  socket.on('disconnect', function(){
    delete clients[userID];
  });
});

/*
get all tweet page
load a certain amount of tweet at user come to the site
assume user can view login or not, so does not have auth.
*/
app.get('/', (req, res) => {
  res.redirect('/tweets')
})

app.get('/tweets', (req, res) => {
  db.getTweets()
    .then(result => {
      res.send(result)
    })
})

/*
get more tweet to landing page
client side should keep count of load call and sent to server as :count.
*/
app.post('/tweets/:count', (req, res) => {
  const callCount = Number(req.params.count);
  db.getTweets(2, callCount)
    .then(result => {
      if (result.length) { //if there is result send them
        res.send(result)
      } else { //when no result come back, return no more tweet
        res.status(403).send({msg: 'no more tweet'})
      }
    })
})

/*
register page post
assume front end will use ajax or something similar, so will not redirect
*/
app.post('/users', (req, res) => {
  if (!req.body.name || req.body.name.trim() == false || !req.body.password || !req.body.password_confirm) { //if either field is empty or if name only contain space
    res.status(403).send({err: 'please fill in all field'})
  } else if (req.body.password !== req.body.password_confirm) { //if passowrd not match
    res.status(403).send({err: 'password does not match'})
  } else if (req.body.password.length < 6) { //if password is too short
    res.status(403).send({err: 'password is too short'})
  } else {
    let userInfo = { //hash the password with semi random salt
      name: req.body.name.toLowerCase().trim(),
      password: bcrypt.hashSync(req.body.password, Math.floor(Math.random()*5) + 5)
    }
    db.checkUserExist(userInfo.name, true, userInfo)
      .then(result => {
        if(!result.length) { //if new user, helper return object which does not have length
          req.session.user_ID = result.id; //set up seesion
          res.send({msg: 'registered'}) //client side script should then connect to socket after this msg, might want to redirect depends on front end
        } else { //if user exist it return array, which have lenght
          res.status(403).send({err: 'user exist'})
        }
      })
  }
})

app.post("/users/:user_id/tweets", (req, res) => {
  const user_id = req.session.user_ID;
  if (req.params.user_id == user_id) { //case where the user_id in the URL belongs to the logged in user
    res.send()
  }
  else if (user_id) { //case where the user is logged in but wants to access another user's route
    res.send()
  }
  else { //case where the user is not logged in
    res.status(403).send({err: 'user not login'})
  }
});

/*
login page post
assume front end will use ajax or something similar, so will not redirect
*/
app.post('/session', (req, res) => {
  if (!req.body.name || req.body.name.trim() == false || !req.body.password) { //if either field is empty or name is empty after trim
    res.status(403).send({err: 'please fill in both field'})
  } else {
    db.checkUserExist(req.body.name.toLowerCase()) //name should be case insensitive
      .then(result => {
        if (!result.length) {
          res.status(403).send({err: 'invalid combination'}); //if user does not exist, shown invalid for security reason
        } else if (bcrypt.compareSync(req.body.password, result[0].password)) {
          req.session.user_ID = result.id; //set up session id
          res.send({msg: 'login'}) //client side script should then connect to socket after this msg, might want to redirect base on front end
        } else {
          res.status(403).send({err: 'invalid combination'})
        } //if password does not match record
      }) //to be expand with help function
  }
})

//tweet page
app.get('/tweets', (req, res) => {
  if (!req.body.name || req.body.name.trim() == false || !req.body.password) { //if either field is empty or name is empty after trim
    res.status(403).send({err: 'please fill in both field'})
  } else {
    db.checkUserExist(req.body.name.toLowerCase()) //name should be case insensitive
      .then(result => {
        if (!result.length) {
          res.status(403).send({err: 'invalid combination'}); //if user does not exist, shown invalid for security reason
        } else if (bcrypt.compareSync(req.body.password, result[0].password)) {
          req.session.user_ID = result.id; //set up session id
          res.send({msg: 'login'}) //client side script should then connect to socket after this msg, might want to redirect base on front end
        } else {
          res.status(403).send({err: 'invalid combination'})
        } //if password does not match record
      }) //to be expand with help function
  }
})

server.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`)
})

module.exports = server