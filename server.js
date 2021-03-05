require('dotenv').config();
const PORT = process.env.PORT || 3000;
const ENV = "development";
const db = require('./db/helper')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

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
  }
  else if (req.body.password !== req.body.password_confirm) {
    res.status(403).send({err: 'password does not match'})
  } else {
    res.send({msg: 'registered'}) //to be expand with help function
  }
})

/*
login page post
assume front end will use ajax or something similar, so will not redirect
*/
app.post('/session', (req, res) => {
  if (!req.body.name || !req.body.password) {
    res.status(403).send({err: 'please fill in both field'})
  }
  db.checkUserExist(req.body.name)
    .then(result => {
      if (!result.length) res.status(403).send({err: 'invalid combination'});
      if (bcrypt.compareSync(req.body.password, result[0].password)) {
        res.send({msg: 'login'})
      } else {
        res.status(403).send({err: 'invalid combination'})
      }
    }) //to be expand with help function
})

server.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`)
})

module.exports = server