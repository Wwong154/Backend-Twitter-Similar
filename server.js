const ENV = "development";
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
const PORT = process.env.PORT || 3000;
const db = require('./db/helper')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieSession({ name: 'session', keys: process.env.SESSIONKEY }))

app.get('/', (req, res) => {
  res.send({msg: 'hi!'})
})

/*
register page post
assume front end will use ajax or something similar, so will not redirect
*/
app.post('/users', (req, res) => {
  if (!req.body.name || req.body.name.trim() == false || !req.body.password || !req.body.password_confirm) { //if either field is empty or if name only contain space
    res.status(403).send({err: 'please fill in all field'})
  } else if (req.body.password !== req.body.password_confirm) {
    res.status(403).send({err: 'password does not match'})
  } else if (req.body.password.length < 6) {
    res.status(403).send({err: 'password is too short'})
  } else {
    let userInfo = {
      name: req.body.name.toLowerCase().trim(),
      password: bcrypt.hashSync(req.body.password, Math.floor(Math.random()*5) + 5)
    }
    db.checkUserExist(userInfo.name, true, userInfo)
      .then(result => {
        if(!result.length) { //if new user, helper return object which does not have length
          req.session.user_ID = result.id;
          res.send({msg: 'registered'})
        } else { //if user exist it return array, which have lenght
          res.status(403).send({err: 'user exist'})
        }
      }) //to be expand with help function
  }
})

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
        if (!result.length) res.status(403).send({err: 'invalid combination'}); //if user does not exist, shown invalid for security reason
        if (bcrypt.compareSync(req.body.password, result[0].password)) {
          req.session.user_ID = result.id;
          res.send({msg: 'login'})
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