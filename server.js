const PORT = 3000;
const ENV = "development";
const db = require('./db/helper')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const salt = bcrypt.genSaltSync(10);

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.get('/', (req, res) => {
  console.log('hi')
})

/*
since /register is not RESTFUL, /user will handle both register and log in.
use : 
curl -d "name=username&password=userpassword" http://localhost:3000/users to test log in
and use :
curl -d "name=username&password=userpassword&password_confirm=userpassword_confirm" http://localhost:3000/users to test register
*/
app.post('/users', (req, res) => {
  if (req.body.password_confirm) { //if this have password_confirm, then it is register. The front end should already required this to be filled
    console.log(req.body)
  } else { //else it is a login
    
  }
})

server.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`)
})