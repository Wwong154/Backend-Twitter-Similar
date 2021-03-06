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
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());
app.use(cookieSession({ name: 'session', keys: [process.env.SESSIONKEY, process.env.SESSIONKEY2] }));

const userRoutes = require("./routes/users");
const tweetRoutes = require("./routes/tweets");
const sessionRoutes = require("./routes/sessions");
const chatRoutes = require("./routes/chats");
app.use("/users", userRoutes());
app.use("/tweets", tweetRoutes());
app.use("/sessions", sessionRoutes());
app.use("/chats", chatRoutes());

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

server.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`);
});

module.exports = server;